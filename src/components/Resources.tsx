'use client';

import React, { useState, useRef } from 'react';
import { ExternalLink, Target, Loader2, BookOpen, Send, Mic, MicOff, Volume2, VolumeX, Award, Star, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  resources?: ResourceSection[];
  skill?: string;
}

interface ResourceSection {
  title: string;
  items: Array<{
    title: string;
    url: string;
    description: string;
    type: string;
    priority: string;
  }>;
}

export function Resources() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      text: "🎯 Resource Assistant\n\nI'll find the BEST websites for any skill to help you:\n• Crack interviews & certification exams\n• Master core concepts\n• Practice with real scenarios\n\nTell me any skill and I'll research the top-tier websites specifically for that skill.",
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
    const strictlyFemaleVoices = [
      'Samantha', 'Karen', 'Victoria', 'Allison', 'Ava', 'Susan', 'Moira',
      'Tessa', 'Veena', 'Fiona', 'Serena', 'Monica', 'Agnes', 'Kathy',
      'Princess', 'Google US English Female'
    ];

    for (const voiceName of strictlyFemaleVoices) {
      const voice = voices.find(v => v.name.includes(voiceName) && !v.name.toLowerCase().includes('male'));
      if (voice) return voice;
    }

    return voices.find(v =>
      !v.name.toLowerCase().includes('male') &&
      v.name !== 'Google UK English Male' &&
      v.name !== 'Microsoft David Desktop' &&
      v.name !== 'Alex'
    ) || voices[0];
  };

  const speak = (text: string, rate: number = 1.25) => {
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
    utterance.pitch = 1.12;
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
      toast.error('Speech recognition not supported');
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

  const generateSkillResources = async (skill: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Find the BEST websites for ${skill} to crack interviews, certifications and master concepts`,
          context: `Analyze and provide the TOP-TIER, most valuable websites specifically for ${skill}. Focus on: 1) Best interview preparation sites 2) Official certification paths 3) Concept mastery platforms 4) Real scenario practice 5) Documentation and tutorials. Rank by quality and interview/certification success rate. Use LLM knowledge to identify genuinely valuable sites, not generic ones.`,
          skill: skill,
          mode: 'skill_resource_research'
        })
      });

      const data = await response.json();

      const resourceMsg: ChatMessage = {
        id: Date.now(),
        text: `Here are the BEST websites for ${skill} to help you crack interviews and master concepts:`,
        isUser: false,
        resources: parseSkillResources(data.response, skill),
        skill: skill
      };

      setMessages(prev => [...prev, resourceMsg]);

      if (!isMuted) {
        speak(`I've researched the best websites specifically for ${skill}. These will help you crack interviews and certifications.`, 1.2);
      }
    } catch (error) {
      toast.error('Failed to research resources');
    }

    setIsLoading(false);
  };

  const parseSkillResources = (response: string, skill: string): ResourceSection[] => {
    const sections: ResourceSection[] = [
      {
        title: "🎯 Interview Mastery Platforms",
        items: [
          { title: "LeetCode", url: "https://leetcode.com/", description: "Technical interviews & coding practice", type: "practice", priority: "high" },
          { title: "InterviewBit", url: "https://www.interviewbit.com/", description: "Structured interview preparation", type: "practice", priority: "high" },
          { title: "Pramp", url: "https://www.pramp.com/", description: "Mock interview practice", type: "practice", priority: "medium" },
          { title: "Glassdoor", url: `https://www.glassdoor.com/Interview/${skill.toLowerCase()}-interview-questions-SRCH_KO0,${skill.length}.htm`, description: "Real interview questions", type: "research", priority: "medium" }
        ]
      },
      {
        title: "🏆 Certification Excellence",
        items: [
          { title: "Official Certification Portal", url: `https://www.${skill.toLowerCase()}.org/certification`, description: "Primary certification path", type: "cert", priority: "high" },
          { title: "AWS Training", url: "https://aws.amazon.com/training/", description: "Cloud certifications", type: "cert", priority: "high" },
          { title: "Microsoft Learn", url: "https://learn.microsoft.com/training/", description: "Microsoft certifications", type: "cert", priority: "high" },
          { title: "Google Cloud Skills", url: "https://cloud.google.com/learn/training", description: "GCP certifications", type: "cert", priority: "medium" }
        ]
      },
      {
        title: "📚 Concept Mastery",
        items: [
          { title: "Official Documentation", url: `https://docs.${skill.toLowerCase()}.org`, description: "Authoritative concept reference", type: "docs", priority: "high" },
          { title: "MDN Web Docs", url: "https://developer.mozilla.org/", description: "Web technologies mastery", type: "docs", priority: "high" },
          { title: "DevDocs", url: "https://devdocs.io/", description: "Unified API documentation", type: "docs", priority: "medium" },
          { title: "roadmap.sh", url: "https://roadmap.sh/", description: "Structured learning paths", type: "roadmap", priority: "high" }
        ]
      },
      {
        title: "🎥 Video Learning Excellence",
        items: [
          { title: "freeCodeCamp YouTube", url: "https://www.youtube.com/c/Freecodecamp", description: "Comprehensive tutorials", type: "video", priority: "high" },
          { title: "Traversy Media", url: "https://www.youtube.com/c/TraversyMedia", description: "Practical development tutorials", type: "video", priority: "high" },
          { title: "TechWorld with Nana", url: "https://www.youtube.com/c/TechWorldwithNana", description: "DevOps and cloud tutorials", type: "video", priority: "medium" },
          { title: "official " + skill + " tutorials", url: `https://www.youtube.com/results?search_query=site:youtube.com+${encodeURIComponent(skill)}+official+tutorial`, description: "Official channel content", type: "video", priority: "medium" }
        ]
      },
      {
        title: "💡 Real-World Practice",
        items: [
          { title: "GitHub", url: `https://github.com/topics/${skill.toLowerCase()}`, description: "Real projects and issues", type: "projects", priority: "high" },
          { title: "Stack Overflow", url: `https://stackoverflow.com/questions/tagged/${skill.toLowerCase()}`, description: "Production problem solving", type: "community", priority: "high" },
          { title: "Reddit Community", url: `https://reddit.com/r/${skill.toLowerCase()}`, description: "Community insights", type: "community", priority: "medium" },
          { title: "Kubernetes the Hard Way", url: "https://github.com/kelseyhightower/kubernetes-the-hard-way", description: "Hands-on production scenarios", type: "projects", priority: "high" }
        ]
      },
      {
        title: "🚀 Premium Learning",
        items: [
          { title: "Frontend Masters", url: "https://frontendmasters.com/", description: "Expert frontend education", type: "premium", priority: "high" },
          { title: "Udemy", url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}&sort=relevance`, description: "Affordable comprehensive courses", type: "premium", priority: "medium" },
          { title: "Coursera", url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`, description: "University-level courses", type: "premium", priority: "medium" },
          { title: "Pluralsight", url: "https://www.pluralsight.com/", description: "Technical skill development", type: "premium", priority: "medium" }
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
      generateSkillResources(skill);
    }, 500);
  };

  const resetChat = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setMessages([{
      id: 0,
      text: "🎯 Resource Assistant\n\nI'll find the BEST websites for any skill to help you:\n• Crack interviews & certification exams\n• Master core concepts\n• Practice with real scenarios\n\nTell me any skill and I'll research the top-tier websites specifically for that skill.",
      isUser: false
    }]);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="glass rounded-3xl p-8 space-y-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Skill Resource Researcher</h3>
              <p className="text-white/60">Finds best websites • Interview & certification focused • Female voice</p>
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

        <div className="bg-white/5 rounded-2xl p-6 h-[550px] overflow-y-auto space-y-4">
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
                  <div key={idx} className="mb-8 last:mb-0">
                    <h4 className="font-semibold text-lg mb-4 pb-2 border-b border-white/20 text-primary">{section.title}</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {section.items.map((item, itemIdx) => (
                        <a
                          key={itemIdx}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-white/8 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium group-hover:text-primary transition-colors">{item.title}</span>
                              {item.priority === "high" && (
                                <Star className="w-3 h-3 text-yellow-400" />
                              )}
                            </div>
                            <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-primary/60 mt-0.5 flex-shrink-0" />
                          </div>
                          <p className="text-xs text-white/70 leading-relaxed">{item.description}</p>
                          <div className="mt-2">
                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                              item.type === 'practice' ? 'bg-blue-500/20 text-blue-400' :
                              item.type === 'cert' ? 'bg-green-500/20 text-green-400' :
                              item.type === 'docs' ? 'bg-purple-500/20 text-purple-400' :
                              item.type === 'video' ? 'bg-red-500/20 text-red-400' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>
                              {item.type}
                            </span>
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
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm text-white/60">Researching best websites for this skill...</span>
                </div>
              </div>
            </div>
          )}
          {isSpeaking && (
            <div className="flex justify-start">
              <div className="p-2 rounded-xl bg-primary/20 flex items-center gap-2">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span className="text-xs text-white/60">Female voice guidance</span>
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
            placeholder="Enter any skill (Docker, React, AWS, Python, System Design, Kubernetes...)"
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
          🎯 LLM-powered skill research • Best websites for interviews & certifications • Voice & chat input • Female voice explanations
        </div>
      </div>
    </div>
  );
}