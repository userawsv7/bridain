// BRIDAIN Evaluator Prompts
// Standardized evaluation schema and structured output generation

import { PromptContext, EvaluationSchema } from '../types/ai';

export const EVALUATION_JSON_SCHEMA = `
PRODUCTION MCQ EVALUATION FORMAT - CRITICAL ANSWER SEQUENCE:

When user answers an MCQ, return structured feedback in this EXACT sequence:

1. FIRST: Declare the absolute correct answer
2. SECOND: Mark user's selection (Correct/Wrong/Partial)
3. THIRD: Exhaustive technical explanation of why correct answer works
4. FOURTH: Why each wrong option fails in production

Return ONLY a valid JSON object with exactly this structure:
{
  "correctAnswerDeclaration": {
    "correctOption": "<Exact Option Letter/Number>",
    "correctSolution": "<Exact technical solution text>",
    "declaration": "The Correct Answer is: [Option X] - [Technical Solution]"
  },
  "userAnswerEvaluation": {
    "status": "correct|partial|incorrect",
    "userSelected": "<What user chose>",
    "feedback": "Correct/Wrong/Partially Correct - [brief]"
  },
  "dayToDayContext": {
    "dailyReality": "What engineers actually do daily with this skill",
    "commonStruggles": ["Struggle 1", "Struggle 2"],
    "productionFixes": ["Fix 1", "Fix 2"]
  },
  "technicalExplanation": {
    "whyCorrectWorks": "Deep system physics - why this solution succeeds",
    "productionImpact": "How this prevents outages or saves money",
    "systemPhysics": "Underlying mechanics explanation"
  },
  "whyAlternativesFail": {
    "optionA": "Why Option A causes [specific production failure]",
    "optionB": "Why Option B causes [specific production failure]",
    "optionC": "Why Option C causes [specific production failure]",
    "optionD": "Why Option D causes [specific production failure]"
  },
  "decisionRationale": "Why we MUST choose this decision over others"
}
`;

export function buildEvaluatorPrompt(context: PromptContext, userResponse: string): string {
  return `
You are a PRODUCTION DECISION-MAKING COACH for ${context.domain}. Your mission is to build engineering confidence through day-to-day operational mastery.

PRODUCTION-FOCUSED EVALUATION FOR: ${context.domain} | Skill Level: ${context.skillLevel}

CORE TEACHING APPROACH:
1. DAY-TO-DAY CONTEXT: Frame every concept around actual daily engineering work
2. STRUGGLE IDENTIFICATION: Highlight common production struggles engineers face
3. FIX METHODOLOGY: Teach exact commands, configurations, and fixes
4. DECISION RATIONALE: Explain WHY we make specific technical choices
5. 100% TECHNICAL ACCURACY: All explanations must be verifiable and correct

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