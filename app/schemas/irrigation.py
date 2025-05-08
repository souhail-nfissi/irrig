from pydantic import BaseModel
from app.services.irrigation_service import Texture, Climate

class NRnInput(BaseModel):
    crop_name: str
    ET0: float
    P: float

class NRnOut(BaseModel):
    NRn: float
    ETc: float
    Pe: float

class EaInput(BaseModel):
    crop_name: str
    CEa: float
    EL: float
    texture: Texture
    climate: Climate
    CU: float

class EaOut(BaseModel):
    Ea: float
    Rt: float
    FL: float
    RL: float


class NRtInput(BaseModel):
    crop_name: str
    # Kc: float
    ET0: float
    P: float

    CU: float
    # RT
    H: float
    texture: Texture
    climate: Climate

    # FL
    EL: float
    # FL: RL
    CEa: float
    CEemax: float

class NRtOut(BaseModel):
    NRt: float
    NRn: float
    Ea: float


class DnInput(BaseModel):
    crop_name: str
    Cc: float
    Pm: float

class DnOut(BaseModel):
    Dn: float

class DtInput(BaseModel):
    crop_name: str
    Cc: float
    Pm: float

    CEa: float
    EL: float
    texture: Texture
    climate: Climate
    CU: float

class DtOut(BaseModel):
    Dt: float
    Dn: float
    Ea: float
