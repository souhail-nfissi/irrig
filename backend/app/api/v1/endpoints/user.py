from app.db.session import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models.user import User
from app.schemas.user import UserCreate, UserOut
from app.services.user_service import create_user, get_user_by_id, get_users, delete_user
from app.utils.permissions import ensure_admin_or_self
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

router = APIRouter()

@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/", response_model=UserOut)
def create(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)


@router.get(
    "/",
    response_model=List[UserOut],
    dependencies=[Depends(require_roles("admin"))],
    description="Returns a list of all registered users. Only accessible to admin users."
)
def list_users(db: Session = Depends(get_db)):
    return get_users(db)

@router.get("/{user_id}", response_model=UserOut)
def read_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_roles("admin", "user"))
):
    ensure_admin_or_self(current_user, user_id)

    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_account(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_roles("admin", "user"))
):
    ensure_admin_or_self(current_user, user_id)

    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    delete_user(db, user)
