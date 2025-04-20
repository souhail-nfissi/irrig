from pydantic import BaseModel
from app.services.irrigation_service import Texture, Climate

class NRnInput(BaseModel):
    Kc: float
    ET0: float
    P: float

class NRnOut(BaseModel):
    NRn: float
    ETc: float
    Pe: float

class EaInput(BaseModel):
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

class EaOut(BaseModel):
    Ea: float
    Rt: float
    FL: float
    RL: float


class NRtInput(BaseModel):
    Kc: float
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
    H: float
    Cc: float
    Pm: float
    f: float

class DnOut(BaseModel):
    Dn: float

class DtInput(BaseModel):
    H: float
    Cc: float
    Pm: float
    f: float


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

class DtOut(BaseModel):
    Dt: float
    Dn: float
    Ea: float
