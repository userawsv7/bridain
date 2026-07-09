'use client';

import React, { useState, useRef } from 'react';
import { Send, Volume2, VolumeX, Loader2, Mic, MicOff, Award, Target, Book } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  type?: 'mcq' | 'chat' | 'tip';
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
  { id: 'docker', name: 'Docker', emoji: '🐳', description: 'Container orchestration & debugging' },
  { id: 'kubernetes', name: 'Kubernetes', emoji: '☸️', description: 'K8s troubleshooting & best practices' },
  { id: 'cicd', name: 'CI/CD', emoji: '🔄', description: 'Pipeline automation & deployment' },
  { id: 'python', name: 'Python', emoji: '🐍', description: 'Best practices & common pitfalls' },
  { id: 'aws', name: 'AWS', emoji: '☁️', description: 'Cloud architecture & services' },
  { id: 'terraform', name: 'Terraform', emoji: '🏗️', description: 'IaC & infrastructure management' },
  { id: 'react', name: 'React', emoji: '⚛️', description: 'Component patterns & state management' },
  { id: 'mlops', name: 'MLOps', emoji: '🤖', description: 'ML lifecycle & model deployment' },
];

export function ChatCoach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Hi! I'm your AI Learning Coach 🤖\n\nI can help you with:\n• MCQ practice for interviews & certifications\n• Troubleshooting & debugging scenarios\n• Best practices & production tips\n• Monitoring, logging & observability\n• Safety, security & automation\n\nSelect a skill below or ask me anything!",
      isUser: false,
      type: 'chat'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [mode, setMode] = useState<'mcq' | 'chat'>('mcq');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoiceFlavor, setSelectedVoiceFlavor] = useState('Aphrodite');
  const [speechRate, setSpeechRate] = useState(0.9);
  const [isListening, setIsListening] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const voiceFlavors = {
    Aphrodite: { name: 'Aphrodite', pitch: 1.15, description: 'Warm, enchanting Greek goddess' },
    Amba: { name: 'Amba', pitch: 1.1, description: 'Gentle, melodic Indian goddess' },
    Venus: { name: 'Venus', pitch: 1.2, description: 'Elegant, romantic Roman goddess' },
    Ishtar: { name: 'Ishtar', pitch: 1.05, description: 'Strong, confident Babylonian goddess' },
    Freyja: { name: 'Freyja', pitch: 1.12, description: 'Nurturing, wise Norse goddess' }
  };

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const sanitizeForTTS = (text: string): string => {
    return text
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_{1,2}/g, '')
      .replace(/`{1,3}/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const selectPreferredFemaleVoice = () => {
    const voices = window.speechSynthesis.getVoices();

    // Priority order for premium female voices
    const premiumVoices = [
      'Samantha', 'Karen', 'Victoria', 'Allison', 'Ava', 'Susan',
      'Moira', 'Tessa', 'Veena', 'Fiona', 'Serena'
    ];

    // First try exact premium voice matches
    for (const voiceName of premiumVoices) {
      const voice = voices.find(v => v.name.includes(voiceName));
      if (voice) return voice;
    }

    // Then try any female voice indicators
    const femaleIndicators = ['Female', 'Woman', 'Girl', 'Lady'];
    for (const indicator of femaleIndicators) {
      const voice = voices.find(v => v.name.includes(indicator));
      if (voice) return voice;
    }

    // Fallback to Google voices or first available
    return voices.find(v => v.name.includes('Google')) || voices[0];
  };

  const speak = (text: string, rate: number = 0.9) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const cleanText = sanitizeForTTS(text);
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const flavor = voiceFlavors[selectedVoiceFlavor as keyof typeof voiceFlavors];

    utterance.rate = rate;
    utterance.pitch = flavor.pitch;
    utterance.volume = 0.85;

    const femaleVoice = selectPreferredFemaleVoice();
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const toggleMute = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  const generateMCQ = async (skill: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a PRACTICAL multiple choice question for ${skill} that tests real-world engineering scenarios. Focus on: 1) Common day-to-day struggles engineers face, 2) Production incidents and firefighting, 3) Certification exam patterns (CKA, AWS, Docker, etc.), 4) Troubleshooting commands and debugging workflows, 5) Best practices that prevent disasters. Format exactly: Q: [question], A) [option1], B) [option2], C) [option3], D) [option4], ANSWER: [letter], EXPLANATION: [why this is correct and what happens in production]`,
          context: `Real production scenarios for ${skill}. Include actual error messages, log outputs, kubectl/docker commands, deployment issues, scaling problems, and the exact commands needed to diagnose and fix. Make it feel like helping an engineer at 3 AM with a production incident.`
        })
      });

      const data = await response.json();

      // Parse the LLM response into structured MCQ
      const parsedResponse = data.response;
      const lines = parsedResponse.split('\n').filter((l: string) => l.trim());

      let question = '';
      const options: string[] = [];
      let correctAnswer = 0;
      let explanation = '';

      lines.forEach((line: string, index: number) => {
        if (line.startsWith('Q:')) question = line.replace('Q:', '').trim();
        if (line.match(/^[A-D]\)/)) options.push(line);
        if (line.startsWith('ANSWER:')) {
          const ans = line.replace('ANSWER:', '').trim().toUpperCase();
          correctAnswer = ans.charCodeAt(0) - 65; // Convert A->0, B->1, etc
        }
        if (line.startsWith('EXPLANATION:')) explanation = line.replace('EXPLANATION:', '').trim();
      });

      const mcqMessage: Message = {
        id: Date.now(),
        text: question || parsedResponse,
        isUser: false,
        type: 'mcq',
        options: options.length === 4 ? options : ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
        correctAnswer: correctAnswer + 1,
        explanation: explanation || 'Review the production implications carefully.'
      };
      setMessages(prev => [...prev, mcqMessage]);
    } catch (error) {
      toast.error('Failed to generate practical scenario');
    }

    setIsLoading(false);
  };

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: `Great choice! Let's practice ${skill.name} ${skill.emoji}\n\nI'll provide MCQs covering:\n• Interview & certification questions\n• Real-world troubleshooting scenarios\n• Best practices & gotchas\n• Production tips from experienced engineers`,
      isUser: false,
      type: 'chat'
    }]);
    generateMCQ(skill.name);
  };

  const handleAnswer = (optionIndex: number, messageIndex: number) => {
    const message = messages[messageIndex];
    if (!message.correctAnswer) return;

    const isCorrect = optionIndex === message.correctAnswer - 1;
    setAnswered(prev => prev + 1);

    // Show answer with explanation in chat
    const resultMessage: Message = {
      id: Date.now(),
      text: `${isCorrect ? '✅ CORRECT!' : '❌ INCORRECT'} The answer is ${String.fromCharCode(64 + message.correctAnswer)}.\n\n${message.explanation}\n\n💡 Real-world impact: ${isCorrect ? 'You prevented a 3 AM incident!' : 'This mistake causes production outages - learn from it!'}`,
      isUser: false,
      type: 'chat'
    };
    setMessages(prev => [...prev, resultMessage]);

    if (isCorrect) {
      setScore(prev => prev + 10);
      toast.success('+10 XP! Production-ready! 🎉');
    } else {
      toast.error('Study this scenario - it\'s a common production issue');
    }

    // Generate next practical question
    if (selectedSkill) {
      setTimeout(() => generateMCQ(selectedSkill.name), 1500);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      isUser: true,
      type: 'chat'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: `PRACTICAL ${selectedSkill?.name || 'technical'} EXPERT MODE: User needs real production help. Provide: 1) Exact commands to diagnose issues, 2) Step-by-step troubleshooting workflows, 3) Common day-to-day struggles and firefighting scenarios, 4) Production monitoring/logging/observability commands, 5) Safety checks and prevention strategies, 6) Automation/scripts to prevent recurrence, 7) Real incident examples from experienced engineers. Be specific with kubectl, docker, aws cli, terraform, python, etc. commands. Structure as: DIAGNOSIS → COMMANDS → ROOT CAUSE → FIX → PREVENTION. Make every response feel like on-call help at 3 AM.`
        })
      });

      const data = await response.json();
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: data.response,
        isUser: false,
        type: 'chat'
      };

      setMessages(prev => [...prev, aiMessage]);

      if (!isMuted) {
        speak(data.response, speechRate);
      }
    } catch (error) {
      toast.error('Connection issue');
    }

    setIsLoading(false);
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error("Speech recognition not supported");
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
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
              <h3 className="text-2xl font-bold">AI Learning Coach</h3>
              <p className="text-white/60">Chat-based skill mastery • MCQ practice • Expert guidance</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-accent font-bold">{score}</span> XP
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              {answered} answered
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('mcq')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              mode === 'mcq'
                ? 'bg-primary/20 border border-primary text-primary'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Award className="w-4 h-4" /> MCQ Practice
          </button>
          <button
            onClick={() => setMode('chat')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              mode === 'chat'
                ? 'bg-primary/20 border border-primary text-primary'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Book className="w-4 h-4" /> Chat & Learn
          </button>
          {/* Voice Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all ${
                isMuted
                  ? 'bg-red-500/20 border border-red-500 text-red-500'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isMuted ? 'Muted' : 'Voice'}
            </button>

            {/* Voice Flavor Selector */}
            <select
              value={selectedVoiceFlavor}
              onChange={(e) => setSelectedVoiceFlavor(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-primary/50 outline-none"
            >
              {Object.keys(voiceFlavors).map(flavor => (
                <option key={flavor} value={flavor}>{flavor}</option>
              ))}
            </select>

            {/* Speech Rate Controls */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-white/60">Speed</span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-16 accent-primary"
              />
              <span className="text-xs font-mono w-8">{speechRate.toFixed(1)}x</span>
            </div>
          </div>
        </div>

        {/* Skills Selection */}
        {!selectedSkill && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {skills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => handleSkillSelect(skill)}
                className="glass p-4 rounded-2xl hover:bg-white/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{skill.emoji}</span>
                  <span className="font-semibold group-hover:text-primary transition-colors">{skill.name}</span>
                </div>
                <p className="text-sm text-white/60">{skill.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* Chat Messages */}
        <div className="bg-white/5 rounded-2xl p-6 h-[500px] overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl ${
                msg.isUser
                  ? 'bg-primary/20 border border-primary/30'
                  : 'bg-white/10 border border-white/20'
              }`}>
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* MCQ Options */}
                  {msg.type === 'mcq' && msg.options && (
                    <div className="space-y-2 mt-4">
                      {msg.options.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          onClick={() => handleAnswer(optIndex, index)}
                          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-left transition-all"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 border border-white/20 p-4 rounded-2xl">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={selectedSkill ? `Ask about ${selectedSkill.name} or request specific scenarios...` : "Select a skill above or ask any question..."}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white placeholder:text-white/40"
            />
          </div>

          <button
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all ${
              isListening
                ? 'bg-red-500/20 border border-red-500 text-red-500'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        <div className="text-xs text-center text-white/40">
          💡 Covers: Interviews • Certifications • Production Issues • Best Practices • Troubleshooting • Monitoring • Security • Automation
        </div>
      </div>
    </div>
  );
}