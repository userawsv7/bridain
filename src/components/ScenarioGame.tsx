'use client';

import React, { useState, useRef } from 'react';
import { Send, Loader2, Trophy, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  type?: 'scenario' | 'choices';
  choices?: string[];
  selectedAnswer?: number;
  correctAnswer?: number;
  isCorrect?: boolean;
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

export function ScenarioGame() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "🎮 Welcome to Scenario Game!\n\nAn intelligent learning game where you'll face real-world scenarios and make decisions.\n\nWhat skill would you like to practice?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  const [selectedVoiceFlavor, setSelectedVoiceFlavor] = useState('Aphrodite');
  const [speechRate, setSpeechRate] = useState(0.85);
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
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

  // FEMALE-ONLY VOICE SELECTION - Explicitly rejects male voices
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

    // First try exact premium female voice matches (reject male)
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

    // Fallback to Google female-sounding voices (reject male)
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
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Initialize female voice
  React.useEffect(() => {
    const initVoice = async () => {
      await selectFemaleVoice();
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
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = rate;
        utterance.pitch = voiceFlavors[selectedVoiceFlavor as keyof typeof voiceFlavors].pitch;
        utterance.volume = 0.85;
        utterance.voice = voiceToUse || null;

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

  const parseScenario = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());

    let scenarioText = text;
    const choiceStartIndex = lines.findIndex(l => /^\d[\)\.\-]/.test(l.trim()));
    if (choiceStartIndex > 0) {
      scenarioText = lines.slice(0, choiceStartIndex).join(' ').replace(/SCENARIO:?/i, '').trim();
    }

    let choiceLines = lines.filter(l => /^\d[\)\.\-]/.test(l.trim()));
    if (choiceLines.length === 0) {
      choiceLines = lines.filter(l => /^\d+\s/.test(l.trim()) && l.length > 5);
    }

    const correctMatch = text.match(/CORRECT:\s*(\d)/i);
    if (correctMatch) {
      setCorrectAnswerIndex(parseInt(correctMatch[1]));
    } else {
      const altMatch = text.match(/option\s*(\d)\s*(is\s*)?correct/i);
      if (altMatch) {
        setCorrectAnswerIndex(parseInt(altMatch[1]));
      } else {
        setCorrectAnswerIndex(1);
      }
    }

    const finalChoices = choiceLines.length >= 4
      ? choiceLines.slice(0, 4).map(c => c.replace(/^\d[\)\.\-]\s*/, ''))
      : choiceLines.length > 0
        ? choiceLines.map(c => c.replace(/^\d[\)\.\-]\s*/, ''))
        : ['Check logs immediately', 'Restart the service', 'Scale up resources', 'Review recent changes'];

    return {
      scenario: scenarioText || 'A technical issue has occurred in your system.',
      choices: finalChoices.length > 0 ? finalChoices : ['Check logs immediately', 'Restart the service', 'Scale up resources', 'Review recent changes']
    };
  };

  const handleSkillSubmit = () => {
    if (!input.trim()) return;
    const skill = input.trim();
    setSelectedSkill(skill);

    const welcomeMsg: Message = {
      id: Date.now(),
      text: `🎯 Perfect! Let's practice ${skill} scenarios.\n\nI'll present you with:\n• Real day-to-day work challenges\n• Common struggles and issues\n• Decision scenarios with multiple paths\n• Instant feedback with explanations\n\nReady to begin?`,
      isUser: false
    };
    setMessages(prev => [...prev, welcomeMsg]);
    setInput('');
    setGameStarted(true);

    setTimeout(() => generateScenario(skill), 1000);
  };

  // NEW COMPREHENSIVE SCENARIO GENERATION - Professional Interviewer Style
  const generateScenario = async (skill: string, previousChoice?: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a realistic production scenario for ${skill}`,
          context: `SCENARIO GAME - SENIOR TECHNICAL MENTOR for ${skill}

You are a Senior Staff Engineer creating realistic production scenarios. Generate ORIGINAL, PRODUCTION-GRADE scenarios that test real engineering decision-making.

SCENARIO REQUIREMENTS:
- Based on REAL production incidents, outages, debugging sessions
- Cover: Troubleshooting, Root Cause Analysis, Architecture, Design Decisions
- Include: Specific commands, APIs, configurations, exact syntax
- Never repeat - always generate unique scenarios
- Test: Core concepts, Best practices, Common pitfalls, Real scenarios

FORMAT EXACTLY:
SCENARIO: [Clear, specific production problem with technical details]
1) [Specific technical action with exact syntax]
2) [Specific technical action with exact syntax]
3) [Specific technical action with exact syntax]
4) [Specific technical action with exact syntax]
CORRECT: [1-4]

