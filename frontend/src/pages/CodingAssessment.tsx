import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CodingQuestion, AssessmentResult } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Code2, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';

export const CodingAssessment: React.FC = () => {
  const [language, setLanguage] = useState<'java' | 'python' | 'general'>('python');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const [isTestStarted, setIsTestStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes in seconds

  useEffect(() => {
    let timer: any;
    if (isTestStarted && !result && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isTestStarted && !result) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [isTestStarted, result, timeLeft]);

  const handleStartTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnswers({});
    setTimeLeft(600);
    try {
      const res = await api.get<CodingQuestion[]>('/assessments', {
        params: { language, difficulty },
      });
      setQuestions(res.data);
      setIsTestStarted(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load assessment questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (result) return;
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = async () => {
    if (questions.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        language,
        difficulty,
        answers,
      };
      const res = await api.post<AssessmentResult>('/assessments/submit', payload);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit assessment answers.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Technical Coding Assessments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Backend-evaluated MCQs in Java, Python, and Data Structures & Algorithms.
          </p>
        </div>

        {isTestStarted && !result && (
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-800 font-mono text-sm font-bold border border-amber-200">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      {!isTestStarted ? (
        /* Configuration / Launcher */
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900">Select Assessment Module</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Subject Domain / Language
              </label>
              <div className="space-y-2">
                {[
                  { id: 'python', label: 'Python Programming' },
                  { id: 'java', label: 'Java OOP & APIs' },
                  { id: 'general', label: 'Data Structures & Algorithms' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      language === item.id
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      checked={language === item.id}
                      onChange={() => setLanguage(item.id as any)}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Proficiency Level
              </label>
              <div className="space-y-2">
                {[
                  { id: 'beginner', label: 'Beginner (Core Syntax & Basics)' },
                  { id: 'intermediate', label: 'Intermediate (Data Structures & OOP)' },
                  { id: 'advanced', label: 'Advanced (Complex Patterns)' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      difficulty === item.id
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      checked={difficulty === item.id}
                      onChange={() => setDifficulty(item.id as any)}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleStartTest}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition disabled:opacity-60"
            >
              <Code2 className="w-4 h-4" />
              <span>{loading ? 'Loading Questions...' : 'Start 10-Minute Assessment'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Questions or Results View */
        <div className="space-y-6">
          {/* Results Banner if finished */}
          {result && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Assessment Completed
                </span>
                <div className="mt-1 flex items-baseline space-x-3">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {result.score_percent}%
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    ({result.correct_answers} of {result.total_questions} correct)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Answers evaluated against server answer keys.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsTestStarted(false);
                  setResult(null);
                }}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Take Another Test</span>
              </button>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-5">
            {questions.map((q, idx) => {
              const resItem = result?.results.find((r) => r.question_id === q.id);
              return (
                <div
                  key={q.id}
                  className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-bold text-indigo-600">Question {idx + 1}</span>
                    {resItem && (
                      <span
                        className={`inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                          resItem.is_correct
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {resItem.is_correct ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Correct</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Incorrect</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{q.title}</h3>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{q.description}</p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pt-2">
                    {q.options.map((option, optIdx) => {
                      const isSelected = answers[q.id] === optIdx;
                      let optionStyle = 'border-slate-200 hover:bg-slate-50 text-slate-700';

                      if (result && resItem) {
                        if (optIdx === resItem.correct_answer) {
                          optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                        } else if (isSelected && !resItem.is_correct) {
                          optionStyle = 'border-rose-500 bg-rose-50 text-rose-900';
                        }
                      } else if (isSelected) {
                        optionStyle = 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-semibold';
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center space-x-3 ${optionStyle}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{option}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {resItem && (
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      <span className="font-bold text-slate-800">Explanation: </span>
                      {resItem.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          {!result && (
            <div className="flex justify-end p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs disabled:opacity-60"
              >
                <span>{submitting ? 'Submitting Answers...' : 'Submit Assessment'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
