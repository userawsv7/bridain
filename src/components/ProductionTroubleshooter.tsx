'use client';

import React, { useState, useRef } from 'react';
import { Send, Copy, Upload, AlertTriangle, CheckCircle, Loader2, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  category?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  category: string;
  createdAt: string;
}

export function ProductionTroubleshooter() {
  const SESSIONS_KEY = 'troubleshooter_sessions';
  const CURRENT_SESSION_KEY = 'troubleshooter_current_session';

  const createNewSession = (): ChatSession => ({
    id: Date.now().toString(),
    title: 'New Issue',
    messages: [{
      id: 0,
      text: "🔧 **Production Issue Resolution**\n\nI help resolve ANY technical issue across ALL skills:\n\n• **DevOps**: Kubernetes, Docker, Helm, CI/CD, Ansible\n• **Cloud**: AWS, Azure, GCP, serverless, networking\n• **Programming**: Python, JavaScript, Java, Go, etc.\n• **Databases**: PostgreSQL, MySQL, MongoDB, Redis\n• **AI/ML**: TensorFlow, PyTorch, scikit-learn, MLOps\n• **Frontend**: React, Vue, Angular, performance\n• **Backend**: APIs, microservices, authentication\n• **Infrastructure**: Linux, networking, security\n\nJust describe your issue or paste logs/error messages. I'll provide **Root Cause Analysis + Evidence + Step-by-Step Fix + Prevention**.",
      isUser: false
    }],
    category: '',
    createdAt: new Date().toISOString()
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SESSIONS_KEY);
      if (saved) return JSON.parse(saved);
    }
    return [createNewSession()];
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CURRENT_SESSION_KEY) || sessions[0]?.id;
    }
    return sessions[0]?.id;
  });

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const messages = currentSession?.messages || [];
  const detectedCategory = currentSession?.category || '';

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectSkillFromInput = (text: string): string => {
    const lc = text.toLowerCase();

    // Direct skill detection
    const skills = {
      'kubernetes': ['pod', 'deployment', 'kubectl', 'k8s', 'crashloop', 'imagepull'],
      'docker': ['container', 'docker', 'dockerfile', 'image'],
      'helm': ['helm', 'chart', 'values.yaml'],
      'aws': ['aws', 'ec2', 's3', 'lambda', 'cloudformation'],
      'python': ['python', 'pip', 'django', 'flask', 'pandas'],
      'react': ['react', 'jsx', 'component', 'usestate', 'useeffect'],
      'javascript': ['javascript', 'node', 'npm', 'express'],
      'database': ['sql', 'query', 'postgresql', 'mysql', 'mongodb'],
      'terraform': ['terraform', 'tfstate', 'infrastructure'],
      'git': ['git', 'merge', 'branch', 'commit', 'push']
    };

    for (const [skill, keywords] of Object.entries(skills)) {
      if (keywords.some(kw => lc.includes(kw))) return skill;
    }

    return 'general';
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const category = detectSkillFromInput(userMessage);

    const userMsg: Message = {
      id: Date.now(),
      text: userMessage,
      isUser: true,
      category
    };

    const newMessages = [...messages, userMsg];

    // Update session title based on first user message
    const updatedSession = {
      ...currentSession,
      messages: newMessages,
      category: category,
      title: messages.length === 1 ? userMessage.substring(0, 40) + (userMessage.length > 40 ? '...' : '') : currentSession.title
    };

    const updatedSessions = sessions.map(s => s.id === currentSessionId ? updatedSession : s);
    setSessions(updatedSessions);

    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
    }
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          mode: 'troubleshoot',
          skill: category,
          skillLevel: 'Intermediate',
          context: `Production troubleshooting for ${category} issue`
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      // Ensure we get the actual response, not a fallback message
      const responseText = data.response || data.text || 'Analyzing your issue...';

      const aiMsg: Message = {
        id: Date.now() + 1,
        text: responseText,
        isUser: false,
        category
      };

      const updatedMessages = [...newMessages, aiMsg];
      const finalSession = { ...updatedSession, messages: updatedMessages };

      const finalSessions = sessions.map(s => s.id === currentSessionId ? finalSession : s);
      setSessions(finalSessions);

      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(finalSessions));
      }
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: `Unable to connect to AI analysis. Here's a general ${category} troubleshooting approach:\n\n**1. Root Cause Analysis**\n• Check system status and logs\n• Review recent changes\n• Identify error patterns\n\n**2. Evidence Collection**\n• Gather relevant logs\n• Check resource utilization\n• Review configuration files\n\n**3. Step-by-Step Fix**\n• Start with least invasive solution\n• Test each step\n• Document findings\n\n**4. Prevention**\n• Implement monitoring\n• Add health checks\n• Document procedures`,
        isUser: false,
        category
      };
      const errorMessages = [...newMessages, errorMsg];
      const errorSession = { ...updatedSession, messages: errorMessages };

      const errorSessions = sessions.map(s => s.id === currentSessionId ? errorSession : s);
      setSessions(errorSessions);

      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(errorSessions));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = () => {
    const newSession = createNewSession();
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setCurrentSessionId(newSession.id);

    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
      localStorage.setItem(CURRENT_SESSION_KEY, newSession.id);
    }
    setShowSessions(false);
  };

  const switchToSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    }
    setShowSessions(false);
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) {
      toast.error('Cannot delete the last session');
      return;
    }

    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);

    if (currentSessionId === sessionId) {
      const newCurrentId = updatedSessions[0].id;
      setCurrentSessionId(newCurrentId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_SESSION_KEY, newCurrentId);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
    }
    toast.success('Session deleted');
  };

  const clearCurrentSession = () => {
    const clearedSession = createNewSession();
    clearedSession.id = currentSessionId;
    const updatedSessions = sessions.map(s => s.id === currentSessionId ? clearedSession : s);
    setSessions(updatedSessions);

    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInput(`I've attached a file with logs/content:\n\n${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}`);
    };
    reader.readAsText(file);
  };

  const quickQuestions = [
    "Pod is CrashLoopBackOff, how to fix?",
    "Docker container keeps restarting",
    "Terraform state lock issue",
    "React app performance problems",
    "Database connection timeout",
    "AWS Lambda memory exceeded"
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-400" />
          <div>
            <h1 className="text-xl font-bold">Production Troubleshooter</h1>
            <p className="text-sm text-gray-400">Universal issue resolution for ANY skill • Auto-detects from your description</p>
          </div>

          {/* Session Management */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={createNewChat}
              className="flex items-center gap-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-sm"
              title="New Issue Chat"
            >
              <Plus className="w-4 h-4" />
              New Issue
            </button>

            <button
              onClick={() => setShowSessions(!showSessions)}
              className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Issues ({sessions.length})
            </button>

            {detectedCategory && (
              <div className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded text-sm">
                Detected: {detectedCategory}
              </div>
            )}
          </div>
        </div>

        {/* Sessions Dropdown */}
        {showSessions && (
          <div className="mt-3 p-3 bg-gray-800 rounded border border-gray-700 max-h-60 overflow-y-auto">
            <div className="text-sm text-gray-400 mb-2">Issue Sessions ({sessions.length}):</div>
            {sessions.map((session, index) => (
              <div
                key={session.id}
                onClick={() => switchToSession(session.id)}
                className={`flex items-center justify-between p-2 rounded cursor-pointer mb-1 ${
                  session.id === currentSessionId ? 'bg-orange-600/30 border border-orange-500' : 'hover:bg-gray-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{session.title}</div>
                  <div className="text-xs text-gray-400">
                    {session.category && `${session.category} • `}
                    {new Date(session.createdAt).toLocaleDateString()} • {session.messages.length - 1} messages
                  </div>
                </div>
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="p-1 text-gray-400 hover:text-red-400"
                  title="Delete session"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-4xl rounded-lg p-4 ${msg.isUser ? 'bg-blue-600 text-white' : 'bg-gray-800'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 whitespace-pre-wrap">{msg.text}</div>
                {!msg.isUser && (
                  <button onClick={() => copyToClipboard(msg.text)} className="opacity-50 hover:opacity-100">
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
              {msg.category && (
                <div className="mt-2 text-xs text-gray-400">Category: {msg.category}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing issue...
              </div>
            </div>
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Quick start with common issues:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded border border-gray-600"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-700 p-4">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".log,.txt,.yaml,.yml,.json"
          />
          <button
            onClick={clearCurrentSession}
            className="p-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600"
            title="Clear current issue chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Describe your production issue or paste error logs..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
            disabled={isLoading}
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Analyze
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Paste logs, errors, or describe symptoms • Supports 100+ technologies</p>
      </div>
    </div>
  );
}