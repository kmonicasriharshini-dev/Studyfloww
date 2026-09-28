import React, { useState } from 'react';
import {
  FileSearch,
  Upload,
  Sparkles,
  BookOpen,
  HelpCircle,
  Plus,
  CheckCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  FolderOpen,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { analyzeSyllabusText } from '../services/api';

export const SyllabusAnalyzer: React.FC = () => {
  const {
    subjects,
    setActiveTab,
    setSelectedTopicForTutor,
    setSelectedTopicForQuiz,
    addTask,
  } = useStudy();

  const [selectedSubjectCode, setSelectedSubjectCode] = useState('CS501');
  const [syllabusInput, setSyllabusInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [activeUnitId, setActiveUnitId] = useState<string | null>('dbms-u3');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentSubject = subjects.find(s => s.code === selectedSubjectCode) || subjects[0];

  const sampleSyllabi: Record<string, string> = {
    CS501: `COURSE CODE: CS501 | DATABASE MANAGEMENT SYSTEMS (4 CREDITS)
UNIT 1: ER MODEL & RELATIONAL ALGEBRA
Entity Relationship model: Entities, attributes, relationships, constraints, weak entity sets. Relational Model: Relational algebra operators, select, project, cartesian product, joins (natural, theta, outer), division. (15 Marks)

UNIT 2: SQL & ADVANCED QUERY OPTIMIZATION
DDL, DML, DCL commands. Correlated subqueries, Common Table Expressions (CTEs), window functions, indexes. Heuristic query optimization, query tree transformation, pushing selections. (18 Marks)

UNIT 3: RELATIONAL DATABASE DESIGN & NORMALIZATION (HIGH YIELD - 25 MARKS)
Functional dependencies, Armstrong axioms, closure of attributes (X+), minimal cover. Normal Forms: 1NF (atomic domains), 2NF (elimination of partial dependencies), 3NF (elimination of transitive dependencies, prime attribute condition), Boyce-Codd Normal Form (BCNF, strict superkey rule). Lossless join decomposition theorem and dependency preservation.

UNIT 4: TRANSACTIONS & CONCURRENCY CONTROL (22 MARKS)
Transaction concept, ACID properties, serializability (conflict and view). Concurrency control protocols: Two-Phase Locking (2PL, strict and rigorous), Timestamp-based ordering, deadlock prevention, detection, wait-die and wound-wait schemes.

UNIT 5: STORAGE & INDEXING (20 MARKS)
File organization, primary, secondary, and clustering indexes. B-Trees and B+ Trees: structure, search, insertion, and node splitting algorithms. Static and dynamic hashing techniques.`,
    CS502: `COURSE CODE: CS502 | OPERATING SYSTEMS (4 CREDITS)
UNIT 1: PROCESS MANAGEMENT & CPU SCHEDULING (20 MARKS)
Processes, Process Control Block (PCB), thread models. Scheduling criteria: FCFS, SJF, SRTF, Round Robin, Multilevel Feedback Queues.

UNIT 2: PROCESS SYNCHRONIZATION & DEADLOCKS (25 MARKS)
Critical section problem, Peterson's solution, Semaphores, Monitors. Deadlocks: Characterization, Deadlock prevention, Deadlock avoidance with Banker's Algorithm (Safety and Resource-Request algorithms), Deadlock detection and recovery.`,
  };

  const handleLoadSample = (code: string) => {
    setSelectedSubjectCode(code);
    setSyllabusInput(sampleSyllabi[code] || '');
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const textToAnalyze = syllabusInput || sampleSyllabi[selectedSubjectCode] || '';

    try {
      const result = await analyzeSyllabusText(textToAnalyze, currentSubject.code, currentSubject.name);
      setExtractedData(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Ingestion Controller */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Syllabus Analyzer Agent
              </span>
              <span className="text-xs text-slate-500">Document Parsing & Unit Decomposition</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Curriculum Ingestion & Topic Organizer
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Extract subjects, units, individual topics, and weightage rankings from official university syllabi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleLoadSample('CS501')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Load CS501 Syllabus
            </button>
            <button
              onClick={() => handleLoadSample('CS502')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Load CS502 Syllabus
            </button>
          </div>
        </div>

        {/* Input Textarea & Trigger */}
        <div className="mt-4 space-y-3">
          <textarea
            rows={4}
            value={syllabusInput}
            onChange={e => setSyllabusInput(e.target.value)}
            placeholder="Paste raw university syllabus text here (units, topics, marks distribution)..."
            className="w-full p-3 text-xs font-mono bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-400 focus:bg-white text-slate-800 transition-all resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Subject: <strong className="text-slate-800">{currentSubject.name}</strong> ({currentSubject.code})
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? 'Extracting with Agent...' : 'Extract & Organize Topics'}</span>
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Structured Syllabus Hierarchy by Subject & Units */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {currentSubject.name} ({currentSubject.code})
            </h2>
            <p className="text-xs text-slate-500">
              Organized into {currentSubject.units.length} Academic Units · {currentSubject.totalTopics} Extracted Topics
            </p>
          </div>

          <div className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg font-semibold">
            {currentSubject.coveredTopics}/{currentSubject.totalTopics} Covered ({Math.round((currentSubject.coveredTopics / (currentSubject.totalTopics || 1)) * 100)}%)
          </div>
        </div>

        {/* Units Accordion / Hierarchy */}
        <div className="space-y-4">
          {currentSubject.units.map(unit => {
            const isHighYield = unit.weightageMarks >= 20;
            const isOpen = activeUnitId === unit.id;

            return (
              <div
                key={unit.id}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs"
              >
                {/* Unit Header */}
                <div
                  onClick={() => setActiveUnitId(isOpen ? null : unit.id)}
                  className="flex items-center justify-between p-4 cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                      U{unit.unitNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Unit {unit.unitNumber}: {unit.title}</span>
                        {isHighYield && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                            High Yield (~{unit.weightageMarks} Marks)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {unit.topics.length} Key Subtopics · Exam Weightage: {unit.weightageMarks} Marks
                      </div>
                    </div>
                  </div>

                  <div className="text-slate-400">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Unit Topics Breakdown */}
                {isOpen && (
                  <div className="p-4 pt-2 border-t border-slate-100 space-y-2.5 bg-white">
                    {unit.topics.map(topic => (
                      <div
                        key={topic.id}
                        className="p-3 rounded-lg border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/20"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{topic.name}</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.2 rounded ${
                                topic.difficulty === 'Critical'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : topic.difficulty === 'Hard'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {topic.difficulty}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Weightage: ~{topic.examWeightage} Marks
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{topic.description}</p>
                        </div>

                        {/* Actions for this topic */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedTopicForTutor(topic);
                              setActiveTab('tutor');
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                          >
                            AI Tutor
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTopicForQuiz(topic);
                              setActiveTab('quiz');
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                          >
                            Quiz
                          </button>
                          <button
                            onClick={() => {
                              addTask({
                                subjectId: currentSubject.id,
                                topicId: topic.id,
                                title: `Study ${topic.name}`,
                                estimatedMinutes: 45,
                                status: 'pending',
                                dueDate: 'Tomorrow',
                                priority: topic.difficulty === 'Critical' ? 'high' : 'medium',
                                notesCount: 1,
                              });
                              showToast(`Added "${topic.name}" to study tasks!`);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Add to tasks"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
