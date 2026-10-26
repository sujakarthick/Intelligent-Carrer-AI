import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Roadmap as RoadmapType, RoadmapTask } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Map, CheckCircle2, Clock, Sparkles, Filter, RefreshCw } from 'lucide-react';

export const Roadmap: React.FC = () => {
  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<RoadmapType>('/roadmap');
      setRoadmap(res.data);
    } catch (err: any) {
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post<RoadmapType>('/roadmap/generate');
      setRoadmap(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Failed to generate roadmap. Ensure you have run a skill-gap analysis first.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStatus = async (taskId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const res = await api.patch<RoadmapTask>(`/roadmap/tasks/${taskId}`, { status: nextStatus });
      if (roadmap) {
        const updatedTasks = roadmap.tasks.map((t) => (t.id === taskId ? res.data : t));
        setRoadmap({ ...roadmap, tasks: updatedTasks });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update task status.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your personalized learning roadmap..." size="lg" />;
  }

  const tasks = roadmap?.tasks || [];
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    const matchWeek = t.week_number === selectedWeek;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchWeek && matchPriority;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <span>4-Week Adaptive Schedule</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Personalized Learning Roadmap</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured study tasks derived directly from your identified skill gaps.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition disabled:opacity-60"
        >
          <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating...' : roadmap ? 'Regenerate Roadmap' : 'Generate Roadmap'}</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {roadmap ? (
        <>
          {/* Progress Bar Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700">Overall Roadmap Completion</span>
              <span className="font-bold text-indigo-600">
                {completedCount} of {tasks.length} tasks ({progressPct}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Week Selector Tabs & Priority Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              {[1, 2, 3, 4].map((w) => {
                const weekTasks = tasks.filter((t) => t.week_number === w);
                const weekCompleted = weekTasks.filter((t) => t.status === 'completed').length;
                const isSelected = selectedWeek === w;
                return (
                  <button
                    key={w}
                    onClick={() => setSelectedWeek(w)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    <span>Week {w}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {weekCompleted}/{weekTasks.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filter by priority */}
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Task Cards for Selected Week */}
          <div className="space-y-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const priorityBadge = {
                  high: 'bg-rose-50 text-rose-700 border-rose-200',
                  medium: 'bg-amber-50 text-amber-700 border-amber-200',
                  low: 'bg-blue-50 text-blue-700 border-blue-200',
                }[task.priority] || 'bg-slate-50 text-slate-700';

                return (
                  <div
                    key={task.id}
                    className={`p-6 rounded-2xl border transition bg-white shadow-xs ${
                      isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-start space-x-3.5 flex-1">
                        <button
                          onClick={() => handleToggleStatus(task.id, task.status)}
                          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition border ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-300 hover:border-indigo-600 text-transparent'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                              {task.skill}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityBadge} uppercase`}
                            >
                              {task.priority} Priority
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                              {task.difficulty}
                            </span>
                          </div>

                          <h3
                            className={`text-base font-bold text-slate-900 ${
                              isCompleted ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {task.objective}
                          </h3>

                          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                            {task.activity}
                          </p>

                          {task.expected_outcome && (
                            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                              <span className="font-semibold text-slate-700">Outcome: </span>
                              {task.expected_outcome}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 text-xs text-slate-400">
                        {task.duration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{task.duration}</span>
                          </div>
                        )}
                        <span
                          className={`text-[11px] font-semibold capitalize ${
                            isCompleted ? 'text-emerald-600' : 'text-slate-500'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No tasks match your selected filter in Week {selectedWeek}.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <Map className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No learning roadmap created yet</h3>
          <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
            Click "Generate Roadmap" above to automatically create a 4-week task schedule from your skill gap analysis.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-5 inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
          >
            Create 4-Week Plan
          </button>
        </div>
      )}
    </div>
  );
};
