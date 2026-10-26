import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { SkillGapAnalysis } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { BarChart3, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp, Info } from 'lucide-react';
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

export const SkillGap: React.FC = () => {
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<SkillGapAnalysis>('/analysis/latest');
      setAnalysis(res.data);
    } catch (err: any) {
      // If 404, we just let user trigger analysis
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.post<SkillGapAnalysis>('/analysis/skill-gaps');
      setAnalysis(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Failed to run skill-gap analysis. Ensure you have selected a target role in your profile.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving skill-gap calculations..." size="lg" />;
  }

  const chartData = analysis?.gaps.map((g) => ({
    skill: g.skill_name.length > 14 ? g.skill_name.substring(0, 12) + '..' : g.skill_name,
    'Your Level': g.current_level,
    'Required Level': g.required_level,
    Gap: g.gap,
  })) || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <span>Deterministic Analysis Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Skill-Gap Analysis Report</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Target Role:{' '}
            <span className="font-semibold text-slate-800">
              {analysis?.role_name || 'Not Analyzed Yet'}
            </span>
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? 'Evaluating...' : 'Run New Analysis'}</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {analysis ? (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Career Readiness Index
              </span>
              <div className="mt-3 text-3xl font-extrabold text-indigo-600">
                {analysis.readiness_score}%
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Weighted percentage of required competencies currently met.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                High-Priority Gaps
              </span>
              <div className="mt-3 text-3xl font-extrabold text-rose-600">
                {analysis.gaps.filter((g) => g.priority === 'high').length}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Skills with a gap of 3 or more proficiency levels.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Skills Benchmark Met
              </span>
              <div className="mt-3 text-3xl font-extrabold text-emerald-600">
                {analysis.gaps.filter((g) => g.gap === 0).length}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Skills currently satisfying or exceeding benchmark criteria.
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-6">
              Skill Comparison Breakdown (Level 0–5)
            </h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="skill"
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    height={50}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Your Level" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Required Level" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skill Gaps Detail Table */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-6">
              Priority-Based Improvement Matrix
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Skill</th>
                    <th className="pb-3">Required</th>
                    <th className="pb-3">Current</th>
                    <th className="pb-3">Gap</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analysis.gaps.map((item, idx) => {
                    const priorityBadge = {
                      high: 'bg-rose-50 text-rose-700 border-rose-200',
                      medium: 'bg-amber-50 text-amber-700 border-amber-200',
                      low: 'bg-blue-50 text-blue-700 border-blue-200',
                      none: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    }[item.priority];

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 font-semibold text-slate-900">{item.skill_name}</td>
                        <td className="py-4 text-slate-600 font-medium">{item.required_level}/5</td>
                        <td className="py-4 text-slate-600 font-medium">{item.current_level}/5</td>
                        <td className="py-4 font-bold text-slate-900">
                          {item.gap > 0 ? `-${item.gap}` : '0'}
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg border ${priorityBadge}`}
                          >
                            {item.priority}
                          </span>
                        </td>
                        <td className="py-4 text-xs text-slate-600 max-w-sm leading-relaxed">
                          {item.action}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No skill-gap analysis generated yet</h3>
          <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
            Click "Run New Analysis" above to compare your profile skills with your selected target job role.
          </p>
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="mt-5 inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
          >
            Run Initial Analysis
          </button>
        </div>
      )}

      {/* Methodology info */}
      <div className="p-5 rounded-2xl bg-slate-100/70 border border-slate-200 flex items-start space-x-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Calculation Logic:</strong> For every required skill, gap = max(0, required_level - current_level).
          High priority indicates a gap ≥ 3; Medium = 2; Low = 1. Readiness score is the weighted ratio of current
          levels to required benchmark totals. Scores are diagnostic indicators rather than hiring guarantees.
        </p>
      </div>
    </div>
  );
};
