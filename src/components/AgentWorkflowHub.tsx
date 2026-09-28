import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  FileText,
  HelpCircle,
  Cpu,
  Layers,
  Search,
  Database,
  Terminal,
  Zap,
  Play,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { runAgenticWorkflow } from '../services/api';
import { AgentWorkflowResult } from '../types';

export const AgentWorkflowHub: React.FC = () => {
  const {
    activeAgentPrompt,
    setActiveAgentPrompt,
    saveAgentPlanToSchedule,
    setActiveTab,
    setSelectedTopicForTutor,
    setSelectedTopicForQuiz,
    subjects,
    unlockTopicAndRecordScore,
  } = useStudy();

  const [inputQuery, setInputQuery] = useState(activeAgentPrompt);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [workflowResult, setWorkflowResult] = useState<AgentWorkflowResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'plan' | 'tutor' | 'quiz' | 'trace'>('plan');
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [planSavedSuccess, setPlanSavedSuccess] = useState(false);
  const [expandedTraceIndex, setExpandedTraceIndex] = useState<number | null>(0);

  const samplePrompts = [
    {
      label: 'DBMS Exam & Normalization (Workshop Example)',
      query: "I have a DBMS exam in 10 days and I haven't studied normalization.",
    },
    {
      label: 'OS Banker\'s Algorithm & Deadlocks',
      query: "I have an OS exam in 2 weeks and I struggle with Banker's Algorithm safety sequences.",
    },
    {
      label: 'Computer Networks Subnetting',
      query: 'I need to master CIDR subnetting and VLSM calculations before next week\'s lab exam.',
    },
  ];

  // Auto-run if prompted with default on first visit
  useEffect(() => {
    if (!workflowResult) {
      handleExecute(activeAgentPrompt);
    }
  }, []);

  const handleExecute = async (queryToRun: string) => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    setPlanSavedSuccess(false);
    setQuizSubmitted(false);
    setSelectedQuizAnswers({});

    // Sequential agent execution simulation for workshop visibility
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < 5) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 450);

    try {
      const result = await runAgenticWorkflow(queryToRun);
      setTimeout(() => {
        setWorkflowResult(result);
        setIsRunning(false);
        clearInterval(stepInterval);
        setCurrentStepIndex(6);
      }, 2500);
    } catch (err) {
      setIsRunning(false);
      clearInterval(stepInterval);
    }
  };

  const handleSavePlan = () => {
    if (workflowResult?.generatedPlan) {
      saveAgentPlanToSchedule(workflowResult.generatedPlan);
      setPlanSavedSuccess(true);
      setTimeout(() => setPlanSavedSuccess(false), 4000);
    }
  };

  const handleSelectAnswer = (qId: string, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedQuizAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    if (!workflowResult?.diagnosticQuiz) return;

    let correct = 0;
    workflowResult.diagnosticQuiz.forEach(q => {
      if (selectedQuizAnswers[q.id] === q.correctAnswerIndex) {
        correct++;
      }
    });

    const scorePercent = Math.round((correct / workflowResult.diagnosticQuiz.length) * 100);
    // If passed, unlock in context
    if (scorePercent >= 50) {
      unlockTopicAndRecordScore('top-dbms-3nf', scorePercent);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Interactive Prompt Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                Live Workshop Demonstration
              </span>
              <span className="text-xs text-slate-500">Autonomous Multi-Agent Orchestration</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Agentic Study Workflow Hub
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Input any student dilemma. Watch the Coordinator Agent analyze goals, query syllabus data, calculate available hours, retrieve lecture notes via RAG, and synthesize a complete personalized study solution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExecute(inputQuery)}
              disabled={isRunning}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Agents Coordinating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Workflow</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="mt-4 space-y-3">
          <div className="relative">
            <textarea
              rows={2}
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Tell the agent what you need to prepare (e.g. I have a DBMS exam in 10 days and I haven't studied normalization)..."
              className="w-full p-3 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-400 focus:bg-white text-slate-900 transition-all resize-none"
            />
          </div>

          {/* Quick Demo Prompts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Quick Demo Prompts:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputQuery(p.query);
                  setActiveAgentPrompt(p.query);
                  handleExecute(p.query);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all text-left ${
                  inputQuery === p.query
                    ? 'bg-purple-50 text-purple-800 border-purple-300 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Visual Architecture Diagram (Demonstrating: User -> Coordinator -> Specialized Agents -> Tool/RAG -> LLM -> Result -> User) */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 border border-indigo-100 rounded-2xl p-5 shadow-xs overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Agentic Architecture Pipeline
            </span>
            <span className="text-[11px] text-slate-500">
              Interactive Multi-Agent Flow · Grounded RAG · Progressive Unlock
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2.5 text-center">
            {/* Step 1: User */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                currentStepIndex >= 0
                  ? 'bg-white border-indigo-300 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 opacity-60'
              }`}
            >
              <div className="w-8 h-8 mx-auto rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs mb-1.5">
                👤
              </div>
              <div className="text-[11px] font-bold text-slate-900">User Goal</div>
              <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">DBMS 10 days</div>
            </div>

            {/* Step 2: Coordinator */}
            <div
              className={`p-3 rounded-xl border transition-all relative ${
                currentStepIndex >= 1
                  ? 'bg-white border-purple-300 shadow-xs ring-2 ring-purple-100'
                  : 'bg-slate-50/60 border-slate-200 opacity-60'
              }`}
            >
              {isRunning && currentStepIndex === 1 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
              )}
              <div className="w-8 h-8 mx-auto rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs mb-1.5">
                🧠
              </div>
              <div className="text-[11px] font-bold text-slate-900">Coordinator Agent</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Intent Parser</div>
            </div>

            {/* Step 3: Specialized Agents */}
            <div
              className={`p-3 rounded-xl border transition-all relative ${
                currentStepIndex >= 2
                  ? 'bg-white border-blue-300 shadow-xs ring-2 ring-blue-100'
                  : 'bg-slate-50/60 border-slate-200 opacity-60'
              }`}
            >
              {isRunning && (currentStepIndex === 2 || currentStepIndex === 3) && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              )}
              <div className="w-8 h-8 mx-auto rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs mb-1.5">
                ⚙️
              </div>
              <div className="text-[11px] font-bold text-slate-900">Specialized Agents</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Syllabus & Planner</div>
            </div>

            {/* Step 4: Tools & RAG */}
            <div
              className={`p-3 rounded-xl border transition-all relative ${
                currentStepIndex >= 4
                  ? 'bg-white border-emerald-300 shadow-xs ring-2 ring-emerald-100'
                  : 'bg-slate-50/60 border-slate-200 opacity-60'
              }`}
            >
              {isRunning && currentStepIndex === 4 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
              <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs mb-1.5">
                📑
              </div>
              <div className="text-[11px] font-bold text-slate-900">Notes & Vector RAG</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Handouts Search</div>
            </div>

            {/* Step 5: LLM Engine */}
            <div
              className={`p-3 rounded-xl border transition-all relative ${
                currentStepIndex >= 5
                  ? 'bg-white border-amber-300 shadow-xs ring-2 ring-amber-100'
                  : 'bg-slate-50/60 border-slate-200 opacity-60'
              }`}
            >
              {isRunning && currentStepIndex === 5 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
              <div className="w-8 h-8 mx-auto rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs mb-1.5">
                ⚡
              </div>
              <div className="text-[11px] font-bold text-slate-900">LLM Synthesis</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Tutor & Diagnostic</div>
            </div>

            {/* Step 6: User Result */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                currentStepIndex >= 6
                  ? 'bg-white border-purple-300 shadow-xs ring-2 ring-purple-200 font-semibold'
                  : 'bg-slate-50/60 border-slate-200 opacity-60'
              }`}
            >
              <div className="w-8 h-8 mx-auto rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs mb-1.5">
                🎯
              </div>
              <div className="text-[11px] font-bold text-slate-900">Actionable Result</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Plan, Quiz & Tutor</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real-Time Agent Execution Traces (Step-by-Step logs) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900">Agent Reasoning Steps & Tool Invocations</h2>
          </div>
          <span className="text-xs text-slate-500">
            {isRunning ? 'Orchestration in progress...' : 'All 6 Specialized Agents Finished'}
          </span>
        </div>

        <div className="space-y-2">
          {workflowResult?.steps.map((step, idx) => {
            const isFinished = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx && isRunning;
            const isExpanded = expandedTraceIndex === idx;

            return (
              <div
                key={idx}
                className={`border rounded-xl transition-all ${
                  isCurrent
                    ? 'border-purple-300 bg-purple-50/20'
                    : isFinished
                    ? 'border-slate-200 bg-slate-50/30'
                    : 'border-slate-100 bg-white opacity-40'
                }`}
              >
                <div
                  onClick={() => setExpandedTraceIndex(isExpanded ? null : idx)}
                  className="flex items-center justify-between p-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="mt-0.5">
                      {isFinished ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                      ) : isCurrent ? (
                        <RotateCcw className="w-4 h-4 text-purple-600 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{step.agentName}</span>
                        <span className="text-[11px] text-slate-500 font-medium">· {step.action}</span>
                        {step.toolUsed && (
                          <span className="text-[10px] font-mono font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                            tool: {step.toolUsed}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{step.thoughtLog}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-[10px] font-mono">{step.timestamp}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 border-t border-slate-100 text-xs space-y-2">
                    <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
                      <div className="text-purple-300 font-bold mb-1">// Agent Thought & Synthesis:</div>
                      <div>{step.thoughtLog}</div>
                      {step.toolInput && (
                        <div className="mt-2 text-slate-300">
                          <span className="text-amber-300">// Tool Input:</span> {JSON.stringify(step.toolInput)}
                        </div>
                      )}
                      {step.toolOutput && (
                        <div className="mt-1 text-emerald-300">
                          <span className="text-emerald-400">// Tool Output:</span> {JSON.stringify(step.toolOutput)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Synthesized Multi-Pane Result Hub */}
      {workflowResult && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          {/* Result Hub Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Coordinator Resolution
                </span>
                <span className="text-xs text-slate-500">
                  Target: {workflowResult.studentGoal.targetTopic}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Generated Plan, Tutoring & Assessment Bundle
              </h2>
            </div>

            {/* Segmented Control Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveResultTab('plan')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeResultTab === 'plan'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>10-Day Plan</span>
              </button>
              <button
                onClick={() => setActiveResultTab('tutor')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeResultTab === 'tutor'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>RAG Tutor Notes</span>
              </button>
              <button
                onClick={() => setActiveResultTab('quiz')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeResultTab === 'quiz'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Diagnostic Quiz</span>
              </button>
            </div>
          </div>

          {/* TAB 1: 10-Day Sprint Plan */}
          {activeResultTab === 'plan' && workflowResult.generatedPlan && (
            <div className="pt-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/40 border border-indigo-100 rounded-xl p-4">
                <div>
                  <div className="text-xs text-indigo-700 font-semibold uppercase tracking-wider">
                    Planner Agent Milestone Output
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                    {workflowResult.generatedPlan.totalDays} Days · {workflowResult.generatedPlan.dailyHours} hrs/day ({workflowResult.generatedPlan.totalHours} Total Hours)
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600 mt-1">
                    <span>High Yield: Unit 3 Normalization (25 Marks)</span>
                    <span>·</span>
                    <span>Concurrency & 2PL (22 Marks)</span>
                  </div>
                </div>

                <button
                  onClick={handleSavePlan}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                    planSavedSuccess
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {planSavedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Plan Added to My Dashboard!</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Apply Plan to My Schedule</span>
                    </>
                  )}
                </button>
              </div>

              {/* Days Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {workflowResult.generatedPlan.days?.map(day => (
                  <div
                    key={day.dayNumber}
                    className="p-3.5 rounded-xl border border-slate-200/90 hover:border-indigo-300 transition-all bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {day.dateStr}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {day.allocatedHours} hrs
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 mt-1.5">{day.title}</div>
                    <div className="text-[11px] text-slate-500">{day.focusArea}</div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                      {day.topics?.map((t, tidx) => (
                        <div key={tidx} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 line-clamp-1">{t.topicName}</span>
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.2 rounded shrink-0 ${
                              t.activity === 'Learn'
                                ? 'bg-blue-50 text-blue-700'
                                : t.activity === 'Practice'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {t.activity} ({t.estimatedMinutes}m)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Tutor Explanation & RAG Citations */}
          {activeResultTab === 'tutor' && (
            <div className="pt-5 space-y-6">
              {/* RAG Note Retrieval Banner */}
              <div className="bg-purple-50/50 border border-purple-200/80 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  RAG Retrieval Agent: Matched Chunks From Student Handouts
                </div>
                <div className="space-y-2">
                  {workflowResult.retrievedNotes.map((note, nIdx) => (
                    <div key={nIdx} className="bg-white/80 border border-purple-100 rounded-lg p-2.5 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-purple-700 font-semibold mb-1">
                        <span>{note.documentName} · Page {note.page}</span>
                        <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          Sim Score: {note.similarityScore}
                        </span>
                      </div>
                      <p className="text-slate-700 text-xs italic">&ldquo;{note.excerpt}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tutor Pedagogical Breakdown */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {workflowResult.tutorExplanation.title}
                  </h3>
                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 mt-2">
                    <span className="font-bold">Intuitive Real-World Analogy: </span>
                    {workflowResult.tutorExplanation.eli5Summary}
                  </div>
                </div>

                {/* 4 Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {workflowResult.tutorExplanation.stepByStepBreakdown.map(step => (
                    <div key={step.step} className="p-4 rounded-xl border border-slate-200 bg-slate-50/30">
                      <div className="text-xs font-bold text-indigo-700">Step {step.step}</div>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">{step.heading}</h4>
                      <p className="text-xs text-slate-600 mt-1">{step.content}</p>

                      {step.rules && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 space-y-1">
                          {step.rules.map((r, ridx) => (
                            <div key={ridx} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                              <span className="text-indigo-500 font-bold">•</span>
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Practical Example & Trap */}
                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto space-y-2">
                  <div className="text-emerald-400 font-bold">// Practical Exam Schema Decomposition:</div>
                  <pre className="text-[11px] whitespace-pre-wrap">{workflowResult.tutorExplanation.practicalExample}</pre>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900">
                  <span className="font-bold">⚠️ Warning on University Exam Traps: </span>
                  {workflowResult.tutorExplanation.examTrapWarning}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const dbms = subjects.find(s => s.id === 'sub-dbms');
                      const topic = dbms?.units.find(u => u.id === 'dbms-u3')?.topics.find(t => t.id === 'top-dbms-3nf');
                      if (topic) setSelectedTopicForTutor(topic);
                      setActiveTab('tutor');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5"
                  >
                    <span>Open in Full Interactive AI Tutor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Diagnostic Quiz & Progressive Unlock */}
          {activeResultTab === 'quiz' && (
            <div className="pt-5 space-y-5">
              <div className="bg-purple-50/50 border border-purple-200/80 rounded-xl p-4">
                <div className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Assessment Agent: Diagnostic Gate
                </div>
                <p className="text-xs text-purple-900 mt-0.5">
                  Answer the questions below to test your understanding. Scoring ≥ 70% automatically unlocks Boyce-Codd Normal Form (BCNF) on your syllabus tree and updates your student mastery score.
                </p>
              </div>

              <div className="space-y-4">
                {workflowResult.diagnosticQuiz.map((q, idx) => {
                  const selected = selectedQuizAnswers[q.id];
                  const isCorrect = selected === q.correctAnswerIndex;

                  return (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-700">Question {idx + 1}</span>
                        <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-900">{q.question}</div>

                      <div className="mt-3 space-y-2">
                        {q.options.map((opt, optIdx) => {
                          let optStyle = 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-800';
                          if (selected === optIdx) {
                            optStyle = 'border-indigo-400 bg-indigo-50 text-indigo-900 font-semibold';
                          }
                          if (quizSubmitted) {
                            if (optIdx === q.correctAnswerIndex) {
                              optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                            } else if (selected === optIdx) {
                              optStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(q.id, optIdx)}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIdx === q.correctAnswerIndex && (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                          <span className="font-bold text-slate-900">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  {Object.keys(selectedQuizAnswers).length} of {workflowResult.diagnosticQuiz.length} answered
                </span>
                {!quizSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedQuizAnswers).length === 0}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
                  >
                    Submit & Evaluate Mastery
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                      Mastery Evaluated & Topic Progress Recorded!
                    </span>
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setSelectedQuizAnswers({});
                      }}
                      className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
