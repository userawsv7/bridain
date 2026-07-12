'use client';

import React, { useState, useRef } from 'react';
import { Send, Loader2, Mic, MicOff, Volume2, VolumeX, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { PromptContext, UserSkillLevel, EvaluationSchema } from '../lib/ai/types/ai';
import { buildSystemPrompt } from '../lib/ai/prompts/systemPrompts';
import { buildEvaluatorPrompt } from '../lib/ai/prompts/evaluatorPrompts';
import { parseEvaluationResponse } from '../lib/ai/utils/responseParser';

interface DualText {
  displayText: string;
  audioScript: string;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isCorrect?: boolean;
  showAnswer?: boolean;
  correctAnswer?: string;
  explanation?: DualText;
  feedbackStatus?: 'Correct' | 'Wrong';
  feedbackContrast?: DualText;
  feedbackExplanation?: DualText;
  questionText?: DualText;
  choices?: string[];
  answered?: boolean;
  selectedAnswer?: string;
  // Session 3 Enhanced: Production decision reasoning fields
  correctAnswerText?: string;
  whyCorrectIsCorrect?: string;
  userAnswerEvaluation?: string;
  whyOtherOptionsWrong?: string;
  technicalConcept?: string;
  productionPerspective?: string;
  commonMistakes?: string;
  keyLearningPoints?: string;
  nextQuestion?: string;
  socraticQuestion?: string;
  staffEngineerAnswer?: string;
  tradeoffs?: string[];
  risks?: string[];
  businessImpact?: string;
  detectedSkillLevel?: UserSkillLevel;
}

type Mode = 'learning' | 'interview';

export function VoiceCoachEnhanced() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "🎙️ Welcome to Enhanced Voice Coach!\n\nAI-powered interview practice with production decision reasoning.", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('interview');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);
  const [selectedVoiceFlavor, setSelectedVoiceFlavor] = useState('Female');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [questionCount, setQuestionCount] = useState(0);
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [detectedSkillLevel, setDetectedSkillLevel] = useState<UserSkillLevel>('Intermediate');
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);

  const voiceFlavors = {
    Female: { name: 'Female', pitch: 1.1, description: 'Professional female voice' }
  };

  const utteranceRef = useRef<SpeechSynthesisVoice | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const sanitizeForTTS = (text: string): string => {
    return text
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_{1,2}/g, '')
      .replace(/`{1,3}/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const speakWithPromise = (text: string, rate: number = 0.9): Promise<void> => {
    return new Promise((resolve) => {
      if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      stopSpeaking();
      const cleanText = sanitizeForTTS(text);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;
      utterance.pitch = voiceFlavors[selectedVoiceFlavor as keyof typeof voiceFlavors].pitch;
      utterance.volume = 0.85;

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
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
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

  const toggleMute = () => {
    if (!isMuted) {
      stopSpeaking();
    }
    setIsMuted(!isMuted);
  };

  // Enhanced: Generate domain-adaptive interview questions using centralized prompts
  const generateAdaptiveQuestion = async (skill: string, history: string[]): Promise<string> => {
    const promptContext: PromptContext = {
      domain: skill as any,
      topic: `Interview preparation for ${skill}`,
      skillLevel: detectedSkillLevel,
      learningGoal: 'Interview Prep',
      previousContext: history.length > 0 ? history.slice(-2).join('; ') : undefined
    };

    const systemPrompt = buildSystemPrompt(promptContext);
    const questionPrompt = `${systemPrompt}

Generate an interview question that tests PRODUCTION DECISION REASONING for ${skill}.
Focus on day-to-day engineering realities where the candidate must explain WHY they chose a specific option.

REQUIREMENTS:
- Test decision-making under production pressure
- Include specific technical constraints and trade-offs
- Force justification of Cost, Performance, Security, Scalability choices
- Reference real day-to-day engineering activities
- Avoid generic questions - be specific to actual production scenarios

FORMAT:
SCENARIO: [Specific production context with exact parameters]
CONSTRAINTS: [Technical/business constraints]
DECISION POINT: [Clear choice between alternatives]
OPTIONS:
1) [Specific technical approach with exact commands/configs]
2) [Specific technical approach with exact commands/configs]
3) [Specific technical approach with exact commands/configs]
4) [Specific technical approach with exact commands/configs]

