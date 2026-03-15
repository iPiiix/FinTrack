from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin
from sqladmin.authentication import AuthenticationBackend
from starlette.middleware.sessions import SessionMiddleware
from app.routers import auth, transacciones, analytics, cuentas, categorias, portfolio, usuarios, ai, subscriptions
from app.admin import UsuarioAdmin, CuentaAdmin, TransaccionAdmin, CategoriaAdmin
from app.config import settings
import app.models
from sqlalchemy import text

from app.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinTrack API",
    description="Personal Finance Intelligence Platform",
    version="1.1.0"
)

# Standard CORSMiddleware for Production
# Note: allow_origins must be explicit when allow_credentials=True
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://fin-track-tan-alpha.vercel.app",
        "https://fin-track-ipiiixs-projects.vercel.app",
        # Allow Vercel preview deployments if needed, but they must be listed explicitly 
        # or handled dynamically if the list grows too large.
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie"], # Explicitly expose Set-Cookie if needed by certain proxies
)

# Mandatory SessionMiddleware for sqladmin authentication
app.add_middleware(
    SessionMiddleware, 
    secret_key=settings.admin_panel_secret or "temporary-secret-key-for-admin"
)

from app.database import SessionLocal
from app.models.categoria import Categoria

@app.on_event("startup")
def startup_tasks():
    db = SessionLocal()
    try:
        # 1. Ensure Schema (Add missing columns that create_all misses)
        try:
            db.execute(text("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ip_address VARCHAR(100)"))
            db.commit()
        except Exception:
            db.rollback() 
            
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


app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(cuentas.router, prefix="/cuentas", tags=["Cuentas"])
app.include_router(categorias.router, prefix="/categorias", tags=["Categorias"])
app.include_router(transacciones.router, prefix="/transactions", tags=["Transactions"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio"])
app.include_router(usuarios.router, prefix="/usuarios", tags=["Usuarios"])
app.include_router(ai.router, prefix="/analytics/ai", tags=["AI Insights"])
app.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])

# ─── SQLAdmin Panel ────────────────────────────────────────────────────────────
class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
        if username == settings.admin_panel_user and password == settings.admin_panel_password:
            request.session.update({"authenticated": True})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return request.session.get("authenticated", False)


admin = Admin(
    app, engine,
    authentication_backend=AdminAuth(secret_key=settings.admin_panel_secret),
    title="FinTrack Admin",
)
admin.add_view(UsuarioAdmin)
admin.add_view(CuentaAdmin)
admin.add_view(TransaccionAdmin)
admin.add_view(CategoriaAdmin)

@app.get("/")
def root():
    return {
        "app": "FinTrack",
        "tagline": "Know your numbers. Own your future.",
        "version": "1.1.0",
        "status": "operational"
    }