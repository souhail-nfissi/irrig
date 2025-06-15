from fastapi import APIRouter, Depends
from app.services.climate_service import get_climate
from app.schemas.climate import ClimateInput, ClimateOut

router = APIRouter()

@router.get("/", response_model=ClimateOut)
def get_climate_info(
    data: ClimateInput = Depends()
):
    """Fetch the climate data."""
    return get_climate(**dict(data))
