from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.leaderboard import LeaderboardOut
from backend.app.services.leaderboard_service import get_leaderboard


router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=LeaderboardOut)
def leaderboard(
    request: Request,
    db: Session = Depends(get_db),
) -> LeaderboardOut:
    redis_client = getattr(request.app.state, "redis", None)
    entries = get_leaderboard(db, redis_client, limit=10)
    return LeaderboardOut(entries=entries)
