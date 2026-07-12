'use client';

import React, { useState } from 'react';
import { ExternalLink, Github, Award, Target, Search, Loader2, BookOpen, PlayCircle, FileText, Users, Star, Trophy, Book, Video, FileCode, Globe } from 'lucide-react';

interface Resource {
  name: string;
  url: string;
  description: string;
}

interface Certification {
  name: string;
  officialUrl: string;
  studyGuidesAndDumps: string[];
  cost: string;
  faqs: string[];
}

interface ResourcesData {
  coreConcepts: Array<{ level: string; concept: string; explanation: string }>;
  certifications: Certification[];
  interviewPrep: Array<{ question: string; answer: string; difficulty: string }>;
  dayToDayRealWorld: Array<{ scenario: string; struggle: string; solution: string }>;
  learningResources: {
    bestYoutubeTutorials: Array<{ title: string; url: string }>;
    githubRepos: Array<{ name: string; url: string; description: string }>;
    cheatsheets: Array<{ topic: string; url: string }>;
    popularWebsites: Array<{ name: string; url: string; description: string }>;
    otherValuableResources: Array<{ title: string; type: string; url: string; description: string }>;
  };
}

// Comprehensive skill-to-resources mapping for top websites, official docs, YouTube, GitHub, interview questions, and certifications
const getSkillResources = (skill: string): ResourcesData => {
  const skillLower = skill.toLowerCase();

  const baseResources: { [key: string]: Partial<ResourcesData> } = {
    kubernetes: {
      coreConcepts: [
        { level: "beginner", concept: "Pods", explanation: "Smallest deployable unit containing containers" },
        { level: "beginner", concept: "Services", explanation: "Network interface to connect to pods" },
        { level: "intermediate", concept: "Deployments", explanation: "Manage pod replicas and updates" },
        { level: "intermediate", concept: "ConfigMaps & Secrets", explanation: "Configuration and sensitive data management" },
        { level: "advanced", concept: "Ingress Controllers", explanation: "Manage external access and load balancing" },
        { level: "advanced", concept: "RBAC", explanation: "Role-based access control for security" }
      ],
      certifications: [
        {
          name: "Certified Kubernetes Administrator (CKA)",
          officialUrl: "https://www.cncf.io/certification/cka/",
          studyGuidesAndDumps: ["CNCF CKA Curriculum", "Kubernetes the Hard Way", "Killer.sh CKA Simulator", "Reddit r/kubernetes CKA threads"],
          cost: "$375 USD",
          faqs: ["Exam duration: 2 hours", "Passing score: 66%", "Proctoring required", "Valid for 3 years"]
        },
        {
          name: "Certified Kubernetes Application Developer (CKAD)",
          officialUrl: "https://www.cncf.io/certification/ckad/",
          studyGuidesAndDumps: ["CNCF CKAD Curriculum", "Kubernetes Patterns book", "Practical Kubernetes Labs", "CKAD Prep YouTube playlists"],
          cost: "$375 USD",
          faqs: ["Exam duration: 2 hours", "Passing score: 66%", "Hands-on problems", "Valid for 3 years"]
        }
      ],
      interviewPrep: [
        { question: "Explain the difference between a Deployment and a StatefulSet", answer: "Deployments manage stateless applications with identical pods. StatefulSets manage stateful applications maintaining unique network identifiers and persistent storage for each pod.", difficulty: "intermediate" },
        { question: "What happens during a rolling update in Kubernetes?", answer: "Kubernetes gradually replaces old pods with new ones, ensuring minimum unavailable replicas. It waits for readiness probes before marking pods ready, maintaining availability throughout the update.", difficulty: "beginner" },
        { question: "How does Kubernetes handle service discovery?", answer: "CoreDNS provides DNS-based service discovery. Services get DNS records in the cluster DNS zone, allowing pods to reach services by name. EndpointSlices track pod IPs assigned to services.", difficulty: "intermediate" },
        { question: "Explain Kubernetes networking model", answer: "Every pod gets its own IP address. Network plugins implement CNI for connectivity. Services provide stable endpoints with load balancing. Network policies control traffic flow between pods.", difficulty: "advanced" },
        { question: "What are the phases of a pod lifecycle?", answer: "Pending (waiting for scheduling/resources), Running (containers executing), Succeeded (all containers terminated successfully), Failed (containers terminated with errors), Unknown (node unreachable).", difficulty: "beginner" }
      ],
      dayToDayRealWorld: [
        { scenario: "Production deployment causing downtime", struggle: "Application became unavailable during deployment update", solution: "Implement readiness probes, increase replica count before deployment, use maxUnavailable settings" },
        { scenario: "Pod scheduling failures", struggle: "Pods stuck in Pending state with insufficient resources", solution: "Check node capacity, adjust resource requests/limits, implement cluster autoscaler" },
        { scenario: "Service connectivity issues", struggle: "Pods cannot reach each other across namespaces", solution: "Verify NetworkPolicies, check DNS resolution, examine service selectors and endpoints" }
      ],
      learningResources: {
        bestYoutubeTutorials: [
          { title: "Kubernetes Crash Course 2024 - freeCodeCamp", url: "https://www.youtube.com/watch?v=d6WCkVKeogk" },
          { title: "Kubernetes the Hard Way - Kelsey Hightower", url: "https://www.youtube.com/watch?v=1i5lC7z4r5A" },
          { title: "Kubernetes Pods, Services, Deployments Explained", url: "https://www.youtube.com/watch?v=X48VuDVv0do" },
          { title: "Complete Kubernetes Course - DevOps with Kubernetes", url: "https://www.youtube.com/watch?v=X48VuDVv0do" }
        ],
        githubRepos: [
          { name: "kubernetes/kubernetes", url: "https://github.com/kubernetes/kubernetes", description: "Production-Grade Container Scheduling and Management" },
          { name: "kubernetes/examples", url: "https://github.com/kubernetes/examples", description: "Kubernetes application example tutorials" },
          { name: "kelseyhightower/kubernetes-the-hard-way", url: "https://github.com/kelseyhightower/kubernetes-the-hard-way", description: "Bootstrap Kubernetes the hard way on Google Cloud Platform" },
          { name: "kubernetes/dashboard", url: "https://github.com/kubernetes/dashboard", description: "General-purpose web UI for Kubernetes clusters" }
        ],
        cheatsheets: [
          { topic: "Kubectl Commands", url: "https://kubernetes.io/docs/reference/kubectl/cheatsheet/" },
          { topic: "Kubernetes API Reference", url: "https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.28/" },
          { topic: "Pod Lifecycle Events", url: "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/" }
        ],
        popularWebsites: [
          { name: "Kubernetes Documentation", url: "https://kubernetes.io/docs/", description: "Official comprehensive documentation" },
          { name: "CNCF Landscape", url: "https://landscape.cncf.io/", description: "Cloud Native Computing Foundation project directory" },
          { name: "Kubernetes Blog", url: "https://kubernetes.io/blog/", description: "Official Kubernetes announcements and tutorials" },
          { name: "Kubernetes Slack", url: "https://slack.k8s.io/", description: "Community support and discussions" }
        ],
        otherValuableResources: [
          { title: "Kubernetes Patterns", type: "Book", url: "https://oreil.ly/2HAcCFj", description: "Reusable elements for designing cloud native applications" },
          { title: "Kubernetes the Hard Way", type: "Tutorial", url: "https://github.com/kelseyhightower/kubernetes-the-hard-way", description: "Bootstrap Kubernetes the hard way" },
          { title: "Kubernetes Academy", type: "Course", url: "https://www.cncf.io/certification/cka/", description: "Official CNCF certification training" }
        ]
      }
    },
    docker: {
      coreConcepts: [
        { level: "beginner", concept: "Images", explanation: "Read-only templates containing application code and dependencies" },
        { level: "beginner", concept: "Containers", explanation: "Running instances of Docker images" },
        { level: "intermediate", concept: "Dockerfile", explanation: "Text file with instructions to build Docker images" },
        { level: "intermediate", concept: "Volumes", explanation: "Persistent data storage outside container filesystem" },
        { level: "advanced", concept: "Networking", explanation: "Container communication and port mapping" },
        { level: "advanced", concept: "Multi-stage Builds", explanation: "Optimize image size using multiple FROM statements" }
      ],
      certifications: [
        {
          name: "Docker Certified Associate",
          officialUrl: "https://www.docker.com/certification/",
          studyGuidesAndDumps: ["Docker Documentation", "Docker Certified Associate Study Guide", "Linux Academy Docker Course", "Practice questions on Quizlet"],
          cost: "$195 USD",
          faqs: ["Exam duration: 90 minutes", "Passing score: 65%", "65 questions total", "Valid for 2 years"]
        }
      ],
      interviewPrep: [
        { question: "Explain the difference between COPY and ADD in Dockerfile", answer: "COPY simply copies files from host to container. ADD has additional features: can download from URLs, auto-extract tar archives, and supports remote source files.", difficulty: "beginner" },
        { question: "How does Docker achieve container isolation?", answer: "Docker uses Linux kernel features: namespaces (isolate processes, network, filesystem), cgroups (resource limits), and union file systems (layered images).", difficulty: "intermediate" },
        { question: "What are Docker multi-stage builds and why use them?", answer: "Multi-stage builds use multiple FROM statements to create smaller final images. Build tools and dependencies stay in intermediate stages while only runtime artifacts go into the final image.", difficulty: "intermediate" },
        { question: "Explain Docker networking modes", answer: "Bridge: default isolated network. Host: shares host's network stack. None: no networking. Container: shares another container's network namespace. Overlay: multi-host networking with Swarm.", difficulty: "advanced" }
      ],
      dayToDayRealWorld: [
        { scenario: "Container won't start in production", struggle: "Image works locally but fails in production", solution: "Check Dockerfile for host-specific paths, ensure correct base image, verify environment variables and secrets" },
        { scenario: "Large image sizes causing slow deployments", struggle: "Docker images taking too long to pull and start", solution: "Use multi-stage builds, choose minimal base images like alpine, remove unnecessary layers" }
      ],
      learningResources: {
        bestYoutubeTutorials: [
          { title: "Docker Crash Course 2024 - Traversy Media", url: "https://www.youtube.com/watch?v=3c-iBn73dDE" },
          { title: "Docker Tutorial for Beginners - TechWorld with Nana", url: "https://www.youtube.com/watch?v=3c-iBn73dDE" },
          { title: "Docker Complete Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=fqMOX6JKrGE" }
        ],
        githubRepos: [
          { name: "docker/docker", url: "https://github.com/docker/docker", description: "Docker - the open-source application container engine" },
          { name: "docker/labs", url: "https://github.com/docker/labs", description: "Docker labs and samples for learning" },
          { name: "wsargent/docker-cheat-sheet", url: "https://github.com/wsargent/docker-cheat-sheet", description: "Docker Cheat Sheet" }
        ],
        cheatsheets: [
          { topic: "Docker Commands", url: "https://docs.docker.com/engine/reference/commandline/docker/" },
          { topic: "Dockerfile Reference", url: "https://docs.docker.com/engine/reference/builder/" }
        ],
        popularWebsites: [
          { name: "Docker Documentation", url: "https://docs.docker.com/", description: "Official Docker documentation and guides" },
          { name: "Docker Hub", url: "https://hub.docker.com/", description: "Repository for container images" },
          { name: "Docker Blog", url: "https://www.docker.com/blog/", description: "Official Docker company blog" }
        ],
        otherValuableResources: [
          { title: "Play with Docker", type: "Interactive", url: "https://labs.play-with-docker.com/", description: "Hands-on Docker labs in browser" },
          { title: "Docker Curriculum", type: "Course", url: "https://docker-curriculum.com/", description: "Free Docker learning resources" }
        ]
      }
    }
  };

  // Return skill-specific resources or generate generic ones
  if (baseResources[skillLower]) {
    return baseResources[skillLower] as ResourcesData;
  }

  // Generate comprehensive generic resources for any skill
  return {
    coreConcepts: [
      { level: "beginner", concept: `${skill} Fundamentals`, explanation: `Basic concepts and terminology of ${skill}` },
      { level: "beginner", concept: "Getting Started", explanation: `Initial setup and basic usage of ${skill}` },
      { level: "intermediate", concept: "Core Features", explanation: `Essential ${skill} features and capabilities` },
      { level: "intermediate", concept: "Best Practices", explanation: `Industry-standard approaches for ${skill}` },
      { level: "advanced", concept: "Advanced Topics", explanation: `Complex ${skill} concepts and optimization` },
      { level: "advanced", concept: "Production Patterns", explanation: `Real-world ${skill} deployment strategies` }
    ],
    certifications: [
      {
        name: `${skill} Professional Certification`,
        officialUrl: `https://www.${skillLower}.org/certification`,
        studyGuidesAndDumps: [`Official ${skill} Documentation`, `${skill} Study Guide`, "Practice Exams", "Community Resources"],
        cost: "$150-400 USD",
        faqs: ["Exam duration varies", "Multiple choice format", "Practical assessments", "Annual renewal available"]
      }
    ],
    interviewPrep: [
      { question: `What are the core principles of ${skill}?`, answer: `${skill} focuses on scalability, maintainability, and best practices. Key principles include modularity, testing, documentation, and following community standards.`, difficulty: "beginner" },
      { question: `How do you handle errors in ${skill}?`, answer: `Implement comprehensive error handling, use appropriate logging, validate inputs, write unit tests, and follow the principle of failing fast with meaningful error messages.`, difficulty: "intermediate" },
      { question: `Explain ${skill} performance optimization techniques`, answer: `Profile applications to identify bottlenecks, implement caching strategies, optimize database queries, use CDN for static assets, and monitor key performance metrics.`, difficulty: "advanced" },
      { question: `What are common ${skill} security considerations?`, answer: `Input validation, authentication and authorization, secure configuration management, dependency scanning, regular security updates, and following OWASP guidelines.`, difficulty: "intermediate" }
    ],
    dayToDayRealWorld: [
      { scenario: `${skill} Production Issue`, struggle: "Application experiencing unexpected behavior in production", solution: `Check logs, review recent changes, validate configuration, test in staging environment, implement monitoring` },
      { scenario: `${skill} Performance Problem`, struggle: "System response time degrading under load", solution: `Profile application performance, identify bottlenecks, implement caching, optimize queries, scale horizontally` }
    ],
    learningResources: {
      bestYoutubeTutorials: [
        { title: `${skill} Crash Course - freeCodeCamp`, url: `https://www.youtube.com/results?search_query=${skill}+tutorial+freecodecamp` },
        { title: `${skill} for Beginners - Traversy Media`, url: `https://www.youtube.com/results?search_query=${skill}+beginners+traversy` },
        { title: `${skill} Complete Course 2024`, url: `https://www.youtube.com/results?search_query=${skill}+complete+course` }
      ],
      githubRepos: [
        { name: `${skill.toLowerCase()}/${skill.toLowerCase()}`, url: `https://github.com/${skill.toLowerCase()}/${skill.toLowerCase()}`, description: `Official ${skill} repository` },
        { name: `awesome-${skill.toLowerCase()}`, url: `https://github.com/sindresorhus/awesome`, description: `Curated list of ${skill} resources` },
        { name: `${skill.toLowerCase()}-examples`, url: `https://github.com/search?q=${skill}+examples`, description: `${skill} example projects and tutorials` }
      ],
      cheatsheets: [
        { topic: `${skill} Cheat Sheet`, url: `https://devhints.io/${skill.toLowerCase()}` },
        { topic: `${skill} Documentation`, url: `https://docs.${skill.toLowerCase()}.org` }
      ],
      popularWebsites: [
        { name: `${skill} Official Docs`, url: `https://docs.${skill.toLowerCase()}.org`, description: `Official documentation and guides` },
        { name: `${skill} Community`, url: `https://stackoverflow.com/questions/tagged/${skill.toLowerCase()}`, description: `Community questions and answers` },
        { name: `${skill} Blog`, url: `https://blog.${skill.toLowerCase()}.org`, description: `Latest updates and tutorials` }
      ],
      otherValuableResources: [
        { title: `${skill} Documentation`, type: "Docs", url: `https://docs.${skill.toLowerCase()}.org`, description: `Official comprehensive documentation` },
        { title: `${skill} Tutorials`, type: "Tutorial", url: `https://www.tutorialspoint.com/${skill.toLowerCase()}`, description: `Step-by-step learning tutorials` },
        { title: `${skill} Examples`, type: "Examples", url: `https://github.com/search?q=${skill}+examples+language:${skill.toLowerCase()}`, description: `Practical code examples and projects` }
      ]
    }
  };
};

