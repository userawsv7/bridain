'use client';

import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface DualText {
  displayText: string;
  audioScript: string;
}

interface ExplanationStructure {
  verdict: DualText;
  explanation?: DualText;
  why?: DualText[];
  keyConcept?: DualText;
  whyOthersWrong: DualText[];
  remember: DualText;
  bestPractice: DualText;
  diagram?: {
    title: DualText;
    steps: { id: number; label: DualText; type: string }[];
    relationships?: DualText[];
  };
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

const createDualText = (text: string): DualText => ({
  displayText: text,
  audioScript: text
});

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
      verdict: createDualText("✅ Correct"),
      why: [
        createDualText("Port 8080 is actively used by process PID 4521"),
        createDualText("Container can't bind to an occupied port"),
        createDualText("Killing the process frees the port for the container")
      ],
      keyConcept: createDualText("Only one process can bind to a specific port at a time. When you see 'port already in use', identify and resolve the conflicting process."),
      whyOthersWrong: [
        createDualText("Restarting won't free the port"),
        createDualText("Deleting containers ignores the real issue"),
        createDualText("Changing ports masks configuration problems")
      ],
      remember: createDualText("Think of ports as parking spots - only one car can park in each spot."),
      bestPractice: createDualText("Use docker-compose to manage port mappings and avoid conflicts automatically.")
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
      verdict: createDualText("✅ Correct"),
      why: [
        createDualText("Logs reveal the actual error causing the restart loop"),
        createDualText("CrashLoopBackOff means the container is failing repeatedly"),
        createDualText("Fixing the root cause prevents further crashes")
      ],
      keyConcept: createDualText("CrashLoopBackOff indicates Kubernetes gave up restarting a failing container. Logs contain the specific error preventing successful startup."),
      diagram: {
        title: createDualText("CrashLoopBackOff Flow"),
        steps: [
          { id: 1, label: createDualText("Pod starts"), type: "start" },
          { id: 2, label: createDualText("Error occurs"), type: "error" },
          { id: 3, label: createDualText("Restart attempt"), type: "process" },
          { id: 4, label: createDualText("Repeat failure"), type: "decision" },
          { id: 5, label: createDualText("CrashLoopBackOff"), type: "error" },
          { id: 6, label: createDualText("Check logs & fix"), type: "success" }
        ],
        relationships: [createDualText("Pod → Error → Restart → Failure"), createDualText("Failure → CrashLoopBackOff → Check logs")]
      },
      whyOthersWrong: [
        createDualText("Scaling won't fix underlying application errors"),
        createDualText("Deleting the pod just restarts the same failing container"),
        createDualText("Resource limits don't address code/configuration issues")
      ],
      remember: createDualText("Think of CrashLoopBackOff as a smoke alarm - investigate the fire, not just silence the alarm."),
      bestPractice: createDualText("Always run `kubectl describe pod` first to see events, then `kubectl logs` to find the error.")
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
      verdict: createDualText("✅ Correct"),
      why: [
        createDualText("CI environment may have different dependency versions"),
        createDualText("Missing './config' module suggests incomplete setup"),
        createDualText("package-lock.json ensures identical dependencies everywhere")
      ],
      keyConcept: createDualText("CI/CD pipelines run in isolated environments. Differences in Node versions, npm packages, or missing files cause tests to fail in CI but pass locally."),
      whyOthersWrong: [
        createDualText("Flaky tests need fixing, not longer timeouts"),
        createDualText("Skipping tests defeats the purpose of CI"),
        createDualText("More resources won't fix missing modules")
      ],
      remember: createDualText("Think of CI as a clean room - it only has what you explicitly provide."),
      bestPractice: createDualText("Pin exact dependency versions in package-lock.json and use .nvmrc for Node version consistency.")
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
      verdict: createDualText("✅ Correct"),
      why: [
        createDualText("Private registries require authentication credentials"),
        createDualText("ImagePullBackOff means Kubernetes can't pull the image"),
        createDualText("imagePullSecrets provide the registry authentication")
      ],
      keyConcept: createDualText("Kubernetes pods need explicit credentials to pull images from private registries. Without imagePullSecrets, the kubelet can't authenticate."),
      diagram: {
        title: createDualText("Image Pull Authentication Flow"),
        steps: [
          { id: 1, label: createDualText("Private registry"), type: "start" },
          { id: 2, label: createDualText("Need credentials"), type: "decision" },
          { id: 3, label: createDualText("imagePullSecrets"), type: "process" },
          { id: 4, label: createDualText("Authenticated"), type: "success" },
          { id: 5, label: createDualText("Pod gets image"), type: "success" }
        ],
        relationships: [createDualText("Registry → Need credentials → imagePullSecrets"), createDualText("imagePullSecrets → Authenticated → Pod gets image")]
      },
      whyOthersWrong: [
        createDualText("Force sync won't fix authentication issues"),
        createDualText("Latest tag still requires authentication"),
        createDualText("Redeploying won't solve permission problems")
      ],
      remember: createDualText("Private images are locked - you need the key (imagePullSecrets) to unlock them."),
      bestPractice: createDualText("Create dedicated service accounts with imagePullSecrets for each environment.")
    },
    tip: "🔐 Always configure imagePullSecrets for private registries!",
    skill: "argocd"
  },
  {
    id: 5,
    title: "Terraform State Lock",
    category: "DevOps",
    emoji: "🔒",
    description: "Terraform state locked by another process",
    scenario: "🚫 Terraform apply fails with 'Error acquiring the state lock'. Another process might be running. What to do?",
    terminalOutput: "Error: Error acquiring the state lock\n\nTerraform failed to lock the state in 's3://mybucket/terraform.tfstate'.\n\nError message: 2 errors occurred:\n* ResourceNotFoundException: Requested resource not found\n* The operation was rejected by your request filter",
    folderStructure: ["terraform/", "  ├── main.tf", "  ├── variables.tf", "  ├── terraform.tfvars", "  └── backend.tf"],
    options: [
      "🔓 Force unlock with terraform force-unlock",
      "⏳ Wait for the lock to naturally expire",
      "🗑️ Delete the entire state file",
      "🔄 Run terraform init again"
    ],
    correct: 0,
    explanation: {
      verdict: createDualText("✅ Correct"),
      why: [
        createDualText("Force unlock releases the lock when the process is confirmed dead"),
        createDualText("Stale locks happen when processes crash without cleanup"),
        createDualText("Never delete state - it contains your actual infrastructure")
      ],
      keyConcept: createDualText("Terraform locks prevent concurrent modifications. When a process crashes, locks become stale and need manual cleanup with force-unlock."),
      whyOthersWrong: [
        createDualText("Natural expiration wastes time"),
        createDualText("Deleting state destroys infrastructure knowledge"),
        createDualText("Re-initializing won't help with stale locks")
      ],
      remember: createDualText("Terraform force-unlock is safe when you know the locking process is dead."),
      bestPractice: createDualText("Use terraform workspaces and always track who's running deployments.")
    },
    tip: "⚡ Always note the lock ID before force-unlocking for audit trails!",
    skill: "terraform"
  }
];

