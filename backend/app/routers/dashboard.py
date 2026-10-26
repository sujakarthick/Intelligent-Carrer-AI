from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter()


@router.get("/dashboard/summary", response_model=schemas.DashboardSummary)
def dashboard_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return aggregated statistics for the student dashboard."""
    # Profile & target role
    profile = db.query(models.StudentProfile).filter_by(user_id=current_user.id).first()
    target_role_name = None
    if profile and profile.target_role_id:
        role = db.query(models.JobRole).filter_by(id=profile.target_role_id).first()
        if role:
            target_role_name = role.name

    # Skills
    total_skills = db.query(models.StudentSkill).filter_by(user_id=current_user.id).count()

    # Latest analysis
    latest_analysis = (
        db.query(models.SkillGapAnalysis)
        .filter_by(user_id=current_user.id)
        .order_by(models.SkillGapAnalysis.created_at.desc())
        .first()
    )
    readiness_score = 0.0
    skill_gaps_count = 0
    high_priority_gaps = 0
    if latest_analysis:
        readiness_score = latest_analysis.readiness_score or 0.0
        gaps = latest_analysis.gaps or []
        skill_gaps_count = sum(1 for g in gaps if g.get("gap", 0) > 0)
        high_priority_gaps = sum(1 for g in gaps if g.get("priority") == "high")

    # Projects & certs
    projects_count = db.query(models.Project).filter_by(user_id=current_user.id).count()
    certs_count = db.query(models.Certification).filter_by(user_id=current_user.id).count()

    # Assessments
    assessments_count = db.query(models.AssessmentAttempt).filter_by(user_id=current_user.id).count()

    # Roadmap progress
    roadmap = db.query(models.Roadmap).filter_by(user_id=current_user.id).first()
    roadmap_total = 0
    roadmap_completed = 0
    if roadmap:
        roadmap_total = len(roadmap.tasks)
        roadmap_completed = sum(1 for t in roadmap.tasks if t.status == "completed")

    completion_pct = (
        round((roadmap_completed / roadmap_total) * 100, 1) if roadmap_total > 0 else 0.0
    )

    # Has resume
    has_resume = db.query(models.ResumeAnalysis).filter_by(user_id=current_user.id).count() > 0

    return schemas.DashboardSummary(
        readiness_score=readiness_score,
        total_skills=total_skills,
        skill_gaps_count=skill_gaps_count,
        high_priority_gaps=high_priority_gaps,
        projects_count=projects_count,
        certs_count=certs_count,
        assessments_count=assessments_count,
        roadmap_total_tasks=roadmap_total,
        roadmap_completed_tasks=roadmap_completed,
        roadmap_completion_pct=completion_pct,
        target_role_name=target_role_name,
        has_resume=has_resume,
    )
