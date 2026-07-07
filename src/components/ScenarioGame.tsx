'use client';

import React, { useState } from 'react';
import { Send, Loader2, Trophy, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  type?: 'scenario' | 'choices';
  choices?: string[];
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

  const handleSkillSubmit = () => {
    if (!input.trim()) return;
    const skill = input.trim();
    setSelectedSkill(skill);

    const welcomeMsg: Message = {
      id: Date.now(),
      text: `🎯 Perfect! Let's practice ${skill} scenarios.\n\nI'll present you with:\n• Real day-to-day work challenges\n• Common struggles and issues\n• Decision scenarios with multiple paths\n• Feedback on your choices\n\nReady to begin?`,
      isUser: false
    };
    setMessages(prev => [...prev, welcomeMsg]);
    setInput('');
    setGameStarted(true);

    // Start first scenario after a delay
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
          message: "Generate a scenario game question with 4 realistic choices. Format: SCENARIO: [description] CHOICES: 1) [choice] 2) [choice] 3) [choice] 4) [choice]",
          context: `SCENARIO GAME MODE for ${skill}:

${context}

Create engaging, realistic scenarios that feel like actual work situations. Each scenario should:
1. Present a specific problem or situation
2. Give 4 distinct choices with different approaches
3. Make it educational and fun

Make it feel like a working simulation but entirely chat-based.`,
          skill: skill,
          mode: 'scenario_game'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const scenarioMsg: Message = {
          id: Date.now(),
          text: data.response,
          isUser: false,
          type: 'scenario'
        };
        setMessages(prev => [...prev, scenarioMsg]);
      }
    } catch (error) {
      // Fallback scenario
      const fallbackMsg: Message = {
        id: Date.now(),
        text: `SCENARIO: Your ${skill} system is acting up in production. Users are reporting issues and the monitoring alerts are firing.\n\nCHOICES:\n1) Check the logs immediately to see what's happening\n2) Restart the service to see if it resolves the issue\n3) Scale up resources assuming it's a capacity problem\n4) Check if there were any recent deployments or changes`,
        isUser: false,
        type: 'scenario'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    }

    setIsLoading(false);
  };

  const handleChoice = async (choice: string) => {
    const userMsg: Message = {
      id: Date.now(),
      text: `Selected: ${choice}`,
      isUser: true
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `User chose: ${choice}. Provide feedback on this choice and generate the next scenario.`,
          context: `SCENARIO GAME FEEDBACK MODE for ${selectedSkill}:

Analyze the user's choice and:
1. Explain if it was good/bad and why
2. Award points for good decisions
3. Generate the next scenario continuing this storyline
4. Keep it engaging and educational

This should feel like an intelligent game where choices matter.`,
          skill: selectedSkill,
          mode: 'scenario_feedback',
          previousChoice: choice
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Check if response mentions correct/good choice
        if (data.response.toLowerCase().includes('correct') || data.response.toLowerCase().includes('good choice')) {
          setScore(prev => prev + 10);
        }

        const feedbackMsg: Message = {
          id: Date.now(),
          text: data.response,
          isUser: false,
          type: 'scenario'
        };
        setMessages(prev => [...prev, feedbackMsg]);
      }
    } catch (error) {
      const feedbackMsg: Message = {
        id: Date.now(),
        text: `Good thinking! Your choice shows you're considering the problem systematically.\n\nContinuing the scenario...\n\nSCENARIO: Now that you've made that decision, what happens next?\n\n1) Monitor the results of your action\n2) Prepare a backup plan\n3) Document what you learned\n4) Move on to the next task`,
        isUser: false,
        type: 'scenario'
      };
      setMessages(prev => [...prev, feedbackMsg]);
    }

    setIsLoading(false);
  };

  const resetGame = () => {
    setMessages([{ id: 0, text: "🎮 Welcome to Scenario Game!\n\nAn intelligent learning game where you'll face real-world scenarios and make decisions.\n\nWhat skill would you like to practice?", isUser: false }]);
    setSelectedSkill(null);
    setGameStarted(false);
    setScore(0);
    setInput('');
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
                  </div>
                </motion.div>
              ))}
              {isLoading && <div className="flex justify-start"><div className="p-4 rounded-2xl bg-white/10"><Loader2 className="w-5 h-5 animate-spin" /></div></div>}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleChoice(input)}
                placeholder="Type your choice or describe your action..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none"
              />
              <button
                onClick={() => handleChoice(input)}
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-center text-white/40">Type your choice number or describe what you'd do</p>
          </>
        )}
      </div>
    </div>
  );
}