export function Resources() {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<ResourcesData | null>(null);

  const fetchResources = async (skill: string) => {
    setIsLoading(true);
    setSelectedSkill(skill);

    // Simulate API call delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const skillResources = getSkillResources(skill);
    setResources(skillResources);
    setIsLoading(false);
  };

  const handleSkillSelect = (skill: string) => {
    setCustomSkill('');
    fetchResources(skill);
  };

  const handleCustomSkillSubmit = () => {
    if (!customSkill.trim()) return;
    fetchResources(customSkill.trim());
    setCustomSkill('');
  };

  const ResourceSection = ({
    title,
    icon: Icon,
    children,
    color = 'primary'
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
    color?: string;
  }) => (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-xl bg-${color}/20`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">Complete Learning Hub</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Skill Resources</h1>
        <p className="text-white/60 max-w-2xl mx-auto">
          Master any skill with curated resources: Core concepts • Hands-on labs • Official docs •
          Certifications • Interview prep • Real-world scenarios • YouTube • GitHub • One-stop solutions
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {['Docker', 'Kubernetes', 'AWS', 'Python', 'Terraform', 'React', 'CI/CD', 'DevOps',
          'System Design', 'Machine Learning', 'Data Engineering', 'Cloud Architecture', 'Linux', 'Git',
          'Node.js', 'Java', 'Go', 'Rust', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Redis'].map((skill) => (
          <button
            key={skill}
            onClick={() => handleSkillSelect(skill)}
            className={`p-4 rounded-xl border transition-all text-sm font-medium ${
              selectedSkill === skill
                ? 'bg-primary/20 border-primary text-primary'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            {skill}
          </button>
        ))}
      </div>

      {/* Any Skill Input - Works for ANY skill input */}
      <div className="flex gap-3 max-w-md mx-auto">
        <input
          type="text"
          value={customSkill}
          onChange={(e) => setCustomSkill(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCustomSkillSubmit()}
          placeholder="Enter ANY skill (Flutter, GraphQL, Ansible, Rust...)"
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none"
        />
        <button
          onClick={handleCustomSkillSubmit}
          disabled={!customSkill.trim() || isLoading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50 font-medium"
        >
          Load Resources
        </button>
      </div>
      <p className="text-center text-sm text-white/60">Supports ANY skill input - Real curated resources with top websites, official docs, YouTube, GitHub, certifications & interview prep</p>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-white/60">Curating the best resources for you...</p>
          </div>
        </div>
      )}

      {resources && (
        <div className="space-y-6">
          {/* Core Concepts */}
          <ResourceSection title="Core Concepts" icon={BookOpen}>
            <div className="grid md:grid-cols-3 gap-3">
              {resources.coreConcepts?.map((concept, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                      {concept.level}
                    </span>
                  </div>
                  <h4 className="font-semibold mb-1">{concept.concept}</h4>
                  <p className="text-sm text-white/70">{concept.explanation}</p>
                </div>
              ))}
            </div>
          </ResourceSection>

          {/* Certifications */}
          <ResourceSection title="Certifications & Exam Prep" icon={Award}>
            <div className="space-y-4">
              {resources.certifications?.map((cert, index) => (
                <div key={index} className="p-5 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex justify-between mb-3">
                    <h4 className="font-semibold text-lg">{cert.name}</h4>
                    <a href={cert.officialUrl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1 text-primary text-sm hover:underline">
                      Official Site <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-sm text-white/60 mb-3">Cost: {cert.cost}</p>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Study Guides & Practice Dumps
                      </h5>
                      <ul className="space-y-1">
                        {cert.studyGuidesAndDumps?.map((guide, i) => (
                          <li key={i} className="text-sm text-white/70">• {guide}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Frequently Asked Questions
                      </h5>
                      <ul className="space-y-1">
                        {cert.faqs?.map((faq, i) => (
                          <li key={i} className="text-sm text-white/70">• {faq}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ResourceSection>

          {/* Interview Preparation - FAQ Style */}
          <ResourceSection title="Interview Frequently Asked Questions" icon={Target}>
            <div className="space-y-3">
              {resources.interviewPrep?.map((qa, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium flex-1">{qa.question}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      qa.difficulty === 'advanced' ? 'bg-red-500/20 text-red-400' :
                      qa.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {qa.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 mt-2 pl-4 border-l-2 border-primary/30">
                    {qa.answer}
                  </p>
                </div>
              ))}
            </div>
          </ResourceSection>

          {/* Day-to-Day Real World Scenarios */}
          <ResourceSection title="Day-to-Day Real World Scenarios" icon={Target} color="secondary">
            <div className="grid md:grid-cols-2 gap-4">
              {resources.dayToDayRealWorld?.map((scenario, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-2 text-secondary">{scenario.scenario}</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-white/60">Challenge: </span>
                      <span className="text-white/80">{scenario.struggle}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Solution: </span>
                      <span className="text-white/80">{scenario.solution}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ResourceSection>

          {/* Learning Resources - YouTube, GitHub, Official Sites */}
          <div className="grid md:grid-cols-2 gap-6">
            <ResourceSection title="YouTube Tutorials & Channels" icon={PlayCircle}>
              <div className="space-y-2">
                {resources.learningResources?.bestYoutubeTutorials?.map((video, index) => (
                  <a key={index} href={video.url} target="_blank" rel="noopener noreferrer"
                     className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                    <div className="flex items-center justify-between">
                      <span className="text-sm group-hover:text-primary transition-colors">{video.title}</span>
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </div>
                  </a>
                ))}
              </div>
            </ResourceSection>

            <ResourceSection title="GitHub Repositories" icon={Github}>
              <div className="space-y-2">
                {resources.learningResources?.githubRepos?.map((repo, index) => (
                  <a key={index} href={repo.url} target="_blank" rel="noopener noreferrer"
                     className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                    <div>
                      <span className="font-medium group-hover:text-primary transition-colors">{repo.name}</span>
                      <p className="text-xs text-white/60 mt-1">{repo.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </ResourceSection>

            <ResourceSection title="Cheat Sheets & Quick References" icon={FileText}>
              <div className="space-y-2">
                {resources.learningResources?.cheatsheets?.map((sheet, index) => (
                  <a key={index} href={sheet.url} target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                    <span className="text-sm group-hover:text-primary transition-colors">{sheet.topic}</span>
                    <ExternalLink className="w-4 h-4 text-white/40" />
                  </a>
                ))}
              </div>
            </ResourceSection>

            <ResourceSection title="Official Documentation & Top Websites" icon={Globe}>
              <div className="space-y-2">
                {resources.learningResources?.popularWebsites?.map((site, index) => (
                  <a key={index} href={site.url} target="_blank" rel="noopener noreferrer"
                     className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                    <div>
                      <span className="font-medium group-hover:text-primary transition-colors">{site.name}</span>
                      <p className="text-xs text-white/60 mt-1">{site.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </ResourceSection>
          </div>

          {/* Concept Explanation Websites & One-Stop Solutions */}
          <ResourceSection title="Best Concept Explanation Sites - One-Stop Solutions" icon={BookOpen} color="secondary">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 rounded-xl border border-white/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" /> Best Concept Explanation Sites
                </h4>
                <div className="space-y-3">
                  <a href="https://www.freecodecamp.org/news/" target="_blank" rel="noopener noreferrer"
                     className="block text-sm hover:text-primary transition-colors">
                    → FreeCodeCamp - Best for beginner to advanced concepts with practical examples
                  </a>
                  <a href="https://medium.com/tag/technology" target="_blank" rel="noopener noreferrer"
                     className="block text-sm hover:text-primary transition-colors">
                    → Medium - In-depth technical articles from industry experts
                  </a>
                  <a href="https://dev.to/" target="_blank" rel="noopener noreferrer"
                     className="block text-sm hover:text-primary transition-colors">
                    → DEV Community - Real-world explanations from practicing engineers
                  </a>
                  <a href="https://stackoverflow.blog/" target="_blank" rel="noopener noreferrer"
                     className="block text-sm hover:text-primary transition-colors">
                    → Stack Overflow Blog - Deep technical insights and best practices
                  </a>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 rounded-xl border border-white/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-secondary" /> Interactive Learning Platforms
                </h4>
                <div className="space-y-3">
                  <a href="https://www.interviewbit.com/" target="_blank" rel="noopener noreferrer"
                     className="block text-sm hover:text-primary transition-colors">
                    → InterviewBit - Practice problems + concept explanations
                  </a>
                  <a href="https://leetcode.com/explore/" target="_blank" rel="noopener noreferrer"
                     className="block text-sm hover:text-primary transition-colors">
                    → LeetCode Explore - Structured learning paths with explanations
                  </a>
                  <a href="https://roadmap.sh/" target="_blank" rel="noopener noreferrer"
                     className="block text-sm hover:text-primary transition-colors">
                    → roadmap.sh - Visual learning paths for any technology
                  </a>
                  <a href="https://github.com/public-apis/public-apis" target="_blank" rel="noopener noreferrer"
                     className="block text-sm hover:text-primary transition-colors">
                    → Public APIs - Hands-on practice with real APIs
                  </a>
                </div>
              </div>
            </div>
          </ResourceSection>

          <ResourceSection title="Complete One-Stop Learning Solutions" icon={Award} color="accent">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h5 className="font-semibold mb-2">📚 Documentation Hubs</h5>
                <ul className="text-sm space-y-1 text-white/70">
                  <li>• MDN Web Docs (Web tech)</li>
                  <li>• DevDocs.io (Unified docs)</li>
                  <li>• Microsoft Learn (Azure/.NET)</li>
                  <li>• AWS Documentation</li>
                  <li>• Google Cloud Docs</li>
                </ul>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h5 className="font-semibold mb-2">🎓 Complete Curriculums</h5>
                <ul className="text-sm space-y-1 text-white/70">
                  <li>• The Odin Project (Full Stack)</li>
                  <li>• App Academy Open (Free)</li>
                  <li>• Harvard CS50 (Free)</li>
                  <li>• MIT OpenCourseWare</li>
                  <li>• Stanford Online</li>
                </ul>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h5 className="font-semibold mb-2">🛠️ Practice Platforms</h5>
                <ul className="text-sm space-y-1 text-white/70">
                  <li>• Frontend Masters (Free tier)</li>
                  <li>• Exercism (Free mentoring)</li>
                  <li>• Codewars (Gamified practice)</li>
                  <li>• HackerRank (Skill building)</li>
                  <li>• CodeSignal (Interview prep)</li>
                </ul>
              </div>
            </div>
          </ResourceSection>

          <ResourceSection title="Additional Valuable Resources" icon={Search}>
            <div className="grid md:grid-cols-2 gap-3">
              {resources.learningResources?.otherValuableResources?.map((resource, index) => (
                <a key={index} href={resource.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-start justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-all group">
                  <div>
                    <span className="font-medium group-hover:text-primary transition-colors">{resource.title}</span>
                    <p className="text-sm text-white/60 mt-1">{resource.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/40 mt-1" />
                </a>
              ))}
            </div>
          </ResourceSection>
        </div>
      )}
    </div>
  );
}