from __future__ import annotations

from typing import Any

from redis import Redis
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.db.models import User, UserProgress


LEADERBOARD_KEY = "leaderboard:reputation"


def _user_hash_key(user_id: int) -> str:
    return f"leaderboard:user:{user_id}"


def update_leaderboard_cache(redis_client: Redis | None, user: User, progress: UserProgress) -> None:
    if redis_client is None:
        return
    try:
        redis_client.zadd(LEADERBOARD_KEY, {str(user.id): float(progress.reputation)})
        redis_client.hset(
            _user_hash_key(user.id),
            mapping={
                "user_id": str(user.id),
                "username": user.username,
                "full_name": user.full_name,
                "reputation": str(progress.reputation),
                "security_level": str(progress.security_level),
                "resolved_steps": str(progress.resolved_steps),
            },
        )
    except Exception:
        # Non-critical path: API continues even if cache is unavailable.
        return


def _build_entries_from_redis(redis_client: Redis, limit: int) -> list[dict[str, Any]]:
    members = redis_client.zrevrange(LEADERBOARD_KEY, 0, limit - 1, withscores=True)
    entries: list[dict[str, Any]] = []
    for rank, (member, _score) in enumerate(members, start=1):
        user_id = int(member)
        user_data = redis_client.hgetall(_user_hash_key(user_id))
        if not user_data:
            continue
        entries.append(
            {
                "rank": rank,
                "user_id": user_id,
                "username": user_data.get("username", ""),
                "full_name": user_data.get("full_name", ""),
                "reputation": int(user_data.get("reputation", 0)),
                "security_level": int(user_data.get("security_level", 0)),
                "resolved_steps": int(user_data.get("resolved_steps", 0)),
            }
        )
    return entries


def get_leaderboard(db: Session, redis_client: Redis | None, limit: int = 10) -> list[dict[str, Any]]:
    if redis_client is not None:
        try:
            entries = _build_entries_from_redis(redis_client, limit)
            if entries:
                return entries
        except Exception:
            pass

    rows = db.execute(
        select(
            User.id,
            User.username,
            User.full_name,
            UserProgress.reputation,
            UserProgress.security_level,
            UserProgress.resolved_steps,
        )
        .join(UserProgress, UserProgress.user_id == User.id)
        .order_by(UserProgress.reputation.desc(), UserProgress.resolved_steps.desc(), User.id.asc())
        .limit(limit)
    ).all()

    entries: list[dict[str, Any]] = []
    for rank, row in enumerate(rows, start=1):
        entries.append(
            {
                "rank": rank,
                "user_id": row.id,
                "username": row.username,
                "full_name": row.full_name,
                "reputation": row.reputation,
                "security_level": row.security_level,
                "resolved_steps": row.resolved_steps,
            }
        )

    if redis_client is not None:
        for entry in entries:
            try:
                redis_client.zadd(LEADERBOARD_KEY, {str(entry["user_id"]): float(entry["reputation"])})
                redis_client.hset(
                    _user_hash_key(entry["user_id"]),
                    mapping={
                        "user_id": str(entry["user_id"]),
                        "username": entry["username"],
                        "full_name": entry["full_name"],
                        "reputation": str(entry["reputation"]),
                        "security_level": str(entry["security_level"]),
                        "resolved_steps": str(entry["resolved_steps"]),
                    },
                )
            except Exception:
                break

    return entries
