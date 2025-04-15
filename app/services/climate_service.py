from app.core.config import settings
import requests
from enum import Enum
from typing import Dict

# Enum to define climate types
class Climate(Enum):
    ARID = "Arid"
    HUMID = "Humid"

# OpenWeatherMap API URL
BASE_URL = "http://api.openweathermap.org/data/2.5/weather?"

def classify_climate(precipitation: float, humidity: int) -> Climate:
    """Classify the climate as arid or humid based on humidity."""
    if humidity >= 60:
        return Climate.HUMID  # Humid climate conditions
    else:
        return Climate.ARID  # Arid climate conditions

def get_weather_data(lat: float, lon: float) -> Dict:
    """Fetch weather data from OpenWeatherMap API."""
    url = f"{BASE_URL}lat={lat}&lon={lon}&appid={settings.OPENWEATHERMAP_API_KEY}&units=metric"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises HTTPError for bad responses
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

def get_climate(lat: float, lon: float) -> Dict:
    """Fetch climate data and return classification along with weather information."""
    weather_data = get_weather_data(lat, lon)
    if "error" in weather_data:
        return {"error": weather_data["error"]}

    # Extract data
    temperature = weather_data['main']['temp']  # Temperature in Celsius
    humidity = weather_data['main']['humidity']  # Humidity as percentage
    precipitation = weather_data.get('rain', {}).get('1h', 0)  # Precipitation in last hour (mm)
    
    # Classify climate
    climate = classify_climate(precipitation, humidity)
    
    return {
        "temperature": temperature,
        "humidity": humidity,
        "precipitation": precipitation,
        "climate": climate.value
    }
