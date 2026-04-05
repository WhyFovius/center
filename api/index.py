"""Vercel serverless function - Zero Day API"""
import sys
import os

# Add the project root to the path so we can import backend modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app
from mangum import Mangum

handler = Mangum(app, lifespan="off")
