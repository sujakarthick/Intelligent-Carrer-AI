import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ResumeAnalysis, StudentSkill, SkillIn } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { FileText, Upload, Plus, CheckCircle2, AlertCircle, FileCheck } from 'lucide-react';

export const ResumeAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [history, setHistory] = useState<ResumeAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addingSkills, setAddingSkills] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get<ResumeAnalysis[]>('/resume/history');
      setHistory(res.data);
      if (res.data.length > 0) {
        setAnalysis(res.data[0]);
      }
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (!f.name.toLowerCase().endsWith('.pdf')) {
        setError('Only .pdf files are supported. Please select a valid PDF.');
        return;
      }
      setFile(f);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post<ResumeAnalysis>('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysis(res.data);
      setSuccessMsg('Resume parsed and analyzed successfully!');
      fetchHistory();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload and parse resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSkillsToProfile = async () => {
    if (!analysis || analysis.detected_skills.length === 0) return;

    setAddingSkills(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Fetch current skills first
      const currentSkillsRes = await api.get<StudentSkill[]>('/skills');
      const existingNames = new Set(
        currentSkillsRes.data.map((s) => s.skill_name.toLowerCase())
      );

      const toAdd: SkillIn[] = analysis.detected_skills
        .filter((name) => !existingNames.has(name.toLowerCase()))
        .map((name) => ({
          skill_name: name,
          current_level: 2, // default baseline for detected keyword
          source: 'resume',
        }));

      if (toAdd.length === 0) {
        setSuccessMsg('All detected skills are already present in your profile!');
        setAddingSkills(false);
        return;
      }

      const mergedList: SkillIn[] = [
        ...currentSkillsRes.data.map((s) => ({
          skill_name: s.skill_name,
          current_level: s.current_level,
          source: s.source,
        })),
        ...toAdd,
      ];

      await api.put('/skills', { skills: mergedList });
      setSuccessMsg(`Added ${toAdd.length} new skill(s) from resume to your profile!`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to sync skills to profile.');
    } finally {
      setAddingSkills(false);
    }
  };

  if (loading && history.length === 0) {
    return <LoadingSpinner message="Checking past resume parse logs..." size="lg" />;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900">Resume PDF Analyzer</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload your real PDF resume to extract technical competency keywords and benchmark them against role requirements.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {successMsg && (
        <div className="flex items-center space-x-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleUpload} className="space-y-5">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 transition bg-slate-50/50">
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              {file ? file.name : 'Select or drop your PDF resume here'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports standard text-based PDF documents up to 5 MB
            </p>

            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              id="resume-upload"
              className="hidden"
            />
            <label
              htmlFor="resume-upload"
              className="mt-4 inline-flex items-center px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl cursor-pointer transition border border-indigo-200"
            >
              Browse Files
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !file}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" />
              <span>{uploading ? 'Extracting & Parsing PDF...' : 'Analyze Resume'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results Display */}
      {analysis && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Parse Results
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                File: {analysis.filename}
              </h2>
            </div>

            {analysis.detected_skills.length > 0 && (
              <button
                onClick={handleAddSkillsToProfile}
                disabled={addingSkills}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition disabled:opacity-60"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {addingSkills ? 'Syncing...' : 'Add Detected Skills to Profile'}
                </span>
              </button>
            )}
          </div>

          {/* Detected Skills */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Identified Technical Skills ({analysis.detected_skills.length})
            </h3>
            {analysis.detected_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.detected_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No technical skills recognized in this document. Ensure your PDF has readable text (not a scanned image).
              </p>
            )}
          </div>

          {/* Improvement Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Improvement Suggestions
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {analysis.suggestions.map((sug, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span className="leading-relaxed">{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
