import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StudentProfile,
  Subject,
  Exam,
  StudyTask,
  StudyNote,
  StudyPlan,
  Topic,
  QuizQuestion,
} from '../types';
import {
  initialStudentProfile,
  initialSubjects,
  initialExams,
  initialTasks,
  initialStudyNotes,
  sample10DayDBMSPlan,
} from '../data/mockData';

interface StudyContextType {
  studentProfile: StudentProfile;
  setStudentProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  subjects: Subject[];
  exams: Exam[];
  tasks: StudyTask[];
  notes: StudyNote[];
  activePlan: StudyPlan;
  setActivePlan: (plan: StudyPlan) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTopicForTutor: Topic | null;
  setSelectedTopicForTutor: (topic: Topic | null) => void;
  selectedTopicForQuiz: Topic | null;
  setSelectedTopicForQuiz: (topic: Topic | null) => void;
  activeAgentPrompt: string;
  setActiveAgentPrompt: (prompt: string) => void;
  toggleTaskStatus: (taskId: string) => void;
  addTask: (task: Omit<StudyTask, 'id'>) => void;
  addNote: (note: StudyNote) => void;
  unlockTopicAndRecordScore: (topicId: string, score: number) => { nextTopicName?: string };
  launchAgentWorkflowWithPrompt: (prompt: string) => void;
  saveAgentPlanToSchedule: (plan: StudyPlan) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('studyflow_student');
    return saved ? JSON.parse(saved) : initialStudentProfile;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('studyflow_subjects');
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('studyflow_exams');
    return saved ? JSON.parse(saved) : initialExams;
  });

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    const saved = localStorage.getItem('studyflow_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [notes, setNotes] = useState<StudyNote[]>(() => {
    const saved = localStorage.getItem('studyflow_notes');
    return saved ? JSON.parse(saved) : initialStudyNotes;
  });

  const [activePlan, setActivePlan] = useState<StudyPlan>(() => {
    const saved = localStorage.getItem('studyflow_plan');
    return saved ? JSON.parse(saved) : sample10DayDBMSPlan;
  });

  const [activeTab, setActiveTab] = useState<string>('agent-workflow');
  const [selectedTopicForTutor, setSelectedTopicForTutor] = useState<Topic | null>(() => {
    // Default to 3NF or Normalization topic
    const dbms = initialSubjects.find(s => s.id === 'sub-dbms');
    const u3 = dbms?.units.find(u => u.id === 'dbms-u3');
    return u3?.topics.find(t => t.id === 'top-dbms-3nf') || null;
  });
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState<Topic | null>(null);
  const [activeAgentPrompt, setActiveAgentPrompt] = useState<string>(
    "I have a DBMS exam in 10 days and I haven't studied normalization."
  );

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('studyflow_student', JSON.stringify(studentProfile));
  }, [studentProfile]);

  useEffect(() => {
    localStorage.setItem('studyflow_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('studyflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('studyflow_plan', JSON.stringify(activePlan));
  }, [activePlan]);

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const addTask = (newTask: Omit<StudyTask, 'id'>) => {
    const task: StudyTask = {
      ...newTask,
      id: `task-${Date.now()}`,
    };
    setTasks(prev => [task, ...prev]);
  };

  const addNote = (newNote: StudyNote) => {
    setNotes(prev => [newNote, ...prev]);
  };

  const unlockTopicAndRecordScore = (topicId: string, score: number): { nextTopicName?: string } => {
    let nextUnlockedName = '';

    setSubjects(prevSubjects => {
      let updatedTopicList: Topic[] = [];

      const newSubs = prevSubjects.map(sub => {
        return {
          ...sub,
          units: sub.units.map(unit => {
            return {
              ...unit,
              topics: unit.topics.map(t => {
                if (t.id === topicId) {
                  return { ...t, isCovered: true, score };
                }
                return t;
              }),
            };
          }),
        };
      });

      // Check dependent topics that require topicId
      const finalSubs = newSubs.map(sub => {
        return {
          ...sub,
          units: sub.units.map(unit => {
            return {
              ...unit,
              topics: unit.topics.map(t => {
                if (t.prerequisites?.includes(topicId) && !t.isUnlocked) {
                  nextUnlockedName = t.name;
                  return { ...t, isUnlocked: true };
                }
                return t;
              }),
            };
          }),
        };
      });

      // Recalculate total covered topics
      let total = 0;
      let covered = 0;
      finalSubs.forEach(s => {
        s.units.forEach(u => {
          u.topics.forEach(t => {
            total++;
            if (t.isCovered) covered++;
          });
        });
      });

      const newProgress = Math.round((covered / (total || 1)) * 100);
      setStudentProfile(prev => ({ ...prev, overallSyllabusProgress: newProgress }));

      return finalSubs;
    });

    return { nextTopicName: nextUnlockedName };
  };

  const launchAgentWorkflowWithPrompt = (prompt: string) => {
    setActiveAgentPrompt(prompt);
    setActiveTab('agent-workflow');
  };

  const saveAgentPlanToSchedule = (plan: StudyPlan) => {
    setActivePlan(plan);
    // Also inject high-priority tasks into student dashboard tasks
    const firstDay = plan.days[0];
    if (firstDay && firstDay.topics.length > 0) {
      firstDay.topics.forEach(t => {
        addTask({
          subjectId: 'sub-dbms',
          topicId: t.topicId,
          title: `[Plan Day ${firstDay.dayNumber}] ${t.topicName} (${t.activity})`,
          estimatedMinutes: t.estimatedMinutes,
          status: 'pending',
          dueDate: firstDay.dateStr,
          priority: 'high',
          notesCount: 1,
        });
      });
    }
  };

  return (
    <StudyContext.Provider
      value={{
        studentProfile,
        setStudentProfile,
        subjects,
        exams,
        tasks,
        notes,
        activePlan,
        setActivePlan,
        activeTab,
        setActiveTab,
        selectedTopicForTutor,
        setSelectedTopicForTutor,
        selectedTopicForQuiz,
        setSelectedTopicForQuiz,
        activeAgentPrompt,
        setActiveAgentPrompt,
        toggleTaskStatus,
        addTask,
        addNote,
        unlockTopicAndRecordScore,
        launchAgentWorkflowWithPrompt,
        saveAgentPlanToSchedule,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}
