from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    APP_NAME: str = "Analytics API"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"

    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS Settings
    """ Allowing every request from any domain """
    ALLOWED_ORIGINS: list = ["*"]  # In production, specify exact origins
        # Model Settings
    ARIMA_ORDER: tuple = (1, 1, 1)
    MIN_TRAINING_SAMPLES: int = 3
    
    # Database (if you add one later)
    DATABASE_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()