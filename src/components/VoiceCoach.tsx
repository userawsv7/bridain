'use client';

import React, { useState, useRef } from 'react';
import { Send, Loader2, Mic, MicOff, Volume2, VolumeX, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface DualText {
  displayText: string;
  audioScript: string;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isCorrect?: boolean;
  questionText?: DualText;
  choices?: string[];
  answered?: boolean;
  selectedAnswer?: string;
  correctAnswerText?: string;
  whyCorrectIsCorrect?: string;
  userAnswerEvaluation?: string;
  whyOtherOptionsWrong?: string;
  technicalConcept?: string;
  productionPerspective?: string;
  commonMistakes?: string;
  keyLearningPoints?: string;
  countdown?: number;
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
  const [autoProgress, setAutoProgress] = useState(true);

  const voiceFlavors = {
    Aphrodite: { name: 'Aphrodite', pitch: 1.15, description: 'Warm, enchanting Greek goddess' },
    Amba: { name: 'Amba', pitch: 1.1, description: 'Gentle, melodic Indian goddess' },
    Venus: { name: 'Venus', pitch: 1.2, description: 'Elegant, romantic Roman goddess' },
    Ishtar: { name: 'Ishtar', pitch: 1.05, description: 'Strong, confident Babylonian goddess' },
    Freyja: { name: 'Freyja', pitch: 1.12, description: 'Nurturing, wise Norse goddess' }
  };

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

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

    // PREMIUM FEMALE VOICES ONLY - Explicitly filter out male voices
    const femaleVoices = [
      'Samantha', 'Karen', 'Victoria', 'Allison', 'Ava', 'Susan',
      'Moira', 'Tessa', 'Veena', 'Fiona', 'Serena', 'Zira', 'Hazel',
      'Rishi', 'Priya', 'Sangeeta', 'Heera', 'Linda', 'Joanna', 'Amy',
      'Emma', 'Nicole', 'Salli', 'Joey', 'Justin', 'Matthew', 'Ivy',
      'Kimberly', 'Kendra', 'Joanna', 'Ruth', 'Stephen', 'Salli'
    ];

    // First try exact premium female voice matches
    for (const voiceName of femaleVoices) {
      const voice = voices.find(v =>
        v.name.includes(voiceName) &&
        !v.name.toLowerCase().includes('male') &&
        !v.name.toLowerCase().includes('guy') &&
        !v.name.toLowerCase().includes('man')
      );
      if (voice) return voice;
    }

    // Then filter for any female indicator while excluding male
    const femaleIndicators = ['Female', 'Woman', 'Girl', 'Lady'];
    for (const indicator of femaleIndicators) {
      const voice = voices.find(v =>
        v.name.includes(indicator) &&
        !v.name.toLowerCase().includes('male')
      );
      if (voice) return voice;
    }

    // Fallback to Google female-sounding voices
    const googleVoices = voices.filter(v =>
      v.name.includes('Google') &&
      !v.name.toLowerCase().includes('male') &&
      !v.name.toLowerCase().includes('uk english male')
    );
    if (googleVoices.length > 0) return googleVoices[0];

    // Last resort - return first non-male voice
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

  const sanitizeMessageText = (text: string): string => {
    return text
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_{1,2}/g, '')
      .replace(/`{1,3}/g, '')
      .replace(/\s{3,}/g, '\n\n')
      .trim();
  };

  // Initialize female voice on component mount
  React.useEffect(() => {
    const initVoice = async () => {
      const voice = await selectFemaleVoice();
      if (voice) setPreferredVoice(voice);
    };
    initVoice();
  }, []);

  // Speak with promise support - ONLY FEMALE VOICES
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
        utterance.rate = speechRate;
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
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
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

  const handleSkillSubmit = () => {
    if (!input.trim()) return;
    const skill = input.trim();
    setSelectedSkill(skill);

    const welcomeMsg: Message = {
      id: Date.now(),
      text: mode === 'learning'
        ? `🎓 Learning Mode: ${skill}\n\nI'll teach you concepts and interact based on your questions. Ask me anything!`
        : `🎤 Interview Mode: ${skill}\n\nI'll ask you interview questions. Answer each one and I'll provide feedback.`,
      isUser: false
    };
    setMessages(prev => [...prev, welcomeMsg]);
    setInput('');

    if (mode === 'interview') {
      setTimeout(() => askInterviewQuestion(skill), 1000);
    }
  };

  // COMPLETELY REBUILT - INTERVIEW MODE WITH STRICT FEMALE VOICE AND ACCURATE ANSWERS
  const askInterviewQuestion = async (skill: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a realistic technical interview question for ${skill}`,
          context: `INTERVIEW MODE - SENIOR TECHNICAL INTERVIEWER for ${skill}

You are a Senior Staff Engineer conducting a technical interview. Generate ORIGINAL, PRODUCTION-GRADE questions that test real engineering knowledge.

QUESTION REQUIREMENTS:
- Questions from FAANG, Fortune 500, startup interviews
- Cover: Fundamentals, Advanced concepts, Production issues, Troubleshooting, Architecture
- Include: Specific commands, APIs, configurations, exact syntax
- Never repeat questions - always generate unique content
- Test: Core concepts, Best practices, Common pitfalls, Real scenarios

FORMAT EXACTLY:
QUESTION: [Clear, specific interview question]
OPTIONS:
1) [Specific technical answer with exact syntax]
2) [Specific technical answer with exact syntax]
3) [Specific technical answer with exact syntax]
4) [Specific technical answer with exact syntax]
CORRECT: [1-4]

