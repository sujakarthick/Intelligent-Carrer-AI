import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { JobRole, StudentProfile } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Target, CheckCircle2, ChevronRight } from 'lucide-react';

export const TargetRole: React.FC = () => {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, profileRes] = await Promise.all([
        api.get<JobRole[]>('/roles'),
        api.get<StudentProfile>('/profile'),
      ]);
      setRoles(rolesRes.data);
      setProfile(profileRes.data);
      if (profileRes.data.target_role_id) {
        setSelectedRoleId(profileRes.data.target_role_id);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load job roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectRole = async (roleId: number) => {
    setSelectedRoleId(roleId);
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.put<StudentProfile>('/profile', { target_role_id: roleId });
      setProfile(res.data);
      setSuccessMsg(`Target role updated to: ${res.data.target_role_name}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update target role.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading industry job role benchmarks..." size="lg" />;
  }

  const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Target Job Roles & Benchmarks</h1>
        <p className="text-sm text-slate-500 mt-1">
          Select your target career path to compare your competencies against real hiring expectations.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {successMsg && (
        <div className="flex items-center space-x-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Role Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => {
          const isSelected = selectedRoleId === role.id;
          return (
            <div
              key={role.id}
              onClick={() => handleSelectRole(role.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50/80 border-indigo-600 shadow-xs ring-2 ring-indigo-600/20'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Target className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{role.name}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {role.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{role.skill_requirements.length} skill metrics</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Role Skill Requirements Detail */}
      {activeRole && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Benchmark Standards
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {activeRole.name} Skill Requirements
              </h2>
              <p className="text-xs text-slate-500 mt-1">{activeRole.description}</p>
            </div>
            {selectedRoleId !== activeRole.id && (
              <button
                onClick={() => handleSelectRole(activeRole.id)}
                disabled={saving}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
              >
                <span>Select this Role</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Skill Competency</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Required Proficiency</th>
                  <th className="pb-3 text-right">Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeRole.skill_requirements.map((req, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 font-semibold text-slate-900">{req.skill_name}</td>
                    <td className="py-3.5 text-xs text-slate-500 capitalize">{req.category}</td>
                    <td className="py-3.5">
                      <div className="flex items-center space-x-2 max-w-xs">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${(req.required_level / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {req.required_level}/5
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right text-xs text-slate-400">
                      Level {req.required_level}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
