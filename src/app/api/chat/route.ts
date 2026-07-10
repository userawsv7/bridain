import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, context, skill, mode } = await request.json();

    // Check for available API keys - Using BOTH Groq + Hugging Face for MAX POWER! ⚡🤗
    const groqKey = process.env.GROQ_API_KEY;
    const hfKey = process.env.HUGGINGFACE_API_KEY; // Works with both read & write tokens!
    const togetherKey = process.env.TOGETHER_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    let response: string;
    let emoji = '🤖';
    let powered = 'Smart';

    // MAX POWER MODE: Use Groq + Hugging Face together! 🚀
    if (groqKey && hfKey) {
      // Primary: Fast intelligent response from Groq
      const groqResponse = await callGroq(message, context, groqKey, skill, mode);
      response = groqResponse;
      emoji = '⚡';
      powered = 'Groq+HF';

      // Secondary: Enhance with Hugging Face for creative responses
      try {
        const hfEnhancement = await enhanceWithHuggingFace(message, groqResponse, hfKey);
        if (hfEnhancement) {
          response = `${groqResponse}\n\n${hfEnhancement}`;
          emoji = '🚀';
        }
      } catch (e) {
        // HF enhancement failed, but we have Groq response
      }
    }
    // Groq only (super fast responses)
    else if (groqKey) {
      response = await callGroq(message, context, groqKey, skill, mode);
      emoji = '⚡';
      powered = 'Groq';
    }
    // Hugging Face only
    else if (hfKey) {
      response = await callHuggingFace(message, context, hfKey, skill, mode);
      emoji = '🤗';
      powered = 'HuggingFace';
    }
    // OpenRouter as backup
    else if (openrouterKey) {
      response = await callOpenRouter(message, context, openrouterKey);
      emoji = '🔀';
      powered = 'OpenRouter';
    }
    // Together AI
    else if (togetherKey) {
      response = await callTogether(message, context, togetherKey);
      emoji = '🤝';
      powered = 'Together';
    }
    // Fallback to smart responses
    else {
      response = getSmartResponse(message);
      emoji = '💡';
    }

    return NextResponse.json({
      response,
      emoji,
      powered: powered
    });

  } catch (error) {
    console.error('Chat API error:', error);
    // Try to provide more helpful error info
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      response: `API Error: ${errorMessage}. Please check your API keys are valid and have sufficient credits.`,
      emoji: '⚠️',
      powered: 'Error'
    });
  }
}

