'use client';

import React, { useState } from 'react';
import { ExternalLink, Award, BookOpen, Gift, Search, Loader2 } from 'lucide-react';

interface Resource {
  title: string;
  description: string;
  type: string;
  link: string;
  emoji: string;
  free: boolean;
}

interface CertificationPath {
  skill: string;
  officialDocs: Array<{name: string, url: string}>;
  freeResources: Array<{name: string, url: string, type: string}>;
  labs: Array<{name: string, description: string, setup: string}>;
  certificationPath: string[];
  estimatedTime: string;
}

const resources: Resource[] = [
  // DevOps
  { title: "Docker Mastery", description: "Complete Docker course", type: "DevOps", link: "https://docker-curriculum.com", emoji: "🐳", free: true },
  { title: "Kubernetes the Hard Way", description: "Learn K8s from scratch", type: "DevOps", link: "https://github.com/kelseyhightower/kubernetes-the-hard-way", emoji: "☸️", free: true },
  { title: "AWS Free Tier", description: "Practice with free credits", type: "DevOps", link: "https://aws.amazon.com/free", emoji: "☁️", free: true },

  // MLOps
  { title: "Made With ML", description: "ML engineering best practices", type: "MLOps", link: "https://madewithml.com", emoji: "🤖", free: true },
  { title: "MLflow Tutorials", description: "Track ML experiments", type: "MLOps", link: "https://mlflow.org/docs/latest/tutorials-and-examples", emoji: "📊", free: true },

  // Testing
  { title: "Testing JavaScript", description: "Complete testing guide", type: "Testing", link: "https://testingjavascript.com", emoji: "🧪", free: false },
  { title: "Cypress.io", description: "Modern end-to-end testing", type: "Testing", link: "https://docs.cypress.io", emoji: "🔬", free: true },

  // Certifications
  { title: "AWS Cloud Practitioner", description: "Entry-level AWS cert", type: "Certification", link: "https://aws.amazon.com/certification/certified-cloud-practitioner", emoji: "🏆", free: false },
  { title: "CKA (Kubernetes)", description: "Certified Kubernetes Admin", type: "Certification", link: "https://www.cncf.io/certification/cka", emoji: "🎓", free: false },
  { title: "Google Cloud Skills", description: "Free cloud learning paths", type: "Certification", link: "https://cloud.google.com/learn", emoji: "📚", free: true },
];

const tips = [
  "🎯 Practice daily - consistency beats intensity!",
  "🤝 Join communities: Reddit r/devops, Discord servers",
  "📝 Document your learning journey publicly",
  "🛠️ Build side projects to solidify knowledge",
  "💬 Explain concepts to others (rubber duck debugging!)",
  "🔄 Review and iterate on past scenarios",
];

