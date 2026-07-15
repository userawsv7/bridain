'use client';

import React, { useState, useMemo } from 'react';
import { ExternalLink, Search, Filter, BookOpen, Award, Users, Video, Code, Database, Shield, Cloud, Target, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { allResources, getUniqueCategories, getUniqueSkills, Resource } from '@/data/resources';
import { matchSkill, generateDynamicResources } from '@/data/resources/universal-skills';

export function Resources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedPricing, setSelectedPricing] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [chatMode, setChatMode] = useState<'browse' | 'interview' | 'docs' | 'dumps' | 'concepts'>('browse');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');

  const categories = getUniqueCategories();
  const skills = getUniqueSkills();
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const pricingOptions = ['Free', 'Freemium', 'Paid'];
  const sources = ['Official', 'Community'];

  const filteredResources = useMemo(() => {
    let result = [...allResources];
    let dynamicResources: Resource[] = [];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      // First try to match with existing resources
      const existingMatches = result.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some(tag => tag.toLowerCase().includes(query)) ||
        r.skills.some(skill => skill.toLowerCase().includes(query))
      );

      // Generate dynamic resources for any skill
      dynamicResources = generateDynamicResources(searchQuery) as Resource[];

      // Combine and deduplicate
      result = [...existingMatches, ...dynamicResources];
    }

    if (selectedSkill) {
      const matchedSkills = matchSkill(selectedSkill);
      result = result.filter(r =>
        r.skills.some(skill =>
          matchedSkills.some(ms => skill.toLowerCase().includes(ms.toLowerCase())) ||
          skill.toLowerCase().includes(selectedSkill.toLowerCase())
        )
      );

      // If no results from existing resources, generate dynamic ones
      if (result.length === 0) {
        result = generateDynamicResources(selectedSkill) as Resource[];
      }
    }

    if (selectedCategory) {
      result = result.filter(r => r.category === selectedCategory);
    }

    if (selectedLevel) {
      result = result.filter(r => r.level === selectedLevel);
    }

    if (selectedPricing) {
      result = result.filter(r => r.pricing === selectedPricing);
    }

    if (selectedSource) {
      result = result.filter(r => r.source === selectedSource);
    }

    return result.sort((a, b) => b.priorityScore - a.priorityScore);
  }, [searchQuery, selectedSkill, selectedCategory, selectedLevel, selectedPricing, selectedSource]);

  const resourcesByCategory = useMemo(() => {
    const grouped: { [key: string]: Resource[] } = {};
    filteredResources.forEach(resource => {
      if (!grouped[resource.category]) {
        grouped[resource.category] = [];
      }
      grouped[resource.category].push(resource);
    });
    return grouped;
  }, [filteredResources]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSkill('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedPricing('');
    setSelectedSource('');
  };

  const hasActiveFilters = searchQuery || selectedSkill || selectedCategory || selectedLevel || selectedPricing || selectedSource;

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedSkill) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');

    let response = '';
    const query = userMessage.toLowerCase();

    if (chatMode === 'interview') {
      if (query.includes('question')) {
        response = `Common interview questions for ${selectedSkill}:\n• Explain core concepts of ${selectedSkill}\n• Describe a project using ${selectedSkill}\n• How do you handle errors in ${selectedSkill}?`;
      } else {
        response = `For ${selectedSkill} interview prep: Focus on practical experience, common patterns, and problem-solving scenarios.`;
      }
    } else if (chatMode === 'docs') {
      response = `Official documentation for ${selectedSkill}: Search the official docs site, check release notes, and review API references.`;
    } else if (chatMode === 'dumps') {
      response = `Certification practice questions for ${selectedSkill}: Use official practice tests and focus on scenario-based questions.`;
    } else if (chatMode === 'concepts') {
      response = `Core concepts for ${selectedSkill}: Start with fundamentals, then move to advanced topics like performance and security.`;
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Documentation')) return <BookOpen className="w-4 h-4" />;
    if (category.includes('Learning')) return <Target className="w-4 h-4" />;
    if (category.includes('Certification')) return <Award className="w-4 h-4" />;
    if (category.includes('Labs')) return <Code className="w-4 h-4" />;
    if (category.includes('GitHub')) return <Code className="w-4 h-4" />;
    if (category.includes('YouTube')) return <Video className="w-4 h-4" />;
    if (category.includes('Communities')) return <Users className="w-4 h-4" />;
    if (category.includes('Security')) return <Shield className="w-4 h-4" />;
    if (category.includes('Architecture')) return <Database className="w-4 h-4" />;
    return <Cloud className="w-4 h-4" />;
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'Free': return 'text-green-400 bg-green-400/10';
      case 'Freemium': return 'text-blue-400 bg-blue-400/10';
      case 'Paid': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-white/60 bg-white/10';
    }
  };

  const getSourceColor = (source: string) => {
    return source === 'Official'
      ? 'text-purple-400 bg-purple-400/10'
      : 'text-cyan-400 bg-cyan-400/10';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">BRIDAIN Resources Hub</h1>
            <p className="text-white/60">Curated learning resources for DevOps, Cloud, SRE & more</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="glass rounded-lg px-4 py-2">
            <span className="text-white/60">Total Resources:</span>{' '}
            <span className="font-semibold">{allResources.length}</span>
          </div>
          <div className="glass rounded-lg px-4 py-2">
            <span className="text-white/60">Categories:</span>{' '}
            <span className="font-semibold">{categories.length}</span>
          </div>
          <div className="glass rounded-lg px-4 py-2">
            <span className="text-white/60">Skills Covered:</span>{' '}
            <span className="font-semibold">{skills.length}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search resources, skills, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-colors ${
              showFilters ? 'bg-primary/20 border-primary/50' : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Skill Quick Select */}
        <div className="mb-4">
          <div className="text-sm text-white/60 mb-2">Quick Skills:</div>
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 20).map(skill => (
              <button
                key={skill}
                onClick={() => {
                  setSelectedSkill(selectedSkill === skill ? '' : skill);
                  if (selectedSkill !== skill) setChatMode('browse');
                }}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedSkill === skill
                    ? 'bg-primary text-white'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Mode Selector - only shows when skill selected */}
        {selectedSkill && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => { setChatMode('browse'); setChatMessages([]); }}
              className={`px-3 py-1 rounded-lg text-sm ${chatMode === 'browse' ? 'bg-primary text-white' : 'bg-white/5'}`}
            >
              Browse Resources
            </button>
            <button
              onClick={() => setChatMode('interview')}
              className={`px-3 py-1 rounded-lg text-sm ${chatMode === 'interview' ? 'bg-primary text-white' : 'bg-white/5'}`}
            >
              Interview Questions
            </button>
            <button
              onClick={() => setChatMode('docs')}
              className={`px-3 py-1 rounded-lg text-sm ${chatMode === 'docs' ? 'bg-primary text-white' : 'bg-white/5'}`}
            >
              Official Docs
            </button>
            <button
              onClick={() => setChatMode('dumps')}
              className={`px-3 py-1 rounded-lg text-sm ${chatMode === 'dumps' ? 'bg-primary text-white' : 'bg-white/5'}`}
            >
              Certification Dumps
            </button>
            <button
              onClick={() => setChatMode('concepts')}
              className={`px-3 py-1 rounded-lg text-sm ${chatMode === 'concepts' ? 'bg-primary text-white' : 'bg-white/5'}`}
            >
              Core Concepts
            </button>
          </div>
        )}

        {/* Chat Interface for selected modes */}
        {selectedSkill && chatMode !== 'browse' && (
          <div className="mb-4 glass rounded-xl p-4">
            <div className="h-48 overflow-y-auto mb-3 space-y-2">
              {chatMessages.length === 0 && (
                <div className="text-white/40 text-sm">Ask about {chatMode} for {selectedSkill}...</div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-primary' : 'text-white/80'}`}>
                  {msg.content}
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Ask about ${chatMode}...`}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm"
              />
              <button type="submit" className="px-4 py-2 bg-primary rounded-lg text-sm">Send</button>
            </form>
          </div>
        )}

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 pt-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50"
                >
                  <option value="">All Levels</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>

                <select
                  value={selectedPricing}
                  onChange={(e) => setSelectedPricing(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50"
                >
                  <option value="">All Pricing</option>
                  {pricingOptions.map(price => (
                    <option key={price} value={price}>{price}</option>
                  ))}
                </select>

                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50"
                >
                  <option value="">All Sources</option>
                  {sources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>

                <div className="text-sm text-white/60 flex items-center">
                  Showing {filteredResources.length} of {allResources.length} resources
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedSkill && (
            <div className="glass rounded-lg px-3 py-1 flex items-center gap-2">
              Skill: {selectedSkill}
              <button onClick={() => setSelectedSkill('')}><X className="w-3 h-3" /></button>
            </div>
          )}
          {selectedCategory && (
            <div className="glass rounded-lg px-3 py-1 flex items-center gap-2">
              {selectedCategory}
              <button onClick={() => setSelectedCategory('')}><X className="w-3 h-3" /></button>
            </div>
          )}
          {selectedLevel && (
            <div className="glass rounded-lg px-3 py-1 flex items-center gap-2">
              {selectedLevel}
              <button onClick={() => setSelectedLevel('')}><X className="w-3 h-3" /></button>
            </div>
          )}
          {selectedPricing && (
            <div className="glass rounded-lg px-3 py-1 flex items-center gap-2">
              {selectedPricing}
              <button onClick={() => setSelectedPricing('')}><X className="w-3 h-3" /></button>
            </div>
          )}
          {selectedSource && (
            <div className="glass rounded-lg px-3 py-1 flex items-center gap-2">
              {selectedSource}
              <button onClick={() => setSelectedSource('')}><X className="w-3 h-3" /></button>
            </div>
          )}
        </div>
      )}

      {/* Resources Grid */}
      {Object.keys(resourcesByCategory).length > 0 ? (
        Object.entries(resourcesByCategory).map(([category, resources]) => (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-primary">{getCategoryIcon(category)}</div>
              <h2 className="text-xl font-semibold">{category}</h2>
              <span className="text-white/40 text-sm">({resources.length})</span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  onClick={() => setSelectedResource(resource)}
                  className="glass rounded-xl p-5 cursor-pointer hover:bg-white/5 transition-all border border-white/10 hover:border-white/20 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold pr-2 group-hover:text-primary transition-colors">{resource.name}</h3>
                    <ExternalLink className="w-4 h-4 text-white/40 flex-shrink-0" />
                  </div>

                  <p className="text-sm text-white/60 mb-4 line-clamp-2">{resource.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${getPricingColor(resource.pricing)}`}>
                      {resource.pricing}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getSourceColor(resource.source)}`}>
                      {resource.source}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60">
                      {resource.level}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {resource.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 glass rounded-2xl">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-white/40" />
          <p className="text-white/60">No resources found matching your filters.</p>
          <button onClick={clearFilters} className="mt-4 text-primary hover:underline">
            Clear all filters
          </button>
        </div>
      )}

      {/* AI Infrastructure Engineer Roadmap */}
      <div className="mt-12 p-6 bg-gray-900 border border-gray-800 rounded-2xl">
        <h2 className="text-3xl font-bold mb-4">AI Infrastructure Engineer Roadmap</h2>
        <p className="text-gray-400 mb-8">If your goal is <strong>AI Infrastructure Engineer / AI Platform Engineer</strong> (not AI application developer), focus on the infrastructure stack that runs AI workloads.</p>

        {/* Learning Roadmap Priority */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">🎯 Learning Roadmap (Priority)</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ['1. Linux', 'https://linuxjourney.com'],
              ['2. Docker', 'https://docs.docker.com/get-started'],
              ['3. Kubernetes', 'https://kubernetes.io/docs/home'],
              ['4. Kubernetes Labs', 'https://killercoda.com'],
              ['5. Git', 'https://learngitbranching.js.org'],
              ['6. CI/CD', 'https://www.jenkins.io/doc'],
              ['7. GitHub Actions', 'https://docs.github.com/actions'],
              ['8. ArgoCD', 'https://argo-cd.readthedocs.io'],
              ['9. Helm', 'https://helm.sh/docs'],
              ['10. Terraform', 'https://developer.hashicorp.com/terraform/tutorials'],
              ['11. Ansible', 'https://docs.ansible.com'],
              ['12. Prometheus', 'https://prometheus.io/docs'],
              ['13. Grafana', 'https://grafana.com/tutorials'],
              ['14. Loki', 'https://grafana.com/docs/loki/latest'],
              ['15. OpenTelemetry', 'https://opentelemetry.io/docs'],
              ['16. AWS', 'https://skillbuilder.aws'],
              ['17. Azure', 'https://learn.microsoft.com/training'],
              ['18. GCP', 'https://cloud.google.com/learn'],
              ['19. Networking', 'https://www.practicalnetworking.net'],
              ['20. Linux Networking', 'https://www.redhat.com/sysadmin']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm p-2 bg-gray-800 rounded">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        {/* AI Infrastructure */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">🤖 AI Infrastructure</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ['NVIDIA CUDA', 'https://developer.nvidia.com/cuda-zone'],
              ['NVIDIA NIM', 'https://developer.nvidia.com/nim'],
              ['NVIDIA Triton', 'https://docs.nvidia.com/deeplearning/triton-inference-server'],
              ['NVIDIA GPU Operator', 'https://docs.nvidia.com/datacenter/cloud-native/gpu-operator'],
              ['KServe', 'https://kserve.github.io/website'],
              ['Kubeflow', 'https://www.kubeflow.org/docs'],
              ['Ray', 'https://docs.ray.io'],
              ['MLflow', 'https://mlflow.org/docs/latest'],
              ['BentoML', 'https://docs.bentoml.com'],
              ['Ollama', 'https://ollama.com'],
              ['vLLM', 'https://docs.vllm.ai'],
              ['Hugging Face Inference', 'https://huggingface.co/docs'],
              ['TensorRT-LLM', 'https://nvidia.github.io/TensorRT-LLM'],
              ['SGLang', 'https://docs.sglang.ai'],
              ['Open WebUI', 'https://docs.openwebui.com']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm p-2 bg-gray-800 rounded">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        {/* Platform Engineering */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">⚙️ Platform Engineering</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ['Crossplane', 'https://docs.crossplane.io'],
              ['Backstage', 'https://backstage.io/docs'],
              ['Argo Workflows', 'https://argo-workflows.readthedocs.io'],
              ['Argo Rollouts', 'https://argo-rollouts.readthedocs.io'],
              ['Argo Events', 'https://argoproj.github.io'],
              ['Tekton', 'https://tekton.dev/docs'],
              ['FluxCD', 'https://fluxcd.io/docs'],
              ['Cilium', 'https://docs.cilium.io'],
              ['Istio', 'https://istio.io/latest/docs'],
              ['Linkerd', 'https://linkerd.io'],
              ['Kyverno', 'https://kyverno.io/docs'],
              ['Gatekeeper', 'https://open-policy-agent.github.io/gatekeeper'],
              ['OPA', 'https://www.openpolicyagent.org/docs'],
              ['External Secrets', 'https://external-secrets.io'],
              ['cert-manager', 'https://cert-manager.io/docs']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm p-2 bg-gray-800 rounded">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        {/* AI + DevOps Automation */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">🔄 AI + DevOps Automation</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ['MCP', 'https://modelcontextprotocol.io'],
              ['LangGraph', 'https://langchain-ai.github.io/langgraph'],
              ['OpenAI Agents SDK', 'https://openai.github.io/openai-agents-python'],
              ['n8n', 'https://docs.n8n.io'],
              ['Kestra', 'https://kestra.io/docs'],
              ['Temporal', 'https://docs.temporal.io'],
              ['Apache Airflow', 'https://airflow.apache.org/docs'],
              ['Dagger', 'https://dagger.io'],
              ['Pulumi', 'https://www.pulumi.com/docs'],
              ['Atlantis', 'https://www.runatlantis.io']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm p-2 bg-gray-800 rounded">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        {/* AI Observability */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">📊 AI Observability</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ['Langfuse', 'https://langfuse.com/docs'],
              ['Phoenix', 'https://arize.com/phoenix'],
              ['Weights & Biases', 'https://docs.wandb.ai'],
              ['Grafana AI Observability', 'https://grafana.com/docs'],
              ['OpenTelemetry', 'https://opentelemetry.io/docs']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm p-2 bg-gray-800 rounded">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        {/* Kubernetes Practice */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">☸️ Kubernetes Practice</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ['Killercoda', 'https://killercoda.com'],
              ['Play with Kubernetes', 'https://labs.play-with-k8s.com'],
              ['Kubernetes Examples', 'https://github.com/kubernetes/examples'],
              ['Awesome Kubernetes', 'https://github.com/ramitsurana/awesome-kubernetes'],
              ['Kubernetes Patterns', 'https://k8spatterns.io']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm p-2 bg-gray-800 rounded">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        {/* GitOps */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">🔁 GitOps</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ['ArgoCD Docs', 'https://argo-cd.readthedocs.io'],
              ['Argo Examples', 'https://github.com/argoproj'],
              ['FluxCD', 'https://fluxcd.io/docs'],
              ['CNCF GitOps', 'https://opengitops.dev']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm p-2 bg-gray-800 rounded">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        {/* Cloud Native (CNCF) */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">☁️ Cloud Native (CNCF)</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ['CNCF Landscape', 'https://landscape.cncf.io'],
              ['CNCF Projects', 'https://www.cncf.io/projects'],
              ['Kubernetes SIGs', 'https://github.com/kubernetes/community'],
              ['CNCF YouTube', 'https://www.youtube.com/@CloudNativeFdn']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm p-2 bg-gray-800 rounded">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        {/* Free Hands-on Labs */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">🧪 Free Hands-on Labs</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ['Killercoda', 'https://killercoda.com'],
              ['Play with Docker', 'https://labs.play-with-docker.com'],
              ['Play with Kubernetes', 'https://labs.play-with-k8s.com'],
              ['Azure Labs', 'https://microsoftlearning.github.io'],
              ['AWS Workshops', 'https://workshops.aws'],
              ['Google Cloud Skills Boost', 'https://www.cloudskillsboost.google']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm p-2 bg-gray-800 rounded">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        {/* YouTube Channels */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">📺 YouTube Channels</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ['TechWorld with Nana', 'Kubernetes, Docker, CI/CD'],
              ['KodeKloud', 'DevOps, Kubernetes'],
              ['Bret Fisher', 'Docker'],
              ['DevOps Toolkit', 'Kubernetes, GitOps'],
              ['CNCF', 'Cloud Native'],
              ['Google Cloud Tech', 'GKE, AI Infrastructure'],
              ['AWS', 'EKS, AI Services'],
              ['Microsoft Azure', 'AKS'],
              ['NVIDIA Developer', 'GPUs, CUDA, AI Infrastructure'],
              ['OpenTelemetry', 'Observability'],
              ['Argo Project', 'GitOps'],
              ['HashiCorp', 'Terraform'],
              ['Grafana', 'Monitoring'],
              ['Isovalent', 'Cilium'],
              ['Ray', 'Distributed AI']
            ].map(([name, focus], i) => (
              <div key={i} className="text-sm p-2 bg-gray-800 rounded text-gray-300">
                <strong>{name}</strong> — {focus}
              </div>
            ))}
          </div>
        </div>

        {/* Books (Free) */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">📚 Books (Free)</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ['Kubernetes Documentation', 'https://kubernetes.io/docs/home'],
              ['Docker Documentation', 'https://docs.docker.com'],
              ['Linux Journey', 'https://linuxjourney.com'],
              ['Kubernetes Patterns', 'https://k8spatterns.io'],
              ['Red Hat Sysadmin Articles', 'https://www.redhat.com/sysadmin']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm p-2 bg-gray-800 rounded">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        {/* Best GitHub Repositories */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">⭐ Best GitHub Repositories</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ['awesome-devops', 'https://github.com/wmariuss/awesome-devops'],
              ['awesome-kubernetes', 'https://github.com/ramitsurana/awesome-kubernetes'],
              ['awesome-platform-engineering', 'https://github.com/platformengineering/awesome-platform-engineering'],
              ['awesome-ai', 'https://github.com/owainlewis/awesome-artificial-intelligence'],
              ['awesome-mlops', 'https://github.com/visenger/awesome-mlops'],
              ['awesome-gitops', 'https://github.com/weaveworks/awesome-gitops'],
              ['awesome-docker', 'https://github.com/veggiemonk/awesome-docker']
            ].map(([name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 text-sm p-2 bg-gray-800 rounded">
                {name} → {url}
              </a>
            ))}
          </div>
        </div>

        {/* Recommended Learning Order */}
        <div className="p-6 bg-gray-800 rounded-xl">
          <h3 className="text-2xl font-semibold mb-4">🚀 Recommended Learning Order</h3>
          <ol className="text-gray-300 space-y-1 list-decimal list-inside columns-1 md:columns-2">
            <li>Linux</li><li>Networking</li><li>Git</li><li>Docker</li><li>Kubernetes (CKA-level)</li>
            <li>Helm</li><li>CI/CD (Jenkins + GitHub Actions)</li><li>ArgoCD (GitOps)</li><li>Terraform</li>
            <li>AWS/Azure/GCP</li><li>Prometheus + Grafana + Loki + OpenTelemetry</li><li>Cilium + Istio</li>
            <li>Crossplane + Backstage</li><li>NVIDIA GPUs + CUDA + GPU Operator</li><li>KServe + Triton + vLLM + Ray</li>
            <li>MLflow + Kubeflow</li><li>AI observability (Langfuse, Phoenix)</li><li>AI-powered DevOps automation (MCP, LangGraph, n8n, Temporal)</li>
          </ol>
          <p className="mt-4 text-sm text-gray-400">This path aligns well with becoming an <strong>AI Infrastructure Engineer</strong>, <strong>AI Platform Engineer</strong>, or <strong>MLOps/LLMOps Infrastructure Engineer</strong>.</p>
        </div>
      </div>

      {/* Resource Modal */}
      <AnimatePresence>
        {selectedResource && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedResource(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="glass rounded-2xl p-8 max-w-2xl w-full"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">{selectedResource.name}</h2>
                <button onClick={() => setSelectedResource(null)} className="text-white/40 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-white/80 mb-6 text-lg">{selectedResource.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Category</div>
                  <div className="font-semibold">{selectedResource.category}</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Source</div>
                  <div className="font-semibold">{selectedResource.source}</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Level</div>
                  <div className="font-semibold">{selectedResource.level}</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Pricing</div>
                  <div className="font-semibold">{selectedResource.pricing}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-white/60 mb-2">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {selectedResource.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-white/10 rounded-lg text-sm">{skill}</span>
                  ))}
                </div>
              </div>

              <a
                href={selectedResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl font-semibold transition-colors"
              >
                Visit Resource <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}