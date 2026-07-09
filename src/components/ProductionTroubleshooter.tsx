'use client';

import React, { useState, useRef } from 'react';
import {
  Send, Volume2, VolumeX, Loader2, Mic, MicOff, Copy, Upload,
  AlertTriangle, Shield, BookOpen, Clock, ChevronRight, Target
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  category?: string;
}

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  symptoms: string[];
}

const categories: Category[] = [
  {
    id: 'performance',
    label: 'Performance',
    icon: <Target className="w-4 h-4" />,
    description: 'Latency, throughput, resource issues',
    symptoms: ['High CPU/Memory', 'Slow responses', 'Timeouts', 'High latency']
  },
  {
    id: 'availability',
    label: 'Availability',
    icon: <AlertTriangle className="w-4 h-4" />,
    description: 'Outages, crashes, service downtime',
    symptoms: ['Service down', 'Connection refused', 'Health check failures', 'Pod restarts']
  },
  {
    id: 'data',
    label: 'Data Issues',
    icon: <Shield className="w-4 h-4" />,
    description: 'Corruption, inconsistency, data loss',
    symptoms: ['Missing data', 'Inconsistent state', 'Backup failures', 'Replication issues']
  },
  {
    id: 'deployment',
    label: 'Deployment',
    icon: <Clock className="w-4 h-4" />,
    description: 'Failed releases, rollback problems',
    symptoms: ['Deploy failures', 'Config issues', 'Version conflicts', 'Rollback needed']
  }
];

const probeTemplate = (category: Category): string => `## ${category.label} Issue - Diagnostic Framework

### Step 1: Initial Triage
**Timeline**: When did symptoms start? Any deployments/changes?
**Scope**: Users affected? Revenue impact? SLA risk?

### Step 2: Evidence Collection
Please provide:
- Error messages/logs
- Relevant metrics (CPU, memory, requests)
- Recent changes made
- Affected services/endpoints

### Step 3: Analysis Framework
I'll provide:
1. **Root Cause Analysis** - Systematic problem identification
2. **Impact Assessment** - Business and technical consequences
3. **Risk Evaluation** - Security, compliance, stability risks
4. **Step-by-Step Fix** - Copy-paste ready commands
5. **Prevention Strategy** - How to avoid recurrence
6. **Learning Resources** - Concepts to understand

Paste logs, error output, or describe the issue in detail. Large uploads supported.`;`;

const rcaTemplate = (issue: string): string => `## Root Cause Analysis

### Problem Statement
${issue || '[Describe the observed behavior]'}

