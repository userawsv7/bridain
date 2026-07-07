'use client';

import React, { useState } from 'react';
import { Send, Loader2, Award, Target, Book, Mic, MicOff, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  type?: 'chat' | 'mcq';
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
}

interface Skill {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

const skills: Skill[] = [
  { id: 'docker', name: 'Docker', emoji: '🐳', description: 'Container troubleshooting & best practices' },
  { id: 'kubernetes', name: 'Kubernetes', emoji: '☸️', description: 'K8s debugging & production scenarios' },
  { id: 'cicd', name: 'CI/CD', emoji: '🔄', description: 'Pipeline failures & automation' },
  { id: 'python', name: 'Python', emoji: '🐍', description: 'Common pitfalls & best practices' },
  { id: 'aws', name: 'AWS', emoji: '☁️', description: 'Cloud architecture & services' },
  { id: 'terraform', name: 'Terraform', emoji: '🏗️', description: 'IaC issues & solutions' },
  { id: 'react', name: 'React', emoji: '⚛️', description: 'Component patterns & state' },
  { id: 'mlops', name: 'MLOps', emoji: '🤖', description: 'ML lifecycle management' },
];

export function BridainChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "🚀 Welcome to Bridain! Your AI Learning Assistant\n\nI provide:\n• Concept explanations with real examples\n• Troubleshooting commands & fixes\n• Certification exam prep\n• Best practices from production\n• Day-to-day debugging scenarios\n\nSelect a skill below or type any question!",
      isUser: false,
      type: 'chat'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [mode, setMode] = useState<'learn' | 'mcq'>('learn');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const speak = (text: string) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Working MCQ generator with predefined scenarios
  const generateMCQ = (skillName: string) => {
    const scenarios: { [key: string]: any[] } = {
      'Docker': [
        {
          q: "Container exits immediately after start with exit code 1. What's the FIRST command to debug?",
          options: ["docker restart container", "docker logs container", "docker rm container", "docker stop container"],
          correct: 1,
          exp: "Always check logs first to see the actual error causing the exit"
        },
        {
          q: "Port already in use error when running docker-compose. How to find what's using port 8080?",
          options: ["docker ps", "lsof -i :8080", "netstat", "ps aux"],
          correct: 1,
          exp: "lsof or netstat shows the actual process binding to the port"
        }
      ],
      'Kubernetes': [
        {
          q: "Pod stuck in CrashLoopBackOff. What's the FIRST troubleshooting command?",
          options: ["kubectl delete pod", "kubectl describe pod", "kubectl scale deployment", "kubectl get events"],
          correct: 1,
          exp: "describe shows Events with the actual failure reason"
        },
        {
          q: "ImagePullBackOff error - image exists but can't pull. Most likely cause?",
          options: ["Wrong image tag", "Missing imagePullSecrets", "Network issue", "Node capacity"],
          correct: 1,
          exp: "Private registries require imagePullSecrets for authentication"
        }
      ],
      'CI/CD': [
        {
          q: "Tests pass locally but fail in GitHub Actions. What's the MOST common cause?",
          options: ["Different Node version", "Missing secrets", "Timeout", "Memory limits"],
          correct: 0,
          exp: "Check .nvmrc and ensure CI uses the same Node version as local"
        }
      ]
    };

    const skillScenarios = scenarios[skillName] || scenarios['Docker'];
    const scenario = skillScenarios[Math.floor(Math.random() * skillScenarios.length)];

    return {
      text: scenario.q,
      options: scenario.options,
      correctAnswer: scenario.correct + 1,
      explanation: scenario.exp
    };
  };

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
    const welcomeMsg: Message = {
      id: Date.now(),
      text: `Let's master ${skill.name} ${skill.emoji}!\n\nI'll help you with:\n• Real production troubleshooting\n• Certification exam questions\n• Day-to-day debugging scenarios\n• Best practices & gotchas`,
      isUser: false,
      type: 'chat'
    };
    setMessages(prev => [...prev, welcomeMsg]);

