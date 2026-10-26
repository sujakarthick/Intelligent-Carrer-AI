from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    profile = relationship("StudentProfile", back_populates="user", uselist=False)
    skills = relationship("StudentSkill", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="user", cascade="all, delete-orphan")
    resume_analyses = relationship("ResumeAnalysis", back_populates="user", cascade="all, delete-orphan")
    skill_gap_analyses = relationship("SkillGapAnalysis", back_populates="user", cascade="all, delete-orphan")
    roadmap = relationship("Roadmap", back_populates="user", uselist=False, cascade="all, delete-orphan")
    assessment_attempts = relationship("AssessmentAttempt", back_populates="user", cascade="all, delete-orphan")
    communication_practices = relationship("CommunicationPractice", back_populates="user", cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    college = Column(String)
    branch = Column(String)
    year_of_study = Column(Integer)
    cgpa = Column(Float)
    target_role_id = Column(Integer, ForeignKey("job_roles.id"), nullable=True)
    linkedin_url = Column(String)
    github_url = Column(String)
    phone = Column(String)
    bio = Column(Text)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="profile")
    target_role = relationship("JobRole")


class JobRole(Base):
    __tablename__ = "job_roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)

    skill_requirements = relationship("RoleSkillRequirement", back_populates="role", cascade="all, delete-orphan")


class RoleSkillRequirement(Base):
    __tablename__ = "role_skill_requirements"
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("job_roles.id"), nullable=False)
    skill_name = Column(String, nullable=False)
    required_level = Column(Integer, nullable=False)
    category = Column(String, default="technical")

    role = relationship("JobRole", back_populates="skill_requirements")


class StudentSkill(Base):
    __tablename__ = "student_skills"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String, nullable=False)
    current_level = Column(Integer, nullable=False, default=1)
    source = Column(String, default="self_reported")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="skills")


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    technologies = Column(String)
    contribution = Column(Text)
    github_url = Column(String)
    status = Column(String, default="completed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="projects")


class Certification(Base):
    __tablename__ = "certifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    issuer = Column(String, nullable=False)
    issue_date = Column(String)
    credential_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="certifications")


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    extracted_text_length = Column(Integer, default=0)
    detected_skills = Column(JSON, default=list)
    suggestions = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="resume_analyses")


class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analyses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("job_roles.id"), nullable=False)
    readiness_score = Column(Float, default=0.0)
    gaps = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="skill_gap_analyses")
    role = relationship("JobRole")


class Roadmap(Base):
    __tablename__ = "roadmaps"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    role_id = Column(Integer, ForeignKey("job_roles.id"))
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    tasks = relationship("RoadmapTask", back_populates="roadmap", cascade="all, delete-orphan")
    user = relationship("User", back_populates="roadmap")


class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"
    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    skill = Column(String, nullable=False)
    objective = Column(String, nullable=False)
    activity = Column(Text, nullable=False)
    duration = Column(String)
    difficulty = Column(String, default="intermediate")
    priority = Column(String, default="medium")
    status = Column(String, default="pending")
    expected_outcome = Column(Text)

    roadmap = relationship("Roadmap", back_populates="tasks")


class CodingQuestion(Base):
    __tablename__ = "coding_questions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    language = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    category = Column(String, default="general")
    options = Column(JSON, nullable=False)
    correct_option = Column(Integer, nullable=False)
    explanation = Column(Text)


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    language = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    score_percent = Column(Float, default=0.0)
    answers = Column(JSON, default=dict)
    results = Column(JSON, default=list)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="assessment_attempts")


class CommunicationPractice(Base):
    __tablename__ = "communication_practices"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_type = Column(String)
    question = Column(Text, nullable=False)
    student_answer = Column(Text, nullable=False)
    feedback = Column(Text)
    score = Column(Integer, default=5)
    suggestions = Column(JSON, default=list)
    practiced_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="communication_practices")
