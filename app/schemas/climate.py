from pydantic import BaseModel
from app.services.irrigation_service import Climate

class ClimateInput(BaseModel):
    lat: float
    lon: float

class ClimateOut(BaseModel):
    date: str
    temperature: float
    humidity: float
    precipitation: float
    ET0: float
    climate: str
