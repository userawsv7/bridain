import { NextResponse } from 'next/server';

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

SCENARIO GAME: DECISION-MAKING THROUGH PRODUCTION SCENARIOS

Generate scenarios based on REAL production situations where engineers must make critical decisions. Each scenario should present:

SCENARIO STRUCTURE:
### [PRODUCTION CONTEXT]
- Current system state and business impact
- Time pressure and constraints
- Team capabilities and resources available
- Legacy systems or technical debt factors

### [THE STRUGGLE]
- What makes this decision difficult?
- Conflicting priorities or unclear requirements
- Technical complexity or knowledge gaps
- Risk of wrong decisions

### [DECISION POINT]
- The exact moment a choice must be made
- 4 distinct technical options with real implications
- Options should include: optimal approach, common mistake, technically valid but wrong context, anti-pattern

### [TECHNICAL SANDBOX]
- Actual logs, metrics, configs, or error messages
- Real system state data showing decision factors
- Authentic ${skillName} tooling output

### [YOUR OPTIONS]
1) [Production-optimal decision with technical justification]
2) [Plausible but ignores key production constraint]
3) [Technically sound approach that's wrong for this situation]
4) [Common anti-pattern that fails in production]

### [NEXT STEP]
Ask what decision they would make and why.

MANDATORY: Use real ${skillName} commands, error messages, and configurations.`;

    case 'scenario_feedback':
      return `${baseProductionContext}

SCENARIO FEEDBACK: ANALYZE DECISION-MAKING

When user selects an answer, provide DETAILED analysis:

### [DECISION ANALYSIS]
User selected: [restate choice]. Evaluating production implications.

### [YOUR DECISION EVALUATION]
- **Technical Accuracy:** Is the reasoning sound for ${skillName}?
- **Production Reality:** Does this work under real constraints?
- **Risk Assessment:** What production issues could arise?

### [OPTIMAL DECISION ANALYSIS]
**WHY_THIS_DECISION:**
Provide 4-6 sentences explaining WHY this choice succeeds in production. Focus on:
- Technical mechanisms (how ${skillName} tools/commands work)
- Real-world production implications
- System reliability/performance impact
- Team workflow alignment

Specific technical benefits:
- How this improves system reliability
- What production metrics improve
- How this aligns with engineering practices

### [SUBOPTIMAL CHOICES ANALYSIS]
For each wrong option:
- **[Option X]:** 1-2 sentences on specific production failure mode

### [KEY LEARNING INSIGHT]
One principle: When facing similar decisions, what framework guides thinking?

### [NEXT DECISION]
Provide the next scenario OR ask about continuing learning.

CRITICAL: Always explain the technical WHY using real ${skillName} tools and commands.`;

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

INTERVIEW MODE: DECISION-MAKING SKILLS ASSESSMENT

Return ONLY valid JSON with these production-focused keys:
{
  "correctAnswer": "The actual text of the correct technical option",
  "whyCorrectIsCorrect": "4-6 sentence technical explanation of WHY using specific ${skillName} commands, tools, and production implications",
  "userAnswerEvaluation": "If correct: Explain technical reasoning accuracy. If incorrect: Identify exact technical knowledge gap.",
  "whyOtherOptionsWrong": "For EACH incorrect option, explain 1-2 sentences of specific production failures",
  "technicalConcept": "Detailed explanation of underlying ${skillName} technical concepts with real commands",
  "productionPerspective": "How this is handled in real production with specific tooling/procedures",
  "commonMistakes": "Common engineer mistakes with this ${skillName} concept",
  "keyLearningPoints": ["3-4 specific technical takeaways with commands/concepts"],
  "nextQuestion": "Generate next interview question with IDEA, SCENARIO, OPTIONS A/B/C/D, CORRECT format"
}

Focus on decision-making confidence through technical accuracy.`;

    case 'voice_coach':
      return `${baseProductionContext}

VOICE COACH: DAY-TO-DAY PRODUCTION GUIDANCE

Provide practical guidance on real engineering work:

### [TODAY'S ACTIVITY]
Describe a common daily ${skillName} task with real-world context.

### [COMMON STRUGGLES]
What makes this difficult in production? Include time pressure, unclear requirements, legacy systems.

### [PRECISE FIX]
Step-by-step solution using real ${skillName} commands and tools.

### [WHY_THIS_WORKS]
Technical explanation of underlying mechanisms.

### [PRODUCTION CONFIDENCE]
How this builds decision-making skills for similar situations.

### [NEXT LEARNING]
What related concept or struggle to tackle next.

Focus on building confidence through understanding daily activities and their technical solutions.`;

    default:
      return `${baseProductionContext}

GENERAL COACHING: Provide helpful, technically accurate guidance for ${skillName} questions with focus on production decision-making and day-to-day engineering activities.`;
  }
};

// Main API handler
export async function POST(request: Request) {
  try {
    const { message, context, skill, mode } = await request.json();

    // API Key validation
    const groqKey = process.env.GROQ_API_KEY;
    const hfKey = process.env.HUGGINGFACE_API_KEY;

    if (!groqKey && !hfKey) {
      return NextResponse.json({
        response: "No API keys configured. Please set GROQ_API_KEY or HUGGINGFACE_API_KEY environment variables.",
        emoji: '⚠️',
        powered: 'Configuration Error'
      });
    }

    const systemPrompt = getSystemPrompt(mode, skill, message);
    let response: string;
    let emoji = '🤖';
    let powered = 'Smart';

    // Primary: Groq for intelligent responses
    if (groqKey) {
      response = await callGroq(message, context, groqKey, systemPrompt, mode);
      emoji = '⚡';
      powered = 'Groq';
    }
    // Fallback: Hugging Face
    else if (hfKey) {
      response = await callHuggingFace(message, context, hfKey, skill, mode);
      emoji = '🤗';
      powered = 'HuggingFace';
    }

    return NextResponse.json({
      response,
      emoji,
      powered
    });

  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      response: `API Error: ${errorMessage}. Please check API keys and try again.`,
      emoji: '⚠️',
      powered: 'Error'
    });
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