'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Send, Volume2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  emoji: string;
}

const encouragingMessages = [
  "You're doing amazing! 🌟",
  "Keep going, you're getting it! 💪",
  "That was a great question! 🎯",
  "Learning is a journey, not a destination! 🗺️",
  "Every expert was once a beginner! 🚀",
];

const responses: { [key: string]: { text: string; emoji: string } } = {
  docker: { text: "Docker is like a shipping container for your code! 🐳 It packages your app with all dependencies so it runs anywhere. Try: docker build -t myapp .", emoji: "🐳" },
  kubernetes: { text: "K8s orchestrates containers like a conductor with an orchestra! 🎼 It manages scaling, networking, and deployment. Start with minikube for local practice!", emoji: "☸️" },
  ci: { text: "CI/CD automates testing and deployment! 🔄 Your code goes through build → test → deploy pipe. GitHub Actions makes this super easy to set up!", emoji: "🔄" },
  mlops: { text: "MLOps brings DevOps to ML! 🤖 Track experiments with MLflow, version models with DVC, and deploy with KServe or Seldon.", emoji: "🤖" },
  default: { text: "Great question! 🤔 Remember: there's no such thing as a silly question in learning. What specific area would you like to explore?", emoji: "💭" }
};

export function VoiceAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "Hi! I'm your friendly AI coach! 🎙️ Ask me anything about DevOps, AI, or testing. I'm here to help you learn! ✨", isUser: false, emoji: "👋" }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.info("Text-to-speech not supported in your browser");
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      isUser: true,
      emoji: "👤"
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: 'User is learning technical skills through interactive simulation'
        })
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: data.response,
        isUser: false,
        emoji: data.emoji
      };
      setMessages(prev => [...prev, aiMessage]);

      if (Math.random() > 0.7) {
        toast.success(encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]);
      }
    } catch (error) {
      toast.error('Connection issue. Using backup responses!');
    }

    setIsLoading(false);
    setInput('');
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error("Speech recognition not supported in your browser");
      return;
    }

    if (isListening) {
      setIsListening(false);
      toast.info("Voice input ended");
    } else {
      setIsListening(true);
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Could not hear you. Please try again.");
      };

      recognition.start();
      toast.info("Listening... Speak now! 🎤");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass rounded-3xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
            <Mic className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold">AI Learning Coach 🎙️</h3>
          <p className="text-white/60">Your personal mentor for interview prep and skill building</p>
        </div>

        {/* Chat Messages */}
        <div className="bg-white/5 rounded-2xl p-6 h-96 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.isUser
                  ? 'bg-primary/20 border border-primary/30'
                  : 'bg-white/10 border border-white/20'
              }`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{msg.emoji}</span>
                  <div className="space-y-1">
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    {!msg.isUser && (
                      <button
                        onClick={() => speak(msg.text)}
                        className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1"
                        disabled={isSpeaking}
                      >
                        <Volume2 className="w-3 h-3" /> Listen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about Docker, Kubernetes, CI/CD, ML..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white placeholder:text-white/40"
            />
          </div>
          <button
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all ${
              isListening
                ? 'bg-red-500/20 border border-red-500 text-red-500'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        <div className="text-xs text-center text-white/40">
          💡 Try asking: "How do I debug Docker?" or "Explain Kubernetes pods"
        </div>
      </div>
    </div>
  );
}