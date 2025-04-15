from fastapi import APIRouter
from pydantic import BaseModel
from app.services.irrigation_service import calculate_ETc, calculate_Pe, calculate_NRn

router = APIRouter()

class NRnInput(BaseModel):
    Kc: float
    ET0: float
    P: float

@router.get("/calculateNRn")
def calculate_nrn(data: NRnInput):
    etc = calculate_ETc(data.Kc, data.ET0)
    pe = calculate_Pe(data.P)
    nrn = calculate_NRn(etc, pe)
    return {
        "ETc": round(etc, 2),
        "Pe": round(pe, 2),
        "NRn": round(nrn, 2)
    }

