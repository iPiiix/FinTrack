import os
from sqlalchemy import create_url, create_engine, inspect
from app.config import settings

def check_schema():
    print(f"Connecting to database...")
    engine = create_engine(settings.effective_database_url)
    inspector = inspect(engine)
    
    try:
        tables = inspector.get_table_names()
        print(f"Tables found: {tables}")
        
        if "usuarios" in tables:
            columns = [c["name"] for c in inspector.get_columns("usuarios")]
            print(f"Columns in 'usuarios': {columns}")
            if "ip_address" not in columns:
                print("--- [MISSING COLUMN] 'ip_address' is missing! ---")
            else:
                print("--- [OK] 'ip_address' is present. ---")
        else:
            print("--- [MISSING TABLE] 'usuarios' table not found! ---")
            
    except Exception as e:
        print(f"Error checking schema: {e}")

if __name__ == "__main__":
    check_schema()
