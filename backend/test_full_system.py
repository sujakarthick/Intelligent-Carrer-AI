import os
import sys
import tempfile
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.database import Base, engine, SessionLocal
from app import seed

def run_tests():
    print("=" * 60)
    print("SKILLTWIN AI — COMPREHENSIVE FULL-STACK API VERIFICATION")
    print("=" * 60)

    # Initialize tables and seed
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed.seed_database(db)
    db.close()

    client = TestClient(app)

    # Test Root & Health
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.text}"
    print("[PASS] Root API endpoint operational")

    # TEST 1: Registration
    student1_email = "suja.test@college.edu"
    student1_pass = "SecurePass123!"
    r = client.post("/api/auth/register", json={
        "full_name": "Suja K",
        "email": student1_email,
        "password": student1_pass,
    })
    if r.status_code == 409:
        # Already exists, login
        r = client.post("/api/auth/login", json={
            "email": student1_email,
            "password": student1_pass,
        })
    assert r.status_code in (200, 201), f"Registration/login failed: {r.text}"
    data1 = r.json()
    token1 = data1["access_token"]
    user1_id = data1["user_id"]
    headers1 = {"Authorization": f"Bearer {token1}"}
    print(f"[PASS] Test 1: Student registration & token generation succeeded (User ID: {user1_id})")

    # TEST 2: Login verification
    r = client.post("/api/auth/login", json={
        "email": student1_email,
        "password": student1_pass,
    })
    assert r.status_code == 200, f"Login failed: {r.text}"
    assert "access_token" in r.json()
    print("[PASS] Test 2: Login authentication & JWT validation verified")

    # Check Me
    r = client.get("/api/auth/me", headers=headers1)
    assert r.status_code == 200 and r.json()["email"] == student1_email
    print(f"[PASS] Current user verification: {r.json()['full_name']}")

    # Check Roles list
    r = client.get("/api/roles", headers=headers1)
    assert r.status_code == 200
    roles = r.json()
    assert len(roles) >= 8, f"Expected 8+ roles, got {len(roles)}"
    java_role = next((r for r in roles if r["name"] == "Java Developer"), roles[0])
    target_role_id = java_role["id"]
    print(f"[PASS] Job roles verified ({len(roles)} available, selecting '{java_role['name']}' with ID {target_role_id})")

    # TEST 3: Profile & Technical Skills
    r = client.put("/api/profile", headers=headers1, json={
        "college": "PSG College of Technology",
        "branch": "Computer Science & Business Systems",
        "year_of_study": 4,
        "cgpa": 8.75,
        "target_role_id": target_role_id,
        "phone": "+91 9876543210",
        "bio": "Final year student targeting enterprise backend developer roles.",
    })
    assert r.status_code == 200, f"Profile update failed: {r.text}"
    p_data = r.json()
    assert p_data["target_role_id"] == target_role_id
    assert p_data["college"] == "PSG College of Technology"
    print("[PASS] Test 3A: Student profile updated and persistent in database")

    # Add technical skills (e.g. Java level 2, SQL level 2, Git level 2)
    skills_payload = [
        {"skill_name": "Java", "current_level": 2, "source": "self_reported"},
        {"skill_name": "SQL", "current_level": 2, "source": "self_reported"},
        {"skill_name": "Git", "current_level": 2, "source": "self_reported"},
        {"skill_name": "OOP Concepts", "current_level": 3, "source": "self_reported"},
    ]
    r = client.put("/api/skills", headers=headers1, json={"skills": skills_payload})
    assert r.status_code == 200, f"Skills update failed: {r.text}"
    saved_skills = r.json()
    assert len(saved_skills) == 4
    print(f"[PASS] Test 3B: Student skills logged ({len(saved_skills)} skills recorded)")

    # TEST 4: Skill-Gap Analysis
    r = client.post("/api/analysis/skill-gaps", headers=headers1)
    assert r.status_code == 200, f"Skill gap analysis failed: {r.text}"
    analysis = r.json()
    assert "readiness_score" in analysis
    assert "gaps" in analysis
    gaps = analysis["gaps"]
    # Verify calculation: Java requires level 4, student has 2, gap should be 2 (medium)
    java_gap = next((g for g in gaps if g["skill_name"] == "Java"), None)
    assert java_gap is not None, "Java gap not found"
    assert java_gap["gap"] == 2, f"Expected gap of 2, got {java_gap['gap']}"
    assert java_gap["priority"] == "medium"

    # Verify Spring Boot gap: required 3, student has 0, gap should be 3 (high)
    spring_gap = next((g for g in gaps if g["skill_name"] == "Spring Boot"), None)
    assert spring_gap is not None, "Spring Boot gap not found"
    assert spring_gap["gap"] == 3, f"Expected Spring Boot gap of 3, got {spring_gap['gap']}"
    assert spring_gap["priority"] == "high"
    print(f"[PASS] Test 4: Skill-gap analysis calculations verified (Readiness score: {analysis['readiness_score']}%, {len(gaps)} competencies evaluated)")

    # TEST 5: Learning Roadmap Generation
    r = client.post("/api/roadmap/generate", headers=headers1)
    assert r.status_code == 201, f"Roadmap generation failed: {r.text}"
    roadmap = r.json()
    tasks = roadmap["tasks"]
    assert len(tasks) > 0, "No tasks generated"
    assert any(t["week_number"] == 1 for t in tasks)
    print(f"[PASS] Test 5: 4-week roadmap generated ({len(tasks)} personalized learning tasks created)")

    # TEST 6: Persistence of Task Updates
    first_task = tasks[0]
    task_id = first_task["id"]
    r = client.patch(f"/api/roadmap/tasks/{task_id}", headers=headers1, json={"status": "completed"})
    assert r.status_code == 200, f"Task update failed: {r.text}"
    assert r.json()["status"] == "completed"

    # Verify after querying roadmap again
    r = client.get("/api/roadmap", headers=headers1)
    assert r.status_code == 200
    refetched_task = next(t for t in r.json()["tasks"] if t["id"] == task_id)
    assert refetched_task["status"] == "completed"
    print(f"[PASS] Test 6: Roadmap task completion persisted in database (Task #{task_id} completed)")

    # TEST 7: Coding Assessment Submission
    r = client.get("/api/assessments?language=java&difficulty=beginner", headers=headers1)
    assert r.status_code == 200, f"Get assessments failed: {r.text}"
    questions = r.json()
    assert len(questions) > 0
    # Answers map: {question_id: chosen_option}
    # Pick answer 0 for all questions
    answers_map = {q["id"]: 2 for q in questions} # option 2 for each
    r = client.post("/api/assessments/submit", headers=headers1, json={
        "language": "java",
        "difficulty": "beginner",
        "answers": answers_map
    })
    assert r.status_code == 201, f"Assessment submission failed: {r.text}"
    test_res = r.json()
    assert "score_percent" in test_res
    assert "correct_answers" in test_res
    print(f"[PASS] Test 7: Coding assessment evaluated and logged (Score: {test_res['score_percent']}%, {test_res['correct_answers']}/{test_res['total_questions']} correct)")

    # TEST 8: Resume Analysis
    real_resume_path = r"C:\Users\sujak\Downloads\Suja_K_Resume.pdf"
    if os.path.exists(real_resume_path):
        with open(real_resume_path, "rb") as f:
            r = client.post("/api/resume/upload", headers=headers1, files={"file": ("Suja_K_Resume.pdf", f, "application/pdf")})
        assert r.status_code == 201, f"Resume upload failed: {r.text}"
        res_data = r.json()
        print(f"[PASS] Test 8: Real student resume PDF parsed successfully! Detected skills: {res_data['detected_skills']}")
    else:
        print("[SKIP] Test 8: Sample PDF path not found, testing invalid extension rejection")
        r = client.post("/api/resume/upload", headers=headers1, files={"file": ("test.txt", b"plain text", "text/plain")})
        assert r.status_code == 400

    # TEST 9: CRUD Operations (Projects & Certifications)
    # Create project
    r = client.post("/api/projects", headers=headers1, json={
        "title": "SkillTwin AI Career Platform",
        "description": "Full-stack intelligent digital twin for CS students",
        "technologies": "FastAPI, React, SQLite, Tailwind CSS",
        "contribution": "Designed full architecture and skill-gap engine",
        "github_url": "https://github.com/sujak/skilltwin-ai",
        "status": "completed",
    })
    assert r.status_code == 201
    proj_id = r.json()["id"]

    # Update project
    r = client.put(f"/api/projects/{proj_id}", headers=headers1, json={
        "title": "SkillTwin AI Platform (Updated)",
        "status": "completed",
    })
    assert r.status_code == 200 and r.json()["title"] == "SkillTwin AI Platform (Updated)"

    # Create cert
    r = client.post("/api/certifications", headers=headers1, json={
        "name": "AWS Certified Cloud Practitioner",
        "issuer": "Amazon Web Services",
        "issue_date": "2026-05-15",
        "credential_url": "https://aws.amazon.com/verify/12345",
    })
    assert r.status_code == 201
    cert_id = r.json()["id"]

    # Update cert
    r = client.put(f"/api/certifications/{cert_id}", headers=headers1, json={
        "name": "AWS Certified Cloud Practitioner (Verified)",
        "issuer": "Amazon Web Services",
    })
    assert r.status_code == 200

    print(f"[PASS] Test 9A: Project & Certification CREATE and UPDATE operations verified (Project #{proj_id}, Cert #{cert_id})")

    # TEST 10: Dashboard Summary Aggregation
    r = client.get("/api/dashboard/summary", headers=headers1)
    assert r.status_code == 200
    summary = r.json()
    assert summary["projects_count"] >= 1
    assert summary["certs_count"] >= 1
    assert summary["total_skills"] == 4
    assert summary["readiness_score"] == analysis["readiness_score"]
    assert summary["target_role_name"] == java_role["name"]
    print(f"[PASS] Test 10: Dashboard summary accurately aggregates database assets (Readiness: {summary['readiness_score']}%, Skills: {summary['total_skills']}, Projects: {summary['projects_count']})")

    # TEST 11: Security & User Isolation
    # Register a second student
    r = client.post("/api/auth/register", json={
        "full_name": "Other Student",
        "email": "other.student@college.edu",
        "password": "Password456!",
    })
    if r.status_code == 409:
        r = client.post("/api/auth/login", json={"email": "other.student@college.edu", "password": "Password456!"})
    token2 = r.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # Student 2 should NOT see Student 1's projects
    r = client.get("/api/projects", headers=headers2)
    assert r.status_code == 200
    assert len(r.json()) == 0, f"Expected 0 projects for student 2, got {len(r.json())}"

    # Student 2 should NOT be able to update Student 1's project
    r = client.put(f"/api/projects/{proj_id}", headers=headers2, json={"title": "Hacked Title"})
    assert r.status_code == 404, f"Security violation: Student 2 modified Student 1's project! Status: {r.status_code}"

    # Student 2 should NOT be able to delete Student 1's project
    r = client.delete(f"/api/projects/{proj_id}", headers=headers2)
    assert r.status_code == 404, f"Security violation: Student 2 deleted Student 1's project! Status: {r.status_code}"
    print("[PASS] Test 11: Multi-tenant security & user isolation verified (Student 2 cannot read or modify Student 1's records)")

    # Delete project for Student 1 to test DELETE CRUD
    r = client.delete(f"/api/projects/{proj_id}", headers=headers1)
    assert r.status_code == 204
    print("[PASS] Test 9B: Project DELETE verified")

    # TEST 12: Communication Practice
    r = client.post("/api/communication/submit", headers=headers1, json={
        "question": "Tell me about yourself.",
        "question_type": "intro",
        "answer": "I am a final-year Computer Science student at PSG College. In my recent project, I built a microservices backend with FastAPI. Specifically, I implemented the authentication layer and reduced query latency by 35%. As a result, our team won the departmental hackathon.",
    })
    assert r.status_code == 201
    comm_res = r.json()
    assert comm_res["score"] >= 7
    print(f"[PASS] Test 12: Communication evaluation engine tested (Score: {comm_res['score']}/10, Feedback: {comm_res['feedback'][:60]}...)")

    print("=" * 60)
    print("ALL 13 SYSTEM INTEGRATION TESTS PASSED CLEANLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