Generate questions about: Linux, Networking, Cloud, Kubernetes, CI/CD, Databases, Security, Performance, Scalability, Monitoring, Logging, Disaster Recovery, High Availability, Infrastructure as Code, Cost Optimization, Design Decisions, Common Mistakes, Production Outages, Root Cause Analysis, Debugging, Architecture Trade-offs`,
          skill: skill,
          mode: 'interview_question'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const sanitizedResponse = sanitizeMessageText(data.response);

        const questionMatch = sanitizedResponse.match(/QUESTION:\s*([^\n]+)/i);
        const optionsMatch = sanitizedResponse.match(/OPTIONS:\s*([\s\S]*?)(?=CORRECT:|$)/i);
        const correctMatch = sanitizedResponse.match(/CORRECT:\s*(\d)/i);

        const question = questionMatch ? questionMatch[1].trim() : '';
        const optionsText = optionsMatch ? optionsMatch[1].trim() : '';
        const correctIndex = correctMatch ? parseInt(correctMatch[1]) - 1 : 0;

        const options = optionsText.match(/\d+\)\s*([^\n]+)/g)?.map(o => o.replace(/^\d+\)\s*/, '')) || [];

        const questionDual: DualText = {
          displayText: question,
          audioScript: question
            .replace(/API/g, 'A P I')
            .replace(/URL/g, 'U R L')
            .replace(/AWS/g, 'A W S')
            .replace(/CI\/CD/g, 'C I and C D')
            .replace(/\/\//g, ' slash slash ')
            .replace(/\//g, ' slash ')
            .replace(/_/g, ' underscore ')
            .replace(/-/g, ' dash ')
        };

        const questionMsg: Message = {
          id: Date.now(),
          text: sanitizedResponse,
          isUser: false,
          questionText: questionDual,
          choices: options.length > 0 ? options : undefined,
          correctAnswerText: options[correctIndex] || ''
        };

        setMessages(prev => [...prev, questionMsg]);
        setAwaitingAnswer(true);

        // Voice-led interview flow: Read question, options, then prompt
        const narrationText = `${question}. Options: ${options.map((o, i) => `Option ${i + 1}: ${o}`).join('. ')}. Please select the answer you believe is most appropriate.`;
        await speak(narrationText, 0.85);
      }
    } catch (error) {
      console.error('Error generating interview question:', error);
    }

    setIsLoading(false);
  };

  // Handle answer with comprehensive 8-section educational feedback
  const handleAnswer = async (answer: string) => {
    if (!selectedSkill || !awaitingAnswer) return;

    setMessages(prev => prev.map(msg => {
      if (msg.choices && !msg.answered) {
        return { ...msg, answered: true, selectedAnswer: answer };
      }
      return msg;
    }));

    const userMsg: Message = {
      id: Date.now(),
      text: `Your answer: ${answer}`,
      isUser: true
    };
    setMessages(prev => [...prev, userMsg]);
    setAwaitingAnswer(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `User selected: ${answer}`,
          context: `INTERVIEW MODE FEEDBACK - Provide comprehensive educational feedback

Previous question context is in the system. User's answer: ${answer}

