"""Configuration module"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # Database
    db_host: str = "localhost"
    db_port: int = 3306
    db_user: str = "root"
    db_password: str = "password"
    db_name: str = "mycoffeeai"
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_title: str = "MyCoffee.AI API"
    
    # CORS
    frontend_url: str = "http://localhost:3000"
    
    # Security
    secret_key: str = "your_secret_key_change_in_production"
    
    class Config:
        env_file = ".env.local"
        case_sensitive = False
    
    @property
    def database_url(self) -> str:
        """Construct database URL for SQLAlchemy"""
        return f"mysql+pymysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


@lru_cache
def get_settings() -> Settings:
    """Get application settings (cached)"""
    return Settings()
