'use client';

import React, { useState } from 'react';
import { Send, Loader2, Target, Book, Play, Code, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  type?: 'chat';
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
      text: "Hi! I'm your Learning Coach 🤖\n\nI teach you:\n• Core concepts with examples\n• Day-to-day activities & workflows\n• Real production scenarios\n• How to solve actual problems\n\nSelect a skill to start learning!",
      isUser: false,
      type: 'chat'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
    const welcomeMessage: Message = {
      id: Date.now(),
      text: `Let's master ${skill.name} ${skill.emoji}\n\nI'll teach you:\n• Core concepts explained clearly\n• Daily tasks and workflows\n• Real production scenarios\n• Step-by-step problem solving\n\nWhat would you like to learn first? (concepts/activities/scenarios/troubleshooting)`,
      isUser: false,
      type: 'chat'
    };
    setMessages([welcomeMessage]);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedSkill) return;

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
          context: `You are a technical instructor teaching ${selectedSkill.name}. Cover: 1) Core concepts with clear explanations and examples, 2) Day-to-day activities and workflows, 3) Real production scenarios engineers face, 4) Step-by-step problem solving approaches. Be specific with commands, configurations, and actual troubleshooting steps. Structure your response with clear sections: CONCEPT → DAILY TASKS → SCENARIO → SOLUTION. Use actual ${selectedSkill.name} commands and configurations.`
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
    } catch (error) {
      toast.error('Failed to get response');
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="glass rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">AI Learning Coach</h3>
              <p className="text-white/60">Core concepts • Daily activities • Real scenarios • Problem solving</p>
            </div>
          </div>
        </div>

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

        <div className="bg-white/5 rounded-2xl p-6 h-[500px] overflow-y-auto space-y-4">
          {messages.map((msg) => (
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
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
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

        {selectedSkill && (
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask about ${selectedSkill.name} concepts, activities, or scenarios...`}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white placeholder:text-white/40"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        )}

        <div className="text-xs text-center text-white/40">
          📚 Learn: Core Concepts → Daily Tasks → Real Scenarios → Problem Solving
        </div>
      </div>
    </div>
  );
}