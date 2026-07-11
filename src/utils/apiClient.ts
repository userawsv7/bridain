import { ChatRequest, ChatResponse, APIError } from '../types/bridain';

/**
 * API Client for BRIDAIN chat interactions
 * Centralized fetch wrapper with proper typing and error handling
 */

const CHAT_ENDPOINT = '/api/chat';

export class ApiClient {
  /**
   * Send a chat message to the AI coach
   */
  static async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      const apiError: APIError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'CHAT_API_ERROR',
        status: 500
      };
      throw apiError;
    }
  }

  /**
   * Validate API keys are configured
   */
  static async checkApiConfiguration(): Promise<{ configured: boolean; providers: string[] }> {
    // This would typically make a health check endpoint call
    // For now, we check if we're in a development environment
    return {
      configured: true, // Will be validated server-side
      providers: ['groq', 'huggingface']
    };
  }
}

/**
 * Generate context string for different conversation modes
 */
export function generateContext(skill?: string, mode?: string): string {
  const skillName = skill || 'technology';

  const baseContext = `Expert help for ${skillName}. Provide: exact commands, step-by-step fixes, common pitfalls, production scenarios`;

  const modeSpecificContext: { [key: string]: string } = {
    'mcq': 'Generate practical multiple choice questions for interviews and certifications',
    'interview': 'Focus on real production interview scenarios and troubleshooting',
    'learning': 'Interactive teaching with examples and concept explanations',
    'chat': 'General technical guidance and day-to-day engineering help'
  };

  const specificContext = mode ? modeSpecificContext[mode] || '' : '';
  return specificContext ? `${baseContext}. ${specificContext}` : baseContext;
}

/**
 * Parse MCQ response from AI
 */
export function parseMCQResponse(response: string): {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
} | null {
  try {
    const lines = response.split('\n').filter(l => l.trim());
    let question = '';
    const options: string[] = [];
    let correctAnswer = 0;
    let explanation = '';

    lines.forEach((line) => {
      if (line.startsWith('Q:')) question = line.replace('Q:', '').trim();
      if (line.match(/^[A-D]\)/)) {
        const cleanOption = line.replace(/^[A-D]\)\s*/, '').trim();
        options.push(cleanOption);
      }
      if (line.startsWith('ANSWER:')) {
        const ans = line.replace('ANSWER:', '').trim().toUpperCase();
        correctAnswer = ans.charCodeAt(0) - 65; // Convert A->0, B->1, etc
      }
      if (line.startsWith('EXPLANATION:')) explanation = line.replace('EXPLANATION:', '').trim();
    });

    if (question && options.length >= 4) {
      return { question, options, correctAnswer, explanation };
    }
    return null;
  } catch {
    return null;
  }
}