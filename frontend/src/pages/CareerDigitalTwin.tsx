import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  StudentProfile,
  StudentSkill,
  SkillGapAnalysis,
  Project,
  Certification,
  ResumeAnalysis,
  AssessmentAttempt,
  CommunicationPractice,
} from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  Cpu,
  TrendingUp,
  AlertTriangle,
  FileText,
  Code2,
  MessageSquare,
  Award,
  FolderGit2,
  RefreshCw,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const CareerDigitalTwin: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [resumes, setResumes] = useState<ResumeAnalysis[]>([]);
  const [assessments, setAssessments] = useState<AssessmentAttempt[]>([]);
  const [practices, setPractices] = useState<CommunicationPractice[]>([]);

  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTwinData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, sRes, prRes, cRes, rRes, aRes, cpRes] = await Promise.all([
        api.get<StudentProfile>('/profile'),
        api.get<StudentSkill[]>('/skills'),
        api.get<Project[]>('/projects'),
        api.get<Certification[]>('/certifications'),
        api.get<ResumeAnalysis[]>('/resume/history'),
        api.get<AssessmentAttempt[]>('/assessments/history'),
        api.get<CommunicationPractice[]>('/communication/history'),
      ]);

      setProfile(pRes.data);
      setSkills(sRes.data);
      setProjects(prRes.data);
      setCerts(cRes.data);
      setResumes(rRes.data);
      setAssessments(aRes.data);
      setPractices(cpRes.data);

      try {
        const anRes = await api.get<SkillGapAnalysis>('/analysis/latest');
        setAnalysis(anRes.data);
      } catch (err) {
        setAnalysis(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load career twin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTwinData();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    setError(null);
    try {
      const res = await api.post<SkillGapAnalysis>('/analysis/skill-gaps');
      setAnalysis(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to recalculate twin analytics.');
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Constructing your Career Digital Twin snapshot..." size="lg" />;
  }

  const latestResume = resumes.length > 0 ? resumes[0] : null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold uppercase tracking-wider mb-1">
              <span>Active Digital Twin</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{profile?.full_name}'s Career Twin</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Target Role:{' '}
              <span className="font-semibold text-indigo-200">
                {profile?.target_role_name || 'Not selected'}
              </span>
              {' · '}College: {profile?.college || 'Not set'}
            </p>
          </div>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-xs transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Recalculating...' : 'Recalculate Twin'}</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Readiness & Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Twin Readiness Score
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="my-4">
            <div className="text-4xl font-extrabold text-slate-900">
              {analysis?.readiness_score ?? 0}%
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Computed directly from your skills vs role requirements.
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, analysis?.readiness_score || 0)}%` }}
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Critical Gap Count
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-4">
            <div className="text-4xl font-extrabold text-slate-900">
              {analysis?.gaps.filter((g) => g.priority === 'high').length ?? 0}
            </div>
            <p className="mt-1 text-xs text-amber-600 font-medium">
              High priority gaps requiring prompt coursework or projects.
            </p>
          </div>
          <Link
            to="/skill-gap"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
          >
            <span>Inspect gap report</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Verified Assessments
            </span>
            <Code2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-4">
            <div className="text-4xl font-extrabold text-slate-900">
              {assessments.length}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Completed MCQ test sessions recorded in database.
            </p>
          </div>
          <Link
            to="/assessment"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
          >
            <span>Take new assessment</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Skills Matrix (Self-Reported vs Role Required) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Digital Twin Competency Registry
            </h2>
            <p className="text-xs text-slate-400">
              Self-reported skills vs target job requirements. Clearly labeled by source.
            </p>
          </div>
          <Link
            to="/profile"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Edit Skills
          </Link>
        </div>

        {skills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{skill.skill_name}</span>
                  <span className="text-xs font-semibold text-indigo-600">
                    {skill.current_level}/5
                  </span>
                </div>
                <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full"
                    style={{ width: `${(skill.current_level / 5) * 100}%` }}
                  />
                </div>
                <span className="mt-2 text-[10px] uppercase font-semibold text-slate-400">
                  {skill.source.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
            No technical skills entered yet. Head over to your profile to log them!
          </div>
        )}
      </div>

      {/* Resume Keywords vs Assessment Results Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resume Extracted Keywords */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <FileText className="w-4 h-4 text-violet-600" />
              <h3 className="text-sm font-bold text-slate-900">Extracted Resume Keywords</h3>
            </div>
            <Link to="/resume" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Upload / Scan
            </Link>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Extracted from PDF text parser. (Note: Keywords show presence in resume, not proof of proficiency).
          </p>

          {latestResume && latestResume.detected_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {latestResume.detected_skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-violet-50 text-violet-700 border border-violet-100"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-400 text-center">
              No parsed resume keywords available. Upload a PDF in the Resume Analyzer.
            </div>
          )}
        </div>

        {/* Coding & Communication History */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Assessment & Interview Activity</h3>
            </div>
            <Link to="/history" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Full History
            </Link>
          </div>

          <div className="space-y-3">
            {assessments.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-900 capitalize">
                    {a.language} ({a.difficulty})
                  </span>
                  <span className="block text-slate-400 text-[11px]">
                    {a.correct_answers}/{a.total_questions} correct
                  </span>
                </div>
                <span className="font-bold text-slate-800">{a.score_percent}%</span>
              </div>
            ))}

            {practices.slice(0, 2).map((cp) => (
              <div
                key={cp.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-900 capitalize">
                    Interview Practice ({cp.question_type})
                  </span>
                  <span className="block text-slate-400 text-[11px] truncate max-w-xs">
                    {cp.question}
                  </span>
                </div>
                <span className="font-bold text-indigo-600">{cp.score}/10</span>
              </div>
            ))}

            {assessments.length === 0 && practices.length === 0 && (
              <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-400 text-center">
                No assessments taken yet. Try a coding test or communication session!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
