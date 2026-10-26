import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { DashboardSummary, SkillGapAnalysis } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  Target,
  BarChart3,
  Map,
  Code2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const summaryRes = await api.get<DashboardSummary>('/dashboard/summary');
      setSummary(summaryRes.data);

      try {
        const analysisRes = await api.get<SkillGapAnalysis>('/analysis/latest');
        setLatestAnalysis(analysisRes.data);
      } catch (err: any) {
        // No analysis yet is a normal initial state
        setLatestAnalysis(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load dashboard summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your career digital twin dashboard..." size="lg" />;
  }

  if (error && !summary) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  const chartData = latestAnalysis?.gaps.slice(0, 7).map((gap) => ({
    name: gap.skill_name.length > 12 ? gap.skill_name.substring(0, 10) + '..' : gap.skill_name,
    'Your Level': gap.current_level,
    'Required Level': gap.required_level,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.full_name || 'Student'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Target Role:{' '}
            <span className="font-semibold text-indigo-600">
              {summary?.target_role_name || 'None selected yet'}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/profile"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Update Profile
          </Link>
          <Link
            to="/skill-gap"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition space-x-1.5"
          >
            <span>Analyze Gaps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Readiness Score */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Career Readiness
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {summary?.readiness_score || 0}%
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Calculated against {summary?.target_role_name || 'target role'} requirements
            </p>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, summary?.readiness_score || 0)}%` }}
            />
          </div>
        </div>

        {/* Skill Gaps Identified */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Identified Gaps
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {summary?.skill_gaps_count || 0}
            </div>
            <p className="mt-1 text-xs text-amber-600 font-medium">
              {summary?.high_priority_gaps || 0} high priority need focus
            </p>
          </div>
          <Link
            to="/skill-gap"
            className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
          >
            <span>View breakdown</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Roadmap Progress */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Roadmap Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Map className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {summary?.roadmap_completion_pct || 0}%
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {summary?.roadmap_completed_tasks || 0} of {summary?.roadmap_total_tasks || 0} tasks completed
            </p>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, summary?.roadmap_completion_pct || 0)}%` }}
            />
          </div>
        </div>

        {/* Portfolio & Certs */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Profile Assets
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Skills Logged:</span>
              <span className="font-bold text-slate-900">{summary?.total_skills || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Projects:</span>
              <span className="font-bold text-slate-900">{summary?.projects_count || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Certifications:</span>
              <span className="font-bold text-slate-900">{summary?.certs_count || 0}</span>
            </div>
          </div>
          <Link
            to="/projects"
            className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
          >
            <span>Manage assets</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Charts & Quick Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skill Gap Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Current Skills vs Target Requirements
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Benchmark comparison on a 0–5 proficiency scale
              </p>
            </div>
            {latestAnalysis && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {latestAnalysis.role_name}
              </span>
            )}
          </div>

          {chartData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Your Level" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Required Level" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl">
              <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No skill gap analysis yet</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Select your target job role in your profile, then run an analysis to view your benchmark chart.
              </p>
              <Link
                to="/target-role"
                className="mt-4 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
              >
                Select Target Role
              </Link>
            </div>
          )}
        </div>

        {/* Quick Launch & Next Actions */}
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Recommended Next Steps</h3>
            <div className="space-y-3">
              <Link
                to="/target-role"
                className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition border border-slate-100"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Set Target Role</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Align your learning path with a specific industry benchmark.
                  </p>
                </div>
              </Link>

              <Link
                to="/resume"
                className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition border border-slate-100"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Upload Resume PDF</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Extract skill keywords directly from your current resume.
                  </p>
                </div>
              </Link>

              <Link
                to="/assessment"
                className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition border border-slate-100"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Test Your Coding Skills</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Take a timed assessment in Java, Python, or DSA fundamentals.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Career Readiness Note
            </h4>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Readiness scores reflect alignment between your logged competencies and job benchmarks. They are diagnostic indicators to guide your study focus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
