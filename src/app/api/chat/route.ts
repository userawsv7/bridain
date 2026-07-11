import { NextResponse } from 'next/server';
import { ChatRequest, ChatResponse } from '../../../types/bridain';
import { buildSystemPrompt } from '../../../lib/ai/prompts/systemPrompts';
import { buildEvaluatorPrompt } from '../../../lib/ai/prompts/evaluatorPrompts';
import { generateScenarioPrompt } from '../../../lib/ai/prompts/scenarioPrompts';
import { buildConversationContext } from '../../../lib/ai/utils/contextBuilder';
import { PromptContext } from '../../../lib/ai/types/ai';

// Centralized AI Prompt Engine - replaces inline prompts
const getSystemPrompt = (mode: string, skill: string, message?: string, context?: string, skillLevel?: string) => {
  // Use new centralized prompt engine for modern domains
  if (mode === 'evaluation' || mode === 'interview_feedback') {
    const skillLvl = (skillLevel as any) || 'Intermediate';
    const promptContext: PromptContext = {
      domain: (skill as any) || 'Software Engineering',
      topic: context || 'General Programming',
      skillLevel: skillLvl,
      learningGoal: 'Interview Prep'
    };
    return buildEvaluatorPrompt(promptContext, message || '');
  }

  if (mode === 'scenario_game' || mode === 'scenario_feedback') {
    const skillLvl = (skillLevel as any) || 'Intermediate';
    const promptContext: PromptContext = {
      domain: (skill as any) || 'DevOps',
      topic: context || 'Production Scenarios',
      skillLevel: skillLvl,
      learningGoal: 'Production Troubleshooting'
    };
    return generateScenarioPrompt(promptContext);
  }

  // Handle resources mode
  if (mode === 'resources') {
    const rsSkillName = skill || 'technology';
    return `You are a TECHNICAL LEARNING RESOURCES ARCHITECT. Generate structured learning resources for ${rsSkillName}.

Return ONLY a JSON object matching this exact schema:
{
  "coreConcepts": [{"level": "beginner|intermediate|advanced", "concept": "name", "explanation": "brief explanation"}],
  "certifications": [{"name": "cert name", "officialUrl": "url", "studyGuidesAndDumps": ["guide1"], "cost": "price", "faqs": ["faq1"]}],
  "interviewPrep": [{"question": "question", "answer": "answer", "difficulty": "beginner|intermediate|advanced"}],
  "dayToDayRealWorld": [{"scenario": "scenario", "struggle": "struggle", "solution": "solution"}],
  "learningResources": {
    "bestYoutubeTutorials": [{"title": "title", "url": "url"}],
    "githubRepos": [{"name": "name", "url": "url", "description": "desc"}],
    "cheatsheets": [{"topic": "topic", "url": "url"}],
    "popularWebsites": [{"name": "name", "url": "url", "description": "desc"}],
    "otherValuableResources": [{"title": "title", "type": "type", "url": "url", "description": "desc"}]
  }
}`;
  }

  // Fallback to new system for general coaching
  const skillLvl = (skillLevel as any) || 'Intermediate';
  const promptContext: PromptContext = {
    domain: (skill as any) || 'Software Engineering',
    topic: context || skill || 'General Programming',
    skillLevel: skillLvl,
    learningGoal: 'Concept Mastery',
    previousContext: context
  };

  const newPrompt = buildSystemPrompt(promptContext);

  // If new prompt engine provides adequate response, use it
  if (newPrompt.length > 100) {
    return newPrompt;
  }

  // Legacy prompts for backward compatibility (kept for existing functionality)
  // Production-focused system prompts for different modes

  const skillName = skill || 'technology';
  const userSkillLevel = skillLevel || 'Intermediate';

  const baseProductionContext = `You are an EXPERT ${skillName.toUpperCase()} PRODUCTION COACH. Your role is teaching decision-making skills through real production scenarios that mirror day-to-day engineering activities.

SKILL LEVEL: ${userSkillLevel}
ADAPT QUESTIONS TO SKILL LEVEL:
- Beginner: Basic commands, single-service issues, straightforward solutions
- Intermediate: Multi-service interactions, monitoring, deployment strategies
- Advanced: Distributed systems, performance optimization, complex debugging

CORE TEACHING PRINCIPLES:
1. TEACH DAY-TO-DAY ACTIVITIES: Show exactly what engineers do daily
2. REVEAL COMMON STRUGGLES: Expose real production challenges and pressure points
3. PROVIDE PRECISE FIXES: Give technically accurate solutions with commands/tools
4. BUILD CONFIDENCE: Explain WHY decisions work, not just what to do
5. 100% TECHNICAL ACCURACY: Every command, config, and concept must be correct
6. SKILL-APPROPRIATE COMPLEXITY: Match question difficulty to user skill level`;

  switch (mode) {
    case 'scenario_game':
      return `${baseProductionContext}

SCENARIO GAME: SPECIFIC DECISION-MAKING SCENARIOS FOR ${userSkillLevel} LEVEL

Generate CONCRETE production scenarios with EXACT technical details appropriate for ${userSkillLevel}:

### [PRODUCTION CONTEXT]
Provide realistic ${userSkillLevel}-level scenario with specific metrics and logs

### [THE STRUGGLE]
Define clear operational constraints and business impact

### [DECISION POINT]
Present specific technical decision with command-line options

### [YOUR OPTIONS]
Provide 4 options with EXACT commands appropriate for ${userSkillLevel}:
- Options must be technically achievable at the stated skill level
- Include correct answer with precise technical reasoning
- Explain exactly why each wrong option fails

### [CORRECT ANSWER - ALWAYS PROVIDED FIRST]
**Answer: Option [X] - [exact technical reason]**

**WHY THIS IS CORRECT:**
- Specific technical mechanism that makes this work
- Production implications and safety guarantees
- Exact commands and expected outputs

### [OTHER OPTIONS ANALYSIS - ALWAYS PROVIDED]
For each wrong option, explain:
- Why it fails technically
- What production impact it causes
- The specific configuration or command error

### [SKILL-LEVEL VALIDATION]
Ensure all scenarios, commands, and explanations match ${userSkillLevel} competency level.

Ready to practice?`;

    case 'scenario_feedback':
      return `${baseProductionContext}

SCENARIO FEEDBACK: MCQ VALIDATION FLOW FOR ${userSkillLevel} LEVEL

MANDATORY MCQ RESPONSE STRUCTURE - FOLLOW EXACTLY:

### STEP 1: CORRECT ANSWER REVEALED FIRST
**CORRECT ANSWER: Option [X] - [One sentence technical explanation of why this is correct]**

**WHY THIS IS TECHNICALLY CORRECT:**
- Exact technical mechanism: [specific CLI behavior, config validation, or system process]
- Production guarantee: [zero-downtime, data consistency, security boundary, etc.]
- Expected outcome: [precise command output or system state change]
- ${userSkillLevel}-level reasoning: [why this approach matches the skill level]

### STEP 2: USER SELECTION ANALYSIS
**User selected: Option [Y]**

**VERDICT:** [CORRECT] or [INCORRECT]
**HIGHLIGHT:** [Green for correct, Red for incorrect]

### STEP 3: 100% TECHNICAL ACCURACY EXPLANATION
**Technical Accuracy Analysis:**
- If user was CORRECT: Confirm the exact technical details and reinforce the correct approach
- If user was INCORRECT: State precisely what was wrong with their choice and why it fails technically

**Exact Technical Details:**
- Command behavior: [specific CLI/API behavior]
- System state impact: [what actually happens in production]
- Risk assessment: [precise failure modes and blast radius]
- ${userSkillLevel} considerations: [complexity level appropriate for skill]

### STEP 4: SKILL-LEVEL VALIDATION
All explanations and technical details must be accurate for ${userSkillLevel} practitioners.

### [NEXT SCENARIO]
Generate new specific ${skillName} scenario at ${userSkillLevel} level with exact commands.`;

    case 'resources':
      return `You are providing comprehensive learning resources specifically for ${skillName}.

PROVIDE STRUCTURED LEARNING PATH with ACTUAL resources:

## CONCEPTS
List 8-12 core concepts in learning progression order from fundamentals to advanced.

## LEARNING PATH
Step-by-step progression showing concept dependencies and building knowledge.

## OFFICIAL DOCUMENTATION
- Main official docs URL
- API reference documentation
- Best practices guides from authoritative sources

## CERTIFICATIONS & CAREER PATHS
- Specific certifications with issuing organizations
- Job roles requiring ${skillName} expertise
- Industry demand indicators

## GITHUB REPOSITORIES
- Official project repositories
- Popular learning repositories with star counts
- Hands-on project examples

## YOUTUBE CHANNELS & COURSES
- Top YouTube channels for ${skillName}
- Specific video/course recommendations
- Free learning playlists

## FREE LEARNING PLATFORMS
- Coursera (audit mode), edX, free Udemy courses
- Interactive tutorials and documentation
- Browser-based learning environments

## FREE LABS & PRACTICE
- Katacoda, Play with Docker, cloud sandboxes
- Local setup exercises and projects
- GitHub-based hands-on practice

## COMMUNITY & SUPPORT
- Active Discord/Slack communities
- Relevant Reddit communities (r/subreddit)
- Stack Overflow tags
- Professional forums and groups

Provide real URLs, actual resource names, and specific certification details.`;

    case 'interview_feedback':
      return `${baseProductionContext}

INTERVIEW MODE: Generate specific ${skillName} interview questions with exact technical answers.

Return JSON with these fields:
- question: specific technical scenario
- options: A/B/C/D with exact commands like "kubectl get pods"
- correctAnswer: "A", "B", "C", or "D"
- whyCorrect: technical explanation of why answer is correct
- whyWrong: object explaining why each wrong option fails
- technicalConcept: underlying technical details
- productionUse: how used in real production
- commonMistake: typical engineer error
- nextQuestion: new question topic

Use real commands. Provide definitive technical answers.`;

    case 'voice_coach':
      return `${baseProductionContext}

VOICE COACH: SPECIFIC PRODUCTION GUIDANCE

Provide CONCRETE daily production guidance with exact commands:

### [TODAY'S ACTIVITY]
Example: "Debug why production pods are CrashLoopBackOff after deployment"

### [COMMON STRUGGLES]
- Time pressure: Issue started 15 minutes ago, impacting 5000 users
- Legacy constraint: Using Kubernetes 1.18, limited observability tools
- Knowledge gap: New team member deployed without proper health checks

### [PRECISE DEBUG STEPS]
1. \`kubectl get pods -l app=api --all-namespaces\` - identify affected pods
2. \`kubectl describe pod <pod-name>\` - check Events section for specific errors
3. \`kubectl logs <pod-name> --previous\` - examine crash logs from last attempt
4. \`kubectl get events --sort-by=.lastTimestamp\` - see deployment timeline

### [ROOT CAUSE ANALYSIS]
Example: "ImagePullBackOff - container registry credentials expired after 90 days"

### [EXACT FIX]
\`kubectl create secret docker-registry regcred --docker-server=registry.company.com --docker-username=svc-k8s --docker-password=<token>\`
\`kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "regcred"}]}'\`

### [WHY_THIS_WORKS]
- Secrets provide authenticated registry access
- ServiceAccount patching applies to all pods using default SA
- Prevents repeated authentication failures

### [DECISION FRAMEWORK]
When facing pod failures: LOGS → EVENTS → CONFIG → AUTH → NETWORK

### [PREVENTION]
Add registry credential rotation to monthly maintenance checklist

Ask what specific ${skillName} issue they're facing today.`;

    default:
      return `${baseProductionContext}

GENERAL COACHING: Provide helpful, technically accurate guidance for ${skillName} questions with focus on production decision-making and day-to-day engineering activities.`;
  }
};

