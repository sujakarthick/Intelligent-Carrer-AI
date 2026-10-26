import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AssessmentAttempt } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { History, Award, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const AssessmentHistory: React.FC = () => {
  const [history, setHistory] = useState<AssessmentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<AssessmentAttempt[]>('/assessments/history');
      setHistory(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load assessment history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Retrieving assessment attempt history..." size="lg" />;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900">Assessment History & Logs</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your previous coding assessment submissions and test performance scores over time.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Domain</th>
                  <th className="pb-3">Difficulty</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 text-xs text-slate-500 font-medium">
                      {attempt.completed_at
                        ? new Date(attempt.completed_at).toLocaleString()
                        : 'Recently'}
                    </td>
                    <td className="py-4 font-bold text-slate-900 capitalize">
                      {attempt.language}
                    </td>
                    <td className="py-4 text-xs font-semibold text-slate-600 capitalize">
                      {attempt.difficulty}
                    </td>
                    <td className="py-4 text-xs font-medium text-slate-600">
                      {attempt.correct_answers} / {attempt.total_questions} correct
                    </td>
                    <td className="py-4 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          attempt.score_percent >= 70
                            ? 'bg-emerald-100 text-emerald-800'
                            : attempt.score_percent >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {attempt.score_percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No assessment attempts found. Start an assessment from the Coding Assessment tab!
          </div>
        )}
      </div>
    </div>
  );
};
