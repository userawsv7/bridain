'use client';

import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Scenario {
  id: number;
  title: string;
  category: string;
  emoji: string;
  description: string;
  scenario: string;
  options: string[];
  correct: number;
  explanation: string;
  tip: string;
}

const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Docker Container Failing",
    category: "DevOps",
    emoji: "🐳",
    description: "Your container keeps crashing on startup",
    scenario: "🚨 Container 'app-backend' exits with code 1. Logs show 'port already in use'. What do you do?",
    options: [
      "🔄 Restart the container with docker restart",
      "🔍 Check for conflicting processes: `docker ps` and kill the process using port 8080",
      "🗑️ Delete all containers and start fresh",
      "📝 Ignore the error and use a different port"
    ],
    correct: 1,
    explanation: "Always investigate port conflicts first! Use `lsof -i :8080` or `netstat -tulpn` to find what's using the port.",
    tip: "💡 Pro tip: Use `docker compose` to manage ports automatically!"
  },
  {
    id: 2,
    title: "Kubernetes Pod CrashLoop",
    category: "DevOps",
    emoji: "☸️",
    description: "Pod keeps restarting in a loop",
    scenario: "⚠️ Pod 'api-deployment-7f9d8' is in CrashLoopBackOff. What's your first action?",
    options: [
      "🔄 Scale up the deployment to 3 replicas",
      "🔍 Check pod logs: `kubectl logs -f pod/api-deployment-7f9d8`",
      "🛑 Delete the pod and let it recreate",
      "⚙️ Increase CPU limits in the deployment"
    ],
    correct: 1,
    explanation: "Always check logs first! CrashLoopBackOff usually indicates application errors or misconfiguration.",
    tip: "🎯 Use `kubectl describe pod` to see events and failure reasons!"
  },
  {
    id: 3,
    title: "CI/CD Pipeline Failure",
    category: "DevOps",
    emoji: "🔄",
    description: "Build failing in GitHub Actions",
    scenario: "💥 GitHub Actions workflow fails at 'npm test' step. Tests pass locally. What's wrong?",
    options: [
      "🐛 Tests are flaky, increase timeout",
      "🔧 Check if dependencies differ: use exact versions in package-lock.json",
      "🚫 Skip tests in CI temporarily",
      "📦 Increase runner resources"
    ],
    correct: 1,
    explanation: "Environment differences are common! Ensure consistent Node versions and dependencies between local and CI.",
    tip: "✨ Use `.nvmrc` file and same Node version in CI as locally!"
  },
  {
    id: 4,
    title: "ML Model Training Stuck",
    category: "MLOps",
    emoji: "🤖",
    description: "Training job not progressing",
    scenario: "📊 Your PyTorch training has been running for 6 hours with no progress. GPU utilization is 0%.",
    options: [
      "⏳ Wait longer, training takes time",
      "🔍 Check data loading: verify dataset path and batch size",
      "🔥 Increase learning rate",
      "💾 Save checkpoint and restart"
    ],
    correct: 1,
    explanation: "0% GPU means data isn't reaching the GPU! Check data loading pipeline and ensure CUDA tensors.",
    tip: "🎯 Use `nvidia-smi` to monitor GPU usage in real-time!"
  },
  {
    id: 5,
    title: "API Rate Limiting",
    category: "API",
    emoji: "🌐",
    description: "429 Too Many Requests error",
    scenario: "🚫 Your API calls are getting rate limited. How do you handle this gracefully?",
    options: [
      "🔥 Make requests faster to finish before limit",
      "⏱️ Implement exponential backoff with jitter: retry with increasing delays",
      "🔑 Request higher rate limits from provider",
      "🗑️ Cache all responses indefinitely"
    ],
    correct: 1,
    explanation: "Exponential backoff prevents overwhelming the API! Add random jitter to avoid thundering herd.",
    tip: "💡 Libraries like `retry` or `p-retry` make this easy!"
  }
];

export function ScenarioSimulator() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  const scenario = scenarios[currentScenario];

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === scenario.correct;
    if (isCorrect) {
      setScore(score + 1);
      toast.success(`Correct! +10 XP 🎉`, {
        description: scenario.tip,
      });
    } else {
      toast.error(`Not quite right 😅`, {
        description: scenario.explanation,
      });
    }

    if (!completed.includes(scenario.id)) {
      setCompleted([...completed, scenario.id]);
    }
  };

  const nextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      toast.success(`Simulation Complete! 🏆`, {
        description: `You scored ${score + (selectedAnswer === scenario.correct ? 1 : 0)}/${scenarios.length}`,
      });
    }
  };

  const resetSimulation = () => {
    setCurrentScenario(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompleted([]);
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
              {scenario.category} {scenario.emoji}
            </div>
            <div className="text-sm text-white/60">
              Scenario {currentScenario + 1} of {scenarios.length}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div>Score: <span className="font-bold text-accent">{score}</span></div>
            <button
              onClick={resetSimulation}
              className="text-white/60 hover:text-white transition-colors"
            >
              Restart 🔄
            </button>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${((currentScenario) / scenarios.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Scenario Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScenario}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass rounded-3xl p-8 space-y-6"
        >
          <div>
            <h3 className="text-3xl font-bold mb-2">{scenario.emoji} {scenario.title}</h3>
            <p className="text-white/60">{scenario.description}</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-lg leading-relaxed">{scenario.scenario}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {scenario.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showResult && handleAnswer(index)}
                disabled={showResult}
                className={`w-full p-4 rounded-2xl text-left transition-all ${
                  showResult
                    ? index === scenario.correct
                      ? 'bg-green-500/20 border-2 border-green-500'
                      : index === selectedAnswer
                      ? 'bg-red-500/20 border-2 border-red-500'
                      : 'bg-white/5 border border-white/10 opacity-50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && index === scenario.correct && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {showResult && index === selectedAnswer && index !== scenario.correct && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Result Explanation */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-6 rounded-2xl bg-white/5 space-y-4"
              >
                <div>
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    {selectedAnswer === scenario.correct ? '✅ Correct!' : '❌ Incorrect'}
                  </div>
                  <p className="text-white/80">{scenario.explanation}</p>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-accent">{scenario.tip}</p>
                </div>
                <button
                  onClick={nextScenario}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary font-medium"
                >
                  {currentScenario < scenarios.length - 1 ? 'Next Scenario' : 'Complete Simulation'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}