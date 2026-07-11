// BRIDAIN Response Parser
// Robust JSON parsing with fallbacks for structured AI responses

import { EvaluationSchema } from '../types/ai';

export interface ParseResult {
  success: boolean;
  data?: EvaluationSchema;
  rawText?: string;
  error?: string;
}

export function extractJSONFromText(text: string): string | null {
  // Try to find JSON block in various formats
  const patterns = [
    /```json\s*([\s\S]*?)\s*```/i,
    /```\s*([\s\S]*?)\s*```/i,
    /\{[\s\S]*\}/,
    /\[[\s\S]*\]/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return null;
}

export function validateEvaluationSchema(data: any): data is EvaluationSchema {
  if (!data || typeof data !== 'object') return false;

  // Check assessment structure
  if (!data.assessment || typeof data.assessment !== 'object') return false;
  if (!['correct', 'partial', 'incorrect'].includes(data.assessment.status)) return false;
  if (typeof data.assessment.score !== 'number' || data.assessment.score < 0 || data.assessment.score > 100) return false;

  // Check technical accuracy
  if (!data.technicalAccuracy || typeof data.technicalAccuracy !== 'object') return false;
  if (typeof data.technicalAccuracy.summary !== 'string') return false;
  if (!Array.isArray(data.technicalAccuracy.missingConcepts)) return false;
  if (!Array.isArray(data.technicalAccuracy.hiddenPrinciples)) return false;

  // Check communication coaching
  if (!data.communicationCoaching || typeof data.communicationCoaching !== 'object') return false;
  if (typeof data.communicationCoaching.clarity !== 'string') return false;

  // Check comprehensive coaching
  if (!data.comprehensiveCoaching || typeof data.comprehensiveCoaching !== 'object') return false;
  if (typeof data.comprehensiveCoaching.whyExplanation !== 'string') return false;

  // Check next steps
  if (!data.nextSteps || typeof data.nextSteps !== 'object') return false;
  if (typeof data.nextSteps.socraticQuestion !== 'string') return false;

  return true;
}

export function parseStructuredResponse(text: string): ParseResult {
  try {
    // First attempt: direct JSON parse
    try {
      const directParse = JSON.parse(text);
      if (validateEvaluationSchema(directParse)) {
        return { success: true, data: directParse };
      }
    } catch {
      // Continue to fallback methods
    }

    // Second attempt: extract JSON from text
    const extractedJSON = extractJSONFromText(text);
    if (extractedJSON) {
      try {
        const parsed = JSON.parse(extractedJSON);
        if (validateEvaluationSchema(parsed)) {
          return { success: true, data: parsed };
        }
      } catch {
        // Continue to text fallback
      }
    }

    // Fallback: return raw text for manual processing
    return {
      success: false,
      rawText: text,
      error: 'Could not parse structured JSON response'
    };

  } catch (error) {
    return {
      success: false,
      rawText: text,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
}

export function createStreamingFallback(text: string): Partial<EvaluationSchema> {
  // Create minimal evaluation structure from unstructured text
  return {
    assessment: {
      status: 'partial',
      score: 50,
      detectedSkillLevel: 'Intermediate'
    },
    technicalAccuracy: {
      summary: 'Response received in streaming mode - structured evaluation unavailable',
      missingConcepts: [],
      hiddenPrinciples: []
    },
    communicationCoaching: {
      clarity: 'Streaming response - clarity assessment requires full evaluation',
      terminology: 'Requires structured analysis',
      interviewPerspective: 'Streaming mode limits interview assessment'
    },
    comprehensiveCoaching: {
      whyExplanation: text.substring(0, 500),
      betterAnswer: 'Full evaluation requires structured response mode',
      staffEngineerAnswer: 'Switch to structured evaluation mode for detailed analysis',
      productionRelevance: 'Analysis pending structured evaluation',
      tradeoffs: [],
      risks: [],
      commonPitfalls: []
    },
    nextSteps: {
      socraticQuestion: 'Enable structured evaluation mode for targeted follow-up questions',
      suggestedTopics: []
    }
  };
}

export function parseEvaluationResponse(text: string, enableStructured: boolean = true): EvaluationSchema | Partial<EvaluationSchema> {
  if (enableStructured) {
    const result = parseStructuredResponse(text);
    if (result.success && result.data) {
      return result.data;
    }
  }

  // Fallback to streaming-style partial evaluation
  return createStreamingFallback(text);
}