Generate scenarios about: Linux, Networking, Cloud, Kubernetes, CI/CD, Databases, Security, Performance, Scalability, Monitoring, Logging, Disaster Recovery, High Availability, Infrastructure as Code, Cost Optimization, Common Mistakes, Production Outages, Root Cause Analysis, Debugging`,
          skill: skill,
          mode: 'scenario_game'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = parseScenario(data.response);

        let scenarioText = parsed.scenario
          .replace(/CORRECT:\s*\d/i, '')
          .replace(/\*/g, '')
          .replace(/#{1,6}\s*/g, '')
          .trim();

        const scenarioMsg: Message = {
          id: Date.now(),
          text: scenarioText,
          isUser: false,
          type: 'scenario'
        };

        const choicesMsg: Message = {
          id: Date.now() + 1,
          text: 'Choose your response:',
          isUser: false,
          type: 'choices',
          choices: parsed.choices
        };

        setCurrentChoices(parsed.choices);
        setMessages(prev => [...prev, scenarioMsg, choicesMsg]);

        // Voice-led interview flow: Read scenario, options, then prompt
        const narrationText = `${scenarioText}. Options: ${parsed.choices.map((c, i) => `Option ${i + 1}: ${c}`).join('. ')}. Please review the options and select the answer you believe is most appropriate.`;
        await speak(narrationText, 0.85);
      }
    } catch (error) {
      console.error('Error generating scenario:', error);
    }

    setIsLoading(false);
  };

  // Countdown and Automatic Progression
  const startCountdown = (skill: string) => {
    let countdown = 5;

    const updateCountdown = (value: number) => {
      setMessages(prev => {
        const updated = [...prev];
        const lastFeedback = updated[updated.length - 1];
        if (lastFeedback && !lastFeedback.isUser && lastFeedback.selectedAnswer !== undefined) {
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
        stopSpeaking();
        if (skill) generateScenario(skill);
      }
    }, 1000);
  };

  const handleChoice = async (choiceIndex: number, choiceText: string) => {
    const userMsg: Message = {
      id: Date.now(),
      text: `Selected option ${choiceIndex + 1}: ${choiceText}`,
      isUser: true
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const isCorrect = (choiceIndex + 1) === correctAnswerIndex;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `User selected option ${choiceIndex + 1}: ${choiceText}`,
          context: `SCENARIO GAME FEEDBACK - Provide comprehensive educational feedback

User selected: Option ${choiceIndex + 1}
Correct answer: Option ${correctAnswerIndex}

