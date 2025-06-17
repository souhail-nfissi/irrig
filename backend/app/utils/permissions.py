from fastapi import HTTPException, status
from app.models.user import User

def ensure_admin_or_self(current_user: User, target_user_id: int):
    if current_user.role != "admin" and current_user.id != target_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You must be an admin or the user themselves to access this information."
        )

