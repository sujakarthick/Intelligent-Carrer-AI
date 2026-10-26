import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, BarChart3, Map, CheckCircle2, ArrowRight, ShieldCheck, Terminal, BookOpen } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
              SkillTwin AI
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
          <span>Student Career Digital Twin Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-950 tracking-tight leading-tight">
          Know your gaps. <br className="hidden sm:inline" />
          Build your skills. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Land your career.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          SkillTwin AI creates your career digital twin — analysing your current technical competencies,
          resume content, and assessment performance against your target job role to generate a transparent,
          personalized learning roadmap.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition space-x-2"
          >
            <span>Create Your Free Digital Twin</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition"
          >
            Access Existing Account
          </Link>
        </div>

        {/* Value pills */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs font-medium text-slate-500">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Deterministic Rule-Based Skill Gap Engine</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Real PDF Resume Keyword Extraction</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Coding Assessments & Interview Practice</span>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950">
              A Complete Career Intelligence Suite for Students
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Designed specifically for engineering students navigating campus placements and career transitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-200 transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center mb-5">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Career Digital Twin</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Aggregates self-reported skills, projects, certifications, resume data, and coding assessments into a single unified profile snapshot.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-200 transition">
              <div className="w-12 h-12 rounded-xl bg-violet-100/80 text-violet-700 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Skill Gap Analysis</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Compare your current proficiency against industry benchmark expectations for roles like Java Developer, Python Engineer, and Data Scientist.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-200 transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center mb-5">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Personalized Learning Roadmap</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Get a targeted 4-week task schedule focused on your highest-priority gaps, with concrete study activities and milestone tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-700">SkillTwin AI</p>
        <p className="mt-1 text-slate-400">Final-Year B.Tech Computer Science and Business Systems Project</p>
      </footer>
    </div>
  );
};