MANDATORY 8-SECTION RESPONSE FORMAT:
1. correctAnswerText: [The exact correct answer text]
2. whyCorrectIsCorrect: [Why this answer is technically correct - underlying concept, engineering principles]
3. userAnswerEvaluation: [Evaluate user's selection - why correct or why wrong]
4. whyOtherOptionsWrong: [Explain why EVERY incorrect option is wrong - technical reasons]
5. technicalConcept: [The core technical concept being tested]
6. productionPerspective: [Production implications, real-world examples, operational impact]
7. commonMistakes: [Common engineering mistakes, interview traps, gotchas]
8. keyLearningPoints: [Key takeaways, tips, tricks, shortcuts, certification insights]

Ensure 100% technical accuracy. No hallucination. Real commands, APIs, and concepts only.`,
          skill: selectedSkill,
          mode: 'scenario_feedback'
        })
      });

      if (response.ok) {
        const data = await response.json();

        let structuredFeedback: any = null;
        try {
          const jsonMatch = data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            structuredFeedback = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.log('Could not parse JSON feedback');
        }

        const correctChoiceText = correctAnswerIndex !== null
          ? currentChoices[correctAnswerIndex - 1] || `Option ${correctAnswerIndex}`
          : `Option ${correctAnswerIndex}`;

        if (structuredFeedback && structuredFeedback.correctAnswerText) {
          const feedbackMsg: Message = {
            id: Date.now() + 1,
            text: isCorrect
              ? `✅ Correct! ${structuredFeedback.correctAnswerText}`
              : `❌ Incorrect. The correct answer is: ${structuredFeedback.correctAnswerText}`,
            isUser: false,
            selectedAnswer: choiceIndex,
            correctAnswer: correctAnswerIndex !== null ? correctAnswerIndex - 1 : 0,
            isCorrect: isCorrect,
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

          // Voice-guided feedback
          if (isCorrect) {
            await speak("Correct. Excellent job.", 0.9);
            const explanationText = `${structuredFeedback.whyCorrectIsCorrect}. ${structuredFeedback.technicalConcept}. ${structuredFeedback.productionPerspective}`;
            await speak(explanationText, 0.85);
          } else {
            await speak("That answer is incorrect.", 0.9);
            await speak(`The correct answer is ${structuredFeedback.correctAnswerText}.`, 0.85);
            const explanationText = `${structuredFeedback.whyCorrectIsCorrect}. ${structuredFeedback.userAnswerEvaluation}. ${structuredFeedback.whyOtherOptionsWrong}. ${structuredFeedback.commonMistakes}`;
            await speak(explanationText, 0.85);
          }

          // Auto-progression
          if (autoProgress && selectedSkill) {
            startCountdown(selectedSkill);
          }
        }
      }
    } catch (error) {
      console.error('Error handling choice:', error);
    }

    if (isCorrect) {
      setScore(prev => prev + 10);
    }

    setIsLoading(false);
  };

  const resetGame = () => {
    stopSpeaking();
    setMessages([{ id: 0, text: "🎮 Welcome to Scenario Game!\n\nAn intelligent learning game where you'll face real-world scenarios and make decisions.\n\nWhat skill would you like to practice?", isUser: false }]);
    setSelectedSkill(null);
    setGameStarted(false);
    setScore(0);
    setInput('');
    setCorrectAnswerIndex(null);
    setIsMuted(false);
    setCurrentChoices([]);
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
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Scenario Game</h3>
              <p className="text-white/60">Decision-based learning adventures</p>
            </div>
          </div>
          {gameStarted && (
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                Score: <span className="font-bold text-accent">{score}</span>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={autoProgress} onChange={(e) => setAutoProgress(e.target.checked)} className="text-primary" />
                Auto-advance
              </label>
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

        {!gameStarted ? (
          <div className="space-y-4">
            <p className="text-lg">What skill would you like to practice with scenarios?</p>
            <div className="flex gap-3">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSkillSubmit()} placeholder="Enter any skill (Docker, React, AWS, etc.)" className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none" />
              <button onClick={handleSkillSubmit} disabled={!input.trim()} className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50 font-medium">Start Game</button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 inline-block">
              🎮 Playing: <span className="font-bold">{selectedSkill}</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 h-[500px] overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${msg.isUser ? 'bg-primary/20 border border-primary/30' : 'bg-white/10 border border-white/20'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {/* MCQ Options */}
                    {(msg.type === 'choices' || msg.choices) && msg.choices && (
                      <div className="mt-4 space-y-2">
                        {msg.choices.map((choice, idx) => {
                          let choiceStyle = "w-full text-left p-3 rounded-xl border transition-all ";

                          if (msg.selectedAnswer !== undefined) {
                            choiceStyle += "cursor-not-allowed ";
                            if (idx === msg.selectedAnswer) {
                              choiceStyle += msg.isCorrect ? "bg-green-500/20 border-green-500/50 text-white" : "bg-red-500/20 border-red-500/50 text-white";
                            } else if (idx === msg.correctAnswer && !msg.isCorrect) {
                              choiceStyle += "bg-green-500/20 border-green-500/50 text-white";
                            } else {
                              choiceStyle += "bg-white/5 border-white/20 opacity-60";
                            }
                          } else {
                            choiceStyle += "bg-white/5 border-white/20 hover:bg-white/10 hover:border-primary/50";
                          }

                          return (
                            <button key={idx} onClick={() => msg.selectedAnswer === undefined && handleChoice(idx, choice)} disabled={msg.selectedAnswer !== undefined} className={choiceStyle}>
                              <span className="font-medium mr-2">{idx + 1}.</span> {choice}
                              {msg.selectedAnswer !== undefined && idx === msg.selectedAnswer && msg.isCorrect && <span className="ml-2 text-green-400">✓</span>}
                              {msg.selectedAnswer !== undefined && idx === msg.selectedAnswer && !msg.isCorrect && <span className="ml-2 text-red-400">✗</span>}
                              {msg.selectedAnswer !== undefined && idx === msg.correctAnswer && !msg.isCorrect && <span className="ml-2 text-green-400">✓ Correct</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* 8-Section Educational Feedback Display */}
                    {msg.selectedAnswer !== undefined && msg.correctAnswer !== undefined && !msg.choices && (
                      <div className="mt-4">
                        <div className={`p-4 rounded-xl border ${msg.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                          <div className="font-medium text-lg mb-2">{msg.isCorrect ? '✅ Correct' : '❌ Incorrect'}</div>
                        </div>

                        <div className="mt-4 space-y-3 text-sm">
                          {msg.correctAnswerText && (
                            <div className="bg-white/5 rounded p-3">
                              <div className="text-xs text-white/50 mb-1">CORRECT ANSWER</div>
                              <div>{msg.correctAnswerText}</div>
                            </div>
                          )}

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
                            <div className="text-center text-primary font-medium">Next scenario in {msg.countdown}...</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && <div className="flex justify-start"><div className="p-4 rounded-2xl bg-white/10"><Loader2 className="w-5 h-5 animate-spin" /></div></div>}
              {isSpeaking && <div className="flex justify-start"><div className="p-2 rounded-xl bg-primary/20"><Volume2 className="w-4 h-4 animate-pulse" /></div></div>}
            </div>

            <div className="flex gap-3">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => { if (e.key === 'Enter' && gameStarted) { /* disabled for scenarios */ } }} placeholder="Scenarios use voice-guided multiple choice" disabled={true} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none opacity-50" />
              <button disabled className="p-3 rounded-xl bg-white/10 opacity-50"><Send className="w-5 h-5" /></button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
