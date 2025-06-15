from cachetools import TTLCache, cached
from urllib.parse import urlencode
import requests
from enum import Enum
from typing import Dict

class Climate(Enum):
    ARID = "ARID"
    HUMID = "HUMID"

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
    try:
        data = get_weather_data(lat, lon)
        if not data or "current" not in data or "daily" not in data:
            raise ValueError("Missing 'current' or 'daily' data in weather response.")

        current = data["current"]
        daily = data["daily"]

        temperature = current.get("temperature_2m")
        humidity = current.get("relative_humidity_2m")
        precipitation = current.get("precipitation")
        current_time = current.get("time")

        if None in (temperature, humidity, precipitation, current_time):
            raise ValueError("Missing values in 'current' weather data.")

        current_date = current_time.split("T")[0]

        dates = daily.get("time", [])
        et0_values = daily.get("et0_fao_evapotranspiration", [])
        et0_today = None

        if current_date in dates:
            index = dates.index(current_date)
            et0_today = et0_values[index] if index < len(et0_values) else None

        climate = Climate.HUMID if humidity >= 50 else Climate.ARID

        return {
            "date": current_date,
            "temperature": temperature,
            "humidity": humidity,
            "precipitation": precipitation,
            "ET0": et0_today,
            "climate": climate,
        }


    except Exception as e:
        print(f"[ERROR] Failed to get climate data for ({lat}, {lon}): {e}")
        return None
