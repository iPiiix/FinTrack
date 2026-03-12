from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from app.routers import auth, transacciones, analytics, cuentas, categorias, portfolio, usuarios, ai, subscriptions
from app.admin import UsuarioAdmin, CuentaAdmin, TransaccionAdmin, CategoriaAdmin
from app.config import settings
import app.models

from app.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinTrack API",
    description="Personal Finance Intelligence Platform",
    version="1.0.0"
)

from app.database import SessionLocal
from app.models.categoria import Categoria

@app.on_event("startup")
def seed_default_categories():
    db = SessionLocal()
    try:
        default_categories = [
            {"nombre": "Nómina / Salario", "descripcion": "Ingresos regulares del trabajo"},
            {"nombre": "Vivienda", "descripcion": "Alquiler, hipoteca, comunidad"},
            {"nombre": "Alimentación", "descripcion": "Supermercado y comida"},
            {"nombre": "Transporte", "descripcion": "Gasolina, transporte público"},
            {"nombre": "Ocio y Restaurantes", "descripcion": "Salidas, cine, restaurantes"},
            {"nombre": "Salud", "descripcion": "Farmacia, médicos, seguro de salud"},
            {"nombre": "Suscripciones", "descripcion": "Netflix, Spotify, gimnasio"},
            {"nombre": "Inversiones", "descripcion": "Aportaciones a bolsa, cripto, depósitos"},
            {"nombre": "Gastos Varios", "descripcion": "Otros gastos menores"}
        ]
        
        # Insert only those that do not exist by name
        existing = {c.nombre for c in db.query(Categoria).all()}
        new_cats = [Categoria(**c) for c in default_categories if c["nombre"] not in existing and "Nómina" not in c["nombre"]]
        
        # Ensure we also add Nómina if missing, considering the exact name might lightly vary for the user's manual entry
        if not any("Nómina" in e or "Nomina" in e for e in existing):
             new_cats.append(Categoria(nombre="Nómina / Salario", descripcion="Ingresos regulares del trabajo"))

        if new_cats:
            db.add_all(new_cats)
            db.commit()
    except Exception as e:
        print(f"Error seeding categories: {e}")
    finally:
        db.close()


# Dynamic CORS: allow localhost for dev + FRONTEND_URL/Vercel for production
_origins = [
    "http://localhost:3000", 
    "http://localhost:3001",
]
if settings.frontend_url and settings.frontend_url not in _origins:
    _origins.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r"https://fin-track-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# ... (rest of routers)
# (Updating root for version check)
@app.get("/")
def root():
    return {
        "app": "FinTrack",
        "tagline": "Know your numbers. Own your future.",
        "version": "1.0.2",
        "status": "operational"
    }