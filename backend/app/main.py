from pathlib import Path

from fastapi import Depends, FastAPI, Request, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from redis import Redis

from backend.app.core.config import settings
from backend.app.core.security import decode_access_token
from backend.app.db.base import Base
from backend.app.db.session import SessionLocal, engine
from backend.app.routers import ai_generator, auth, avatar, certificate, health, leaderboard, simulator
from backend.app.services.seed_service import seed_scenarios_if_needed
from backend.app.ws.manager import ProgressWebSocketManager


ROOT_DIR = Path(__file__).resolve().parents[2]
FRONTEND_DIR = ROOT_DIR / "frontend"
DIST_DIR = FRONTEND_DIR / "dist"
ASSETS_DIR = FRONTEND_DIR / "assets"


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(simulator.router, prefix=settings.api_prefix)
app.include_router(leaderboard.router, prefix=settings.api_prefix)
app.include_router(certificate.router, prefix=settings.api_prefix)
app.include_router(ai_generator.router, prefix=settings.api_prefix)
app.include_router(avatar.router, prefix=settings.api_prefix)

# Serve Vite-built static assets with cache headers.
if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="vite-assets")


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Permissions-Policy"] = "attribution-reporting=()"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        seed_scenarios_if_needed(db)

    redis_client: Redis | None = None
    try:
        redis_client = Redis.from_url(settings.redis_url, decode_responses=True)
        redis_client.ping()
    except Exception:
        redis_client = None

    app.state.redis = redis_client
    app.state.ws_manager = ProgressWebSocketManager()


@app.on_event("shutdown")
def on_shutdown() -> None:
    redis_client = getattr(app.state, "redis", None)
    if redis_client is not None:
        try:
            redis_client.close()
        except Exception:
            pass


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    html_path = DIST_DIR / "index.html" if DIST_DIR.exists() else FRONTEND_DIR / "index.html"
    return FileResponse(html_path)


@app.get("/{full_path:path}", include_in_schema=False)
def catch_all(full_path: str) -> FileResponse:
    """SPA fallback: serve index.html for any non-API route."""
    if DIST_DIR.exists():
        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(DIST_DIR / "index.html")
    return FileResponse(FRONTEND_DIR / "index.html")


@app.websocket("/ws/progress")
async def ws_progress(websocket: WebSocket) -> None:
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        user_id = decode_access_token(token)
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    manager: ProgressWebSocketManager = app.state.ws_manager
    await manager.connect(user_id, websocket)

    await websocket.send_json({"type": "connected", "message": "progress stream active"})

    try:
        while True:
            # Keep the connection alive and allow client ping.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
    except Exception:
        manager.disconnect(user_id, websocket)
