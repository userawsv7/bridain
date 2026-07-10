'use client';

import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ExplanationStructure {
  verdict: string;
  explanation?: string;
  why?: string[];
  keyConcept?: string;
  whyOthersWrong: string[];
  remember: string;
  bestPractice: string;
}

interface Scenario {
  id: number;
  title: string;
  category: string;
  emoji: string;
  description: string;
  scenario: string;
  terminalOutput?: string;
  folderStructure?: string[];
  options: string[];
  correct: number;
  explanation: ExplanationStructure;
  tip: string;
  skill: string;
}

const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Docker Container Failing",
    category: "DevOps",
    emoji: "🐳",
    description: "Your container keeps crashing on startup",
    scenario: "🚨 Container 'app-backend' exits with code 1. Logs show 'port already in use'. What do you do?",
    terminalOutput: "$ docker ps\nCONTAINER ID   IMAGE          COMMAND                  CREATED       STATUS                    PORTS\na1b2c3d4e5f6   app-backend    \"docker-entrypoint.sh\"   2 hours ago   Exited (1) 2 seconds ago   8080/tcp\n$ lsof -i :8080\nCOMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nnode    4521 root   21u  IPv4  12345      0t0  TCP *:8080 (LISTEN)",
    folderStructure: ["app/", "  ├── Dockerfile", "  ├── package.json", "  ├── src/", "  │   └── index.js", "  └── docker-compose.yml"],
    options: [
      "🔄 Restart the container with docker restart",
      "🔍 Check for conflicting processes: `docker ps` and kill the process using port 8080",
      "🗑️ Delete all containers and start fresh",
      "📝 Ignore the error and use a different port"
    ],
    correct: 1,
    explanation: {
      verdict: "✅ Correct",
      why: [
        "Port 8080 is actively used by process PID 4521",
        "Container can't bind to an occupied port",
        "Killing the process frees the port for the container"
      ],
      keyConcept: "Only one process can bind to a specific port at a time. When you see 'port already in use', identify and resolve the conflicting process.",
      whyOthersWrong: [
        "Restarting won't free the port",
        "Deleting containers ignores the real issue",
        "Changing ports masks configuration problems"
      ],
      remember: "Think of ports as parking spots - only one car can park in each spot.",
      bestPractice: "Use docker-compose to manage port mappings and avoid conflicts automatically."
    },
    tip: "💡 Pro tip: Use `docker compose` to manage ports automatically!",
    skill: "docker"
  },
  {
    id: 2,
    title: "Kubernetes Pod CrashLoop",
    category: "DevOps",
    emoji: "☸️",
    description: "Pod keeps restarting in a loop",
    scenario: "⚠️ Pod 'api-deployment-7f9d8' is in CrashLoopBackOff. What's your first action?",
    terminalOutput: "$ kubectl get pods\nNAME                    READY   STATUS             RESTARTS   AGE\napi-deployment-7f9d8   0/1     CrashLoopBackOff   12         5m\n$ kubectl describe pod api-deployment-7f9d8\nEvents:\nWarning  BackOff  2m    kubelet  Back-off restarting failed container\nWarning  Failed   1m    kubelet  Error: ImagePullBackOff",
    folderStructure: ["k8s/", "  ├── deployment.yaml", "  ├── service.yaml", "  ├── configmap.yaml", "  └── ingress.yaml"],
    options: [
      "🔄 Scale up the deployment to 3 replicas",
      "🔍 Check pod logs: `kubectl logs -f pod/api-deployment-7f9d8`",
      "🛑 Delete the pod and let it recreate",
      "⚙️ Increase CPU limits in the deployment"
    ],
    correct: 1,
    explanation: {
      verdict: "✅ Correct",
      why: [
        "Logs reveal the actual error causing the restart loop",
        "CrashLoopBackOff means the container is failing repeatedly",
        "Fixing the root cause prevents further crashes"
      ],
      keyConcept: "CrashLoopBackOff indicates Kubernetes gave up restarting a failing container. Logs contain the specific error preventing successful startup.",
      diagram: {
        title: "CrashLoopBackOff Flow",
        steps: [
          { id: 1, label: "Pod starts", type: "start" },
          { id: 2, label: "Error occurs", type: "error" },
          { id: 3, label: "Restart attempt", type: "process" },
          { id: 4, label: "Repeat failure", type: "decision" },
          { id: 5, label: "CrashLoopBackOff", type: "error" },
          { id: 6, label: "Check logs & fix", type: "success" }
        ],
        relationships: ["Pod → Error → Restart → Failure", "Failure → CrashLoopBackOff → Check logs"]
      },
      whyOthersWrong: [
        "Scaling won't fix underlying application errors",
        "Deleting the pod just restarts the same failing container",
        "Resource limits don't address code/configuration issues"
      ],
      remember: "Think of CrashLoopBackOff as a smoke alarm - investigate the fire, not just silence the alarm.",
      bestPractice: "Always run `kubectl describe pod` first to see events, then `kubectl logs` to find the error."
    },
    tip: "🎯 Use `kubectl describe pod` to see events and failure reasons!",
    skill: "kubernetes"
  },
  {
    id: 3,
    title: "CI/CD Pipeline Failure",
    category: "DevOps",
    emoji: "🔄",
    description: "Build failing in GitHub Actions",
    scenario: "💥 GitHub Actions workflow fails at 'npm test' step. Tests pass locally. What's wrong?",
    terminalOutput: "Run npm test\n  ● Test suite failed to run\n    Cannot find module './config'\n    at Object.<anonymous> (src/config.test.js:1:1)\n\nTests:       0 passed, 1 total\nTime:        2.534 s\nRan all test suites.",
    folderStructure: [".github/", "  └── workflows/", "      └── ci.yml", "src/", "  ├── config.js", "  └── config.test.js", "package.json"],
    options: [
      "🐛 Tests are flaky, increase timeout",
      "🔧 Check if dependencies differ: use exact versions in package-lock.json",
      "🚫 Skip tests in CI temporarily",
      "📦 Increase runner resources"
    ],
    correct: 1,
    explanation: {
      verdict: "✅ Correct",
      why: [
        "CI environment may have different dependency versions",
        "Missing './config' module suggests incomplete setup",
        "package-lock.json ensures identical dependencies everywhere"
      ],
      keyConcept: "CI/CD pipelines run in isolated environments. Differences in Node versions, npm packages, or missing files cause tests to fail in CI but pass locally.",
      whyOthersWrong: [
        "Flaky tests need fixing, not longer timeouts",
        "Skipping tests defeats the purpose of CI",
        "More resources won't fix missing modules"
      ],
      remember: "Think of CI as a clean room - it only has what you explicitly provide.",
      bestPractice: "Pin exact dependency versions in package-lock.json and use .nvmrc for Node version consistency."
    },
    tip: "✨ Use `.nvmrc` file and same Node version in CI as locally!",
    skill: "cicd"
  },
  {
    id: 4,
    title: "ArgoCD Sync Failed",
    category: "DevOps",
    emoji: "🔄",
    description: "ArgoCD application sync error",
    scenario: "⚠️ ArgoCD shows 'ImagePullBackOff' for your deployment. The image exists in your registry. What now?",
    terminalOutput: "$ argocd app get myapp\nHealth Status:      Degraded\nSync Status:        OutOfSync\nOperation State:    Error\nMessage:            one or more objects failed to apply\n$ kubectl describe pod myapp-7f9d8\nWarning  Failed     kubelet  Failed to pull image \"registry.io/myapp:v1.2.3\": rpc error: code = Unknown desc = Error response from daemon: pull access denied",
    folderStructure: ["argocd/", "  ├── application.yaml", "  ├── project.yaml", "k8s/", "  ├── deployment.yaml", "  └── values-prod.yaml"],
    options: [
      "🔑 Check imagePullSecrets and service account permissions",
      "🔄 Force sync in ArgoCD UI",
      "📝 Change image tag to latest",
      "🚫 Ignore and redeploy the application"
    ],
    correct: 0,
    explanation: {
      verdict: "✅ Correct",
      why: [
        "Private registries require authentication credentials",
        "ImagePullBackOff means Kubernetes can't pull the image",
        "imagePullSecrets provide the registry authentication"
      ],
      keyConcept: "Kubernetes pods need explicit credentials to pull images from private registries. Without imagePullSecrets, the kubelet can't authenticate.",
      diagram: {
        title: "Image Pull Authentication Flow",
        steps: [
          { id: 1, label: "Private registry", type: "start" },
          { id: 2, label: "Need credentials", type: "decision" },
          { id: 3, label: "imagePullSecrets", type: "process" },
          { id: 4, label: "Authenticated", type: "success" },
          { id: 5, label: "Pod gets image", type: "success" }
        ],
        relationships: ["Registry → Need credentials → imagePullSecrets", "imagePullSecrets → Authenticated → Pod gets image"]
      },
      whyOthersWrong: [
        "Force sync won't fix authentication issues",
        "Latest tag still requires authentication",
        "Ignoring errors leaves pods failing"
      ],
      remember: "Think of imagePullSecrets as house keys - you can't enter without them.",
      bestPractice: "Always configure imagePullSecrets in your service account or pod spec for private registry access."
    },
    tip: "💡 Always use imagePullSecrets for private registry access!",
    skill: "argocd"
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
    explanation: {
      verdict: "✅ Correct",
      why: [
        "API rate limits prevent server overload",
        "Exponential backoff gives servers time to recover",
        "Jitter prevents all clients from retrying simultaneously"
      ],
      keyConcept: "Rate limiting protects APIs from abuse. When you hit limits, wait progressively longer between retries to avoid making the situation worse.",
      diagram: {
        title: "Exponential Backoff Flow",
        steps: [
          { id: 1, label: "Rate Limit Hit", type: "start" },
          { id: 2, label: "Wait 1s → Retry", type: "process" },
          { id: 3, label: "Still limited", type: "decision" },
          { id: 4, label: "Wait 2s → Retry", type: "process" },
          { id: 5, label: "Still limited", type: "decision" },
          { id: 6, label: "Wait 4s → Success", type: "success" }
        ],
        relationships: ["Rate limit → Exponential backoff", "Backoff → Increasing delays → Success"]
      },
      whyOthersWrong: [
        "Making requests faster triggers more rate limits",
        "Requesting higher limits takes time and may be denied",
        "Indefinite caching ignores rate limit design"
      ],
      remember: "Think of rate limiting like traffic lights - rushing causes more congestion.",
      bestPractice: "Use retry libraries with exponential backoff and jitter (like `retry` or `p-retry`) for resilient API clients."
    },
    tip: "💡 Libraries like `retry` or `p-retry` make this easy!",
    skill: "api"
  }
];

