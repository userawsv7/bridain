import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json();

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
      const groqResponse = await callGroq(message, context, groqKey);
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
      response = await callGroq(message, context, groqKey);
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
    return NextResponse.json({
      response: "I'm having trouble connecting right now. Here's a tip: Practice makes perfect! What would you like to explore? 🌟",
      emoji: '💭',
      powered: 'Fallback'
    });
  }
}

async function callGroq(message: string, context: string, apiKey: string): Promise<string> {
  const systemPrompt = `You are Bridain, an EXPERT-LEVEL technical mentor and troubleshooter (not senior level - INVENTOR/EXPERT level).

For ANY skill mentioned (Docker, Kubernetes, ArgoCD, CI/CD, Python, React, AWS, Terraform, ML, etc.):

1. Provide DETAILED troubleshooting steps with exact commands
2. Explain concepts at EXPERT depth with real-world scenarios
3. Give production-grade best practices and gotchas
4. Structure responses as: Problem → Root Cause → Solution → Prevention
5. Include specific error codes, logs to check, and diagnostic commands
6. Always be thorough but concise - use bullet points and code blocks
7. Cover edge cases and advanced scenarios

You are training the next generation of expert engineers. Be authoritative, precise, and extremely helpful.`;

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
      temperature: 0.3,
    }),
  });

  const data = await response.json();
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