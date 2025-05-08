from app.models.crop import Crop

from app.db.session import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.crop import CropOut
from app.services.crop_service import get_crops, create_crop
from app.schemas.crop import CropCreate

router = APIRouter()

@router.get(
    "/",
    description="Returns a list of all crops.",
)
def list_crops(
        db: Session = Depends(get_db),
):
    crops = get_crops(db)
    return {
        crop.name: {
            "Kc": crop.Kc,
            "CEemax": crop.CEemax,
            "H": crop.H,
            "f": crop.f,
        } for crop in crops
    }

@router.post("/")
def create(crop: CropCreate, db: Session = Depends(get_db)):
    crop = create_crop(db, crop=crop)
    return {
        crop.name: {
            "Kc": crop.Kc,
            "CEemax": crop.CEemax,
            "H": crop.H,
            "f": crop.f,
        }
    }