export function ScenarioSimulator() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechComplete, setSpeechComplete] = useState(false);

  const scenario = scenarios[currentScenario];

  const speakExplanation = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeechComplete(true);
        resolve();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeechComplete(true);
        resolve();
      };

      setIsSpeaking(true);
      setSpeechComplete(false);
      window.speechSynthesis.speak(utterance);
    });
  };

  const generateExplanationText = () => {
    const exp = scenario.explanation;
    let text = `${exp.verdict}. `;
    text += `Explanation: ${exp.explanation || exp.why?.join('. ')}. `;
    text += `Remember: ${exp.remember}. `;
    text += `Best practice: ${exp.bestPractice}.`;
    return text;
  };

  const handleAnswer = async (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
    setSpeechComplete(false);

    const isCorrect = index === scenario.correct;
    if (isCorrect) {
      setScore(score + 1);
      toast.success(`Correct! +10 XP 🎉`, {
        description: scenario.tip,
      });
    } else {
      toast.error(`Not quite right 😅`, {
        description: scenario.explanation.verdict,
      });
    }

    if (!completed.includes(scenario.id)) {
      setCompleted([...completed, scenario.id]);
    }

    // Start TTS after showing results
    const explanationText = generateExplanationText();
    await speakExplanation(explanationText);
  };

  const nextScenario = () => {
    // Stop any ongoing speech when moving to next scenario
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeechComplete(false);

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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentScenario(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompleted([]);
    setIsSpeaking(false);
    setSpeechComplete(false);
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

          {/* Terminal Output Simulation */}
          {scenario.terminalOutput && (
            <div className="rounded-2xl bg-[#1a1b26] border border-white/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-white/60 ml-2">Terminal • {scenario.skill}</span>
              </div>
              <pre className="p-4 text-sm text-green-400/90 font-mono overflow-x-auto whitespace-pre-wrap">
                {scenario.terminalOutput}
              </pre>
            </div>
          )}

          {/* Folder Structure Visualization */}
          {scenario.folderStructure && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-sm text-white/60 mb-2">📁 Your working directory:</div>
              <div className="font-mono text-sm space-y-0.5 text-white/80">
                {scenario.folderStructure.map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            </div>
          )}

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
                className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6"
              >
                {/* Status Badge */}
                <div className="flex justify-start">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedAnswer === scenario.correct
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {selectedAnswer === scenario.correct ? 'Correct' : 'Wrong'}
                  </div>
                </div>

                {/* Explanation Card */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="font-semibold text-primary mb-3">Explanation</div>
                  <p className="text-white/90 leading-relaxed">{scenario.explanation.explanation}</p>
                </div>

                {/* Visual Flow Diagram */}
                {scenario.explanation.diagram && scenario.explanation.diagram.length > 0 && (
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="font-semibold text-primary mb-4">Visual Flow</div>
                    <div className="space-y-3">
                      {scenario.explanation.diagram.map((step, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white mb-1">{step.title}</div>
                            <div className="text-sm text-white/70">{step.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Why Others Wrong */}
                {scenario.explanation.whyOthersWrong && scenario.explanation.whyOthersWrong.length > 0 && (
                  <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                    <div className="font-semibold text-red-400 mb-4">Why Others Are Wrong</div>
                    <div className="space-y-2">
                      {scenario.explanation.whyOthersWrong.map((reason, index) => (
                        <div key={index} className="flex items-start gap-3 text-sm">
                          <span className="text-red-400/60 mt-0.5">✗</span>
                          <span className="text-white/70">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remember & Best Practice */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <div className="font-semibold text-sm text-yellow-400 mb-2">Remember</div>
                    <p className="text-sm text-white/90 italic">"{scenario.explanation.remember}"</p>
                  </div>
                  <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="font-semibold text-sm text-emerald-400 mb-2">Best Practice</div>
                    <p className="text-sm text-white/90">{scenario.explanation.bestPractice}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-accent mb-4">{scenario.tip}</p>

                  {/* Audio Status Indicator */}
                  {isSpeaking && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-primary">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      Reading explanation aloud...
                    </div>
                  )}

                  <button
                    onClick={nextScenario}
                    disabled={!speechComplete && showResult}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      !speechComplete && showResult
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg'
                    }`}
                  >
                    {currentScenario < scenarios.length - 1 ? 'Next Scenario' : 'Complete Simulation'}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {!speechComplete && showResult && (
                    <p className="text-xs text-white/50 mt-2">
                      Please wait for the explanation to finish reading
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}