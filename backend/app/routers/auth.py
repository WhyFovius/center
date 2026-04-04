from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.app.core.security import create_access_token, hash_password, verify_password
from backend.app.db.models import User, UserProgress
from backend.app.db.session import get_db
from backend.app.schemas.auth import AuthLoginRequest, AuthRegisterRequest, AuthResponse


router = APIRouter(prefix="/auth", tags=["auth"])


def _normalize_username(value: str) -> str:
    return value.strip().lower()


def _normalize_full_name(value: str) -> str:
    return " ".join(value.strip().split())


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: AuthRegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    username = _normalize_username(payload.username)
    full_name = _normalize_full_name(payload.full_name)

    if len(username) < 3:
        raise HTTPException(status_code=422, detail="Username must contain at least 3 non-space characters")
    if len(full_name) < 2:
        raise HTTPException(status_code=422, detail="Full name must contain at least 2 non-space characters")

    existing = db.scalar(select(User).where(func.lower(User.username) == username))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Username already exists")

    user = User(
        username=username,
        full_name=full_name,
        password_hash=hash_password(payload.password),
    )
    db.add(user)

    try:
        db.flush()

        progress = UserProgress(
            user_id=user.id,
            security_level=74,
            reputation=90,
            resolved_steps=0,
            first_try_resolved=0,
            total_mistakes=0,
        )
        db.add(progress)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Username already exists") from exc

    db.refresh(user)

    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user=user)


@router.post("/login", response_model=AuthResponse)
def login(payload: AuthLoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    username = _normalize_username(payload.username)
    user = db.scalar(select(User).where(func.lower(User.username) == username))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user=user)
