from functools import lru_cache
from cachetools import TTLCache, cached
from urllib.parse import urlencode
import requests
from enum import Enum
from typing import Dict

# Enum to define climate types
class Climate(Enum):
    ARID = "Arid"
    HUMID = "Humid"

BASE_URL = "https://api.open-meteo.com/v1/forecast"

def fetch_data(url: str):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises HTTPError for bad responses
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

weather_cache = TTLCache(maxsize=1024, ttl=3600 * 8)
@cached(weather_cache)
def get_weather_data(lat: float, lon: float) -> Dict:
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "et0_fao_evapotranspiration",
        "current": "precipitation,temperature_2m,relative_humidity_2m",
        "timezone": "Africa/Casablanca"

    }
    url = f"{BASE_URL}?{urlencode(params)}"
    return fetch_data(url)

def get_climate(lat: float, lon: float):
    data = get_weather_data(lat, lon)
    print(f"{data=}")

    current = data["current"]
    temperature = current["temperature_2m"]
    humidity = current["relative_humidity_2m"]
    precipitation = current["precipitation"]

    current_date = current["time"].split("T")[0]

    dates = data["daily"]["time"]
    et0_values = data["daily"]["et0_fao_evapotranspiration"]
    et0_today = None
    if current_date in dates:
        index = dates.index(current_date)
        et0_today = et0_values[index]

    climate = Climate.HUMID if humidity >= 50 else Climate.ARID

    return {
        "date": current_date,
        "temperature": temperature,
        "humidity": humidity,
        "precipitation": precipitation,
        "ET0": et0_today,
        "climate": climate.value,
    }
