'use client';

import React, { useState, useRef } from 'react';
import { Send, Loader2, Trophy, RotateCcw, Volume2, VolumeX, Book, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  type?: 'chat';
}

type Mode = 'learning' | 'interview';

export function ScenarioGame() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Welcome to Scenario Game! 🎮\n\nTwo modes available:\n• 📚 Learning Mode - Chat about concepts and get explanations\n• 🎯 Interview Mode - MCQ practice with explanations\n\nEnter any skill to begin!",
      isUser: false
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('learning');
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoiceFlavor, setSelectedVoiceFlavor] = useState('Aphrodite');
  const [speechRate, setSpeechRate] = useState(0.9);
  const [currentQuestion, setCurrentQuestion] = useState<{question: string, options: string[], correctAnswer: string, explanation: string} | null>(null);

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

  // Real-time voice updates
  React.useEffect(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [speechRate, selectedVoiceFlavor]);

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

  const generateQuestion = async (skill: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate an interview/certification MCQ for ${skill}`,
          context: `INTERVIEW MODE - Generate production-ready questions with MCQ.

Format exactly:
QUESTION: [Interview/certification style question]
A) [Option]
B) [Option]
C) [Option]
D) [Option]
CORRECT: [A/B/C/D]
EXPLANATION: [100% technically accurate detailed explanation of why correct answer is right, why others are wrong, real production impact, and commands/configs]

Include actual commands, configurations, and production scenarios for: ${skill}`
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
        setCurrentQuestion(parsed);
      }
    } catch (error) {
      toast.error('Failed to generate question');
    }

    setIsLoading(false);
  };

  const handleAnswer = (answer: string, messageIndex: number) => {
    const message = messages[messageIndex];
    if (!message.correctAnswer || !message.explanation) return;

    setAnswered(prev => prev + 1);
    const isCorrect = answer === message.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 10);
      toast.success('+10 XP! Interview ready!');
    } else {
      toast.info('Learn from this scenario');
    }

    const resultMsg: Message = {
      id: Date.now(),
      text: `${isCorrect ? '✅ CORRECT!' : '❌ INCORRECT'}\n\nYour answer: ${answer}\nCorrect answer: ${message.correctAnswer}\n\n${message.explanation}\n\n💡 Interview tip: This appears in technical interviews and certification exams.`,
      isUser: false
    };
    setMessages(prev => [...prev, resultMsg]);

    if (selectedSkill) {
      setTimeout(() => generateQuestion(selectedSkill), 1500);
    }
  };

  const handleLearningMessage = async () => {
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
          context: `LEARNING MODE for ${selectedSkill} - Teach concepts, explain daily activities, real scenarios, and problem-solving. Structure: CONCEPT → DAILY TASKS → SCENARIOS → SOLUTIONS. Use actual ${selectedSkill} commands and configurations.`
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
      if (!isMuted) speak(data.response, speechRate);
    } catch (error) {
      toast.error('Failed to get response');
    }

    setIsLoading(false);
  };

  const handleSkillSubmit = () => {
    if (!input.trim()) return;
    const skill = input.trim();
    setSelectedSkill(skill);

    const welcomeMsg: Message = {
      id: Date.now(),
      text: mode === 'learning'
        ? `📚 Learning Mode: ${skill}\n\nI'll teach you concepts, daily tasks, scenarios, and problem-solving. Ask me anything!`
        : `🎯 Interview Mode: ${skill}\n\nI'll ask MCQ questions. Select your answer and get explanations.`,
      isUser: false
    };
    setMessages([welcomeMsg]);
    setInput('');

    if (mode === 'interview') {
      setTimeout(() => generateQuestion(skill), 1000);
    }
  };

  const resetGame = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setMessages([{
      id: 0,
      text: "Welcome to Scenario Game! 🎮\n\nTwo modes available:\n• 📚 Learning Mode - Chat about concepts and get explanations\n• 🎯 Interview Mode - MCQ practice with explanations\n\nEnter any skill to begin!",
      isUser: false
    }]);
    setSelectedSkill(null);
    setMode('learning');
    setScore(0);
    setAnswered(0);
    setInput('');
    setCurrentQuestion(null);
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
              <p className="text-white/60">Any skill • Learning & Interview modes • MCQ with explanations</p>
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
            </div>
          )}
        </div>

        {!selectedSkill ? (
          <div className="space-y-6">
            <div>
              <p className="text-lg mb-4">Choose your mode:</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setMode('learning')}
                  className={`flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                    mode === 'learning'
                      ? 'bg-primary/20 border-primary/50'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                >
                  <Book className="w-5 h-5" /> Learning Mode
                </button>
                <button
                  onClick={() => setMode('interview')}
                  className={`flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                    mode === 'interview'
                      ? 'bg-primary/20 border-primary/50'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                >
                  <Award className="w-5 h-5" /> Interview Mode
                </button>
              </div>
            </div>

            <div>
              <p className="text-lg mb-4">What skill would you like to practice?</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSkillSubmit()}
                  placeholder="Enter any skill (Docker, React, AWS, Kubernetes, Python...)"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none"
                />
                <button
                  onClick={handleSkillSubmit}
                  disabled={!input.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50 font-medium"
                >
                  Start {mode === 'learning' ? 'Learning' : 'Interview'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30">
                {mode === 'learning' ? '📚' : '🎯'} {mode === 'learning' ? 'Learning' : 'Interview'}: <span className="font-bold">{selectedSkill}</span>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className={`p-2 rounded-xl ${isMuted ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/5 border border-white/10'}`}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button onClick={resetGame} className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Voice Controls */}
                <select value={selectedVoiceFlavor} onChange={(e) => setSelectedVoiceFlavor(e.target.value)} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">
                  {Object.keys(voiceFlavors).map(flavor => (
                    <option key={flavor} value={flavor}>{flavor}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white/60">Rate:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-16 accent-primary"
                  />
                  <span className="text-xs w-8">{speechRate.toFixed(1)}x</span>
                </div>
              </div>
            </div>

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

            {mode === 'learning' && (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleLearningMessage()}
                  placeholder={`Ask about ${selectedSkill} concepts, daily tasks, or scenarios...`}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white placeholder:text-white/40"
                />
                <button
                  onClick={handleLearningMessage}
                  disabled={!input.trim() || isLoading}
                  className="p-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            )}

            <div className="text-xs text-center text-white/40">
              {mode === 'learning' ? '📚 Learn: Concepts → Daily Tasks → Scenarios → Solutions' : '🎯 MCQ: Select answer → Get explanation → Next question'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}