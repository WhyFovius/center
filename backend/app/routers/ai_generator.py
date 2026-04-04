from __future__ import annotations

import json
import os
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.app.core.security import get_current_user
from backend.app.db.models import User

router = APIRouter(prefix="/ai", tags=["ai"])

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

DEFAULT_MODEL = "qwen/qwen3.6-plus:free"


class GenerateScenarioRequest(BaseModel):
    topic: str
    difficulty: str = "medium"
    language: str = "ru"


def _build_prompt(topic: str, difficulty: str, language: str) -> str:
    return f"""You are a cybersecurity training scenario generator. Generate ONE realistic cybersecurity scenario in {language}.

Topic: {topic}
Difficulty: {difficulty}

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{{
  "code": "unique-code",
  "title": "Scenario title",
  "attack_type": "Attack type",
  "location": "Location",
  "brief": "Short narrative setup (2-3 sentences with context and tension)",
  "payload": "Technical details (key: value format, 3-4 lines)",
  "explanation": "Why the correct answer is correct",
  "why_dangerous": "Why wrong answers are dangerous",
  "reference_items": ["OWASP A01", "CWE-XXX"],
  "options": [
    {{
      "option_key": "A",
      "label": "Action label",
      "details": "Action details",
      "is_correct": false,
      "hint": "Hint text",
      "impact_text": "What would happen",
      "points": -15,
      "security_delta": -8
    }},
    ... 4 options total, exactly ONE is_correct: true
  ]
}}

Rules:
- Make it realistic and narrative-driven (start with a situation, then a problem)
- Include emotional pressure (urgency, authority, fear)
- The correct answer should follow cybersecurity best practices
- Wrong answers should seem plausible but have subtle red flags
- Points: correct = +20 to +30, wrong = -5 to -22
- Language: {language}"""


@router.post("/generate-scenario")
async def generate_scenario(
    payload: GenerateScenarioRequest,
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured. Set OPENROUTER_API_KEY env var.")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://zeroday.center-invest.ru",
                    "X-Title": "Zero Day Simulator",
                },
                json={
                    "model": DEFAULT_MODEL,
                    "messages": [{"role": "user", "content": _build_prompt(payload.topic, payload.difficulty, payload.language)}],
                    "temperature": 0.7,
                    "max_tokens": 2000,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        # Extract JSON from response
        content = content.strip()
        if content.startswith("```"):
            content = content.split("```", 2)[1]
            if content.startswith("json"):
                content = content[4:]
        content = content.strip()

        scenario = json.loads(content)
        return {"scenario": scenario, "model": DEFAULT_MODEL}

    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"AI request failed: {e}")
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {e}")


@router.get("/models")
async def list_models() -> dict[str, Any]:
    """List available free models on OpenRouter."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get("https://openrouter.ai/api/v1/models")
            resp.raise_for_status()
            data = resp.json()
        # Filter free models
        free_models = [
            m for m in data.get("data", [])
            if m.get("pricing", {}).get("prompt") == "0"
        ]
        return {"models": [{"id": m["id"], "name": m.get("name", "")} for m in free_models[:10]]}
    except Exception as e:
        return {"models": [], "error": str(e)}
