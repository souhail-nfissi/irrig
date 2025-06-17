from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.crop import Crop

from app.db.session import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.crop_service import (
    get_user_crop_by_name,
    get_user_crops,
    create_user_crop,
    reset_user_crops,
    update_user_crop,
    delete_user_crop,
)
from app.schemas.crop import CropCreate, CropUpdate

router = APIRouter()

@router.get(
    "/",
    description="Returns a list of crops for the current user.",
)
def list_crops(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id: int = current_user.id

    crops = get_user_crops(db=db, user_id=user_id)
    if not crops:
        reset_user_crops(db=db, user_id=current_user.id)
        crops = db.query(Crop).filter(Crop.user_id == user_id).all()

    return {
        crop.name: {
            "Kc": crop.Kc,
            "CEemax": crop.CEemax,
            "H": crop.H,
            "f": crop.f,
        } for crop in crops
    }

@router.get(
    "/{crop_name}",
    description="Get a single crop by name for the current user.",
)
def get_crop(
    crop_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    crop = get_user_crop_by_name(
        crop_name=crop_name,
        db=db,
        user_id=current_user.id
    )
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return {
        "name": crop.name,
        "Kc": crop.Kc,
        "CEemax": crop.CEemax,
        "H": crop.H,
        "f": crop.f,
    }

@router.post("/")
def create(
    crop: CropCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    crop = create_user_crop(db=db, crop=crop, user_id=current_user.id)
    return {
        crop.name: {
            "Kc": crop.Kc,
            "CEemax": crop.CEemax,
            "H": crop.H,
            "f": crop.f,
        }
    }


@router.put(
    "/{crop_name}",
    description="Update a crop by name for the current user.",
)
def update_crop(
    crop_name: str,
    crop_update: CropUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    crop = update_user_crop(
        db=db,
        crop_name=crop_name,
        crop_update=crop_update,
        user_id=current_user.id,
    )

    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    return {
        "name": crop.name,
        "Kc": crop.Kc,
        "CEemax": crop.CEemax,
        "H": crop.H,
        "f": crop.f,
    }


@router.delete(
    "/{crop_name}",
    description="Delete a crop by name for the current user.",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_crop(
    crop_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    crop = get_user_crop_by_name(db=db, crop_name=crop_name, user_id=current_user.id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    delete_user_crop(db=db, crop=crop)


@router.post(
    "/reset",
    description="Reset crops to default for the current user.",
)
def reset_crops(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reset_user_crops(db=db, user_id=current_user.id)
    return {"message": "Crops reset to default."}
