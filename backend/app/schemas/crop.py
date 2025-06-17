from pydantic import BaseModel
from typing import Optional

class CropCreate(BaseModel):
    name: str
    Kc: float
    CEemax: float
    H: float
    f: float

class CropUpdate(BaseModel):
    Kc: Optional[float] = None
    CEemax: Optional[float] = None
    H: Optional[float] = None
    f: Optional[float] = None

class CropOut(BaseModel):
    name: str
    Kc: float
    CEemax: float
    H: float
    f: float
