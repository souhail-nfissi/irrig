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
def calculate_Rt(H: float, climate: Climate, texture: Texture) -> float:
    """Calcuate Transpiration Ratio (Rt) for agricultural use
        Returns:
            Rt (float): (relation de transpiration)
    """
    if H < 75:
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
    elif H <= 150:
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

def calculate_Dn(H: float, Cc: float, Pm: float, f: float) -> float:
    """Calculate Net Irrigation Requirement (Dn)
        Args:
            H (float):  Profondeur des racines [cm]
            Cc (float): Capacité au champ [mm/cm]
            Pm (float): Point de flétrissement [mm/cm]
            f (float):  Disponibilité de l’eau dans le sol [-]
        Returns:
            Dn (float): Dose nette d’arrosage [mm]
    """
    return H * (Cc - Pm) * f

def calculate_RL(CEa: float, CEemax: float) -> float:
    """Calculate The Leaching Requirement (LR)
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
    return CEa / (2 * CEemax)

def calculate_FL(EL: float, RL: float) -> float:
    """Calculate Leaching Fraction
        Args:
            EL (float): L’efficacité de lavage
            RL (float) : La relation de lavage
        Returns:
            FL (float): Facteur de lavage
    """
    return 1 - (EL / RL)

def calculate_Ea(Rt: float, CU: float, FL: float, Fr: float = 1) -> float:
    """Calculate Irrigation Efficiency
        Args:
            Rt (float): Relation de transpiration
            CU (float): Coefficient d’uniformité
            FL (float): Facteur de lavage
            Fr (float): Facteur d’aspersion. default to 1
        Returns:
            Ea (float): Efficacité d'arrosage
    """
    return Rt * CU * Fr * FL

def calculate_ETc(Kc: float, ET0: float) -> float:
    """ Calculate Evapotranspiration
        Args:
            ET0 (float): Évapotranspiration de référence [mm/mois] ou [mm/jour]
            Kc (float):   Coefficient de culture [-]
        Returns:
            ETc (float): Évapotranspiration
    """
    return Kc * ET0

def calculate_Pe(P: float) -> float:
    """ Calcualte Monthly Recorded Precipitation
        Args:
            P (float): Précipitations mensuelles enregistrées
        Returns:
            Pe (float): précipitations efficace
    """
    return 0.8 * P - 25 if P > 75 else 0.6 * P - 10

def calculate_NRn(ETc: float, Pe: float) -> float:
    """Calculate  Calculate Net Water Requirements
        Args:
            ETc (float): Evapotranspiration de la culture [mm/mois] ou [mm/jour]
            Pe (float): Précipitations efficaces [mm/mois] ou [mm/jour]

        Returns:
            NRn (float) : Besoins hydriques nets  [mm/mois] ou [mm/jour]
    """
    return ETc - Pe

def calculate_NRt(NRn: float, Ea: float) -> float:
    """Calculate  Calculate Total Water Requirements

        Args:
            NRn (float) : Besoins hydriques nets  [mm/mois] ou [mm/jour]
            Ea (float): Efficacité d'arrosage
        Returns:
            NRt (float) : Besoins hydriques total  [mm/mois] ou [mm/jour]

    """
    return NRn / Ea

def calculate_IS(CEa: float) -> int:
    """Calcualte Salinity Index (SI)
        Args:
            CEa (float): est la conductivité électrique de l’eau d’arrosage en [dS/m].
        Returns:
            IS (float): Indice de salinité
    """
    if CEa < 0.75: return 1
    elif CEa <= 1.5: return 2
    elif CEa <= 3: return 3
    else: return 4

