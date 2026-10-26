"""
Communication practice feedback service.
Rule-based evaluation — no external AI required.
"""
from typing import List, Tuple
import re

MIN_WORDS = 40
GOOD_WORDS = 100


def _word_count(text: str) -> int:
    return len(text.split())


def _has_specific_example(text: str) -> bool:
    """Check for signals that the student gave a concrete example."""
    signals = [
        r"\bwhen\b", r"\bduring\b", r"\bin my project\b",
        r"\bfor example\b", r"\bspecifically\b",
        r"\bI (built|developed|created|implemented|solved|fixed|led|worked)\b",
        r"\bresult(ed|ing)?\b", r"\bachiev(ed|ing)\b",
        r"\bimproved\b", r"\breduced\b", r"\bincreased\b",
    ]
    tl = text.lower()
    return any(re.search(p, tl) for p in signals)


def _has_structure(text: str) -> bool:
    """Check if response has a beginning-middle-end or STAR structure."""
    tl = text.lower()
    structural = [
        "first", "then", "finally", "as a result", "in conclusion",
        "to summarise", "situation", "task", "action", "result",
        "my role", "the outcome", "what i learned",
    ]
    return sum(1 for s in structural if s in tl) >= 2


def evaluate_answer(question: str, answer: str, question_type: str) -> Tuple[int, str, List[str]]:
    """
    Returns (score 1-10, feedback_paragraph, suggestions_list).
    """
    words = _word_count(answer)
    has_example = _has_specific_example(answer)
    has_structure = _has_structure(answer)

    # Base score
    score = 5

    # Length scoring
    if words < 20:
        score -= 3
    elif words < MIN_WORDS:
        score -= 1
    elif words > GOOD_WORDS:
        score += 1

    # Content quality
    if has_example:
        score += 2
    if has_structure:
        score += 1

    # Clamp
    score = max(1, min(10, score))

    # Build feedback
    feedback_parts = []

    if words < 20:
        feedback_parts.append(
            "Your response is very brief. Interviewers expect a detailed, structured answer."
        )
    elif words < MIN_WORDS:
        feedback_parts.append(
            "Your answer is a bit short. Try to elaborate with specific details or examples."
        )
    else:
        feedback_parts.append("Good length — you provided enough detail to work with.")

    if has_example:
        feedback_parts.append(
            "You included a concrete example, which is exactly what interviewers look for."
        )
    else:
        feedback_parts.append(
            "Your answer would be stronger with a specific real example from your experience."
        )

    if has_structure:
        feedback_parts.append("Your response has a clear structure, which improves readability.")
    else:
        feedback_parts.append(
            "Try organising your answer with a clear beginning, middle, and conclusion."
        )

    feedback = " ".join(feedback_parts)

    # Build suggestions
    suggestions: List[str] = []
    if words < MIN_WORDS:
        suggestions.append("Expand your answer to at least 60–80 words.")
    if not has_example:
        if question_type in ("situation", "hr"):
            suggestions.append(
                "Use the STAR method: describe the Situation, your Task, the Action you took, and the Result."
            )
        else:
            suggestions.append("Include a specific example or project to support your point.")
    if not has_structure:
        suggestions.append(
            "Structure your answer: start with a brief context, describe your actions, and end with the outcome."
        )

    # Type-specific tips
    if question_type == "intro":
        if "project" not in answer.lower():
            suggestions.append(
                "Mention at least one notable project to make your introduction memorable."
            )
    elif question_type == "technical":
        if len(re.findall(r"\b(because|since|which means|this allows)\b", answer.lower())) == 0:
            suggestions.append(
                "Explain the 'why' behind concepts — this shows deeper understanding."
            )
    elif question_type == "hr":
        if "company" not in answer.lower() and "role" not in answer.lower():
            suggestions.append(
                "Connect your answer specifically to the company or role you are applying to."
            )

    if not suggestions:
        suggestions.append("Well done. Practise delivering this answer aloud to improve fluency.")

    return score, feedback, suggestions