export default function ScenarioSimulator() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState<number[]>([]);

  const scenario = scenarios[currentScenario];
  const isCorrect = selectedAnswer === scenario.correct;

  const handleAnswer = (index: number) => {
    if (showResult) return;

    setSelectedAnswer(index);
    setShowResult(true);

    if (index === scenario.correct && !completedScenarios.includes(currentScenario)) {
      setScore(score + 1);
      setCompletedScenarios([...completedScenarios, currentScenario]);
    }
  };

  const nextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetSimulator = () => {
    setCurrentScenario(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompletedScenarios([]);
  };

  const getDualText = (text: DualText | string | undefined): DualText => {
    if (!text) return { displayText: '', audioScript: '' };
    if (typeof text === 'string') return { displayText: text, audioScript: text };
    return text;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Scenario Simulator</h2>
        <p className="text-neutral-400">Test your DevOps troubleshooting skills</p>
        <div className="mt-4 flex justify-center gap-4">
          <div className="px-4 py-2 bg-neutral-800 rounded-lg">
            Score: {score}/{scenarios.length}
          </div>
          <div className="px-4 py-2 bg-neutral-800 rounded-lg">
            Progress: {completedScenarios.length}/{scenarios.length}
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-3xl">{scenario.emoji}</span>
            <div>
              <h3 className="text-xl font-semibold">{scenario.title}</h3>
              <p className="text-sm text-neutral-400">{scenario.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-neutral-400">Scenario</div>
            <div className="text-lg font-bold">{currentScenario + 1}/{scenarios.length}</div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-neutral-950 rounded-lg border border-neutral-800">
          <p className="text-lg">{scenario.scenario}</p>
        </div>

        {scenario.terminalOutput && (
          <div className="mb-6 p-4 bg-black rounded-lg font-mono text-sm border border-neutral-800">
            <pre className="whitespace-pre-wrap text-neutral-300">{scenario.terminalOutput}</pre>
          </div>
        )}

        {scenario.folderStructure && (
          <div className="mb-6 p-4 bg-neutral-950 rounded-lg border border-neutral-800">
            <div className="text-sm text-neutral-400 mb-2">Project Structure:</div>
            <pre className="font-mono text-sm text-neutral-300">
              {scenario.folderStructure.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </pre>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {scenario.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showResult}
              className={`w-full p-4 text-left rounded-lg border transition-all ${
                showResult
                  ? index === scenario.correct
                    ? 'bg-green-900/20 border-green-600 text-green-400'
                    : index === selectedAnswer
                    ? 'bg-red-900/20 border-red-600 text-red-400'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                  : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600 text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {showResult && index === scenario.correct && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {showResult && index === selectedAnswer && index !== scenario.correct && <XCircle className="w-5 h-5 text-red-400" />}
                  {!showResult && <div className="w-5 h-5 rounded-full border border-neutral-600" />}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 bg-neutral-950 rounded-lg border border-neutral-800"
            >
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  isCorrect ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                }`}>
                  {getDualText(scenario.explanation.verdict).displayText}
                </span>
              </div>

              {scenario.explanation.why && scenario.explanation.why.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-neutral-400 mb-2">Why:</div>
                  <ul className="space-y-1">
                    {scenario.explanation.why.map((reason, i) => (
                      <li key={i} className="text-sm">• {getDualText(reason).displayText}</li>
                    ))}
                  </ul>
                </div>
              )}

              {scenario.explanation.keyConcept && (
                <div className="mb-4">
                  <div className="text-sm text-neutral-400 mb-2">Key Concept:</div>
                  <p className="text-sm">{getDualText(scenario.explanation.keyConcept).displayText}</p>
                </div>
              )}

              {scenario.explanation.diagram && (
                <div className="mb-4">
                  <div className="text-sm text-neutral-400 mb-2">{getDualText(scenario.explanation.diagram.title).displayText}</div>
                  <div className="flex flex-wrap gap-2">
                    {scenario.explanation.diagram.steps.map((step, i) => (
                      <div key={i} className="px-3 py-1 bg-neutral-800 rounded text-sm">
                        {step.label.displayText}
                      </div>
                    ))}
                  </div>
                  {scenario.explanation.diagram.relationships && (
                    <div className="mt-2 text-xs text-neutral-500">
                      {scenario.explanation.diagram.relationships.map((rel, i) => (
                        <div key={i}>{getDualText(rel).displayText}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mb-4">
                <div className="text-sm text-neutral-400 mb-2">Why Others Are Wrong:</div>
                <ul className="space-y-1">
                  {scenario.explanation.whyOthersWrong.map((reason, i) => (
                    <li key={i} className="text-sm text-neutral-400">• {getDualText(reason).displayText}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <div className="text-sm text-neutral-400 mb-1">Remember:</div>
                <p className="text-sm">{getDualText(scenario.explanation.remember).displayText}</p>
              </div>

              <div>
                <div className="text-sm text-neutral-400 mb-1">Best Practice:</div>
                <p className="text-sm font-semibold">{getDualText(scenario.explanation.bestPractice).displayText}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4">
          {showResult && currentScenario < scenarios.length - 1 && (
            <button
              onClick={nextScenario}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Next Scenario <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {showResult && currentScenario === scenarios.length - 1 && (
            <button
              onClick={resetSimulator}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
            >
              Start Over
            </button>
          )}
          {!showResult && (
            <button
              onClick={() => {
                setSelectedAnswer(null);
                setShowResult(false);
              }}
              className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}