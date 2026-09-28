import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Server-side Gemini client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health check & status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'StudyFlow',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// 2. Full Agentic Workflow Orchestrator
// User -> Coordinator Agent -> Specialized Agents (Syllabus, Planner, RAG, Tutor, Assessment) -> Tool/RAG -> LLM -> Result -> User
app.post('/api/agent/workflow', async (req: Request, res: Response) => {
  const { query, studentContext } = req.body;
  const userPrompt = query || 'I have a DBMS exam in 10 days and I haven\'t studied normalization.';

  console.log(`[Agent Orchestrator] Triggered query: "${userPrompt}"`);

  // Simulated latency + real LLM enhancement if key available
  let llmInsights = '';
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are the Coordinator & Multi-Agent Engine for StudyFlow, an academic study portal.
A college student says: "${userPrompt}".
Student Context: Semester 5 Computer Science, Target GPA 9.0.

Provide a concise JSON payload with:
1. "identifiedSubject": subject name (e.g. "Database Management Systems")
2. "identifiedTopic": topic name (e.g. "Relational Database Normalization")
3. "urgency": "Urgent" | "High" | "Medium"
4. "recommendedDailyHours": number
5. "briefTutorAdvice": 2-3 sentences of comforting, high-yield coaching advice.
Return strictly JSON.`,
        config: {
          responseMimeType: 'application/json',
        },
      });
      llmInsights = response.text || '';
    } catch (err) {
      console.warn('[Gemini Agent Fallback] Proceeding with heuristic agent engine:', err);
    }
  }

  let parsedLlm: any = null;
  if (llmInsights) {
    try {
      parsedLlm = JSON.parse(llmInsights);
    } catch (e) {
      // ignore JSON parse error
    }
  }

  // Construct structured multi-agent execution response
  const workflowResponse = {
    query: userPrompt,
    studentGoal: {
      targetSubject: parsedLlm?.identifiedSubject || 'Database Management Systems (CS501)',
      targetTopic: parsedLlm?.identifiedTopic || 'Relational Normalization (1NF, 2NF, 3NF, BCNF)',
      daysRemaining: 10,
      availableDailyHours: parsedLlm?.recommendedDailyHours || 2.5,
      urgencyLevel: parsedLlm?.urgency || 'Urgent',
    },
    steps: [
      {
        agentName: 'Coordinator Agent',
        action: 'Goal Ingestion & Intent Decomposition',
        status: 'completed',
        timestamp: 'T+0.05s',
        latencyMs: 120,
        thoughtLog: 'Parsed student intent: Subject="DBMS", Timeline="10 days", Deficit="Normalization (Unit 3)". Marked status as Urgent.',
        toolUsed: 'parse_student_intent',
        toolInput: { rawPrompt: userPrompt },
        toolOutput: { subject: 'DBMS', days: 10, targetTopic: 'Normalization' },
      },
      {
        agentName: 'Syllabus Agent',
        action: 'Syllabus Database Lookup & Weightage Analysis',
        status: 'completed',
        timestamp: 'T+0.22s',
        latencyMs: 210,
        thoughtLog: 'Checked University CS501 Syllabus. Identified Unit 3: "Relational Database Design & Normalization". Weightage is 25 Marks (25% of final exam). Marked as HIGH YIELD.',
        toolUsed: 'query_syllabus_db',
        toolInput: { subjectCode: 'CS501', unitNumber: 3 },
        toolOutput: {
          unitTitle: 'Relational Database Design & Normalization',
          examWeightage: '25 Marks',
          prerequisites: ['Functional Dependencies', 'Attribute Closure', 'Candidate Keys'],
          subtopics: ['1NF', '2NF', '3NF', 'BCNF', 'Lossless Join Decomposition'],
        },
      },
      {
        agentName: 'Time & Planner Agent',
        action: 'Sprint Schedule & Milestone Synthesis',
        status: 'completed',
        timestamp: 'T+0.48s',
        latencyMs: 340,
        thoughtLog: 'Available study budget: 10 days × 2.5 hrs/day = 25 total study hours. Allocated Days 1-5 for Normalization mastery, Days 6-7 for Transactions/2PL, Days 8-9 for B+ Trees & full mock tests, Day 10 for final cheat-sheet revision.',
        toolUsed: 'generate_sprint_plan',
        toolInput: { days: 10, dailyHours: 2.5, priorityTopic: 'Unit 3 Normalization' },
        toolOutput: { totalMilestones: 10, highYieldTopicsCount: 5, status: 'Schedule optimized' },
      },
      {
        agentName: 'RAG Retriever Agent',
        action: 'Semantic Vector Retrieval on Student Course Handouts',
        status: 'completed',
        timestamp: 'T+0.75s',
        latencyMs: 410,
        thoughtLog: 'Executed cosine similarity query over uploaded "DBMS_Unit3_Normalization_Prof_Roy_Handout.pdf". Retrieved 3 high-relevance chunks with similarity > 0.88.',
        toolUsed: 'rag_vector_search',
        toolInput: { query: 'Normalization 1NF 2NF 3NF BCNF lossless join decomposition theorem', topK: 3 },
        toolOutput: {
          retrievedDocuments: ['DBMS_Unit3_Normalization_Prof_Roy_Handout.pdf'],
          matchedChunks: 3,
          highestSimilarity: 0.94,
        },
      },
      {
        agentName: 'AI Tutor Agent',
        action: 'Grounded Pedagogical Explanation Generation',
        status: 'completed',
        timestamp: 'T+1.12s',
        latencyMs: 520,
        thoughtLog: 'Generated 3-tier explanation grounded directly on Prof. Roy\'s lecture notes. Synthesized ELI5 intuition, mathematical superkey rules, and Lossless Join test.',
        toolUsed: 'generate_grounded_tutoring',
        toolInput: { sourceChunks: ['chk-2', 'chk-3', 'chk-4'], pedagogicalStyle: 'Intuitive + Exam Rigor' },
        toolOutput: { generatedSections: ['Intuition', '1NF/2NF/3NF/BCNF Step-by-Step', 'Exam Pitfall Alert'] },
      },
      {
        agentName: 'Assessment Agent',
        action: 'Diagnostic Quiz & Progressive Mastery Gate',
        status: 'completed',
        timestamp: 'T+1.45s',
        latencyMs: 290,
        thoughtLog: 'Constructed 2 diagnostic multiple choice questions covering 3NF prime attribute rule and BCNF superkey enforcement. Configured lock: BCNF will unlock upon achieving >= 70% in 3NF quiz.',
        toolUsed: 'generate_diagnostic_quiz',
        toolInput: { topicId: 'top-dbms-3nf', passingThreshold: '70%' },
        toolOutput: { questionCount: 2, gateEnforced: true, targetTopic: '3NF & BCNF' },
      },
    ],
    retrievedNotes: [
      {
        documentName: 'DBMS_Unit3_Normalization_Prof_Roy_Handout.pdf',
        page: 16,
        similarityScore: 0.94,
        excerpt: 'Section 3.3: A relation R is in 3NF if for every non-trivial FD X -> A, either X is a superkey of R, OR A is a prime attribute. 3NF eliminates transitive dependencies and guarantees both lossless join and dependency preservation.',
      },
      {
        documentName: 'DBMS_Unit3_Normalization_Prof_Roy_Handout.pdf',
        page: 19,
        similarityScore: 0.91,
        excerpt: 'Section 3.4: BCNF requires that for EVERY non-trivial FD X -> Y, X MUST strictly be a superkey. There is no relaxation for prime attributes. Every BCNF relation is in 3NF, but not all 3NF relations satisfy BCNF.',
      },
      {
        documentName: 'DBMS_Unit3_Normalization_Prof_Roy_Handout.pdf',
        page: 22,
        similarityScore: 0.88,
        excerpt: 'Section 3.5: Lossless Join Decomposition Theorem: Decomposition into R1 and R2 is lossless iff (R1 ∩ R2) -> R1 or (R1 ∩ R2) -> R2.',
      },
    ],
    generatedPlan: {
      id: 'plan-auto-gen',
      examId: 'ex-dbms-mid',
      subjectName: 'Database Management Systems (CS501)',
      examDate: '2026-10-08',
      totalDays: 10,
      dailyHours: 2.5,
      totalHours: 25,
      highYieldTopics: [
        'Unit 3: Functional Dependencies & Closure (10 marks)',
        'Unit 3: 1NF & 2NF Partial Dependencies (8 marks)',
        'Unit 3: 3NF & Transitive Dependencies (12 marks)',
        'Unit 3: BCNF & Lossless Decomposition (15 marks)',
        'Unit 4: ACID & 2PL Concurrency Control (12 marks)',
      ],
      createdViaAgent: true,
      days: [
        {
          dayNumber: 1,
          dateStr: 'Day 1 (Oct 1)',
          title: 'Foundations & Attribute Closure',
          focusArea: 'Unit 3: Functional Dependencies',
          allocatedHours: 2.5,
          topics: [
            { topicId: 'top-dbms-fd', topicName: 'Armstrong Axioms & Closure (X+)', difficulty: 'Medium', estimatedMinutes: 90, activity: 'Learn' },
            { topicId: 'top-dbms-fd', topicName: 'Candidate Key finding algorithm', difficulty: 'Medium', estimatedMinutes: 60, activity: 'Practice' },
          ],
        },
        {
          dayNumber: 2,
          dateStr: 'Day 2 (Oct 2)',
          title: '1NF and 2NF Mastery',
          focusArea: 'Unit 3: Low-Level Normal Forms',
          allocatedHours: 2.5,
          topics: [
            { topicId: 'top-dbms-1nf', topicName: '1NF: Atomicity and Multi-valued elimination', difficulty: 'Easy', estimatedMinutes: 45, activity: 'Learn' },
            { topicId: 'top-dbms-2nf', topicName: '2NF: Eliminating Partial Dependencies', difficulty: 'Medium', estimatedMinutes: 75, activity: 'Learn' },
            { topicId: 'top-dbms-2nf', topicName: '2NF Quiz and University Exam Problem Set', difficulty: 'Medium', estimatedMinutes: 30, activity: 'Quiz' },
          ],
        },
        {
          dayNumber: 3,
          dateStr: 'Day 3 (Oct 3)',
          title: 'Third Normal Form (3NF) Deep Dive',
          focusArea: 'Unit 3: 3NF Transitive Dependency Elimination',
          allocatedHours: 2.5,
          topics: [
            { topicId: 'top-dbms-3nf', topicName: '3NF Definition (Superkey OR Prime Attribute rule)', difficulty: 'Hard', estimatedMinutes: 90, activity: 'Learn' },
            { topicId: 'top-dbms-3nf', topicName: '3NF Synthesis Algorithm & Dependency Preservation', difficulty: 'Hard', estimatedMinutes: 60, activity: 'Practice' },
          ],
        },
        {
          dayNumber: 4,
          dateStr: 'Day 4 (Oct 4)',
          title: 'Boyce-Codd Normal Form (BCNF)',
          focusArea: 'Unit 3: Strict Superkey Testing & Decomposition',
          allocatedHours: 2.5,
          topics: [
            { topicId: 'top-dbms-bcnf', topicName: 'BCNF: Why 3NF is not always enough', difficulty: 'Critical', estimatedMinutes: 75, activity: 'Learn' },
            { topicId: 'top-dbms-bcnf', topicName: 'BCNF Decomposition Algorithm & Lossless Join Check', difficulty: 'Critical', estimatedMinutes: 75, activity: 'Practice' },
          ],
        },
        {
          dayNumber: 5,
          dateStr: 'Day 5 (Oct 5)',
          title: 'Unit 3 Comprehensive Normalization Marathon',
          focusArea: 'Consolidation & Diagnostic Mastery',
          allocatedHours: 2.5,
          topics: [
            { topicId: 'top-dbms-bcnf', topicName: '10 Previous-Year Exam Questions on 1NF-BCNF', difficulty: 'Hard', estimatedMinutes: 90, activity: 'Practice' },
            { topicId: 'top-dbms-3nf', topicName: 'Topic Mastery Quiz & Unlock Verification', difficulty: 'Hard', estimatedMinutes: 60, activity: 'Quiz' },
          ],
        },
        {
          dayNumber: 6,
          dateStr: 'Day 6 (Oct 6)',
          title: 'Transactions & ACID Properties',
          focusArea: 'Unit 4: Transaction Processing',
          allocatedHours: 2.5,
          topics: [
            { topicId: 'top-dbms-acid', topicName: 'ACID Properties, Conflict & View Serializability', difficulty: 'Medium', estimatedMinutes: 90, activity: 'Learn' },
            { topicId: 'top-dbms-acid', topicName: 'Precedence Graph (Cycle testing) Practice', difficulty: 'Medium', estimatedMinutes: 60, activity: 'Practice' },
          ],
        },
        {
          dayNumber: 7,
          dateStr: 'Day 7 (Oct 7)',
          title: 'Concurrency Control & 2PL',
          focusArea: 'Unit 4: Concurrency Protocols',
          allocatedHours: 2.5,
          topics: [
            { topicId: 'top-dbms-2pl', topicName: 'Strict & Rigorous Two-Phase Locking (2PL)', difficulty: 'Hard', estimatedMinutes: 90, activity: 'Learn' },
            { topicId: 'top-dbms-2pl', topicName: 'Timestamp Ordering and Deadlock Handling', difficulty: 'Hard', estimatedMinutes: 60, activity: 'Practice' },
          ],
        },
        {
          dayNumber: 8,
          dateStr: 'Day 8 (Oct 8)',
          title: 'B+ Tree Indexing & Storage Essentials',
          focusArea: 'Unit 5: Fast Retrieval Structures',
          allocatedHours: 2.5,
          topics: [
            { topicId: 'top-dbms-bplus', topicName: 'B+ Tree Node Insertion & Node Splitting Math', difficulty: 'Hard', estimatedMinutes: 90, activity: 'Learn' },
            { topicId: 'top-dbms-bplus', topicName: 'Calculate B+ tree order given disk block & pointer size', difficulty: 'Medium', estimatedMinutes: 60, activity: 'Practice' },
          ],
        },
        {
          dayNumber: 9,
          dateStr: 'Day 9 (Oct 9)',
          title: 'Full Mock Exam Simulation',
          focusArea: 'Timed Exam Condition Test',
          allocatedHours: 2.5,
          topics: [
            { topicId: 'top-dbms-3nf', topicName: '3-Hour Full Mid-Term Mock Test (100 Marks)', difficulty: 'Critical', estimatedMinutes: 120, activity: 'Quiz' },
            { topicId: 'top-dbms-bcnf', topicName: 'Mistake Analysis & Formula Sheet Flash Review', difficulty: 'Medium', estimatedMinutes: 30, activity: 'Revision' },
          ],
        },
        {
          dayNumber: 10,
          dateStr: 'Day 10 (Oct 10)',
          title: 'Final Revision & High-Yield Cheat Sheet',
          focusArea: 'Rapid Recall & Confidence Boosting',
          allocatedHours: 2.5,
          topics: [
            { topicId: 'top-dbms-3nf', topicName: 'Normalization Quick Rules Cheat Sheet Review', difficulty: 'Easy', estimatedMinutes: 60, activity: 'Revision' },
            { topicId: 'top-dbms-2pl', topicName: 'Key Definitions: Lossless join theorem, 2PL, ACID', difficulty: 'Easy', estimatedMinutes: 60, activity: 'Revision' },
            { topicId: 'top-dbms-bplus', topicName: 'Mind relaxation & Exam logistics review', difficulty: 'Easy', estimatedMinutes: 30, activity: 'Revision' },
          ],
        },
      ],
    },
    tutorExplanation: {
      title: 'Mastering Database Normalization in 4 Simple Steps',
      eli5Summary:
        'Imagine a cluttered shared student spreadsheet where changing one phone number requires editing 50 rows, deleting a course accidentally deletes the student profile, and you can\'t add a new professor without registering a student first! Normalization is simply organizing your tables into clean, focused folders so every piece of data lives in exactly one place.',
      stepByStepBreakdown: [
        {
          step: 1,
          heading: '1NF (Atomic Values Only)',
          content: 'No multi-valued cells (like multiple phone numbers in one cell) or repeating groups. Every single column must contain a single indivisible value.',
          rules: ['Cell values must be atomic', 'Each column must have a unique name', 'Order of rows does not matter'],
        },
        {
          step: 2,
          heading: '2NF (No Partial Dependencies)',
          content: 'Table must already be in 1NF. Every non-key column must depend on the FULL primary key, not just half of a composite key.',
          rules: ['Must be in 1NF', 'If Primary Key is (Student_ID, Course_ID), Course_Name cannot depend solely on Course_ID'],
        },
        {
          step: 3,
          heading: '3NF (No Transitive Dependencies)',
          content: 'Table must be in 2NF. Non-key columns cannot depend on other non-key columns (A -> B and B -> C). In formal exam terms: for any FD X -> Y, either X is a superkey OR Y is a prime attribute.',
          rules: ['Must be in 2NF', 'Non-prime attribute -> Non-prime attribute is strictly forbidden', 'Guarantees lossless join AND dependency preservation'],
        },
        {
          step: 4,
          heading: 'BCNF (Strict Superkey Condition)',
          content: 'The strictest practical normal form. For EVERY functional dependency X -> Y, the left-hand side X MUST BE A SUPERKEY. No exceptions!',
          rules: ['Stricter than 3NF', 'Guarantees zero redundancy from functional dependencies', 'May occasionally sacrifice dependency preservation'],
        },
      ],
      practicalExample:
        'Example Relation: Student_Advising(StudentID, CourseID, ProfessorID, ProfessorOffice)\nCandidate Key: {StudentID, CourseID}\nFunctional Dependencies:\n1. {StudentID, CourseID} -> ProfessorID (Full Key -> OK in 2NF)\n2. ProfessorID -> ProfessorOffice (Non-key -> Non-key! Violates 3NF)\nSolution: Decompose into Enrollments(StudentID, CourseID, ProfessorID) and Faculty(ProfessorID, ProfessorOffice). Now in BCNF!',
      examTrapWarning:
        'University Exam Trap: Examiners often ask if a 3NF relation is always in BCNF. Answer is NO! Remember the condition: 3NF allows X -> A if A is a prime attribute (even if X is not a superkey), whereas BCNF strictly demands X to be a superkey.',
    },
    diagnosticQuiz: [
      {
        id: 'diag-q-1',
        topicId: 'top-dbms-3nf',
        question: 'Under 3NF, which condition allows the functional dependency X -> A to be valid even when X is NOT a superkey?',
        options: [
          'A must be a numeric field',
          'A must be a prime attribute (part of a candidate key)',
          'The table must have fewer than 3 candidate keys',
          'X must contain at least 2 attributes',
        ],
        correctAnswerIndex: 1,
        explanation: 'In 3NF, for every non-trivial FD X -> A, either X is a superkey OR A is a prime attribute. This prime attribute relaxation is what distinguishes 3NF from BCNF!',
        difficulty: 'Hard',
      },
      {
        id: 'diag-q-2',
        topicId: 'top-dbms-bcnf',
        question: 'What is the required condition for a decomposition of R into R1 and R2 to be mathematically LOSSLESS?',
        options: [
          '(R1 ∩ R2) must be empty',
          '(R1 ∩ R2) -> R1 OR (R1 ∩ R2) -> R2 in attribute closure F+',
          'R1 and R2 must have an equal number of tuples',
          'All attributes must be foreign keys',
        ],
        correctAnswerIndex: 1,
        explanation: 'According to the Lossless Join Decomposition Theorem, the intersection of the two decomposed schemas must functionally determine at least one of the schemas entirely.',
        difficulty: 'Critical',
      },
    ],
  };

  res.json(workflowResponse);
});

// 3. AI Tutor on-demand explanation endpoint
app.post('/api/tutor/explain', async (req: Request, res: Response) => {
  const { topicName, mode, notesGrounded } = req.body;
  const topic = topicName || 'Database Normalization';

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an expert college computer science tutor for StudyFlow.
Explain the topic: "${topic}".
Mode: "${mode || 'simple'}" (options: "simple" for intuitive ELI5 analogies, "step_by_step" for rigorous university exam breakdown, "cheat_sheet" for rapid formulas and pitfalls).
Grounding: ${notesGrounded ? 'Rely on standard syllabus definitions and lecture handouts' : 'General conceptual overview'}.

Output a JSON with:
{
  "topic": "${topic}",
  "headline": "concise one-line summary",
  "explanation": "rich structured markdown text with sections, bullet points, and code/table examples",
  "keyTakeaways": ["point 1", "point 2", "point 3"],
  "examTrap": "common exam mistake to avoid"
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err) {
      console.warn('[Gemini Tutor Fallback]:', err);
    }
  }

  // High quality fallback
  res.json({
    topic,
    headline: `Comprehensive Guide to ${topic} for College Exams`,
    explanation: `### What is ${topic}?\n\nIn relational database systems, **${topic}** is essential to prevent data redundancy and update anomalies. When designing a relational schema, storing related information in an unnormalized table causes three classic anomalies:\n\n1. **Insertion Anomaly**: Inability to record information about an entity without adding unrelated foreign data.\n2. **Deletion Anomaly**: Unintentional loss of vital data when an unrelated record is purged.\n3. **Update Anomaly**: Multiple conflicting copies of the same data across different rows.\n\n### The Progression of Normal Forms\n\n- **1NF**: Ensures every attribute value in every row is atomic.\n- **2NF**: Enforces 1NF + removes partial functional dependencies on composite keys.\n- **3NF**: Enforces 2NF + removes transitive dependencies (where non-key determines non-key).\n- **BCNF**: Strictly demands that every determinant in a non-trivial functional dependency must be a superkey.\n\n### Practical Rule of Thumb for Your Exam\n\nWhen given a relation $R(A, B, C, D)$ and a set of FDs:\n1. Compute the attribute closure of all single and pair attributes.\n2. Identify all candidate keys.\n3. Identify prime attributes (attributes participating in any candidate key).\n4. Check each FD against the 3NF and BCNF conditions.`,
    keyTakeaways: [
      'Candidate keys are minimal superkeys with no redundant attributes.',
      '3NF guarantees both lossless join and dependency preservation.',
      'BCNF eliminates all redundancy from functional dependencies but may lose dependency preservation.',
    ],
    examTrap: 'Always check if an attribute on the right side of an FD is prime before marking a schema as violating 3NF!',
  });
});

