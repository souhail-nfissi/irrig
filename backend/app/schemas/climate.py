from pydantic import BaseModel

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
