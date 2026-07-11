'use client';

import React, { useState, useRef } from 'react';
import { Send, Loader2, Mic, MicOff, Volume2, VolumeX, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';

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
  // Separate question text from choices for clean display
  questionText?: DualText;
  choices?: string[];
  answered?: boolean;
  selectedAnswer?: string;
  // Comprehensive 8-section educational feedback for interview mode
  correctAnswerText?: string;
  whyCorrectIsCorrect?: string;
  userAnswerEvaluation?: string;
  whyOtherOptionsWrong?: string;
  technicalConcept?: string;
  productionPerspective?: string;
  commonMistakes?: string;
  keyLearningPoints?: string;
  nextQuestion?: string;
  // Validation metadata
  feedbackValidation?: {
    allSectionsPresent: boolean;
    consistentWithScenario: boolean;
    singleCorrectAnswer: boolean;
    regeneratedAttempts: number;
  };
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
          message: "Generate an interview scenario question with 4 options for " + skill,
          context: `INTERVIEW MODE for ${skill}:
Generate a REAL PRODUCTION interview question based on actual day-to-day engineering struggles and core concepts:

CRITICAL REQUIREMENTS:
- Focus on REAL troubleshooting scenarios engineers face daily
- Include specific commands, tools, file names, and configurations
- Base questions on CERTIFICATION-STYLE problems and production incidents
- Cover basic concepts, common failure modes, and real debugging approaches

FORMAT:
IDEA: [Specific production issue or certification question]
SCENARIO: [Detailed scenario with actual commands/files/configs mentioned]
OPTIONS:
1) [Specific command/tool/action]
2) [Specific command/tool/action]
3) [Specific command/tool/action]
4) [Specific command/tool/action]
CORRECT: [number 1-4]

EXAMPLE for ArgoCD:
IDEA: Argo CD shows service-a sync failing with ImagePullBackOff error
SCENARIO: Production deployment of service-a via Argo CD fails. The sync shows ImagePullBackOff in pod events. The argocd-app.yaml points to a private ECR repository.
OPTIONS:
1) Check `kubectl get events --field-selector involvedObject.name=service-a` to see pull errors
2) Verify imagePullSecrets exist and reference correct ECR credentials
3) Update syncPolicy to manual in argocd-app.yaml
4) Check application logs in Argo CD UI for repository connection issues
CORRECT: 2`,
          skill: skill,
          mode: 'interview_question'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const sanitizedResponse = sanitizeMessageText(data.response);

        // Parse scenario components like ScenarioSimulator
        const ideaMatch = sanitizedResponse.match(/IDEA:\s*([^\n]+)/i);
        const scenarioMatch = sanitizedResponse.match(/SCENARIO:\s*([^\n]+(?:\n(?![A-Z]+:)[^\n]+)*)/i);
        const optionsMatch = sanitizedResponse.match(/OPTIONS:\s*([\s\S]*?)(?=CORRECT:|$)/i);
        const correctMatch = sanitizedResponse.match(/CORRECT:\s*(\d)/i);

        const idea = ideaMatch ? ideaMatch[1].trim() : '';
        const scenario = scenarioMatch ? scenarioMatch[1].trim() : '';
        const optionsText = optionsMatch ? optionsMatch[1].trim() : '';
        const correct = correctMatch ? parseInt(correctMatch[1]) - 1 : 0; // Convert to 0-indexed

        const options = optionsText.match(/\d+\)\s*([^\n]+)/g)?.map(o => o.replace(/^\d+\)\s*/, '')) || [];

        // Store the full response for context but display structured
        // Create dual-text objects for display and audio
          const ideaDual: DualText = {
            displayText: idea,
            audioScript: idea
              .replace(/API/g, 'A P I')
              .replace(/URL/g, 'U R L')
              .replace(/AWS/g, 'A W S')
              .replace(/CI\/CD/g, 'C I and C D')
              .replace(/\/\//g, ' slash slash ')
              .replace(/\//g, ' slash ')
              .replace(/_/g, ' underscore ')
              .replace(/-/g, ' dash ')
          };

          const questionMsg: Message = {
            id: Date.now(),
            text: sanitizedResponse,
            isUser: false,
            questionText: ideaDual,
            choices: options.length > 0 ? options : undefined,
            // Store correct answer TEXT (not index) for proper feedback display
            correctAnswer: options[correct] || ''
          };
        setMessages(prev => [...prev, questionMsg]);
        setCurrentQuestion(sanitizedResponse);
        setAwaitingAnswer(true);

        // Speak the scenario idea
        speak(idea, 0.85);
      }
    } catch (error) {
      const fallbackIdea = `Troubleshooting ${skill} production issue`;
      const fallbackScenario = `Production ${skill} deployment failing. Check specific commands and configurations.`;
      const fallbackOptions = [
        `Run detailed logs check with specific ${skill} commands`,
        `Verify configuration files and secrets are correct`,
        `Check resource limits and scaling configuration`,
        `Validate network policies and connectivity`
      ];
      const fallbackCorrect = 0;
      const fallbackQuestion: Message = {
        id: Date.now(),
        text: `IDEA: ${fallbackIdea}\nSCENARIO: ${fallbackScenario}\nOPTIONS:\n1) ${fallbackOptions[0]}\n2) ${fallbackOptions[1]}\n3) ${fallbackOptions[2]}\n4) ${fallbackOptions[3]}\nCORRECT: ${fallbackCorrect + 1}`,
        isUser: false,
        questionText: { displayText: fallbackIdea, audioScript: fallbackIdea },
        choices: fallbackOptions,
        correctAnswer: fallbackOptions[fallbackCorrect]
      };
      setMessages(prev => [...prev, fallbackQuestion]);
      setCurrentQuestion(fallbackQuestion.text);
      setAwaitingAnswer(true);
      speak(fallbackIdea, 0.85);
    }

    setIsLoading(false);
  };

  // Validation function for comprehensive 8-section feedback
  const validateFeedback = (feedback: any, originalQuestion: string): {
    isValid: boolean;
    missingSections: string[];
    inconsistencies: string[];
  } => {
    const requiredSections = [
      'correctAnswer', 'whyCorrectIsCorrect', 'userAnswerEvaluation',
      'whyOtherOptionsWrong', 'technicalConcept', 'productionPerspective',
      'commonMistakes', 'keyLearningPoints'
    ];

    const missingSections: string[] = [];
    const inconsistencies: string[] = [];

    // Check all required sections are present and non-empty
    requiredSections.forEach(section => {
      if (!feedback[section] || feedback[section].trim().length < 10) {
        missingSections.push(section);
      }
    });

    // Check that explanations reference the correct answer
    if (feedback.correctAnswer && feedback.whyCorrectIsCorrect) {
      const correctAnswerText = feedback.correctAnswer.toLowerCase();
      const explanationLower = feedback.whyCorrectIsCorrect.toLowerCase();
      if (!explanationLower.includes(correctAnswerText.substring(0, 20))) {
        inconsistencies.push('whyCorrectIsCorrect does not reference the correct answer');
      }
    }

    // Check scenario consistency
    if (originalQuestion && feedback.technicalConcept) {
      // Extract key terms from scenario
      const scenarioWords = originalQuestion.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const explanationWords = feedback.technicalConcept.toLowerCase();
      const scenarioWordCount = scenarioWords.length;
      const matchedCount = scenarioWords.filter(word => explanationWords.includes(word)).length;
      if (scenarioWordCount > 0 && matchedCount / scenarioWordCount < 0.2) {
        inconsistencies.push('technicalConcept does not reference the original scenario');
      }
    }

    // Check single correct answer consistency
    if (feedback.correctAnswer && originalQuestion) {
      // Count how many times the answer appears in the question
      const occurrences = (originalQuestion.match(new RegExp(feedback.correctAnswer.substring(0, 15), 'gi')) || []).length;
      if (occurrences > 1) {
        inconsistencies.push('Multiple options match the correct answer text');
      }
    }

    return {
      isValid: missingSections.length === 0 && inconsistencies.length === 0,
      missingSections,
      inconsistencies
    };
  };

  // Enhanced interview feedback handler with validation and regeneration
  const handleAnswer = async (answer: string, regenerationAttempt = 0) => {
    if (!selectedSkill || !awaitingAnswer) return;

    // Prevent infinite regeneration
    if (regenerationAttempt > 3) {
      // Fall back to basic feedback after 3 attempts
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "Good effort! Let me ask the next question...",
        isUser: false
      };
      setMessages(prev => [...prev, errorMsg]);
      if (selectedSkill) askInterviewQuestion(selectedSkill);
      return;
    }

    // Mark the question as answered and store the selected answer
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `User answered: ${answer}`,
          context: `INTERVIEW MODE FEEDBACK for ${selectedSkill}:
Previous question: ${currentQuestion}
User's answer: ${answer}

CRITICAL REQUIREMENTS:
1. Provide comprehensive educational feedback following the mandatory 8-section format
2. Ensure all explanations are thorough and reference the specific scenario
3. Generate the next question in the nextQuestion field
4. All sections must be detailed and educational`,
          skill: selectedSkill,
          mode: 'interview_feedback'
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Try to parse JSON feedback response
        let structuredFeedback: any = null;
        try {
          const jsonMatch = data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            structuredFeedback = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.log('Could not parse JSON interview feedback:', e);
        }

        // Validate the feedback if structured feedback exists
        if (structuredFeedback) {
          const validation = validateFeedback(structuredFeedback, currentQuestion);

          if (!validation.isValid) {
            console.log('Feedback validation failed:', validation);

            // Regenerate if validation fails and we haven't exceeded attempts
            if (regenerationAttempt < 3) {
              setIsLoading(false);
              // Retry with incremented attempt count
              setTimeout(() => {
                handleAnswer(answer, regenerationAttempt + 1);
              }, 500);
              return;
            }
          }

          // Check if we have the minimum required sections for display
          const requiredForDisplay = ['correctAnswer', 'whyCorrectIsCorrect', 'technicalConcept'];
          const hasRequiredSections = requiredForDisplay.every(section =>
            structuredFeedback[section] && structuredFeedback[section].trim().length > 10
          );

          if (!hasRequiredSections && regenerationAttempt < 3) {
            setIsLoading(false);
            setTimeout(() => {
              handleAnswer(answer, regenerationAttempt + 1);
            }, 500);
            return;
          }
        }

        // Get the last question message to extract the correct answer
        const lastQuestionMsg = messages.slice().reverse().find(m => m.choices);

        // Determine if answer is correct by comparing with last question
        const lastQMsg = messages.slice().reverse().find(m => m.choices);
        const isAnswerCorrect = lastQMsg?.correctAnswer === answer;

        // Process structured educational feedback
        if (structuredFeedback && structuredFeedback.correctAnswer) {
          const feedbackMsg: Message = {
            id: Date.now() + 1,
            text: isAnswerCorrect
              ? `✅ Correct! ${structuredFeedback.correctAnswer}`
              : `❌ Wrong! The correct answer is: ${structuredFeedback.correctAnswer}`,
            isUser: false,
            isCorrect: isAnswerCorrect,
            // Comprehensive 8-section educational feedback
            correctAnswerText: structuredFeedback.correctAnswer,
            whyCorrectIsCorrect: structuredFeedback.whyCorrectIsCorrect,
            userAnswerEvaluation: structuredFeedback.userAnswerEvaluation,
            whyOtherOptionsWrong: structuredFeedback.whyOtherOptionsWrong,
            technicalConcept: structuredFeedback.technicalConcept,
            productionPerspective: structuredFeedback.productionPerspective,
            commonMistakes: structuredFeedback.commonMistakes,
            keyLearningPoints: structuredFeedback.keyLearningPoints,
            // Validation metadata
            feedbackValidation: {
              allSectionsPresent: true,
              consistentWithScenario: true,
              singleCorrectAnswer: true,
              regeneratedAttempts: regenerationAttempt
            },
            // Store the next question if provided
            nextQuestion: structuredFeedback.nextQuestion
          };

          setMessages(prev => [...prev, feedbackMsg]);

          // Speak the comprehensive feedback
          const speakText = `The correct answer is ${structuredFeedback.correctAnswer}. ${structuredFeedback.whyCorrectIsCorrect?.substring(0, 200) || ''}`;

          setIsWaitingForSpeech(true);
          await speakWithPromise(speakText, 0.9);
          setIsWaitingForSpeech(false);

          // Use the next question from feedback or generate new one
          if (selectedSkill) {
            if (structuredFeedback.nextQuestion) {
              // Parse and display the next question from feedback
              const nextQuestionData = structuredFeedback.nextQuestion;
              // For now, generate a new question to maintain flow
              askInterviewQuestion(selectedSkill);
            } else {
              askInterviewQuestion(selectedSkill);
            }
          }
        } else {
          // Fallback to legacy feedback format if JSON parsing fails
          const responseText = data.response;
          const statusMatch = responseText.match(/STATUS:\s*(Correct|Wrong)/i);
          const status = (statusMatch ? statusMatch[1] : (responseText.toLowerCase().includes('correct') ? 'Correct' : 'Wrong')) as 'Correct' | 'Wrong';
          const isCorrect = status === 'Correct';

          let displayContrast = '';
          const contrastMatch = responseText.match(/CONTRAST:\s*([^\n]+(?:\n[^\n]+)*?)(?=\nEXPLANATION:|$)/i);
          if (contrastMatch) {
            displayContrast = contrastMatch[1].trim().replace(/\n/g, ' ');
          }

          let displayExplanation = '';
          const explanationMatch = responseText.match(/EXPLANATION:\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\n|$)/i);
          if (explanationMatch) {
            displayExplanation = explanationMatch[1].trim().replace(/\n/g, ' ').split(/[.!?]+/).slice(0, 3).join('. ').trim();
            if (displayExplanation && !displayExplanation.endsWith('.')) displayExplanation += '.';
          }

          if (!displayContrast) {
            const correctText = lastQuestionMsg?.correctAnswer || "the correct answer";
            displayContrast = `The correct answer is "${correctText}". Your answer was "${answer}".`;
          }
          if (!displayExplanation) {
            displayExplanation = "Understanding the underlying concepts requires careful consideration of the practical implications and best practices in this domain.";
          }

          const cleanDisplayContrast = displayContrast.replace(/[\*\_\`\#]/g, '').trim();
          const cleanDisplayExplanation = displayExplanation.replace(/[\*\_\`\#]/g, '').trim();

          const createAudioScript = (text: string): string => {
            return text.replace(/API/g, 'A P I').replace(/URL/g, 'U R L').replace(/AWS/g, 'A W S');
          };

          const contrastDual: DualText = {
            displayText: cleanDisplayContrast,
            audioScript: createAudioScript(cleanDisplayContrast)
          };
          const explanationDual: DualText = {
            displayText: cleanDisplayExplanation,
            audioScript: createAudioScript(cleanDisplayExplanation)
          };

          const textAnswerMatch = cleanDisplayContrast.match(/correct answer is\s*[""]([^""]+)[""]/i);
          const correctAnswerText = textAnswerMatch ? textAnswerMatch[1].trim() : cleanDisplayContrast;

          const fallbackMsg: Message = {
            id: Date.now() + 1,
            text: `${status}: ${cleanDisplayContrast} ${cleanDisplayExplanation}`,
            isUser: false,
            isCorrect: isCorrect,
            feedbackStatus: status,
            feedbackContrast: contrastDual,
            feedbackExplanation: explanationDual,
            correctAnswer: correctAnswerText,
            feedbackValidation: {
              allSectionsPresent: false,
              consistentWithScenario: false,
              singleCorrectAnswer: true,
              regeneratedAttempts: regenerationAttempt
            }
          };

          setMessages(prev => [...prev, fallbackMsg]);

          const speakText = `${status}. ${cleanDisplayContrast} ${cleanDisplayExplanation}`;
          setIsWaitingForSpeech(true);
          await speakWithPromise(speakText, 0.9);
          setIsWaitingForSpeech(false);

          if (selectedSkill) askInterviewQuestion(selectedSkill);
        }
      }
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "Good effort! The correct approach involves understanding the underlying concepts. Let me ask another question...",
        isUser: false
      };
      setMessages(prev => [...prev, errorMsg]);

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
                    {/* Structured Feedback Display - Show correct answer with explanation */}
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

                        {/* Contrast Section - Shows which choice is correct */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-xs uppercase tracking-wider text-white/50 mb-1">Correct Choice Revealed</div>
                          <p className="text-sm text-white/90 font-medium">{msg.feedbackContrast?.displayText}</p>
                        </div>

                        {/* Explanation Section */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-xs uppercase tracking-wider text-white/50 mb-1">Why This Is Correct</div>
                          <p className="text-sm text-white/90 leading-relaxed">{msg.feedbackExplanation?.displayText}</p>
                        </div>
                      </div>
                    ) : (
                      /* Display only question text if available, hide raw choices text */
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {(msg.questionText?.displayText) || sanitizeMessageText(msg.text)}
                      </p>
                    )}

                    {/* MCQ Radio Buttons for Interview Mode - Keep visible after answering, only disable */}
                    {mode === 'interview' && !msg.isUser && msg.choices && (
                      <div className="mt-4 space-y-2">
                        {msg.choices.map((choice, index) => {
                          const isAnswered = msg.answered === true;
                          const isSelected = msg.selectedAnswer === choice;
                          const isCorrect = isAnswered && msg.correctAnswer === choice;

                          return (
                            <label
                              key={index}
                              className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                                isAnswered
                                  ? isCorrect
                                    ? 'bg-green-500/20 border border-green-500/50'
                                    : isSelected
                                      ? 'bg-red-500/20 border border-red-500/50'
                                      : 'bg-white/5'
                                  : 'bg-white/5 hover:bg-white/10 cursor-pointer'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`interview-answer-${msg.id}`}
                                value={choice}
                                checked={isSelected}
                                onChange={(e) => !isAnswered && handleAnswer(e.target.value)}
                                disabled={isAnswered}
                                className="text-primary"
                              />
                              <span className="text-sm">
                                {index + 1}. {choice}
                                {isAnswered && isCorrect && " ✓"}
                                {isAnswered && isSelected && !isCorrect && " ✗"}
                              </span>
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