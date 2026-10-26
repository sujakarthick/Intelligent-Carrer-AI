from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter()


@router.get("/profile", response_model=schemas.ProfileOut)
def get_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the current student's profile."""
    profile = db.query(models.StudentProfile).filter_by(user_id=current_user.id).first()
    if not profile:
        # Create one if missing (shouldn't happen after registration)
        profile = models.StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    target_role_name = None
    if profile.target_role_id:
        role = db.query(models.JobRole).filter_by(id=profile.target_role_id).first()
        if role:
            target_role_name = role.name

    return schemas.ProfileOut(
        id=profile.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        college=profile.college,
        branch=profile.branch,
        year_of_study=profile.year_of_study,
        cgpa=profile.cgpa,
        target_role_id=profile.target_role_id,
        target_role_name=target_role_name,
        linkedin_url=profile.linkedin_url,
        github_url=profile.github_url,
        phone=profile.phone,
        bio=profile.bio,
    )


@router.put("/profile", response_model=schemas.ProfileOut)
def update_profile(
    payload: schemas.ProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current student's profile."""
    profile = db.query(models.StudentProfile).filter_by(user_id=current_user.id).first()
    if not profile:
        profile = models.StudentProfile(user_id=current_user.id)
        db.add(profile)

    if payload.target_role_id is not None:
        role = db.query(models.JobRole).filter_by(id=payload.target_role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Selected job role not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    target_role_name = None
    if profile.target_role_id:
        role = db.query(models.JobRole).filter_by(id=profile.target_role_id).first()
        if role:
            target_role_name = role.name

    return schemas.ProfileOut(
        id=profile.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        college=profile.college,
        branch=profile.branch,
        year_of_study=profile.year_of_study,
        cgpa=profile.cgpa,
        target_role_id=profile.target_role_id,
        target_role_name=target_role_name,
        linkedin_url=profile.linkedin_url,
        github_url=profile.github_url,
        phone=profile.phone,
        bio=profile.bio,
    )