    if (mode === 'mcq') {
      setTimeout(() => {
        const mcq = generateMCQ(skill.name);
        const mcqMsg: Message = {
          id: Date.now() + 1,
          text: mcq.text,
          isUser: false,
          type: 'mcq',
          options: mcq.options,
          correctAnswer: mcq.correctAnswer,
          explanation: mcq.explanation
        };
        setMessages(prev => [...prev, mcqMsg]);
      }, 500);
    }
  };

  const handleAnswer = (optionIndex: number, messageIndex: number) => {
    const message = messages[messageIndex];
    if (!message.correctAnswer) return;

    const isCorrect = optionIndex === message.correctAnswer - 1;
    setAnswered(prev => prev + 1);

    const resultMsg: Message = {
      id: Date.now(),
      text: `${isCorrect ? '✅ CORRECT!' : '❌ INCORRECT'}\n\nAnswer: ${String.fromCharCode(64 + message.correctAnswer)}\n\n${message.explanation}\n\n${isCorrect ? '🎯 You handled this like a production incident!' : '⚠️ This causes real outages - memorize the fix!'}`,
      isUser: false,
      type: 'chat'
    };
    setMessages(prev => [...prev, resultMsg]);

    if (isCorrect) {
      setScore(prev => prev + 10);
      toast.success('+10 XP! Production-ready! 🎉');
    } else {
      toast.error('Learn from this scenario - common production issue');
    }

    // Next question
    if (selectedSkill) {
      setTimeout(() => {
        const mcq = generateMCQ(selectedSkill.name);
        const nextMsg: Message = {
          id: Date.now() + 1,
          text: mcq.text,
          isUser: false,
          type: 'mcq',
          options: mcq.options,
          correctAnswer: mcq.correctAnswer,
          explanation: mcq.explanation
        };
        setMessages(prev => [...prev, nextMsg]);
      }, 1500);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      text: input,
      isUser: true,
      type: 'chat'
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Use API if available, otherwise provide smart responses
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: `Expert help for ${selectedSkill?.name || 'tech'}. Provide: exact commands, step-by-step fixes, common pitfalls, production scenarios`
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: Message = {
          id: Date.now() + 1,
          text: data.response,
          isUser: false,
          type: 'chat'
        };
        setMessages(prev => [...prev, aiMsg]);
        if (voiceEnabled) speak(data.response);
      } else {
        throw new Error('API failed');
      }
    } catch {
      // Fallback smart responses
      const smartResponse = getSmartResponse(input, selectedSkill?.name);
      const fallbackMsg: Message = {
        id: Date.now() + 1,
        text: smartResponse,
        isUser: false,
        type: 'chat'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    }

    setIsLoading(false);
  };

  const getSmartResponse = (query: string, skill?: string): string => {
    const q = query.toLowerCase();

    if (q.includes('error') || q.includes('fail') || q.includes('stuck')) {
      return `🚨 Production Debugging Steps:\n\n1. CHECK STATUS: kubectl get pods / docker ps\n2. VIEW LOGS: kubectl logs -f pod / docker logs container\n3. DESCRIBE: kubectl describe pod / docker inspect container\n4. EVENTS: kubectl get events --sort-by=.lastTimestamp\n\nCommon fixes:\n• ImagePullBackOff → Check imagePullSecrets\n• CrashLoopBackOff → Fix app startup code\n• Pending → Check resource limits`;
    }

    if (q.includes('how') || q.includes('command')) {
      return `📋 Essential Commands for ${skill || 'troubleshooting'}:\n\nDebugging:\n• Check status & logs first\n• Use describe to see events\n• Verify network connections\n• Check resource usage\n\nPrevention:\n• Always use health checks\n• Set resource limits\n• Implement proper logging\n• Use readiness/liveness probes`;
    }

    return `💡 Key Concept: ${query}\n\nBreak this into:\n1. What's the actual problem?\n2. What commands diagnose it?\n3. What's the likely root cause?\n4. How do you fix it quickly?\n5. How to prevent recurrence?\n\nType your specific scenario for targeted help!`;
  };

  const toggleListening = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      toast.error("Speech recognition not supported");
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRec();

      recognition.onresult = (e: any) => {
        setInput(e.results[0][0].transcript);
        setIsListening(false);
      };
      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Could not hear you");
      };
      recognition.start();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="glass rounded-3xl p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Bridain AI Assistant</h3>
              <p className="text-white/60">Concept learning • Troubleshooting • MCQ practice • Production scenarios</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-accent font-bold">{score}</span> XP
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              {answered} solved
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button onClick={() => setMode('learn')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 ${mode === 'learn' ? 'bg-primary/20 border border-primary' : 'bg-white/5 border border-white/10'}`}>
            <Book className="w-4 h-4" /> Learn & Troubleshoot
          </button>
          <button onClick={() => setMode('mcq')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 ${mode === 'mcq' ? 'bg-primary/20 border border-primary' : 'bg-white/5 border border-white/10'}`}>
            <Award className="w-4 h-4" /> MCQ Practice
          </button>
          <button onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 ${voiceEnabled ? 'bg-green-500/20 border border-green-500' : 'bg-white/5 border border-white/10'}`}>
            <Volume2 className="w-4 h-4" /> Voice {voiceEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Skills */}
        {!selectedSkill && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {skills.map(skill => (
              <button key={skill.id} onClick={() => handleSkillSelect(skill)}
                className="glass p-4 rounded-2xl hover:bg-white/10 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{skill.emoji}</span>
                  <span className="font-semibold">{skill.name}</span>
                </div>
                <p className="text-sm text-white/60">{skill.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="bg-white/5 rounded-2xl p-6 h-[500px] overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${msg.isUser ? 'bg-primary/20 border border-primary/30' : 'bg-white/10 border border-white/20'}`}>
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  {msg.type === 'mcq' && msg.options && (
                    <div className="space-y-2 mt-4">
                      {msg.options.map((opt, i) => (
                        <button key={i} onClick={() => handleAnswer(i, idx)}
                          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-left">
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && <div className="flex justify-start"><div className="p-4 rounded-2xl bg-white/10"><Loader2 className="w-5 h-5 animate-spin" /></div></div>}
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <div className="flex-1">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder={selectedSkill ? `Ask about ${selectedSkill.name} or describe your issue...` : "Select a skill or ask any question..."}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white placeholder:text-white/40" />
          </div>
          <button onClick={toggleListening}
            className={`p-3 rounded-xl ${isListening ? 'bg-red-500/20 border border-red-500' : 'bg-white/5 border border-white/10'}`}>
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button onClick={handleSend} disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        <div className="text-xs text-center text-white/40">
          💡 Works offline with smart responses • Connect API keys for LLM-powered answers
        </div>
      </div>
    </div>
  );
}