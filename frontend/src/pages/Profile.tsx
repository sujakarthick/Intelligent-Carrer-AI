import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StudentProfile, JobRole, StudentSkill, SkillIn } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { User, Plus, Trash2, CheckCircle2, Save, GraduationCap, Briefcase } from 'lucide-react';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form fields
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState<number | ''>('');
  const [cgpa, setCgpa] = useState<number | ''>('');
  const [targetRoleId, setTargetRoleId] = useState<number | ''>('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  // New skill addition state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(3);

  const fetchProfileAndRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, rolesRes, skillsRes] = await Promise.all([
        api.get<StudentProfile>('/profile'),
        api.get<JobRole[]>('/roles'),
        api.get<StudentSkill[]>('/skills'),
      ]);

      const p = profileRes.data;
      setProfile(p);
      setCollege(p.college || '');
      setBranch(p.branch || '');
      setYearOfStudy(p.year_of_study || '');
      setCgpa(p.cgpa || '');
      setTargetRoleId(p.target_role_id || '');
      setLinkedinUrl(p.linkedin_url || '');
      setGithubUrl(p.github_url || '');
      setPhone(p.phone || '');
      setBio(p.bio || '');

      setRoles(rolesRes.data);
      setSkills(skillsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndRoles();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        college: college.trim() || undefined,
        branch: branch.trim() || undefined,
        year_of_study: yearOfStudy !== '' ? Number(yearOfStudy) : undefined,
        cgpa: cgpa !== '' ? Number(cgpa) : undefined,
        target_role_id: targetRoleId !== '' ? Number(targetRoleId) : undefined,
        linkedin_url: linkedinUrl.trim() || undefined,
        github_url: githubUrl.trim() || undefined,
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
      };

      const res = await api.put<StudentProfile>('/profile', payload);
      setProfile(res.data);
      setSuccessMsg('Profile details saved successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;
    const updatedSkills: SkillIn[] = [
      ...skills.map((s) => ({
        skill_name: s.skill_name,
        current_level: s.current_level,
        source: s.source,
      })),
      {
        skill_name: newSkillName.trim(),
        current_level: newSkillLevel,
        source: 'self_reported',
      },
    ];

    try {
      const res = await api.put<StudentSkill[]>('/skills', { skills: updatedSkills });
      setSkills(res.data);
      setNewSkillName('');
      setNewSkillLevel(3);
      setSuccessMsg('Skill added successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update skills.');
    }
  };

  const handleRemoveSkill = async (skillName: string) => {
    const updatedSkills: SkillIn[] = skills
      .filter((s) => s.skill_name.toLowerCase() !== skillName.toLowerCase())
      .map((s) => ({
        skill_name: s.skill_name,
        current_level: s.current_level,
        source: s.source,
      }));

    try {
      const res = await api.put<StudentSkill[]>('/skills', { skills: updatedSkills });
      setSkills(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove skill.');
    }
  };

  const handleSkillLevelChange = async (skillName: string, newLevel: number) => {
    const updatedSkills: SkillIn[] = skills.map((s) => ({
      skill_name: s.skill_name,
      current_level: s.skill_name === skillName ? newLevel : s.current_level,
      source: s.source,
    }));

    try {
      const res = await api.put<StudentSkill[]>('/skills', { skills: updatedSkills });
      setSkills(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update skill level.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile data..." size="lg" />;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Profile & Competencies</h1>
        <p className="text-sm text-slate-500 mt-1">
          Keep your academic info and current skill proficiencies updated for accurate digital twin analytics.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {successMsg && (
        <div className="flex items-center space-x-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Academic & Personal Details</h2>
            <p className="text-xs text-slate-400">Institutional information and target goals</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={profile?.full_name || ''}
                className="mt-1.5 block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Managed via account settings</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="mt-1.5 block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                College / University
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. PSG College of Technology"
                className="mt-1.5 block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Branch / Specialization
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Computer Science & Business Systems"
                className="mt-1.5 block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Year of Study (1–5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 4"
                className="mt-1.5 block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Current CGPA (0.0 – 10.0)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 8.45"
                className="mt-1.5 block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Target Job Role
              </label>
              <select
                value={targetRoleId}
                onChange={(e) => setTargetRoleId(e.target.value ? Number(e.target.value) : '')}
                className="mt-1.5 block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="">-- Choose your primary career aspiration --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Your skill gap calculations and recommendations will be evaluated against this role's benchmarks.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="mt-1.5 block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                GitHub Profile URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="mt-1.5 block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Brief Bio / Career Aspirations
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your primary technical focus, passions, and placement objectives..."
                className="mt-1.5 block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Skills Management Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Technical Skills & Self-Assessed Levels</h2>
            <p className="text-xs text-slate-400">Scale: 0 (None) to 5 (Expert / Production Ready)</p>
          </div>
        </div>

        {/* Add Skill Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Skill name (e.g. Java, React, SQL, Docker)"
            className="w-full sm:flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="w-full sm:w-48 flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Lvl:</span>
            <input
              type="range"
              min="1"
              max="5"
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(Number(e.target.value))}
              className="flex-1 accent-indigo-600 cursor-pointer"
            />
            <span className="w-6 text-center text-xs font-bold text-indigo-600">
              {newSkillLevel}/5
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddSkill}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </div>

        {/* Existing Skills Table */}
        {skills.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {skills.map((skill) => (
              <div key={skill.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="w-40 sm:w-56">
                  <span className="text-sm font-semibold text-slate-900">{skill.skill_name}</span>
                  <span className="block text-[11px] text-slate-400 capitalize">
                    Source: {skill.source.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex-1 max-w-xs flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={skill.current_level}
                    onChange={(e) => handleSkillLevelChange(skill.skill_name, Number(e.target.value))}
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <span className="w-8 text-right text-xs font-bold text-indigo-700">
                    {skill.current_level}/5
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.skill_name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Remove skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
            No skills added yet. Add your programming languages, frameworks, or tools above!
          </div>
        )}
      </div>
    </div>
  );
};
