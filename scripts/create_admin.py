import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.user import User
from app.utils.hashing import hash_password
from sqlalchemy.orm import Session

def create_admin():
    db: Session = SessionLocal()

    email = "admin@gmail.com"
    password = "admin"

    existing_admin = db.query(User).filter(User.email == email).first()
    if existing_admin:
        print("Admin user already exists.")
        return

    admin_user = User(
        id=0,
        email=email,
        hashed_password=hash_password(password),
        role="admin"
    )

    db.add(admin_user)
    db.commit()
    db.close()

    print("Admin user created successfully.")

if __name__ == "__main__":
    create_admin()

