'use client';

import React, { useState, useRef } from 'react';

// Extend Window interface for WHY_CORRECT explanation
declare global {
  interface Window {
    whyCorrectExplanation: string | null;
  }
}
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
  explanation?: string;
  isCorrect?: boolean;
  // Legacy 6-section feedback fields
  coreExplanation?: string;
  whyOthersWrong?: string;
  productionReasoning?: string;
  consequences?: string;
  bestPractices?: string;
  keyLearning?: string;
  commonPitfall?: string;
  proTip?: string;
  displayText?: string;
  audioScript?: string;
  // New comprehensive 8-section educational feedback fields
  correctAnswerText?: string;
  whyCorrectIsCorrect?: string;
  userAnswerEvaluation?: string;
  whyOtherOptionsWrong?: string;
  technicalConcept?: string;
  productionPerspective?: string;
  commonMistakes?: string;
  keyLearningPoints?: string;
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

  const voiceFlavors = {
    Aphrodite: { name: 'Aphrodite', pitch: 1.15, description: 'Warm, enchanting Greek goddess' },
    Amba: { name: 'Amba', pitch: 1.1, description: 'Gentle, melodic Indian goddess' },
    Venus: { name: 'Venus', pitch: 1.2, description: 'Elegant, romantic Roman goddess' },
    Ishtar: { name: 'Ishtar', pitch: 1.05, description: 'Strong, confident Babylonian goddess' },
    Freyja: { name: 'Freyja', pitch: 1.12, description: 'Nurturing, wise Norse goddess' }
  };

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const selectFemaleVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Look for female voices with different flavors
    return voices.find(v => v.name.includes('Female') || v.name.includes('Karen') || v.name.includes('Samantha') || v.name.includes('Victoria')) ||
           voices.find(v => v.name.includes('Google')) ||
           voices[0];
  };

  const sanitizeForTTS = (text: string): string => {
    return text
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers
      .replace(/\*\*{1,2}/g, '') // Remove bold markers
      .replace(/\*{1,2}/g, '') // Remove remaining asterisks
      .replace(/[`_]/g, '') // Remove code/underscore markers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '') // Remove emojis
      .trim();
  };

  const sanitizeMessageText = (text: string): string => {
    return sanitizeForTTS(text);
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

    // Then try any female voice indicators - strictly female only
    const femaleIndicators = ['Female', 'Woman', 'Girl', 'Lady', 'WOMAN', 'FEMALE'];
    for (const indicator of femaleIndicators) {
      const voice = voices.find(v => v.name.includes(indicator));
      if (voice) return voice;
    }

    // Look for any voice that contains common female name patterns
    const commonFemaleVoices = voices.filter(v =>
      v.name.toLowerCase().includes('alice') ||
      v.name.toLowerCase().includes('emma') ||
      v.name.toLowerCase().includes('olivia') ||
      v.name.toLowerCase().includes('sophia') ||
      v.name.toLowerCase().includes('isabella') ||
      v.name.toLowerCase().includes('mary') ||
      v.name.toLowerCase().includes('patricia') ||
      v.name.toLowerCase().includes('jennifer') ||
      v.name.toLowerCase().includes('linda') ||
      v.name.toLowerCase().includes('barbara')
    );
    if (commonFemaleVoices.length > 0) return commonFemaleVoices[0];

    // Fallback to Google female voices specifically
    const googleFemale = voices.find(v => v.name.includes('Google') && v.name.toLowerCase().includes('female'));
    if (googleFemale) return googleFemale;

    // Last resort: use any voice with explicitly female gender info if available
    const anyVoice = voices.find(v => v.name.toLowerCase().includes('en') && !v.name.toLowerCase().includes('male'));
    return anyVoice || voices.find(v => v.name.includes('Google')) || voices[0];
  };

  // Update speech synthesis whenever rate or voice changes
  React.useEffect(() => {
    if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Stop current speech and restart with new settings
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [speechRate, selectedVoiceFlavor]);

  const speak = (text: string, rate?: number, onComplete?: () => void) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Clean text for pleasant TTS experience
    const cleanText = sanitizeForTTS(text);

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate !== undefined ? rate : speechRate; // Use current rate dynamically
    utterance.pitch = voiceFlavors[selectedVoiceFlavor as keyof typeof voiceFlavors].pitch;
    utterance.volume = 0.85; // Pleasant volume level

    // Ensure strict female voice selection
    const femaleVoice = selectPreferredFemaleVoice();
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onComplete) setTimeout(onComplete, 100); // Small delay to ensure complete
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onComplete) setTimeout(onComplete, 100);
    };

    utteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleMute = () => {
    if (!isMuted) {
      stopSpeaking();
    }
    setIsMuted(!isMuted);
  };

  const parseScenario = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());

    // Get the full scenario text - everything before the choices
    let scenarioText = text;
    const choiceStartIndex = lines.findIndex(l => /^\d[\)\.\-]/.test(l.trim()));
    if (choiceStartIndex > 0) {
      scenarioText = lines.slice(0, choiceStartIndex).join(' ').replace(/SCENARIO:?/i, '').trim();
    } else {
      scenarioText = lines[0] || text;
    }

    // Try different formats for choices: "1)" or "1." or "1 -"
    let choiceLines = lines.filter(l => /^\d[\)\.\-]/.test(l.trim()));

    // If no choices found with prefix, look for numbered items differently
    if (choiceLines.length === 0) {
      // Look for lines that start with a number
      choiceLines = lines.filter(l => /^\d+\s/.test(l.trim()) && l.length > 5);
    }

    // Extract correct answer if provided
    const correctMatch = text.match(/CORRECT:\s*(\d)/i);
    if (correctMatch) {
      setCorrectAnswerIndex(parseInt(correctMatch[1]));
    } else {
      // Try to find "option X is correct" type patterns
      const altMatch = text.match(/option\s*(\d)\s*(is\s*)?correct/i);
      if (altMatch) {
        setCorrectAnswerIndex(parseInt(altMatch[1]));
      } else {
        // Default to option 1 if not specified
        setCorrectAnswerIndex(1);
      }
    }

    // Extract WHY_CORRECT explanation
    const whyCorrectMatch = text.match(/WHY_CORRECT:\s*([^\n]+(?:\n(?![A-Z]+:)[^\n]+)*)/i);
    if (whyCorrectMatch) {
      window.whyCorrectExplanation = whyCorrectMatch[1].trim();
    } else {
      window.whyCorrectExplanation = null;
    }

    // Ensure we have 4 choices
    const finalChoices = choiceLines.length >= 4
      ? choiceLines.slice(0, 4).map(c => c.replace(/^\d[\)\.\-]\s*/, '')) // Remove the number prefix
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

  const generateScenario = async (skill: string, previousChoice?: string) => {
    setIsLoading(true);

    try {
      const context = previousChoice
        ? `Continue the ${skill} scenario game. Previous choice was: ${previousChoice}. Generate the next scenario based on this decision.`
        : `Start a new ${skill} scenario game. Generate a realistic day-to-day work scenario that ${skill} practitioners face.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a REAL ${skill}-specific scenario game question about ${skill}.`,
          context: `SCENARIO GAME MODE for ${skill}:

${context}

Create engaging, realistic scenarios that feel like actual work situations. Each scenario should:
1. Present a specific problem or situation
2. Give 4 distinct choices with different approaches
3. Make it educational and fun

Include the CORRECT answer number as: CORRECT: [number]`,
          skill: skill,
          mode: 'scenario_game'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data.response); // Debug log
        const parsed = parseScenario(data.response);
        console.log('Parsed:', parsed); // Debug log

        // Ensure we have content to show - sanitize special characters
        let scenarioText = (parsed.scenario || data.response || 'A technical scenario for you to solve:')
          .replace(/CORRECT:\s*\d/i, '')
          .replace(/\*/g, '') // Remove asterisks
          .replace(/#{1,6}\s*/g, '') // Remove markdown headers
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

        // Speak the scenario
        speak(scenarioText, 0.85);
      }
    } catch (error) {
      console.log('Error in scenario generation:', error);
      // Fallback scenario with correct answer = 1 (first option is typically best)
      setCorrectAnswerIndex(1);
      const fallbackChoices = [
        'Check the logs immediately to see what\'s happening',
        'Restart the service to see if it resolves the issue',
        'Scale up resources assuming it\'s a capacity problem',
        'Check if there were any recent deployments or changes'
      ];

      const scenarioMsg: Message = {
        id: Date.now(),
        text: `Your ${skill} system is acting up in production. Users are reporting issues and the monitoring alerts are firing.`,
        isUser: false,
        type: 'scenario'
      };

      const choicesMsg: Message = {
        id: Date.now() + 1,
        text: 'Choose your response:',
        isUser: false,
        type: 'choices',
        choices: fallbackChoices
      };

      setMessages(prev => [...prev, scenarioMsg, choicesMsg]);
      speak(`Your ${skill} system is acting up in production`, 0.85);
    }

    setIsLoading(false);
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
          message: `User chose option ${choiceIndex + 1}: ${choiceText}. The correct answer is option ${correctAnswerIndex}.`,
          context: `SCENARIO GAME FEEDBACK MODE for ${selectedSkill}:

User selected option ${choiceIndex + 1}, correct answer was option ${correctAnswerIndex}.
${isCorrect ? 'User was correct!' : 'User was wrong.'}

Provide comprehensive educational feedback following the mandatory format with all 8 required sections.`,
          skill: selectedSkill,
          mode: 'scenario_feedback',
          previousChoice: choiceText
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Try to parse JSON response from LLM
        let structuredFeedback: any = null;
        try {
          const jsonMatch = data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            structuredFeedback = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.log('Could not parse JSON feedback:', e);
        }

        // Get actual choice texts
        const correctChoiceText = correctAnswerIndex !== null
          ? currentChoices[correctAnswerIndex - 1] || `Option ${correctAnswerIndex}`
          : `Option ${correctAnswerIndex}`;

        // Create feedback message with comprehensive 8-section educational feedback
        // Use WHY_CORRECT from scenario OR from feedback response
        const whyCorrectExplanation = window.whyCorrectExplanation || structuredFeedback?.whyCorrectIsCorrect;

        const feedbackMsg: Message = {
          id: Date.now() + 1,
          text: isCorrect
            ? `✅ Correct! ${correctChoiceText}`
            : `❌ Wrong! The correct answer is: ${correctChoiceText}`,
          isUser: false,
          selectedAnswer: choiceIndex,
          correctAnswer: correctAnswerIndex !== null ? correctAnswerIndex - 1 : 0,
          isCorrect: isCorrect,
          // Map new 8-section feedback structure - ALWAYS include whyCorrectIsCorrect
          correctAnswerText: structuredFeedback?.correctAnswer || correctChoiceText,
          whyCorrectIsCorrect: whyCorrectExplanation,
          userAnswerEvaluation: structuredFeedback?.userAnswerEvaluation,
          whyOtherOptionsWrong: structuredFeedback?.whyOtherOptionsWrong,
          technicalConcept: structuredFeedback?.technicalConcept,
          productionPerspective: structuredFeedback?.productionPerspective,
          commonMistakes: structuredFeedback?.commonMistakes,
          keyLearningPoints: structuredFeedback?.keyLearningPoints,
          // Keep legacy fields for compatibility
          coreExplanation: structuredFeedback?.coreExplanation || structuredFeedback?.whyCorrectIsCorrect,
          whyOthersWrong: structuredFeedback?.whyOthersWrong || structuredFeedback?.whyOtherOptionsWrong,
          productionReasoning: structuredFeedback?.productionReasoning || structuredFeedback?.productionPerspective,
          consequences: structuredFeedback?.consequences,
          bestPractices: structuredFeedback?.bestPractices,
          keyLearning: structuredFeedback?.keyLearning || structuredFeedback?.keyLearningPoints,
          displayText: structuredFeedback?.displayText,
          audioScript: structuredFeedback?.audioScript,
          choices: currentChoices, // Keep choices visible
          explanation: data.response // fallback
        };

        setMessages(prev => [...prev, feedbackMsg]);

        // Speak using audioScript if available, otherwise use the actual correct answer text
        const speakText = structuredFeedback?.audioScript ||
          (isCorrect ? `Correct! ${correctChoiceText}` : `Wrong. The correct answer is: ${correctChoiceText}`);

        speak(speakText, 0.9, () => {
          // Auto-advance to next scenario only after voice completes
          setTimeout(() => {
            if (selectedSkill) {
              generateScenario(selectedSkill);
            }
          }, 500); // Small delay after audio ends
        });
      }
    } catch (error) {
      const correctChoiceText = correctAnswerIndex !== null
        ? currentChoices[correctAnswerIndex - 1] || `Option ${correctAnswerIndex}`
        : `Option ${correctAnswerIndex}`;
      const fallbackExplanation = isCorrect
        ? "Great decision! This approach works correctly."
        : `${correctChoiceText} is correct because it properly addresses the issue at its source.`;

      const feedbackMsg: Message = {
        id: Date.now() + 1,
        text: isCorrect
          ? `✅ Correct! ${correctChoiceText}`
          : `❌ Wrong! The correct answer is: ${correctChoiceText}`,
        isUser: false,
        selectedAnswer: choiceIndex,
        correctAnswer: correctAnswerIndex !== null ? correctAnswerIndex - 1 : 0,
        isCorrect: isCorrect,
        coreExplanation: fallbackExplanation,
        commonPitfall: "Rushing to apply a fix without understanding the root cause",
        proTip: "Always analyze the situation thoroughly before taking action",
        choices: currentChoices // Keep choices visible
      };

      setMessages(prev => [...prev, feedbackMsg]);
      speak(feedbackMsg.text + ". " + fallbackExplanation, isCorrect ? 0.9 : 0.85, () => {
        // Auto-advance after fallback speech completes
        setTimeout(() => {
          if (selectedSkill) {
            generateScenario(selectedSkill);
          }
        }, 500);
      });
    }

    // Update score
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
    setCorrectAnswerIndex(2);
    setIsMuted(false);
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
              <button onClick={toggleMute} className={`p-2 rounded-xl transition-all ${isMuted ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`} title={isMuted ? "Unmute voice" : "Mute voice"}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button onClick={resetGame} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
                <RotateCcw className="w-4 h-4" />
              </button>
              {/* Voice Controls */}
              <div className="flex items-center gap-2 ml-2">
                <select
                  value={selectedVoiceFlavor}
                  onChange={(e) => setSelectedVoiceFlavor(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs"
                >
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
                    onChange={(e) => {
                      const newRate = parseFloat(e.target.value);
                      setSpeechRate(newRate);
                      // If currently speaking, restart with new rate
                      if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        // Re-speak current text with new rate (handled by useEffect)
                      }
                    }}
                    className="w-16"
                  />
                  <span className="text-xs w-8">{speechRate.toFixed(1)}x</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {!gameStarted ? (
          <div className="space-y-4">
            <p className="text-lg">What skill would you like to practice with scenarios?</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSkillSubmit()}
                placeholder="Enter any skill (Docker, React, AWS, etc.)"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none"
              />
              <button
                onClick={handleSkillSubmit}
                disabled={!input.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50 font-medium"
              >
                Start Game
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 inline-block">
              🎮 Playing: <span className="font-bold">{selectedSkill}</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 h-[500px] overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl ${msg.isUser ? 'bg-primary/20 border border-primary/30' : 'bg-white/10 border border-white/20'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {/* Choice buttons - always shown, disabled after selection */}
                    {(msg.type === 'choices' || msg.choices) && msg.choices && (
                      <div className="mt-4 space-y-2">
                        {msg.choices.map((choice, idx) => {
                          // Determine styling based on selection state
                          let choiceStyle = "w-full text-left p-3 rounded-xl border transition-all ";

                          if (msg.selectedAnswer !== undefined) {
                            // After selection - disable and color-code
                            choiceStyle += "cursor-not-allowed ";

                            if (idx === msg.selectedAnswer) {
                              // User's selected answer
                              choiceStyle += msg.isCorrect
                                ? "bg-green-500/20 border-green-500/50 text-white"
                                : "bg-red-500/20 border-red-500/50 text-white";
                            } else if (idx === msg.correctAnswer && !msg.isCorrect) {
                              // Correct answer when user was wrong
                              choiceStyle += "bg-green-500/20 border-green-500/50 text-white";
                            } else {
                              // Other unselected choices
                              choiceStyle += "bg-white/5 border-white/20 opacity-60";
                            }
                          } else {
                            // Before selection - hoverable
                            choiceStyle += "bg-white/5 border-white/20 hover:bg-white/10 hover:border-primary/50";
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => msg.selectedAnswer === undefined && handleChoice(idx, choice)}
                              disabled={msg.selectedAnswer !== undefined}
                              className={choiceStyle}
                            >
                              <span className="font-medium mr-2">{idx + 1}.</span> {choice}
                              {msg.selectedAnswer !== undefined && idx === msg.selectedAnswer && msg.isCorrect && (
                                <span className="ml-2 text-green-400">✓</span>
                              )}
                              {msg.selectedAnswer !== undefined && idx === msg.selectedAnswer && !msg.isCorrect && (
                                <span className="ml-2 text-red-400">✗</span>
                              )}
                              {msg.selectedAnswer !== undefined && idx === msg.correctAnswer && !msg.isCorrect && (
                                <span className="ml-2 text-green-400">✓ Correct</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Feedback display showing correct answer - simplified */}
                    {msg.selectedAnswer !== undefined && msg.correctAnswer !== undefined && !msg.choices && (
                      <div className="mt-4">
                        {/* Visual correctness indicator */}
                        <div className={`p-4 rounded-xl border ${msg.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm">
                                <span className="font-medium">Your answer:</span> Option {msg.selectedAnswer + 1}
                                {msg.isCorrect ? (
                                  <span className="ml-2 text-green-400 font-bold">✓ Correct!</span>
                                ) : (
                                  <span className="ml-2 text-red-400 font-bold">✗ Wrong</span>
                                )}
                              </p>
                              {!msg.isCorrect && (
                                <p className="text-sm mt-1">
                                  <span className="font-medium text-green-400">Correct answer:</span> Option {msg.correctAnswer + 1}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Comprehensive 8-section educational feedback */}
                        {(msg.whyCorrectIsCorrect || msg.coreExplanation || msg.userAnswerEvaluation || msg.whyOtherOptionsWrong || msg.whyOthersWrong || msg.technicalConcept || msg.productionPerspective || msg.productionReasoning || msg.commonMistakes || msg.keyLearningPoints || msg.keyLearning) && (
                          <div className="mt-4 space-y-4 p-4 rounded-xl bg-white/5 border border-white/20">

                            {/* Section 1: Correct Answer */}
                            {(msg.correctAnswerText || msg.coreExplanation) && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">✓ CORRECT ANSWER</span>
                                </div>
                                <p className="text-sm text-white/90">{msg.correctAnswerText || msg.coreExplanation}</p>
                              </div>
                            )}

                            {/* Section 2: Why Correct is Correct */}
                            {(msg.whyCorrectIsCorrect || msg.coreExplanation) && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">✓ WHY CORRECT IS CORRECT</span>
                                </div>
                                <p className="text-sm text-white/90">{msg.whyCorrectIsCorrect || msg.coreExplanation}</p>
                              </div>
                            )}

                            {/* Section 3: User Answer Evaluation */}
                            {msg.userAnswerEvaluation && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">🎯 YOUR ANSWER EVALUATION</span>
                                </div>
                                <p className="text-sm text-white/80">{msg.userAnswerEvaluation}</p>
                              </div>
                            )}

                            {/* Section 4: Why Other Options are Wrong */}
                            {(msg.whyOtherOptionsWrong || msg.whyOthersWrong) && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">✗ WHY OTHER OPTIONS ARE WRONG</span>
                                </div>
                                <p className="text-sm text-white/80">{msg.whyOtherOptionsWrong || msg.whyOthersWrong}</p>
                              </div>
                            )}

                            {/* Section 5: Technical Concept */}
                            {msg.technicalConcept && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">🔧 TECHNICAL CONCEPT</span>
                                </div>
                                <p className="text-sm text-white/80">{msg.technicalConcept}</p>
                              </div>
                            )}

                            {/* Section 6: Production Perspective */}
                            {(msg.productionPerspective || msg.productionReasoning) && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-medium">🏭 PRODUCTION PERSPECTIVE</span>
                                </div>
                                <p className="text-sm text-white/80">{msg.productionPerspective || msg.productionReasoning}</p>
                              </div>
                            )}

                            {/* Section 7: Common Mistakes */}
                            {msg.commonMistakes && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-medium">⚠️ COMMON MISTAKES</span>
                                </div>
                                <p className="text-sm text-white/80">{msg.commonMistakes}</p>
                              </div>
                            )}

                            {/* Section 8: Key Learning Points */}
                            {(msg.keyLearningPoints || msg.keyLearning) && (
                              <div className="pt-3 border-t border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">💡 KEY LEARNING POINTS</span>
                                </div>
                                <p className="text-sm text-white/90 font-medium">{msg.keyLearningPoints || msg.keyLearning}</p>
                              </div>
                            )}

                          </div>
                        )}

                        {/* Next Scenario Button */}
                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={() => {
                              if (selectedSkill) {
                                generateScenario(selectedSkill);
                              }
                            }}
                            className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            Next Scenario →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && <div className="flex justify-start"><div className="p-4 rounded-2xl bg-white/10"><Loader2 className="w-5 h-5 animate-spin" /></div></div>}
              {isSpeaking && <div className="flex justify-start"><div className="p-2 rounded-xl bg-primary/20"><Volume2 className="w-4 h-4 animate-pulse" /></div></div>}
            </div>

            <p className="text-xs text-center text-white/40">Choose your option. After selecting, the correct answer will be shown in green. Voice reads explanations aloud.</p>
          </>
        )}
      </div>
    </div>
  );
}