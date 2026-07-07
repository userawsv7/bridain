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
  explanation?: string;
  isCorrect?: boolean;
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
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [showingFeedback, setShowingFeedback] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = (text: string, rate: number = 0.9) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

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
    const lines = text.split('\n');
    const scenarioText = lines.find(l => l.startsWith('SCENARIO:'))?.replace('SCENARIO:', '').trim() || '';
    const choiceLines = lines.filter(l => /^\d\)/.test(l.trim()));

    return {
      scenario: scenarioText,
      choices: choiceLines.length > 0 ? choiceLines : ['Check logs', 'Restart service', 'Scale resources', 'Review recent changes']
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
    setShowingFeedback(false);
    setCurrentChoices([]);

    try {
      const context = previousChoice
        ? `Continue the ${skill} scenario game. Previous choice was: ${previousChoice}. Generate the next scenario based on this decision.`
        : `Start a new ${skill} scenario game. Generate a realistic day-to-day work scenario that ${skill} practitioners face.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: "Generate a scenario game question with 4 realistic choices. Format: SCENARIO: [description] CHOICES: 1) [choice] 2) [choice] 3) [choice] 4) [choice]",
          context: `SCENARIO GAME MODE for ${skill}:

${context}

Create engaging, realistic scenarios that feel like actual work situations. Each scenario should:
1. Present a specific problem or situation
2. Give 4 distinct choices with different approaches
3. Make it educational and fun

Include the correct answer number in your response as: CORRECT: [number]`,
          skill: skill,
          mode: 'scenario_game'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = parseScenario(data.response);
        const correctMatch = data.response.match(/CORRECT:\s*(\d)/);
        const correctAnswer = correctMatch ? parseInt(correctMatch[1]) : 2; // Default to 2 as per requirement

        const scenarioMsg: Message = {
          id: Date.now(),
          text: parsed.scenario,
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

        setMessages(prev => [...prev, scenarioMsg, choicesMsg]);
        setCurrentChoices(parsed.choices);

        // Speak the scenario
        speak(parsed.scenario, 0.85);
      }
    } catch (error) {
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
      setCurrentChoices(fallbackChoices);
      speak(`Your ${skill} system is acting up in production`, 0.85);
    }

    setIsLoading(false);
  };

  const handleChoice = async (choiceIndex: number, choiceText: string) => {
    if (showingFeedback) return;

    const userMsg: Message = {
      id: Date.now(),
      text: `Selected option ${choiceIndex + 1}: ${choiceText}`,
      isUser: true
    };
    setMessages(prev => [...prev, userMsg]);

    // The correct answer is always option 2 (index 1)
    const correctAnswerIndex = 1;
    const isCorrect = choiceIndex === correctAnswerIndex;

    setShowingFeedback(true);
    setIsLoading(true);

    // Create feedback message
    const feedbackMsg: Message = {
      id: Date.now() + 1,
      text: isCorrect
        ? `✅ Correct! Option ${choiceIndex + 1} was the right choice.`
        : `❌ Wrong! The correct answer is option ${correctAnswerIndex + 1}.`,
      isUser: false,
      selectedAnswer: choiceIndex,
      correctAnswer: correctAnswerIndex,
      isCorrect: isCorrect,
      explanation: isCorrect
        ? "Great decision! This shows you understand the proper approach to this scenario."
        : `The correct approach (option ${correctAnswerIndex + 1}) is the recommended solution because it addresses the root cause systematically rather than applying temporary fixes.`
    };

    setMessages(prev => [...prev, feedbackMsg]);

    // Update score
    if (isCorrect) {
      setScore(prev => prev + 10);
    }

    // Speak the feedback
    speak(feedbackMsg.text + ". " + (feedbackMsg.explanation || ""), isCorrect ? 0.9 : 0.85);

    // Speak feedback with color indication
    setTimeout(() => {
      if (isCorrect) {
        speak("Excellent work! Moving to the next scenario.", 0.9);
      } else {
        speak(`The correct answer was option ${correctAnswerIndex + 1}. ${feedbackMsg.explanation}`, 0.85);
      }
    }, 1500);

    // Move to next scenario
    setTimeout(() => {
      if (selectedSkill) {
        generateScenario(selectedSkill, choiceText);
      }
    }, 5000);

    setIsLoading(false);
  };

  const resetGame = () => {
    stopSpeaking();
    setMessages([{ id: 0, text: "🎮 Welcome to Scenario Game!\n\nAn intelligent learning game where you'll face real-world scenarios and make decisions.\n\nWhat skill would you like to practice?", isUser: false }]);
    setSelectedSkill(null);
    setGameStarted(false);
    setScore(0);
    setInput('');
    setCurrentChoices([]);
    setShowingFeedback(false);
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

                    {/* Choice buttons */}
                    {msg.type === 'choices' && msg.choices && !showingFeedback && (
                      <div className="mt-4 space-y-2">
                        {msg.choices.map((choice, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleChoice(idx, choice)}
                            className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 hover:border-primary/50 transition-all"
                          >
                            <span className="font-medium mr-2">{idx + 1}.</span> {choice}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Feedback display */}
                    {msg.selectedAnswer !== undefined && msg.correctAnswer !== undefined && (
                      <div className="mt-4 space-y-2">
                        {msg.choices?.map((choice, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border ${
                              idx === msg.correctAnswer
                                ? 'bg-green-500/20 border-green-500/50'
                                : idx === msg.selectedAnswer && idx !== msg.correctAnswer
                                ? 'bg-red-500/20 border-red-500/50'
                                : 'bg-white/5 border-white/20'
                            }`}
                          >
                            <span className="font-medium mr-2">{idx + 1}.</span> {choice}
                            {idx === msg.correctAnswer && (
                              <span className="ml-2 text-green-400">✓ Correct Answer</span>
                            )}
                            {idx === msg.selectedAnswer && idx !== msg.correctAnswer && (
                              <span className="ml-2 text-red-400">✗ Your Answer</span>
                            )}
                          </div>
                        ))}
                        {msg.explanation && (
                          <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/20">
                            <p className="text-sm text-white/80">
                              <span className="font-medium text-primary">Explanation:</span> {msg.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && <div className="flex justify-start"><div className="p-4 rounded-2xl bg-white/10"><Loader2 className="w-5 h-5 animate-spin" /></div></div>}
              {isSpeaking && <div className="flex justify-start"><div className="p-2 rounded-xl bg-primary/20"><Volume2 className="w-4 h-4 animate-pulse" /></div></div>}
            </div>

            <p className="text-xs text-center text-white/40">Click on your chosen option. Green = correct, Red = wrong. Voice reads explanations aloud.</p>
          </>
        )}
      </div>
    </div>
  );
}