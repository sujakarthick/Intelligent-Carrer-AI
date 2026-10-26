from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
from ..services.skill_gap import calculate_skill_gaps

router = APIRouter()


@router.post("/analysis/skill-gaps", response_model=schemas.AnalysisOut)
def run_analysis(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Compute skill-gap analysis for the current student against their target role.
    Saves and returns the result.
    """
    profile = db.query(models.StudentProfile).filter_by(user_id=current_user.id).first()
    if not profile or not profile.target_role_id:
        raise HTTPException(
            status_code=400,
            detail="Please select a target job role in your profile before running the analysis.",
        )

    role = db.query(models.JobRole).filter_by(id=profile.target_role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Target job role not found.")

    # Refresh user skills
    db.refresh(current_user)

    result = calculate_skill_gaps(current_user, role)

    analysis = models.SkillGapAnalysis(
        user_id=current_user.id,
        role_id=role.id,
        readiness_score=result["readiness_score"],
        gaps=result["gaps"],
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return schemas.AnalysisOut(
        id=analysis.id,
        role_id=role.id,
        role_name=role.name,
        readiness_score=analysis.readiness_score,
        gaps=[schemas.SkillGapResult(**g) for g in analysis.gaps],
        created_at=analysis.created_at,
    )


@router.get("/analysis/latest", response_model=schemas.AnalysisOut)
def get_latest_analysis(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the most recent skill-gap analysis for the current student."""
    analysis = (
        db.query(models.SkillGapAnalysis)
        .filter_by(user_id=current_user.id)
        .order_by(models.SkillGapAnalysis.created_at.desc())
        .first()
    )
    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="No analysis found. Add your skills, select a target role, and run the analysis.",
        )

    role = db.query(models.JobRole).filter_by(id=analysis.role_id).first()
    role_name = role.name if role else "Unknown"

    return schemas.AnalysisOut(
        id=analysis.id,
        role_id=analysis.role_id,
        role_name=role_name,
        readiness_score=analysis.readiness_score,
        gaps=[schemas.SkillGapResult(**g) for g in (analysis.gaps or [])],
        created_at=analysis.created_at,
    )
