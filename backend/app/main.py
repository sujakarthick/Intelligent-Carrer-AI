from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

from .database import engine
from . import models
from .routers import (
    auth,
    profile,
    roles,
    skills,
    analysis,
    resume,
    roadmap,
    assessments,
    communication,
    projects,
    certifications,
    dashboard,
)
from . import seed

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SkillTwin AI",
    description="Career Digital Twin API for B.Tech Students",
    version="1.0.0",
)

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_ORIGIN,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    from .database import SessionLocal
    db = SessionLocal()
    try:
        seed.seed_database(db)
    finally:
        db.close()


# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profile.router, prefix="/api", tags=["Profile"])
app.include_router(roles.router, prefix="/api", tags=["Job Roles"])
app.include_router(skills.router, prefix="/api", tags=["Skills"])
app.include_router(analysis.router, prefix="/api", tags=["Skill Gap Analysis"])
app.include_router(resume.router, prefix="/api", tags=["Resume"])
app.include_router(roadmap.router, prefix="/api", tags=["Roadmap"])
app.include_router(assessments.router, prefix="/api", tags=["Assessments"])
app.include_router(communication.router, prefix="/api", tags=["Communication"])
app.include_router(projects.router, prefix="/api", tags=["Projects"])
app.include_router(certifications.router, prefix="/api", tags=["Certifications"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])


@app.get("/")
def root():
    return {"message": "SkillTwin AI API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
