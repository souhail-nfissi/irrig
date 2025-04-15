from fastapi import APIRouter, HTTPException, Query
from app.services.climate_service import get_climate

router = APIRouter()

@router.get("/")
def get_climate_info(
    lat: float = Query(..., description="Latitude of the location"),
    lon: float = Query(..., description="Longitude of the location")
):
    """Fetch the climate data and classify the climate as Arid or Humid."""
    
    climate_data = get_climate(lat, lon)
    
    if "error" in climate_data:
        raise HTTPException(status_code=500, detail=climate_data["error"])
    
    return climate_data
