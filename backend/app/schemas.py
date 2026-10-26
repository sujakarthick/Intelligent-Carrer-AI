from __future__ import annotations
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v

    @field_validator("full_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name cannot be empty.")
        return v.strip()


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    full_name: str
    email: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Profile ───────────────────────────────────────────────────────────────────

class ProfileUpdate(BaseModel):
    college: Optional[str] = None
    branch: Optional[str] = None
    year_of_study: Optional[int] = None
    cgpa: Optional[float] = None
    target_role_id: Optional[int] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None

    @field_validator("cgpa")
    @classmethod
    def cgpa_range(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (0.0 <= v <= 10.0):
            raise ValueError("CGPA must be between 0.0 and 10.0.")
        return v

    @field_validator("year_of_study")
    @classmethod
    def year_range(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (1 <= v <= 5):
            raise ValueError("Year of study must be between 1 and 5.")
        return v


class ProfileOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    college: Optional[str]
    branch: Optional[str]
    year_of_study: Optional[int]
    cgpa: Optional[float]
    target_role_id: Optional[int]
    target_role_name: Optional[str]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    phone: Optional[str]
    bio: Optional[str]

    model_config = {"from_attributes": True}


# ── Skills ────────────────────────────────────────────────────────────────────

class SkillIn(BaseModel):
    skill_name: str
    current_level: int
    source: str = "self_reported"

    @field_validator("current_level")
    @classmethod
    def level_range(cls, v: int) -> int:
        if not (0 <= v <= 5):
            raise ValueError("Skill level must be 0–5.")
        return v

    @field_validator("skill_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Skill name cannot be empty.")
        return v.strip()


class SkillOut(BaseModel):
    id: int
    skill_name: str
    current_level: int
    source: str
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class SkillsUpdate(BaseModel):
    skills: List[SkillIn]


# ── Job Roles ─────────────────────────────────────────────────────────────────

class RoleSkillReqOut(BaseModel):
    skill_name: str
    required_level: int
    category: str

    model_config = {"from_attributes": True}


class JobRoleOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    skill_requirements: List[RoleSkillReqOut] = []

    model_config = {"from_attributes": True}


# ── Analysis ──────────────────────────────────────────────────────────────────

class SkillGapResult(BaseModel):
    skill_name: str
    required_level: int
    current_level: int
    gap: int
    priority: str
    category: str
    action: str


class AnalysisOut(BaseModel):
    id: int
    role_id: int
    role_name: str
    readiness_score: float
    gaps: List[SkillGapResult]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Roadmap ───────────────────────────────────────────────────────────────────

class RoadmapTaskOut(BaseModel):
    id: int
    week_number: int
    skill: str
    objective: str
    activity: str
    duration: Optional[str]
    difficulty: str
    priority: str
    status: str
    expected_outcome: Optional[str]

    model_config = {"from_attributes": True}


class RoadmapOut(BaseModel):
    id: int
    role_id: Optional[int]
    generated_at: Optional[datetime]
    tasks: List[RoadmapTaskOut] = []

    model_config = {"from_attributes": True}


class TaskStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        allowed = {"pending", "in_progress", "completed"}
        if v not in allowed:
            raise ValueError(f"Status must be one of: {', '.join(allowed)}")
        return v


# ── Projects ──────────────────────────────────────────────────────────────────

class ProjectIn(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    contribution: Optional[str] = None
    github_url: Optional[str] = None
    status: str = "completed"

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Project title cannot be empty.")
        return v.strip()

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        allowed = {"completed", "ongoing", "planned"}
        if v not in allowed:
            raise ValueError(f"Status must be one of: {', '.join(allowed)}")
        return v


class ProjectOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    technologies: Optional[str]
    contribution: Optional[str]
    github_url: Optional[str]
    status: str
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Certifications ────────────────────────────────────────────────────────────

class CertificationIn(BaseModel):
    name: str
    issuer: str
    issue_date: Optional[str] = None
    credential_url: Optional[str] = None

    @field_validator("name", "issuer")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("This field cannot be empty.")
        return v.strip()


class CertificationOut(BaseModel):
    id: int
    name: str
    issuer: str
    issue_date: Optional[str]
    credential_url: Optional[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Assessments ───────────────────────────────────────────────────────────────

class AssessmentQuestionOut(BaseModel):
    id: int
    title: str
    description: str
    language: str
    difficulty: str
    category: str
    options: List[str]

    model_config = {"from_attributes": True}


class AssessmentSubmit(BaseModel):
    language: str
    difficulty: str
    answers: Dict[int, int]  # {question_id: chosen_option_index}


class QuestionResult(BaseModel):
    question_id: int
    question_title: str
    your_answer: int
    correct_answer: int
    is_correct: bool
    explanation: str


class AssessmentResultOut(BaseModel):
    score_percent: float
    correct_answers: int
    total_questions: int
    results: List[QuestionResult]
    completed_at: Optional[datetime]


class AssessmentAttemptOut(BaseModel):
    id: int
    language: str
    difficulty: str
    total_questions: int
    correct_answers: int
    score_percent: float
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Communication ─────────────────────────────────────────────────────────────

class CommunicationQuestionOut(BaseModel):
    id: int
    question_type: str
    question: str


class CommunicationSubmit(BaseModel):
    question: str
    question_type: str
    answer: str

    @field_validator("answer")
    @classmethod
    def answer_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Answer cannot be empty.")
        return v.strip()


class CommunicationResultOut(BaseModel):
    feedback: str
    score: int
    suggestions: List[str]


class CommunicationPracticeOut(BaseModel):
    id: int
    question_type: str
    question: str
    student_answer: str
    feedback: Optional[str]
    score: int
    suggestions: Optional[List[str]]
    practiced_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Resume ────────────────────────────────────────────────────────────────────

class ResumeAnalysisOut(BaseModel):
    id: int
    filename: str
    detected_skills: List[str]
    suggestions: List[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardSummary(BaseModel):
    readiness_score: float
    total_skills: int
    skill_gaps_count: int
    high_priority_gaps: int
    projects_count: int
    certs_count: int
    assessments_count: int
    roadmap_total_tasks: int
    roadmap_completed_tasks: int
    roadmap_completion_pct: float
    target_role_name: Optional[str]
    has_resume: bool
