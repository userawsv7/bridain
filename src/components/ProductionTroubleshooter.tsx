'use client';

import React, { useState, useRef } from 'react';
import {
  Send, Volume2, VolumeX, Loader2, Mic, MicOff, Copy, Upload,
  AlertTriangle, Shield, BookOpen, Clock, Target, Server, Container,
  Settings, Cloud, GitBranch, Database, Zap, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  category?: string;
  tool?: string;
}

interface Tool {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  commonIssues: string[];
  quickCommands: string[];
}

// Universal skill categories - no more mode selection needed
const skillCategories = {
  'devops': ['kubernetes', 'docker', 'helm', 'ansible', 'terraform', 'argocd', 'jenkins', 'gitlab-ci', 'github-actions'],
  'cloud': ['aws', 'azure', 'gcp', 'cloudflare', 'digitalocean', 'linode'],
  'programming': ['python', 'javascript', 'java', 'golang', 'rust', 'c++', 'typescript', 'ruby', 'php'],
  'databases': ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb'],
  'ai-ml': ['tensorflow', 'pytorch', 'scikit-learn', 'openai', 'langchain', 'huggingface', 'mlflow'],
  'frontend': ['react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxtjs', 'tailwind'],
  'backend': ['nodejs', 'express', 'django', 'flask', 'spring-boot', 'fastapi', 'graphql'],
  'networking': ['nginx', 'apache', 'haproxy', 'envoy', 'istio', 'consul'],
  'security': ['vault', 'keycloak', 'oauth', 'jwt', 'ssl/tls', 'firewall', 'waf'],
  'monitoring': ['prometheus', 'grafana', 'datadog', 'newrelic', 'elk-stack', 'splunk'],
  'testing': ['jest', 'pytest', 'cypress', 'playwright', 'selenium', 'junit'],
  'infrastructure': ['linux', 'bash', 'powershell', 'systemd', 'vmware', 'hyper-v']
};

// Dynamic skill detector - maps any input to relevant category
const detectSkillCategory = (input: string): string => {
  const lc = input.toLowerCase();

  // Check each category for matches
  for (const [category, skills] of Object.entries(skillCategories)) {
    if (skills.some(skill => lc.includes(skill) || lc.includes(skill.replace('-', '')))) {
      return category;
    }
  }

  // Pattern matching for common terms
  if (lc.includes('deploy') || lc.includes('orchestrat') || lc.includes('container')) return 'devops';
  if (lc.includes('cloud') || lc.includes('serverless')) return 'cloud';
  if (lc.includes('code') || lc.includes('program') || lc.includes('script')) return 'programming';
  if (lc.includes('data') || lc.includes('query') || lc.includes('sql')) return 'databases';
  if (lc.includes('model') || lc.includes('train') || lc.includes('inference')) return 'ai-ml';
  if (lc.includes('ui') || lc.includes('component') || lc.includes('web')) return 'frontend';
  if (lc.includes('api') || lc.includes('server') || lc.includes('endpoint')) return 'backend';
  if (lc.includes('network') || lc.includes('proxy') || lc.includes('load')) return 'networking';
  if (lc.includes('auth') || lc.includes('secure') || lc.includes('encrypt')) return 'security';
  if (lc.includes('monitor') || lc.includes('metric') || lc.includes('log')) return 'monitoring';
  if (lc.includes('test') || lc.includes('qa') || lc.includes('spec')) return 'testing';
  if (lc.includes('linux') || lc.includes('unix') || lc.includes('command')) return 'infrastructure';

  return 'general';
};

interface DiagnosticTemplate {
  issue: string;
  rca: string[];
  commands: string[];
  fix: string;
  prevention: string[];
}

