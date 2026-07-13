'use client';

import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';

interface Provider {
  name: string;
  url: string;
  steps: string[];
}

const providers: Provider[] = [
  {
    name: 'Anthropic Claude',
    url: 'https://console.anthropic.com/',
    steps: [
      'Go to console.anthropic.com',
      'Sign up with email or GitHub',
      'Navigate to API Keys section',
      'Click "Create Key"',
      'Copy and save your key'
    ]
  },
  {
    name: 'OpenAI GPT',
    url: 'https://platform.openai.com/api-keys',
    steps: [
      'Visit platform.openai.com',
      'Create account or login',
      'Go to API Keys page',
      'Click "Create new secret key"',
      'Copy your API key immediately'
    ]
  },
  {
    name: 'Google Gemini',
    url: 'https://makersuite.google.com/app/apikey',
    steps: [
      'Visit makersuite.google.com',
      'Sign in with Google account',
      'Click "Get API key"',
      'Create API key in existing project',
      'Copy the generated key'
    ]
  },
  {
    name: 'Cohere',
    url: 'https://dashboard.cohere.ai/welcome/register',
    steps: [
      'Go to dashboard.cohere.ai',
      'Register with email',
      'Verify your email',
      'Navigate to API Keys',
      'Generate new API key'
    ]
  },
  {
    name: 'Hugging Face',
    url: 'https://huggingface.co/settings/tokens',
    steps: [
      'Visit huggingface.co',
      'Create free account',
      'Go to Settings → Tokens',
      'Click "New token"',
      'Generate and copy token'
    ]
  },
  {
    name: 'Mistral AI',
    url: 'https://console.mistral.ai/',
    steps: [
      'Access console.mistral.ai',
      'Sign up for account',
      'Navigate to API Keys',
      'Create new API key',
      'Store key securely'
    ]
  },
  {
    name: 'Together AI',
    url: 'https://api.together.xyz/settings/api-keys',
    steps: [
      'Go to api.together.xyz',
      'Sign up for free account',
      'Access API Keys settings',
      'Generate API key',
      'Copy for immediate use'
    ]
  },
  {
    name: 'Replicate',
    url: 'https://replicate.com/account/api-tokens',
    steps: [
      'Visit replicate.com',
      'Create account',
      'Go to Account → API tokens',
      'Click "Create API token"',
      'Save your token'
    ]
  }
];

export function BrydenAI() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">BrydenAI - Free AI API Keys</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Click any link below to get your free API key - just follow the steps
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {providers.map((provider, index) => (
          <div key={index} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <a
              href={provider.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xl font-semibold text-orange-400 hover:text-orange-500 mb-4"
            >
              {provider.name}
              <ExternalLink className="w-5 h-5" />
            </a>

            <ol className="space-y-2 mb-4">
              {provider.steps.map((step, stepIndex) => (
                <li key={stepIndex} className="flex items-start gap-3 text-gray-300">
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
    </div>
  );
}