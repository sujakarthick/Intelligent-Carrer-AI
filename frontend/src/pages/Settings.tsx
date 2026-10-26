import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings as SettingsIcon, User, LogOut, CheckCircle2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900">Account & Platform Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your credentials, security settings, and session status.
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Authenticated Student Account</h2>
            <p className="text-xs text-slate-400">Database user record details</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">
              Student Name
            </span>
            <span className="font-bold text-slate-900 text-sm">{user?.full_name}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">
              Email Address
            </span>
            <span className="font-bold text-slate-900 text-sm">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">
              Database Account ID
            </span>
            <span className="font-mono text-slate-600">#{user?.id}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">
              Authentication Scheme
            </span>
            <span className="inline-flex items-center space-x-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <Shield className="w-3.5 h-3.5" />
              <span>JWT Bearer + Bcrypt Hash</span>
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Active session token stored securely in localStorage.
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Project Metadata */}
      <div className="p-6 rounded-2xl bg-slate-100/60 border border-slate-200 text-xs text-slate-600 space-y-2">
        <h3 className="font-bold text-slate-900">Project Information</h3>
        <p>
          <strong>Platform:</strong> SkillTwin AI — Intelligent Career Digital Twin for Students
        </p>
        <p>
          <strong>Coursework:</strong> Final-Year B.Tech Computer Science & Business Systems Project
        </p>
        <p>
          <strong>Stack:</strong> React 18, TypeScript, Tailwind CSS, Vite, FastAPI, SQLAlchemy, SQLite
        </p>
      </div>
    </div>
  );
};
