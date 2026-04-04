from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from backend.app.core.security import get_current_user
from backend.app.db.models import Attempt, Mission, User, UserStepState
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

    current_user = db.get(User, current_user.id)
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


@router.post("/reset/{mission_code}")
async def reset_mission(
    mission_code: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reset all progress for a specific mission."""
    mission = db.scalar(
        select(Mission)
        .where(Mission.code == mission_code)
        .options(selectinload(Mission.steps))
    )
    if mission is None:
        raise HTTPException(status_code=404, detail="Mission not found")

    step_ids = [s.id for s in mission.steps]
    resolved_count = 0

    if step_ids:
        resolved_states = db.scalars(
            select(UserStepState).where(
                UserStepState.user_id == current_user.id,
                UserStepState.step_id.in_(step_ids),
                UserStepState.resolved == True,
            )
        ).all()
        resolved_count = len(resolved_states)

        db.execute(delete(UserStepState).where(UserStepState.user_id == current_user.id, UserStepState.step_id.in_(step_ids)))
        db.execute(delete(Attempt).where(Attempt.user_id == current_user.id, Attempt.step_id.in_(step_ids)))

    # Decrement resolved_steps by the number of resolved steps and first_try_resolved correctly
    progress = progress_service.get_or_create_progress(db, current_user.id)
    if resolved_count > 0:
        progress.resolved_steps = max(0, progress.resolved_steps - resolved_count)
        # Correctly recalculate first_try_resolved
        states_to_check = db.scalars(
            select(UserStepState).where(
                UserStepState.user_id == current_user.id,
                UserStepState.step_id.in_(step_ids),
                UserStepState.first_try_success == True,
            )
        ).all()
        first_try_count = len(states_to_check)
        progress.first_try_resolved = max(0, progress.first_try_resolved - first_try_count)

    db.flush()
    db.commit()

    return {"message": f"Mission '{mission_code}' has been reset", "reset_steps": len(step_ids), "resolved_reset": resolved_count}