async function callGroq(message: string, context: string, apiKey: string, skill?: string, mode?: string): Promise<string> {
  let systemPrompt = context;

  if (mode === 'scenario_game') {
    const skillName = skill || 'technology';
    systemPrompt = `You are creating an interactive scenario-based learning game for ${skillName} engineers.

FOCUS ON REAL DAY-TO-DAY ENGINEER SCENARIOS:
- Day-to-day activities: Code reviews, deployments, debugging production issues, monitoring alerts, handling on-call incidents
- Common struggles: Time pressure, unclear requirements, legacy code, technical debt, communication gaps, resource constraints
- Realtime working scenarios: Production incidents, deadline pressures, team conflicts, technical trade-offs, certification-style troubleshooting
- Certification questions: Best practices, security considerations, performance optimization, scalability decisions

CREATE SCENARIOS THAT INCLUDE:
1. Production debugging and incident response
2. Code review and architecture decisions
3. Deployment and CI/CD pipeline issues
4. Performance optimization challenges
5. Security and compliance decisions
6. Team collaboration and technical leadership scenarios

MANDATORY FORMAT - YOU MUST FOLLOW EXACTLY:
1. Start directly with the scenario (1-2 sentences describing a REAL ${skillName} work situation)
2. List exactly 4 choices with this EXACT format:
   1) [${skillName}-specific choice with real commands/tools]
   2) [${skillName}-specific choice with real commands/tools]
   3) [${skillName}-specific choice with real commands/tools]
   4) [${skillName}-specific choice with real commands/tools]
3. End with: CORRECT: [number 1-4]

EXAMPLE for Docker:
Your production Docker container is repeatedly crashing with OOM errors during peak traffic
1) Increase memory limits in docker-compose.yml and restart the service
2) Check docker stats and logs to identify memory-heavy processes first
3) Scale up additional container instances to distribute load
4) Switch to a different base image with lower memory footprint
CORRECT: 2

CRITICAL: Always make scenarios feel like actual engineering work. Include real tool names, commands, and decision points engineers face daily. Never use generic scenarios.`;
  } else if (mode === 'scenario_feedback') {
    systemPrompt = `You are providing structured feedback for a ${skill} scenario-based learning game.

User chose option ${message.split('option ')[1]?.split(':')[0] || 'unknown'}.

MANDATORY JSON RESPONSE FORMAT - Return ONLY valid JSON with these exact keys:
{
  "coreExplanation": "2-3 sentences explaining WHY the correct answer works technically. Use real ${skill} concepts, commands, or mechanisms. Be factual and precise.",
  "whyOthersWrong": "Explain in 1-2 sentences why each of the other 3 options fails or causes problems in production",
  "productionReasoning": "Real-world production impact: what happens when this scenario occurs? Reference monitoring, incidents, team processes, or compliance",
  "consequences": "Specific consequences of choosing a wrong option (outage duration, data loss, security breach, team conflict, etc.)",
  "bestPractices": "2-3 actionable best practices directly relevant to preventing or handling this scenario",
  "keyLearning": "One memorable takeaway statement for long-term retention",
  "nextCorrectAnswer": <number 1-4>
}

CRITICAL RULES:
- All explanations must be internally consistent with the original scenario
- Reference specific tools, commands, or ${skill} mechanisms
- No generic advice - every point must apply to the exact scenario presented
- Use production terminology (SLA, incident, rollback, canary, etc.) where appropriate`;
  } else if (mode === 'resources') {
    const skillName = skill || message;
    systemPrompt = `You are providing comprehensive learning resources for ${skillName}.

Provide a structured response with the following sections ONLY:

## CONCEPTS
- List all core concepts and sub-topics in learning order
- Start from fundamentals to advanced
- Include prerequisites

## LEARNING ORDER
1. Concept name - brief why important
2. Next concept - how it builds on previous
3. Continue logically...

## OFFICIAL DOCUMENTATION
- Official docs URLs
- API references
- Best practice guides

## CERTIFICATIONS & ROLES
- Relevant certifications with issuing organizations
- Job roles that use this skill
- Industry demand level

## GITHUB REPOSITORIES
- Official repositories
- Popular learning repos with star counts if known
- Project examples and templates

## YOUTUBE CHANNELS & VIDEOS
- Best YouTube channels for this topic
- Specific highly-rated video titles with concepts covered
- Free course playlists

## FREE LEARNING PLATFORMS
- Free courses (Coursera audit, edX, Udemy free, etc.)
- Interactive tutorials
- Documentation tutorials

## FREE LABS & EXERCISES
- Browser-based labs (Katacoda, Play with Docker, etc.)
- Free tier cloud sandboxes
- Local setup exercises
- GitHub-based hands-on projects

## COMMUNITY & REVIEWS
- Active Discord/Slack communities
- Reddit communities (r/skillname)
- Stack Overflow tags
- Blog/review sites

Be comprehensive but concise. List actual URLs and real resource names.`;
  } else {
    systemPrompt = context || `You are an expert technical coach teaching ${skill || 'technology'}.

Your role:
1. Explain concepts deeply but accessibly with analogies and real examples
2. Provide practical day-to-day work fixes and solutions
3. Share industry best practices and standards
4. Highlight common pitfalls and how to avoid them
5. Give step-by-step troubleshooting guidance

Be practical, actionable, and encouraging.`;
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 1000,
      temperature: mode === 'scenario_game' ? 0.7 : 0.3,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Groq API error: ${response.status}`;
    try {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      if (errorData.error?.message) {
        errorMessage = `Groq API error: ${errorData.error.message}`;
      }
    } catch (e) {
      // Response might not be JSON
      const text = await response.text();
      if (text) errorMessage = `Groq API error: ${text}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('Unexpected Groq response structure:', data);
    throw new Error('Invalid response from Groq API');
  }

  return data.choices[0].message.content;
}

