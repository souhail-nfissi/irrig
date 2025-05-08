import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.crop import Crop
from sqlalchemy.orm import Session

def seed_crops():
    db: Session = SessionLocal()

    crop_data = [
        {"name": "tomate", "Kc": 1.15, "CEemax": 12.51, "H": 110, "f": 0.4},
        {"name": "aubergine", "Kc": 1.05, "CEemax": 11.0, "H": 95, "f": 0.45},
        {"name": "oignons", "Kc": 1.0, "CEemax": 7.45, "H": 50, "f": 0.3},
        {"name": "pasteque", "Kc": 1.0, "CEemax": 12.0, "H": 115, "f": 0.4},
        {"name": "arachide", "Kc": 1.1, "CEemax": 6.65, "H": 80, "f": 0.5},
        {"name": "chou", "Kc": 1.05, "CEemax": 11.4, "H": 55, "f": 0.45},
        {"name": "carotte", "Kc": 1.05, "CEemax": 8.14, "H": 80, "f": 0.35},
        {"name": "navais", "Kc": 1.1, "CEemax": 12.01, "H": 75, "f": 0.5},
        {"name": "gombo", "Kc": 1.05, "CEemax": 9.29, "H": 80, "f": 0.4},
        {"name": "niebe", "Kc": 1.05, "CEemax": 13.23, "H": 80, "f": 0.45},
    ]

    for crop in crop_data:
        exists = db.query(Crop).filter(Crop.name == crop["name"]).first()
        if not exists:
            db.add(Crop(**crop))

    db.commit()
    db.close()
    print("Crop data seeded successfully.")

if __name__ == "__main__":
    seed_crops()

