// BRIDAIN AI Prompt Engine Types
// Centralized type definitions for the modular AI architecture

export type UserSkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Senior' | 'Architect';

export type LearningGoal =
  | 'Concept Mastery'
  | 'Interview Prep'
  | 'Certification'
  | 'Production Troubleshooting'
  | 'System Design';

export type TechnicalDomain =
  | 'DevOps'
  | 'Cloud'
  | 'AI/ML'
  | 'Cybersecurity'
  | 'Software Engineering'
  | 'Testing'
  | 'Automation'
  | 'Data Engineering'
  | 'Networking'
  | 'Linux'
  | 'Kubernetes'
  | 'System Design';

export type AssessmentStatus = 'correct' | 'partial' | 'incorrect';

export interface PromptContext {
  domain: TechnicalDomain;
  topic: string;
  skillLevel: UserSkillLevel;
  learningGoal: LearningGoal;
  previousContext?: string;
}

export interface EvaluationSchema {
  assessment: {
    status: AssessmentStatus;
    score: number; // 0-100
    detectedSkillLevel: UserSkillLevel;
  };
  technicalAccuracy: {
    summary: string;
    missingConcepts: string[];
    hiddenPrinciples: string[];
  };
  communicationCoaching: {
    clarity: string;
    terminology: string;
    interviewPerspective: string;
  };
  comprehensiveCoaching: {
    whyExplanation: string;
    betterAnswer: string;
    staffEngineerAnswer: string;
    productionRelevance: string;
    tradeoffs: string[];
    risks: string[];
    commonPitfalls: string[];
  };
  nextSteps: {
    socraticQuestion: string;
    suggestedTopics: string[];
  };
}

export interface SystemPromptConfig {
  role: string;
  teachingPhilosophy: string;
  domainContext: string;
  skillLevelAdaptations: string;
  safetyInstructions: string;
}

export interface StreamingConfig {
  enableStructured: boolean;
  fallbackToText: boolean;
  maxRetries: number;
}