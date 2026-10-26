export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  full_name: string;
  email: string;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  college?: string;
  branch?: string;
  year_of_study?: number;
  cgpa?: number;
  target_role_id?: number;
  target_role_name?: string;
  linkedin_url?: string;
  github_url?: string;
  phone?: string;
  bio?: string;
}

export interface ProfileUpdatePayload {
  college?: string;
  branch?: string;
  year_of_study?: number;
  cgpa?: number;
  target_role_id?: number;
  linkedin_url?: string;
  github_url?: string;
  phone?: string;
  bio?: string;
}

export interface StudentSkill {
  id: number;
  skill_name: string;
  current_level: number;
  source: string;
  updated_at?: string;
}

export interface SkillIn {
  skill_name: string;
  current_level: number;
  source?: string;
}

export interface RoleSkillRequirement {
  skill_name: string;
  required_level: number;
  category: string;
}

export interface JobRole {
  id: number;
  name: string;
  description?: string;
  skill_requirements: RoleSkillRequirement[];
}

export interface SkillGapResult {
  skill_name: string;
  required_level: number;
  current_level: number;
  gap: number;
  priority: 'high' | 'medium' | 'low' | 'none';
  category: string;
  action: string;
}

export interface SkillGapAnalysis {
  id: number;
  role_id: number;
  role_name: string;
  readiness_score: number;
  gaps: SkillGapResult[];
  created_at?: string;
}

export interface RoadmapTask {
  id: number;
  week_number: number;
  skill: string;
  objective: string;
  activity: string;
  duration?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  expected_outcome?: string;
}

export interface Roadmap {
  id: number;
  role_id?: number;
  generated_at?: string;
  tasks: RoadmapTask[];
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  technologies?: string;
  contribution?: string;
  github_url?: string;
  status: string;
  created_at?: string;
}

export interface ProjectPayload {
  title: string;
  description?: string;
  technologies?: string;
  contribution?: string;
  github_url?: string;
  status?: string;
}

export interface Certification {
  id: number;
  name: string;
  issuer: string;
  issue_date?: string;
  credential_url?: string;
  created_at?: string;
}

export interface CertificationPayload {
  name: string;
  issuer: string;
  issue_date?: string;
  credential_url?: string;
}

export interface CodingQuestion {
  id: number;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  category: string;
  options: string[];
}

export interface QuestionResult {
  question_id: number;
  question_title: string;
  your_answer: number;
  correct_answer: number;
  is_correct: boolean;
  explanation: string;
}

export interface AssessmentResult {
  score_percent: number;
  correct_answers: number;
  total_questions: number;
  results: QuestionResult[];
  completed_at?: string;
}

export interface AssessmentAttempt {
  id: number;
  language: string;
  difficulty: string;
  total_questions: number;
  correct_answers: number;
  score_percent: number;
  completed_at?: string;
}

export interface CommunicationQuestion {
  id: number;
  question_type: string;
  question: string;
}

export interface CommunicationResult {
  feedback: string;
  score: number;
  suggestions: string[];
}

export interface CommunicationPractice {
  id: number;
  question_type: string;
  question: string;
  student_answer: string;
  feedback?: string;
  score: number;
  suggestions?: string[];
  practiced_at?: string;
}

export interface ResumeAnalysis {
  id: number;
  filename: string;
  detected_skills: string[];
  suggestions: string[];
  created_at?: string;
}

export interface DashboardSummary {
  readiness_score: number;
  total_skills: number;
  skill_gaps_count: number;
  high_priority_gaps: number;
  projects_count: number;
  certs_count: number;
  assessments_count: number;
  roadmap_total_tasks: number;
  roadmap_completed_tasks: number;
  roadmap_completion_pct: number;
  target_role_name?: string;
  has_resume: boolean;
}
