import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Filter,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Difficulty } from '../types';

export const StudyPlanner: React.FC = () => {
  const {
    exams,
    activePlan,
    subjects,
    setActiveTab,
    setSelectedTopicForTutor,
    launchAgentWorkflowWithPrompt,
  } = useStudy();

  const [selectedExamId, setSelectedExamId] = useState<string>('ex-dbms-mid');
  const [dailyHours, setDailyHours] = useState<number>(2.5);
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | Difficulty>('All');

  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];
  const relatedSubject = subjects.find(s => s.id === currentExam.subjectId);

  // Collect all topics for the selected subject
  const allSubjectTopics = relatedSubject?.units.flatMap(u => u.topics) || [];
  const filteredTopics = allSubjectTopics.filter(t => {
    if (difficultyFilter === 'All') return true;
    return t.difficulty === difficultyFilter;
  });

  const coveredCount = allSubjectTopics.filter(t => t.isCovered).length;
  const remainingCount = allSubjectTopics.length - coveredCount;

  return (
    <div className="space-y-6">
      {/* 1. Planner Header & Exam Selector */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Syllabus & Exam Planner
              </span>
              <span className="text-xs text-slate-500">Autonomous Schedule Optimization</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Exam Preparation & Duration Matrix
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Plan your daily study duration, review important high-yield topics, and map prerequisite difficulty levels.
            </p>
          </div>

          {/* Exam Selector */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">Target Exam:</label>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
            >
              {exams.map(e => (
                <option key={e.id} value={e.id}>
                  {e.subjectCode} - {e.title} ({e.daysRemaining} days left)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Exam Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4">
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium">Exam Date & Countdown</div>
            <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              {currentExam.date} ({currentExam.daysRemaining} days)
            </div>
            <div className="text-[10px] text-rose-600 font-semibold mt-0.5">{currentExam.priority} Priority</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium">Daily Study Budget</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm sm:text-base font-bold text-slate-900">{dailyHours} hrs/day</span>
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={dailyHours}
                onChange={e => setDailyHours(parseFloat(e.target.value))}
                className="w-16 accent-indigo-600 cursor-pointer"
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Total Budget: {Math.round(currentExam.daysRemaining * dailyHours)} hours
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium">Topics Covered</div>
            <div className="text-sm sm:text-base font-bold text-emerald-600 mt-0.5">
              {coveredCount} of {allSubjectTopics.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {Math.round((coveredCount / (allSubjectTopics.length || 1)) * 100)}% Complete
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium">Remaining Deficit</div>
            <div className="text-sm sm:text-base font-bold text-amber-600 mt-0.5">
              {remainingCount} Topics
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Needs prioritization</div>
          </div>
        </div>
      </div>

      {/* 2. Important High-Yield Topics Ranked by Exam Weightage & Difficulty */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Important Topics for {relatedSubject?.name || 'Subject'}
            </h2>
            <p className="text-xs text-slate-500">
              Organized by difficulty level, historical weightage, and coverage status
            </p>
          </div>

          {/* Difficulty Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Easy', 'Medium', 'Hard', 'Critical'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  difficultyFilter === diff
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Topics Table/List */}
        <div className="space-y-2.5">
          {filteredTopics.map(topic => {
            const isCompleted = topic.isCovered;
            let diffStyle = 'bg-slate-100 text-slate-700';
            if (topic.difficulty === 'Critical') diffStyle = 'bg-rose-50 text-rose-800 border border-rose-200';
            if (topic.difficulty === 'Hard') diffStyle = 'bg-amber-50 text-amber-800 border border-amber-200';
            if (topic.difficulty === 'Medium') diffStyle = 'bg-blue-50 text-blue-800 border border-blue-200';
            if (topic.difficulty === 'Easy') diffStyle = 'bg-emerald-50 text-emerald-800 border border-emerald-200';

            return (
              <div
                key={topic.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-50/50 border-slate-200/70'
                    : 'bg-white border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{topic.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded ${diffStyle}`}>
                      {topic.difficulty}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Weightage: ~{topic.examWeightage} Marks
                    </span>
                    {topic.score && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                        Score: {topic.score}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 max-w-2xl">{topic.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      isCompleted
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-amber-800 bg-amber-50'
                    }`}
                  >
                    {isCompleted ? 'Covered' : 'Pending Study'}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedTopicForTutor(topic);
                      setActiveTab('tutor');
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                  >
                    AI Tutor
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Daily Study Schedule (Active Sprint Plan) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                10-Day Exam Sprint Schedule
              </h2>
              <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
                Agent Generated
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Balanced distribution of learning, practice, quizzes, and final revision slots.
            </p>
          </div>

          <button
            onClick={() =>
              launchAgentWorkflowWithPrompt(
                `Re-optimize study plan for ${currentExam.subjectCode} with ${dailyHours} hours per day.`
              )
            }
            className="px-3.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Re-optimize Plan with Agent</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activePlan.days.map(day => (
            <div
              key={day.dayNumber}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/20 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{day.dateStr}</span>
                <span className="text-[11px] font-semibold text-slate-500">{day.allocatedHours} hrs</span>
              </div>
              <div className="text-xs font-semibold text-indigo-700 mt-1">{day.title}</div>
              <div className="text-[11px] text-slate-500">{day.focusArea}</div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                {day.topics.map((t, tidx) => (
                  <div key={tidx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 line-clamp-1">{t.topicName}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      {t.activity} ({t.estimatedMinutes}m)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
