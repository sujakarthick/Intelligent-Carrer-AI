from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter()


@router.get("/certifications", response_model=List[schemas.CertificationOut])
def list_certs(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(models.Certification)
        .filter_by(user_id=current_user.id)
        .order_by(models.Certification.created_at.desc())
        .all()
    )


@router.post("/certifications", response_model=schemas.CertificationOut, status_code=status.HTTP_201_CREATED)
def create_cert(
    payload: schemas.CertificationIn,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cert = models.Certification(user_id=current_user.id, **payload.model_dump())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


@router.put("/certifications/{cert_id}", response_model=schemas.CertificationOut)
def update_cert(
    cert_id: int,
    payload: schemas.CertificationIn,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cert = db.query(models.Certification).filter_by(id=cert_id, user_id=current_user.id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found.")
    for key, value in payload.model_dump().items():
        setattr(cert, key, value)
    db.commit()
    db.refresh(cert)
    return cert


@router.delete("/certifications/{cert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cert(
    cert_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cert = db.query(models.Certification).filter_by(id=cert_id, user_id=current_user.id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found.")
    db.delete(cert)
    db.commit()
