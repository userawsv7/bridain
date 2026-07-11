// BRIDAIN Scenario Prompts
// Domain-agnostic scenario generation for universal technical learning

import { PromptContext, TechnicalDomain } from '../types/ai';

export function buildScenarioContext(domain: TechnicalDomain, topic: string, skillLevel: string): string {
  return `
SCENARIO GENERATION CONTEXT:
Domain: ${domain}
Topic: ${topic}
Target Skill Level: ${skillLevel}

Generate realistic, production-grade scenarios that test decision-making under pressure with specific technical constraints.
`;
}

export function generateScenarioPrompt(context: PromptContext): string {
  return `
You are generating ${context.domain} production scenarios for a ${context.skillLevel} level engineer.

${buildScenarioContext(context.domain as TechnicalDomain, context.topic, context.skillLevel)}

SCENARIO STRUCTURE REQUIREMENTS:
1. [PRODUCTION CONTEXT]: Specific environment with exact parameters (node counts, load, constraints)
2. [THE STRUGGLE]: Real pressure points with business/time constraints
3. [DECISION POINT]: Clear choice with technical alternatives
4. [YOUR OPTIONS]: 4 technically distinct choices with exact commands/configs
5. [TECHNICAL ANALYSIS]: Production impact of each choice
6. [CORRECT DECISION]: Definitive answer with detailed reasoning
7. [OTHER OPTIONS ANALYSIS]: Why each incorrect choice fails
8. [DECISION FRAMEWORK]: Reusable approach for similar scenarios

DOMAIN-SPECIFIC ADAPTATIONS:
- All commands, configurations, and tools must be authentic to ${context.domain}
- Scenarios should reflect real production pressures in ${context.domain}
- Technical depth should match ${context.skillLevel} expectations
- Include domain-specific constraints and trade-offs

SAFETY REQUIREMENTS:
- Never invent non-existent CLI flags or API parameters
- Use only documented, production-tested approaches
- If uncertain about specific implementation details, provide general guidance

Generate scenarios that teach decision-making frameworks, not just memorize correct answers.
`;
}

export function generateFeedbackPrompt(context: PromptContext, selectedOption: string): string {
  return `
You are providing ${context.domain} scenario feedback for a ${context.skillLevel} engineer.

USER SELECTION: ${selectedOption}

EVALUATION CONTEXT:
- Domain: ${context.domain}
- Topic: ${context.topic}
- Learning Goal: ${context.learningGoal}

FEEDBACK STRUCTURE:
1. [DECISION ANALYSIS]: Technical validity of selected approach
2. [TECHNICAL EVALUATION]: Correctness, production impact, risk level
3. [WHY_CORRECT_ANSWER]: Deep technical reasoning for correct choice
4. [WHY_OTHER_OPTIONS_FAIL]: Specific failure modes of incorrect choices
5. [DECISION FRAMEWORK]: Reusable approach for similar decisions
6. [NEXT SCENARIO]: Generate new scenario building on this learning

Focus on teaching transferable decision-making skills rather than memorization.
Maintain technical accuracy while building confidence through understanding.
`;
}