from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from backend.app.core.security import get_current_user
from backend.app.db.models import User
from backend.app.db.session import get_db
from backend.app.schemas.simulator import AttemptRequest, AttemptResponse, SimulatorStateOut
from backend.app.services import leaderboard_service, progress_service


router = APIRouter(prefix="/simulator", tags=["simulator"])


@router.get("/state", response_model=SimulatorStateOut)
def simulator_state(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SimulatorStateOut:
    return SimulatorStateOut(**progress_service.build_simulator_state(db, current_user))


@router.post("/attempt", response_model=AttemptResponse)
async def submit_attempt(
    payload: AttemptRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AttemptResponse:
    try:
        result = progress_service.apply_attempt(
            db=db,
            user=current_user,
            step_id=payload.step_id,
            option_id=payload.option_id,
            hints_used=payload.hints_used,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    current_user = db.get(User, current_user.id)  # refresh for consistency
    progress = progress_service.get_or_create_progress(db, current_user.id)

    redis_client = getattr(request.app.state, "redis", None)
    leaderboard_service.update_leaderboard_cache(redis_client, current_user, progress)

    ws_manager = getattr(request.app.state, "ws_manager", None)
    if ws_manager is not None:
        await ws_manager.send_to_user(
            current_user.id,
            {
                "type": "progress_update",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "progress": result["progress"],
            },
        )

    return AttemptResponse(**result)
