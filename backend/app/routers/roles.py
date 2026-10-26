from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter()


@router.get("/roles", response_model=List[schemas.JobRoleOut])
def list_roles(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Return all available job roles."""
    return db.query(models.JobRole).all()


@router.get("/roles/{role_id}", response_model=schemas.JobRoleOut)
def get_role(role_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Return a single job role with its skill requirements."""
    role = db.query(models.JobRole).filter_by(id=role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Job role not found.")
    return role
