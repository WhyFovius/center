from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from backend.app.data.scenarios_seed import LEAGUES
from backend.app.db.models import (
    Attempt,
    Mission,
    ScenarioStep,
    StepOption,
    User,
    UserProgress,
    UserStepState,
)


def clamp(value: int, low: int, high: int) -> int:
    return max(low, min(high, value))


def get_or_create_progress(db: Session, user_id: int) -> UserProgress:
    progress = db.scalar(select(UserProgress).where(UserProgress.user_id == user_id))
    if progress is not None:
        return progress

    progress = UserProgress(
        user_id=user_id,
        security_level=100,
        reputation=100,
        resolved_steps=0,
        first_try_resolved=0,
        total_mistakes=0,
    )
    db.add(progress)
    db.flush()
    return progress


def get_or_create_step_state(db: Session, user_id: int, step_id: int) -> UserStepState:
    state = db.scalar(
        select(UserStepState).where(
            UserStepState.user_id == user_id,
            UserStepState.step_id == step_id,
        )
    )
    if state is not None:
        return state

    state = UserStepState(
        user_id=user_id,
        step_id=step_id,
        attempts_count=0,
        mistakes_count=0,
        resolved=False,
        first_try_success=False,
    )
    db.add(state)
    db.flush()
    return state


def get_league_name(reputation: int) -> str:
    current = LEAGUES[0]["name"]
    for league in LEAGUES:
        if reputation >= league["min_score"]:
            current = league["name"]
    return current


def load_missions(db: Session) -> list[Mission]:
    return list(
        db.scalars(
            select(Mission)
            .options(selectinload(Mission.steps).selectinload(ScenarioStep.options))
            .order_by(Mission.order_index)
        ).all()
    )


def get_total_steps(db: Session) -> int:
    return int(db.scalar(select(func.count(ScenarioStep.id))) or 0)


def load_user_step_states(db: Session, user_id: int) -> list[UserStepState]:
    return list(
        db.scalars(
            select(UserStepState)
            .where(UserStepState.user_id == user_id)
            .order_by(UserStepState.step_id)
        ).all()
    )


def compute_unlocked_mission_index(
    missions: list[Mission],
    state_map: dict[int, UserStepState],
) -> int:
    unlocked = 0
    for index, mission in enumerate(missions):
        if not mission.steps:
            unlocked = index
            continue

        mission_completed = all(
            state_map.get(step.id) is not None and state_map[step.id].resolved
            for step in mission.steps
        )
        if mission_completed:
            unlocked = min(index + 1, len(missions) - 1)
        else:
            break
    return unlocked


def mission_index_by_id(missions: list[Mission]) -> dict[int, int]:
    return {mission.id: index for index, mission in enumerate(missions)}


def serialize_missions(missions: list[Mission]) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for mission in missions:
        mission_payload = {
            "id": mission.id,
            "code": mission.code,
            "title": mission.title,
            "subtitle": mission.subtitle,
            "description": mission.description,
            "order_index": mission.order_index,
            "steps": [],
        }
        for step in mission.steps:
            step_payload = {
                "id": step.id,
                "code": step.code,
                "title": step.title,
                "attack_type": step.attack_type,
                "location": step.location,
                "brief": step.brief,
                "payload": step.payload,
                "options": [],
            }
            for option in step.options:
                step_payload["options"].append(
                    {
                        "id": option.id,
                        "option_key": option.option_key,
                        "label": option.label,
                        "details": option.details,
                        "is_correct": bool(option.is_correct),
                        "hint": option.hint,
                        "impact_text": option.impact_text,
                        "points": option.points,
                        "security_delta": option.security_delta,
                    }
                )
            mission_payload["steps"].append(step_payload)
        result.append(mission_payload)
    return result


def serialize_step_states(step_states: list[UserStepState]) -> list[dict[str, Any]]:
    return [
        {
            "step_id": state.step_id,
            "attempts_count": state.attempts_count,
            "mistakes_count": state.mistakes_count,
            "resolved": state.resolved,
            "first_try_success": state.first_try_success,
            "chosen_option_id": state.chosen_option_id,
            "resolved_at": state.resolved_at,
        }
        for state in step_states
    ]


def build_progress_payload(
    progress: UserProgress,
    unlocked_mission_index: int,
) -> dict[str, Any]:
    success_rate = (
        round((progress.first_try_resolved / progress.resolved_steps) * 100)
        if progress.resolved_steps
        else 0
    )
    return {
        "security_level": progress.security_level,
        "reputation": progress.reputation,
        "resolved_steps": progress.resolved_steps,
        "first_try_resolved": progress.first_try_resolved,
        "total_mistakes": progress.total_mistakes,
        "success_rate": success_rate,
        "league": get_league_name(progress.reputation),
        "unlocked_mission_index": unlocked_mission_index,
    }


