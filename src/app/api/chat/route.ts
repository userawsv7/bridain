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
    // Hugging Face (with write token - more powerful access)
    else if (hfKey) {
      response = await callHuggingFace(message, context, hfKey);
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
    // Return an intelligent fallback response
    return NextResponse.json({
      response: "I'm here to help you learn! What skill would you like to explore?",
      emoji: '💡',
      powered: 'Fallback'
    });
  }
}

async function callGroq(message: string, context: string, apiKey: string, skill?: string, mode?: string): Promise<string> {
  let systemPrompt = context;

  if (mode === 'scenario_game') {
    systemPrompt = `You are creating an interactive scenario-based learning game for ${skill}.

Generate engaging, realistic work scenarios with clear multiple-choice options.
Format your response with clear SCENARIO and CHOICES sections.
Make scenarios feel like real day-to-day work situations - intelligent and educational.
Create 4 distinct choices that represent different approaches to the problem.
Keep responses engaging and fun while being educational.`;
  } else if (mode === 'scenario_feedback') {
    systemPrompt = `You are providing feedback in a scenario learning game for ${skill}.

Analyze the user's choice and provide:
1. Whether this was a good or poor choice and why
2. Educational explanation of the correct approach
3. Award points for good decisions
4. Generate the next scenario continuing from this decision
5. Keep it engaging like an intelligent game

Previous choice context: ${message}`;
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
      model: 'llama3-8b-8192',
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
    const errorData = await response.json();
    console.error('Groq API error:', errorData);
    throw new Error(`Groq API error: ${response.status}`);
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

async function callHuggingFace(message: string, context: string, apiKey: string): Promise<string> {
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
    docker: "Docker packages apps in containers 🐳. Start with: docker run hello-world, then try docker build -t myapp .",
    kubernetes: "K8s orchestrates containers ☸️. Practice with: kubectl get pods, then explore deployments and services.",
    ci: "CI/CD automates deployments 🔄. GitHub Actions + Docker = seamless deployments! Start simple.",
    mlops: "MLOps manages ML lifecycles 🤖. Track with MLflow, deploy with KServe. Start with experiment tracking.",
    api: "REST APIs communicate via HTTP 🌐. Try Postman, understand status codes, always validate inputs!",
    test: "Testing catches bugs early 🧪. Start with unit tests, then integration, finally e2e with Cypress.",
    default: "Great question! 🌟 Break complex topics into small chunks. Practice daily. You're making progress! What specific part interests you?"
  };

  for (const [key, response] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) return response;
  }

  return responses.default;
}