Generate questions that simulate elite technical interviews and architectural reviews.`;

    return questionPrompt;
  };

  const askInterviewQuestion = async (skill: string) => {
    setIsLoading(true);

    try {
      const questionPrompt = await generateAdaptiveQuestion(skill, conversationHistory);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate production decision reasoning interview question for ${skill}`,
          context: questionPrompt,
          skill: skill,
          mode: 'interview_question'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const sanitizedResponse = data.response;

        // Parse the enhanced scenario format
        const scenarioMatch = sanitizedResponse.match(/SCENARIO:\s*([^\n]+(?:\n(?![A-Z]+:)[^\n]+)*)/i);
        const constraintsMatch = sanitizedResponse.match(/CONSTRAINTS:\s*([^\n]+(?:\n(?![A-Z]+:)[^\n]+)*)/i);
        const decisionMatch = sanitizedResponse.match(/DECISION POINT:\s*([^\n]+)/i);
        const optionsMatch = sanitizedResponse.match(/OPTIONS:\s*([\s\S]*?)(?=\n\n|$)/i);

        const scenario = scenarioMatch ? scenarioMatch[1].trim() : '';
        const constraints = constraintsMatch ? constraintsMatch[1].trim() : '';
        const decision = decisionMatch ? decisionMatch[1].trim() : '';

        const options = optionsMatch ?
          optionsMatch[1].match(/\d+\)\s*([^\n]+)/g)?.map((o: string) => o.replace(/^\d+\)\s*/, '')) || [] :
          [];

        const questionText = `${scenario}\n\n${constraints}\n\n${decision}`;

        const questionMsg: Message = {
          id: Date.now(),
          text: sanitizedResponse,
          isUser: false,
          questionText: { displayText: questionText, audioScript: questionText },
          choices: options.length > 0 ? options : undefined,
          correctAnswer: ''
        };

        setMessages(prev => [...prev, questionMsg]);
        setCurrentQuestion(sanitizedResponse);
        setAwaitingAnswer(true);
        setConversationHistory(prev => [...prev, questionText]);
        await speak(questionText, speechRate);
      }
    } catch (error) {
      // Fallback question with production focus
      const fallbackMsg: Message = {
        id: Date.now(),
        text: `Production scenario for ${skill}`,
        isUser: false,
        questionText: {
          displayText: `Production ${skill} deployment failing under load with memory constraints`,
          audioScript: `Production ${skill} deployment failing under load with memory constraints`
        },
        choices: [
          "Scale horizontally without investigating root cause",
          "Profile memory usage and optimize before scaling",
          "Increase memory limits and restart pods",
          "Roll back to previous stable version"
        ],
        correctAnswer: "Profile memory usage and optimize before scaling"
      };

      setMessages(prev => [...prev, fallbackMsg]);
      setCurrentQuestion(fallbackMsg.text);
      setAwaitingAnswer(true);
      await speak(fallbackMsg.questionText!.displayText, speechRate);
    }

    setIsLoading(false);
  };

  // Enhanced: Production Decision Reasoning with Central AI
  const evaluateAnswer = async (answer: string): Promise<EvaluationSchema | null> => {
    if (!selectedSkill) return null;

    const promptContext: PromptContext = {
      domain: selectedSkill as any,
      topic: `Production decision evaluation for ${selectedSkill}`,
      skillLevel: detectedSkillLevel,
      learningGoal: 'Interview Prep',
      previousContext: currentQuestion
    };

    const evaluatorPrompt = buildEvaluatorPrompt(promptContext, answer);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Evaluate production decision: ${answer}`,
          context: evaluatorPrompt,
          skill: selectedSkill,
          mode: 'evaluation'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const evaluation = parseEvaluationResponse(data.response, true);

        // Update detected skill level based on evaluation
        if (evaluation && 'assessment' in evaluation && evaluation.assessment?.detectedSkillLevel) {
          setDetectedSkillLevel(evaluation.assessment.detectedSkillLevel);
        }

        return evaluation as EvaluationSchema;
      }
    } catch (error) {
      console.error('Evaluation failed:', error);
    }

    return null;
  };

  const handleAnswer = async (answer: string) => {
    if (!selectedSkill || !awaitingAnswer) return;

    // Mark question as answered
    setMessages(prev => prev.map(msg => {
      if (msg.choices && !msg.answered) {
        return { ...msg, answered: true, selectedAnswer: answer };
      }
      return msg;
    }));

    const userMsg: Message = {
      id: Date.now(),
      text: `Your answer: ${answer}`,
      isUser: true
    };
    setMessages(prev => [...prev, userMsg]);
    setAwaitingAnswer(false);
    setIsLoading(true);

    try {
      // Get structured evaluation using central AI
      const evaluation = await evaluateAnswer(answer);

      if (evaluation && 'assessment' in evaluation) {
        // Create enhanced feedback message with production decision reasoning
        const feedbackMsg: Message = {
          id: Date.now() + 1,
          text: evaluation.assessment.status === 'correct'
            ? `✅ Excellent production decision!`
            : `❌ Decision needs refinement for production scenarios`,
          isUser: false,
          isCorrect: evaluation.assessment.status === 'correct',
          // Map evaluation schema to enhanced message fields
          correctAnswerText: evaluation.comprehensiveCoaching.betterAnswer,
          whyCorrectIsCorrect: evaluation.comprehensiveCoaching.whyExplanation,
          userAnswerEvaluation: evaluation.communicationCoaching.clarity,
          whyOtherOptionsWrong: evaluation.technicalAccuracy.summary,
          technicalConcept: evaluation.comprehensiveCoaching.productionRelevance,
          productionPerspective: evaluation.comprehensiveCoaching.staffEngineerAnswer,
          commonMistakes: evaluation.comprehensiveCoaching.commonPitfalls.join('; '),
          keyLearningPoints: evaluation.nextSteps.socraticQuestion,
          // Session 3 enhancements
          staffEngineerAnswer: evaluation.comprehensiveCoaching.staffEngineerAnswer,
          tradeoffs: evaluation.comprehensiveCoaching.tradeoffs,
          risks: evaluation.comprehensiveCoaching.risks,
          businessImpact: evaluation.communicationCoaching.interviewPerspective,
          detectedSkillLevel: evaluation.assessment.detectedSkillLevel,
          socraticQuestion: evaluation.nextSteps.socraticQuestion,
          nextQuestion: evaluation.nextSteps.suggestedTopics[0]
        };

        setMessages(prev => [...prev, feedbackMsg]);

        // Speak the key points
        const speakText = `${evaluation.assessment.status}. ${evaluation.comprehensiveCoaching.whyExplanation.substring(0, 300)}`;
        await speak(speakText, 0.9);
      }

      // Continue with adaptive questioning
      if (selectedSkill) {
        setTimeout(() => askInterviewQuestion(selectedSkill), 2000);
      }

    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "Good effort! Let me analyze this decision and ask a targeted follow-up...",
        isUser: false
      };
      setMessages(prev => [...prev, errorMsg]);

      if (selectedSkill) {
        setTimeout(() => askInterviewQuestion(selectedSkill), 1500);
      }
    }

    setIsLoading(false);
    setInput('');
  };

  const handleSkillSubmit = () => {
    if (!input.trim()) return;
    const skill = input.trim();
    setSelectedSkill(skill);

    const welcomeMsg: Message = {
      id: Date.now(),
      text: `🎤 Enhanced Interview Mode: ${skill}\n\nI'll evaluate your production decision reasoning with adaptive difficulty.\n\nSkill level starts at ${detectedSkillLevel} and adjusts based on responses.`,
      isUser: false
    };
    setMessages(prev => [...prev, welcomeMsg]);
    setInput('');

    setTimeout(() => askInterviewQuestion(skill), 1000);
  };

  const resetCoach = () => {
    stopSpeaking();
    setMessages([{ id: 0, text: "🎙️ Welcome to Enhanced Voice Coach!\n\nAI-powered interview practice with production decision reasoning.", isUser: false }]);
    setSelectedSkill(null);
    setInput('');
    setAwaitingAnswer(false);
    setCurrentQuestion('');
    setIsMuted(false);
    setConversationHistory([]);
    setDetectedSkillLevel('Intermediate');
    setQuestionCount(0);
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
              <h3 className="text-2xl font-bold">Enhanced Voice Coach</h3>
              <p className="text-white/60">Production decision reasoning • Dynamic adaptation • Staff engineer level</p>
              {selectedSkill && (
                <div className="text-sm text-primary mt-1">
                  Level: {detectedSkillLevel} • Domain: {selectedSkill}
                </div>
              )}
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
            <div>
              <p className="text-lg mb-4">What skill would you like to practice with production scenarios?</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSkillSubmit()}
                  placeholder="Enter any skill (Docker, React, System Design, Kubernetes...)"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none"
                />
                <button
                  onClick={handleSkillSubmit}
                  disabled={!input.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50 font-medium"
                >
                  Start Production Interview
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30">
                  🎤 Production Interview: <span className="font-bold">{selectedSkill}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className={`p-2 rounded-xl transition-all ${isMuted ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button onClick={stopSpeaking} disabled={!isSpeaking} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50">
                  <MicOff className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xs text-white/60">Rate:</span>
                  <button onClick={() => setSpeechRate(Math.max(0.5, speechRate - 0.1))} className="px-1.5 py-0.5 rounded hover:bg-white/10">-</button>
                  <span className="text-xs font-medium w-8 text-center">{speechRate.toFixed(1)}</span>
                  <button onClick={() => setSpeechRate(Math.min(2.0, speechRate + 0.1))} className="px-1.5 py-0.5 rounded hover:bg-white/10">+</button>
                </div>
                <button
                  onClick={() => selectedSkill && askInterviewQuestion(selectedSkill)}
                  disabled={questionCount >= 5 || isLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50 text-sm font-medium"
                >
                  Generate Question
                </button>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 h-[500px] overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-4 rounded-2xl ${msg.isUser ? 'bg-primary/20 border border-primary/30' : 'bg-white/10 border border-white/20'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">
                      {(msg.questionText?.displayText) || msg.text}
                    </p>

                    {/* Enhanced Production Decision Reasoning UI Cards */}
                    {msg.staffEngineerAnswer && (
                      <div className="space-y-3 mt-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                          <div className="text-xs text-blue-400 font-medium mb-1">STAFF ENGINEER ANSWER</div>
                          <p className="text-sm">{msg.staffEngineerAnswer}</p>
                        </div>

                        {msg.tradeoffs && msg.tradeoffs.length > 0 && (
                          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                            <div className="text-xs text-yellow-400 font-medium mb-1">TRADE-OFFS</div>
                            <ul className="text-sm space-y-1">
                              {msg.tradeoffs.map((tradeoff, idx) => <li key={idx}>• {tradeoff}</li>)}
                            </ul>
                          </div>
                        )}

                        {msg.risks && msg.risks.length > 0 && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <div className="text-xs text-red-400 font-medium mb-1">PRODUCTION RISKS</div>
                            <ul className="text-sm space-y-1">
                              {msg.risks.map((risk, idx) => <li key={idx}>• {risk}</li>)}
                            </ul>
                          </div>
                        )}

                        {msg.businessImpact && (
                          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                            <div className="text-xs text-green-400 font-medium mb-1">BUSINESS IMPACT</div>
                            <p className="text-sm">{msg.businessImpact}</p>
                          </div>
                        )}

                        {msg.socraticQuestion && (
                          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                            <div className="text-xs text-purple-400 font-medium mb-1">SOCRATIC FOLLOW-UP</div>
                            <p className="text-sm">{msg.socraticQuestion}</p>
                          </div>
                        )}

                        {msg.detectedSkillLevel && (
                          <div className="text-xs text-white/50">
                            Detected Level: {msg.detectedSkillLevel}
                          </div>
                        )}
                      </div>
                    )}

                    {/* MCQ Choices */}
                    {msg.choices && (
                      <div className="mt-4 space-y-2">
                        {msg.choices.map((choice, index) => {
                          const isAnswered = msg.answered === true;
                          const isSelected = msg.selectedAnswer === choice;
                          const isCorrect = isAnswered && msg.correctAnswer === choice;

                          return (
                            <label key={index} className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                              isAnswered ? isCorrect ? 'bg-green-500/20 border border-green-500/50' : isSelected ? 'bg-red-500/20 border border-red-500/50' : 'bg-white/5'
                              : 'bg-white/5 hover:bg-white/10 cursor-pointer'
                            }`}>
                              <input type="radio" name={`answer-${msg.id}`} value={choice}
                                checked={isSelected} onChange={(e) => !isAnswered && handleAnswer(e.target.value)}
                                disabled={isAnswered} className="text-primary" />
                              <span className="text-sm">{choice} {isAnswered && isCorrect && " ✓"} {isAnswered && isSelected && !isCorrect && " ✗"}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && <div className="flex justify-start"><div className="p-4 rounded-2xl bg-white/10"><Loader2 className="w-5 h-5 animate-spin" /></div></div>}
              {isSpeaking && <div className="flex justify-start"><div className="p-2 rounded-xl bg-primary/20"><Volume2 className="w-4 h-4 animate-pulse" /></div></div>}
            </div>

            <div className="flex gap-3">
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && awaitingAnswer && handleAnswer(input)}
                placeholder={awaitingAnswer ? "Type your production decision..." : "Waiting for next scenario..."}
                disabled={!awaitingAnswer} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none disabled:opacity-50" />
              <button onClick={() => awaitingAnswer && handleAnswer(input)}
                disabled={!input.trim() || isLoading || !awaitingAnswer}
                className="p-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}