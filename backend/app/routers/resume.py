from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
from ..services.resume_parser import extract_text_from_pdf, detect_skills, generate_suggestions

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/resume/upload", response_model=schemas.ResumeAnalysisOut, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a PDF resume. Extracts text, identifies skill keywords,
    and returns suggestions. Does not store the file itself.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported. Please upload a .pdf file.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File is too large. Maximum allowed size is 5 MB.",
        )
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    text, success = extract_text_from_pdf(file_bytes)

    if not success:
        # Still save the attempt but with zero extracted content
        analysis = models.ResumeAnalysis(
            user_id=current_user.id,
            filename=file.filename,
            extracted_text_length=len(text),
            detected_skills=[],
            suggestions=[
                "Could not extract readable text from this PDF. "
                "If your resume is a scanned image, OCR (optical character recognition) "
                "is required — please use a text-based PDF instead."
            ],
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return analysis

    detected = detect_skills(text)

    # Get role skills for comparison
    profile = db.query(models.StudentProfile).filter_by(user_id=current_user.id).first()
    role_skills: List[str] = []
    if profile and profile.target_role_id:
        reqs = (
            db.query(models.RoleSkillRequirement)
            .filter_by(role_id=profile.target_role_id)
            .all()
        )
        role_skills = [r.skill_name for r in reqs]

    suggestions = generate_suggestions(detected, role_skills)

    analysis = models.ResumeAnalysis(
        user_id=current_user.id,
        filename=file.filename,
        extracted_text_length=len(text),
        detected_skills=detected,
        suggestions=suggestions,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


@router.get("/resume/history", response_model=List[schemas.ResumeAnalysisOut])
def resume_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return a list of past resume analyses for the current student."""
    return (
        db.query(models.ResumeAnalysis)
        .filter_by(user_id=current_user.id)
        .order_by(models.ResumeAnalysis.created_at.desc())
        .all()
    )
