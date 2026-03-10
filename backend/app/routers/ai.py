from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.routers.deps import get_current_user
from app.models.usuario import Usuario
from app.models.transaccion import Transaccion
from app.models.cuenta import Cuenta
from app.models.categoria import Categoria
from datetime import datetime, timedelta
from sqlalchemy import func
import google.generativeai as genai
import json
from app.config import settings

router = APIRouter()

# The config is now evaluated inside the request to ensure any hot-reload 
# successfully applies the key without needing a full server cold-restart.

@router.get("/insights")
def get_ai_insights(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Fetch user transactions
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    # Recent Income
    income_last_30d = db.query(func.coalesce(func.sum(Transaccion.cantidad), 0)).join(Cuenta).filter(
        Cuenta.id_usuario == current_user.id_usuario,
        Transaccion.tipo == "ingreso",
        Transaccion.fecha >= thirty_days_ago
    ).scalar()

    # Recent Expenses
    expenses_last_30d = db.query(func.coalesce(func.sum(Transaccion.cantidad), 0)).join(Cuenta).filter(
        Cuenta.id_usuario == current_user.id_usuario,
        Transaccion.tipo == "gasto",
        Transaccion.fecha >= thirty_days_ago
    ).scalar()
    
    # Calculate current Total net worth
    cuentas = db.query(Cuenta).filter(Cuenta.id_usuario == current_user.id_usuario).all()
    current_net_worth = sum([c.balance for c in cuentas])
    
    # Calculate savings rate
    savings_rate = 0
    if float(income_last_30d) > 0:
        savings_rate = ((float(income_last_30d) - float(expenses_last_30d)) / float(income_last_30d)) * 100

    projected_change = float(income_last_30d) - float(expenses_last_30d)
    projected_net_worth_heuristic = float(current_net_worth) + projected_change
    
    # Expense by category with Join
    top_categories = db.query(
        Transaccion.id_categoria,
        Categoria.nombre.label('cat_nombre'),
        func.sum(Transaccion.cantidad).label('total')
    ).join(Cuenta, Transaccion.id_cuenta == Cuenta.id_cuenta).join(Categoria, Transaccion.id_categoria == Categoria.id_categoria).filter(
        Cuenta.id_usuario == current_user.id_usuario,
        Transaccion.tipo == "gasto",
        Transaccion.fecha >= thirty_days_ago,
        Transaccion.id_categoria.isnot(None)
    ).group_by(Transaccion.id_categoria, Categoria.nombre).order_by(func.sum(Transaccion.cantidad).desc()).limit(5).all()

    # Base structure (fallback heuristics)
    response_data = {
        "current_net_worth": float(current_net_worth),
        "projected_net_worth": float(projected_net_worth_heuristic),
        "projected_change": projected_change,
        "savings_rate": savings_rate,
        "recommendations": [],
        "anomalies": []
    }

    if not getattr(settings, "gemini_api_key", ""):
        return handle_heuristic_fallback(savings_rate, expenses_last_30d, income_last_30d, top_categories, response_data)

    # Use Gemini
    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        
        # Prepare data context for prompt
        categories_context = ", ".join([f"Categoría '{c.cat_nombre}' (ID {c.id_categoria}): {float(c.total)} EU" for c in top_categories])
        
        prompt = f"""
        Actúa como un asesor financiero estricto y analítico de alto nivel ("AI ADVISOR" de FinTrack).
        Analiza los siguientes datos financieros de los últimos 30 días del usuario:
        - Patrimonio Neto Actual: {current_net_worth}
        - Ingresos totales 30d: {income_last_30d}
        - Gastos totales 30d: {expenses_last_30d}
        - Tasa de ahorro actual: {savings_rate:.2f}%
        - Gastos en Top Categorías 30d: {categories_context}
        
        Devuelve estrictamente un JSON válido con la siguiente estructura y formato. Asegúrate de escapar comillas si es necesario. No añadas Markdown.
        {{
            "recommendations": [
                {{"type": "positive" | "neutral" | "warning" | "negative", "title": "Título corto", "message": "Consejo directo y profesional de 1 o 2 líneas. Si hay ahorros, di algo motivador pero serio. Si el gasto es alto (ej: más del 50% en gastos), da una advertencia estricta."}}
            ],
            "anomalies": [
                {{"categoria_id": numero, "amount": numero, "message": "Descripción corta de por qué este gasto es inusualmente alto o digno de mención (solo devuelve anomalías si el gasto total de una categoría es mayor al 20% de los ingresos totales o muy sospechoso)"}}
            ]
        }}
        Solo incluye un máximo de 3 recomendaciones y 2 anomalías. Si no hay anomalías, devuelve la lista vacía.
        """
        
        response = model.generate_content(prompt)
        ai_result = json.loads(response.text)
        
        # Merge AI answers into response
        response_data["recommendations"] = ai_result.get("recommendations", [])
        response_data["anomalies"] = ai_result.get("anomalies", [])
        
        return response_data
        
    except Exception as e:
        print(f"Gemini AI Error: {e}")
        # Fallback to heuristics if API fails
        return handle_heuristic_fallback(savings_rate, expenses_last_30d, income_last_30d, top_categories, response_data)

def handle_heuristic_fallback(savings_rate, expenses, income, top_categories, response_data):
    # This acts as both the logic if no key is provided, or if the API call crashes
    recommendations = []
    
    if savings_rate > 20:
        recommendations.append({
            "type": "positive",
            "title": "Excelente Tasa de Ahorro",
            "message": f"Estás ahorrando un {savings_rate:.1f}% de tus ingresos mensuales. ¡Gran trabajo estructurando tus finanzas!"
        })
    elif savings_rate > 0:
        recommendations.append({
            "type": "neutral",
            "title": "Ahorro Positivo pero Mejorable",
            "message": f"Tienes un flujo de caja positivo, pero una tasa de ahorro del {savings_rate:.1f}%. Intenta reducir gastos discrecionales."
        })
    else:
        recommendations.append({
            "type": "negative",
            "title": "Configuración de IA Necesaria | Flujo de Caja Negativo",
            "message": "Añade tu GEMINI_API_KEY para recibir consejos avanzados. Estás gastando más de lo que ingresas."
        })
        
    if float(expenses) > (float(income) * 0.5) and float(income) > 0:
        recommendations.append({
            "type": "warning",
            "title": "Gasto Elevado Detectado",
            "message": "Tus gastos mensuales representan más del 50% de tus ingresos. Mantén un ojo en las salidas de capital."
        })
        
    anomalies = []
    for row in top_categories:
        cat_id = row.id_categoria
        total = row.total
        if float(total) > float(income) * 0.2:
            anomalies.append({
                "categoria_id": cat_id,
                "amount": float(total),
                "message": f"Gasto excepcionalmente alto en {row.cat_nombre}."
            })

    response_data["recommendations"] = recommendations
    response_data["anomalies"] = anomalies

    return response_data
