"""
Skill-gap analysis service.
All calculations are deterministic and fully transparent.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from .. import models

# Priority thresholds (gap size → priority label)
HIGH_GAP = 3
MEDIUM_GAP = 2
LOW_GAP = 1

IMPROVEMENT_ACTIONS = {
    "high": (
        "This is a significant gap. Dedicate focused daily study sessions and "
        "work through structured courses. Build at least one hands-on project "
        "that uses this skill."
    ),
    "medium": (
        "You have some foundation here. Reinforce it by practising with real "
        "examples and applying the skill in a personal or academic project."
    ),
    "low": (
        "You're almost there. Review the core concepts, solve a few practice "
        "problems, and look for opportunities to apply this skill in context."
    ),
    "none": "Your current level meets this role's requirement. Keep practising to stay sharp.",
}

ROADMAP_ACTIVITIES: Dict[str, str] = {
    "Java": (
        "Work through Java exercises on HackerRank. Build a Student Management "
        "System using Java classes, inheritance, and interfaces."
    ),
    "Python": (
        "Complete Python exercises on LeetCode (easy level). Automate a daily task "
        "(e.g., file organiser or web scraper) to practise real-world usage."
    ),
    "Data Structures & Algorithms": (
        "Implement a Linked List, Binary Search Tree, and Stack from scratch. "
        "Solve 10 LeetCode easy problems focusing on arrays and strings."
    ),
    "SQL": (
        "Practice SQL queries on SQLZoo or Mode Analytics. Write JOINs, subqueries, "
        "and GROUP BY queries on a sample e-commerce dataset."
    ),
    "REST APIs": (
        "Build a simple REST API using your preferred language. Test it using "
        "Postman. Study HTTP methods, status codes, and JSON structure."
    ),
    "Git": (
        "Create a GitHub repository, practice branching, merging, and resolving "
        "merge conflicts. Review Git documentation for rebase and cherry-pick."
    ),
    "Machine Learning": (
        "Complete a Kaggle beginner competition (Titanic dataset). Implement "
        "Linear Regression and Decision Tree from scratch using NumPy."
    ),
    "Deep Learning": (
        "Build a simple image classifier using Keras/TensorFlow on the MNIST "
        "dataset. Study backpropagation, activation functions, and batch normalisation."
    ),
    "Statistics": (
        "Review probability, distributions, hypothesis testing, and correlation. "
        "Apply statistical concepts to analyse a real dataset using Python/pandas."
    ),
    "React.js": (
        "Build a To-Do or Notes application in React. Learn useState, useEffect, "
        "and React Router. Deploy it to GitHub Pages or Vercel."
    ),
    "Spring Boot": (
        "Build a simple CRUD REST API using Spring Boot and JPA. Connect it to "
        "an H2 in-memory database and test with Postman."
    ),
    "Cloud Platforms": (
        "Set up a free AWS/GCP account. Deploy a simple web application to EC2 "
        "or App Engine. Review IAM roles and S3 storage basics."
    ),
    "Docker/Kubernetes": (
        "Containerise a simple web application using Docker. Write a Dockerfile, "
        "build an image, and run it locally. Study basic Kubernetes concepts."
    ),
}

DEFAULT_ACTIVITY = (
    "Research best learning resources (official docs, YouTube, Udemy) for this skill. "
    "Set a daily 30-minute practice target and build a small project using this skill."
)


def _get_activity(skill_name: str) -> str:
    for key, activity in ROADMAP_ACTIVITIES.items():
        if key.lower() in skill_name.lower() or skill_name.lower() in key.lower():
            return activity
    return DEFAULT_ACTIVITY


def calculate_skill_gaps(
    user: models.User, role: models.JobRole
) -> Dict[str, Any]:
    """
    Returns a dict with:
      - readiness_score: 0–100 float (ratio of current levels to required levels)
      - gaps: list of gap dicts sorted by priority (high first)
    """
    student_skills: Dict[str, int] = {
        s.skill_name.lower(): s.current_level for s in user.skills
    }
    gaps: List[Dict[str, Any]] = []

    total_possible = 0
    total_current = 0

    for req in role.skill_requirements:
        current = student_skills.get(req.skill_name.lower(), 0)
        gap = max(0, req.required_level - current)

        total_possible += req.required_level
        total_current += min(current, req.required_level)

        if gap >= HIGH_GAP:
            priority = "high"
        elif gap >= MEDIUM_GAP:
            priority = "medium"
        elif gap >= LOW_GAP:
            priority = "low"
        else:
            priority = "none"

        gaps.append(
            {
                "skill_name": req.skill_name,
                "required_level": req.required_level,
                "current_level": current,
                "gap": gap,
                "priority": priority,
                "category": req.category or "technical",
                "action": IMPROVEMENT_ACTIONS[priority],
            }
        )

    readiness_score = (
        round((total_current / total_possible) * 100, 1) if total_possible > 0 else 0.0
    )

    priority_order = {"high": 0, "medium": 1, "low": 2, "none": 3}
    gaps.sort(key=lambda x: priority_order[x["priority"]])

    return {"readiness_score": readiness_score, "gaps": gaps}
