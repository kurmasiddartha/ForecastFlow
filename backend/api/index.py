import os
import sys
from pathlib import Path

# Add the backend root directory to sys.path so "app" can be resolved
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

# Export FastAPI instance for Vercel Serverless Function runtime
__all__ = ["app"]
