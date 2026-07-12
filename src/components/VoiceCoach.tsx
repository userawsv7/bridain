'use client';

import React, { useState, useRef } from 'react';
import { Send, Loader2, Mic, MicOff, Volume2, VolumeX, Target, Award } from 'lucide-react';
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
  { id: 'docker', name: 'Docker', emoji: '🐳', description: 'Container certification & interviews' },
  { id: 'kubernetes', name: 'Kubernetes', emoji: '☸️', description: 'CKA/CKAD exam preparation' },
  { id: 'aws', name: 'AWS', emoji: '☁️', description: 'AWS certification prep' },
  { id: 'python', name: 'Python', emoji: '🐍', description: 'Python certification & interviews' },
  { id: 'terraform', name: 'Terraform', emoji: '🏗️', description: 'Terraform certification prep' },
  { id: 'react', name: 'React', emoji: '⚛️', description: 'Frontend interviews' },
  { id: 'system-design', name: 'System Design', emoji: '🏛️', description: 'Architecture interviews' },
  { id: 'devops', name: 'DevOps', emoji: '⚙️', description: 'DevOps interviews & SRE' },
];

export function VoiceCoach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Hi! I'm your Interview Coach 🎤\n\nI help you crack:\n• Technical interviews\n• Certification exams (CKA, AWS, Docker, etc.)\n• System design rounds\n• Behavioral questions\n\nSelect a skill to start practicing!",
      isUser: false
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoiceFlavor, setSelectedVoiceFlavor] = useState('Aphrodite');
  const [speechRate, setSpeechRate] = useState(0.9);
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

  const generateInterviewQuestion = async (skill: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate an interview/certification question for ${skill}`,
          context: `INTERVIEW & CERTIFICATION PREP MODE for ${skill}. Generate questions that test:
1. Core concepts asked in interviews
2. Certification exam patterns (CKA, AWS Solutions Architect, Docker DCA, etc.)
3. Real production scenarios
4. System design thinking
5. Behavioral questions with STAR method answers

Format exactly:
QUESTION: [interview-style question]
A) [option]
B) [option]
C) [option]
D) [option]
CORRECT: [A/B/C/D]
EXPLANATION: [detailed explanation for interview success]

Include actual commands, configurations, and production examples. Make it feel like a real technical interview.`
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
      toast.error('Failed to generate question');
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
      toast.success('+10 XP! Interview ready! 🎉');
    } else {
      toast.error('Study this - common interview question');
    }

    const resultMsg: Message = {
      id: Date.now(),
      text: `${isCorrect ? '✅ CORRECT!' : '❌ INCORRECT'}\n\nYour answer: ${answer}\nCorrect answer: ${message.correctAnswer}\n\n${message.explanation}\n\n💡 Interview tip: This concept appears frequently in technical interviews and certification exams.`,
      isUser: false
    };
    setMessages(prev => [...prev, resultMsg]);

    if (selectedSkill) {
      setTimeout(() => generateInterviewQuestion(selectedSkill.name), 1500);
    }
  };

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
    const welcomeMsg: Message = {
      id: Date.now(),
      text: `Perfect! Let's prepare for ${skill.name} interviews ${skill.emoji}\n\nI'll help you with:\n• Technical interview questions\n• Certification exam patterns\n• System design scenarios\n• Production troubleshooting\n• Behavioral questions\n\nStarting with interview questions...`,
      isUser: false
    };
    setMessages([welcomeMsg]);
    generateInterviewQuestion(skill.name);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedSkill) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      isUser: true
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
          context: `INTERVIEW PREP MODE for ${selectedSkill.name}. User is preparing for technical interviews and certifications. Provide: 1) Detailed technical explanations, 2) Common interview questions, 3) Certification exam tips, 4) Real production scenarios, 5) Best answers using STAR method for behavioral questions. Be specific with commands, architectures, and interview strategies.`
        })
      });

      const data = await response.json();
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: data.response,
        isUser: false
      };

      setMessages(prev => [...prev, aiMessage]);
      if (!isMuted) speak(data.response, speechRate);
    } catch (error) {
      toast.error('Connection issue');
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="glass rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Voice Interview Coach</h3>
              <p className="text-white/60">Interview prep • Certification exams • System design • Behavioral questions</p>
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

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all ${
              isMuted ? 'bg-red-500/20 border border-red-500 text-red-500' : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            Voice
          </button>

          <select
            value={selectedVoiceFlavor}
            onChange={(e) => setSelectedVoiceFlavor(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm"
          >
            {Object.keys(voiceFlavors).map(flavor => (
              <option key={flavor} value={flavor}>{flavor}</option>
            ))}
          </select>

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
              <div className="bg-white/10 border border-white/20 p-4 rounded-2xl">
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

        {selectedSkill && (
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask about ${selectedSkill.name} interviews or certifications...`}
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
          🎯 Prep for: Technical Interviews • Certification Exams • System Design • Behavioral Questions
        </div>
      </div>
    </div>
  );
}