### 5 Whys Analysis
1. Symptom: [What you're seeing]
2. Direct Cause: [Immediate technical reason]
3. Contributing Factor: [Why that happened]
4. Process Gap: [Missing control/check]
5. Systemic Issue: [Why the gap exists]

### Evidence Trail
- Logs: [Key entries showing the failure point]
- Metrics: [Anomalies before/during incident]
- Timeline: [Sequence of events]

### Impact Assessment
**Business**: [Users affected, revenue, SLA breach]
**Technical**: [Blast radius, dependencies, data integrity]
**Risk**: [Security exposure, compliance, future stability]

### Immediate Actions
\`\`\`bash
# [Copy-paste ready diagnostic commands]
kubectl get pods -l app=[service]
kubectl logs [pod-name] --previous
curl -v [endpoint]/health
\`\`\`

### Fix & Verification
1. [Step 1 with expected outcome]
2. [Step 2 with verification method]
3. [Step 3 with success criteria]

### Prevention Checklist
- [ ] Add monitoring for: [specific metric]
- [ ] Implement circuit breaker for: [dependency]
- [ ] Update runbook with: [scenario]
- [ ] Schedule review for: [process improvement]

### Learning Module
**Key Concept**: [Technical concept to understand]
**Related Patterns**: [Similar issues to watch]
**Best Practices**: [Industry standards to follow]`;

export function ProductionTroubleshooter() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 0,
    text: "Production Issue Resolution System\n\nI help diagnose and resolve issues systematically with:\n\n• Structured probing for complete context\n• Root cause analysis with evidence\n• Impact and risk assessment\n• Copy-paste ready fixes\n• Prevention strategies\n• Concept explanations\n\nSelect a category or describe your issue:",
    isUser: false
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [useFemaleVoice, setUseFemaleVoice] = useState(true);

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const speak = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      text.replace(/#{1,6}\s*/g, '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`/g, '').trim()
    );

    utterance.rate = 0.95;
    utterance.pitch = useFemaleVoice ? 1.15 : 0.9;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const toggleMute = () => {
    if (isSpeaking) window.speechSynthesis.cancel();
    setIsMuted(!isMuted);
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + ' ';
        }
      }
      if (transcript) setInput(prev => prev + ' ' + transcript.trim());
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Recognition error');
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    toast.success('Listening...');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInput(prev => prev + '\n\n```' + file.name + '\n' + content + '\n```');
      toast.success(`Uploaded: ${file.name}`);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  const processInput = async (text: string) => {
    const userMsg: Message = { id: Date.now(), text, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    let response: Message;
    const lowerText = text.toLowerCase();

    if (lowerText.includes('rca') || lowerText.includes('root cause')) {
      response = { id: Date.now() + 1, text: rcaTemplate(text), isUser: false, category: 'rca' };
    } else if (selectedCategory) {
      response = {
        id: Date.now() + 1,
        text: `${rcaTemplate(text)}\n\n### Quick Commands\n\`\`\`bash\n# Check status\nkubectl get pods -l app=[${selectedCategory.id}]\n\n# View logs\nkubectl logs -f [pod-name]\n\n# Describe resource\nkubectl describe [resource] [name]\n\`\`\``,
        isUser: false,
        category: 'solution'
      };
    } else {
      response = {
        id: Date.now() + 1,
        text: "Please select a category above or describe the specific symptoms you're seeing. I'll help with probing questions and systematic diagnosis.",
        isUser: false
      };
    }

    setMessages(prev => [...prev, response]);
    if (!isMuted) speak(response.text);
    setIsLoading(false);
  };

  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    const msg: Message = {
      id: Date.now(),
      text: probeTemplate(category),
      isUser: false,
      category: category.id
    };
    setMessages(prev => [...prev, msg]);
    if (!isMuted) speak(msg.text);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <span className="text-sm text-orange-400">Production Issue Resolution</span>
        </div>
        <h1 className="text-3xl font-semibold text-white mb-2">Systematic Troubleshooting</h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Diagnose production issues with structured analysis, copy-paste fixes, and prevention strategies
        </p>
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="text-sm text-gray-400">Select Issue Category</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => selectCategory(category)}
              className={`group p-4 rounded-xl border transition-all text-left ${
                selectedCategory?.id === category.id
                  ? 'bg-orange-500/10 border-orange-500/50'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-orange-400">
                  {category.icon}
                </div>
                <span className="font-medium text-white">{category.label}</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{category.description}</p>
              <div className="flex flex-wrap gap-1">
                {category.symptoms.slice(0, 2).map((symptom, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-500">
                    {symptom}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                message.isUser
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}>
                <div className="flex justify-between gap-3">
                  <div className="prose prose-invert prose-sm flex-1">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{message.text}</pre>
                  </div>
                  {!message.isUser && (
                    <button
                      onClick={() => copyText(message.text)}
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors opacity-50 hover:opacity-100"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl px-5 py-4">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4 bg-gray-950">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              title="Upload logs or configs"
            >
              <Upload className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={toggleVoice}
              className={`p-2.5 rounded-lg transition-colors ${
                isListening ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-gray-400" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-gray-400" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && input.trim() && processInput(input)}
              placeholder="Describe the issue or paste error logs..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              disabled={isLoading}
            />

            <button
              onClick={() => input.trim() && processInput(input)}
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useFemaleVoice}
                  onChange={(e) => setUseFemaleVoice(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700"
                />
                <span className="text-xs text-gray-400">Female voice</span>
              </label>
              <span className="text-xs text-gray-600">•</span>
              <span className="text-xs text-gray-400">Unlimited uploads • Real-time transcription</span>
            </div>
            <span className="text-xs text-gray-500">Supports RCA, impact analysis, prevention strategies</span>
          </div>
        </div>
      </div>
    </div>
  );
}