'use client';

import React, { useState, useRef } from 'react';
import { Send, Loader2, Trophy, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

interface Skill {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

const skills: Skill[] = [
  { id: 'docker', name: 'Docker', emoji: '🐳', description: 'Container production scenarios' },
  { id: 'kubernetes', name: 'Kubernetes', emoji: '☸️', description: 'K8s troubleshooting & scaling' },
  { id: 'aws', name: 'AWS', emoji: '☁️', description: 'Cloud architecture & incidents' },
  { id: 'cicd', name: 'CI/CD', emoji: '🔄', description: 'Pipeline failures & fixes' },
  { id: 'python', name: 'Python', emoji: '🐍', description: 'Performance & debugging' },
  { id: 'terraform', name: 'Terraform', emoji: '🏗️', description: 'IaC issues & solutions' },
  { id: 'react', name: 'React', emoji: '⚛️', description: 'Performance & state issues' },
  { id: 'mlops', name: 'MLOps', emoji: '🤖', description: 'Model deployment problems' },
];

export function ScenarioGame() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Welcome to Scenario Game! 🎮\n\nMCQ scenarios based on skills to equip you with:\n• Core concepts\n• Production issue solutions\n• Real-world troubleshooting\n\nSelect a skill to start!",
      isUser: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoiceFlavor, setSelectedVoiceFlavor] = useState('Aphrodite');
  const [speechRate, setSpeechRate] = useState(0.9);

  const voiceFlavors = {
    Aphrodite: { name: 'Aphrodite', pitch: 1.15 },
    Amba: { name: 'Amba', pitch: 1.1 },
    Venus: { name: 'Venus', pitch: 1.2 },
    Ishtar: { name: 'Ishtar', pitch: 1.05 },
    Freyja: { name: 'Freyja', pitch: 1.12 }
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

  const selectFemaleVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const femaleVoices = ['Samantha', 'Karen', 'Victoria', 'Allison', 'Ava', 'Susan', 'Moira', 'Tessa', 'Veena', 'Fiona'];

    for (const voiceName of femaleVoices) {
      const voice = voices.find(v => v.name.includes(voiceName));
      if (voice) return voice;
    }

    const googleVoice = voices.find(v => v.name.includes('Google') && v.name.toLowerCase().includes('en'));
    return googleVoice || voices.find(v => !v.name.toLowerCase().includes('male')) || voices[0];
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

    const femaleVoice = selectFemaleVoice();
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

  const generateScenarioQuestion = async (skill: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a technical scenario MCQ for ${skill}`,
          context: `SCENARIO GAME - Generate production scenarios with MCQ format.

Create questions about:
- Production incidents and how to solve them
- Core concepts applied in real scenarios
- Day-to-day technical challenges
- Troubleshooting workflows
- Architecture decisions

Format exactly:
QUESTION: [Scenario question testing core concepts and production issues]
A) [Option]
B) [Option]
C) [Option]
D) [Option]
CORRECT: [A/B/C/D]
EXPLANATION: [Complete technical explanation of correct approach, root cause, and solution regardless of user's choice]

Make it 100% technically accurate with real commands, configurations, and production insights for: ${skill}`
        })
      });

      const data = await response.json();
      const parsed = parseQuestion(data.response);

      if (parsed) {
        const questionMsg: Message = {
          id: Date.now(),
          text: parsed.question,
          isUser: false,
          options: parsed.options,
          correctAnswer: parsed.correctAnswer,
          explanation: parsed.explanation
        };
        setMessages(prev => [...prev, questionMsg]);
      }
    } catch (error) {
      toast.error('Failed to generate scenario');
    }

    setIsLoading(false);
  };

  const parseQuestion = (response: string) => {
    const lines = response.split('\n').filter(l => l.trim());
    let question = '';
    const options: string[] = [];
    let correctAnswer = '';
    let explanation = '';

    lines.forEach(line => {
      if (line.startsWith('QUESTION:')) question = line.replace('QUESTION:', '').trim();
      if (line.match(/^[A-D]\)/)) options.push(line.trim());
      if (line.startsWith('CORRECT:')) correctAnswer = line.replace('CORRECT:', '').trim();
      if (line.startsWith('EXPLANATION:')) explanation = line.replace('EXPLANATION:', '').trim();
    });

    return question && options.length === 4 ? { question, options, correctAnswer, explanation } : null;
  };

  const handleAnswer = (answer: string, messageIndex: number) => {
    const message = messages[messageIndex];
    if (!message.correctAnswer || !message.explanation) return;

    setAnswered(prev => prev + 1);
    const isCorrect = answer === message.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 10);
      toast.success('+10 XP! Production ready!');
    } else {
      toast.info('Learn from this scenario');
    }

    const resultMsg: Message = {
      id: Date.now(),
      text: `${isCorrect ? '✅ CORRECT!' : '❌ INCORRECT'}\n\nYour answer: ${answer}\nCorrect answer: ${message.correctAnswer}\n\n${message.explanation}\n\n💡 Key takeaway: This scenario tests core concepts and equips you with production troubleshooting skills.`,
      isUser: false
    };
    setMessages(prev => [...prev, resultMsg]);

    if (selectedSkill) {
      setTimeout(() => generateScenarioQuestion(selectedSkill.name), 1500);
    }
  };

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
    const welcomeMsg: Message = {
      id: Date.now(),
      text: `Perfect! Let's practice ${skill.name} scenarios ${skill.emoji}\n\nMCQ format to master:\n• Core technical concepts\n• Production issue resolution\n• Real-world troubleshooting\n• Daily operational challenges\n\nStarting scenarios...`,
      isUser: false
    };
    setMessages([welcomeMsg]);
    generateScenarioQuestion(skill.name);
  };

  const resetGame = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setMessages([{
      id: 0,
      text: "Welcome to Scenario Game! 🎮\n\nMCQ scenarios based on skills to equip you with:\n• Core concepts\n• Production issue solutions\n• Real-world troubleshooting\n\nSelect a skill to start!",
      isUser: false
    }]);
    setSelectedSkill(null);
    setScore(0);
    setAnswered(0);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="glass rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Scenario Game</h3>
              <p className="text-white/60">MCQ scenarios • Core concepts • Production issues • Troubleshooting skills</p>
            </div>
          </div>

          {selectedSkill && (
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-accent font-bold">{score}</span> XP
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                {answered} answered
              </div>
              <button onClick={toggleMute} className={`p-2 rounded-xl ${isMuted ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/5 border border-white/10'}`}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button onClick={resetGame} className="p-2 rounded-xl bg-white/5 border border-white/10">
                <RotateCcw className="w-4 h-4" />
              </button>
              <select value={selectedVoiceFlavor} onChange={(e) => setSelectedVoiceFlavor(e.target.value)} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">
                {Object.keys(voiceFlavors).map(flavor => (
                  <option key={flavor} value={flavor}>{flavor}</option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <span className="text-xs text-white/60">Rate:</span>
                <input type="range" min="0.5" max="2.0" step="0.1" value={speechRate} onChange={(e) => setSpeechRate(parseFloat(e.target.value))} className="w-16" />
                <span className="text-xs w-8">{speechRate.toFixed(1)}x</span>
              </div>
            </div>
          )}
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
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl ${
                msg.isUser ? 'bg-primary/20 border border-primary/30' : 'bg-white/10 border border-white/20'
              }`}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>

                {msg.options && !msg.explanation && (
                  <div className="mt-4 space-y-2">
                    {msg.options.map((option, optIndex) => (
                      <button
                        key={optIndex}
                        onClick={() => handleAnswer(option.split(')')[0].trim() + ')', index)}
                        className="w-full text-left p-3 rounded-xl border bg-white/5 border-white/20 hover:bg-white/10 hover:border-primary/50 transition-all"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-4 rounded-2xl bg-white/10">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}
          {isSpeaking && (
            <div className="flex justify-start">
              <div className="p-2 rounded-xl bg-primary/20">
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-center text-white/40">
          🎯 MCQ Scenarios: Core Concepts → Production Issues → Troubleshooting → Solutions
        </div>
      </div>
    </div>
  );
}