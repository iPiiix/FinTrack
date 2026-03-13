from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin
from sqladmin.authentication import AuthenticationBackend
from starlette.middleware.base import BaseHTTPMiddleware
from app.routers import auth, transacciones, analytics, cuentas, categorias, portfolio, usuarios, ai, subscriptions
from app.admin import UsuarioAdmin, CuentaAdmin, TransaccionAdmin, CategoriaAdmin
from app.config import settings
import app.models
from sqlalchemy import text
import traceback

from app.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinTrack API",
    description="Personal Finance Intelligence Platform",
    version="1.0.7"
)

# Custom Nuclear CORS Middleware to ensure headers are ALWAYS present
class NuclearCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            response = Response()
        else:
            response = await call_next(request)
        
        origin = request.headers.get("origin")
        if origin:
            response.headers["Access-Control-Allow-Origin"] = origin
        else:
            response.headers["Access-Control-Allow-Origin"] = "*"
            
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

app.add_middleware(NuclearCORSMiddleware)

from app.database import SessionLocal
from app.models.categoria import Categoria

@app.on_event("startup")
def startup_tasks():
    db = SessionLocal()
    try:
        # 1. Force add ip_address column if missing
        try:
             # Use a safer check for PostgreSQL
            db.execute(text("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ip_address VARCHAR(100)"))
            db.commit()
            print("Successfully ensured ip_address column")
        except Exception as e:
            db.rollback()
            print(f"Schema update notice (expected if already exists): {e}")
            
        # 2. Seed default categories
        default_categories = [
            {"nombre": "Nómina / Salario", "descripcion": "Ingresos regulares del trabajo"},
            {"nombre": "Vivienda", "descripcion": "Alquiler, hipoteca, comunidad"},
            {"nombre": "Alimentación", "descripcion": "Supermerkado y comida"},
            {"nombre": "Transporte", "descripcion": "Gasolina, transporte público"},
            {"nombre": "Ocio y Restaurantes", "descripcion": "Salidas, cine, restaurantes"}
        ]
        
        existing = {c.nombre for c in db.query(Categoria).all()}
        new_cats = [Categoria(**c) for c in default_categories if c["nombre"] not in existing]
        
        if new_cats:
            db.add_all(new_cats)
            db.commit()
    except Exception as e:
        print(f"Error in startup tasks: {e}")
    finally:
        db.close()


# Diagnostic Endpoint
@app.get("/debug/db")
def debug_db():
    db = SessionLocal()
    try:
        res = db.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios'"))
        columns = [row[0] for row in res]
        return {"table": "usuarios", "columns": columns}
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(cuentas.router, prefix="/cuentas", tags=["Cuentas"])
app.include_router(categorias.router, prefix="/categorias", tags=["Categorias"])
app.include_router(transacciones.router, prefix="/transactions", tags=["Transactions"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio"])
app.include_router(usuarios.router, prefix="/usuarios", tags=["Usuarios"])
app.include_router(ai.router, prefix="/analytics/ai", tags=["AI Insights"])
app.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])

@app.get("/")
def root():
    return {
        "app": "FinTrack",
        "tagline": "Know your numbers. Own your future.",
        "version": "1.0.8",
        "status": "operational"
    }

# General Error Handler to prevent 500s from hiding CORS headers
@app.exception_handler(Exception)
async def universal_exception_handler(request: Request, exc: Exception):
    error_data = {
        "active_debug_error": str(exc),
        "traceback": traceback.format_exc(),
        "path": request.url.path,
        "method": request.method
    }
    import json
    return Response(
        content=json.dumps(error_data),
        media_type="application/json",
        status_code=500,
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Credentials": "true"
        }
    )