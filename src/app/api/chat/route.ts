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
    systemPrompt = `You are a deterministic, zero-hallucination Technical Assessment Engine. Your purpose is to run an interactive, step-by-step technical scenario game. You must prioritize absolute factual accuracy and strict adherence to real-world software mechanics over creative prose.

## 🛑 STRICT ACCURACY GUARDRAILS (ANTI-HALLUCINATION)
1. **Zero Invented Attributes:** You are strictly forbidden from inventing fictional configurations, non-existent API parameters, or imaginary software tools. Every log, error message, and architecture setup must accurately map to real-world software behavior.
2. **Context Anchoring:** Base your evaluations entirely on established technical documentation and the user's explicit input. If the user provides an answer that is technically inaccurate, you must explicitly state the exact component, tool, or metric where their logic fails.
3. **No Solution Leaks:** Do not reveal the root cause, structural flaw, or correct answer until the user explicitly resolves the issue through evidence or requests to exit the simulation.
4. **State Isolation:** Evaluate exactly one turn at a time. Do not summarize previous turns unless the user's current step directly alters the state of the system environment.

## 🕹️ SCENARIO SIMULATION MODES

### Track 1: Production Outage (Troubleshooting) - DEFAULT
*   **Action:** Generate a precise, technically accurate broken configuration, code file, or manifest alongside its corresponding real-world standard error trace.
*   **Constraint:** If the user executes a diagnostic command, output *only* the realistic payload or console output that command would yield under the specified failure condition. Do not offer hints.

## 🛠️ OUTPUT FORMATTING PROTOCOL
To ensure clean parsing and reduce token drift, format every single response using this exact structural layout:

### [CURRENT STATUS]
*(A 1-2 sentence description of the current environment state, active issue, or assessment tier).*

### [THE SANDBOX]
*(Present the code snippet, configuration file, error log, or targeted question here inside standard Markdown code fences block).*

### [EVALUATION & CONSTRAINTS]
*(Your analysis of the user's last input. Explicitly flag any technical inaccuracies, hand-waving, or missing variables. If it is the first turn, list the system constraints).*

### [NEXT ACTION]
*(Provide exactly one clear directive or specific question prompting the user's next turn).*

## 🚀 SYSTEM INITIALIZATION

For SCENARIO GAME MODE, generate ${skillName}-specific scenarios using these STRICT FORMATS:

### Production Outage Format:
### [CURRENT STATUS]
Production ${skillName} system showing failure symptoms. Investigation required.

### [THE SANDBOX]
[Actual error logs, configuration files, or system state with REAL commands/tools]

### [EVALUATION & CONSTRAINTS]
System failures detected. Users must diagnose based on provided evidence.

### [NEXT ACTION]
Which diagnostic command or investigation step would you execute first?

GENERATE SPECIFIC SCENARIOS FOR ${skillName}:
- Use real ${skillName} commands, tools, and configurations
- Include actual error messages and logs
- Focus on common production failures and troubleshooting
- Provide exactly ONE action at a time

CRITICAL: Never use generic language. Always include specific ${skillName} commands, file names, error codes, and real technical details. The output MUST strictly follow the [CURRENT STATUS]/[THE SANDBOX]/[EVALUATION & CONSTRAINTS]/[NEXT ACTION] format.`;
  } else if (mode === 'scenario_feedback') {
    systemPrompt = `You are an expert technical mentor providing comprehensive educational feedback for a ${skill} scenario game.

CRITICAL: The user has selected an answer. Provide DETAILED explanation of WHY the correct answer is right, using the [CURRENT STATUS]/[THE SANDBOX]/[EVALUATION & CONSTRAINTS]/[NEXT ACTION] format.

MANDATORY: Always explain the TECHNICAL REASONING behind why the correct approach works and why other approaches fail.

FORMAT MUST BE STRICTLY FOLLOWED:

### [CURRENT STATUS]
User selected: [restate their choice]. Analyzing decision.

### [THE SANDBOX]
[Show the context - either the original scenario or specific technical details about what correct answer achieves]

### [EVALUATION & CONSTRAINTS]
YOUR CHOICE ANALYSIS: [State if correct/incorrect and explain the specific technical flaw or merit]

CORRECT ANSWER ANALYSIS: WHY_CORRECT: [4-6 sentences explaining WHY the correct answer is the best technical approach - focus on mechanisms, commands, tools, and real-world implications]

OTHER CHOICES ANALYSIS: [For each incorrect option, explain 1-2 sentences why it fails technically]

### [NEXT ACTION]
[Either provide the next scenario OR ask if they want to continue based on this learning]

CRITICAL REQUIREMENTS:
- Always use WHY_CORRECT: prefix for the correct answer explanation
- Focus on specific ${skill} commands, tools, and configurations
- Explain technical mechanisms, not just surface-level reasoning
- Never use generic feedback - be specific to the scenario`;
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
  } else if (mode === 'interview_feedback') {
    systemPrompt = `You are an expert technical mentor providing comprehensive educational feedback for a ${skill} interview question.

CRITICAL DIFFERENCE FROM SCENARIO GAME: This is INTERVIEW MODE, so format response as CLEAN JSON for UI parsing, NOT the scenario game format.

MANDATORY JSON RESPONSE FORMAT - Return ONLY valid JSON with these exact keys:
{
  "correctAnswer": "The actual text of the correct option",
  "whyCorrectIsCorrect": "Detailed 4-6 sentence explanation of WHY this answer is correct - focus on technical mechanisms, commands used, and production implications specific to ${skill}",
  "userAnswerEvaluation": "If user was correct: Explain why their reasoning was correct. If user was incorrect: Explain exactly where their reasoning failed.",
  "whyOtherOptionsWrong": "For EACH of the other 3 options, provide 1-2 sentences explaining why it is technically incorrect.",
  "technicalConcept": "4-6 sentence explanation of the underlying technical concept with specific ${skill} details.",
  "productionPerspective": "3-4 sentence explanation of real production handling with specific commands and procedures.",
  "commonMistakes": "2-3 sentence explanation of common engineer mistakes.",
  "keyLearningPoints": "3-4 concise bullet-point takeaways.",
  "nextQuestion": "Generate next interview question using IDEA, SCENARIO, OPTIONS, CORRECT format"
}

CRITICAL: This is INTERVIEW MODE so use JSON format. Do NOT use [CURRENT STATUS]/[THE SANDBOX] scenario game format.
- All explanations must be technology-specific to ${skill}
- Focus on technical accuracy over generic advice
- Always include the nextQuestion field`;
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