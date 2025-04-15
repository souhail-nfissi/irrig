from fastapi import APIRouter
from app.api.v1.endpoints import user, auth, climate

api_router = APIRouter()
api_router.include_router(user.router, prefix="/users", tags=["Users"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(climate.router, prefix="/climate", tags=["Climate"])
