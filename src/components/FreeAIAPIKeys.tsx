'use client';

import React, { useState } from 'react';
import {
  Key, ExternalLink, Check, AlertCircle, Zap, Brain, Code,
  MessageCircle, Globe, Bot, Trophy, Star, ArrowRight, Award,
  Clock, Users, TrendingUp, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface AIProvider {
  id: string;
  name: string;
  description: string;
  specialties: string[];
  useCase: string;
  freeLimit: string;
  apiKeyUrl: string;
  docsUrl: string;
  color: string;
  icon: React.ReactNode;
  models: string[];
  features: string[];
  rating: number;
  users: string;
}

const aiProviders: AIProvider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Most capable AI for reasoning, coding, and analysis',
    specialties: ['Complex reasoning', 'Code generation', 'Document analysis', 'Math & science'],
    useCase: 'Best for production code, technical documentation, and complex problem solving',
    freeLimit: '~$5 free credits on signup',
    apiKeyUrl: 'https://console.anthropic.com/',
    docsUrl: 'https://docs.anthropic.com/',
    color: 'bg-purple-500',
    icon: <Brain className="w-5 h-5" />,
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    features: ['200K context window', 'Function calling', 'JSON mode', 'Vision capabilities'],
    rating: 4.9,
    users: '50K+'
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    description: 'Industry standard for chat, coding, and creative tasks',
    specialties: ['Conversational AI', 'Code completion', 'Content generation', 'Image analysis'],
    useCase: 'Ideal for chatbots, content creation, and API integrations',
    freeLimit: '$5 free credits on signup',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    docsUrl: 'https://platform.openai.com/docs',
    color: 'bg-green-500',
    icon: <Bot className="w-5 h-5" />,
    models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'dall-e-3'],
    features: ['Function calling', 'Assistants API', 'Fine-tuning', 'Vision & audio'],
    rating: 4.8,
    users: '100K+'
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Multimodal AI with strong search and reasoning',
    specialties: ['Multimodal analysis', 'Google integration', 'Real-time data', 'Translation'],
    useCase: 'Perfect for Google Workspace integration and multimodal tasks',
    freeLimit: '60 requests/min free tier',
    apiKeyUrl: 'https://makersuite.google.com/app/apikey',
    docsUrl: 'https://ai.google.dev/docs',
    color: 'bg-blue-500',
    icon: <Globe className="w-5 h-5" />,
    models: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'],
    features: ['1M+ context window', 'Multimodal input', 'Safety settings', 'Embedding models'],
    rating: 4.7,
    users: '75K+'
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Enterprise-focused AI for search and generation',
    specialties: ['Enterprise search', 'RAG applications', 'Multilingual', 'Classification'],
    useCase: 'Best for enterprise search, RAG systems, and classification tasks',
    freeLimit: '1M tokens/month free',
    apiKeyUrl: 'https://dashboard.cohere.ai/welcome/register',
    docsUrl: 'https://docs.cohere.com/',
    color: 'bg-orange-500',
    icon: <MessageCircle className="w-5 h-5" />,
    models: ['command', 'command-light', 'embed-english'],
    features: ['RAG optimized', '50+ languages', 'Semantic search', 'Fine-tuning'],
    rating: 4.6,
    users: '25K+'
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Open-source model hub with thousands of models',
    specialties: ['Open source models', 'ML pipelines', 'Model fine-tuning', 'Transformers'],
    useCase: 'Ideal for ML practitioners, fine-tuning, and open-source models',
    freeLimit: 'Unlimited inference API (rate limited)',
    apiKeyUrl: 'https://huggingface.co/settings/tokens',
    docsUrl: 'https://huggingface.co/docs',
    color: 'bg-yellow-500',
    icon: <Code className="w-5 h-5" />,
    models: ['Llama-2', 'Mistral', 'Stable Diffusion', 'Whisper'],
    features: ['50K+ models', 'Inference API', 'Model cards', 'Spaces hosting'],
    rating: 4.5,
    users: '200K+'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Efficient European AI models optimized for developers',
    specialties: ['Code generation', 'Efficient inference', 'Multilingual', 'Open weights'],
    useCase: 'Great for cost-effective inference and multilingual applications',
    freeLimit: '€1 free credits on signup',
    apiKeyUrl: 'https://console.mistral.ai/',
    docsUrl: 'https://docs.mistral.ai/',
    color: 'bg-red-500',
    icon: <Zap className="w-5 h-5" />,
    models: ['mistral-large', 'mistral-medium', 'mistral-small', 'codestral'],
    features: ['Function calling', 'JSON mode', 'Long context', 'Code completion'],
    rating: 4.4,
    users: '30K+'
  },
  {
    id: 'together',
    name: 'Together AI',
    description: 'Fast inference platform for open-source models',
    specialties: ['Fast inference', 'Open source LLMs', 'Fine-tuning', 'Cost effective'],
    useCase: 'Perfect for running open-source models at scale with low latency',
    freeLimit: '$1 free credits monthly',
    apiKeyUrl: 'https://api.together.xyz/settings/api-keys',
    docsUrl: 'https://docs.together.ai/',
    color: 'bg-indigo-500',
    icon: <Star className="w-5 h-5" />,
    models: ['Llama-3', 'Mixtral', 'Qwen', 'Gemma'],
    features: ['<100ms latency', 'Fine-tuning API', 'Dedicated endpoints', 'Streaming'],
    rating: 4.3,
    users: '15K+'
  },
  {
    id: 'replicate',
    name: 'Replicate',
    description: 'Run open-source models via simple API calls',
    specialties: ['Image generation', 'Audio models', 'Video generation', 'Model hosting'],
    useCase: 'Best for running specialized models without infrastructure',
    freeLimit: '$10 free compute monthly',
    apiKeyUrl: 'https://replicate.com/account/api-tokens',
    docsUrl: 'https://replicate.com/docs',
    color: 'bg-teal-500',
    icon: <Award className="w-5 h-5" />,
    models: ['Stable Diffusion', 'Whisper', 'Llama', 'ControlNet'],
    features: ['1,000+ models', 'Versioned models', 'Webhooks', 'Batch processing'],
    rating: 4.5,
    users: '40K+'
  }
];

