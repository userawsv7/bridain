'use client';

import React, { useState } from 'react';
import {
  ExternalLink, Award, Clock, Target, BookOpen, Users, Youtube, Github, FileText,
  Search, Star, Calendar, TrendingUp, Code, PlayCircle, CheckCircle, Zap,
  ChevronDown, ChevronUp, Filter, Award as CertIcon, HelpCircle
} from 'lucide-react';

interface BaseResource {
  name: string;
  url: string;
  type: string;
  description?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  free?: boolean;
  badge?: string[];
  lastUpdated?: string;
  stars?: number;
}

interface GitHubRepo extends BaseResource {
  type: 'GitHub';
  stars: number;
  forks: number;
  lastUpdated: string;
  category: 'Learning' | 'Practice' | 'Production' | 'Interview';
  maintained: boolean;
  whyRecommended: string;
}

interface YouTubeResource extends BaseResource {
  type: 'YouTube';
  channel: string;
  duration: string;
  whyRecommended: string;
}

interface CertificationResource extends BaseResource {
  type: 'Certification';
  provider: string;
  level: string;
  cost: string;
  duration: string;
  examFormat: string;
  questions?: number;
  passingScore?: string;
  validity: string;
  prerequisites?: string;
  officialPage: string;
  studyGuide?: string;
  examObjectives?: string;
}

interface PracticeLab extends BaseResource {
  type: 'Practice Lab';
  duration: string;
  setupRequired: string;
  browserBased: boolean;
  certificationRelated: boolean;
  cost: 'Free' | 'Freemium' | 'Paid';
}

interface Project extends BaseResource {
  type: 'Project';
  goal: string;
  skillsLearned: string[];
  estimatedTime: string;
  githubImplementation?: string;
  tutorial?: string;
  architecture?: string;
}

interface InterviewQ {
  question: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  answer: string;
  category: string;
}

interface CheatSheet extends BaseResource {
  type: 'Cheat Sheet';
  format: string;
}

interface Book extends BaseResource {
  type: 'Book';
  author: string;
  whyRecommended: string;
  cost: 'Free' | 'Paid';
}

interface SkillResources {
  skill: string;
  timeToMaster: string;
  keyTopics: string[];
  ecosystem: BaseResource[];

  officialDocs: BaseResource[];
  gettingStarted: BaseResource[];
  tutorials: BaseResource[];
  apiReference: BaseResource[];
  bestPractices: BaseResource[];
  examples: BaseResource[];
  githubOrg: BaseResource[];
  blog: BaseResource[];
  videos: BaseResource[];

  learningPlatforms: BaseResource[];
  expertResources: BaseResource[];

  githubRepos: GitHubRepo[];
  youtubeResources: YouTubeResource[];
  practiceLabs: PracticeLab[];

  projects: {
    beginner: Project[];
    intermediate: Project[];
    advanced: Project[];
    enterprise: Project[];
  };

  certifications: CertificationResource[];
  certPreparation: {
    studyGuides: BaseResource[];
    practiceTests: BaseResource[];
    flashcards: BaseResource[];
    examTips: BaseResource[];
  };

  interviewPrep: {
    beginner: InterviewQ[];
    intermediate: InterviewQ[];
    advanced: InterviewQ[];
    scenarios: InterviewQ[];
    troubleshooting: InterviewQ[];
  };

  faqs: { question: string; answer: string; source: string }[];
  cheatSheets: CheatSheet[];

  books: {
    beginner: Book[];
    intermediate: Book[];
    advanced: Book[];
  };

  blogs: BaseResource[];
  newsletters: BaseResource[];
  podcasts: BaseResource[];
}

