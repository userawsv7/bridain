'use client';

import React, { useState, useRef } from 'react';
import { Send, Loader2, Mic, MicOff, Volume2, VolumeX, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isCorrect?: boolean;
  showAnswer?: boolean;
  correctAnswer?: string;
  explanation?: string;
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
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = (text: string, rate: number = 0.9) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Stop any current speech
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

    // Start interview mode with first question
    if (mode === 'interview') {
      setTimeout(() => askInterviewQuestion(skill), 1000);
    }
  };

  const askInterviewQuestion = async (skill: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: "Generate an interview question with 4 choices for " + skill,
          context: `INTERVIEW MODE for ${skill}:
Generate a realistic interview question with exactly 4 choices.
Format: QUESTION: [question] CHOICES: 1) [choice] 2) [choice] 3) [choice] 4) [choice]
Make it challenging but fair for a ${skill} role.`,
          skill: skill,
          mode: 'interview_question'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const questionMsg: Message = {
          id: Date.now(),
          text: data.response,
          isUser: false
        };
        setMessages(prev => [...prev, questionMsg]);
        setCurrentQuestion(data.response);
        setAwaitingAnswer(true);

        // Speak the question
        speak(data.response.replace(/CHOICES:.*$/s, ''), 0.85);
      }
    } catch (error) {
      const fallbackQuestion: Message = {
        id: Date.now(),
        text: `QUESTION: How would you handle a memory leak in a ${skill} application?\n\nCHOICES:\n1) Restart the application periodically\n2) Use memory profiling tools to identify the source\n3) Increase the available memory\n4) Ignore it until it crashes`,
        isUser: false
      };
      setMessages(prev => [...prev, fallbackQuestion]);
      setCurrentQuestion(fallbackQuestion.text);
      setAwaitingAnswer(true);
      speak("How would you handle a memory leak in a " + skill + " application?", 0.85);
    }

    setIsLoading(false);
  };

  const handleAnswer = async (answer: string) => {
    if (!selectedSkill || !awaitingAnswer) return;

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
          message: `User answered: ${answer}`,
          context: `INTERVIEW MODE FEEDBACK for ${selectedSkill}:
Previous question: ${currentQuestion}
User's answer: ${answer}

Provide feedback:
1. Is their answer correct? (Yes/No)
2. If wrong, explain the correct answer
3. Give a brief explanation
4. Move to next question

Format: CORRECT/INCORRECT: [explanation] NEXT: [next question with choices]`,
          skill: selectedSkill,
          mode: 'interview_feedback'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const isCorrect = data.response.toLowerCase().includes('correct: yes') ||
                         data.response.toLowerCase().includes('correct answer');

        const feedbackMsg: Message = {
          id: Date.now() + 1,
          text: data.response,
          isUser: false,
          isCorrect: isCorrect
        };
        setMessages(prev => [...prev, feedbackMsg]);

        // Speak the feedback
        const speechText = data.response.replace(/NEXT:.*$/s, '');
        speak(speechText, 0.9);

        // Ask next question after feedback
        setTimeout(() => {
          if (selectedSkill) {
            askInterviewQuestion(selectedSkill);
          }
        }, 3000);
      }
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "Good effort! The correct approach involves understanding the underlying concepts. Let me ask another question...",
        isUser: false
      };
      setMessages(prev => [...prev, errorMsg]);
      setTimeout(() => {
        if (selectedSkill) askInterviewQuestion(selectedSkill);
      }, 2000);
    }

    setIsLoading(false);
    setInput('');
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
          context: `LEARNING MODE: Interactive teaching session for ${selectedSkill}.
Teach concepts interactively, ask questions to check understanding, provide examples, and adapt based on responses.`,
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
    setCurrentQuestion('');
    setIsMuted(false);
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
            {/* Mode Selection */}
            <div>
              <p className="text-lg mb-4">Choose your mode:</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setMode('learning')}
                  className={`flex-1 p-4 rounded-xl border transition-all ${mode === 'learning'
                    ? 'bg-primary/20 border-primary/50'
                    : 'bg-white/5 border-white/20 hover:bg-white/10'}`}
                >
                  <Award className="w-6 h-6 mb-2 mx-auto" />
                  <div className="font-medium">Learning Mode</div>
                  <div className="text-sm text-white/60">Interactive teaching & questions</div>
                </button>
                <button
                  onClick={() => setMode('interview')}
                  className={`flex-1 p-4 rounded-xl border transition-all ${mode === 'interview'
                    ? 'bg-primary/20 border-primary/50'
                    : 'bg-white/5 border-white/20 hover:bg-white/10'}`}
                >
                  <Mic className="w-6 h-6 mb-2 mx-auto" />
                  <div className="font-medium">Interview Mode</div>
                  <div className="text-sm text-white/60">Practice with AI interviewer</div>
                </button>
              </div>
            </div>

            {/* Skill Input */}
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
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30">
                  {mode === 'learning' ? '🎓' : '🎤'} {mode === 'learning' ? 'Learning' : 'Interview'}: <span className="font-bold">{selectedSkill}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded-xl transition-all ${isMuted ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                  title={isMuted ? "Unmute voice" : "Mute voice"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={stopSpeaking}
                  disabled={!isSpeaking}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50"
                  title="Stop speaking"
                >
                  <MicOff className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white/5 rounded-2xl p-6 h-[500px] overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl ${
                    msg.isUser ? 'bg-primary/20 border border-primary/30' :
                    msg.isCorrect !== undefined ? (msg.isCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30') :
                    'bg-white/10 border border-white/20'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && <div className="flex justify-start"><div className="p-4 rounded-2xl bg-white/10"><Loader2 className="w-5 h-5 animate-spin" /></div></div>}
              {isSpeaking && <div className="flex justify-start"><div className="p-2 rounded-xl bg-primary/20"><Volume2 className="w-4 h-4 animate-pulse" /></div></div>}
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    if (mode === 'learning') {
                      handleLearningMessage();
                    } else if (awaitingAnswer) {
                      handleAnswer(input);
                    }
                  }
                }}
                placeholder={mode === 'learning' ? "Ask a question..." : awaitingAnswer ? "Type your answer..." : "Waiting for next question..."}
                disabled={mode === 'interview' && !awaitingAnswer}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none disabled:opacity-50"
              />
              <button
                onClick={() => {
                  if (mode === 'learning') {
                    handleLearningMessage();
                  } else if (awaitingAnswer) {
                    handleAnswer(input);
                  }
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