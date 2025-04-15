from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str = "sqlite:///./irrig.db"

    OPENWEATHERMAP_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
