import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.usuario import Usuario
from app.routers.ai import get_ai_insights

db = SessionLocal()
try:
    # Get the user we created "testuser123@example.com"
    user = db.query(Usuario).filter(Usuario.email == "testuser123@example.com").first()
    if not user:
        print("User not found!")
    else:
        print(f"Testing for user {user.id_usuario}")
        res = get_ai_insights(db=db, current_user=user)
        print("Success:", res)
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