def build_simulator_state(db: Session, user: User) -> dict[str, Any]:
    progress = get_or_create_progress(db, user.id)
    missions = load_missions(db)
    step_states = load_user_step_states(db, user.id)
    state_map = {state.step_id: state for state in step_states}

    unlocked_mission_index = compute_unlocked_mission_index(missions, state_map)
    total_steps = sum(len(mission.steps) for mission in missions)

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "created_at": user.created_at,
        },
        "leagues": LEAGUES,
        "missions": serialize_missions(missions),
        "step_states": serialize_step_states(step_states),
        "progress": build_progress_payload(progress, unlocked_mission_index),
        "total_steps": total_steps,
    }


def get_step_by_id(db: Session, step_id: int) -> ScenarioStep | None:
    return db.scalar(
        select(ScenarioStep)
        .options(selectinload(ScenarioStep.options))
        .where(ScenarioStep.id == step_id)
    )


def get_option_from_step(step: ScenarioStep, option_id: int) -> StepOption | None:
    for option in step.options:
        if option.id == option_id:
            return option
    return None


def apply_attempt(
    db: Session,
    user: User,
    step_id: int,
    option_id: int,
    hints_used: int = 0,
) -> dict[str, Any]:
    step = get_step_by_id(db, step_id)
    if step is None:
        raise ValueError("Scenario step not found")

    option = get_option_from_step(step, option_id)
    if option is None:
        raise ValueError("Option does not belong to this step")

    missions = load_missions(db)
    all_states = load_user_step_states(db, user.id)
    state_map = {state.step_id: state for state in all_states}
    unlocked = compute_unlocked_mission_index(missions, state_map)
    mission_index_map = mission_index_by_id(missions)
    if mission_index_map.get(step.mission_id) is None:
        raise ValueError("Scenario mission not found")
    progress = get_or_create_progress(db, user.id)
    step_state = get_or_create_step_state(db, user.id, step_id)

    if step_state.resolved:
        total_steps = sum(len(m.steps) for m in missions)
        return {
            "correct": True,
            "title": "Кейс уже закрыт",
            "message": "Этот сценарий уже успешно завершен.",
            "detail": "Перейдите к следующему шагу или откройте личный кабинет.",
            "references": step.reference_items,
            "step_state": {
                "step_id": step_state.step_id,
                "attempts_count": step_state.attempts_count,
                "mistakes_count": step_state.mistakes_count,
                "resolved": step_state.resolved,
                "first_try_success": step_state.first_try_success,
                "chosen_option_id": step_state.chosen_option_id,
                "resolved_at": step_state.resolved_at,
            },
            "progress": build_progress_payload(progress, unlocked),
            "all_completed": progress.resolved_steps >= total_steps and total_steps > 0,
        }

    step_state.attempts_count += 1
    is_correct = bool(option.is_correct)

    attempt = Attempt(
        user_id=user.id,
        step_id=step_id,
        option_id=option.id,
        is_correct=is_correct,
    )
    db.add(attempt)

    progress.security_level = clamp(progress.security_level + option.security_delta, 0, 100)
    progress.reputation = max(0, progress.reputation + option.points)
    hint_penalty = max(0, min(3, int(hints_used))) * 2
    if hint_penalty:
        progress.reputation = max(0, progress.reputation - hint_penalty)

    if is_correct:
        step_state.resolved = True
        step_state.resolved_at = datetime.now(timezone.utc)
        step_state.chosen_option_id = option.id
        step_state.first_try_success = step_state.attempts_count == 1
        progress.resolved_steps += 1
        if step_state.first_try_success:
            progress.first_try_resolved += 1
    else:
        step_state.mistakes_count += 1
        progress.total_mistakes += 1

    db.commit()
    db.refresh(progress)
    db.refresh(step_state)

    missions = load_missions(db)
    all_states = load_user_step_states(db, user.id)
    unlocked = compute_unlocked_mission_index(missions, {x.step_id: x for x in all_states})
    total_steps = sum(len(m.steps) for m in missions)

    if is_correct:
        title = "Угроза нейтрализована"
        message = step.explanation
        detail = step.why_dangerous
    else:
        title = "Рискованный выбор"
        message = option.hint
        detail = f"Последствие: {option.impact_text}"

    if hint_penalty:
        detail = f"{detail} Использованы подсказки: -{hint_penalty} к репутации."

    return {
        "correct": is_correct,
        "title": title,
        "message": message,
        "detail": detail,
        "references": step.reference_items,
        "step_state": {
            "step_id": step_state.step_id,
            "attempts_count": step_state.attempts_count,
            "mistakes_count": step_state.mistakes_count,
            "resolved": step_state.resolved,
            "first_try_success": step_state.first_try_success,
            "chosen_option_id": step_state.chosen_option_id,
            "resolved_at": step_state.resolved_at,
        },
        "progress": build_progress_payload(progress, unlocked),
        "all_completed": progress.resolved_steps >= total_steps and total_steps > 0,
    }
