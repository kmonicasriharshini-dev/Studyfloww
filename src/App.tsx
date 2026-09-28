/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AgentWorkflowHub } from './components/AgentWorkflowHub';
import { StudyPlanner } from './components/StudyPlanner';
import { SyllabusAnalyzer } from './components/SyllabusAnalyzer';
import { AITutor } from './components/AITutor';
import { TopicQuiz } from './components/TopicQuiz';
import { NotesRAGVault } from './components/NotesRAGVault';

const MainContent: React.FC = () => {
  const { activeTab } = useStudy();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'agent-workflow' && <AgentWorkflowHub />}
      {activeTab === 'planner' && <StudyPlanner />}
      {activeTab === 'syllabus' && <SyllabusAnalyzer />}
      {activeTab === 'tutor' && <AITutor />}
      {activeTab === 'quiz' && <TopicQuiz />}
      {activeTab === 'notes' && <NotesRAGVault />}
    </main>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <div className="min-h-screen bg-[#f8f9fc] flex flex-col font-sans">
        <Header />
        <div className="flex-1">
          <MainContent />
        </div>
        <footer className="border-t border-slate-200/80 bg-white/70 py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">StudyFlow</span>
              <span>·</span>
              <span>Autonomous College Student Study Portal</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span>Coordinator Agent</span>
              <span>·</span>
              <span>Vector RAG</span>
              <span>·</span>
              <span>Progressive Topic Unlocking</span>
            </div>
          </div>
        </footer>
      </div>
    </StudyProvider>
  );
}