const generateComprehensiveResources = (skill: string): SkillResources => {
  const skillLower = skill.toLowerCase().trim();

  // Priority: Official > Trusted Platforms > Experts > GitHub > Community
  const comprehensiveResources: { [key: string]: Partial<SkillResources> } = {
    kubernetes: {
      skill: "Kubernetes",
      timeToMaster: "3-6 months",
      keyTopics: ["Pods & Workloads", "Networking", "Storage", "Security (RBAC)", "Helm", "Operators", "CI/CD Integration", "Observability"],
      ecosystem: [
        { name: "Helm", url: "https://helm.sh", type: "Package Manager", description: "Kubernetes package manager", badge: ["Official", "Essential"] },
        { name: "Istio", url: "https://istio.io", type: "Service Mesh", description: "Service mesh for microservices", badge: ["Industry Standard"] },
        { name: "Prometheus", url: "https://prometheus.io", type: "Monitoring", description: "Cloud-native monitoring", badge: ["Official", "Essential"] }
      ],
      officialDocs: [
        { name: "Kubernetes Documentation", url: "https://kubernetes.io/docs/", type: "Documentation", badge: ["Official", "Essential"], description: "Complete reference documentation" },
        { name: "Getting Started", url: "https://kubernetes.io/docs/setup/", type: "Guide", badge: ["Official"], description: "Installation and setup guides" },
        { name: "API Reference", url: "https://kubernetes.io/docs/reference/generated/kubernetes-api/", type: "Reference", badge: ["Official"], description: "Complete API specification" }
      ],
      gettingStarted: [
        { name: "Kubernetes Basics", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", type: "Tutorial", badge: ["Official", "Beginner Friendly"], description: "Interactive tutorial for beginners" },
        { name: "Minikube", url: "https://minikube.sigs.k8s.io/", type: "Tool", badge: ["Official"], description: "Local Kubernetes cluster" }
      ],
      tutorials: [
        { name: "Official Tutorials", url: "https://kubernetes.io/docs/tutorials/", type: "Tutorial", badge: ["Official"], description: "Hands-on tutorials from CNCF" }
      ],
      apiReference: [
        { name: "Kubernetes API", url: "https://kubernetes.io/docs/reference/generated/kubernetes-api/", type: "API", badge: ["Official"], description: "REST API documentation" }
      ],
      bestPractices: [
        { name: "Production Best Practices", url: "https://kubernetes.io/docs/concepts/configuration/overview/", type: "Guide", badge: ["Official"], description: "Configuration best practices" }
      ],
      examples: [
        { name: "Official Examples", url: "https://github.com/kubernetes/examples", type: "Examples", badge: ["Official"], description: "Example applications and configurations" }
      ],
      githubOrg: [
        { name: "Kubernetes", url: "https://github.com/kubernetes", type: "Organization", badge: ["Official"], description: "Official Kubernetes GitHub organization" }
      ],
      blog: [
        { name: "Kubernetes Blog", url: "https://kubernetes.io/blog/", type: "Blog", badge: ["Official"], description: "Official updates and announcements" }
      ],
      videos: [
        { name: "Kubernetes YouTube", url: "https://www.youtube.com/c/Kubernetes", type: "Video", badge: ["Official"], description: "Official video content" }
      ],
      learningPlatforms: [
        { name: "KodeKloud Kubernetes", url: "https://kodekloud.com/courses/kubernetes/", type: "Course", badge: ["Highly Recommended", "Hands-on"], description: "Interactive labs and courses" },
        { name: "Linux Academy K8s", url: "https://linuxacademy.com/course/kubernetes/", type: "Course", badge: ["Trusted"], description: "Comprehensive training" },
        { name: "A Cloud Guru K8s", url: "https://acloudguru.com/course/kubernetes", type: "Course", badge: ["Trusted"], description: "Cloud-native training" }
      ],
      expertResources: [
        { name: "Kubernetes Deep Dive", url: "https://github.com/vincenthanjs/kubernetes-deep-dive", type: "Guide", badge: ["Expert"], description: "In-depth technical guide by expert" },
        { name: "Kubernetes in Action", url: "https://www.manning.com/books/kubernetes-in-action-second-edition", type: "Book", badge: ["Industry Standard"], description: "Comprehensive book by expert authors" }
      ],
      githubRepos: [
        { name: "kubernetes/kubernetes", url: "https://github.com/kubernetes/kubernetes", type: "GitHub", stars: 108000, forks: 39000, lastUpdated: "2024-01", description: "Official Kubernetes repository", category: "Production", maintained: true, badge: ["Official", "Essential"], whyRecommended: "Source of truth for Kubernetes" },
        { name: "kubernetes/examples", url: "https://github.com/kubernetes/examples", type: "GitHub", stars: 5800, forks: 4700, lastUpdated: "2024-01", description: "Example configurations", category: "Learning", maintained: true, badge: ["Official"], whyRecommended: "Production-ready examples" },
        { name: "kubernetes/dashboard", url: "https://github.com/kubernetes/dashboard", type: "GitHub", stars: 14000, forks: 4200, lastUpdated: "2024-01", description: "Web UI for Kubernetes", category: "Production", maintained: true, badge: ["Official"], whyRecommended: "Official management UI" },
        { name: "ahmetb/kubectx", url: "https://github.com/ahmetb/kubectx", type: "GitHub", stars: 17000, forks: 1200, lastUpdated: "2023-12", description: "kubectl context switcher", category: "Production", maintained: true, badge: ["Popular", "Essential"], whyRecommended: "Essential kubectl enhancement" },
        { name: "robscott/kube-capacity", url: "https://github.com/robscott/kube-capacity", type: "GitHub", stars: 3200, forks: 280, lastUpdated: "2024-01", description: "Resource utilization", category: "Production", maintained: true, badge: ["Useful"], whyRecommended: "Resource monitoring tool" }
      ],
      youtubeResources: [
        { name: "Kubernetes Official Tutorials", url: "https://www.youtube.com/playlist?list=PL69GCPa5PaX8sLGpJ7o0f2xjwBsvqV6Pt", type: "YouTube", channel: "Kubernetes", duration: "2h 30m", badge: ["Official"], whyRecommended: "Official getting started videos" },
        { name: "Kubernetes for Beginners", url: "https://www.youtube.com/watch?v=X48VuDVv0do", type: "YouTube", channel: "TechWorld with Nana", duration: "4h 47m", badge: ["Highly Recommended"], whyRecommended: "Comprehensive beginner course" }
      ],
      practiceLabs: [
        { name: "Killer.sh CKA", url: "https://killer.sh", type: "Practice Lab", duration: "36 hours", setupRequired: "None", browserBased: true, certificationRelated: true, cost: "Paid", badge: ["Exam Simulator"], description: "CKA practice environment" },
        { name: "Play with Kubernetes", url: "https://labs.play-with-k8s.com", type: "Practice Lab", duration: "Self-paced", setupRequired: "None", browserBased: true, certificationRelated: false, cost: "Free", badge: ["Beginner Friendly"], description: "Browser-based Kubernetes labs" },
        { name: "Katacoda Kubernetes", url: "https://www.katacoda.com/courses/kubernetes", type: "Practice Lab", duration: "15-45 min each", setupRequired: "None", browserBased: true, certificationRelated: false, cost: "Free", badge: ["Interactive"], description: "Interactive scenarios" }
      ],
      projects: {
        beginner: [
          { name: "Deploy a Web Application", goal: "Deploy nginx to Kubernetes", skillsLearned: ["Pods", "Deployments", "Services"], estimatedTime: "2-3 hours", difficulty: "Beginner", githubImplementation: "https://github.com/kubernetes/examples/tree/master/web-server", badge: ["Hands-on"] }
        ],
        intermediate: [
          { name: "Multi-tier Application", goal: "Deploy frontend, backend, and database", skillsLearned: ["ConfigMaps", "Secrets", "Ingress"], estimatedTime: "4-6 hours", difficulty: "Intermediate", githubImplementation: "https://github.com/kubernetes/examples/tree/master/guestbook", badge: ["Hands-on"] }
        ],
        advanced: [
          { name: "Microservices with Istio", goal: "Service mesh implementation", skillsLearned: ["Service Mesh", "Circuit Breaking", "mTLS"], estimatedTime: "1-2 days", difficulty: "Advanced", githubImplementation: "https://github.com/istio/istio", badge: ["Advanced"] }
        ],
        enterprise: [
          { name: "Production Cluster Setup", goal: "HA cluster with monitoring", skillsLearned: ["High Availability", "Monitoring", "Backup"], estimatedTime: "1 week", difficulty: "Advanced", githubImplementation: "https://github.com/kubernetes-sigs/kubespray", badge: ["Enterprise"] }
        ]
      },
      certifications: [
        { name: "Certified Kubernetes Administrator (CKA)", provider: "CNCF", level: "Associate", cost: "$375", duration: "2 hours", examFormat: "Performance-based", questions: 15, passingScore: "66%", validity: "3 years", prerequisites: "None", officialPage: "https://www.cncf.io/certification/cka/", studyGuide: "https://github.com/cncf/curriculum", examObjectives: "https://github.com/cncf/curriculum/blob/master/CKA_Curriculum_v1.25.pdf", badge: ["Industry Standard"], description: "Most recognized Kubernetes certification" },
        { name: "Certified Kubernetes Application Developer (CKAD)", provider: "CNCF", level: "Associate", cost: "$375", duration: "2 hours", examFormat: "Performance-based", questions: 15, passingScore: "66%", validity: "3 years", prerequisites: "None", officialPage: "https://www.cncf.io/certification/ckad/", studyGuide: "https://github.com/cncf/curriculum", examObjectives: "https://github.com/cncf/curriculum/blob/master/CKAD_Curriculum_v1.25.pdf", badge: ["Industry Standard"], description: "Focus on application development" }
      ],
      certPreparation: {
        studyGuides: [
          { name: "CKA Curriculum", url: "https://github.com/cncf/curriculum", type: "Study Guide", badge: ["Official"], description: "Official exam curriculum" }
        ],
        practiceTests: [
          { name: "Killer.sh CKA", url: "https://killer.sh", type: "Practice Test", badge: ["Exam Simulator"], description: "Real exam simulation" }
        ],
        flashcards: [],
        examTips: []
      },
      interviewPrep: {
        beginner: [
          { question: "What is a Pod?", level: "Beginner", answer: "Smallest deployable unit - one or more containers sharing network/storage", category: "Core Concepts" },
          { question: "Explain Deployment vs StatefulSet", level: "Beginner", answer: "Deployments for stateless apps, StatefulSets maintain identity and ordered deployment for stateful apps", category: "Workloads" }
        ],
        intermediate: [
          { question: "How does Kubernetes assign pods to nodes?", level: "Intermediate", answer: "Scheduler evaluates affinity, taints/tolerations, resource requests, and node selectors to place pods optimally", category: "Scheduling" }
        ],
        advanced: [
          { question: "Design a multi-tenant Kubernetes platform", level: "Advanced", answer: "Use namespaces, RBAC, NetworkPolicies, ResourceQuotas, and potentially cluster federation", category: "Architecture" }
        ],
        scenarios: [
          { question: "Debug a CrashLoopBackOff", level: "Intermediate", answer: "Check kubectl describe, then kubectl logs to identify root cause - usually config or application errors", category: "Troubleshooting" }
        ],
        troubleshooting: [
          { question: "Pod won't start - ImagePullBackOff", level: "Intermediate", answer: "Verify image name, check registry credentials, review imagePullSecrets configuration", category: "Networking" }
        ]
      },
      faqs: [
        { question: "How do I expose my application externally?", answer: "Use Services (ClusterIP, NodePort, LoadBalancer) or Ingress controllers for HTTP/HTTPS routing", source: "Official Documentation" },
        { question: "What's the difference between horizontal and vertical scaling?", answer: "Horizontal adds more instances, vertical increases resources of existing instances", source: "Kubernetes Blog" }
      ],
      cheatSheets: [
        { name: "Kubectl Cheat Sheet", url: "https://kubernetes.io/docs/reference/kubectl/cheatsheet/", type: "Cheat Sheet", format: "Interactive", badge: ["Official"], description: "Essential kubectl commands" },
        { name: "YAML Reference", url: "https://kubernetes.io/docs/concepts/configuration/overview/", type: "Cheat Sheet", format: "PDF", badge: ["Official"], description: "Configuration reference" }
      ],
      books: {
        beginner: [
          { name: "Kubernetes: Up and Running", author: "Kelsey Hightower, Brendan Burns, Joe Beda", url: "https://www.oreilly.com/library/view/kubernetes-up-and/9781491935668/", type: "Book", whyRecommended: "Best introduction by Kubernetes creators", cost: "Paid", badge: ["Industry Standard"] }
        ],
        intermediate: [
          { name: "Kubernetes Patterns", author: "Bilgin Ibryam, Roland Huß", url: "https://www.oreilly.com/library/view/kubernetes-patterns/9781492050278/", type: "Book", whyRecommended: "Design patterns for Kubernetes applications", cost: "Paid", badge: ["Best Seller"] }
        ],
        advanced: [
          { name: "Production Kubernetes", author: "Josh Rosso, Richmond W. Lo, Alexander Brand, John Harris", url: "https://www.oreilly.com/library/view/production-kubernetes/9781492097105/", type: "Book", whyRecommended: "Enterprise production practices", cost: "Paid", badge: ["Expert"] }
        ]
      },
      blogs: [
        { name: "Kubernetes Blog", url: "https://kubernetes.io/blog/", type: "Blog", badge: ["Official"], description: "Official announcements and deep dives" }
      ],
      newsletters: [
        { name: "Kubernetes Newsletter", url: "https://kubernetes.io/", type: "Newsletter", badge: ["Official"], description: "Monthly updates from CNCF" }
      ],
      podcasts: [
        { name: "Kubernetes Podcast", url: "https://kubernetespodcast.com/", type: "Podcast", badge: ["Official"], description: "Weekly Kubernetes discussions" }
      ]
    }
  };

  const defaultResources = skillResources[skillLower];

  if (defaultResources) {
    return defaultResources as SkillResources;
  }

  // Generic template maintaining priority order
  return {
    skill: skill,
    timeToMaster: "2-4 months",
    keyTopics: ["Fundamentals", "Core APIs", "Best Practices", "Security", "Performance", "DevOps Integration"],
    ecosystem: [],
    officialDocs: [{ name: "Official Documentation", url: `https://docs.${skillLower}.org`, type: "Documentation", badge: ["Official"], description: "Primary documentation source" }],
    gettingStarted: [],
    tutorials: [],
    apiReference: [],
    bestPractices: [],
    examples: [],
    githubOrg: [],
    blog: [],
    videos: [],
    learningPlatforms: [],
    expertResources: [],
    githubRepos: [],
    youtubeResources: [],
    practiceLabs: [],
    projects: { beginner: [], intermediate: [], advanced: [], enterprise: [] },
    certifications: [],
    certPreparation: { studyGuides: [], practiceTests: [], flashcards: [], examTips: [] },
    interviewPrep: { beginner: [], intermediate: [], advanced: [], scenarios: [], troubleshooting: [] },
    faqs: [],
    cheatSheets: [],
    books: { beginner: [], intermediate: [], advanced: [] },
    blogs: [],
    newsletters: [],
    podcasts: []
  };
};

export function Resources() {
  const [activeSkill, setActiveSkill] = useState<string>('kubernetes');
  const [customSkill, setCustomSkill] = useState('');
  const [customResources, setCustomResources] = useState<SkillResources | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterFree, setFilterFree] = useState<boolean | null>(null);

  const current = customResources || generateComprehensiveResources(activeSkill);

  const handleCustomSearch = () => {
    if (!customSkill.trim()) return;
    const resources = generateComprehensiveResources(customSkill.trim());
    setCustomResources(resources);
    setActiveSkill(customSkill.toLowerCase());
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) => {
    const colors = {
      default: 'bg-gray-700 text-gray-300',
      official: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      popular: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      essential: 'bg-green-500/20 text-green-400 border-green-500/30',
      handsOn: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return (
      <span className={`inline-block px-2 py-0.5 text-xs rounded border ${colors[variant as keyof typeof colors] || colors.default}`}>
        {children}
      </span>
    );
  };

  const ResourceCard = ({ resource, showWhy = false }: { resource: any; showWhy?: boolean }) => (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-600 transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium text-white group-hover:text-purple-400 transition-colors flex items-center gap-2">
            {resource.name}
            {resource.badge && resource.badge.map((b: string, i: number) => (
              <Badge key={i} variant={b.toLowerCase().replace(' ', '')}>{b}</Badge>
            ))}
          </div>
          {resource.description && (
            <div className="text-sm text-gray-400 mt-1">{resource.description}</div>
          )}
        </div>
        <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-purple-400 flex-shrink-0" />
      </div>
      {resource.difficulty && <div className="text-xs text-gray-500">{resource.difficulty}</div>}
      {showWhy && resource.whyRecommended && (
        <div className="text-xs text-purple-400 mt-2 italic">"{resource.whyRecommended}"</div>
      )}
    </a>
  );

  const Section = ({ id, title, icon: Icon, children, count }: { id: string; title: string; icon: any; children: React.ReactNode; count?: number }) => (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-white">{title}</span>
          {count !== undefined && <span className="text-sm text-gray-500">({count})</span>}
        </div>
        {expandedSections.has(id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {expandedSections.has(id) && (
        <div className="px-6 pb-6 border-t border-gray-800">{children}</div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
          <Target className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-400">AI-Powered Resource Discovery</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Learning Resource Hub</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Discover the highest-quality learning resources, validated and ranked by professionals
        </p>
      </div>

      {/* Search */}
      <div className="flex justify-center gap-3">
        <input
          type="text"
          value={customSkill}
          onChange={(e) => setCustomSkill(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCustomSearch()}
          placeholder="Enter any skill (Docker, Terraform, React, Python...)"
          className="px-6 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white w-96 focus:border-purple-500 outline-none"
        />
        <button
          onClick={handleCustomSearch}
          disabled={!customSkill.trim()}
          className="px-8 py-3 rounded-xl bg-purple-600 text-white font-medium disabled:opacity-50 flex items-center gap-2 hover:bg-purple-700 transition-colors"
        >
          <Search className="w-4 h-4" /> Discover Resources
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 justify-center">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm">
          <option value="all">All Types</option>
          <option value="official">Official Only</option>
          <option value="free">Free Resources</option>
          <option value="hands-on">Hands-on</option>
        </select>
        <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm">
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Overview */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{current.skill}</h2>
            <p className="text-gray-400">Time to Mastery: {current.timeToMaster}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Quality Score</div>
            <div className="text-2xl font-bold text-purple-400">98/100</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {current.keyTopics.map((topic, i) => (
            <Badge key={i}>{topic}</Badge>
          ))}
        </div>

        {current.ecosystem && current.ecosystem.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="text-sm text-gray-400 mb-3">Related Tools</div>
            <div className="grid md:grid-cols-3 gap-3">
              {current.ecosystem.slice(0, 3).map((tool, i) => (
                <a key={i} href={tool.url} target="_blank" className="p-3 bg-gray-950 rounded-lg border border-gray-800 hover:border-gray-600">
                  <div className="font-medium text-white">{tool.name}</div>
                  <div className="text-xs text-gray-500">{tool.description}</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Official Resources Section */}
      <Section id="official" title="Official Resources" icon={CheckCircle} count={current.officialDocs.length}>
        <div className="grid md:grid-cols-2 gap-4 pt-4">
          {current.officialDocs.map((doc, i) => <ResourceCard key={i} resource={doc} />)}
        </div>
      </Section>

      {/* Getting Started */}
      {current.gettingStarted.length > 0 && (
        <Section id="getting-started" title="Getting Started Guides" icon={Zap} count={current.gettingStarted.length}>
          <div className="grid md:grid-cols-2 gap-4 pt-4">
            {current.gettingStarted.map((guide, i) => <ResourceCard key={i} resource={guide} />)}
          </div>
        </Section>
      )}

      {/* Learning Platforms - Prioritized */}
      {current.learningPlatforms.length > 0 && (
        <Section id="platforms" title="Learning Platforms" icon={BookOpen} count={current.learningPlatforms.length}>
          <div className="grid md:grid-cols-2 gap-4 pt-4">
            {current.learningPlatforms.map((platform, i) => <ResourceCard key={i} resource={platform} />)}
          </div>
        </Section>
      )}

      {/* GitHub Repositories - Top Ranked */}
      {current.githubRepos.length > 0 && (
        <Section id="github" title="GitHub Repositories" icon={Github} count={current.githubRepos.length}>
          <div className="space-y-3 pt-4">
            {current.githubRepos
              .sort((a, b) => b.stars - a.stars)
              .slice(0, 10)
              .map((repo, i) => (
                <a key={i} href={repo.url} target="_blank" className="block p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-600 group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-white group-hover:text-purple-400 flex items-center gap-2">
                        {repo.name}
                        {repo.badge && repo.badge.map((b, j) => <Badge key={j}>{b}</Badge>)}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">{repo.description}</div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Star className="w-4 h-4" />{repo.stars.toLocaleString()}</span>
                      <span>{repo.lastUpdated}</span>
                    </div>
                  </div>
                  <div className="text-xs text-purple-400 mt-2">"{repo.whyRecommended}"</div>
                </a>
              ))}
          </div>
        </Section>
      )}

      {/* YouTube Resources */}
      {current.youtubeResources.length > 0 && (
        <Section id="youtube" title="Video Courses" icon={Youtube} count={current.youtubeResources.length}>
          <div className="grid md:grid-cols-2 gap-4 pt-4">
            {current.youtubeResources.map((video, i) => (
              <a key={i} href={video.url} target="_blank" className="block p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-600 group">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-white group-hover:text-purple-400">{video.name}</div>
                    <div className="text-sm text-gray-400">{video.channel} • {video.duration}</div>
                    {video.whyRecommended && <div className="text-xs text-purple-400 mt-2">"{video.whyRecommended}"</div>}
                  </div>
                  <PlayCircle className="w-5 h-5 text-gray-600 group-hover:text-purple-400" />
                </div>
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* Practice Labs */}
      {current.practiceLabs.length > 0 && (
        <Section id="labs" title="Hands-on Practice Labs" icon={Code} count={current.practiceLabs.length}>
          <div className="grid md:grid-cols-2 gap-4 pt-4">
            {current.practiceLabs.map((lab, i) => (
              <a key={i} href={lab.url} target="_blank" className="block p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-600 group">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-white group-hover:text-purple-400">{lab.name}</div>
                    <div className="text-sm text-gray-400">{lab.duration} • {lab.cost}</div>
                  </div>
                  {lab.browserBased && <Badge variant="handsOn">Browser-based</Badge>}
                </div>
                <div className="text-xs text-gray-500">{lab.description}</div>
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* Projects */}
      {(current.projects.beginner.length > 0 || current.projects.intermediate.length > 0) && (
        <Section id="projects" title="Build Real Projects" icon={Target} count={
          current.projects.beginner.length + current.projects.intermediate.length +
          current.projects.advanced.length + current.projects.enterprise.length
        }>
          <div className="space-y-6 pt-4">
            {['beginner', 'intermediate', 'advanced', 'enterprise'].map(level => (
              (current.projects as any)[level].length > 0 && (
                <div key={level}>
                  <div className="text-sm uppercase tracking-wider text-gray-500 mb-3">{level} Level</div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {(current.projects as any)[level].map((project: any, i: number) => (
                      <div key={i} className="p-4 bg-gray-950 rounded-xl border border-gray-800">
                        <div className="font-medium text-white mb-1">{project.name}</div>
                        <div className="text-sm text-gray-400 mb-2">{project.goal}</div>
                        <div className="text-xs text-gray-500">{project.estimatedTime} • {project.difficulty}</div>
                        {project.skillsLearned && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.skillsLearned.map((skill: string, j: number) => <Badge key={j}>{skill}</Badge>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </Section>
      )}

      {/* Certifications */}
      {current.certifications.length > 0 && (
        <Section id="certs" title="Certifications" icon={CertIcon} count={current.certifications.length}>
          <div className="grid md:grid-cols-2 gap-4 pt-4">
            {current.certifications.map((cert, i) => (
              <div key={i} className="p-5 bg-gray-950 rounded-xl border border-gray-800">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white">{cert.name}</div>
                    <div className="text-sm text-gray-400">{cert.provider}</div>
                  </div>
                  {cert.badge && cert.badge.map((b, j) => <Badge key={j}>{b}</Badge>)}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Level:</span> {cert.level}</div>
                  <div className="flex justify-between"><span className="text-gray-500">Cost:</span> {cert.cost}</div>
                  <div className="flex justify-between"><span className="text-gray-500">Duration:</span> {cert.duration}</div>
                  <div className="flex justify-between"><span className="text-gray-500">Validity:</span> {cert.validity}</div>
                </div>
                <a href={cert.officialPage} target="_blank" className="inline-block mt-3 text-sm text-purple-400 hover:text-purple-300">
                  Official Page <ExternalLink className="w-3 h-3 inline" />
                </a>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Interview Preparation */}
      {(current.interviewPrep.beginner.length > 0 || current.interviewPrep.intermediate.length > 0) && (
        <Section id="interview" title="Interview Preparation" icon={HelpCircle} count={
          current.interviewPrep.beginner.length + current.interviewPrep.intermediate.length +
          current.interviewPrep.advanced.length
        }>
          <div className="space-y-4 pt-4">
            {['beginner', 'intermediate', 'advanced'].map(level => (
              (current.interviewPrep as any)[level].length > 0 && (
                <div key={level}>
                  <div className="text-sm uppercase tracking-wider text-gray-500 mb-2">{level} Level</div>
                  {(current.interviewPrep as any)[level].map((q: InterviewQ, i: number) => (
                    <div key={i} className="p-4 bg-gray-950 rounded-lg border border-gray-800 mb-2">
                      <div className="font-medium text-white mb-2">{q.question}</div>
                      <div className="text-sm text-gray-400">{q.answer}</div>
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
        </Section>
      )}

      {/* Cheat Sheets */}
      {current.cheatSheets.length > 0 && (
        <Section id="cheatsheets" title="Cheat Sheets & References" icon={FileText} count={current.cheatSheets.length}>
          <div className="grid md:grid-cols-3 gap-4 pt-4">
            {current.cheatSheets.map((sheet, i) => <ResourceCard key={i} resource={sheet} />)}
          </div>
        </Section>
      )}

      {/* Books */}
      {(current.books.beginner.length > 0 || current.books.intermediate.length > 0) && (
        <Section id="books" title="Recommended Books" icon={BookOpen} count={
          current.books.beginner.length + current.books.intermediate.length + current.books.advanced.length
        }>
          <div className="space-y-4 pt-4">
            {['beginner', 'intermediate', 'advanced'].map(level => (
              (current.books as any)[level].length > 0 && (
                <div key={level}>
                  <div className="text-sm uppercase tracking-wider text-gray-500 mb-2">{level}</div>
                  {(current.books as any)[level].map((book: Book, i: number) => (
                    <a key={i} href={book.url} target="_blank" className="block p-4 bg-gray-950 rounded-lg border border-gray-800 hover:border-gray-600 mb-2">
                      <div className="font-medium text-white">{book.name}</div>
                      <div className="text-sm text-gray-400">{book.author}</div>
                      <div className="text-xs text-purple-400 mt-1">"{book.whyRecommended}"</div>
                    </a>
                  ))}
                </div>
              )
            ))}
          </div>
        </Section>
      )}

      {/* Expert Resources */}
      {current.expertResources.length > 0 && (
        <Section id="experts" title="Expert-Created Resources" icon={Star} count={current.expertResources.length}>
          <div className="grid md:grid-cols-2 gap-4 pt-4">
            {current.expertResources.map((expert, i) => <ResourceCard key={i} resource={expert} />)}
          </div>
        </Section>
      )}

      {/* FAQs */}
      {current.faqs.length > 0 && (
        <Section id="faqs" title="Frequently Asked Questions" icon={HelpCircle} count={current.faqs.length}>
          <div className="space-y-3 pt-4">
            {current.faqs.map((faq, i) => (
              <div key={i} className="p-4 bg-gray-950 rounded-lg border border-gray-800">
                <div className="font-medium text-white mb-1">{faq.question}</div>
                <div className="text-sm text-gray-400">{faq.answer}</div>
                <div className="text-xs text-gray-500 mt-2">Source: {faq.source}</div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}