// Main API handler with strict typing
export async function POST(request: Request): Promise<NextResponse<ChatResponse>> {
  try {
    const body: ChatRequest = await request.json();
    const { message, context, skill, mode } = body;

    // Input validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        response: "Invalid request: message is required and must be a string.",
        emoji: '⚠️',
        powered: 'Validation Error'
      } as ChatResponse);
    }

    // API Key validation
    const groqKey = process.env.GROQ_API_KEY;
    const hfKey = process.env.HUGGINGFACE_API_KEY;

    if (!groqKey && !hfKey) {
      return NextResponse.json({
        response: "No API keys configured. Please set GROQ_API_KEY or HUGGINGFACE_API_KEY environment variables.",
        emoji: '⚠️',
        powered: 'Configuration Error'
      } as ChatResponse);
    }

    const systemPrompt = getSystemPrompt(mode || 'default', skill || 'technology', message);
    let response: string;
    let emoji = '🤖';
    let powered = 'Smart';

    // Primary: Groq for intelligent responses
    if (groqKey) {
      response = await callGroq(message, context || '', groqKey, systemPrompt, mode);
      emoji = '⚡';
      powered = 'Groq';
    }
    // Fallback: Hugging Face
    else if (hfKey) {
      response = await callHuggingFace(message, context || '', hfKey, skill, mode);
      emoji = '🤗';
      powered = 'HuggingFace';
    } else {
      throw new Error('No API keys available');
    }

    return NextResponse.json({
      response,
      emoji,
      powered
    } as ChatResponse);

  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      response: `API Error: ${errorMessage}. Please check API keys and try again.`,
      emoji: '⚠️',
      powered: 'Error'
    } as ChatResponse);
  }
}

