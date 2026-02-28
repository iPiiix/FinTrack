from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# IMPORTAMOS TUS DOS ROUTERS
from app.routers import auth, transacciones
import app.models  

from app.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinTrack API",
    description="Personal Finance Intelligence Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(transacciones.router, prefix="/transactions", tags=["Transactions"])

@app.get("/")
def root():
    return {
        "app": "FinTrack",
        "tagline": "Know your numbers. Own your future.",
        "version": "1.0.0",
        "status": "operational"
    }