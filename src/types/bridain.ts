// BRIDAIN Core Type Definitions
// Centralized type safety for conversational AI and skill learning platform

// Message types for different chat interfaces
export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  type?: 'chat' | 'mcq' | 'tip';
  options?: string[];
  correctAnswer?: number | string;
  explanation?: string;
  isCorrect?: boolean;
  emoji?: string;
  // Voice/dual text support
  displayText?: string;
  audioScript?: string;
  // Extended feedback fields for interview mode
  feedbackStatus?: 'Correct' | 'Wrong';
  feedbackContrast?: DualText;
  feedbackExplanation?: DualText;
  questionText?: DualText;
  choices?: string[];
  answered?: boolean;
  selectedAnswer?: string;
  correctAnswerText?: string;
  whyCorrectIsCorrect?: string;
  userAnswerEvaluation?: string;
  whyOtherOptionsWrong?: string;
  technicalConcept?: string;
  productionPerspective?: string;
  commonMistakes?: string;
  keyLearningPoints?: string;
  nextQuestion?: string;
  feedbackValidation?: {
    allSectionsPresent: boolean;
    consistentWithScenario: boolean;
    singleCorrectAnswer: boolean;
    regeneratedAttempts: number;
  };
}

export interface DualText {
  displayText: string;
  audioScript: string;
}

// Conversation state management
export interface ConversationState {
  messages: Message[];
  isLoading: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isMuted: boolean;
  selectedSkill: Skill | string | null;
  mode: ConversationMode;
  score: number;
  answered: number;
}

// User evaluation and progress tracking
export interface UserEvaluation {
  skillId: string;
  score: number;
  totalAnswered: number;
  accuracy: number;
  lastPracticed: Date;
  strengths: string[];
  weaknesses: string[];
}

export interface Skill {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export type ConversationMode = 'learn' | 'mcq' | 'chat' | 'learning' | 'interview';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Senior' | 'Architect';

// Voice coach specific types
export interface VoiceFlavor {
  name: string;
  pitch: number;
  description: string;
}

export interface VoiceConfig {
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
}

// API request/response types
export interface ChatRequest {
  message: string;
  context?: string;
  skill?: string;
  mode?: string;
}

export interface ChatResponse {
  response: string;
  emoji?: string;
  powered?: string;
  error?: string;
}

// Structured AI payloads
export interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  skill: string;
  difficulty: DifficultyLevel;
}

export interface InterviewQuestion {
  idea: string;
  scenario: string;
  options: string[];
  correct: number;
  skill: string;
}

export interface StructuredFeedback {
  correctAnswer: string;
  whyCorrectIsCorrect: string;
  userAnswerEvaluation: string;
  whyOtherOptionsWrong: string;
  technicalConcept: string;
  productionPerspective: string;
  commonMistakes: string;
  keyLearningPoints: string;
  nextQuestion?: string;
}

// Error handling types
export interface APIError {
  message: string;
  code?: string;
  status?: number;
}

export interface ValidationResult {
  isValid: boolean;
  missingSections: string[];
  inconsistencies: string[];
}