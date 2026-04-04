from __future__ import annotations

import hashlib
import json
from datetime import date

from backend.app.db.models import User, UserProgress


def build_certificate_payload(
    user: User,
    progress: UserProgress,
    total_steps: int,
) -> dict:
    if total_steps <= 0:
        return {
            "available": False,
            "certificate_id": None,
            "issue_date": None,
            "qr_payload": None,
            "message": "Сертификат недоступен: сценарии пока не загружены.",
        }

    if progress.resolved_steps < total_steps:
        remaining = total_steps - progress.resolved_steps
        return {
            "available": False,
            "certificate_id": None,
            "issue_date": None,
            "qr_payload": None,
            "message": f"До получения сертификата осталось закрыть {remaining} кейс(ов).",
        }

    issue_date = date.today()
    raw = f"{user.id}|{user.username}|{issue_date.isoformat()}|shieldops"
    certificate_id = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16].upper()
    qr_payload = json.dumps(
        {
            "certificate_id": certificate_id,
            "user": user.full_name,
            "username": user.username,
            "issue_date": issue_date.isoformat(),
            "reputation": progress.reputation,
            "resolved_steps": progress.resolved_steps,
        },
        ensure_ascii=False,
    )

    return {
        "available": True,
        "certificate_id": certificate_id,
        "issue_date": issue_date,
        "qr_payload": qr_payload,
        "message": "Сертификат сформирован и готов к верификации по QR.",
    }
