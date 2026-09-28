import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  LayoutDashboard,
  CalendarDays,
  FileSearch,
  BookOpen,
  HelpCircle,
  FolderGit2,
  Workflow,
  Search,
  UserCheck,
  Flame,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, studentProfile, launchAgentWorkflowWithPrompt } = useStudy();
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    launchAgentWorkflowWithPrompt(quickInput.trim());
    setQuickInput('');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agent-workflow', label: 'Agentic Workflow', icon: Workflow, isSpecial: true },
    { id: 'planner', label: 'Study Planner', icon: CalendarDays },
    { id: 'syllabus', label: 'Syllabus Analyzer', icon: FileSearch },
    { id: 'tutor', label: 'AI Tutor', icon: BookOpen },
    { id: 'quiz', label: 'Topic Mastery Quiz', icon: HelpCircle },
    { id: 'notes', label: 'Notes & RAG Vault', icon: FolderGit2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner with Student Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus-visible:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    StudyFlow
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/60 rounded px-1.5 py-0.5">
                    Agentic AI
                  </span>
                </div>
                <p className="text-xs text-slate-500">Autonomous Student Study Portal</p>
              </div>
            </button>
          </div>

          {/* Quick Agent Command Input */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleQuickSubmit} className="relative w-full">
              <input
                type="text"
                value={quickInput}
                onChange={e => setQuickInput(e.target.value)}
                placeholder="Ask Coordinator: e.g. DBMS exam in 10 days..."
                className="w-full pl-9 pr-24 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1 px-2.5 py-1 text-[11px] font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5" />
                Run Agent
              </button>
            </form>
          </div>

          {/* Student Profile Quick View */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50/80 border border-amber-200/60 px-2.5 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-semibold">{studentProfile.activeStudyStreakDays}d streak</span>
            </div>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center border border-indigo-200">
                AS
              </div>
              <div className="text-left hidden lg:block leading-tight">
                <div className="text-xs font-semibold text-slate-900">{studentProfile.name}</div>
                <div className="text-[11px] text-slate-500">
                  {studentProfile.semester} · {studentProfile.department}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none border-t border-slate-100">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? item.isSpecial
                      ? 'bg-purple-100 text-purple-900 font-semibold shadow-xs border border-purple-200'
                      : 'bg-indigo-50 text-indigo-800 font-semibold border border-indigo-100'
                    : item.isSpecial
                    ? 'text-purple-700 hover:bg-purple-50/70 border border-dashed border-purple-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? (item.isSpecial ? 'text-purple-700' : 'text-indigo-600') : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.isSpecial && (
                  <span className="text-[9px] bg-purple-200/80 text-purple-800 font-bold px-1.5 py-0.2 rounded uppercase">
                    Demo Hub
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