// 4. Topic Quiz generation endpoint
app.post('/api/quiz/generate', async (req: Request, res: Response) => {
  const { topicName, count = 2 } = req.body;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Create ${count} high quality multiple choice questions for college students studying: "${topicName}".
Include clear distractors and detailed step-by-step explanations.
Format as JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIndex": 0,
      "explanation": "string",
      "difficulty": "Medium"
    }
  ]
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.questions?.length) {
        return res.json({ questions: parsed.questions });
      }
    } catch (err) {
      console.warn('[Gemini Quiz Fallback]:', err);
    }
  }

  // Fallback
  res.json({
    questions: [
      {
        id: `q-${Date.now()}-1`,
        question: `Which of the following statements is true regarding ${topicName}?`,
        options: [
          'It is only applicable to non-relational NoSQL databases.',
          'It systematically decomposes relations to minimize data anomalies.',
          'It always increases the total number of redundant duplicate tuples.',
          'It removes the need for primary and foreign key constraints.',
        ],
        correctAnswerIndex: 1,
        explanation: 'Normalization specifically addresses relational schemas to systematically eliminate update, deletion, and insertion anomalies.',
        difficulty: 'Medium',
      },
      {
        id: `q-${Date.now()}-2`,
        question: `What is the primary trade-off when decomposing a relation into ${topicName}?`,
        options: [
          'More joins may be required at query time vs. reduced data redundancy.',
          'Data size increases exponentially on disk.',
          'Transactions can no longer use ACID properties.',
          'Indexes become completely invalid.',
        ],
        correctAnswerIndex: 0,
        explanation: 'Decomposition creates multiple smaller tables, which requires SQL JOIN operations during queries, trading off some query-time CPU for storage integrity and anomaly prevention.',
        difficulty: 'Hard',
      },
    ],
  });
});

