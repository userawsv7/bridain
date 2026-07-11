// BRIDAIN Context Builder
// Dynamic context assembly for adaptive AI responses

import { PromptContext, UserSkillLevel, TechnicalDomain, LearningGoal } from '../types/ai';

export interface ContextOptions {
  includeHistory?: boolean;
  maxHistoryLength?: number;
  includeDomainContext?: boolean;
  adaptToSkillLevel?: boolean;
}

export function validatePromptContext(context: Partial<PromptContext>): PromptContext {
  return {
    domain: context.domain || 'Software Engineering',
    topic: context.topic || 'General Programming',
    skillLevel: context.skillLevel || 'Intermediate',
    learningGoal: context.learningGoal || 'Concept Mastery',
    previousContext: context.previousContext
  };
}

export function buildDomainSpecificContext(domain: TechnicalDomain, topic: string): string {
  const domainContexts = {
    'DevOps': `Focus on CI/CD pipelines, infrastructure automation, monitoring, and deployment strategies.`,
    'Cloud': `Emphasize scalability, cost optimization, multi-region deployments, and cloud-native patterns.`,
    'AI/ML': `Cover model training, inference optimization, data pipelines, and MLOps practices.`,
    'Cybersecurity': `Address threat modeling, secure coding, compliance, and incident response.`,
    'Software Engineering': `Focus on code quality, design patterns, testing strategies, and maintainability.`,
    'Testing': `Emphasize test strategy, automation frameworks, quality gates, and risk assessment.`,
    'Automation': `Cover scripting, orchestration, error handling, and operational efficiency.`,
    'Data Engineering': `Focus on data pipelines, ETL processes, data quality, and storage optimization.`,
    'Networking': `Address protocol analysis, network design, security, and performance optimization.`,
    'Linux': `Cover system administration, shell scripting, performance tuning, and troubleshooting.`,
    'Kubernetes': `Emphasize container orchestration, service mesh, scaling, and operational patterns.`,
    'System Design': `Focus on architectural patterns, scalability, reliability, and trade-off analysis.`
  };

  return domainContexts[domain] || `Apply ${domain} specific best practices and terminology.`;
}

export function adaptContextToSkillLevel(context: string, skillLevel: UserSkillLevel): string {
  const adaptations = {
    'Beginner': `Explain concepts with foundational vocabulary and concrete examples. ${context}`,
    'Intermediate': `Introduce patterns and practical applications. ${context}`,
    'Advanced': `Focus on optimization, edge cases, and system interactions. ${context}`,
    'Senior': `Emphasize team coordination, technical debt, and long-term maintainability. ${context}`,
    'Architect': `Address enterprise-scale concerns, governance, and strategic decisions. ${context}`
  };

  return adaptations[skillLevel];
}

export function buildConversationContext(
  baseContext: PromptContext,
  conversationHistory?: string[],
  options: ContextOptions = {}
): string {
  const validatedContext = validatePromptContext(baseContext);
  let contextString = '';

  // Build core context
  contextString += `Technical Domain: ${validatedContext.domain}\n`;
  contextString += `Current Topic: ${validatedContext.topic}\n`;
  contextString += `User Skill Level: ${validatedContext.skillLevel}\n`;
  contextString += `Learning Goal: ${validatedContext.learningGoal}\n`;

  // Add domain-specific guidance
  if (options.includeDomainContext !== false) {
    contextString += `\nDomain Focus: ${buildDomainSpecificContext(
      validatedContext.domain as TechnicalDomain,
      validatedContext.topic
    )}\n`;
  }

  // Adapt to skill level
  if (options.adaptToSkillLevel !== false) {
    contextString = adaptContextToSkillLevel(contextString, validatedContext.skillLevel);
  }

  // Add conversation history
  if (options.includeHistory && conversationHistory && conversationHistory.length > 0) {
    const maxLength = options.maxHistoryLength || 3;
    const recentHistory = conversationHistory.slice(-maxLength);
    contextString += `\nRecent Context:\n${recentHistory.join('\n')}\n`;
  }

  // Add previous context if available
  if (validatedContext.previousContext) {
    contextString += `\nPrevious Session Context: ${validatedContext.previousContext}\n`;
  }

  return contextString.trim();
}

export function createContextBuilder() {
  return {
    validatePromptContext,
    buildDomainSpecificContext,
    adaptContextToSkillLevel,
    buildConversationContext
  };
}