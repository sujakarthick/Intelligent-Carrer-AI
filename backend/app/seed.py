"""
Seed database with job roles, skill requirements, and coding questions.
Runs at application startup; skips rows that already exist.
"""
from sqlalchemy.orm import Session
from . import models
from .data.job_roles import JOB_ROLES_DATA
from .data.coding_questions import CODING_QUESTIONS, COMMUNICATION_QUESTIONS


def seed_database(db: Session) -> None:
    _seed_job_roles(db)
    _seed_coding_questions(db)


def _seed_job_roles(db: Session) -> None:
    for role_data in JOB_ROLES_DATA:
        existing = db.query(models.JobRole).filter_by(name=role_data["name"]).first()
        if existing:
            continue
        role = models.JobRole(name=role_data["name"], description=role_data["description"])
        db.add(role)
        db.flush()
        for skill_data in role_data["skills"]:
            req = models.RoleSkillRequirement(
                role_id=role.id,
                skill_name=skill_data["skill_name"],
                required_level=skill_data["required_level"],
                category=skill_data["category"],
            )
            db.add(req)
    db.commit()


def _seed_coding_questions(db: Session) -> None:
    if db.query(models.CodingQuestion).count() > 0:
        return
    for q in CODING_QUESTIONS:
        question = models.CodingQuestion(
            title=q["title"],
            description=q["description"],
            language=q["language"],
            difficulty=q["difficulty"],
            category=q["category"],
            options=q["options"],
            correct_option=q["correct_option"],
            explanation=q["explanation"],
        )
        db.add(question)
    db.commit()
