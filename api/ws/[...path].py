"""Vercel serverless function entry point for /ws/* routes."""
from backend.app.main import app
from mangum import Mangum

handler = Mangum(app, lifespan="off")
