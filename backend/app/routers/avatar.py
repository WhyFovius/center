from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.core.security import get_current_user
from backend.app.db.models import User
from backend.app.db.session import get_db

router = APIRouter(prefix="/avatar", tags=["avatar"])

UPLOAD_DIR = Path(__file__).resolve().parents[3] / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "svg"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/upload")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    if not file.filename or "." not in file.filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # Stream file with size limit to prevent memory DoS
    content = b""
    total = 0
    chunk_size = 8192
    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        total += len(chunk)
        if total > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large (max 5MB)")
        content += chunk

    # Sanitize filename: use user ID only, no user-controlled path components
    filename = f"avatar_{current_user.id}.{ext}"
    filepath = UPLOAD_DIR / filename

    # Ensure filepath is within UPLOAD_DIR (prevent any traversal)
    if not str(filepath.resolve()).startswith(str(UPLOAD_DIR.resolve())):
        raise HTTPException(status_code=400, detail="Invalid filename")

    filepath.write_bytes(content)
    return {"avatar_url": f"/api/v1/avatar/{filename}"}


@router.get("/list")
async def list_avatar(
    user_id: int = Query(...),
    current_user: User = Depends(get_current_user),
):
    """Return the most recent avatar filename for a user."""
    # Users can only view their own avatar
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot view other users' avatars")

    for f in UPLOAD_DIR.iterdir():
        if f.name.startswith(f"avatar_{user_id}."):
            return {"filename": f.name}
    return {"filename": None}


@router.get("/{filename}")
async def get_avatar(filename: str):
    # Sanitize filename: only allow alphanumeric, dots, underscores, hyphens
    if not all(c.isalnum() or c in "._-" for c in filename):
        raise HTTPException(status_code=400, detail="Invalid filename")

    # Prevent path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    filepath = UPLOAD_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Avatar not found")

    # Ensure filepath is within UPLOAD_DIR
    if not str(filepath.resolve()).startswith(str(UPLOAD_DIR.resolve())):
        raise HTTPException(status_code=404, detail="Avatar not found")

    return FileResponse(filepath)
