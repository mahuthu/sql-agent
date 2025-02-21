from app.database import engine, Base
from app.models.user import User
from app.models.template import Template
from app.models.query_history import Query
from app.core.security import get_password_hash

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Here you can add initial data if needed
    # For example, creating an admin user:
    """
    from sqlalchemy.orm import Session
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            admin = User(
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("Admin user created")
    finally:
        db.close()
    """

if __name__ == "__main__":
    print("Creating database tables...")
    init_db()
    print("Database initialization completed!") 