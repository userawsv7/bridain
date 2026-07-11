'use client';

import React, { useState, useRef } from 'react';
import { Send, Loader2, Mic, MicOff, Volume2, VolumeX, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  isCorrect?: boolean;
  explanation?: string;
  selectedAnswer?: string;
}

type Mode = 'learning' | 'interview';

export function VoiceCoach() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "🎙️ Welcome to Voice Coach!\n\nChoose a mode and enter your skill to begin.", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('learning');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);
  const [selectedVoiceFlavor, setSelectedVoiceFlavor] = useState('Aphrodite');
  const [speechRate, setSpeechRate] = useState(0.85);
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<{question: string, options: string[], correctAnswer: string} | null>(null);

  const voiceFlavors = {
    Aphrodite: { name: 'Aphrodite', pitch: 1.15, description: 'Warm, enchanting Greek goddess' },
    Amba: { name: 'Amba', pitch: 1.1, description: 'Gentle, melodic Indian goddess' },
    Venus: { name: 'Venus', pitch: 1.2, description: 'Elegant, romantic Roman goddess' },
    Ishtar: { name: 'Ishtar', pitch: 1.05, description: 'Strong, confident Babylonian goddess' },
    Freyja: { name: 'Freyja', pitch: 1.12, description: 'Nurturing, wise Norse goddess' }
  };

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // FEMALE-ONLY VOICE SELECTION
  const selectFemaleVoice = async (): Promise<SpeechSynthesisVoice | null> => {
    let voices = window.speechSynthesis.getVoices();

    if (voices.length === 0) {
      await new Promise<void>((resolve) => {
        const handleVoicesChanged = () => {
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          resolve();
        };
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        setTimeout(() => {
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          resolve();
        }, 1000);
      });
      voices = window.speechSynthesis.getVoices();
    }

    const femaleVoices = [
      'Samantha', 'Karen', 'Victoria', 'Allison', 'Ava', 'Susan',
      'Moira', 'Tessa', 'Veena', 'Fiona', 'Serena', 'Zira', 'Hazel',
      'Rishi', 'Priya', 'Sangeeta', 'Heera', 'Linda', 'Joanna', 'Amy',
      'Emma', 'Nicole', 'Salli', 'Ivy', 'Kimberly', 'Kendra', 'Ruth'
    ];

    for (const voiceName of femaleVoices) {
      const voice = voices.find(v =>
        v.name.includes(voiceName) &&
        !v.name.toLowerCase().includes('male') &&
        !v.name.toLowerCase().includes('guy') &&
        !v.name.toLowerCase().includes('man')
      );
      if (voice) return voice;
    }

    const femaleIndicators = ['Female', 'Woman', 'Girl', 'Lady'];
    for (const indicator of femaleIndicators) {
      const voice = voices.find(v =>
        v.name.includes(indicator) &&
        !v.name.toLowerCase().includes('male')
      );
      if (voice) return voice;
    }

    const googleVoices = voices.filter(v =>
      v.name.includes('Google') &&
      !v.name.toLowerCase().includes('male')
    );
    if (googleVoices.length > 0) return googleVoices[0];

    const nonMaleVoice = voices.find(v =>
      !v.name.toLowerCase().includes('male') &&
      !v.name.toLowerCase().includes('guy') &&
      !v.name.toLowerCase().includes('man')
    );
    return nonMaleVoice || voices[0] || null;
  };

  const sanitizeForTTS = (text: string): string => {
    return text
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_{1,2}/g, '')
      .replace(/`{1,3}/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Initialize female voice
  React.useEffect(() => {
    const initVoice = async () => {
      const voice = await selectFemaleVoice();
      if (voice) setPreferredVoice(voice);
    };
    initVoice();
  }, []);

  const speakWithPromise = (text: string, rate: number = 0.9): Promise<void> => {
    return new Promise((resolve) => {
      if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      stopSpeaking();
      const cleanText = sanitizeForTTS(text);

      selectFemaleVoice().then(voiceToUse => {
        if (voiceToUse) setPreferredVoice(voiceToUse);

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = rate;
        utterance.pitch = voiceFlavors[selectedVoiceFlavor as keyof typeof voiceFlavors].pitch;
        utterance.volume = 0.85;
        utterance.voice = voiceToUse || preferredVoice || null;

        utterance.onend = () => {
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
          resolve();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
          resolve();
        };

        currentUtteranceRef.current = utterance;
        utteranceRef.current = utterance;
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      });
    });
  };

  const speak = async (text: string, rate: number = 0.9) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    await speakWithPromise(text, rate);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current.onend = null;
      currentUtteranceRef.current.onerror = null;
      currentUtteranceRef.current = null;
    }
    setIsSpeaking(false);
  };

  React.useEffect(() => {
    return () => {
      stopSpeaking();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleMute = () => {
    if (!isMuted) stopSpeaking();
    setIsMuted(!isMuted);
  };

  const askInterviewQuestion = async (skill: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate an interview question for ${skill}`,
          context: `INTERVIEW MODE - Generate questions with 4 options and one correct answer.

Generate a technical interview question with:
- A clear question
- 4 options (A, B, C, D)
- Only ONE correct answer
- Technical, production-grade questions

Format exactly:
QUESTION: [The question]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
CORRECT: [A/B/C/D]

Test on: ${skill} fundamentals, best practices, production scenarios`,
          skill: skill,
          mode: 'interview_question'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = parseQuestion(data.response);

        if (parsed) {
          const questionMsg: Message = {
            id: Date.now(),
            text: parsed.question,
            isUser: false,
            question: parsed.question,
            options: parsed.options
          };

          setMessages(prev => [...prev, questionMsg]);
          setCurrentQuestion({ question: parsed.question, options: parsed.options, correctAnswer: parsed.correctAnswer });
          setAwaitingAnswer(true);

          // Speak the question
          const speakText = `${parsed.question}. Options: ${parsed.options.join('. ')}. Choose your answer.`;
          await speak(speakText, speechRate);
        }
      }
    } catch (error) {
      console.error('Error generating question:', error);
    }

    setIsLoading(false);
  };

  const parseQuestion = (response: string) => {
    const questionMatch = response.match(/QUESTION:\s*(.+?)(?=\n[A-D]\))/i);
    const optionsMatch = response.match(/([A-D]\)\s*.+?)(?=\nCORRECT:|$)/i);
    const correctMatch = response.match(/CORRECT:\s*([A-D])/i);

    if (!questionMatch || !optionsMatch || !correctMatch) return null;

    const question = questionMatch[1].trim();
    const optionsText = optionsMatch[1];
    const correctLetter = correctMatch[1].toUpperCase();

    const optionRegex = /([A-D])\)\s*([^\n]+)/g;
    const options: string[] = [];
    let match;
    let correctAnswer = '';

    while ((match = optionRegex.exec(optionsText)) !== null) {
      const optionText = match[2].trim();
      const optionWithLetter = `${match[1]}) ${optionText}`;
      options.push(optionText);

      if (match[1] === correctLetter) {
        correctAnswer = optionText;
      }
    }

    return { question, options, correctAnswer };
  };

  const handleAnswer = async (answer: string) => {
    if (!currentQuestion || !awaitingAnswer) return;

    setAwaitingAnswer(false);

    const userMsg: Message = {
      id: Date.now(),
      text: `Your answer: ${answer}`,
      isUser: true,
      selectedAnswer: answer
    };
    setMessages(prev => [...prev, userMsg]);

    const isCorrect = answer === currentQuestion.correctAnswer;

    // Speak result
    if (isCorrect) {
      await speak("Correct! Excellent job.", speechRate);
    } else {
      await speak(`Incorrect. The correct answer is ${currentQuestion.correctAnswer}.`, speechRate);
    }

    // Get explanation
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Explain why ${currentQuestion.correctAnswer} is correct for question: ${currentQuestion.question}`,
          context: `INTERVIEW FEEDBACK - Explain the correct answer technically and accurately. User selected: ${answer}. Correct answer: ${currentQuestion.correctAnswer}. Provide a clear technical explanation.`,
          skill: selectedSkill,
          mode: 'interview_feedback'
        })
      });

      if (response.ok) {
        const data = await response.json();

        const explanationMsg: Message = {
          id: Date.now() + 1,
          text: isCorrect
            ? `✅ Correct! ${currentQuestion.correctAnswer}\n\n${data.response}`
            : `❌ Incorrect. Your answer: ${answer}\n\n✅ Correct Answer: ${currentQuestion.correctAnswer}\n\n${data.response}`,
          isUser: false,
          question: currentQuestion.question,
          correctAnswer: currentQuestion.correctAnswer,
          isCorrect: isCorrect,
          explanation: data.response,
          selectedAnswer: answer
        };

        setMessages(prev => [...prev, explanationMsg]);

        // Speak explanation
        await speak(`Explanation: ${data.response}`, speechRate * 0.9);

        // Auto-generate next question
        if (selectedSkill) {
          setTimeout(() => {
            askInterviewQuestion(selectedSkill);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error getting explanation:', error);
    }

    setIsLoading(false);
    setCurrentQuestion(null);
  };

  const handleLearningMessage = async () => {
    if (!input.trim() || !selectedSkill) return;

    const userMsg: Message = {
      id: Date.now(),
      text: input,
      isUser: true
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: `LEARNING MODE: Teaching session for ${selectedSkill}.`,
          skill: selectedSkill,
          mode: 'learning'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: Message = {
          id: Date.now() + 1,
          text: data.response,
          isUser: false
        };
        setMessages(prev => [...prev, aiMsg]);
        speak(data.response, speechRate);
      }
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "I understand. Let me explain this concept differently...",
        isUser: false
      };
      setMessages(prev => [...prev, errorMsg]);
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
        ? `🎓 Learning Mode: ${skill}\n\nI'll teach you concepts. Ask me anything!`
        : `🎤 Interview Mode: ${skill}\n\nI'll ask you interview questions. Select the correct answer from the options.`,
      isUser: false
    };
    setMessages(prev => [...prev, welcomeMsg]);
    setInput('');

    if (mode === 'interview') {
      setTimeout(() => askInterviewQuestion(skill), 1000);
    }
  };

  const resetCoach = () => {
    stopSpeaking();
    setMessages([{ id: 0, text: "🎙️ Welcome to Voice Coach!\n\nChoose a mode and enter your skill to begin.", isUser: false }]);
    setSelectedSkill(null);
    setInput('');
    setAwaitingAnswer(false);
    setCurrentQuestion(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Mic className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Voice Coach</h3>
              <p className="text-white/60">Interactive voice-based learning & interview practice</p>
            </div>
          </div>
          {selectedSkill && (
            <button onClick={resetCoach} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
              <Target className="w-4 h-4" />
            </button>
          )}
        </div>

        {!selectedSkill ? (
          <div className="space-y-6">
            <div>
              <p className="text-lg mb-4">Choose your mode:</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setMode('learning')}
                  className={`flex-1 p-4 rounded-xl border transition-all ${mode === 'learning'
                    ? 'bg-primary/20 border-primary/50'
                    : 'bg-white/5 border-white/20 hover:bg-white/10'}`}
                >
                  Learning Mode
                </button>
                <button
                  onClick={() => setMode('interview')}
                  className={`flex-1 p-4 rounded-xl border transition-all ${mode === 'interview'
                    ? 'bg-primary/20 border-primary/50'
                    : 'bg-white/5 border-white/20 hover:bg-white/10'}`}
                >
                  Interview Mode
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
                  placeholder="Enter any skill (Docker, React, System Design...)"
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
                {mode === 'learning' ? '🎓' : '🎤'} {mode === 'learning' ? 'Learning' : 'Interview'}: <span className="font-bold">{selectedSkill}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className={`p-2 rounded-xl ${isMuted ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/5 border border-white/10'}`}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button onClick={stopSpeaking} disabled={!isSpeaking} className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-50">
                  <MicOff className="w-4 h-4" />
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
            </div>

            <div className="bg-white/5 rounded-2xl p-6 h-[500px] overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${
                    msg.isUser ? 'bg-primary/20 border border-primary/30' :
                    msg.isCorrect !== undefined ? (msg.isCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30') :
                    'bg-white/10 border border-white/20'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {/* Answer Options */}
                    {msg.options && !msg.selectedAnswer && (
                      <div className="mt-4 space-y-2">
                        {msg.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswer(option)}
                            disabled={!awaitingAnswer}
                            className="w-full text-left p-3 rounded-xl border bg-white/5 border-white/20 hover:bg-white/10 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && <div className="flex justify-start"><div className="p-4 rounded-2xl bg-white/10"><Loader2 className="w-5 h-5 animate-spin" /></div></div>}
              {isSpeaking && <div className="flex justify-start"><div className="p-2 rounded-xl bg-primary/20"><Volume2 className="w-4 h-4 animate-pulse" /></div></div>}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    if (mode === 'learning') handleLearningMessage();
                  }
                }}
                placeholder={mode === 'learning' ? "Ask a question..." : "Select an answer from the options above"}
                disabled={mode === 'interview' || isLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none disabled:opacity-50"
              />
              <button
                onClick={mode === 'learning' ? handleLearningMessage : undefined}
                disabled={!input.trim() || isLoading || mode === 'interview'}
                className="p-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}