from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.crop import Crop
from enum import Enum

class Texture(str, Enum):
    HEAVY = "HEAVY"
    COARSE = "COARSE"
    MEDIUM = "MEDIUM"
    FINE = "FINE"

class Climate(str, Enum):
    ARID = "ARID"
    HUMID = "HUMID"

# Rt (relation de transpiration) : Ce coefficient prend en compte les pertes
# par ruissellement et par percolation profonde. Dans les systèmes
# goutte-à-goutte, en absence de ruissellement, la relation de transpiration
# peut s’estimer à partir de la relation de percolation selon les valeurs du
# cadre suivant:
def calculate_Rt(crop: Crop, climate: Climate, texture: Texture) -> float:
    """Calcuate Transpiration Ratio (Rt) for agricultural use
        Returns:
            Rt (float): (relation de transpiration)
    """
    if crop.H < 75:
        return {
            Climate.ARID: {
                Texture.HEAVY: 0.85,
                Texture.COARSE: 0.90,
                Texture.MEDIUM: 0.95,
                Texture.FINE: 0.95,
            },
            Climate.HUMID: {
                Texture.HEAVY: 0.65,
                Texture.COARSE: 0.75,
                Texture.MEDIUM: 0.85,
                Texture.FINE: 0.90,
            },
        }[climate][texture]
    elif crop.H <= 150:
        return {
            Climate.ARID: {
                Texture.HEAVY: 0.90,
                Texture.COARSE: 0.90,
                Texture.MEDIUM: 0.95,
                Texture.FINE: 0.95,
            },
            Climate.HUMID: {
                Texture.HEAVY: 0.75,
                Texture.COARSE: 0.80,
                Texture.MEDIUM: 0.90,
                Texture.FINE: 0.95,
            },
        }[climate][texture]
    else:
        return {
            Climate.ARID: {
                Texture.HEAVY: 0.95,
                Texture.COARSE: 0.95,
                Texture.MEDIUM: 1,
                Texture.FINE: 1,
            },
            Climate.HUMID: {
                Texture.HEAVY: 0.85,
                Texture.COARSE: 0.90,
                Texture.MEDIUM: 0.95,
                Texture.FINE: 1,
            },
        }[climate][texture]

def calculate_Dn(db: Session, crop_name: str, Cc: float, Pm: float) -> float:
    """Calculate Net Irrigation Requirement (Dn) XYZ
        Args:
            H (float):  Profondeur des racines [cm]
            Cc (float): Capacité au champ [mm/cm]
            Pm (float): Point de flétrissement [mm/cm]
            f (float):  Disponibilité de l’eau dans le sol [-]
        Returns:
            Dn (float): Dose nette d’arrosage [mm]
    """
    crop = db.query(Crop).filter(Crop.name == crop_name).first()
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop '{crop_name}' not found.")

    return crop.H * (Cc - Pm) * crop.f

def calculate_RL(crop: Crop, CEa: float) -> float:
    """Calculate The Leaching Requirement (LR) XYZ
        Args:
            CEa (float): est la conductivité électrique de l’eau d’arrosage en [dS/m].
            CEemax (float): est la conductivité électrique du sol à partir de
                            laquelle la diminution de la production de la
                            plante est de 100% en [dS/m]. Des valeurs pour
                            différentes plantes peuvent être obtenues à partir
                            du document « Estudio FAO riego y drenaje nº 56. »
                            ou sa version en anglais (référence bibliographique
                            [5]).
        Returns:
            RL (float): La relation de lavage

    """
    return CEa / (2 * crop.CEemax)

def calculate_FL(EL: float, RL: float) -> float:
    """Calculate Leaching Fraction
        Args:
            EL (float): L’efficacité de lavage
            RL (float) : La relation de lavage
        Returns:
            FL (float): Facteur de lavage
    """
    return 1 - (RL / EL)

def calculate_Ea(
        db: Session,
        crop_name: str,
        CEa: float,
        EL: float,
        climate: Climate,
        texture: Texture,
        CU: float,
        Fr: float = 1
) -> tuple[float, ...]:
    crop = db.query(Crop).filter(Crop.name == crop_name).first()
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop '{crop_name}' not found.")

    RL = calculate_RL(crop=crop, CEa=CEa)
    FL = calculate_FL(EL=EL, RL=RL)
    Rt = calculate_Rt(crop=crop, climate=climate, texture=texture)
    Ea = Rt * CU * Fr * FL

    return Ea , Rt, RL, FL

def calculate_ETc(crop: Crop, ET0: float) -> float:
    """ Calculate Evapotranspiration XYZ
        Args:
            db (Session): SQLAlchemy database session.
            crop_name (str): The name of the crop.
            ET0 (float): Évapotranspiration de référence [mm/mois] ou [mm/jour]
            Kc (float):   Coefficient de culture [-]
        Returns:
            ETc (float): Évapotranspiration

        Raises:
            HTTPException: If the crop does not exist in the database.
    """
    return crop.Kc * ET0

def calculate_Pe(P: float) -> float:
    """ Calcualte Monthly Recorded Precipitation
        Args:
            P (float): Précipitations mensuelles enregistrées
        Returns:
            Pe (float): précipitations efficace
    """
    return 0.8 * P - 25 if P > 75 else 0.6 * P - 10

def calculate_NRn(db: Session, crop_name: str, ET0: float, P: float) -> tuple[float, float, float]:
    """Calculate  Calculate Net Water Requirements XYZ
        Args:
            ETc (float): Evapotranspiration de la culture [mm/mois] ou [mm/jour]
            Pe (float): Précipitations efficaces [mm/mois] ou [mm/jour]

        Returns:
            NRn (float) : Besoins hydriques nets  [mm/mois] ou [mm/jour]
    """
    crop = db.query(Crop).filter(Crop.name == crop_name).first()
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop '{crop_name}' not found.")

    ETc = calculate_ETc(crop=crop, ET0=ET0)
    Pe = calculate_Pe(P)

    NRn = ETc - Pe

    return NRn, Pe, ETc

def calculate_NRt(NRn: float, Ea: float) -> float:
    """Calculate  Calculate Total Water Requirements

        Args:
            NRn (float) : Besoins hydriques nets  [mm/mois] ou [mm/jour]
            Ea (float): Efficacité d'arrosage
        Returns:
            NRt (float) : Besoins hydriques total  [mm/mois] ou [mm/jour]

    """
    return NRn / Ea
