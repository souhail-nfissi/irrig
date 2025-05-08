from sqlalchemy.orm import Session
from app.models.crop import Crop
from app.schemas.crop import CropCreate

def get_crops(db: Session):
    return db.query(Crop).all()

def create_crop(db: Session, crop: CropCreate):
    db_crop = Crop(
        name = crop.name,
        Kc = crop.Kc,
        CEemax = crop.CEemax,
        H = crop.H,
        f = crop.f,
    )

    db.add(db_crop)
    db.commit()
    db.refresh(db_crop)
    return db_crop