async function callOpenRouter(message: string, context: string, apiKey: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://bridain.vercel.app',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3-8b-instruct:free',
      messages: [
        {
          role: 'system',
          content: `You are Bridain, a friendly AI coach. Keep responses helpful and encouraging. Context: ${context}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 200,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callTogether(message: string, context: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3-8b-chat-hf',
      messages: [
        {
          role: 'system',
          content: `You are Bridain AI coach. Be helpful and encouraging. ${context}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 200,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callHuggingFace(message: string, context: string, apiKey: string, skill?: string, mode?: string): Promise<string> {
  // Using Hugging Face with write token - more powerful access to models!
  const models = [
    'microsoft/DialoGPT-large',
    'facebook/blenderbot-400M-distill',
    'microsoft/DialoGPT-medium'
  ];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `As a helpful tech learning coach: ${message}`,
            parameters: {
              max_length: 150,
              temperature: 0.8,
              top_p: 0.95,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const generatedText = data[0]?.generated_text;
        if (generatedText && generatedText.length > 20) {
          return generatedText.split(':').pop()?.trim() || generatedText;
        }
      }
    } catch (e) {
      continue; // Try next model
    }
  }

  return getSmartResponse(message);
}

// MAX POWER: Use HF to enhance Groq responses with creative flair! 🔥
async function enhanceWithHuggingFace(message: string, groqResponse: string, apiKey: string): Promise<string | null> {
  try {
    // Use a creative text generation model to add personality
    const response = await fetch(
      'https://api-inference.huggingface.co/models/gpt2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `Tech tip: ${message} -> ${groqResponse}`,
          parameters: {
            max_length: 50,
            temperature: 0.9,
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const enhancement = data[0]?.generated_text;
      if (enhancement && enhancement.length > 30) {
        // Extract the creative part
        const creativePart = enhancement.replace(`Tech tip: ${message} -> ${groqResponse}`, '').trim();
        if (creativePart.length > 10 && creativePart.length < 200) {
          return `💡 Creative tip: ${creativePart}`;
        }
      }
    }
  } catch (e) {
    // HF enhancement is optional
  }

  return null;
}

function getSmartResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  const responses: { [key: string]: string } = {
    docker: "🐳 DOCKER: 4-Layer Memory Method - IMAGE(blueprint) → CONTAINER(running instance) → VOLUME(data persistence) → NETWORK(communication)\n\n🎯 LEARN: Run `docker run hello-world` → `docker ps -a` → `docker logs <id>` → `docker inspect <id>` (verify state)\n\n🔧 FIX: Check logs first, verify image exists, inspect container config, restart/recreate if corrupted\n\n💡 MNEMONIC: \"Docker Images Create Very Nice Apps\" (Image→Container→Volume→Network→App)",

    kubernetes: "☸️ K8S: POD→REPLICASET→DEPLOYMENT→SERVICE hierarchy\n\n🎯 LEARN: `kubectl get pods --all-namespaces` → check logs `kubectl logs <pod>` → describe `kubectl describe pod <name>` → check events\n\n🔧 FIX: 3-Step Debug - 1) Check pod status (CrashLoopBackOff=app crash, ImagePullBackOff=wrong image) 2) Verify config `kubectl get deploy,svc` 3) Check logs & events\n\n💡 MNEMONIC: \"Please Read Deployed Services\" (Pod→ReplicaSet→Deployment→Service)",

    ci: "🔄 CI/CD: TRIGGER→BUILD→TEST→DEPLOY→MONITOR pipeline\n\n🎯 LEARN: `.github/workflows/ci.yml` → `runs-on: ubuntu-latest` → `actions/checkout@v4` → cache deps → matrix testing\n\n🔧 FIX: Check workflow logs, verify secrets, validate YAML syntax, ensure build artifacts persist between jobs\n\n💡 MNEMONIC: \"Tigers Bite Tigers Daily, Making Muscles\" (Trigger→Build→Test→Deploy→Monitor→Metrics)",

    mlops: "🤖 MLOPS: DATA→EXPERIMENT→MODEL→DEPLOY→MONITOR lifecycle\n\n🎯 LEARN: MLflow tracking → DVC for data versioning → model registry → KServe/Seldon deployment → drift detection\n\n🔧 FIX: Track experiments first, version data/models, monitor prediction drift, retrain on data drift detection\n\n💡 MNEMONIC: \"Dads Expect Many Dogs\" (Data→Experiment→Model→Deploy→Monitor)",

    api: "🌐 REST: URL+METHOD+HEADERS+BODY+STATUS framework\n\n🎯 LEARN: Postman collection → understand methods (GET=read, POST=create, PUT=update, DELETE=remove) → status codes (2xx=success, 4xx=client error, 5xx=server error)\n\n🔧 FIX: Check request format first, validate auth headers, inspect response status, use proper error handling\n\n💡 MNEMONIC: \"Users Make Happy Beings\" (URL→Method→Headers→Body→Status)",

    test: "🧪 TESTING: UNIT→INTEGRATION→E2E→PERFORMANCE→SECURITY pyramid\n\n🎯 LEARN: Jest (units) → Supertest (API) → Cypress (E2E) → Artillery (load) → OWASP (security)\n\n🔧 FIX: Run tests locally first, check test data setup, verify environment config, isolate flaky tests\n\n💡 MNEMONIC: \"Uncle Iggy Eats Pizza Slowly\" (Unit→Integration→E2E→Performance→Security)",

    default: "🎯 TECH MASTERY METHOD: CONCEPT→ANALOGY→PRACTICE→TROUBLESHOOT→TEACH\n\n1. **Learn Concept** - Understand the 'why' before 'how'\n2. **Use Analogy** - Connect to familiar patterns (e.g., Git branches = time machine saves)\n3. **Hands-on Practice** - Run commands, break things intentionally\n4. **Systematic Debug** - LOGS→CONFIG→STATE→DEPENDENCIES flow\n5. **Teach Others** - Explain to reinforce understanding\n\n💡 Remember: Every expert was once a beginner who practiced deliberately!"
  };

  for (const [key, response] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) return response;
  }

  return responses.default;
}