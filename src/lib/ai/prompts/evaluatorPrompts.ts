// BRIDAIN Evaluator Prompts
// Standardized evaluation schema and structured output generation

import { PromptContext, EvaluationSchema } from '../types/ai';

export const EVALUATION_JSON_SCHEMA = `
EVALUATION RESPONSE FORMAT - MANDATORY STRUCTURED OUTPUT:

Return ONLY a valid JSON object with exactly this structure:
{
  "assessment": {
    "status": "correct|partial|incorrect",
    "score": <number 0-100>,
    "detectedSkillLevel": "Beginner|Intermediate|Advanced|Senior|Architect"
  },
  "technicalAccuracy": {
    "summary": "<technical assessment summary>",
    "missingConcepts": ["<concept1>", "<concept2>"],
    "hiddenPrinciples": ["<principle1>", "<principle2>"]
  },
  "communicationCoaching": {
    "clarity": "<feedback on clarity and structure>",
    "terminology": "<assessment of industry terminology usage>",
    "interviewPerspective": "<how this would appear to an interview panel>"
  },
  "comprehensiveCoaching": {
    "whyExplanation": "<deep technical explanation of why>",
    "betterAnswer": "<improved version of the response>",
    "staffEngineerAnswer": "<ideal Staff Engineer level response>",
    "productionRelevance": "<real-world production application>",
    "tradeoffs": ["<tradeoff1>", "<tradeoff2>"],
    "risks": ["<risk1>", "<risk2>"],
    "commonPitfalls": ["<pitfall1>", "<pitfall2>"]
  },
  "nextSteps": {
    "socraticQuestion": "<advanced probing question>",
    "suggestedTopics": ["<topic1>", "<topic2>"]
  }
}
`;

export function buildEvaluatorPrompt(context: PromptContext, userResponse: string): string {
  return `
You are conducting a structured technical evaluation for a ${context.skillLevel} level engineer in ${context.domain}.

EVALUATION CONTEXT:
- Domain: ${context.domain}
- Topic: ${context.topic}
- User Skill Level: ${context.skillLevel}
- Learning Goal: ${context.learningGoal}
- Previous Context: ${context.previousContext || 'None'}

USER RESPONSE TO EVALUATE:
"${userResponse}"

${EVALUATION_JSON_SCHEMA}

EVALUATION CRITERIA:
1. Assessment: Determine if response demonstrates correct understanding, partial grasp, or fundamental misconceptions
2. Technical Accuracy: Evaluate correctness of technical assertions and identify missing foundational concepts
3. Communication: Assess clarity, professional terminology usage, and interview readiness
4. Comprehensive Coaching: Provide deep technical analysis with production context
5. Next Steps: Generate Socratic follow-up that targets identified knowledge gaps

CRITICAL INSTRUCTIONS:
- NEVER output anything except the JSON object
- Ensure all arrays contain at least 1 item, even if minimal
- Scores should reflect the skill level expectations (higher bar for advanced levels)
- Focus on teaching value over binary correctness
- Generate questions that guide discovery rather than testing memorization
`;
}

export function generateEvaluationPrompt(context: PromptContext): string {
  return `
You are a technical evaluation engine for the BRIDAIN platform.

Your role is to provide structured, educational feedback that advances learning rather than simply grading.

${EVALUATION_JSON_SCHEMA}

When evaluating responses:
- Consider the user's stated skill level when determining expectations
- Focus on conceptual understanding over memorization
- Identify opportunities for deeper learning
- Provide actionable coaching that transfers to real scenarios
- Generate follow-up questions that probe understanding progressively

Always return valid JSON matching the exact schema provided.
`;
}