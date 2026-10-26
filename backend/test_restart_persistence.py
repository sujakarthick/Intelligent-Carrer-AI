import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.database import SessionLocal
from app import models

def test_persistence():
    db = SessionLocal()
    try:
        user = db.query(models.User).filter_by(email="suja.test@college.edu").first()
        assert user is not None, "User not found after restart!"
        print(f"[PASS] User persisted: {user.full_name} ({user.email})")

        profile = user.profile
        assert profile is not None and profile.college == "PSG College of Technology"
        print(f"[PASS] Profile persisted: {profile.college}, CGPA: {profile.cgpa}")

        skills = user.skills
        assert len(skills) >= 4
        print(f"[PASS] Skills persisted: {len(skills)} skills found ({[s.skill_name for s in skills]})")

        roadmap = user.roadmap
        assert roadmap is not None and len(roadmap.tasks) > 0
        completed = [t for t in roadmap.tasks if t.status == "completed"]
        assert len(completed) >= 1
        print(f"[PASS] Roadmap persisted: {len(roadmap.tasks)} tasks total, {len(completed)} completed task preserved")

        print("=" * 60)
        print("DATABASE RESTART PERSISTENCE VERIFIED 100%!")
        print("=" * 60)
    finally:
        db.close()

if __name__ == "__main__":
    test_persistence()
