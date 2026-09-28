export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Critical';

export interface Topic {
  id: string;
  name: string;
  unitId: string;
  subjectId: string;
  description: string;
  difficulty: Difficulty;
  examWeightage: number; // percentage or marks e.g. 25
  isCovered: boolean;
  isUnlocked: boolean;
  score?: number;
  prerequisites: string[]; // Topic IDs that must be completed first
  keyFormulasOrRules?: string[];
}

export interface Unit {
  id: string;
  unitNumber: number;
  title: string;
  subjectId: string;
  topics: Topic[];
  weightageMarks: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  instructor: string;
  totalTopics: number;
  coveredTopics: number;
  color: string; // pastel theme e.g. "indigo", "emerald", "amber", "rose"
  nextExamDate?: string;
  units: Unit[];
}

export interface Exam {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  title: string;
  date: string;
  daysRemaining: number;
  targetScore: number;
  weightagePercent: number;
  priority: 'High' | 'Medium' | 'Urgent';
}

export interface StudyTask {
  id: string;
  subjectId: string;
  topicId?: string;
  title: string;
  estimatedMinutes: number;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  notesCount?: number;
}

export interface StudyPlanDay {
  dayNumber: number;
  dateStr: string;
  title: string;
  focusArea: string;
  allocatedHours: number;
  topics: {
    topicId: string;
    topicName: string;
    difficulty: Difficulty;
    estimatedMinutes: number;
    activity: 'Learn' | 'Practice' | 'Quiz' | 'Revision';
  }[];
  isCompleted?: boolean;
}

export interface StudyPlan {
  id: string;
  examId: string;
  subjectName: string;
  examDate: string;
  totalDays: number;
  dailyHours: number;
  totalHours: number;
  highYieldTopics: string[];
  days: StudyPlanDay[];
  createdViaAgent: boolean;
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: Difficulty;
}

export interface NoteChunk {
  id: string;
  documentId: string;
  documentName: string;
  page: number;
  heading: string;
  text: string;
  tags: string[];
}

export interface StudyNote {
  id: string;
  subjectId: string;
  title: string;
  uploadedAt: string;
  fileSize: string;
  fileType: string;
  totalChunks: number;
  chunks: NoteChunk[];
}

export interface AgentStepTrace {
  agentName: 'Coordinator Agent' | 'Syllabus Agent' | 'Time & Planner Agent' | 'RAG Retriever Agent' | 'AI Tutor Agent' | 'Assessment Agent';
  action: string;
  status: 'waiting' | 'running' | 'completed' | 'failed';
  timestamp: string;
  latencyMs?: number;
  thoughtLog: string;
  toolUsed?: string;
  toolInput?: Record<string, any>;
  toolOutput?: Record<string, any>;
}

export interface AgentWorkflowResult {
  query: string;
  studentGoal: {
    targetSubject: string;
    targetTopic: string;
    daysRemaining: number;
    availableDailyHours: number;
    urgencyLevel: string;
  };
  steps: AgentStepTrace[];
  retrievedNotes: {
    documentName: string;
    page: number;
    similarityScore: number;
    excerpt: string;
  }[];
  generatedPlan: StudyPlan;
  tutorExplanation: {
    title: string;
    eli5Summary: string;
    stepByStepBreakdown: {
      step: number;
      heading: string;
      content: string;
      rules?: string[];
    }[];
    practicalExample: string;
    examTrapWarning: string;
  };
  diagnosticQuiz: QuizQuestion[];
}

export interface StudentProfile {
  name: string;
  rollNo: string;
  semester: string;
  department: string;
  college: string;
  targetGpa: number;
  currentGpa: number;
  overallSyllabusProgress: number;
  activeStudyStreakDays: number;
}
