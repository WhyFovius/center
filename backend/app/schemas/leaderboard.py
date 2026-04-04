from pydantic import BaseModel


class LeaderboardEntryOut(BaseModel):
    rank: int
    user_id: int
    username: str
    full_name: str
    reputation: int
    security_level: int
    resolved_steps: int


class LeaderboardOut(BaseModel):
    entries: list[LeaderboardEntryOut]
