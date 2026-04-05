"""Vercel serverless function entry point for /api/v1/* routes."""
from backend.app.main import app
from mangum import Mangum

handler = Mangum(app, lifespan="off")
