"""
Roadmap generation service.
Generates a 4-week personalised learning plan from skill gap data.
"""
from typing import List, Dict, Any

WEEK_PLAN = {
    "high": [1, 2],    # high-priority gaps go in weeks 1 and 2
    "medium": [2, 3],  # medium in weeks 2 and 3
    "low": [4],        # low in week 4
    "none": [],        # already met — skip
}

DIFFICULTY_MAP = {1: "beginner", 2: "beginner", 3: "intermediate", 4: "advanced", 5: "advanced"}

ACTIVITY_MAP: Dict[str, str] = {
    "java": (
        "Work through Java exercises on HackerRank. "
        "Build a Student Management System using Java classes, inheritance, and interfaces."
    ),
    "python": (
        "Complete Python exercises on LeetCode (easy level). "
        "Automate a daily task (file organiser or web scraper) to practise real-world usage."
    ),
    "data structures": (
        "Implement LinkedList, Stack, and BST from scratch. "
        "Solve 10 LeetCode easy array/string problems."
    ),
    "sql": (
        "Practise SQL queries on SQLZoo and Mode Analytics. "
        "Write JOINs, subqueries, and GROUP BY queries on a sample dataset."
    ),
    "rest": (
        "Build a simple REST API in your preferred language. "
        "Test with Postman. Study HTTP methods, status codes, and JSON."
    ),
    "git": (
        "Create a GitHub repository. Practise branching, merging, and resolving conflicts. "
        "Try rebasing and cherry-picking on a local test repo."
    ),
    "machine learning": (
        "Enter a Kaggle beginner competition (Titanic). "
        "Implement Linear Regression and Decision Tree using scikit-learn."
    ),
    "deep learning": (
        "Build an image classifier on MNIST using Keras/TensorFlow. "
        "Study backpropagation, activation functions, and batch normalisation."
    ),
    "statistics": (
        "Review probability, hypothesis testing, and correlation. "
        "Apply statistical analysis to a real dataset using Python/pandas."
    ),
    "react": (
        "Build a To-Do app in React using useState and useEffect. "
        "Add React Router for navigation and deploy to Vercel or GitHub Pages."
    ),
    "node": (
        "Build a simple Express.js REST server. "
        "Add authentication middleware and connect to a SQLite or MongoDB database."
    ),
    "spring": (
        "Build a CRUD REST API with Spring Boot and JPA. "
        "Connect to H2 in-memory database and test all endpoints with Postman."
    ),
    "cloud": (
        "Set up a free AWS/GCP account. Deploy a web app to EC2 or App Engine. "
        "Review IAM roles and S3 storage basics."
    ),
    "docker": (
        "Containerise a web application with Docker. Write a Dockerfile, build the image, "
        "and run it locally. Study Kubernetes Pod and Deployment concepts."
    ),
    "javascript": (
        "Practise DOM manipulation and ES6+ features. Build a browser-based quiz app. "
        "Explore async/await and Promises with real API calls."
    ),
    "html": (
        "Build a responsive personal portfolio page using semantic HTML5 and CSS Flexbox/Grid. "
        "Validate it with the W3C validator."
    ),
    "oop": (
        "Implement classic OOP patterns (Factory, Singleton, Observer) in your chosen language. "
        "Build a mini Library Management System to apply all four pillars."
    ),
    "problem solving": (
        "Solve one LeetCode or HackerRank problem daily. "
        "Focus on pattern recognition: sliding window, two pointers, and recursion."
    ),
    "communication": (
        "Practise answering HR and technical interview questions aloud or in writing daily. "
        "Record yourself and review clarity and conciseness."
    ),
    "excel": (
        "Learn VLOOKUP, pivot tables, and conditional formatting. "
        "Analyse a public dataset (e.g., government open data) and summarise findings."
    ),
    "data visualization": (
        "Build charts (bar, line, scatter, heatmap) using Matplotlib and Seaborn in Python. "
        "Recreate a real-world infographic from public data."
    ),
    "linux": (
        "Set up WSL2 (Windows Subsystem for Linux) or a Linux VM. "
        "Practise file management, permissions, shell scripting, and cron jobs."
    ),
    "networking": (
        "Study OSI model, TCP/IP, DNS, and HTTP/HTTPS. "
        "Use Wireshark to capture and inspect network packets on your local machine."
    ),
    "security": (
        "Study OWASP Top 10 vulnerabilities. "
        "Learn about SQL injection, XSS, and how HTTPS works. Set up HTTPS locally with a self-signed cert."
    ),
}

DEFAULT_ACTIVITY = (
    "Research the best learning resources (official docs, YouTube, Udemy courses) for this skill. "
    "Set a daily 30-minute practice goal and build a small project using this skill within the week."
)


def _get_activity(skill_name: str) -> str:
    key = skill_name.lower()
    for keyword, activity in ACTIVITY_MAP.items():
        if keyword in key:
            return activity
    return DEFAULT_ACTIVITY


def _get_expected_outcome(skill_name: str, required_level: int) -> str:
    level_label = DIFFICULTY_MAP.get(required_level, "intermediate")
    return (
        f"Achieve a solid {level_label}-level understanding of {skill_name}. "
        f"Be able to explain core concepts and apply them in a small project or exercise."
    )


def generate_roadmap_tasks(gaps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Convert a list of skill gaps into roadmap tasks spread across 4 weeks.
    Tasks for already-met skills are not included.
    """
    tasks: List[Dict[str, Any]] = []

    # Separate by priority
    buckets: Dict[str, List[Dict[str, Any]]] = {
        "high": [],
        "medium": [],
        "low": [],
    }
    for gap in gaps:
        p = gap.get("priority", "none")
        if p in buckets:
            buckets[p].append(gap)

    # Assign week numbers
    week_assignments: List[tuple] = []  # (week, gap)

    # High priority: week 1 (first half) and week 2 (overflow)
    for i, gap in enumerate(buckets["high"]):
        week = 1 if i < 3 else 2
        week_assignments.append((week, gap))

    # Medium priority: week 2 and week 3
    for i, gap in enumerate(buckets["medium"]):
        week = 2 if i < 2 else 3
        week_assignments.append((week, gap))

    # Low priority: week 4
    for gap in buckets["low"]:
        week_assignments.append((4, gap))

    # If we have nothing at all, return empty
    if not week_assignments:
        return []

    # Build task objects
    for week, gap in week_assignments:
        req_level = gap["required_level"]
        difficulty = DIFFICULTY_MAP.get(req_level, "intermediate")
        duration_hours = {1: "2 hours", 2: "3 hours", 3: "4 hours", 4: "5 hours", 5: "6 hours"}.get(req_level, "3 hours")

        tasks.append(
            {
                "week_number": week,
                "skill": gap["skill_name"],
                "objective": f"Reach level {req_level}/5 in {gap['skill_name']}",
                "activity": _get_activity(gap["skill_name"]),
                "duration": f"{duration_hours} per day",
                "difficulty": difficulty,
                "priority": gap["priority"],
                "status": "pending",
                "expected_outcome": _get_expected_outcome(gap["skill_name"], req_level),
            }
        )

    # Sort by week number, then priority
    priority_order = {"high": 0, "medium": 1, "low": 2}
    tasks.sort(key=lambda t: (t["week_number"], priority_order.get(t["priority"], 3)))

    return tasks
