import { APIError, ValidationResult } from '../types/bridain';

/**
 * Error handling utilities for BRIDAIN
 * Centralized error management and user-friendly messaging
 */

export class ErrorHandler {
  /**
   * Handle API errors and return user-friendly messages
   */
  static handleApiError(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('API keys')) {
        return 'API configuration required. Please check environment variables.';
      }
      if (error.message.includes('HTTP 429')) {
        return 'Rate limit exceeded. Please try again in a moment.';
      }
      if (error.message.includes('HTTP 401')) {
        return 'Authentication failed. Please check API configuration.';
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return 'Network connection issue. Please check your internet connection.';
      }
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Create standardized API error object
   */
  static createApiError(message: string, code?: string, status?: number): APIError {
    return {
      message,
      code: code || 'UNKNOWN_ERROR',
      status: status || 500
    };
  }

  /**
   * Log error with context for debugging
   */
  static logError(error: unknown, context: string): void {
    console.error(`[${context}] Error:`, error);

    // In production, this would send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry or similar service
      // Sentry.captureException(error, { extra: { context } });
    }
  }

  /**
   * Validate feedback structure for interview mode
   */
  static validateFeedback(feedback: any, originalQuestion: string): ValidationResult {
    const requiredSections = [
      'correctAnswer', 'whyCorrectIsCorrect', 'userAnswerEvaluation',
      'whyOtherOptionsWrong', 'technicalConcept', 'productionPerspective',
      'commonMistakes', 'keyLearningPoints'
    ];

    const missingSections: string[] = [];
    const inconsistencies: string[] = [];

    // Check all required sections are present and non-empty
    requiredSections.forEach(section => {
      if (!feedback[section] || feedback[section].trim().length < 10) {
        missingSections.push(section);
      }
    });

    // Check that explanations reference the correct answer
    if (feedback.correctAnswer && feedback.whyCorrectIsCorrect) {
      const correctAnswerText = feedback.correctAnswer.toLowerCase();
      const explanationLower = feedback.whyCorrectIsCorrect.toLowerCase();
      if (!explanationLower.includes(correctAnswerText.substring(0, 20))) {
        inconsistencies.push('whyCorrectIsCorrect does not reference the correct answer');
      }
    }

    // Check scenario consistency
    if (originalQuestion && feedback.technicalConcept) {
      const scenarioWords = originalQuestion.toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);
      const explanationWords = feedback.technicalConcept.toLowerCase();
      const scenarioWordCount = scenarioWords.length;
      const matchedCount = scenarioWords.filter((word: string) => explanationWords.includes(word)).length;
      if (scenarioWordCount > 0 && matchedCount / scenarioWordCount < 0.2) {
        inconsistencies.push('technicalConcept does not reference the original scenario');
      }
    }

    return {
      isValid: missingSections.length === 0 && inconsistencies.length === 0,
      missingSections,
      inconsistencies
    };
  }
}

/**
 * Toast notification helpers
 */
export const ToastMessages = {
  apiError: 'Connection issue. Please try again.',
  apiKeyMissing: 'API keys not configured. Check environment variables.',
  speechNotSupported: 'Speech recognition not supported in this browser.',
  voiceError: 'Could not hear you. Please try again.',
  scoreIncrease: (points: number) => `+${points} XP! Great job! 🎉`,
  practiceComplete: 'Scenario completed. Keep practicing! 💪'
} as const;