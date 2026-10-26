"""
Resume PDF parsing service.
Extracts text from uploaded PDFs and identifies skill keywords.
"""
import io
from typing import List, Tuple

SKILL_KEYWORDS: List[str] = [
    "python", "java", "javascript", "typescript", "c++", "c#", "kotlin", "swift",
    "golang", "rust", "php", "ruby", "scala",
    "react", "react.js", "angular", "vue", "vue.js", "svelte", "next.js", "nuxt",
    "node.js", "express", "django", "fastapi", "flask", "spring", "spring boot",
    "html", "html5", "css", "css3", "tailwind", "bootstrap", "sass",
    "sql", "mysql", "postgresql", "mongodb", "sqlite", "redis", "elasticsearch",
    "oracle", "firebase", "supabase",
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
    "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn", "opencv",
    "nlp", "natural language processing", "computer vision",
    "docker", "kubernetes", "aws", "azure", "gcp", "google cloud", "linux",
    "git", "github", "gitlab", "ci/cd", "jenkins", "devops", "terraform",
    "rest api", "graphql", "microservices", "agile", "scrum", "jira",
    "data structures", "algorithms", "oop", "design patterns", "solid",
    "excel", "power bi", "tableau", "statistics", "data visualization",
    "android", "ios", "react native", "flutter",
    "selenium", "jest", "junit", "pytest", "unit testing",
    "networking", "cloud computing", "security", "cybersecurity",
    "matlab", "r programming",
]

DISPLAY_NAMES: dict = {
    "react.js": "React.js",
    "vue.js": "Vue.js",
    "next.js": "Next.js",
    "node.js": "Node.js",
    "html5": "HTML5",
    "css3": "CSS3",
    "c++": "C++",
    "c#": "C#",
    "gcp": "GCP",
    "aws": "AWS",
    "ci/cd": "CI/CD",
    "rest api": "REST APIs",
    "nlp": "NLP",
    "oop": "OOP",
    "solid": "SOLID Principles",
    "r programming": "R",
    "scikit-learn": "Scikit-Learn",
    "power bi": "Power BI",
}


def _display(skill: str) -> str:
    if skill in DISPLAY_NAMES:
        return DISPLAY_NAMES[skill]
    # Title-case short names; keep long phrases as-is with title case
    return skill.title()


def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, bool]:
    """
    Returns (extracted_text, success).
    success=False if pdfplumber fails or text is too short to be useful.
    """
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages_text = []
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    pages_text.append(t)
        text = "\n".join(pages_text).strip()
        if len(text) < 30:
            return text, False
        return text, True
    except Exception:
        return "", False


def detect_skills(text: str) -> List[str]:
    """Return a deduplicated list of recognised skill keywords found in the text."""
    text_lower = text.lower()
    found: List[str] = []
    seen: set = set()
    for skill in SKILL_KEYWORDS:
        if skill in text_lower and skill not in seen:
            seen.add(skill)
            found.append(_display(skill))
    return found


def generate_suggestions(detected_skills: List[str], role_skills: List[str]) -> List[str]:
    """Generate improvement suggestions for the resume."""
    suggestions: List[str] = []

    detected_lower = {s.lower() for s in detected_skills}
    missing = [s for s in role_skills if s.lower() not in detected_lower]

    if missing:
        listed = ", ".join(missing[:5])
        suggestions.append(
            f"Your target role requires skills not prominently mentioned in your resume: {listed}. "
            "If you have experience with these, add them explicitly."
        )

    if len(detected_skills) < 5:
        suggestions.append(
            "Your resume mentions very few recognisable technical skills. "
            "Add a dedicated 'Skills' section listing all relevant technologies."
        )

    suggestions.append(
        "Use quantified achievements where possible — for example, "
        "'Reduced page load time by 40%' is stronger than 'Improved performance'."
    )
    suggestions.append(
        "Each project entry should clearly state your individual contribution "
        "and the specific technologies you used."
    )
    suggestions.append(
        "Ensure your resume is ATS-friendly: use standard section headings "
        "(Education, Experience, Skills, Projects) and avoid tables or images for key content."
    )

    return suggestions
