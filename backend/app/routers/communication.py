from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
from ..services.communication import evaluate_answer
from ..data.coding_questions import COMMUNICATION_QUESTIONS

router = APIRouter()


@router.get("/communication/questions", response_model=List[schemas.CommunicationQuestionOut])
def get_questions(
    question_type: Optional[str] = Query(None, description="intro | hr | technical | situation"),
    _: models.User = Depends(get_current_user),
):
    """Return communication practice questions, optionally filtered by type."""
    valid_types = {"intro", "hr", "technical", "situation"}
    if question_type and question_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"question_type must be one of: {', '.join(valid_types)}",
        )
    questions = COMMUNICATION_QUESTIONS
    if question_type:
        questions = [q for q in questions if q["question_type"] == question_type]
    return [
        schemas.CommunicationQuestionOut(
            id=q["id"],
            question_type=q["question_type"],
            question=q["question"],
        )
        for q in questions
    ]


@router.post("/communication/submit", response_model=schemas.CommunicationResultOut, status_code=201)
def submit_practice(
    payload: schemas.CommunicationSubmit,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit a communication practice answer and receive rule-based feedback."""
    score, feedback, suggestions = evaluate_answer(
        question=payload.question,
        answer=payload.answer,
        question_type=payload.question_type,
    )
    practice = models.CommunicationPractice(
        user_id=current_user.id,
        question_type=payload.question_type,
        question=payload.question,
        student_answer=payload.answer,
        feedback=feedback,
        score=score,
        suggestions=suggestions,
    )
    db.add(practice)
    db.commit()

    return schemas.CommunicationResultOut(
        feedback=feedback,
        score=score,
        suggestions=suggestions,
    )


@router.get("/communication/history", response_model=List[schemas.CommunicationPracticeOut])
def practice_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the student's past communication practice sessions."""
    return (
        db.query(models.CommunicationPractice)
        .filter_by(user_id=current_user.id)
        .order_by(models.CommunicationPractice.practiced_at.desc())
        .all()
    )