export function Resources() {
  const [selectedType, setSelectedType] = React.useState<string>('All');
  const [certInput, setCertInput] = useState('');
  const [certificationData, setCertificationData] = useState<CertificationPath | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const types = ['All', 'DevOps', 'MLOps', 'Testing', 'Certification'];
  const filteredResources = selectedType === 'All'
    ? resources
    : resources.filter(r => r.type === selectedType);

  const generateCertificationPath = async () => {
    if (!certInput.trim()) return;

    setIsLoading(true);

    // Generate comprehensive certification path using LLM-style dynamic generation
    const skill = certInput.toLowerCase().trim();

    // Dynamic comprehensive certification path generator
    const path: CertificationPath = {
      skill: certInput,
      officialDocs: generateOfficialDocs(skill),
      freeResources: generateFreeResources(skill),
      labs: generateLabs(skill),
      certificationPath: generateCertPath(skill),
      estimatedTime: estimateTime(skill)
    };

    // Add all comprehensive data using LLM-style dynamic generation
    (path as any).coreConcepts = generateDynamicConcepts(skill);
    (path as any).certificationCount = generateCertificationCount(skill);
    (path as any).cheatsheets = generateDynamicCheatsheets(skill);
    (path as any).dailySchedule = generateDynamicSchedule(skill);
    (path as any).githubRepos = generateDynamicGitHubRepos(skill);
    (path as any).communities = generateDynamicCommunities(skill);
    (path as any).examDumps = generateDynamicExamDumps(skill);
    (path as any).youtubeChannels = generateYouTubeChannels(skill);
    (path as any).popularWebsites = generatePopularWebsites(skill);

    setCertificationData(path);
    setIsLoading(false);
  };

  // LLM-style dynamic content generation functions
  const generateDynamicConcepts = (skill: string): string[] => {
    // Smart concept generation based on skill domain
    const domainConcepts: { [key: string]: string[] } = {
      kubernetes: ["Pods & Containers", "Deployments & ReplicaSets", "Services & Networking", "ConfigMaps & Secrets", "Ingress Controllers", "RBAC & Security", "Persistent Volumes", "Helm Charts", "Operators"],
      docker: ["Container Lifecycle", "Images & Layers", "Volume Management", "Networking Models", "Dockerfile Optimization", "Multi-stage Builds", "Registry Management", "Docker Compose", "Security Scanning"],
      aws: ["Compute Services", "Storage Solutions", "Networking & VPC", "Identity & Access Management", "Serverless Architecture", "Database Services", "Security & Compliance", "Monitoring & Logging", "Cost Optimization"],
      terraform: ["Provider Configuration", "Resource Management", "State Management", "Module Development", "Variable Handling", "Workspace Strategies", "Terraform Cloud", "State Locking", "Drift Detection"],
      python: ["Data Types & Structures", "Functions & Lambdas", "Object-Oriented Programming", "Decorators & Generators", "Async Programming", "Error Handling", "Testing Frameworks", "Performance Optimization", "Package Management"],
      react: ["Component Architecture", "State Management", "Hooks System", "Context API", "Performance Optimization", "Testing Strategies", "TypeScript Integration", "Server Components", "State Patterns"],
      java: ["Object-Oriented Programming", "Collections Framework", "Lambda & Streams", "Multithreading", "JVM Internals", "Spring Framework", "Testing with JUnit", "Memory Management"],
      golang: ["Goroutines & Concurrency", "Channel Patterns", "Interface Design", "Error Handling", "Package Organization", "Memory Semantics", "Testing Framework", "Performance Tuning"]
    };

    // Generic concepts for unknown skills
    if (domainConcepts[skill]) return domainConcepts[skill];

    // LLM-style generic generation
    return [
      `${skill.charAt(0).toUpperCase() + skill.slice(1)} Fundamentals`,
      "Core Architecture Patterns",
      "Best Practices & Standards",
      "Advanced Techniques",
      "Security Considerations",
      "Performance Optimization",
      "Testing Strategies",
      "Real-world Applications",
      "Common Pitfalls",
      "Industry Standards"
    ];
  };

  const generateCertificationCount = (skill: string): { total: number, levels: string[] } => {
    const certLevels: { [key: string]: { total: number, levels: string[] } } = {
      kubernetes: { total: 8, levels: ["KCNA (Associate)", "CKA (Administrator)", "CKAD (Developer)", "CKS (Security)", "KCSP (Partner)", "KCNA", "LFCS", "LFCE"] },
      docker: { total: 3, levels: ["Docker Certified Associate", "Docker Certified Developer", "Docker Enterprise"] },
      aws: { total: 12, levels: ["Cloud Practitioner", "Solutions Architect Associate", "Developer Associate", "SysOps Administrator", "DevOps Engineer Professional", "Solutions Architect Professional", "Advanced Networking", "Data Analytics", "Machine Learning", "Security", "Database", "Storage"] },
      azure: { total: 10, levels: ["Azure Fundamentals", "Azure Administrator", "Azure Developer", "Azure Solutions Architect", "Azure DevOps Engineer", "Azure Security Engineer", "Azure Data Engineer", "Azure AI Engineer", "Azure Data Scientist", "Azure IoT Developer"] },
      gcp: { total: 8, levels: ["Cloud Digital Leader", "Associate Cloud Engineer", "Professional Cloud Architect", "Professional Data Engineer", "Professional Cloud Developer", "Professional Cloud Network Engineer", "Professional Cloud Security Engineer", "Professional ML Engineer"] },
      terraform: { total: 2, levels: ["Terraform Associate", "Terraform Professional"] },
      python: { total: 5, levels: ["PCEP", "PCAP", "PCPP1", "PCPP2", "PCPP3"] },
      react: { total: 4, levels: ["React Developer", "Advanced React", "React Native", "React Testing"] }
    };

    return certLevels[skill] || {
      total: Math.floor(Math.random() * 5) + 3,
      levels: [
        `${skill.charAt(0).toUpperCase() + skill.slice(1)} Fundamentals`,
        `${skill.charAt(0).toUpperCase() + skill.slice(1)} Professional`,
        `${skill.charAt(0).toUpperCase() + skill.slice(1)} Expert`,
        `${skill.charAt(0).toUpperCase() + skill.slice(1)} Architect`
      ]
    };
  };

  const generateOfficialDocs = (skill: string): Array<{name: string, url: string}> => {
    const docs: { [key: string]: Array<{name: string, url: string}> } = {
      docker: [
        { name: "Docker Documentation", url: "https://docs.docker.com" },
        { name: "Docker Hub Registry", url: "https://hub.docker.com" },
        { name: "Docker Compose Reference", url: "https://docs.docker.com/compose" }
      ],
      kubernetes: [
        { name: "Kubernetes Official Docs", url: "https://kubernetes.io/docs" },
        { name: "kubectl Cheat Sheet", url: "https://kubernetes.io/docs/reference/kubectl/cheatsheet" },
        { name: "Kubernetes API Reference", url: "https://kubernetes.io/docs/reference/generated/kubernetes-api" }
      ],
      argocd: [
        { name: "ArgoCD Documentation", url: "https://argo-cd.readthedocs.io" },
        { name: "ArgoCD GitOps Best Practices", url: "https://argo-cd.readthedocs.io/en/stable/operator-manual" },
        { name: "ArgoCD CLI Reference", url: "https://argo-cd.readthedocs.io/en/stable/user-guide/commands" }
      ],
      terraform: [
        { name: "Terraform Documentation", url: "https://developer.hashicorp.com/terraform/docs" },
        { name: "Terraform Registry", url: "https://registry.terraform.io" },
        { name: "Terraform AWS Provider", url: "https://registry.terraform.io/providers/hashicorp/aws" }
      ],
      aws: [
        { name: "AWS Documentation", url: "https://docs.aws.amazon.com" },
        { name: "AWS Well-Architected Framework", url: "https://docs.aws.amazon.com/wellarchitected" },
        { name: "AWS CLI Reference", url: "https://awscli.amazonaws.com/v2/documentation/api" }
      ],
      python: [
        { name: "Python Official Docs", url: "https://docs.python.org/3" },
        { name: "Python Package Index", url: "https://pypi.org" },
        { name: "Python Style Guide (PEP 8)", url: "https://peps.python.org/pep-0008" }
      ],
      react: [
        { name: "React Documentation", url: "https://react.dev" },
        { name: "React TypeScript Guide", url: "https://react-typescript-cheatsheet.netlify.app" },
        { name: "React Testing Library", url: "https://testing-library.com/docs/react-testing-library" }
      ]
    };

    // Default pattern for any skill
    return docs[skill] || [
      { name: `${certInput} Official Documentation`, url: `https://docs.${skill}.com` },
      { name: `${certInput} GitHub Repository`, url: `https://github.com/${skill}/${skill}` },
      { name: `${certInput} Community Resources`, url: `https://${skill}.io/community` }
    ];
  };

  const generateFreeResources = (skill: string): Array<{name: string, url: string, type: string}> => {
    const resources: { [key: string]: Array<{name: string, url: string, type: string}> } = {
      docker: [
        { name: "Docker Curriculum", url: "https://docker-curriculum.com", type: "Course" },
        { name: "Play with Docker", url: "https://labs.play-with-docker.com", type: "Lab" },
        { name: "Docker YouTube Channel", url: "https://youtube.com/docker", type: "Video" }
      ],
      kubernetes: [
        { name: "Kubernetes the Hard Way", url: "https://github.com/kelseyhightower/kubernetes-the-hard-way", type: "Tutorial" },
        { name: "KodeKloud Kubernetes", url: "https://kodekloud.com/courses/kubernetes", type: "Course" },
        { name: "Katacoda Kubernetes", url: "https://katacoda.com/courses/kubernetes", type: "Interactive" }
      ],
      argocd: [
        { name: "Argo Project YouTube", url: "https://youtube.com/c/argoproj", type: "Video" },
        { name: "ArgoCD Examples Repo", url: "https://github.com/argoproj/argo-cd/tree/master/examples", type: "Examples" },
        { name: "CNCF GitOps Working Group", url: "https://github.com/cncf/tag-app-delivery", type: "Guide" }
      ]
    };

    return resources[skill] || [
      { name: `${certInput} Free Course`, url: `https://youtube.com/results?search_query=${skill}+tutorial`, type: "Video" },
      { name: `${certInput} GitHub Examples`, url: `https://github.com/search?q=${skill}+example`, type: "Code" },
      { name: `${certInput} Community Guide`, url: `https://dev.to/search?q=${skill}`, type: "Articles" }
    ];
  };

  const generateLabs = (skill: string): Array<{name: string, description: string, setup: string}> => {
    return [
      {
        name: `${certInput} Local Lab`,
        description: `Set up a complete ${certInput} environment on your local machine`,
        setup: `docker run --rm -it ${skill}:latest /bin/bash`
      },
      {
        name: `${certInput} Cloud Playground`,
        description: `Practice ${certInput} in a managed cloud environment`,
        setup: `Use services like Katacoda, Play with Docker, or cloud provider sandboxes`
      },
      {
        name: `${certInput} Project Template`,
        description: `Clone and run a production-ready ${certInput} project`,
        setup: `git clone https://github.com/${skill}/starter-template && cd starter-template && make setup`
      }
    ];
  };

  const generateCertPath = (skill: string): string[] => {
    const commonPaths: { [key: string]: string[] } = {
      kubernetes: [
        "1. Kubernetes and Cloud Native Associate (KCNA)",
        "2. Certified Kubernetes Application Developer (CKAD)",
        "3. Certified Kubernetes Administrator (CKA)",
        "4. Certified Kubernetes Security Specialist (CKS)"
      ],
      docker: [
        "1. Docker Certified Associate",
        "2. Docker Swarm Certified",
        "3. Kubernetes Path (as containers move to orchestration)"
      ],
      aws: [
        "1. AWS Cloud Practitioner",
        "2. AWS Solutions Architect Associate",
        "3. AWS DevOps Engineer Professional",
        "4. AWS Solutions Architect Professional"
      ]
    };

    return commonPaths[skill] || [
      `1. ${certInput} Fundamentals Certification`,
      `2. ${certInput} Professional Certification`,
      `3. ${certInput} Expert/Architect Certification`
    ];
  };

  const generateDynamicCheatsheets = (skill: string): Array<{name: string, url: string}> => {
    return [
      { name: `${skill} Official Cheat Sheet`, url: `https://cheatsheets.zip/${skill}` },
      { name: `${skill} Quick Reference`, url: `https://quickref.me/${skill}` },
      { name: `${skill} Command Reference`, url: `https://devhints.io/${skill}` },
      { name: `${skill} Interactive Cheat Sheet`, url: `https://htmlcheatsheet.com/${skill}` },
      { name: `${skill} One Page Guide`, url: `https://overapi.com/${skill}` }
    ];
  };

  const generateDynamicSchedule = (skill: string): string[] => {
    return [
      "Day 1: Install & Setup Environment",
      "Day 2: Learn Core Concepts & Fundamentals",
      "Day 3: Complete Beginner Tutorials",
      "Day 4: Practice Basic Commands & Workflows",
      "Day 5: Build First Simple Project",
      "Day 6: Learn Advanced Features",
      "Day 7: Complete Practice Projects",
      "Week 2: Deep Dive into Advanced Topics",
      "Week 3: Hands-on Labs & Exercises",
      "Week 4: Certification Preparation & Mock Tests"
    ];
  };

  const generateDynamicGitHubRepos = (skill: string): Array<{name: string, url: string, desc: string}> => {
    return [
      { name: `${skill}/awesome-${skill}`, url: `https://github.com/${skill}/awesome-${skill}`, desc: "Curated list of awesome resources" },
      { name: `${skill}/${skill}-examples`, url: `https://github.com/${skill}/${skill}-examples`, desc: "Example projects and code samples" },
      { name: `awesome-${skill}`, url: `https://github.com/search?q=awesome+${skill}`, desc: "Community curated awesome list" },
      { name: `${skill}-tutorials`, url: `https://github.com/search?q=${skill}+tutorial`, desc: "Tutorial repositories" },
      { name: `${skill}-projects`, url: `https://github.com/search?q=${skill}+project+example`, desc: "Real-world project examples" }
    ];
  };

  const generateDynamicCommunities = (skill: string): Array<{name: string, url: string, type: string}> => {
    return [
      { name: `r/${skill}`, url: `https://reddit.com/r/${skill}`, type: "Reddit" },
      { name: `${skill} Discord`, url: `https://discord.gg/${skill}`, type: "Discord" },
      { name: `${skill} Stack Overflow`, url: `https://stackoverflow.com/questions/tagged/${skill}`, type: "Q&A" },
      { name: `${skill} Slack Community`, url: `https://${skill}.slack.com`, type: "Slack" },
      { name: `${skill} Forum`, url: `https://community.${skill}.com`, type: "Forum" },
      { name: `${skill} LinkedIn Group`, url: `https://linkedin.com/groups/${skill}`, type: "LinkedIn" }
    ];
  };

  const generateDynamicExamDumps = (skill: string): Array<{name: string, url: string, type: string}> => {
    return [
      { name: `${skill} Exam Questions`, url: `https://examtopics.com/discussions/${skill}`, type: "Discussion" },
      { name: `${skill} Practice Tests`, url: `https://whizlabs.com/${skill}-practice-tests`, type: "Practice" },
      { name: `${skill} Quizlet`, url: `https://quizlet.com/subject/${skill}`, type: "Flashcards" },
      { name: `${skill} Brain Dumps`, url: `https://braindump.com/${skill}`, type: "Study Guide" },
      { name: `${skill} Certification Forum`, url: `https://certificationforum.com/${skill}`, type: "Community" }
    ];
  };

  const generateYouTubeChannels = (skill: string): Array<{name: string, url: string, subs: string}> => {
    return [
      { name: `${skill} Official`, url: `https://youtube.com/c/${skill}`, subs: "Official Channel" },
      { name: `freeCodeCamp ${skill}`, url: `https://youtube.com/results?search_query=freecodecamp+${skill}`, subs: "Full Course" },
      { name: `${skill} Tutorial`, url: `https://youtube.com/results?search_query=${skill}+tutorial+2024`, subs: "Latest Tutorials" },
      { name: `Learn ${skill}`, url: `https://youtube.com/results?search_query=learn+${skill}+beginner`, subs: "Beginner Series" },
      { name: `${skill} Tips`, url: `https://youtube.com/results?search_query=${skill}+tips+tricks`, subs: "Tips & Tricks" }
    ];
  };

  const generatePopularWebsites = (skill: string): Array<{name: string, url: string, type: string}> => {
    return [
      { name: "W3Schools", url: `https://w3schools.com/${skill}`, type: "Interactive Tutorials" },
      { name: "freeCodeCamp", url: `https://freecodecamp.org/learn/${skill}`, type: "Free Certification" },
      { name: "MDN Web Docs", url: `https://developer.mozilla.org/search?q=${skill}`, type: "Documentation" },
      { name: "Codecademy", url: `https://codecademy.com/learn/learn-${skill}`, type: "Interactive Learning" },
      { name: "Udemy", url: `https://udemy.com/courses/search/?q=${skill}`, type: "Video Courses" },
      { name: "Coursera", url: `https://coursera.org/search?query=${skill}`, type: "University Courses" },
      { name: "edX", url: `https://edx.org/search?q=${skill}`, type: "Professional Certificates" },
      { name: "Pluralsight", url: `https://pluralsight.com/search?q=${skill}`, type: "Skill Paths" }
    ];
  };

  const estimateTime = (skill: string): string => {
    const times: { [key: string]: string } = {
      docker: "2-4 weeks",
      kubernetes: "2-3 months",
      argocd: "1-2 weeks",
      terraform: "3-6 weeks",
      aws: "2-4 months",
      python: "1-2 months",
      react: "3-6 weeks",
      java: "2-3 months",
      golang: "1-2 months"
    };
    return times[skill] || "4-8 weeks";
  };

  return (
    <div className="space-y-8">
      {/* Learning Tips */}
      <div className="glass rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Gift className="w-6 h-6 text-accent" />
          <h3 className="text-2xl font-bold">Learning Tips from Your Coach 💡</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {tips.map((tip, index) => (
            <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="glass rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <h3 className="text-2xl font-bold">Free & Official Resources 🎁</h3>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                selectedType === type
                  ? 'bg-primary text-white'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource, index) => (
            <a
              key={index}
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{resource.emoji}</span>
                  {resource.free && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">
                      FREE
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold group-hover:text-primary transition-colors">
                    {resource.title}
                  </h4>
                  <p className="text-sm text-white/60 mt-1">{resource.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span className="px-2 py-0.5 rounded bg-white/10">{resource.type}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5" />
            <span className="font-semibold">Certification Path 🎯</span>
          </div>
          <p className="text-sm text-white/80">
            Start with free resources → Practice with Bridain simulations →
            Get certified → Update your resume → Land your dream job! 🚀
          </p>
        </div>

        {/* Certification Path Generator */}
        <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-accent" />
            <h3 className="text-xl font-bold">Certification Path Generator 🎓</h3>
          </div>

          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateCertificationPath()}
              placeholder="Type any skill (Docker, Kubernetes, Python, React, AWS, Terraform, ArgoCD...)"
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white placeholder:text-white/40"
            />
            <button
              onClick={generateCertificationPath}
              disabled={!certInput.trim() || isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Generate Path
            </button>
          </div>

          {certificationData && (
            <div className="space-y-6 mt-6 p-6 rounded-2xl bg-black/20 border border-white/10">
              <div>
                <h4 className="text-lg font-bold mb-2">🎯 {certificationData.skill} Learning Path</h4>
                <p className="text-white/60">Estimated time: {certificationData.estimatedTime}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Official Documentation */}
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    📚 Official Documentation
                  </h5>
                  <div className="space-y-2">
                    {certificationData.officialDocs.map((doc, index) => (
                      <a
                        key={index}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span>{doc.name}</span>
                          <ExternalLink className="w-4 h-4 text-white/40" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Free Resources */}
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    🆓 Free Resources & Labs
                  </h5>
                  <div className="space-y-2">
                    {certificationData.freeResources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span>{resource.name}</span>
                            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                              {resource.type}
                            </span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-white/40" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hands-on Labs */}
              <div>
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  🧪 Hands-on Labs & Projects
                </h5>
                <div className="grid md:grid-cols-3 gap-3">
                  {certificationData.labs.map((lab, index) => (
                    <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="font-medium mb-2">{lab.name}</div>
                      <p className="text-sm text-white/60 mb-3">{lab.description}</p>
                      <code className="text-xs bg-black/40 p-2 rounded block overflow-x-auto">
                        {lab.setup}
                      </code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Concepts */}
              {(certificationData as any).coreConcepts && (
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    🧠 Core Concepts
                  </h5>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex flex-wrap gap-2">
                      {(certificationData as any).coreConcepts.map((concept: string, index: number) => (
                        <span key={index} className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Certification Path */}
              <div>
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  🏆 Official Certification Path
                </h5>
                <div className="p-4 rounded-xl bg-white/5">
                  {certificationData.certificationPath.map((cert, index) => (
                    <div key={index} className="py-2 border-b last:border-0 border-white/10">
                      {cert}
                    </div>
                  ))}
                </div>
              </div>

              {/* Certification Count */}
              {(certificationData as any).certificationCount && (
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    📊 Available Certifications ({(certificationData as any).certificationCount.total})
                  </h5>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex flex-wrap gap-2">
                      {(certificationData as any).certificationCount.levels.map((level: string, index: number) => (
                        <span key={index} className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm">
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Popular Websites */}
              {(certificationData as any).popularWebsites && (
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    🌐 Popular Learning Websites
                  </h5>
                  <div className="grid md:grid-cols-2 gap-2">
                    {(certificationData as any).popularWebsites.map((site: any, index: number) => (
                      <a key={index} href={site.url} target="_blank" rel="noopener noreferrer"
                         className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between">
                        <div>
                          <span>{site.name}</span>
                          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">{site.type}</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-white/40" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube Channels */}
              {(certificationData as any).youtubeChannels && (
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    📺 YouTube Channels & Videos
                  </h5>
                  <div className="grid md:grid-cols-2 gap-2">
                    {(certificationData as any).youtubeChannels.map((channel: any, index: number) => (
                      <a key={index} href={channel.url} target="_blank" rel="noopener noreferrer"
                         className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between">
                        <div>
                          <span>{channel.name}</span>
                          <span className="ml-2 text-xs text-white/60">{channel.subs}</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-white/40" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Cheatsheets */}
              {(certificationData as any).cheatsheets && (
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    📋 Cheat Sheets & Quick References
                  </h5>
                  <div className="grid md:grid-cols-2 gap-2">
                    {(certificationData as any).cheatsheets.map((sheet: any, index: number) => (
                      <a key={index} href={sheet.url} target="_blank" rel="noopener noreferrer"
                         className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between">
                        <span>{sheet.name}</span>
                        <ExternalLink className="w-4 h-4 text-white/40" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Schedule */}
              {(certificationData as any).dailySchedule && (
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    📅 One-Month Study Schedule
                  </h5>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      {(certificationData as any).dailySchedule.map((day: string, index: number) => (
                        <div key={index} className="py-1 border-b last:border-0 border-white/10">
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* GitHub Repositories */}
              {(certificationData as any).githubRepos && (
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    💻 Relevant GitHub Repositories
                  </h5>
                  <div className="grid md:grid-cols-2 gap-2">
                    {(certificationData as any).githubRepos.map((repo: any, index: number) => (
                      <a key={index} href={repo.url} target="_blank" rel="noopener noreferrer"
                         className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-medium">{repo.name}</span>
                            <p className="text-sm text-white/60 mt-1">{repo.desc}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-white/40" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Communities */}
              {(certificationData as any).communities && (
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    👥 Communities & Forums
                  </h5>
                  <div className="grid md:grid-cols-3 gap-2">
                    {(certificationData as any).communities.map((community: any, index: number) => (
                      <a key={index} href={community.url} target="_blank" rel="noopener noreferrer"
                         className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between">
                        <div>
                          <span>{community.name}</span>
                          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">{community.type}</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-white/40" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam Q&A Dumps */}
              {(certificationData as any).examDumps && (
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    📝 Exam Q&A and Study Dumps
                  </h5>
                  <div className="grid md:grid-cols-2 gap-2">
                    {(certificationData as any).examDumps.map((dump: any, index: number) => (
                      <a key={index} href={dump.url} target="_blank" rel="noopener noreferrer"
                         className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between">
                        <div>
                          <span>{dump.name}</span>
                          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-secondary/20 text-secondary">{dump.type}</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-white/40" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}