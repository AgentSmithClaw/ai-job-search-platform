from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')


class Settings:
    OPENAI_API_KEY: str = os.getenv('OPENAI_API_KEY', '')
    OPENAI_MODEL: str = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
    OPENAI_BASE_URL: str = os.getenv('OPENAI_BASE_URL', 'https://api.openai.com/v1')
    APP_DEBUG: bool = os.getenv('APP_DEBUG', 'false').lower() == 'true'
    APP_URL: str = os.getenv('APP_URL', 'http://127.0.0.1:8080')
    CORS_ORIGINS: list = [o.strip() for o in os.getenv('CORS_ORIGINS', 'http://127.0.0.1:8080,http://localhost:3000,http://localhost:8080').split(',') if o.strip()]
    STRIPE_SECRET_KEY: str = os.getenv('STRIPE_SECRET_KEY', '')
    STRIPE_WEBHOOK_SECRET: str = os.getenv('STRIPE_WEBHOOK_SECRET', '')
    STRIPE_PRICE_GAP_REPORT: str = os.getenv('STRIPE_PRICE_GAP_REPORT', '')
    STRIPE_PRICE_RESUME_POLISH: str = os.getenv('STRIPE_PRICE_RESUME_POLISH', '')
    STRIPE_PRICE_FULL_PACK: str = os.getenv('STRIPE_PRICE_FULL_PACK', '')


settings = Settings()