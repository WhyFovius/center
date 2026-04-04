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


@router.post("/upload")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "png"
    filename = f"avatar_{current_user.id}.{ext}"
    filepath = UPLOAD_DIR / filename

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    filepath.write_bytes(content)
    return {"avatar_url": f"/api/v1/avatar/{filename}"}


@router.get("/list")
async def list_avatar(
    user_id: int = Query(...),
    current_user: User = Depends(get_current_user),
):
    """Return the most recent avatar filename for a user."""
    for f in UPLOAD_DIR.iterdir():
        if f.name.startswith(f"avatar_{user_id}."):
            return {"filename": f.name}
    return {"filename": None}


@router.get("/{filename}")
async def get_avatar(filename: str):
    filepath = UPLOAD_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Avatar not found")
    return FileResponse(filepath)
