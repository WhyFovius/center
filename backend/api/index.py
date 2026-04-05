"""Vercel serverless function entry point."""
from backend.app.main import app
from mangum import Mangum

handler = Mangum(app, lifespan="off")
