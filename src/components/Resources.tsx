'use client';

import React, { useState, useRef } from 'react';
import { ExternalLink, Github, Award, Target, Search, Loader2, BookOpen, PlayCircle, FileText, Users, Star, Trophy, Book, Video, FileCode, Globe, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  resources?: ResourceSection[];
}

interface ResourceSection {
  title: string;
  items: Array<{
    title: string;
    url: string;
    description: string;
    type: string;
  }>;
}

export function Resources() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      text: "Hi! I'm your Resource Assistant 📚\n\nTell me any skill and I'll provide:\n• GitHub repos & tasks\n• Best online resources\n• YouTube tutorials\n• Cheatsheets & concepts\n• Day-to-day activities\n• Official certifications\n• Free & paid resources\n\nWhat skill would you like to explore?",
      isUser: false
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);

  const selectFemaleVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const premiumFemaleVoices = [
      'Samantha', 'Karen', 'Victoria', 'Allison', 'Ava', 'Susan', 'Moira',
      'Tessa', 'Veena', 'Fiona', 'Serena', 'Monica', 'Agnes', 'Kathy'
    ];

    for (const voiceName of premiumFemaleVoices) {
      const voice = voices.find(v => v.name.includes(voiceName) && !v.name.toLowerCase().includes('male'));
      if (voice) return voice;
    }

    return voices.find(v =>
      !v.name.toLowerCase().includes('male') &&
      v.name !== 'Google UK English Male'
    ) || voices[0];
  };

  const speak = (text: string, rate: number = 1.2) => {
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

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
      toast.error('Voice input failed');
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const generateResources = async (skill: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Provide comprehensive resources for ${skill}`,
          context: `Generate a complete resource guide for ${skill} including: GitHub repos with good issues/tasks, best online learning sites, YouTube tutorials, cheatsheets, concept explanations, day-to-day activities and struggles, scenarios, official certifications (free and paid), documentation. Format as organized sections with real URLs where possible.`,
          skill: skill,
          mode: 'resource_assistant'
        })
      });

      const data = await response.json();

      const resourceMsg: ChatMessage = {
        id: Date.now(),
        text: `Here are comprehensive resources for ${skill}:`,
        isUser: false,
        resources: parseResources(data.response, skill)
      };

      setMessages(prev => [...prev, resourceMsg]);

      if (!isMuted) {
        speak(`I've found comprehensive resources for ${skill}. Check out the sections below.`, 1.2);
      }
    } catch (error) {
      toast.error('Failed to fetch resources');
    }

    setIsLoading(false);
  };

  const parseResources = (response: string, skill: string): ResourceSection[] => {
    const sections: ResourceSection[] = [
      {
        title: "🚀 GitHub Repositories & Tasks",
        items: [
          { title: `${skill} Awesome List`, url: `https://github.com/topics/${skill.toLowerCase()}`, description: "Curated list of best resources", type: "repo" },
          { title: `${skill} Examples`, url: `https://github.com/search?q=${encodeURIComponent(skill)}+example`, description: "Real-world implementations", type: "repo" },
          { title: `Good First Issues - ${skill}`, url: `https://github.com/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22+${encodeURIComponent(skill)}`, description: "Beginner-friendly tasks", type: "tasks" }
        ]
      },
      {
        title: "📚 Best Online Learning Sites",
        items: [
          { title: "freeCodeCamp", url: "https://www.freecodecamp.org/", description: "Free comprehensive tutorials", type: "course" },
          { title: "MDN Web Docs", url: "https://developer.mozilla.org/", description: "Official documentation", type: "docs" },
          { title: "roadmap.sh", url: "https://roadmap.sh/", description: "Visual learning paths", type: "roadmap" },
          { title: "DevDocs", url: "https://devdocs.io/", description: "Unified API documentation", type: "docs" }
        ]
      },
      {
        title: "🎥 YouTube Tutorials",
        items: [
          { title: `${skill} Crash Course - freeCodeCamp`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill)}+crash+course+freecodecamp+2024`, description: "Complete tutorial series", type: "video" },
          { title: `${skill} Official Tutorial`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill)}+official+tutorial+2024`, description: "Official channel tutorials", type: "video" },
          { title: `${skill} Hands-on Lab`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill)}+hands+on+lab+tutorial`, description: "Practical demonstrations", type: "video" }
        ]
      },
      {
        title: "📋 Cheatsheets & Quick References",
        items: [
          { title: `${skill} Cheatsheet`, url: `https://devhints.io/${skill.toLowerCase()}`, description: "Quick reference guide", type: "cheatsheet" },
          { title: "QuickRef.me", url: `https://quickref.me/${skill.toLowerCase()}`, description: "Command references", type: "cheatsheet" },
          { title: "OverAPI", url: `https://overapi.com/${skill.toLowerCase()}`, description: "API cheat sheets", type: "cheatsheet" }
        ]
      },
      {
        title: "💡 Concept Explanations",
        items: [
          { title: "freeCodeCamp Articles", url: "https://www.freecodecamp.org/news/", description: "In-depth concept articles", type: "article" },
          { title: "DEV Community", url: "https://dev.to/", description: "Real-world explanations", type: "article" },
          { title: "Medium Tech", url: "https://medium.com/tag/technology", description: "Expert insights", type: "article" }
        ]
      },
      {
        title: "📅 Day-to-Day Activities & Scenarios",
        items: [
          { title: "Real Production Scenarios", url: `https://stackoverflow.com/questions/tagged/${skill.toLowerCase()}`, description: "Common daily challenges", type: "forum" },
          { title: "Interview Questions", url: `https://www.interviewbit.com/${skill.toLowerCase()}-interview-questions/`, description: "Practice scenarios", type: "practice" },
          { title: "LeetCode Explore", url: "https://leetcode.com/explore/", description: "Structured practice", type: "practice" }
        ]
      },
      {
        title: "🏆 Official Certifications",
        items: [
          { title: `${skill} Professional Cert`, url: `https://www.${skill.toLowerCase()}.org/certification`, description: "Official certification", type: "cert" },
          { title: "AWS Certifications", url: "https://aws.amazon.com/certification/", description: "Cloud certifications", type: "cert" },
          { title: "Google Cloud Certs", url: "https://cloud.google.com/certification/", description: "GCP certifications", type: "cert" },
          { title: "Microsoft Learn", url: "https://learn.microsoft.com/certifications/", description: "Azure certifications", type: "cert" }
        ]
      },
      {
        title: "💰 Free & Paid Resources",
        items: [
          { title: "Harvard CS50", url: "https://cs50.harvard.edu/", description: "Free world-class education", type: "course" },
          { title: "MIT OpenCourseWare", url: "https://ocw.mit.edu/", description: "Free MIT courses", type: "course" },
          { title: "Frontend Masters", url: "https://frontendmasters.com/", description: "Premium frontend courses", type: "course" },
          { title: "Udemy Courses", url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`, description: "Affordable video courses", type: "course" }
        ]
      }
    ];

    return sections;
  };

  const handleSubmit = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: input,
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);

    const skill = input.trim();
    setInput('');

    setTimeout(() => {
      generateResources(skill);
    }, 500);
  };

  const resetChat = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setMessages([{
      id: 0,
      text: "Hi! I'm your Resource Assistant 📚\n\nTell me any skill and I'll provide:\n• GitHub repos & tasks\n• Best online resources\n• YouTube tutorials\n• Cheatsheets & concepts\n• Day-to-day activities\n• Official certifications\n• Free & paid resources\n\nWhat skill would you like to explore?",
      isUser: false
    }]);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="glass rounded-3xl p-8 space-y-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Resources Assistant</h3>
              <p className="text-white/60">Chat-based • Voice input • Comprehensive skill resources</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className={`p-2 rounded-xl ${isMuted ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/5 border border-white/10'}`}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button onClick={resetChat} className="p-2 rounded-xl bg-white/5 border border-white/10">
              <Target className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-6 h-[500px] overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[95%] p-4 rounded-2xl ${
                msg.isUser ? 'bg-primary/20 border border-primary/30' : 'bg-white/10 border border-white/20'
              }`}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap mb-4">{msg.text}</div>

                {msg.resources && msg.resources.map((section, idx) => (
                  <div key={idx} className="mb-6 last:mb-0">
                    <h4 className="font-semibold text-base mb-3 text-primary">{section.title}</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {section.items.map((item, itemIdx) => (
                        <a
                          key={itemIdx}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-medium group-hover:text-primary transition-colors">{item.title}</span>
                              <p className="text-xs text-white/60 mt-1">{item.description}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
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

        <div className="flex gap-3">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500/20 border border-red-500/50' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter any skill (Docker, React, AWS, Python, Kubernetes...)"
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        <div className="text-xs text-center text-white/40">
          💬 Chat-based resources • 🎤 Voice input supported • Female voice explanations • All skills supported
        </div>
      </div>
    </div>
  );
}