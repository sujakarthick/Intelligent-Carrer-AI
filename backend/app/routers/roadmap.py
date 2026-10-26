from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
from ..services.roadmap_gen import generate_roadmap_tasks

router = APIRouter()


@router.post("/roadmap/generate", response_model=schemas.RoadmapOut, status_code=201)
def generate_roadmap(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate a 4-week personalised roadmap from the student's latest skill-gap analysis.
    If a roadmap already exists, its tasks are replaced (completed tasks are preserved).
    """
    latest_analysis = (
        db.query(models.SkillGapAnalysis)
        .filter_by(user_id=current_user.id)
        .order_by(models.SkillGapAnalysis.created_at.desc())
        .first()
    )
    if not latest_analysis:
        raise HTTPException(
            status_code=400,
            detail="Please run the skill-gap analysis first before generating a roadmap.",
        )

    gaps = latest_analysis.gaps or []

    # Preserve completed task statuses across regeneration
    existing_roadmap = (
        db.query(models.Roadmap).filter_by(user_id=current_user.id).first()
    )
    completed_skills: set = set()
    if existing_roadmap:
        for task in existing_roadmap.tasks:
            if task.status == "completed":
                completed_skills.add(task.skill.lower())
        # Delete old tasks (cascaded) and reuse the roadmap row
        db.query(models.RoadmapTask).filter_by(roadmap_id=existing_roadmap.id).delete()
        roadmap = existing_roadmap
        roadmap.role_id = latest_analysis.role_id
    else:
        roadmap = models.Roadmap(
            user_id=current_user.id,
            role_id=latest_analysis.role_id,
        )
        db.add(roadmap)
        db.flush()

    task_dicts = generate_roadmap_tasks(gaps)
    if not task_dicts:
        raise HTTPException(
            status_code=400,
            detail=(
                "Your skill-gap analysis shows no gaps for the selected role. "
                "Update your skills or choose a more advanced role to generate a roadmap."
            ),
        )

    for t in task_dicts:
        # Restore completed status where skill was previously completed
        if t["skill"].lower() in completed_skills:
            t["status"] = "completed"
        task = models.RoadmapTask(roadmap_id=roadmap.id, **t)
        db.add(task)

    db.commit()
    db.refresh(roadmap)
    return roadmap


@router.get("/roadmap", response_model=schemas.RoadmapOut)
def get_roadmap(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the student's current roadmap with all tasks."""
    roadmap = db.query(models.Roadmap).filter_by(user_id=current_user.id).first()
    if not roadmap:
        raise HTTPException(
            status_code=404,
            detail="No roadmap found. Run the skill-gap analysis and then generate your roadmap.",
        )
    return roadmap


@router.patch("/roadmap/tasks/{task_id}", response_model=schemas.RoadmapTaskOut)
def update_task_status(
    task_id: int,
    payload: schemas.TaskStatusUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the status of a specific roadmap task (pending / in_progress / completed)."""
    task = db.query(models.RoadmapTask).filter_by(id=task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    # Security: ensure the task belongs to this user's roadmap
    roadmap = db.query(models.Roadmap).filter_by(id=task.roadmap_id, user_id=current_user.id).first()
    if not roadmap:
        raise HTTPException(status_code=403, detail="You do not have access to this task.")

    task.status = payload.status
    db.commit()
    db.refresh(task)
    return task
