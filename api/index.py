import os
import sys
from pathlib import Path

# Add project root and backend to python path for Vercel runtime
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

for p in [str(backend_dir), str(root_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.main import app

# Export app for Vercel ASGI serverless handler
__all__ = ["app"]
