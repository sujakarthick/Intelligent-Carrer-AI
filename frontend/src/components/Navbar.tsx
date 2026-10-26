import React from 'react';
import { Menu, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-slate-500 hidden sm:inline-block">
          Welcome back, <span className="font-semibold text-slate-800">{user?.full_name || 'Student'}</span>
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          <UserCircle className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">{user?.email}</span>
        </button>

        <button
          onClick={handleLogout}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
