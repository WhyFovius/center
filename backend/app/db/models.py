from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(160))
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    progress: Mapped["UserProgress"] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    attempts: Mapped[list["Attempt"]] = relationship(back_populates="user")
    step_states: Mapped[list["UserStepState"]] = relationship(back_populates="user")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    security_level: Mapped[int] = mapped_column(Integer, default=74)
    reputation: Mapped[int] = mapped_column(Integer, default=90)
    resolved_steps: Mapped[int] = mapped_column(Integer, default=0)
    first_try_resolved: Mapped[int] = mapped_column(Integer, default=0)
    total_mistakes: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped[User] = relationship(back_populates="progress")


class Mission(Base):
    __tablename__ = "missions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(120))
    subtitle: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    steps: Mapped[list["ScenarioStep"]] = relationship(
        back_populates="mission",
        order_by="ScenarioStep.order_index",
        cascade="all, delete-orphan",
    )


class ScenarioStep(Base):
    __tablename__ = "scenario_steps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    mission_id: Mapped[int] = mapped_column(ForeignKey("missions.id"), index=True)
    code: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(220))
    attack_type: Mapped[str] = mapped_column(String(120))
    location: Mapped[str] = mapped_column(String(120))
    brief: Mapped[str] = mapped_column(Text)
    payload: Mapped[str] = mapped_column(Text)
    explanation: Mapped[str] = mapped_column(Text)
    why_dangerous: Mapped[str] = mapped_column(Text)
    reference_items: Mapped[list[str]] = mapped_column(JSON, default=list)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    mission: Mapped[Mission] = relationship(back_populates="steps")
    options: Mapped[list["StepOption"]] = relationship(
        back_populates="step",
        order_by="StepOption.order_index",
        cascade="all, delete-orphan",
    )
    attempts: Mapped[list["Attempt"]] = relationship(back_populates="step")
    step_states: Mapped[list["UserStepState"]] = relationship(back_populates="step")


class StepOption(Base):
    __tablename__ = "step_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    step_id: Mapped[int] = mapped_column(ForeignKey("scenario_steps.id"), index=True)
    option_key: Mapped[str] = mapped_column(String(10))
    label: Mapped[str] = mapped_column(Text)
    details: Mapped[str] = mapped_column(Text)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    hint: Mapped[str] = mapped_column(Text)
    impact_text: Mapped[str] = mapped_column(Text)
    points: Mapped[int] = mapped_column(Integer, default=0)
    security_delta: Mapped[int] = mapped_column(Integer, default=0)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    step: Mapped[ScenarioStep] = relationship(back_populates="options")
    attempts: Mapped[list["Attempt"]] = relationship(back_populates="option")


class Attempt(Base):
    __tablename__ = "attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    step_id: Mapped[int] = mapped_column(ForeignKey("scenario_steps.id"), index=True)
    option_id: Mapped[int] = mapped_column(ForeignKey("step_options.id"), index=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped[User] = relationship(back_populates="attempts")
    step: Mapped[ScenarioStep] = relationship(back_populates="attempts")
    option: Mapped[StepOption] = relationship(back_populates="attempts")


class UserStepState(Base):
    __tablename__ = "user_step_states"
    __table_args__ = (UniqueConstraint("user_id", "step_id", name="uq_user_step"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    step_id: Mapped[int] = mapped_column(ForeignKey("scenario_steps.id"), index=True)
    attempts_count: Mapped[int] = mapped_column(Integer, default=0)
    mistakes_count: Mapped[int] = mapped_column(Integer, default=0)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    first_try_success: Mapped[bool] = mapped_column(Boolean, default=False)
    chosen_option_id: Mapped[int | None] = mapped_column(ForeignKey("step_options.id"), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User] = relationship(back_populates="step_states")
    step: Mapped[ScenarioStep] = relationship(back_populates="step_states")
