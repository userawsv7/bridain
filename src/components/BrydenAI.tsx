'use client';

import React, { useState } from 'react';
import { ExternalLink, ArrowRight, MessageCircle, Send } from 'lucide-react';

interface Provider {
  name: string;
  url: string;
  steps: string[];
  freeLimit: string;
}

const providers: Provider[] = [
  {
    name: 'Anthropic Claude',
    url: 'https://console.anthropic.com/settings/keys',
    steps: [
      'Go to console.anthropic.com',
      'Sign up with email (no credit card required)',
      'Go to Settings → API Keys',
      'Click "Create Key"',
      'Copy your key (starts with sk-ant-)'
    ],
    freeLimit: '$5 free credits on signup'
  },
  {
    name: 'OpenAI GPT',
    url: 'https://platform.openai.com/api-keys',
    steps: [
      'Visit platform.openai.com',
      'Create account with email',
      'Navigate to API Keys in dashboard',
      'Click "Create new secret key"',
      'Copy key immediately (sk-proj-...)'
    ],
    freeLimit: '$5 free credits on signup (~$18)'
  },
  {
    name: 'Google Gemini',
    url: 'https://aistudio.google.com/app/apikey',
    steps: [
      'Go to aistudio.google.com',
      'Sign in with Google account',
      'Click "Get API key"',
      'Create new API key',
      'Copy the generated key'
    ],
    freeLimit: '60 requests/minute free tier'
  },
  {
    name: 'Cohere',
    url: 'https://dashboard.cohere.ai/welcome/register',
    steps: [
      'Sign up at dashboard.cohere.ai',
      'Verify your email',
      'Go to API Keys section',
      'Generate new trial API key',
      'Copy key (starts with CAPI-)'
    ],
    freeLimit: '1,000 API calls/month free'
  },
  {
    name: 'Hugging Face',
    url: 'https://huggingface.co/settings/tokens',
    steps: [
      'Create account at huggingface.co',
      'Go to Settings → Access Tokens',
      'Click "New token"',
      'Select read permissions',
      'Copy your token (hf_...)'
    ],
    freeLimit: '30,000 characters/month free'
  },
  {
    name: 'Mistral AI',
    url: 'https://console.mistral.ai/api-keys',
    steps: [
      'Visit console.mistral.ai',
      'Sign up with email',
      'Navigate to API Keys',
      'Create new API key',
      'Copy the key for use'
    ],
    freeLimit: '€1 free credits (~$1.10)'
  },
  {
    name: 'Together AI',
    url: 'https://api.together.xyz/settings/api-keys',
    steps: [
      'Go to api.together.xyz',
      'Create free account',
      'Access API Keys in settings',
      'Generate new API key',
      'Copy key immediately'
    ],
    freeLimit: '$1 free credits monthly'
  },
  {
    name: 'Replicate',
    url: 'https://replicate.com/account/api-tokens',
    steps: [
      'Visit replicate.com',
      'Create account',
      'Go to Account → API tokens',
      'Click "Create API token"',
      'Save and copy your token'
    ],
    freeLimit: '$10 free compute monthly'
  }
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function BrydenAI() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I can help you get free API keys from any of these providers. Which one are you interested in?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim().toLowerCase();
    setChatMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
    setInputMessage('');

    // Simple response logic
    let response = '';
    if (userMessage.includes('anthropic') || userMessage.includes('claude')) {
      response = 'For Anthropic: Go to console.anthropic.com → Sign up → Settings → API Keys → Create Key. Free: $5 credits!';
    } else if (userMessage.includes('openai') || userMessage.includes('gpt')) {
      response = 'For OpenAI: Visit platform.openai.com → API Keys → Create key. Free: $5 credits! Save key immediately.';
    } else if (userMessage.includes('google') || userMessage.includes('gemini')) {
      response = 'For Google Gemini: aistudio.google.com → Get API key → 60 requests/min free!';
    } else if (userMessage.includes('hugging')) {
      response = 'For Hugging Face: huggingface.co → Settings → Access Tokens → New token. 30K chars/month free!';
    } else if (userMessage.includes('mistral')) {
      response = 'For Mistral: console.mistral.ai → API Keys → Create key. €1 free credits!';
    } else if (userMessage.includes('cohere')) {
      response = 'For Cohere: dashboard.cohere.ai → Register → API Keys. 1,000 calls/month free!';
    } else if (userMessage.includes('together')) {
      response = 'For Together AI: api.together.xyz → Settings → API Keys. $1 free monthly!';
    } else if (userMessage.includes('replicate')) {
      response = 'For Replicate: replicate.com → Account → API tokens → Create. $10 free compute!';
    } else if (userMessage.includes('all') || userMessage.includes('list')) {
      response = '8 providers available: Anthropic ($5), OpenAI ($5), Google (free tier), Cohere (1K calls), Hugging Face (30K chars), Mistral (€1), Together ($1), Replicate ($10). Click the links above!';
    } else {
      response = 'I can help with: Anthropic, OpenAI, Google, Cohere, Hugging Face, Mistral, Together AI, or Replicate. Which one?';
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">BrydenAI - Free AI API Keys Guide</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-4">
          Click any link below to get your free API key - verified working July 2025
        </p>
        <button
          onClick={() => setShowChat(!showChat)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {showChat ? 'Hide' : 'Show'} Chat Assistant
        </button>
      </div>

      {showChat && (
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="h-64 overflow-y-auto mb-4 space-y-3">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-orange-600' : 'bg-gray-800'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about any provider..."
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
            />
            <button type="submit" className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {providers.map((provider, index) => (
          <div key={index} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <a
              href={provider.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xl font-semibold text-orange-400 hover:text-orange-500 mb-2"
            >
              {provider.name}
              <ExternalLink className="w-5 h-5" />
            </a>
            <div className="text-green-400 text-sm mb-4">{provider.freeLimit}</div>

            <ol className="space-y-2 mb-4">
              {provider.steps.map((step, stepIndex) => (
                <li key={stepIndex} className="flex items-start gap-3 text-gray-300 text-sm">
                  <span className="text-orange-500 font-medium">{stepIndex + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>

            <a
              href={provider.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              {provider.url} <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-900 border border-gray-800 rounded-2xl">
        <h3 className="text-lg font-semibold mb-4">Quick Tips</h3>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li>• All links verified working as of July 2025</li>
          <li>• No credit card required for free tiers</li>
          <li>• Save your API keys immediately - you won't see them again!</li>
          <li>• Store keys in environment variables, never commit to git</li>
        </ul>
      </div>
    </div>
  );
}