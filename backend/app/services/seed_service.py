from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.data.scenarios_seed import MISSION_SEED
from backend.app.db.models import Mission, ScenarioStep, StepOption


def seed_scenarios_if_needed(db: Session) -> None:
    for mission_payload in MISSION_SEED:
        mission = db.scalar(select(Mission).where(Mission.code == mission_payload["code"]))
        if mission is None:
            mission = Mission(code=mission_payload["code"])
            db.add(mission)

        mission.title = mission_payload["title"]
        mission.subtitle = mission_payload["subtitle"]
        mission.description = mission_payload["description"]
        mission.order_index = mission_payload["order_index"]
        db.flush()

        for step_payload in mission_payload["steps"]:
            step = db.scalar(select(ScenarioStep).where(ScenarioStep.code == step_payload["code"]))
            if step is None:
                step = ScenarioStep(code=step_payload["code"])
                db.add(step)

            step.mission_id = mission.id
            step.title = step_payload["title"]
            step.attack_type = step_payload["attack_type"]
            step.location = step_payload["location"]
            step.brief = step_payload["brief"]
            step.payload = step_payload["payload"]
            step.explanation = step_payload["explanation"]
            step.why_dangerous = step_payload["why_dangerous"]
            step.reference_items = step_payload["reference_items"]
            step.order_index = step_payload["order_index"]
            db.flush()

            existing_options = {
                option.option_key: option
                for option in db.scalars(select(StepOption).where(StepOption.step_id == step.id)).all()
            }
            for option_payload in step_payload["options"]:
                option = existing_options.get(option_payload["option_key"])
                if option is None:
                    option = StepOption(
                        step_id=step.id,
                        option_key=option_payload["option_key"],
                    )
                    db.add(option)

                option.step_id = step.id
                option.label = option_payload["label"]
                option.details = option_payload["details"]
                option.is_correct = option_payload["is_correct"]
                option.hint = option_payload["hint"]
                option.impact_text = option_payload["impact_text"]
                option.points = option_payload["points"]
                option.security_delta = option_payload["security_delta"]
                option.order_index = option_payload["order_index"]

    db.commit()
