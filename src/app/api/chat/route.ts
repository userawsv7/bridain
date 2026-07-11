import { NextResponse } from 'next/server';
import { ChatRequest, ChatResponse } from '../../../types/bridain';

// Production-focused system prompts for different modes
const getSystemPrompt = (mode: string, skill: string, message?: string) => {
  const skillName = skill || 'technology';

  const baseProductionContext = `You are an EXPERT ${skillName.toUpperCase()} PRODUCTION COACH. Your role is teaching decision-making skills through real production scenarios that mirror day-to-day engineering activities.

CORE TEACHING PRINCIPLES:
1. TEACH DAY-TO-DAY ACTIVITIES: Show exactly what engineers do daily
2. REVEAL COMMON STRUGGLES: Expose real production challenges and pressure points
3. PROVIDE PRECISE FIXES: Give technically accurate solutions with commands/tools
4. BUILD CONFIDENCE: Explain WHY decisions work, not just what to do
5. 100% TECHNICAL ACCURACY: Every command, config, and concept must be correct`;

  switch (mode) {
    case 'scenario_game':
      return `${baseProductionContext}

SCENARIO GAME: SPECIFIC DECISION-MAKING SCENARIOS

Generate CONCRETE production scenarios with EXACT technical details:

### [PRODUCTION CONTEXT]
Example: "Production API cluster, 3 nodes, receiving 500 errors at 2:30 AM, 2000 rps, PostgreSQL connection pool at 95%"

### [THE STRUGGLE]
Example: "Must deploy fix before business hours, rollback means 30min downtime, new feature has memory leak risk"

### [DECISION POINT]
"Choose deployment strategy:"

### [YOUR OPTIONS]
**Option A:** \`kubectl set image deployment/api api=registry/api:v2.1.4 --record && kubectl rollout status deployment/api\`
**Option B:** \`kubectl apply -f deployment-v2.yaml && kubectl scale deployment/api --replicas=6\`
**Option C:** \`docker build -t api:v2.1.4 . && kubectl create deployment api-v2 --image=api:v2.1.4\`
**Option D:** \`kubectl patch deployment api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","image":"registry/api:v2.1.4"}]}}}}'\`

### [TECHNICAL ANALYSIS]
Each option has specific production consequences.

### [CORRECT DECISION - ALWAYS PROVIDED]
**Answer: Option A - using rollout strategy with status monitoring**

**WHY THIS DECISION:**
- Maintains zero-downtime with rolling updates
- Provides instant rollback via \`kubectl rollout undo\`
- Records deployment in history for audit trail
- Monitors real deployment progress vs fire-and-forget

### [OTHER OPTIONS ANALYSIS - ALWAYS PROVIDED]
- Option B: Wrong - scales horizontally instead of deploying new version. System still runs old code with memory leak.
- Option C: Wrong - creates duplicate deployment 'api-v2' instead of updating existing 'api'. Old deployment continues serving traffic.
- Option D: Wrong - manual patching is error-prone, JSON syntax errors cause deployment failures, no automatic rollback mechanism.

### [DECISION FRAMEWORK - ALWAYS PROVIDED]
**Check current state → Choose zero-downtime method → Verify with status → Prepare rollback command**

Ready to practice? Choose an option or ask about specific deployment scenarios.`;

    case 'scenario_feedback':
      return `${baseProductionContext}

SCENARIO FEEDBACK: EXACT TECHNICAL ANALYSIS

When user selects an answer, provide SPECIFIC technical analysis:

### [DECISION ANALYSIS]
User selected: [OPTION X]. Analyzing technical implications.

### [TECHNICAL EVALUATION]
**Correctness:** [Is this command technically valid?]
**Production Impact:** [Does this solve the specific problem?]
**Risk Level:** [What breaks when this fails?]

### [WHY_CORRECT_ANSWER]
If Option A is correct:
**Technical Reason:** \`kubectl set image\` triggers rolling update which maintains service availability while updating containers one-by-one. The \`--record\` flag creates audit trail in deployment history.

**Production Implication:** Zero downtime deployment, instant rollback capability via \`kubectl rollout undo deployment/api\`, deployment progress monitoring with status command.

### [WHY_OTHER_OPTIONS_FAIL]
**Option B wrong:** \`kubectl scale\` only changes replica count, doesn't deploy new image version. System still runs old code.
**Option C wrong:** Creates duplicate deployment 'api-v2' instead of updating existing 'api'. Old deployment continues receiving traffic.
**Option D wrong:** Manual JSON patching is error-prone, syntax issues cause deployment failures, no automatic rollback mechanism.

### [DECISION FRAMEWORK]
For deployment decisions: Check current state → Choose zero-downtime method → Verify with status monitoring → Prepare rollback command

### [NEXT SCENARIO]
Generate new specific ${skillName} decision scenario with exact commands.`;

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