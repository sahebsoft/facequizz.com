export type QuizType = 1 | 2 | 3; // 1=Personality, 2=Knowledge, 3=Puzzle
export type QuizStatus = 1 | 2; // 1=Active, 2=Inactive
export type UserType = 'a' | 'u'; // 'a'=Admin, 'u'=User

export interface User {
  username: string;
  title?: string;
  email?: string;
  userType: UserType;
  divisionId: number;
  status?: number;
  adSlot: bigint;
}

export interface Quiz {
  id: number;
  title?: string;
  image?: string;
  username?: string;
  divisionId: number;
  quizType: QuizType;
  createDate: Date;
  updateDate: Date;
  status: QuizStatus;
  subTitle?: string;
  randomFlag?: number;
  adsenseFlag: number;
  starFlag: number;
  publishDate?: Date;
  scoreFlag?: number;
  fbFlag: number;
  visits: number;

  // Relations
  questions?: Question[];
  results?: Result[];
  scores?: Score[];
}

export interface Question {
  id: number;
  quizId: number;
  title: string;
  image?: string;
  youtubeCode?: string;

  // Relations
  answers?: Answer[];
}

export interface Answer {
  id: number;
  quizId: number;
  questionId?: number;
  title: string;
  points: number;
  image?: string;

  // Relations
  scores?: Score[];
}

export interface Result {
  id: number;
  quizId: number;
  title: string;
  image?: string;
  subTitle?: string;
  pointFrom: number;
  pointTo: number;

  // Relations
  scores?: Score[];
}

export interface Score {
  id: number;
  quizId: number;
  answerId: number;
  resultId: number;
  scoreValue: number;
}

// API Response Types
export interface QuizWithDetails extends Quiz {
  questions: (Question & {
    answers: Answer[];
  })[];
  results: (Result & {
    scores: Score[];
  })[];
  user?: User;
}

export interface QuizSubmission {
  quizId: number;
  answers: Record<number, number>; // questionId -> answerId
}

export interface QuizResult {
  result: Result;
  score: number;
  maxScore: number;
  scoreDescription?: string;
}

// Quiz Builder Types (for admin)
export interface QuizFormData {
  title: string;
  subTitle?: string;
  quizType: QuizType;
  image?: string;
  randomFlag: boolean;
  scoreFlag: number;
  starFlag: boolean;
  status: QuizStatus;
}

export interface QuestionFormData {
  id?: number;
  title: string;
  image?: string;
  youtubeCode?: string;
  answers: AnswerFormData[];
}

export interface AnswerFormData {
  id?: number;
  title: string;
  points: number;
  image?: string;
}

export interface ResultFormData {
  id?: number;
  title: string;
  subTitle?: string;
  image?: string;
  pointFrom: number;
  pointTo: number;
  scores?: ScoreFormData[];
}

export interface ScoreFormData {
  id?: number;
  answerId: number;
  resultId: number;
  scoreValue: number;
}

// Component Props Types
export interface QuizCardProps {
  quiz: Quiz;
  showAdminActions?: boolean;
  className?: string;
}

export interface QuestionComponentProps {
  question: Question & { answers: Answer[] };
  selectedAnswer?: number;
  onAnswerSelect: (answerId: number) => void;
  disabled?: boolean;
}

export interface ResultComponentProps {
  result: QuizResult;
  quiz: Quiz;
  onShare?: () => void;
  onRetake?: () => void;
}

// Analytics Types
export interface QuizAnalytics {
  quizId: number;
  totalVisits: number;
  totalCompletions: number;
  completionRate: number;
  averageScore?: number;
  popularAnswers: {
    questionId: number;
    answerId: number;
    count: number;
    percentage: number;
  }[];
  resultDistribution: {
    resultId: number;
    count: number;
    percentage: number;
  }[];
}

// Scoring Engine Types
export interface ScoringContext {
  quiz: QuizWithDetails;
  selectedAnswers: Record<number, number>;
}

export interface ScoringResult {
  resultId: number;
  score: number;
  maxPossibleScore: number;
  calculation: ScoringCalculation;
}

export interface ScoringCalculation {
  type: 'personality' | 'knowledge' | 'puzzle';
  details: PersonalityScoring | KnowledgeScoring | PuzzleScoring;
}

export interface PersonalityScoring {
  resultScores: {
    resultId: number;
    totalScore: number;
    contributions: {
      questionId: number;
      answerId: number;
      scoreValue: number;
    }[];
  }[];
  winningResult: {
    resultId: number;
    totalScore: number;
  };
}

export interface KnowledgeScoring {
  totalPoints: number;
  maxPossiblePoints: number;
  correctAnswers: number;
  totalQuestions: number;
  questionScores: {
    questionId: number;
    answerId: number;
    points: number;
    isCorrect: boolean;
  }[];
}

export interface PuzzleScoring {
  isCorrect: boolean;
  selectedAnswerId: number;
  correctAnswerId: number;
  points: number; // 1 or 0
}

// Social Sharing Types
export interface ShareData {
  url: string;
  title: string;
  description: string;
  image?: string;
  hashtags?: string[];
}

export interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'website' | 'article';
  siteName: string;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
}

// Utility Types
export type CreateQuizInput = Omit<Quiz, 'id' | 'createDate' | 'updateDate' | 'visits'>;
export type UpdateQuizInput = Partial<CreateQuizInput> & { id: number };
export type CreateQuestionInput = Omit<Question, 'id'>;
export type UpdateQuestionInput = Partial<CreateQuestionInput> & { id: number };

// Hook Types
export interface UseQuizState {
  currentQuestionIndex: number;
  selectedAnswers: Record<number, number>;
  isComplete: boolean;
  result?: QuizResult;
}

export interface UseQuizActions {
  selectAnswer: (questionId: number, answerId: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => Promise<void>;
  reset: () => void;
}