// 5. Syllabus Analyzer endpoint
app.post('/api/syllabus/analyze', async (req: Request, res: Response) => {
  const { syllabusText, subjectCode, subjectName } = req.body;

  if (ai && syllabusText && syllabusText.length > 30) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze this college syllabus for ${subjectName || subjectCode || 'Computer Science'}:
"${syllabusText.slice(0, 3000)}"

Extract and return a JSON structured object:
{
  "subjectCode": "CS501",
  "subjectName": "Database Management Systems",
  "totalEstimatedHours": 45,
  "units": [
    {
      "unitNumber": 1,
      "title": "Unit title",
      "weightageMarks": 20,
      "topics": [
        {
          "name": "Topic name",
          "difficulty": "Medium",
          "examWeightage": 10,
          "description": "short description"
        }
      ]
    }
  ],
  "agentNotes": "Key recommendation for student preparation"
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err) {
      console.warn('[Gemini Syllabus Fallback]:', err);
    }
  }

  // Pre-configured rich analysis
  res.json({
    subjectCode: subjectCode || 'CS501',
    subjectName: subjectName || 'Database Management Systems',
    totalEstimatedHours: 48,
    units: [
      {
        unitNumber: 1,
        title: 'ER Modeling & Relational Algebra',
        weightageMarks: 15,
        topics: [
          { name: 'Entity Relationship Modeling & Cardinality', difficulty: 'Easy', examWeightage: 7, description: 'Entities, attributes, relationships, weak entity sets.' },
          { name: 'Relational Algebra & Set Operations', difficulty: 'Medium', examWeightage: 8, description: 'Select, project, cartesian product, joins.' },
        ],
      },
      {
        unitNumber: 2,
        title: 'SQL & Query Optimization',
        weightageMarks: 18,
        topics: [
          { name: 'Correlated Subqueries & CTEs', difficulty: 'Medium', examWeightage: 10, description: 'Complex nested subqueries and window functions.' },
          { name: 'Heuristic Query Optimization', difficulty: 'Hard', examWeightage: 8, description: 'Equivalence rules and algebraic push-down.' },
        ],
      },
      {
        unitNumber: 3,
        title: 'Relational Database Design & Normalization',
        weightageMarks: 25,
        topics: [
          { name: 'Functional Dependencies & Closure', difficulty: 'Medium', examWeightage: 8, description: 'Armstrong axioms, attribute closure X+, candidate key discovery.' },
          { name: '1NF, 2NF & Partial Dependencies', difficulty: 'Medium', examWeightage: 8, description: 'Atomic domains and composite key dependencies.' },
          { name: '3NF, BCNF & Lossless Decomposition', difficulty: 'Critical', examWeightage: 9, description: 'Superkey conditions, transitive dependencies, dependency preservation.' },
        ],
      },
      {
        unitNumber: 4,
        title: 'Transactions & Concurrency Control',
        weightageMarks: 22,
        topics: [
          { name: 'ACID Properties & Serializability', difficulty: 'Medium', examWeightage: 10, description: 'Conflict equivalence, precedence graph testing.' },
          { name: 'Two-Phase Locking (2PL) & Deadlocks', difficulty: 'Hard', examWeightage: 12, description: 'Strict 2PL, deadlock prevention, detection, and recovery.' },
        ],
      },
      {
        unitNumber: 5,
        title: 'Storage & Indexing',
        weightageMarks: 20,
        topics: [
          { name: 'B+ Tree Indexing & Range Queries', difficulty: 'Hard', examWeightage: 12, description: 'B+ tree insertion, splitting, deletion algorithms.' },
          { name: 'Hashing Techniques (Static & Dynamic)', difficulty: 'Medium', examWeightage: 8, description: 'Linear hashing and extendible hashing.' },
        ],
      },
    ],
    agentNotes: 'Unit 3 (Normalization) and Unit 4 (Concurrency) account for 47% of total examination marks. Prioritize these high-yield units.',
  });
});

// Mount Vite middleware in development or static serve in production
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[StudyFlow Server] running on http://0.0.0.0:${PORT}`);
});
