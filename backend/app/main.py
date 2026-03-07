from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from app.routers import auth, transacciones, analytics, cuentas, categorias
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

# Dynamic CORS: allow localhost for dev + FRONTEND_URL for production (Vercel)
_origins = ["http://localhost:3000", "http://localhost:3001"]
if settings.frontend_url and settings.frontend_url not in _origins:
    _origins.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(cuentas.router, prefix="/cuentas", tags=["Cuentas"])
app.include_router(categorias.router, prefix="/categorias", tags=["Categorias"])
app.include_router(transacciones.router, prefix="/transactions", tags=["Transactions"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])


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
        "version": "1.0.0",
        "status": "operational"
    }