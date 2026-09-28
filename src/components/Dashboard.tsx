import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Target,
  FileText,
  AlertCircle,
  Plus,
  PlayCircle,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const Dashboard: React.FC = () => {
  const {
    studentProfile,
    subjects,
    exams,
    tasks,
    toggleTaskStatus,
    addTask,
    setActiveTab,
    launchAgentWorkflowWithPrompt,
    setSelectedTopicForTutor,
    setSelectedTopicForQuiz,
  } = useStudy();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('sub-dbms');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      subjectId: selectedSubjectId,
      title: newTaskTitle.trim(),
      estimatedMinutes: 45,
      status: 'pending',
      dueDate: 'Tomorrow',
      priority: 'medium',
      notesCount: 1,
    });
    setNewTaskTitle('');
  };

  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  // Calculate covered vs total topics
  let totalTopics = 0;
  let coveredTopics = 0;
  subjects.forEach(s => {
    s.units.forEach(u => {
      u.topics.forEach(t => {
        totalTopics++;
        if (t.isCovered) coveredTopics++;
      });
    });
  });

  return (
    <div className="space-y-6">
      {/* 1. Student Greeting & Quick Status Banner */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-pink-50/60 border border-indigo-100 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
              <span>{studentProfile.semester}</span>
              <span aria-hidden="true">·</span>
              <span>{studentProfile.department}</span>
              <span aria-hidden="true">·</span>
              <span>Roll: {studentProfile.rollNo}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {studentProfile.name}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              You are preparing for your mid-semester examinations. Your overall syllabus coverage is{' '}
              <strong className="text-slate-900 font-semibold">{studentProfile.overallSyllabusProgress}%</strong>. Focus on high-yield units this week.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-white/80 backdrop-blur-xs border border-indigo-100/80 rounded-xl px-4 py-2.5 text-center shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Target GPA</div>
              <div className="text-xl font-bold text-indigo-600">{studentProfile.targetGpa.toFixed(1)}</div>
              <div className="text-[10px] text-slate-400">Current: {studentProfile.currentGpa.toFixed(2)}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xs border border-purple-100/80 rounded-xl px-4 py-2.5 text-center shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Syllabus Covered</div>
              <div className="text-xl font-bold text-purple-600">{studentProfile.overallSyllabusProgress}%</div>
              <div className="text-[10px] text-slate-400">{coveredTopics} of {totalTopics} topics</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Highlighted Agentic Workflow Demo Banner (As requested for workshop presentation) */}
      <div className="bg-white border-2 border-indigo-200/90 rounded-2xl p-5 shadow-xs transition-all hover:border-indigo-300">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-purple-600" />
                WORKSHOP DEMONSTRATION WORKFLOW
              </span>
              <span className="text-xs text-slate-400">Multi-Agent System + Tool RAG + LLM</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Run Real-time Agentic AI Coordinator
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl">
              Experience the end-to-end multi-agent orchestration:
              <span className="font-mono text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded ml-1 font-medium">
                User → Coordinator → Specialized Agents → Tool/RAG → LLM → Synthesized Study Plan + Tutor + Quiz
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() =>
                launchAgentWorkflowWithPrompt("I have a DBMS exam in 10 days and I haven't studied normalization.")
              }
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Demonstrate: &quot;DBMS in 10 days...&quot;</span>
            </button>
            <button
              onClick={() => setActiveTab('agent-workflow')}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-colors"
            >
              Open Flow Hub
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Upcoming Exams & Current Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Semester Subjects & Syllabus Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subjects in Semester */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Semester 5 Enrolled Subjects</h2>
                <p className="text-xs text-slate-500">Track units, completion percentage, and exam readiness</p>
              </div>
              <button
                onClick={() => setActiveTab('syllabus')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Analyze Full Syllabus</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {subjects.map(subject => {
                const percent = Math.round((subject.coveredTopics / (subject.totalTopics || 1)) * 100);
                const isUrgent = subject.id === 'sub-dbms';

                return (
                  <div
                    key={subject.id}
                    className={`p-4 rounded-xl border transition-all text-left group ${
                      isUrgent
                        ? 'border-indigo-200 bg-indigo-50/20 hover:border-indigo-300'
                        : 'border-slate-200/80 bg-slate-50/30 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-500">{subject.code}</span>
                          {isUrgent && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                              Exam in 10 Days
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm text-slate-900 mt-0.5 group-hover:text-indigo-600 transition-colors">
                          {subject.name}
                        </h3>
                        <div className="text-xs text-slate-500 mt-0.5">Instructor: {subject.instructor}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3.5 space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-500">
                          {subject.coveredTopics}/{subject.totalTopics} topics
                        </span>
                        <span className="text-slate-700 font-semibold">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isUrgent ? 'bg-indigo-600' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Action Buttons for Subject */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          const unit3 = subject.units.find(u => u.id === 'dbms-u3');
                          const topic = unit3?.topics[3] || subject.units[0]?.topics[0];
                          if (topic) setSelectedTopicForTutor(topic);
                          setActiveTab('tutor');
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Ask AI Tutor
                      </button>
                      <button
                        onClick={() => setActiveTab('planner')}
                        className="text-slate-500 hover:text-slate-800 font-medium"
                      >
                        View Plan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Tasks Being Prepared & Ongoing Tasks */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Current Study Tasks & Milestones</h2>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {completedTasksCount}/{tasks.length} Completed
                  </span>
                </div>
                <p className="text-xs text-slate-500">Check off items as you study. Updates your syllabus mastery.</p>
              </div>
            </div>

            {/* Quick Add Task Input */}
            <form onSubmit={handleCreateTask} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Add a study task (e.g. Practice 3NF synthesis algorithm)..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-400 focus:bg-white text-slate-800"
              />
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>

            {/* Tasks List */}
            <div className="space-y-2">
              {tasks.map(task => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isDone
                        ? 'bg-slate-50/60 border-slate-200/60 opacity-60'
                        : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-indigo-600">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                        ) : (
                          <div className="w-4 h-4 rounded border-2 border-slate-300 hover:border-indigo-500 transition-colors" />
                        )}
                      </div>
                      <div>
                        <div className={`text-xs font-medium ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.title}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.estimatedMinutes} mins
                          </span>
                          <span>·</span>
                          <span className="text-slate-600 font-medium">Due: {task.dueDate}</span>
                          {task.priority === 'high' && (
                            <>
                              <span>·</span>
                              <span className="text-rose-600 font-semibold">High Priority</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        // open AI Tutor with this task's topic
                        const sub = subjects.find(s => s.id === task.subjectId);
                        const topic = sub?.units.flatMap(u => u.topics).find(t => t.id === task.topicId);
                        if (topic) setSelectedTopicForTutor(topic);
                        setActiveTab('tutor');
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50"
                    >
                      Study with Tutor
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Exams Countdown & Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Exams Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Upcoming Exams</h2>
                <p className="text-xs text-slate-500">Countdown and priority rankings</p>
              </div>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {exams.map(exam => {
                const isUrgent = exam.daysRemaining <= 10;
                return (
                  <div
                    key={exam.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isUrgent
                        ? 'bg-rose-50/30 border-rose-200'
                        : 'bg-slate-50/40 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-700">{exam.subjectCode}</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-slate-200/80 text-slate-700'
                        }`}
                      >
                        {exam.daysRemaining} days left
                      </span>
                    </div>

                    <div className="font-semibold text-xs text-slate-900 mt-1">{exam.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{exam.subjectName}</div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Target: {exam.targetScore}/100</span>
                      <button
                        onClick={() => {
                          launchAgentWorkflowWithPrompt(
                            `I have a ${exam.subjectCode} exam in ${exam.daysRemaining} days and I need a high-yield study plan.`
                          );
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <span>Create Sprint Plan</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Study Hub Shortcuts */}
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              StudyFlow Tools
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('quiz')}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    Q
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">
                      Topic Mastery Quiz
                    </div>
                    <div className="text-[11px] text-slate-500">Pass quiz to unlock next topic</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                    R
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">
                      Notes & RAG Vault
                    </div>
                    <div className="text-[11px] text-slate-500">Query uploaded lecture handouts</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
              </button>

              <button
                onClick={() => setActiveTab('planner')}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    P
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">
                      10-Day Exam Planner
                    </div>
                    <div className="text-[11px] text-slate-500">Weightage & difficulty schedule</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
