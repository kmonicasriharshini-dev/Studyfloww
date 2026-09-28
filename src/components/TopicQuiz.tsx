import React, { useState } from 'react';
import {
  HelpCircle,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  AlertCircle,
  Trophy,
  Award,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { sampleQuizQuestions } from '../data/mockData';
import { QuizQuestion, Topic } from '../types';

export const TopicQuiz: React.FC = () => {
  const {
    subjects,
    selectedTopicForQuiz,
    setSelectedTopicForQuiz,
    unlockTopicAndRecordScore,
    setActiveTab,
    setSelectedTopicForTutor,
  } = useStudy();

  const [activeSubjectId, setActiveSubjectId] = useState('sub-dbms');
  const currentSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];
  const allSubjectTopics = currentSubject.units.flatMap(u => u.topics);

  // Active quiz topic
  const [activeQuizTopicId, setActiveQuizTopicId] = useState<string>(() => {
    return selectedTopicForQuiz?.id || 'top-dbms-3nf';
  });

  const activeTopic = allSubjectTopics.find(t => t.id === activeQuizTopicId) || allSubjectTopics[0];

  // Current questions
  const questions: QuizQuestion[] = sampleQuizQuestions[activeQuizTopicId] || sampleQuizQuestions['top-dbms-3nf'];

  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [unlockedSuccessName, setUnlockedSuccessName] = useState<string | null>(null);

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    let correct = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswerIndex) correct++;
    });

    const scorePercent = Math.round((correct / (questions.length || 1)) * 100);

    if (scorePercent >= 70) {
      const res = unlockTopicAndRecordScore(activeQuizTopicId, scorePercent);
      if (res.nextTopicName) {
        setUnlockedSuccessName(res.nextTopicName);
      }
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setUnlockedSuccessName(null);
  };

  const calculatedScore = isSubmitted
    ? Math.round(
        (questions.filter(q => userAnswers[q.id] === q.correctAnswerIndex).length / (questions.length || 1)) * 100
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header & Subject Selector */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Progressive Mastery Quiz
              </span>
              <span className="text-xs text-slate-500">Prerequisite Topic Unlocking</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Diagnostic Testing & Topic Unlock Engine
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Score ≥ 70% to master a concept and automatically unlock the next prerequisite topic on your syllabus path.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">Subject:</span>
            <select
              value={activeSubjectId}
              onChange={e => {
                setActiveSubjectId(e.target.value);
                const firstTopic = subjects.find(s => s.id === e.target.value)?.units[0]?.topics[0];
                if (firstTopic) setActiveQuizTopicId(firstTopic.id);
                handleResetQuiz();
              }}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Progressive Unlock Path (Dependency Road) */}
        <div className="mt-5">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Unit 3: Normalization Prerequisite Dependency Road</span>
            <span className="text-slate-500 font-normal">Next topics unlock upon passing current test</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {allSubjectTopics.slice(2, 7).map((topic, idx) => {
              const isSelected = activeQuizTopicId === topic.id;
              const isLocked = !topic.isUnlocked;

              return (
                <button
                  key={topic.id}
                  disabled={isLocked}
                  onClick={() => {
                    setActiveQuizTopicId(topic.id);
                    handleResetQuiz();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-200 shadow-xs'
                      : isLocked
                      ? 'border-slate-200 bg-slate-50/80 opacity-60 cursor-not-allowed'
                      : topic.isCovered
                      ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-semibold text-slate-500">
                      Step {idx + 1}
                    </span>
                    {isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    ) : topic.isCovered ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </div>

                  <div className="text-xs font-bold text-slate-900 line-clamp-1">{topic.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {isLocked
                      ? 'Locked (Needs Prev)'
                      : topic.score
                      ? `Passed (${topic.score}%)`
                      : 'Ready for Quiz'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Unlock Success Celebration Banner */}
      {unlockedSuccessName && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                Mastery Threshold Met (≥ 70%)
              </div>
              <h3 className="text-base font-bold">
                Unlocked Next Topic: &ldquo;{unlockedSuccessName}&rdquo;!
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Your student profile progress has been updated and the topic is now available for study.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const allT = subjects.flatMap(s => s.units.flatMap(u => u.topics));
              const unlockedT = allT.find(t => t.name === unlockedSuccessName);
              if (unlockedT) {
                setSelectedTopicForTutor(unlockedT);
                setActiveTab('tutor');
              }
            }}
            className="px-4 py-2 text-xs font-semibold bg-white text-emerald-900 rounded-xl hover:bg-emerald-50 transition-colors shadow-xs"
          >
            Study with AI Tutor
          </button>
        </div>
      )}

      {/* 3. Active Quiz Question View */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Topic Quiz
              </span>
              <h2 className="text-base font-bold text-slate-900">{activeTopic?.name}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Passing threshold: 70% · Total questions: {questions.length}
            </p>
          </div>

          {isSubmitted && (
            <div className="flex items-center gap-3">
              <div
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                  calculatedScore >= 70
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                Score: {calculatedScore}% ({calculatedScore >= 70 ? 'PASSED & UNLOCKED' : 'FAILED - RETRY'})
              </div>
              <button
                onClick={handleResetQuiz}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Quiz</span>
              </button>
            </div>
          )}
        </div>

        {/* Questions list */}
        <div className="pt-5 space-y-6">
          {questions.map((q, idx) => {
            const selected = userAnswers[q.id];
            const isCorrect = selected === q.correctAnswerIndex;

            return (
              <div key={q.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/20 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-slate-800">Question {idx + 1} of {questions.length}</span>
                  <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                    {q.difficulty}
                  </span>
                </div>

                <div className="text-xs sm:text-sm font-semibold text-slate-900">{q.question}</div>

                {/* Options */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    let optStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';
                    if (selected === optIdx) {
                      optStyle = 'border-indigo-400 bg-indigo-50/80 text-indigo-900 font-semibold';
                    }
                    if (isSubmitted) {
                      if (optIdx === q.correctAnswerIndex) {
                        optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                      } else if (selected === optIdx) {
                        optStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isSubmitted}
                        onClick={() => handleSelectAnswer(q.id, optIdx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${optStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px] flex items-center justify-center font-bold">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isSubmitted && optIdx === q.correctAnswerIndex && (
                          <Check className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation on submit */}
                {isSubmitted && (
                  <div className="mt-3 p-3.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-slate-900">Explanation & Proof:</div>
                    <div className="text-slate-600 leading-relaxed">{q.explanation}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {Object.keys(userAnswers).length} of {questions.length} answered
          </div>

          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(userAnswers).length < questions.length}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              Submit & Check Mastery
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedTopicForTutor(activeTopic);
                  setActiveTab('tutor');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors"
              >
                Review Concepts with AI Tutor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
