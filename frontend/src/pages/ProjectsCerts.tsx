import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Project, Certification } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  FolderGit2,
  Award,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  Github,
} from 'lucide-react';

export const ProjectsCerts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'certs'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Project Form modal state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projContrib, setProjContrib] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projStatus, setProjStatus] = useState('completed');

  // Cert Form modal state
  const [showCertModal, setShowCertModal] = useState(false);
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certUrl, setCertUrl] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get<Project[]>('/projects'),
        api.get<Certification[]>('/certifications'),
      ]);
      setProjects(pRes.data);
      setCerts(cRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load projects and certifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Project CRUD ---
  const handleOpenProjectModal = (project?: Project) => {
    if (project) {
      setEditingProjectId(project.id);
      setProjTitle(project.title);
      setProjDesc(project.description || '');
      setProjTech(project.technologies || '');
      setProjContrib(project.contribution || '');
      setProjGithub(project.github_url || '');
      setProjStatus(project.status || 'completed');
    } else {
      setEditingProjectId(null);
      setProjTitle('');
      setProjDesc('');
      setProjTech('');
      setProjContrib('');
      setProjGithub('');
      setProjStatus('completed');
    }
    setShowProjectModal(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;

    const payload = {
      title: projTitle.trim(),
      description: projDesc.trim() || undefined,
      technologies: projTech.trim() || undefined,
      contribution: projContrib.trim() || undefined,
      github_url: projGithub.trim() || undefined,
      status: projStatus,
    };

    try {
      if (editingProjectId) {
        await api.put(`/projects/${editingProjectId}`, payload);
      } else {
        await api.post('/projects', payload);
      }
      setShowProjectModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save project.');
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete project.');
    }
  };

  // --- Cert CRUD ---
  const handleOpenCertModal = (cert?: Certification) => {
    if (cert) {
      setEditingCertId(cert.id);
      setCertName(cert.name);
      setCertIssuer(cert.issuer);
      setCertDate(cert.issue_date || '');
      setCertUrl(cert.credential_url || '');
    } else {
      setEditingCertId(null);
      setCertName('');
      setCertIssuer('');
      setCertDate('');
      setCertUrl('');
    }
    setShowCertModal(true);
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim() || !certIssuer.trim()) return;

    const payload = {
      name: certName.trim(),
      issuer: certIssuer.trim(),
      issue_date: certDate.trim() || undefined,
      credential_url: certUrl.trim() || undefined,
    };

    try {
      if (editingCertId) {
        await api.put(`/certifications/${editingCertId}`, payload);
      } else {
        await api.post('/certifications', payload);
      }
      setShowCertModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save certification.');
    }
  };

  const handleDeleteCert = async (id: number) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    try {
      await api.delete(`/certifications/${id}`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete certification.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your portfolio assets..." size="lg" />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects & Certifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Document academic projects, open-source work, and industry certifications.
          </p>
        </div>

        <button
          onClick={() => (activeTab === 'projects' ? handleOpenProjectModal() : handleOpenCertModal())}
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'projects' ? 'Add New Project' : 'Add New Certification'}</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 px-4 text-sm font-bold transition flex items-center space-x-2 border-b-2 -mb-px ${
            activeTab === 'projects'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Projects ({projects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('certs')}
          className={`pb-3 px-4 text-sm font-bold transition flex items-center space-x-2 border-b-2 -mb-px ${
            activeTab === 'certs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certifications ({certs.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'projects' ? (
        <div className="space-y-4">
          {projects.length > 0 ? (
            projects.map((proj) => (
              <div
                key={proj.id}
                className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="text-base font-bold text-slate-900">{proj.title}</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {proj.status}
                    </span>
                  </div>

                  {proj.description && (
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {proj.description}
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-500">
                    {proj.technologies && (
                      <div>
                        <span className="font-semibold text-slate-700">Technologies: </span>
                        <span>{proj.technologies}</span>
                      </div>
                    )}
                    {proj.contribution && (
                      <div>
                        <span className="font-semibold text-slate-700">My Contribution: </span>
                        <span>{proj.contribution}</span>
                      </div>
                    )}
                  </div>

                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>View Repository</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-start">
                  <button
                    onClick={() => handleOpenProjectModal(proj)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs">
              No projects added yet. Click "Add New Project" to document your work!
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {certs.length > 0 ? (
            certs.map((c) => (
              <div
                key={c.id}
                className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Issuer: <span className="font-semibold text-slate-700">{c.issuer}</span>
                    {c.issue_date && ` · Issued: ${c.issue_date}`}
                  </p>
                  {c.credential_url && (
                    <a
                      href={c.credential_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      <span>Verify Credential</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenCertModal(c)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCert(c.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs">
              No certifications added yet. Click "Add New Certification" to record certificates!
            </div>
          )}
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingProjectId ? 'Edit Project' : 'Add New Project'}
            </h2>
            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. Distributed Task Scheduler"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Summary of the application, architecture, and problem solved..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Technologies (comma-separated)
                </label>
                <input
                  type="text"
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                  placeholder="e.g. Python, FastAPI, Docker, PostgreSQL"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Your Specific Contribution
                </label>
                <input
                  type="text"
                  value={projContrib}
                  onChange={(e) => setProjContrib(e.target.value)}
                  placeholder="e.g. Built the JWT auth backend and Redis queue worker"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={projGithub}
                    onChange={(e) => setProjGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="completed">Completed</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cert Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingCertId ? 'Edit Certification' : 'Add New Certification'}
            </h2>
            <form onSubmit={handleSaveCert} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Certificate Name *
                </label>
                <input
                  type="text"
                  required
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="e.g. AWS Certified Cloud Practitioner"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Issuing Organization *
                </label>
                <input
                  type="text"
                  required
                  value={certIssuer}
                  onChange={(e) => setCertIssuer(e.target.value)}
                  placeholder="e.g. Amazon Web Services, Coursera, HackerRank"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Issue Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={certDate}
                  onChange={(e) => setCertDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Credential Verification URL
                </label>
                <input
                  type="url"
                  value={certUrl}
                  onChange={(e) => setCertUrl(e.target.value)}
                  placeholder="https://credly.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Save Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
