from sqlalchemy.orm import Session
from app.models.crop import Crop
from app.schemas.crop import CropCreate, CropUpdate


default_crops = [
    CropCreate(name="tomate", Kc=1.15, CEemax=12.51, H=110, f=0.4),
    CropCreate(name="aubergine", Kc=1.05, CEemax=11.0, H=95, f=0.45),
    CropCreate(name="oignons", Kc=1.0, CEemax=7.45, H=50, f=0.3),
    CropCreate(name="pasteque", Kc=1.0, CEemax=12.0, H=115, f=0.4),
    CropCreate(name="arachide", Kc=1.1, CEemax=6.65, H=80, f=0.5),
    CropCreate(name="chou", Kc=1.05, CEemax=11.4, H=55, f=0.45),
    CropCreate(name="carotte", Kc=1.05, CEemax=8.14, H=80, f=0.35),
    CropCreate(name="navais", Kc=1.1, CEemax=12.01, H=75, f=0.5),
    CropCreate(name="gombo", Kc=1.05, CEemax=9.29, H=80, f=0.4),
    CropCreate(name="niebe", Kc=1.05, CEemax=13.23, H=80, f=0.45),
]

def get_user_crops(db: Session, user_id: int):
    crops = db.query(Crop).filter(Crop.user_id == user_id).all()
    return crops

def get_user_crop_by_name(crop_name: str, db: Session, user_id: int):
    return db.query(Crop).filter(
        Crop.user_id == user_id,
        Crop.name == crop_name
    ).first()

def create_user_crop(db: Session, crop: CropCreate, user_id: int):
    db_crop = Crop(
        name = crop.name,
        user_id = user_id,

        Kc = crop.Kc,
        CEemax = crop.CEemax,
        H = crop.H,
        f = crop.f,
    )

    db.add(db_crop)
    db.commit()
    db.refresh(db_crop)
    return db_crop

def update_user_crop(
        db: Session,
        crop_name: str,
        crop_update: CropUpdate,
        user_id: int
):
    crop = db.query(Crop).filter(
        Crop.user_id == user_id,
        Crop.name == crop_name
    ).first()

    if not crop:
        return None

    for key, value in crop_update.dict(exclude_unset=True).items():
        setattr(crop, key, value)

    db.commit()
    db.refresh(crop)

    return crop


def create_user_crops(db: Session, crops: list[CropCreate], user_id: int):
    for crop in crops:
        db_crop = Crop(
            user_id=user_id,
            name=crop.name,
            Kc=crop.Kc,
            CEemax=crop.CEemax,
            H=crop.H,
            f=crop.f,
        )
        db.add(db_crop)
    db.commit()

def delete_user_crop(db: Session, crop: Crop):
    db.delete(crop)
    db.commit()


def delete_user_crop_by_name(db: Session, crop_name: str, user_id: int):
    crop = db.query(Crop).filter(
        Crop.user_id == user_id,
        Crop.name == crop_name
    ).first()

    if crop:
        delete_user_crop(db=db, crop=crop)


def reset_user_crops(db: Session, user_id: int):
    db.query(Crop).filter(Crop.user_id == user_id).delete()
    create_user_crops(db=db, crops=default_crops, user_id=user_id)
