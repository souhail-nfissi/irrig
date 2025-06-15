from pydantic import BaseModel
from app.services.irrigation_service import Texture

class NRnInput(BaseModel):
    crop_name: str
    lat: float
    lon: float

class NRnOut(BaseModel):
    NRn: float
    ETc: float
    Pe: float

class EaInput(BaseModel):
    crop_name: str
    lat: float
    lon: float

    CEa: float
    EL: float
    texture: Texture
    CU: float

class EaOut(BaseModel):
    Ea: float
    Rt: float
    FL: float
    RL: float


class NRtInput(BaseModel):
    crop_name: str
    lat: float
    lon: float

    CU: float
    # RT
    texture: Texture

    # FL
    EL: float
    # FL: RL
    CEa: float

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
    lat: float
    lon: float

    Cc: float
    Pm: float

    CEa: float
    EL: float
    texture: Texture
    CU: float

class DtOut(BaseModel):
    Dt: float
    Dn: float
    Ea: float
