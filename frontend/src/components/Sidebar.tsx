import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Cpu,
  Target,
  BarChart3,
  FileText,
  Map,
  Code2,
  MessageSquare,
  FolderGit2,
  History,
  Settings,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/career-twin', label: 'Career Digital Twin', icon: Cpu },
  { to: '/profile', label: 'Student Profile', icon: User },
  { to: '/target-role', label: 'Target Job Role', icon: Target },
  { to: '/skill-gap', label: 'Skill Gap Analysis', icon: BarChart3 },
  { to: '/resume', label: 'Resume Analyzer', icon: FileText },
  { to: '/roadmap', label: 'Learning Roadmap', icon: Map },
  { to: '/assessment', label: 'Coding Assessment', icon: Code2 },
  { to: '/communication', label: 'Communication Practice', icon: MessageSquare },
  { to: '/projects', label: 'Projects & Certs', icon: FolderGit2 },
  { to: '/history', label: 'Assessment History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
                SkillTwin AI
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Career Twin
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">SkillTwin AI Platform</p>
            <p className="mt-0.5 text-[11px] text-slate-400">Final-Year B.Tech CSBS Project</p>
          </div>
        </div>
      </aside>
    </>
  );
};
