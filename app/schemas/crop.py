from pydantic import BaseModel

class CropCreate(BaseModel):
    name: str
    Kc: float
    CEemax: float
    H: float
    f: float

class CropOut(BaseModel):
    name: str
    Kc: float
    CEemax: float
    H: float
    f: float