export function FreeAIAPIKeys() {
  const [copiedKey, setCopiedKey] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'guide' | 'specialties'>('overview');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const openApiKeyPage = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Key className="w-8 h-8 text-orange-500" />
          <h1 className="text-4xl font-bold text-white">Free AI API Keys</h1>
        </div>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Get started with 8+ AI providers offering free tiers. No credit card required for most.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-500">8+</div>
          <div className="text-sm text-gray-500">AI Providers</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-500">$50+</div>
          <div className="text-sm text-gray-500">Free Credits</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-500">100K+</div>
          <div className="text-sm text-gray-500">Free Requests/mo</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-500">500+</div>
          <div className="text-sm text-gray-500">AI Models</div>
        </div>
      </div>

      {/* Provider Grid - Elite Card Design */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {aiProviders.map((provider) => (
          <button
            key={provider.id}
            onClick={() => setSelectedProvider(provider)}
            className="group relative bg-gray-900/50 backdrop-blur border border-gray-800/50 hover:border-gray-700 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/5"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative">
              {/* Header with icon and badge */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl text-white ${provider.color} shadow-lg`}>
                  {provider.icon}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-gray-400">{provider.rating}</span>
                  </div>
                  <div className="px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                    <span className="text-xs text-green-500 font-medium">Free</span>
                  </div>
                </div>
              </div>

              {/* Title and description */}
              <h3 className="text-lg font-semibold text-white mb-1 pr-8 group-hover:text-orange-500 transition-colors">
                {provider.name}
              </h3>
              <p className="text-sm text-gray-400 mb-4 pr-4 line-clamp-2">
                {provider.description}
              </p>

              {/* Stats row */}
              <div className="flex items-center justify-between text-xs mb-4">
                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="w-3.5 h-3.5" />
                  <span>{provider.users}</span>
                </div>
                <span className="text-orange-400/80 font-medium">{provider.freeLimit.split(' ')[0]}</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                <span className="text-xs text-gray-500 line-clamp-1 pr-2">{provider.freeLimit}</span>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800/50 group-hover:bg-orange-500/10 transition-colors">
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Provider Details */}
      {selectedProvider && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-8">
          {/* Provider Header */}
          <div className="bg-gray-950 border-b border-gray-800 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl text-white ${selectedProvider.color}`}>
                  {selectedProvider.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedProvider.name}</h2>
                  <p className="text-gray-400">{selectedProvider.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1">
              {(['overview', 'guide', 'specialties'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Use Case */}
                <div>
                  <h4 className="text-sm font-medium text-orange-500 mb-2">PERFECT FOR</h4>
                  <p className="text-gray-300">{selectedProvider.useCase}</p>
                </div>

                {/* Models */}
                <div>
                  <h4 className="text-sm font-medium text-orange-500 mb-3">AVAILABLE MODELS</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.models.map((model) => (
                      <span key={model} className="px-3 py-1 bg-gray-950 rounded-full text-sm text-gray-300 border border-gray-800">
                        {model}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="text-sm font-medium text-orange-500 mb-3">KEY FEATURES</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProvider.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Free Tier Info */}
                <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium text-sm">Free Tier Details</span>
                  </div>
                  <p className="text-gray-400 text-sm">{selectedProvider.freeLimit}</p>
                </div>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">How to Get Your Free API Key</h4>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">1</div>
                      <div>
                        <p className="font-medium">Sign up for {selectedProvider.name}</p>
                        <p className="text-sm text-gray-400">Create an account using your email or GitHub</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">2</div>
                      <div>
                        <p className="font-medium">Navigate to API Keys section</p>
                        <p className="text-sm text-gray-400">Usually under Settings → API Keys or Account</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">3</div>
                      <div>
                        <p className="font-medium">Generate new API key</p>
                        <p className="text-sm text-gray-400">Click "Create Key" or "Generate Token"</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">4</div>
                      <div>
                        <p className="font-medium">Copy and save your key</p>
                        <p className="text-sm text-gray-400">Store it securely - you won't see it again!</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => openApiKeyPage(selectedProvider.apiKeyUrl)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl font-medium transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    Get API Key
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openApiKeyPage(selectedProvider.docsUrl)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-700 hover:border-gray-600 rounded-xl font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Documentation
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'specialties' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">What Makes {selectedProvider.name} Special</h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedProvider.specialties.map((specialty, index) => (
                      <div key={index} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <Trophy className="w-5 h-5 text-orange-500 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-white">{specialty}</h5>
                            <p className="text-sm text-gray-400 mt-1">
                              {specialty === 'Complex reasoning' && 'State-of-the-art performance on complex logical tasks'}
                              {specialty === 'Code generation' && 'Industry-leading code completion and refactoring'}
                              {specialty === 'Document analysis' && 'Process and analyze large documents with context'}
                              {specialty === 'Multimodal analysis' && 'Process text, images, audio, and video together'}
                              {specialty === 'Enterprise search' && 'Optimized for RAG and enterprise knowledge bases'}
                              {specialty === 'Open source models' && 'Access to thousands of community models'}
                              {specialty === 'Fast inference' && 'Optimized inference with low latency'}
                              {specialty === 'Image generation' && 'Run state-of-the-art image models'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                  <h5 className="font-medium text-orange-500 mb-2">💡 Pro Tips</h5>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Always set rate limits to avoid unexpected charges</li>
                    <li>• Use environment variables to store API keys securely</li>
                    <li>• Monitor usage in the provider dashboard regularly</li>
                    <li>• Consider multiple providers for redundancy</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Claude Code Special Section */}
      <div className="bg-gradient-to-r from-purple-900/20 to-orange-900/20 border border-purple-500/20 rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-500 rounded-xl">
            <Code className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Claude Code (This CLI)</h3>
            <p className="text-purple-400">Built with Anthropic's Claude</p>
          </div>
        </div>

        <p className="text-gray-300 mb-6">
          You're currently using Claude Code - Anthropic's official CLI tool for software engineering.
          It brings the power of Claude directly to your terminal for coding, debugging, and more.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-950/50 rounded-xl p-4">
            <h5 className="font-medium mb-2">🎯 Best For</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Code generation & refactoring</li>
              <li>• Debugging & fixes</li>
              <li>• Git operations</li>
              <li>• Documentation</li>
            </ul>
          </div>
          <div className="bg-gray-950/50 rounded-xl p-4">
            <h5 className="font-medium mb-2">💪 Strengths</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Large context window (200K)</li>
              <li>• Excellent code understanding</li>
              <li>• File system operations</li>
              <li>• Multi-step planning</li>
            </ul>
          </div>
          <div className="bg-gray-950/50 rounded-xl p-4">
            <h5 className="font-medium mb-2">🚀 Get Access</h5>
            <button
              onClick={() => window.open('https://console.anthropic.com/', '_blank')}
              className="text-sm px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
            >
              Get Claude API Key <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Tips */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          💡 Tip: Store API keys in environment variables, never commit them to git
        </p>
        <p className="text-xs text-gray-600 mt-2">
          All providers offer free tiers • No credit card required to start
        </p>
      </div>
    </div>
  );
}