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
    """Calculate the Transpiration Ratio (Rt) for irrigation.

    This function estimates the transpiration ratio (Rt), which is affected by water loss due to 
    runoff and deep percolation. In drip irrigation systems, Rt is based mainly on percolation.

    Parameters:
        crop (Crop): The crop, with its Kc, CEemax, height (H), and f values.
        climate (Climate): The climate, either ARID or HUMID.
        texture (Texture): The soil texture, which can be HEAVY, COARSE, MEDIUM, or FINE.

    Returns:
        float: The transpiration ratio (Rt), which helps estimate water needs for the crop.
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
    """Calculer la Dose nette d’arrosage (Dn).

    Cette fonction estime la dose nette d’arrosage (Dn) en fonction des paramètres du sol et de la culture.

    Args:
        db (Session): La session de base de données pour interroger les données de la culture.
        crop_name (str): Le nom de la culture pour récupérer les données correspondantes.
        Cc (float): Capacité au champ (mm/cm) du sol.
        Pm (float): Point de flétrissement (mm/cm) du sol.

    Returns:
        float: La dose nette d’arrosage (Dn) en millimètres.
    """

    crop = db.query(Crop).filter(Crop.name == crop_name).first()
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop '{crop_name}' not found.")

    return crop.H * (Cc - Pm) * crop.f

def calculate_RL(crop: Crop, CEa: float) -> float:
    """Calculer la Relation de Lavage (RL).

    Cette fonction estime la relation de lavage (RL) en fonction de la conductivité électrique 
    de l’eau d’arrosage et des caractéristiques de la culture.

    Args:
        crop (Crop): The crop, with its Kc, CEemax, height (H), and f values.
        CEa (float): Conductivité électrique de l'eau d’arrosage en [dS/m].

    Returns:
        float: La relation de lavage (RL)
    """
    return CEa / (2 * crop.CEemax)

def calculate_FL(EL: float, RL: float) -> float:
    """Calculate Leaching Fraction
    Args:
        EL (float): L’efficacité de lavage
        RL (float) : La relation de lavage
    Returns:
        float: Facteur de lavage (FL)
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
    """Calculate Evapotranspiration XYZ
    Args:
        crop (Crop): The crop, with its Kc, CEemax, height (H), and f values.
        ET0 (float): Évapotranspiration de référence [mm/mois] ou [mm/jour]
    Returns:
        float: Évapotranspiration (ETc)

    Raises:
        HTTPException: If the crop does not exist in the database.
    """
    return crop.Kc * ET0

def calculate_Pe(P: float) -> float:
    """ Calcualte Monthly Recorded Precipitation
    Args:
        P (float): Précipitations mensuelles enregistrées
    Returns:
        float: précipitations efficace (Pe)
    """
    return 0.8 * P - 25 if P > 75 else 0.6 * P - 10

def calculate_NRn(db: Session, crop_name: str, ET0: float, P: float) -> tuple[float, float, float]:
    """Calculate  Calculate Net Water Requirements XYZ
    Args:
        db (Session): La session de base de données pour interroger les données de la culture.
        crop_name (str): Le nom de la culture pour récupérer les données correspondantes.
        ET0 (float): Évapotranspiration de référence [mm/mois] ou [mm/jour]
        P (float): Précipitations mensuelles enregistrées

    Returns:
        float: Besoins hydriques nets  [mm/mois] ou [mm/jour] (NRn)
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
        float: Besoins hydriques total  [mm/mois] ou [mm/jour] (NRt)

    """
    return NRn / Ea
