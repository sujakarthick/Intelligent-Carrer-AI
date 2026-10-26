from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter()


@router.get("/skills", response_model=List[schemas.SkillOut])
def get_skills(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all skills saved for the current student."""
    return (
        db.query(models.StudentSkill)
        .filter_by(user_id=current_user.id)
        .order_by(models.StudentSkill.skill_name)
        .all()
    )


@router.put("/skills", response_model=List[schemas.SkillOut])
def update_skills(
    payload: schemas.SkillsUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Replace the student's skill list with the provided list.
    Existing skills not in the new list are removed.
    """
    # Remove all existing skills for this user
    db.query(models.StudentSkill).filter_by(user_id=current_user.id).delete()

    new_skills = []
    for skill_in in payload.skills:
        s = models.StudentSkill(
            user_id=current_user.id,
            skill_name=skill_in.skill_name,
            current_level=skill_in.current_level,
            source=skill_in.source,
        )
        db.add(s)
        new_skills.append(s)

    db.commit()
    for s in new_skills:
        db.refresh(s)

    return new_skills
