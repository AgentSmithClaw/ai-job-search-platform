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
    STRIPE_SECRET_KEY: str = os.getenv('STRIPE_SECRET_KEY', '')
    STRIPE_WEBHOOK_SECRET: str = os.getenv('STRIPE_WEBHOOK_SECRET', '')


settings = Settings()