const diagnosticTemplates: { [key: string]: DiagnosticTemplate } = {
  'kubernetes': {
    issue: 'Kubernetes Pod Issue',
    rca: ['Check pod status and events', 'Review container logs', 'Inspect resource limits', 'Verify networking and RBAC'],
    commands: ['kubectl get pods -o wide', 'kubectl describe pod [name]', 'kubectl logs [pod] --previous', 'kubectl get events --sort-by=.lastTimestamp'],
    fix: 'kubectl apply -f fix.yaml || kubectl delete pod [name] --grace-period=0 --force',
    prevention: ['Add resource limits', 'Implement health checks', 'Set proper RBAC', 'Use pod disruption budgets']
  },
  'docker': {
    issue: 'Docker Container Issue',
    rca: ['Check container status', 'Review container logs', 'Inspect image and layers', 'Verify network and volumes'],
    commands: ['docker ps -a', 'docker logs [container]', 'docker inspect [container]', 'docker network ls'],
    fix: 'docker restart [container] || docker run --rm [image] [command]',
    prevention: ['Use health checks', 'Implement restart policies', 'Pin image versions', 'Monitor resource usage']
  },
  'helm': {
    issue: 'Helm Chart Issue',
    rca: ['Validate chart syntax', 'Check values override', 'Review template rendering', 'Verify repository access'],
    commands: ['helm lint [chart]', 'helm template [release] [chart]', 'helm history [release]', 'helm get values [release]'],
    fix: 'helm upgrade [release] [chart] --set [values] || helm rollback [release] [revision]',
    prevention: ['Version control charts', 'Use values files', 'Implement chart tests', 'Document dependencies']
  },
  'ansible': {
    issue: 'Ansible Playbook Issue',
    rca: ['Check inventory connectivity', 'Review task execution', 'Verify module parameters', 'Inspect privilege escalation'],
    commands: ['ansible all -m ping', 'ansible-playbook playbook.yml --check', 'ansible-playbook playbook.yml -vvv', 'ansible-doc [module]'],
    fix: 'ansible-playbook playbook.yml --extra-vars "fix=true" || ansible-playbook fix.yml',
    prevention: ['Idempotent playbooks', 'Error handling blocks', 'Use check mode', 'Implement tags']
  },
  'terraform': {
    issue: 'Terraform State Issue',
    rca: ['Check state locking', 'Review resource drift', 'Verify provider credentials', 'Inspect configuration'],
    commands: ['terraform plan', 'terraform show', 'terraform state list', 'terraform providers'],
    fix: 'terraform apply || terraform import [resource] [id] || terraform state rm [resource]',
    prevention: ['State locking enabled', 'Regular plan reviews', 'Use workspaces', 'Backup state files']
  },
  'argocd': {
    issue: 'ArgoCD Sync Issue',
    rca: ['Check app health status', 'Review sync errors', 'Verify git repository', 'Inspect target revision'],
    commands: ['argocd app list', 'argocd app get [app]', 'argocd app diff [app]', 'argocd repo list'],
    fix: 'argocd app sync [app] --force || argocd app rollback [app] [revision]',
    prevention: ['Automated sync policies', 'Health checks', 'Pre/post sync hooks', 'Resource quotas']
  }
};

