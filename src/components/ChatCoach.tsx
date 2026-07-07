'use client';

import React, { useState } from 'react';
import { Send, Volume2, Loader2, Mic, MicOff, Award, Target, Book } from 'lucide-react';
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

  const generateMCQ = async (skill: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a multiple choice question about ${skill}. Format: Question on line 1, then 4 options numbered 1-4, then which is correct (1-4), then brief explanation. Make it relevant to real interview questions, certifications (CKA, AWS, Docker), or common production issues faced by engineers.`,
          context: `Generate MCQ for ${skill} skill level. Focus on: interview questions, certification topics, real production issues, best practices, troubleshooting scenarios, safety considerations.`
        })
      });

      const data = await response.json();
      const mcqMessage: Message = {
        id: Date.now(),
        text: data.response,
        isUser: false,
        type: 'mcq',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'] // Parse from response
      };
      setMessages(prev => [...prev, mcqMessage]);
    } catch (error) {
      toast.error('Failed to generate question');
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

    if (isCorrect) {
      setScore(prev => prev + 10);
      toast.success('+10 XP! Correct! 🎉');
    } else {
      toast.error(`Incorrect. ${message.explanation}`);
    }

    // Generate next question
    if (selectedSkill) {
      setTimeout(() => generateMCQ(selectedSkill.name), 1000);
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
          context: `User is learning ${selectedSkill?.name || 'technical skills'}. Mode: ${mode}. Provide detailed expert-level guidance on concepts, troubleshooting, monitoring, logging, observability, safety, best practices, prevention, automation, scripting, and planning.`
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

      if (voiceEnabled) {
        speak(data.response);
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
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              voiceEnabled
                ? 'bg-green-500/20 border border-green-500 text-green-500'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Volume2 className="w-4 h-4" /> Voice {voiceEnabled ? 'ON' : 'OFF'}
          </button>
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