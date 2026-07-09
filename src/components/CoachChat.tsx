'use client';

import React, { useState, useRef } from 'react';
import { Send, Loader2, Target, Volume2, VolumeX, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

export function CoachChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "👋 Welcome to Coach Mode!\n\nI'll help you master any skill through deep concept explanations, practical fixes, best practices, and troubleshooting guidance. What skill would you like to learn?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoiceFlavor, setSelectedVoiceFlavor] = useState('Aphrodite');
  const [speechRate, setSpeechRate] = useState(0.9);

  const voiceFlavors = {
    Aphrodite: { name: 'Aphrodite', pitch: 1.15, description: 'Warm, enchanting Greek goddess' },
    Amba: { name: 'Amba', pitch: 1.1, description: 'Gentle, melodic Indian goddess' },
    Venus: { name: 'Venus', pitch: 1.2, description: 'Elegant, romantic Roman goddess' },
    Ishtar: { name: 'Ishtar', pitch: 1.05, description: 'Strong, confident Babylonian goddess' },
    Freyja: { name: 'Freyja', pitch: 1.12, description: 'Nurturing, wise Norse goddess' }
  };

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const sanitizeText = (text: string): string => {
    return text
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic *text*
      .replace(/_{1,2}/g, '') // Remove underscores
      .replace(/`{1,3}/g, '') // Remove code markers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const speak = (text: string, rate: number = 0.9) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const cleanText = sanitizeText(text);

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    utterance.pitch = voiceFlavors[selectedVoiceFlavor as keyof typeof voiceFlavors].pitch;
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
      text: `Excellent choice! Let's master ${skill}.\n\nI'll coach you on:\n• Core concepts with real examples\n• Practical day-to-day fixes\n• Industry best practices\n• Common pitfalls to avoid\n• Step-by-step troubleshooting\n\nAsk me anything about ${skill}!`,
      isUser: false
    };
    setMessages(prev => [...prev, welcomeMsg]);
    setInput('');
  };

  const handleSend = async () => {
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
          context: `COACH MODE: You are an expert technical coach teaching ${selectedSkill}.

Your role:
1. Explain concepts deeply but accessibly with analogies and real examples
2. Provide practical day-to-day work fixes and solutions
3. Share industry best practices and standards
4. Highlight common pitfalls and how to avoid them
5. Give step-by-step troubleshooting guidance
6. Use the skill context to make responses highly relevant

Focus on being practical, actionable, and encouraging. Structure responses with clear sections when helpful.`,
          skill: selectedSkill
        })
      });

      if (response.ok) {
        const data = await response.json();
        const sanitizedResponse = sanitizeText(data.response);
        const aiMsg: Message = {
          id: Date.now() + 1,
          text: sanitizedResponse,
          isUser: false
        };
        setMessages(prev => [...prev, aiMsg]);
        // Speak the response
        speak(sanitizedResponse, 0.9);
      }
    } catch (error) {
      const aiMsg: Message = {
        id: Date.now() + 1,
        text: `Here's guidance for ${selectedSkill}:\n\n• Start with the fundamentals and build up\n• Practice with real examples daily\n• Use logging and debugging tools effectively\n• Follow community best practices\n• Learn from each troubleshooting session\n\nWhat specific aspect would you like to explore?`,
        isUser: false
      };
      setMessages(prev => [...prev, aiMsg]);
      speak(`Here's guidance for ${selectedSkill}. Start with the fundamentals and build up.`, 0.9);
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Coach Mode</h3>
              <p className="text-white/60">Master any skill with expert guidance</p>
            </div>
          </div>
          {selectedSkill && (
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
          )}
          {/* Voice Controls */}
          {selectedSkill && (
            <div className="flex items-center gap-2 ml-4">
              <select
                value={selectedVoiceFlavor}
                onChange={(e) => setSelectedVoiceFlavor(e.target.value)}
                className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-sm"
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
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs w-8">{speechRate.toFixed(1)}x</span>
              </div>
            </div>
          )}
        </div>

        {!selectedSkill ? (
          <div className="space-y-4">
            <p className="text-lg">What skill would you like to master?</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSkillSubmit()}
                placeholder="Enter any skill (e.g., Docker, React, AWS, Python...)"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none"
              />
              <button
                onClick={handleSkillSubmit}
                disabled={!input.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50 font-medium"
              >
                Start Learning
              </button>
            </div>
            <p className="text-sm text-white/60 text-center">Works with any skill - just type what you want to learn!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30">
                🎯 Learning: <span className="font-bold">{selectedSkill}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedSkill(null);
                  setMessages([{ id: 0, text: "👋 Welcome to Coach Mode!\n\nI'll help you master ANY skill through:\n• Deep concept explanations\n• Day-to-day work fixes\n• Best practices & gotchas\n• Troubleshooting guidance\n\nWhat skill would you like to learn?", isUser: false }]);
                }}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Change Skill
              </button>
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
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{sanitizeText(msg.text)}</p>
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
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder={`Ask anything about ${selectedSkill}...`}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
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