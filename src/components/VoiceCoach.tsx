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
  feedbackStatus?: 'Correct' | 'Wrong';
  feedbackContrast?: string;
  feedbackExplanation?: string;
  // Separate question text from choices for clean display
  questionText?: string;
  choices?: string[];
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
  const [selectedVoiceFlavor, setSelectedVoiceFlavor] = useState('Aphrodite');
  const [speechRate, setSpeechRate] = useState(0.85);
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [isWaitingForSpeech, setIsWaitingForSpeech] = useState(false);

  const voiceFlavors = {
    Aphrodite: { name: 'Aphrodite', pitch: 1.15, description: 'Warm, enchanting Greek goddess' },
    Amba: { name: 'Amba', pitch: 1.1, description: 'Gentle, melodic Indian goddess' },
    Venus: { name: 'Venus', pitch: 1.2, description: 'Elegant, romantic Roman goddess' },
    Ishtar: { name: 'Ishtar', pitch: 1.05, description: 'Strong, confident Babylonian goddess' },
    Freyja: { name: 'Freyja', pitch: 1.12, description: 'Nurturing, wise Norse goddess' }
  };

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const selectFemaleVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.name.includes('Female') || v.name.includes('Karen') || v.name.includes('Samantha') || v.name.includes('Victoria')) ||
           voices.find(v => v.name.includes('Google')) ||
           voices[0];
  };

  const sanitizeForTTS = (text: string): string => {
    // Enhanced sanitization that properly handles all markdown formatting
    return text
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers like ###, ##, #
      .replace(/\*\*/g, '') // Remove all ** markers
      .replace(/\*/g, '') // Remove all * markers
      .replace(/_{1,2}/g, '') // Remove all underscores
      .replace(/`{1,3}/g, '') // Remove all code markers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const sanitizeMessageText = (text: string): string => {
    // Remove markdown formatting while keeping clean text structure
    return text
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers like ###, ##, #
      .replace(/\*\*/g, '') // Remove all ** markers
      .replace(/\*/g, '') // Remove all * markers
      .replace(/_{1,2}/g, '') // Remove all underscores
      .replace(/`{1,3}/g, '') // Remove all code markers
      .replace(/\s{3,}/g, '\n\n') // Replace excessive whitespace with paragraph breaks
      .trim();
  };

  const selectAndCacheFemaleVoice = async (): Promise<SpeechSynthesisVoice | null> => {
    // Wait for voices to load if not already loaded
    let voices = window.speechSynthesis.getVoices();

    if (voices.length === 0) {
      // Wait for voiceschanged event
      await new Promise<void>((resolve) => {
        const handleVoicesChanged = () => {
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          resolve();
        };
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

        // Fallback timeout
        setTimeout(() => {
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          resolve();
        }, 1000);
      });
      voices = window.speechSynthesis.getVoices();
    }

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

    // Then try any female voice indicators
    const femaleIndicators = ['Female', 'Woman', 'Girl', 'Lady'];
    for (const indicator of femaleIndicators) {
      const voice = voices.find(v => v.name.includes(indicator));
      if (voice) return voice;
    }

    // Fallback to Google voices or first available
    return voices.find(v => v.name.includes('Google')) || voices[0] || null;
  };

  // Initialize female voice on component mount
  React.useEffect(() => {
    const initVoice = async () => {
      const voice = await selectAndCacheFemaleVoice();
      if (voice) {
        setPreferredVoice(voice);
        setVoicesLoaded(true);
      }
    };

    initVoice();
  }, []);

  // Speak with promise support for awaiting completion
  const speakWithPromise = (text: string, rate: number = 0.9): Promise<void> => {
    return new Promise((resolve) => {
      if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      // Stop any current speech immediately
      stopSpeaking();

      // Clean text for pleasant TTS experience
      const cleanText = sanitizeForTTS(text);

      // Create a local function to select voice
      const selectVoiceLocally = async (): Promise<SpeechSynthesisVoice | null> => {
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

        const premiumVoices = ['Samantha', 'Karen', 'Victoria', 'Allison', 'Ava', 'Susan', 'Moira', 'Tessa', 'Veena', 'Fiona', 'Serena'];
        for (const voiceName of premiumVoices) {
          const voice = voices.find(v => v.name.includes(voiceName));
          if (voice) return voice;
        }
        const femaleIndicators = ['Female', 'Woman', 'Girl', 'Lady'];
        for (const indicator of femaleIndicators) {
          const voice = voices.find(v => v.name.includes(indicator));
          if (voice) return voice;
        }
        return voices.find(v => v.name.includes('Google')) || voices[0] || null;
      };

      selectVoiceLocally().then(voiceToUse => {
        if (voiceToUse && !preferredVoice) {
          setPreferredVoice(voiceToUse);
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = speechRate;
        utterance.pitch = voiceFlavors[selectedVoiceFlavor as keyof typeof voiceFlavors].pitch;
        utterance.volume = 0.85;

        const voice = voiceToUse || preferredVoice;
        if (voice) {
          utterance.voice = voice;
        }

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
  };

  // Cleanup speech on component unmount
  React.useEffect(() => {
    return () => {
      stopSpeaking();
      // Remove any event listeners
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
        const sanitizedResponse = sanitizeMessageText(data.response);

        // Parse question and choices separately for clean UI
        const parts = sanitizedResponse.split('CHOICES:');
        const questionText = parts[0].replace('QUESTION:', '').trim();
        const choicesText = parts[1] || '';
        const choices = choicesText.match(/\d+\)\s*([^\n]+)/g)?.map(c => c.replace(/^\d+\)\s*/, '')) || [];

        const questionMsg: Message = {
          id: Date.now(),
          text: sanitizedResponse,
          isUser: false,
          questionText: questionText,
          choices: choices.length > 0 ? choices : undefined
        };
        setMessages(prev => [...prev, questionMsg]);
        setCurrentQuestion(sanitizedResponse);
        setAwaitingAnswer(true);

        // Speak only the question, not the choices
        speak(questionText, 0.85);
      }
    } catch (error) {
      const fallbackQuestionText = `How would you handle a memory leak in a ${skill} application?`;
      const fallbackChoices = [
        "Restart the application periodically",
        "Use memory profiling tools to identify the source",
        "Increase the available memory",
        "Ignore it until it crashes"
      ];
      const fallbackQuestion: Message = {
        id: Date.now(),
        text: `QUESTION: ${fallbackQuestionText}\n\nCHOICES:\n1) ${fallbackChoices[0]}\n2) ${fallbackChoices[1]}\n3) ${fallbackChoices[2]}\n4) ${fallbackChoices[3]}`,
        isUser: false,
        questionText: fallbackQuestionText,
        choices: fallbackChoices
      };
      setMessages(prev => [...prev, fallbackQuestion]);
      setCurrentQuestion(fallbackQuestion.text);
      setAwaitingAnswer(true);
      speak(fallbackQuestionText, 0.85);
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

Provide structured feedback with EXACTLY these three components:
1. STATUS: Correct or Wrong
2. CONTRAST: State the correct answer and specifically point out what was wrong with the user's answer "${answer}"
3. EXPLANATION: Explain WHY the correct answer is right using BEGINNER-FRIENDLY language. Use simple, relatable analogies. Avoid technical jargon or explain it simply if needed. Use conversational tone like explaining to a friend. Keep it concise (2-3 short sentences maximum).

CRITICAL INSTRUCTIONS:
- Return clean text only. NO markdown, NO asterisks, NO special characters. Use plain text format.
- Make explanations accessible to absolute beginners
- Use everyday analogies to explain complex concepts
- Format exactly as:
STATUS: [Correct/Wrong]
CONTRAST: [text without any special characters]
EXPLANATION: [beginner-friendly text without any special characters]

Then provide the next question with choices.`,
          skill: selectedSkill,
          mode: 'interview_feedback'
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Parse the structured feedback from the API response
        const responseText = data.response;
        const isCorrect = responseText.toLowerCase().includes('correct: yes') ||
                         responseText.toLowerCase().includes('status: correct');

        // Extract structured feedback components
        const status = isCorrect ? 'Correct' : 'Wrong' as const;

        // Parse contrast and explanation from response (with fallback)
        let contrast = '';
        let explanation = '';

        const contrastMatch = responseText.match(/contrast[:\s]+([^\n]+)/i);
        const explanationMatch = responseText.match(/explanation[:\s]+([^\n]+(?:\n[^\n]+)*)/i);

        if (contrastMatch) contrast = contrastMatch[1].trim();
        if (explanationMatch) explanation = explanationMatch[1].trim();

        // Fallback structured feedback format
        if (!contrast) {
          const correctAnswerMatch = responseText.match(/correct answer[:\s]+([^\n]+)/i);
          contrast = correctAnswerMatch
            ? `The correct answer is: ${correctAnswerMatch[1].trim()}. Your answer "${answer}" was not correct.`
            : `The correct answer differs from "${answer}".`;
        }

        if (!explanation) {
          explanation = "Understanding the underlying concepts and best practices for this skill area.";
        }

        // Clean the text to remove any markdown/special characters
        const cleanContrast = contrast.replace(/[\*\_\`\#]/g, '').trim();
        const cleanExplanation = explanation.replace(/[\*\_\`\#]/g, '').trim();

        const feedbackMsg: Message = {
          id: Date.now() + 1,
          text: `${status}: ${cleanContrast} ${cleanExplanation}`,
          isUser: false,
          isCorrect: isCorrect,
          feedbackStatus: status,
          feedbackContrast: cleanContrast,
          feedbackExplanation: cleanExplanation
        };
        setMessages(prev => [...prev, feedbackMsg]);

        // Speak the feedback and WAIT for completion before next question
        const speakText = `${status}. ${cleanContrast} ${cleanExplanation}`;

        // Set waiting state and speak with promise
        setIsWaitingForSpeech(true);
        await speakWithPromise(speakText, 0.9);
        setIsWaitingForSpeech(false);

        // Only after speech completes, move to next question
        if (selectedSkill) {
          askInterviewQuestion(selectedSkill);
        }
      }
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "Good effort! The correct approach involves understanding the underlying concepts. Let me ask another question...",
        isUser: false
      };
      setMessages(prev => [...prev, errorMsg]);

      // Wait for speech to complete before next question
      setIsWaitingForSpeech(true);
      await speakWithPromise("Good effort! Let me ask another question...", 0.9);
      setIsWaitingForSpeech(false);

      if (selectedSkill) askInterviewQuestion(selectedSkill);
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
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                      className="w-16"
                    />
                    <span className="text-xs w-8">{speechRate.toFixed(1)}x</span>
                  </div>
                </div>
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
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl cursor-pointer transition-all hover:bg-white/20 ${
                      msg.isUser ? 'bg-primary/20 border border-primary/30' :
                      msg.isCorrect !== undefined ? (msg.isCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30') :
                      'bg-white/10 border border-white/20'
                    }`}
                    onClick={() => !msg.isUser && speak(sanitizeMessageText(msg.text), 0.85)}
                  >
                    {/* Structured Feedback Display */}
                    {msg.feedbackStatus && msg.feedbackContrast && msg.feedbackExplanation ? (
                      <div className="space-y-3">
                        {/* Status Badge */}
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          msg.feedbackStatus === 'Correct'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {msg.feedbackStatus}
                        </div>

                        {/* Contrast Section */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-xs uppercase tracking-wider text-white/50 mb-1">Correct Answer vs Your Answer</div>
                          <p className="text-sm text-white/90">{msg.feedbackContrast}</p>
                        </div>

                        {/* Explanation Section */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-xs uppercase tracking-wider text-white/50 mb-1">Explanation</div>
                          <p className="text-sm text-white/90 leading-relaxed">{msg.feedbackExplanation}</p>
                        </div>
                      </div>
                    ) : (
                      /* Display only question text if available, hide raw choices text */
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.questionText || sanitizeMessageText(msg.text)}
                      </p>
                    )}

                    {/* MCQ Radio Buttons for Interview Mode - Only render radio buttons, no duplicate text */}
                    {mode === 'interview' && awaitingAnswer && !msg.isUser && msg.id === messages[messages.length - 1].id && (
                      <div className="mt-4 space-y-2">
                        {/* Render choices from parsed data if available */}
                        {msg.choices && msg.choices.length > 0 ? (
                          msg.choices.map((choice, index) => (
                            <label key={index} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                              <input
                                type="radio"
                                name="interview-answer"
                                value={choice}
                                onChange={(e) => handleAnswer(e.target.value)}
                                className="text-primary"
                              />
                              <span className="text-sm">{index + 1}. {choice}</span>
                            </label>
                          ))
                        ) : (
                          /* Fallback: Parse from text if choices not pre-parsed */
                          ['1', '2', '3', '4'].map(num => {
                            const choiceMatch = msg.text.match(new RegExp(`${num}\\)\\s*([^\\n]+)`));
                            if (choiceMatch) {
                              return (
                                <label key={num} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="interview-answer"
                                    value={choiceMatch[1]}
                                    onChange={(e) => handleAnswer(e.target.value)}
                                    className="text-primary"
                                  />
                                  <span className="text-sm">{num}. {choiceMatch[1]}</span>
                                </label>
                              );
                            }
                            return null;
                          })
                        )}
                      </div>
                    )}
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