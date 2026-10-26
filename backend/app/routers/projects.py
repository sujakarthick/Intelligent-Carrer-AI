from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter()


@router.get("/projects", response_model=List[schemas.ProjectOut])
def list_projects(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(models.Project)
        .filter_by(user_id=current_user.id)
        .order_by(models.Project.created_at.desc())
        .all()
    )


@router.post("/projects", response_model=schemas.ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: schemas.ProjectIn,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = models.Project(user_id=current_user.id, **payload.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/projects/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    payload: schemas.ProjectIn,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(models.Project).filter_by(id=project_id, user_id=current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    for key, value in payload.model_dump().items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(models.Project).filter_by(id=project_id, user_id=current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    db.delete(project)
    db.commit()