export function ProductionTroubleshooter() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 0,
    text: "Production Issue Resolution System\n\nEnterprise-grade troubleshooting for any stack:\n\n• Kubernetes, Docker, Helm, Ansible, Terraform, ArgoCD\n• AI/ML Infrastructure & Cloud Resources\n• Auto-detection from logs and errors\n• Root cause analysis with evidence\n• Copy-paste ready fixes and commands\n• Prevention strategies and best practices\n\nSelect a tool or describe your issue:",
    isUser: false
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedSkill, setDetectedSkill] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedVoiceFlavor, setSelectedVoiceFlavor] = useState('Victoria');
  const [speechRate, setSpeechRate] = useState(0.90);

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const voiceFlavors: { [key: string]: { name: string; pitch: number } } = {
    Victoria: { name: 'Victoria', pitch: 1.15 },
    Karen: { name: 'Karen', pitch: 1.12 },
    Samantha: { name: 'Samantha', pitch: 1.18 },
    Moira: { name: 'Moira', pitch: 1.08 },
    Tessa: { name: 'Tessa', pitch: 1.10 }
  };

  const speak = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const voices = window.speechSynthesis.getVoices();
    const flavor = voiceFlavors[selectedVoiceFlavor];
    const female = voices.find(v =>
      v.name.includes('Female') || v.name.includes(flavor.name)
    ) || voices[0];

    window.speechSynthesis.cancel();

    const clean = text.replace(/#{1,6}\s*/g, '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(clean);

    utterance.rate = speechRate;
    utterance.pitch = flavor.pitch;
    utterance.voice = female;
    utterance.volume = 0.85;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const toggleMute = () => {
    if (isSpeaking) window.speechSynthesis.cancel();
    setIsMuted(!isMuted);
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + ' ';
        }
      }
      if (transcript) setInput(prev => prev + ' ' + transcript.trim());
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Recognition error');
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    toast.success('Listening...');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInput(prev => prev + '\n\n```' + file.name + '\n' + content + '\n```');
      toast.success(`Uploaded: ${file.name}`);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  const detectIssue = (content: string): { tool: string; issue: string } | null => {
    const lc = content.toLowerCase();

    // Universal patterns that work for ANY skill/technology
    if (lc.includes('error') || lc.includes('fail') || lc.includes('exception')) {
      return { tool: 'general', issue: 'Error/Failure Detected' };
    }
    if (lc.includes('timeout') || lc.includes('slow')) {
      return { tool: 'general', issue: 'Performance/Timeout Issue' };
    }
    if (lc.includes('crash') || lc.includes('down') || lc.includes('killed')) {
      return { tool: 'general', issue: 'Crash/Outage' };
    }
    if (lc.includes('permission') || lc.includes('forbidden') || lc.includes('unauthorized')) {
      return { tool: 'general', issue: 'Access/Permission Denied' };
    }
    if (lc.includes('connection') || lc.includes('network')) {
      return { tool: 'general', issue: 'Connectivity Issue' };
    }

    // Original DevOps tool patterns (enhanced with dynamic matching)
    if (lc.includes('crashloop') || lc.includes('exit code')) return { tool: 'kubernetes', issue: 'CrashLoopBackOff' };
    if (lc.includes('imagepull') || lc.includes('errimagepull')) return { tool: 'kubernetes', issue: 'ImagePullBackOff' };
    if (lc.includes('pending') && lc.includes('pod')) return { tool: 'kubernetes', issue: 'Pending Pod' };
    if (lc.includes('docker') && (lc.includes('exit') || lc.includes('killed'))) return { tool: 'docker', issue: 'Container Exit' };
    if (lc.includes('helm') && lc.includes('error')) return { tool: 'helm', issue: 'Chart Error' };
    if (lc.includes('ansible') && lc.includes('failed')) return { tool: 'ansible', issue: 'Playbook Failed' };
    if (lc.includes('terraform') && lc.includes('error')) return { tool: 'terraform', issue: 'State/Plan Error' };
    if (lc.includes('argocd') && lc.includes('sync')) return { tool: 'argocd', issue: 'Sync Failed' };
    if (lc.includes('cuda') || lc.includes('gpu') || lc.includes('oom')) return { tool: 'ai', issue: 'GPU/Resource Issue' };
    if (lc.includes('test') && (lc.includes('fail') || lc.includes('error'))) return { tool: 'testing', issue: 'Test Failure' };
    if (lc.includes('api') && lc.includes('error')) return { tool: 'api', issue: 'API Error' };
    if (lc.includes('ui') || lc.includes('frontend')) return { tool: 'ui', issue: 'UI Issue' };
    if (lc.includes('db') || lc.includes('database') || lc.includes('sql')) return { tool: 'database', issue: 'Database Issue' };

    return null;
  };

  const generateResponse = (text: string, detectedTool?: Tool): string => {
    const lowerText = text.toLowerCase();
    const detection = detectIssue(text);

    if (detection) {
      const template = diagnosticTemplates[detection.tool];
      if (template) {
        return `### 🔍 Auto-detected: ${detection.tool.toUpperCase()} - ${detection.issue}

### Root Cause Analysis
${template.rca.map((r, i) => `${i + 1}. ${r}`).join('\n')}

### Diagnostic Commands
\`\`\`bash
${template.commands.join('\n')}
\`\`\`

### Immediate Fix
\`\`\`bash
${template.fix}
\`\`\`

### Prevention Strategy
${template.prevention.map(p => `- [ ] ${p}`).join('\n')}

### Impact Assessment
**Business**: Service disruption, SLA breach risk
**Technical**: Resource exhaustion, configuration drift
**Risk**: Data loss, security exposure, cascading failures`;
      }
    }

    // Generic RCA if tool is selected
    if (detectedTool) {
      const template = diagnosticTemplates[detectedTool.id];
      if (template) {
        return `### ${template.issue} Analysis

### Root Cause Analysis
${template.rca.map((r, i) => `${i + 1}. ${r}`).join('\n')}

### Quick Diagnostics
\`\`\`bash
${detectedTool.quickCommands.join('\n')}
\`\`\`

### Recommended Fix
\`\`\`bash
${template.fix}
\`\`\`

### Prevention Checklist
${template.prevention.map(p => `- [ ] ${p}`).join('\n')}`;
      }
    }

    return `### Production Issue Analysis

Describe the symptoms or paste error logs. I'll provide:
1. **Root Cause Analysis** - Systematic identification
2. **Evidence Collection** - Key logs and metrics
3. **Impact Assessment** - Business and technical
4. **Step-by-Step Fix** - Copy-paste commands
5. **Prevention Strategy** - Avoid recurrence

Supported tools: Kubernetes, Docker, Helm, Ansible, Terraform, ArgoCD, AI/ML, Infrastructure`;
  };

  const processInput = async (text: string) => {
    const userMsg: Message = { id: Date.now(), text, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 200));

    const response = generateResponse(text);
    const responseMsg: Message = {
      id: Date.now() + 1,
      text: response,
      isUser: false,
      category: detectedSkill
    };

    setMessages(prev => [...prev, responseMsg]);
    if (!isMuted) speak(response);
    setIsLoading(false);
  };

  const selectTool = (tool: Tool) => {
    setSelectedTool(tool);
    const msg: Message = {
      id: Date.now(),
      text: `### ${tool.label} Troubleshooting Mode

**Common Issues**: ${tool.commonIssues.join(', ')}
**Quick Commands**:
\`\`\`bash
${tool.quickCommands.join('\n')}
\`\`\`

Describe your issue or paste logs. I'll detect the problem and provide RCA + fixes.`,
      isUser: false,
      tool: tool.id
    };
    setMessages(prev => [...prev, msg]);
    if (!isMuted) speak(msg.text);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <span className="text-sm text-orange-400">Production Issue Resolution</span>
        </div>
        <h1 className="text-3xl font-semibold text-white mb-2">Enterprise Troubleshooter</h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Production-grade diagnostics for Kubernetes, Docker, Helm, Ansible, Terraform, ArgoCD & more
        </p>
      </div>

      {/* Universal Skill Detection - Auto-detects any technology */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="text-sm text-gray-400">Universal Mode - Ask about ANY skill/technology</span>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(skillCategories).slice(0, 6).map(([category, skills]) => (
              <div key={category} className="px-3 py-1.5 bg-gray-950 rounded-lg border border-gray-800">
                <span className="text-xs text-orange-400 font-medium">{category}</span>
                <span className="text-xs text-gray-500 ml-1">({skills.slice(0, 3).join(', ')}...)</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Supports 100+ technologies • Auto-detects from your query</p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {/* Messages */}
        <div className="h-[450px] overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-2xl px-5 py-4 ${
                message.isUser
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}>
                <div className="flex justify-between gap-3">
                  <div className="prose prose-invert prose-sm flex-1">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{message.text}</pre>
                  </div>
                  {!message.isUser && (
                    <button
                      onClick={() => copyText(message.text)}
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors opacity-50 hover:opacity-100"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl px-5 py-4">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4 bg-gray-950">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              title="Upload logs or configs"
            >
              <Upload className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={toggleVoice}
              className={`p-2.5 rounded-lg transition-colors ${
                isListening ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-gray-400" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-gray-400" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && input.trim() && processInput(input)}
              placeholder="Describe the issue or paste error logs..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              disabled={isLoading}
            />

            <button
              onClick={() => input.trim() && processInput(input)}
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-xs">
                <select
                  value={selectedVoiceFlavor}
                  onChange={(e) => setSelectedVoiceFlavor(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-gray-300"
                >
                  {Object.keys(voiceFlavors).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1 text-gray-400">
                  <span>Rate</span>
                  <input
                    type="range"
                    min="0.6"
                    max="1.6"
                    step="0.05"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-20 accent-orange-500"
                  />
                  <span className="w-8 tabular-nums">{speechRate.toFixed(2)}x</span>
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500">Auto-detection • RCA • Fix Commands • Prevention</span>
          </div>
        </div>
      </div>
    </div>
  );
}