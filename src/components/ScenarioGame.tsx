'use client';

import React, { useState, useRef } from 'react';
import { Send, Loader2, Trophy, RotateCcw, Volume2, VolumeX, Book, Award, ArrowRight } from 'lucide-react';
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
      text: "Welcome to Scenario Game! 🎮\n\nTwo modes available:\n• 📚 Learning Mode - Interactive teaching with concepts and real scenarios\n• 🎯 Interview Mode - MCQ practice with explanations\n\nEnter any skill to begin!",
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
  const speechRate = 1.0;

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const selectFemaleVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const premiumFemaleVoices = [
      'Samantha', 'Karen', 'Victoria', 'Allison', 'Ava', 'Susan', 'Moira',
      'Tessa', 'Veena', 'Fiona', 'Alex', 'Serena', 'Kathy', 'Princess',
      'Junior', 'Monica', 'Agnes'
    ];

    for (const voiceName of premiumFemaleVoices) {
      const voice = voices.find(v => v.name.includes(voiceName) && !v.name.toLowerCase().includes('male'));
      if (voice) return voice;
    }

    const femaleVoice = voices.find(v =>
      !v.name.toLowerCase().includes('male') &&
      v.name !== 'Google UK English Male'
    );
    return femaleVoice || voices[0];
  };

  const speak = (text: string, rate: number = 1.0) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const cleanText = text
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_{1,2}/g, '')
      .replace(/`{1,3}/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    utterance.pitch = 1.1;
    utterance.volume = 0.9;

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

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const parseQuestion = (response: string) => {
    const lines = response.split('\n').filter(l => l.trim());
    let question = '';
    const options: string[] = [];
    let correctAnswer = '';
    let explanation = '';

    lines.forEach(line => {
      const upperLine = line.toUpperCase();
      if (upperLine.startsWith('QUESTION:')) question = line.replace(/QUESTION:/i, '').trim();
      if (line.match(/^[A-D]\)/)) options.push(line.trim());
      if (upperLine.startsWith('CORRECT:')) correctAnswer = line.replace(/CORRECT:/i, '').trim();
      if (upperLine.startsWith('EXPLANATION:')) explanation = line.replace(/EXPLANATION:/i, '').trim();
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
          message: `Generate a technical interview MCQ question for ${skill}`,
          context: `INTERVIEW MODE - Generate a specific MCQ question for ${skill} interviews. Format: QUESTION, A), B), C), D), CORRECT, EXPLANATION`,
          skill: skill,
          mode: 'interview_feedback'
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

        if (!isMuted) {
          setTimeout(() => {
            speak(`${parsed.question}. ${parsed.options.join('. ')}`, speechRate);
          }, 500);
        }
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
      toast.success('+10 XP! Excellent!');
    } else {
      toast.info('Learn from this explanation');
    }

    const resultMsg: Message = {
      id: Date.now(),
      text: `${isCorrect ? '✅ CORRECT!' : '❌ INCORRECT'}\n\nYour answer: ${answer}\nCorrect answer: ${message.correctAnswer}\n\n${message.explanation}`,
      isUser: false
    };
    setMessages(prev => [...prev, resultMsg]);

    if (!isMuted) {
      speak(`${isCorrect ? 'Correct!' : 'Incorrect.'} The correct answer is ${message.correctAnswer}. ${message.explanation}`, speechRate);
    }
  };

  const handleNextQuestion = () => {
    if (selectedSkill) {
      generateQuestion(selectedSkill);
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
          context: `LEARNING MODE for ${selectedSkill}: Teach core concepts first, then provide real-world scenarios. Structure: 1) Explain the concept clearly 2) Show real scenario where this applies 3) Ask a question to check understanding`,
          skill: selectedSkill,
          mode: 'learning_teacher'
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
        ? `📚 Learning Mode: ${skill}\n\nI'm your personal teacher for ${skill}. I'll explain core concepts, demonstrate with real scenarios, ask questions to check understanding. What would you like to learn first?`
        : `🎯 Interview Mode: ${skill}\n\nI'll test your knowledge with technical MCQs. Each question has 4 options. Select your answer, get the correct answer with detailed explanation, then move to the next question.`,
      isUser: false
    };
    setMessages([welcomeMsg]);
    setInput('');

    if (!isMuted) {
      speak(welcomeMsg.text, speechRate);
    }

    if (mode === 'interview') {
      setTimeout(() => generateQuestion(skill), 1500);
    }
  };

  const resetGame = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setMessages([{
      id: 0,
      text: "Welcome to Scenario Game! 🎮\n\nTwo modes available:\n• 📚 Learning Mode - Interactive teaching with concepts and real scenarios\n• 🎯 Interview Mode - MCQ practice with explanations\n\nEnter any skill to begin!",
      isUser: false
    }]);
    setSelectedSkill(null);
    setMode('learning');
    setScore(0);
    setAnswered(0);
    setInput('');
  };

  const hasAnsweredCurrentQuestion = () => {
    const lastMsg = messages[messages.length - 1];
    return lastMsg && lastMsg.explanation;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="glass rounded-3xl p-8 space-y-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Scenario Game</h3>
              <p className="text-white/60">Expert teaching • Technical MCQs • Any skill supported</p>
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
              <p className="text-lg mb-4">What skill would you like to master?</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSkillSubmit()}
                  placeholder="Enter any skill (Docker, React, AWS, Kubernetes, Python, Go, Rust...)"
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

            {mode === 'interview' && hasAnsweredCurrentQuestion() && (
              <div className="flex justify-center">
                <button
                  onClick={handleNextQuestion}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50 font-medium"
                >
                  Next Question <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="text-xs text-center text-white/40">
              {mode === 'learning'
                ? '📚 Teacher Mode: Concepts → Scenarios → Questions → Deep Understanding | Works with any skill'
                : '🎯 Interview Mode: Select answer → Get explanation → Click Next for new question | Works with any skill'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}