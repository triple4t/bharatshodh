

from typing import List
from pydantic_settings import BaseSettings
import os
import json

class Settings(BaseSettings):
    # Azure OpenAI
    azure_openai_api_key: str
    azure_openai_endpoint: str
    azure_openai_api_version: str = "2024-02-15-preview"
    azure_openai_deployment_name: str = "gpt-4o"
    azure_openai_embedding_deployment_name: str = "text-embedding-3-small"
    azure_openai_embedding_api_version: str = "2023-05-15"
    azure_openai_embedding_endpoint: str = None
    # JWT
    JWT_SECRET: str 
    JWT_ALGO: str 
    # Google Search API
    google_api_key: str
    google_search_engine_id: str
    # Azure Speech Service
    azure_speech_key: str
    azure_speech_region: str
    
    # Sarvam AI
    sarvam_api_key: str = None
    tts_provider: str = "azure"  # Options: "azure", "sarvam"

    # HTTP Configuration for Email Services through Brevo
    brevo_api_key: str
    app_from_email: str
    reset_token_ttl_minutes: int = 15
    rate_limit_redis_url: str = None  # optional

    # Frontend URL for password reset
    frontend_reset_url: str="http://localhost:5173/reset-password"

    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_database: str = "chatgpt_clone"

    # FastAPI
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:8010"]
    upload_dir: str = "uploads"
    max_file_size: int = 10485760  # 10MB

    # Semantic Cache (Redis)
    redis_host: str = "localhost"
    redis_port: int = 6379  # Use 6380 for Azure Redis (SSL)
    redis_db: int = 0
    redis_password: str = None  # Required for Azure Redis
    semantic_cache_enabled: bool = True
    semantic_cache_threshold: float = 0.95  # Similarity threshold (0.0-1.0)
    semantic_cache_ttl_seconds: int = 86400  # 24 hours
    semantic_cache_embedding_model: str = "all-MiniLM-L6-v2"

    class Config:
        env_file = ".env"

        @staticmethod
        def parse_env_var(field_name: str, raw_value: str):
            if field_name == "cors_origins":
                try:
                    return json.loads(raw_value)
                except json.JSONDecodeError:
                    return [v.strip() for v in raw_value.split(",")]
            return raw_value

settings = Settings()
os.makedirs(settings.upload_dir, exist_ok=True)