MANDATORY 8-SECTION RESPONSE FORMAT:
1. correctAnswerText: [The exact correct answer text]
2. whyCorrectIsCorrect: [Why this answer is technically correct - include underlying concept, engineering principles]
3. userAnswerEvaluation: [Evaluate user's selection - why correct or why wrong]
4. whyOtherOptionsWrong: [Explain why EVERY incorrect option is wrong - technical reasons]
5. technicalConcept: [The core technical concept being tested - fundamentals, mechanics]
6. productionPerspective: [Production implications, real-world examples, operational impact]
7. commonMistakes: [Common engineering mistakes, interview traps, gotchas]
8. keyLearningPoints: [Key takeaways, tips, tricks, shortcuts, certification insights, interview expectations]

Ensure 100% technical accuracy. No hallucination. Real commands, APIs, and concepts only.`,
          skill: selectedSkill,
          mode: 'interview_feedback'
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Try to parse structured feedback
        let structuredFeedback: any = null;
        try {
          const jsonMatch = data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            structuredFeedback = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.log('Could not parse JSON feedback');
        }

        const lastQuestionMsg = [...messages].reverse().find(m => m.choices);
        const isAnswerCorrect = lastQuestionMsg?.correctAnswerText === answer;

        if (structuredFeedback && structuredFeedback.correctAnswerText) {
          const feedbackMsg: Message = {
            id: Date.now() + 1,
            text: isAnswerCorrect
              ? `✅ Correct! ${structuredFeedback.correctAnswerText}`
              : `❌ Incorrect. The correct answer is: ${structuredFeedback.correctAnswerText}`,
            isUser: false,
            isCorrect: isAnswerCorrect,
            correctAnswerText: structuredFeedback.correctAnswerText,
            whyCorrectIsCorrect: structuredFeedback.whyCorrectIsCorrect,
            userAnswerEvaluation: structuredFeedback.userAnswerEvaluation,
            whyOtherOptionsWrong: structuredFeedback.whyOtherOptionsWrong,
            technicalConcept: structuredFeedback.technicalConcept,
            productionPerspective: structuredFeedback.productionPerspective,
            commonMistakes: structuredFeedback.commonMistakes,
            keyLearningPoints: structuredFeedback.keyLearningPoints
          };

          setMessages(prev => [...prev, feedbackMsg]);

          // Correct Answer Flow
          if (isAnswerCorrect) {
            await speak("Correct. Excellent job.", 0.9);
            const explanationText = `${structuredFeedback.whyCorrectIsCorrect}. ${structuredFeedback.technicalConcept}. ${structuredFeedback.productionPerspective}`;
            await speak(explanationText, 0.85);
          } else {
            // Incorrect Answer Flow
            await speak("That answer is incorrect.", 0.9);
            await speak(`The correct answer is ${structuredFeedback.correctAnswerText}.`, 0.85);
            const explanationText = `${structuredFeedback.whyCorrectIsCorrect}. ${structuredFeedback.userAnswerEvaluation}. ${structuredFeedback.whyOtherOptionsWrong}. ${structuredFeedback.commonMistakes}`;
            await speak(explanationText, 0.85);
          }

          // Automatic Progression
          if (autoProgress && selectedSkill) {
            startCountdown(selectedSkill);
          }
        }
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }

    setIsLoading(false);
    setInput('');
  };

  // Countdown and Automatic Progression
  const startCountdown = (skill: string) => {
    let countdown = 5;

    const updateCountdown = (value: number) => {
      setMessages(prev => {
        const updated = [...prev];
        const lastFeedback = updated[updated.length - 1];
        if (lastFeedback && !lastFeedback.isUser) {
          lastFeedback.countdown = value;
        }
        return updated;
      });
    };

    updateCountdown(countdown);

    countdownRef.current = setInterval(() => {
      countdown--;
      updateCountdown(countdown);

      if (countdown <= 0) {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        stopSpeaking(); // Cancel any queued speech
        askInterviewQuestion(skill);
      }
    }, 1000);
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
          context: `LEARNING MODE: Interactive teaching session for ${selectedSkill}.`,
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
        speak(data.response, 0.85);
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

  const resetCoach = () => {
    stopSpeaking();
    setMessages([{ id: 0, text: "🎙️ Welcome to Voice Coach!\n\nChoose a mode and enter your skill to begin.", isUser: false }]);
    setSelectedSkill(null);
    setInput('');
    setAwaitingAnswer(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
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
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30">
                  {mode === 'learning' ? '🎓' : '🎤'} {mode === 'learning' ? 'Learning' : 'Interview'}: <span className="font-bold">{selectedSkill}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoProgress}
                    onChange={(e) => setAutoProgress(e.target.checked)}
                    className="text-primary"
                  />
                  Auto-advance
                </label>
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
                  <div className={`max-w-[85%] p-4 rounded-2xl ${msg.isUser ? 'bg-primary/20 border border-primary/30' : msg.isCorrect !== undefined ? (msg.isCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30') : 'bg-white/10 border border-white/20'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {(msg.questionText?.displayText) || sanitizeMessageText(msg.text)}
                    </p>

                    {/* 8-Section Educational Feedback Display */}
                    {!msg.isUser && msg.correctAnswerText && (
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="font-medium text-lg">{msg.isCorrect ? '✅ Correct' : '❌ Incorrect'}</div>

                        <div className="bg-white/5 rounded p-3">
                          <div className="text-xs text-white/50 mb-1">CORRECT ANSWER</div>
                          <div>{msg.correctAnswerText}</div>
                        </div>

                        {msg.whyCorrectIsCorrect && (
                          <div className="bg-white/5 rounded p-3">
                            <div className="text-xs text-white/50 mb-1">WHY THIS IS CORRECT</div>
                            <div>{msg.whyCorrectIsCorrect}</div>
                          </div>
                        )}

                        {msg.userAnswerEvaluation && (
                          <div className="bg-white/5 rounded p-3">
                            <div className="text-xs text-white/50 mb-1">YOUR ANSWER</div>
                            <div>{msg.userAnswerEvaluation}</div>
                          </div>
                        )}

                        {msg.whyOtherOptionsWrong && (
                          <div className="bg-white/5 rounded p-3">
                            <div className="text-xs text-white/50 mb-1">WHY OTHER OPTIONS ARE WRONG</div>
                            <div>{msg.whyOtherOptionsWrong}</div>
                          </div>
                        )}

                        {msg.technicalConcept && (
                          <div className="bg-white/5 rounded p-3">
                            <div className="text-xs text-white/50 mb-1">TECHNICAL CONCEPT</div>
                            <div>{msg.technicalConcept}</div>
                          </div>
                        )}

                        {msg.productionPerspective && (
                          <div className="bg-white/5 rounded p-3">
                            <div className="text-xs text-white/50 mb-1">PRODUCTION PERSPECTIVE</div>
                            <div>{msg.productionPerspective}</div>
                          </div>
                        )}

                        {msg.commonMistakes && (
                          <div className="bg-white/5 rounded p-3">
                            <div className="text-xs text-white/50 mb-1">COMMON MISTAKES</div>
                            <div>{msg.commonMistakes}</div>
                          </div>
                        )}

                        {msg.keyLearningPoints && (
                          <div className="bg-white/5 rounded p-3">
                            <div className="text-xs text-white/50 mb-1">KEY LEARNING POINTS</div>
                            <div>{msg.keyLearningPoints}</div>
                          </div>
                        )}

                        {msg.countdown !== undefined && msg.countdown > 0 && (
                          <div className="text-center text-primary font-medium">Next question in {msg.countdown}...</div>
                        )}
                      </div>
                    )}

                    {/* MCQ Options */}
                    {mode === 'interview' && !msg.isUser && msg.choices && (
                      <div className="mt-4 space-y-2">
                        {msg.choices.map((choice, index) => {
                          const isAnswered = msg.answered === true;
                          const isSelected = msg.selectedAnswer === choice;
                          const isCorrect = isAnswered && msg.correctAnswerText === choice;

                          return (
                            <label key={index} className={`flex items-center gap-2 p-2 rounded-lg ${isAnswered ? isCorrect ? 'bg-green-500/20 border border-green-500/50' : isSelected ? 'bg-red-500/20 border border-red-500/50' : 'bg-white/5' : 'bg-white/5 hover:bg-white/10 cursor-pointer'}`}>
                              <input type="radio" name={`interview-answer-${msg.id}`} value={choice} checked={isSelected} onChange={(e) => !isAnswered && handleAnswer(e.target.value)} disabled={isAnswered} />
                              <span className="text-sm">{index + 1}. {choice} {isAnswered && isCorrect && " ✓"} {isAnswered && isSelected && !isCorrect && " ✗"}</span>
                            </label>
                          );
                        })}
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
                    else if (awaitingAnswer) handleAnswer(input);
                  }
                }}
                placeholder={mode === 'learning' ? "Ask a question..." : awaitingAnswer ? "Type your answer..." : "Waiting for next question..."}
                disabled={mode === 'interview' && !awaitingAnswer}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none disabled:opacity-50"
              />
              <button
                onClick={() => {
                  if (mode === 'learning') handleLearningMessage();
                  else if (awaitingAnswer) handleAnswer(input);
                }}
                disabled={!input.trim() || isLoading || (mode === 'interview' && !awaitingAnswer)}
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