// Groq API caller with enhanced error handling
async function callGroq(message: string, context: string, apiKey: string, systemPrompt: string, mode?: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: mode === 'resources' ? 2000 : 1500,
      temperature: mode === 'scenario_game' ? 0.7 : 0.3,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();

  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid response structure from Groq API');
  }

  return data.choices[0].message.content;
}

// Hugging Face fallback
async function callHuggingFace(message: string, context: string, apiKey: string, skill?: string, mode?: string): Promise<string> {
  const models = ['microsoft/DialoGPT-large', 'facebook/blenderbot-400M-distill'];

  for (const model of models) {
    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `As a ${skill} production coach: ${message}`,
          parameters: { max_length: 200, temperature: 0.7 },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data[0]?.generated_text;
        if (text && text.length > 30) {
          return text.split(':').pop()?.trim() || text;
        }
      }
    } catch (e) {
      continue;
    }
  }

  return getFallbackResponse(skill || 'technology', message);
}

// Fallback responses when APIs unavailable
function getFallbackResponse(skill: string, message: string): string {
  const responses: { [key: string]: string } = {
    docker: "DOCKER PRODUCTION GUIDANCE:\n\nDay-to-Day: Run containers, manage images, debug networking\nStruggle: Container won't start, image pull fails, port conflicts\nFix: Check `docker logs`, verify image exists, inspect networking\nWhy: Understanding container lifecycle prevents production issues",

    kubernetes: "KUBERNETES PRODUCTION GUIDANCE:\n\nDay-to-Day: Deploy pods, manage services, monitor health\nStruggle: Pods crash, services unreachable, resource limits\nFix: Use `kubectl describe/get/logs` for debugging\nWhy: Proper debugging prevents cascading failures",

    default: `${skill.toUpperCase()} PRODUCTION COACHING:\n\nFocus on daily activities, understand struggles, apply precise fixes. Build confidence through technical understanding of WHY decisions work.`
  };

  const lowerMessage = message.toLowerCase();
  for (const [key, response] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) return response;
  }
  return responses.default;
}