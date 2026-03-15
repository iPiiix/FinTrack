from app.database import SessionLocal, engine, Base
from app.models.usuario import Usuario
from app.core.security import hashear_password
from datetime import date

# Ensure tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    user = Usuario(
        nombre="Debug",
        apellidos="User",
        email="debug@example.com",
        fecha_nacimiento=date(1990, 1, 1),
        contrasena=hashear_password("pass123"),
        email_verificado=True
    )
    db.add(user)
    db.commit()
    print("User created successfully")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
