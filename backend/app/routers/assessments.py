from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter()


@router.get("/assessments", response_model=List[schemas.AssessmentQuestionOut])
def get_questions(
    language: str = Query(..., description="java | python | general"),
    difficulty: str = Query(..., description="beginner | intermediate | advanced"),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """
    Return MCQ questions filtered by language and difficulty.
    Correct answers are NOT included in the response.
    """
    valid_languages = {"java", "python", "general"}
    valid_difficulties = {"beginner", "intermediate", "advanced"}
    if language not in valid_languages:
        raise HTTPException(status_code=400, detail=f"Language must be one of: {', '.join(valid_languages)}")
    if difficulty not in valid_difficulties:
        raise HTTPException(status_code=400, detail=f"Difficulty must be one of: {', '.join(valid_difficulties)}")

    questions = (
        db.query(models.CodingQuestion)
        .filter_by(language=language, difficulty=difficulty)
        .all()
    )
    if not questions:
        raise HTTPException(
            status_code=404,
            detail=f"No {difficulty} {language} questions available yet.",
        )
    return questions


@router.post("/assessments/submit", response_model=schemas.AssessmentResultOut, status_code=201)
def submit_assessment(
    payload: schemas.AssessmentSubmit,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Evaluate submitted answers against stored correct answers.
    Returns per-question results and overall score.
    """
    if not payload.answers:
        raise HTTPException(status_code=400, detail="No answers were submitted.")

    question_ids = list(payload.answers.keys())
    questions = (
        db.query(models.CodingQuestion)
        .filter(models.CodingQuestion.id.in_(question_ids))
        .all()
    )
    q_map = {q.id: q for q in questions}

    results = []
    correct_count = 0

    for qid, chosen in payload.answers.items():
        q = q_map.get(qid)
        if not q:
            continue
        is_correct = chosen == q.correct_option
        if is_correct:
            correct_count += 1
        results.append(
            schemas.QuestionResult(
                question_id=qid,
                question_title=q.title,
                your_answer=chosen,
                correct_answer=q.correct_option,
                is_correct=is_correct,
                explanation=q.explanation or "",
            )
        )

    total = len(results)
    score_pct = round((correct_count / total) * 100, 1) if total > 0 else 0.0

    attempt = models.AssessmentAttempt(
        user_id=current_user.id,
        language=payload.language,
        difficulty=payload.difficulty,
        total_questions=total,
        correct_answers=correct_count,
        score_percent=score_pct,
        answers={str(k): v for k, v in payload.answers.items()},
        results=[r.model_dump() for r in results],
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return schemas.AssessmentResultOut(
        score_percent=score_pct,
        correct_answers=correct_count,
        total_questions=total,
        results=results,
        completed_at=attempt.completed_at,
    )


@router.get("/assessments/history", response_model=List[schemas.AssessmentAttemptOut])
def assessment_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return a list of the student's past assessment attempts."""
    return (
        db.query(models.AssessmentAttempt)
        .filter_by(user_id=current_user.id)
        .order_by(models.AssessmentAttempt.completed_at.desc())
        .all()
    )
