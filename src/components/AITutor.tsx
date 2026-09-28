import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  FileText,
  Search,
  ChevronRight,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { getTutorExplanation } from '../services/api';

export const AITutor: React.FC = () => {
  const {
    subjects,
    selectedTopicForTutor,
    setSelectedTopicForTutor,
    notes,
    setActiveTab,
    setSelectedTopicForQuiz,
  } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [explanationMode, setExplanationMode] = useState<'simple' | 'step_by_step' | 'cheat_sheet'>('simple');
  const [isNotesGrounded, setIsNotesGrounded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [tutorData, setTutorData] = useState<any>(null);
  const [activePracticeTab, setActivePracticeTab] = useState<'explanation' | 'practice'>('explanation');
  const [showHintIndex, setShowHintIndex] = useState<number | null>(null);
  const [showSolutionIndex, setShowSolutionIndex] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Default to DBMS 3NF / Normalization if not set
  const currentTopicName = selectedTopicForTutor?.name || 'Relational Database Normalization (3NF & BCNF)';

  useEffect(() => {
    fetchExplanation(currentTopicName, explanationMode, isNotesGrounded);
  }, [currentTopicName, explanationMode, isNotesGrounded]);

  const fetchExplanation = async (topic: string, mode: any, grounded: boolean) => {
    setIsLoading(true);
    try {
      const data = await getTutorExplanation(topic, mode, grounded);
      setTutorData(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Sample interactive practice questions
  const practiceProblems = [
    {
      id: 'p1',
      title: 'Lossless Join Decomposition Verification',
      problem:
        'Given relation R(A, B, C, D) with FDs {A -> B, B -> C, C -> D}. A student decomposes R into R1(A, B) and R2(B, C, D). Is this decomposition lossless?',
      hint: 'Find the intersection (R1 ∩ R2). Check if the attribute closure of this intersection determines either R1 or R2.',
      solution:
        'Step 1: Compute intersection (R1 ∩ R2) = {B}.\nStep 2: Compute closure of {B}: B -> C and C -> D, so {B}+ = {B, C, D}.\nStep 3: Since {B}+ contains all attributes of R2(B, C, D), {B} is a superkey of R2.\nConclusion: The decomposition IS lossless with respect to F!',
    },
    {
      id: 'p2',
      title: 'Identifying Normal Form of Student-Advising Schema',
      problem:
        'Relation R(Student_ID, Course_ID, Advisor_ID, Advisor_Office). Primary Key is {Student_ID, Course_ID}. Each advisor has one office (Advisor_ID -> Advisor_Office). What normal form does this relation satisfy?',
      hint: 'Identify prime attributes vs non-prime attributes. Does Advisor_Office depend on a candidate key, or on another non-prime attribute?',
      solution:
        'Prime attributes: {Student_ID, Course_ID}.\nNon-prime attributes: {Advisor_ID, Advisor_Office}.\n1. In 1NF (all attributes atomic).\n2. In 2NF because neither Advisor_ID nor Advisor_Office depends on a proper subset of {Student_ID, Course_ID}.\n3. Violates 3NF because Advisor_ID -> Advisor_Office is a transitive dependency (non-prime -> non-prime) where Advisor_ID is not a superkey and Advisor_Office is not prime.\nConclusion: The relation is in 2NF, but NOT in 3NF.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                Personalized AI Tutor
              </span>
              <span className="text-xs text-slate-500">Step-by-Step Explanations & Socratic Practice</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Interactive Study & Concept Coaching
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Simplifies complex university concepts into clear analogies, detailed algorithmic proofs, and practice sets.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setExplanationMode('simple')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  explanationMode === 'simple'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Simple Intuitive (ELI5)
              </button>
              <button
                onClick={() => setExplanationMode('step_by_step')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  explanationMode === 'step_by_step'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Step-by-Step Deep Dive
              </button>
              <button
                onClick={() => setExplanationMode('cheat_sheet')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  explanationMode === 'cheat_sheet'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Exam Traps & Formulas
              </button>
            </div>
          </div>
        </div>

        {/* Topic Selector & Grounding Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <span className="text-xs font-semibold text-slate-500">Topic:</span>
            <select
              value={selectedTopicForTutor?.id || 'top-dbms-3nf'}
              onChange={e => {
                const allT = subjects.flatMap(s => s.units.flatMap(u => u.topics));
                const found = allT.find(t => t.id === e.target.value);
                if (found) setSelectedTopicForTutor(found);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
            >
              {subjects.flatMap(s =>
                s.units.flatMap(u =>
                  u.topics.map(t => (
                    <option key={t.id} value={t.id}>
                      [{s.code}] {t.name} ({t.difficulty})
                    </option>
                  ))
                )
              )}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isNotesGrounded}
                onChange={e => setIsNotesGrounded(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="font-medium">Ground strictly on uploaded lecture notes</span>
            </label>

            <button
              onClick={() => handleSpeak(tutorData?.explanation || '')}
              className="p-1.5 text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Read aloud"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-indigo-600" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Tabs: Explanation vs Practice Questions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePracticeTab('explanation')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activePracticeTab === 'explanation'
                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tutor Explanation
            </button>
            <button
              onClick={() => setActivePracticeTab('practice')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activePracticeTab === 'practice'
                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Practice Problems ({practiceProblems.length})
            </button>
          </div>

          <button
            onClick={() => {
              if (selectedTopicForTutor) setSelectedTopicForQuiz(selectedTopicForTutor);
              setActiveTab('quiz');
            }}
            className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Take Topic Mastery Quiz</span>
          </button>
        </div>

        {/* Tab 1: Tutor Explanation */}
        {activePracticeTab === 'explanation' && (
          <div className="pt-5 space-y-6">
            {/* Grounding Source Badge */}
            {isNotesGrounded && (
              <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-50/70 border border-purple-200 px-3 py-2 rounded-xl">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  Grounded on <strong>DBMS_Unit3_Normalization_Prof_Roy_Handout.pdf</strong> (Page 14, 16 & 22)
                </span>
              </div>
            )}

            {/* Explanation Content */}
            {isLoading ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <RotateCcw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                <p className="text-xs">AI Tutor is synthesizing step-by-step breakdown...</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {tutorData?.headline || currentTopicName}
                  </h3>
                </div>

                {/* Explanation text formatted nicely */}
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 prose max-w-none">
                  {tutorData?.explanation?.split('\n\n').map((paragraph: string, pIdx: number) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h4 key={pIdx} className="text-sm font-bold text-slate-900 pt-2">
                          {paragraph.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('- ')) {
                      return (
                        <ul key={pIdx} className="list-disc pl-5 space-y-1">
                          {paragraph.split('\n').map((item, iIdx) => (
                            <li key={iIdx}>{item.replace('- ', '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={pIdx}>{paragraph}</p>;
                  })}
                </div>

                {/* Key takeaways */}
                {tutorData?.keyTakeaways && (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      Key Exam Takeaways
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 pl-4 list-disc">
                      {tutorData.keyTakeaways.map((point: string, idx: number) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Exam Trap */}
                {tutorData?.examTrap && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Avoid this Common Examination Mistake: </span>
                      {tutorData.examTrap}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Practice Problems */}
        {activePracticeTab === 'practice' && (
          <div className="pt-5 space-y-5">
            {practiceProblems.map((prob, idx) => {
              const isHintOpen = showHintIndex === idx;
              const isSolutionOpen = showSolutionIndex === idx;

              return (
                <div key={prob.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-800">Practice Problem {idx + 1}</span>
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                      University Exam Standard
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">{prob.title}</h4>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-mono text-slate-800">
                    {prob.problem}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowHintIndex(isHintOpen ? null : idx)}
                      className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isHintOpen ? 'Hide Hint' : 'Show Hint'}</span>
                    </button>

                    <button
                      onClick={() => setShowSolutionIndex(isSolutionOpen ? null : idx)}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isSolutionOpen ? 'Hide Solution' : 'Reveal Step-by-Step Solution'}</span>
                    </button>
                  </div>

                  {isHintOpen && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 text-xs text-amber-900 rounded-lg">
                      <span className="font-bold">Hint: </span>
                      {prob.hint}
                    </div>
                  )}

                  {isSolutionOpen && (
                    <div className="p-3.5 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg whitespace-pre-wrap">
                      <div className="text-emerald-400 font-bold mb-1">// Formal Exam Solution:</div>
                      {prob.solution}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
