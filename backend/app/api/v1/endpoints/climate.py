from fastapi import APIRouter, Depends
from app.services.climate_service import get_climate
from app.schemas.climate import ClimateInput, ClimateOut

router = APIRouter()

@router.get("/", response_model=ClimateOut)
def get_climate_info(
    data: ClimateInput = Depends()
):
    """Fetch the climate data."""
    climate_data = get_climate(**dict(data))

    climate_data["climate"] = climate_data["climate"].value
    return climate_data
