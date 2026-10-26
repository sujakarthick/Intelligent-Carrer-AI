import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  CommunicationQuestion,
  CommunicationResult,
  CommunicationPractice as PracticeType,
} from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { MessageSquare, Send, CheckCircle2, Award, History, Lightbulb } from 'lucide-react';

export const Communication: React.FC = () => {
  const [questionType, setQuestionType] = useState<string>('intro');
  const [questions, setQuestions] = useState<CommunicationQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<CommunicationQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<CommunicationResult | null>(null);
  const [history, setHistory] = useState<PracticeType[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async (type: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<CommunicationQuestion[]>('/communication/questions', {
        params: { question_type: type },
      });
      setQuestions(res.data);
      if (res.data.length > 0) {
        setSelectedQuestion(res.data[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load practice questions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get<PracticeType[]>('/communication/history');
      setHistory(res.data);
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchQuestions(questionType);
    fetchHistory();
  }, [questionType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !answer.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        question: selectedQuestion.question,
        question_type: selectedQuestion.question_type,
        answer: answer.trim(),
      };
      const res = await api.post<CommunicationResult>('/communication/submit', payload);
      setResult(res.data);
      fetchHistory();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to evaluate your practice response.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900">Communication & Interview Practice</h1>
        <p className="text-xs text-slate-500 mt-1">
          Practise interview responses with automated rule-based evaluation (structure, STAR methodology, and concrete examples).
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Category selector */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'intro', label: 'Self Introduction' },
          { id: 'hr', label: 'HR Behavioral' },
          { id: 'technical', label: 'Technical Concepts' },
          { id: 'situation', label: 'Situational & STAR' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setQuestionType(item.id);
              setResult(null);
              setAnswer('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              questionType === item.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Practice Workspace */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Select Practice Prompt
          </label>
          <select
            value={selectedQuestion?.id || ''}
            onChange={(e) => {
              const q = questions.find((item) => item.id === Number(e.target.value));
              if (q) {
                setSelectedQuestion(q);
                setResult(null);
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-800"
          >
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.question}
              </option>
            ))}
          </select>
        </div>

        {/* Question Display */}
        {selectedQuestion && (
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start space-x-3">
            <MessageSquare className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Interview Question
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {selectedQuestion.question}
              </p>
            </div>
          </div>
        )}

        {/* Answer Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Your Written Response
              </label>
              <span className="text-[11px] text-slate-400">
                {answer.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={6}
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Draft your answer here. Provide context, actions you took, and specific outcomes or metrics..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !answer.trim()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Analyzing Response...' : 'Submit for Feedback'}</span>
            </button>
          </div>
        </form>

        {/* Feedback Section */}
        {result && (
          <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Evaluation Report
              </span>
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Score: {result.score}/10</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-100 text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900 mb-1">Feedback Summary:</p>
              {result.feedback}
            </div>

            {result.suggestions.length > 0 && (
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Key Improvement Recommendations:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                  {result.suggestions.map((sug, idx) => (
                    <li key={idx}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Practice History */}
      {history.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Your Past Practice Sessions</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="py-3 text-xs flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 capitalize">
                      {item.question_type} Interview
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.practiced_at ? new Date(item.practiced_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 font-medium">{item.question}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-1 italic">
                    "{item.student_answer}"
                  </p>
                </div>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                  {item.score}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
