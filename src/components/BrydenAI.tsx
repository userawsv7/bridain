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

    // Only respond to free API key related queries for any purpose
    const apiKeyTerms = ['api', 'key', 'free', 'credit', 'token', 'sign', 'register', 'account', 'limit', 'price', 'cost', 'tier', 'quota', 'rate'];
    const isApiKeyQuery = apiKeyTerms.some(term => userMessage.includes(term));

    let response = '';
    if (!isApiKeyQuery) {
      response = 'I only help with free API keys. Ask me about getting free API keys for any purpose or service!';
    } else {
      // Generic free API key guidance for any service
      response = `For free API keys, check these approaches:\n• Look for "Free tier" or "Developer" plans on the service website\n• Check if they offer signup credits (usually $5-$25)\n• Search "[service name] free API key" for specific instructions\n• Look for open-source alternatives with self-hosted options\n• Check GitHub for community-provided free tier lists`;
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

      {/* Comprehensive API Directory */}
      <div className="mt-8 p-6 bg-gray-900 border border-gray-800 rounded-2xl">
        <h2 className="text-2xl font-bold mb-6">Comprehensive API Directory</h2>
        <p className="text-gray-400 mb-6">Extensive collection of free and freemium APIs across all categories</p>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🤖 AI & Machine Learning APIs
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {[
              ['Google AI Studio', 'https://aistudio.google.com'],
              ['OpenRouter', 'https://openrouter.ai'],
              ['GroqCloud', 'https://console.groq.com'],
              ['Hugging Face', 'https://huggingface.co'],
              ['Cerebras Cloud', 'https://cloud.cerebras.ai'],
              ['Together AI', 'https://www.together.ai'],
              ['Fireworks AI', 'https://fireworks.ai'],
              ['Mistral AI', 'https://console.mistral.ai'],
              ['Cohere', 'https://dashboard.cohere.com'],
              ['Cloudflare Workers AI', 'https://developers.cloudflare.com/workers-ai/']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">🌤️ Weather APIs</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['OpenWeatherMap', 'https://openweathermap.org/api'],
              ['WeatherAPI', 'https://www.weatherapi.com'],
              ['Tomorrow.io', 'https://www.tomorrow.io'],
              ['Open-Meteo', 'https://open-meteo.com']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">🗺️ Maps & Geolocation APIs</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['Mapbox', 'https://www.mapbox.com'],
              ['Geoapify', 'https://www.geoapify.com'],
              ['LocationIQ', 'https://locationiq.com'],
              ['Nominatim (OpenStreetMap)', 'https://nominatim.openstreetmap.org']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">💰 Finance APIs</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['Alpha Vantage', 'https://www.alphavantage.co'],
              ['Finnhub', 'https://finnhub.io'],
              ['Polygon.io', 'https://polygon.io'],
              ['Twelve Data', 'https://twelvedata.com']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">🪙 Cryptocurrency APIs</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['CoinGecko', 'https://www.coingecko.com/en/api'],
              ['CoinMarketCap', 'https://coinmarketcap.com/api'],
              ['CoinCap', 'https://coincap.io']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">📧 Email APIs</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['Resend', 'https://resend.com'],
              ['Mailgun', 'https://www.mailgun.com'],
              ['Brevo', 'https://www.brevo.com'],
              ['SendGrid', 'https://sendgrid.com']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">📱 SMS APIs</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['Twilio', 'https://www.twilio.com'],
              ['Vonage', 'https://developer.vonage.com'],
              ['MessageBird', 'https://www.messagebird.com']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">📰 News APIs</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['NewsAPI', 'https://newsapi.org'],
              ['GNews', 'https://gnews.io'],
              ['NYTimes', 'https://developer.nytimes.com'],
              ['The Guardian', 'https://open-platform.theguardian.com']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">📄 OCR & Document APIs</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['OCR.space', 'https://ocr.space'],
              ['Mindee', 'https://www.mindee.com'],
              ['Veryfi', 'https://www.veryfi.com']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">📋 PDF APIs</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['PDF.co', 'https://pdf.co'],
              ['PDFShift', 'https://pdfshift.io'],
              ['PDFMonkey', 'https://pdfmonkey.io']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">🌐 Translation APIs</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['DeepL', 'https://www.deepl.com/pro-api'],
              ['LibreTranslate', 'https://libretranslate.com'],
              ['MyMemory', 'https://mymemory.translated.net/doc/spec.php']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">🎨 Image Generation APIs</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['Pollinations', 'https://pollinations.ai'],
              ['Stability AI', 'https://stability.ai'],
              ['Replicate', 'https://replicate.com'],
              ['Hugging Face', 'https://huggingface.co']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">🎤 Speech & Audio APIs</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['ElevenLabs', 'https://elevenlabs.io'],
              ['Deepgram', 'https://deepgram.com'],
              ['AssemblyAI', 'https://assemblyai.com'],
              ['Speechmatics', 'https://speechmatics.com']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">🔍 Search APIs</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['Serper', 'https://serper.dev'],
              ['SerpApi', 'https://serpapi.com'],
              ['Brave Search', 'https://brave.com/search/api']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">🔧 Git & DevOps APIs</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['GitHub', 'https://github.com'],
              ['GitLab', 'https://gitlab.com'],
              ['CircleCI', 'https://circleci.com'],
              ['Jenkins', 'https://www.jenkins.io']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">☸️ Kubernetes & Orchestration</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['Kubernetes', 'https://kubernetes.io'],
              ['Helm', 'https://helm.sh'],
              ['Argo CD', 'https://argo-cd.readthedocs.io'],
              ['Flux CD', 'https://fluxcd.io']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">🎲 Public Data & Testing APIs (No Keys Required)</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['Random User Generator', 'https://randomuser.me'],
              ['REST Countries', 'https://restcountries.com'],
              ['Dog API', 'https://dog.ceo/dog-api'],
              ['Cat Facts', 'https://catfact.ninja'],
              ['PokéAPI', 'https://pokeapi.co'],
              ['JSONPlaceholder', 'https://jsonplaceholder.typicode.com'],
              ['DummyJSON', 'https://dummyjson.com'],
              ['FakerAPI', 'https://fakerapi.it']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">📚 API Directories & Marketplaces</h3>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {[
              ['APIsList', 'https://apislist.com'],
              ['PublicAPIs.dev', 'https://publicapis.dev'],
              ['PublicAPIs.io', 'https://publicapis.io'],
              ['RapidAPI', 'https://rapidapi.com'],
              ['API Layer', 'https://apilayer.com/marketplace'],
              ['FreePublicAPIs', 'https://freepublicapis.com'],
              ['FreeAPIs.io', 'https://freeapis.io']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-800 rounded-lg">
          <h4 className="font-semibold mb-2 text-green-400">API Key Types Explained:</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>✅ <strong>Permanent free API key</strong> - Ongoing free quota (Groq, Google AI Studio, OpenRouter, Hugging Face, OpenWeatherMap, CoinGecko)</li>
            <li>🎁 <strong>Free trial credits</strong> - Credits that expire (Together AI, Fireworks AI, Mistral AI, Stability AI, Twilio)</li>
            <li>🆓 <strong>No API key required</strong> - Fair-use limits (Open-Meteo, REST Countries, Dog API, PokeAPI, JSONPlaceholder)</li>
            <li>💰 <strong>Paid only</strong> - Limited free tier (Some Mapbox, Polygon.io, SendGrid features)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}