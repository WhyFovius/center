from datetime import datetime

from pydantic import BaseModel

from backend.app.schemas.auth import UserPublic


class LeagueOut(BaseModel):
    name: str
    min_score: int


class StepOptionOut(BaseModel):
    id: int
    option_key: str
    label: str
    details: str
    is_correct: bool
    hint: str
    impact_text: str
    points: int
    security_delta: int


class ScenarioStepOut(BaseModel):
    id: int
    code: str
    title: str
    attack_type: str
    location: str
    brief: str
    payload: str
    options: list[StepOptionOut]


class MissionOut(BaseModel):
    id: int
    code: str
    title: str
    subtitle: str
    description: str
    order_index: int
    steps: list[ScenarioStepOut]


class StepStateOut(BaseModel):
    step_id: int
    attempts_count: int
    mistakes_count: int
    resolved: bool
    first_try_success: bool
    chosen_option_id: int | None
    resolved_at: datetime | None


class ProgressOut(BaseModel):
    security_level: int
    reputation: int
    resolved_steps: int
    first_try_resolved: int
    total_mistakes: int
    success_rate: int
    league: str
    unlocked_mission_index: int


class SimulatorStateOut(BaseModel):
    user: UserPublic
    leagues: list[LeagueOut]
    missions: list[MissionOut]
    step_states: list[StepStateOut]
    progress: ProgressOut
    total_steps: int


class AttemptRequest(BaseModel):
    step_id: int
    option_id: int
    hints_used: int = 0


class AttemptResponse(BaseModel):
    correct: bool
    title: str
    message: str
    detail: str
    references: list[str]
    step_state: StepStateOut
    progress: ProgressOut
    all_completed: bool
