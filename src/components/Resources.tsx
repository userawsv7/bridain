'use client';

import React, { useState } from 'react';
import { ExternalLink, Award, Clock, Target, BookOpen, Users, Youtube, Github, FileText, Search, Plus } from 'lucide-react';

interface Resource {
  name: string;
  url: string;
  type?: string;
  desc?: string;
}

interface Certification {
  name: string;
  provider: string;
  level: string;
  duration: string;
  focus: string;
}

interface SkillResources {
  skill: string;
  timeToCert: string;
  certs: Certification[];
  studyPath: string[];
  keyTopics: string[];
  practice: Resource[];
  docs: Resource[];
  community: Resource[];
}

const generateCustomResources = (skill: string): SkillResources => {
  const skillLower = skill.toLowerCase().trim();

  // Comprehensive skill-specific resources with real trusted sites
  const skillResources: { [key: string]: Partial<SkillResources> } = {
    // CLOUD & DEVOPS
    kubernetes: {
      skill: "Kubernetes",
      timeToCert: "8-12 weeks",
      certs: [
        { name: "CKA", provider: "CNCF", level: "Associate", duration: "6-8 weeks", focus: "Cluster administration" },
        { name: "CKAD", provider: "CNCF", level: "Associate", duration: "4-6 weeks", focus: "App development" },
        { name: "CKS", provider: "CNCF", level: "Professional", duration: "4-6 weeks", focus: "Security" }
      ],
      studyPath: ["Learn container concepts", "Master kubectl", "Deploy apps to K8s", "Set up networking", "Practice with labs"],
      keyTopics: ["Pods & Deployments", "Services & Ingress", "ConfigMaps & Secrets", "RBAC", "Networking", "Storage", "Helm", "Operators"],
      practice: [
        { name: "Killer.sh CKA Labs", url: "https://killer.sh", type: "Exam Simulator" },
        { name: "Kubernetes.io Tutorials", url: "https://kubernetes.io/docs/tutorials/", type: "Official" },
        { name: "Katacoda K8s", url: "https://www.katacoda.com/courses/kubernetes", type: "Interactive" }
      ],
      docs: [
        { name: "Official Documentation", url: "https://kubernetes.io/docs/", type: "Core Docs" },
        { name: "Kubectl Cheat Sheet", url: "https://kubernetes.io/docs/reference/kubectl/cheatsheet/", type: "Cheat Sheet" },
        { name: "API Reference", url: "https://kubernetes.io/docs/reference/generated/kubernetes-api/", type: "API" }
      ],
      community: [
        { name: "Kubernetes YouTube", url: "https://www.youtube.com/c/Kubernetes", type: "Official YouTube" },
        { name: "r/kubernetes", url: "https://reddit.com/r/kubernetes", type: "Reddit" },
        { name: "K8s Slack", url: "https://kubernetes.slack.com", type: "Slack" }
      ]
    },
    docker: {
      skill: "Docker",
      timeToCert: "4-6 weeks",
      certs: [
        { name: "DCA", provider: "Docker", level: "Associate", duration: "4-6 weeks", focus: "Container fundamentals" }
      ],
      studyPath: ["Container basics", "Build images", "Docker Compose", "Registry management", "Security basics"],
      keyTopics: ["Images & Containers", "Dockerfile", "Volumes", "Networking", "Compose", "Registry", "Security", "Multi-stage builds"],
      practice: [
        { name: "Docker Playgrounds", url: "https://labs.play-with-docker.com", type: "Interactive" },
        { name: "Docker Curriculum", url: "https://docker-curriculum.com", type: "Course" },
        { name: "Play with Docker", url: "https://training.play-with-docker.com", type: "Official Labs" }
      ],
      docs: [
        { name: "Docker Docs", url: "https://docs.docker.com", type: "Core" },
        { name: "Docker Cheat Sheet", url: "https://dockerlabs.collabnix.com/docker/cheatsheet/", type: "Cheat Sheet" },
        { name: "Best Practices", url: "https://docs.docker.com/develop/dev-best-practices/", type: "Guide" }
      ],
      community: [
        { name: "Docker YouTube", url: "https://www.youtube.com/c/DockerCommunity", type: "YouTube" },
        { name: "Docker Hub", url: "https://hub.docker.com", type: "Registry" },
        { name: "r/docker", url: "https://reddit.com/r/docker", type: "Reddit" }
      ]
    },
    aws: {
      skill: "AWS",
      timeToCert: "10-16 weeks",
      certs: [
        { name: "Solutions Architect Associate", provider: "Amazon", level: "Associate", duration: "8-10 weeks", focus: "Architecture" },
        { name: "Developer Associate", provider: "Amazon", level: "Associate", duration: "6-8 weeks", focus: "Development" },
        { name: "SysOps Administrator", provider: "Amazon", level: "Associate", duration: "6-8 weeks", focus: "Operations" }
      ],
      studyPath: ["Core services", "IAM & security", "Networking (VPC)", "EC2 & containers", "Serverless", "Databases", "Monitoring", "Cost optimization"],
      keyTopics: ["EC2", "S3", "Lambda", "RDS", "VPC", "IAM", "CloudWatch", "Route 53", "ELB", "Auto Scaling"],
      practice: [
        { name: "AWS Free Tier", url: "https://aws.amazon.com/free/", type: "Official" },
        { name: "A Cloud Guru", url: "https://acloudguru.com", type: "Courses" },
        { name: "AWS Skill Builder", url: "https://skillbuilder.aws", type: "Official Labs" }
      ],
      docs: [
        { name: "AWS Documentation", url: "https://docs.aws.amazon.com", type: "Core" },
        { name: "Well-Architected Framework", url: "https://aws.amazon.com/architecture/well-architected/", type: "Guide" },
        { name: "AWS Cheat Sheets", url: "https://digitalcloud.training/aws-cheat-sheets/", type: "Cheat Sheet" }
      ],
      community: [
        { name: "AWS YouTube", url: "https://www.youtube.com/user/AmazonWebServices", type: "Official YouTube" },
        { name: "AWS re:Post", url: "https://repost.aws", type: "Forum" },
        { name: "r/aws", url: "https://reddit.com/r/aws", type: "Reddit" }
      ]
    },

    // PROGRAMMING LANGUAGES
    python: {
      skill: "Python",
      timeToCert: "6-10 weeks",
      certs: [
        { name: "PCAP", provider: "Python Institute", level: "Associate", duration: "6-8 weeks", focus: "Core programming" },
        { name: "PCEP", provider: "Python Institute", level: "Entry", duration: "4-6 weeks", focus: "Entry level" }
      ],
      studyPath: ["Basics & syntax", "Data structures", "OOP", "File handling", "APIs", "Testing", "Virtual envs", "Packaging"],
      keyTopics: ["Variables", "Lists/Dicts", "Functions", "Classes", "Decorators", "Generators", "Async", "Testing"],
      practice: [
        { name: "LeetCode Python", url: "https://leetcode.com/tag/python/", type: "Practice" },
        { name: "HackerRank Python", url: "https://hackerrank.com/domains/python", type: "Practice" },
        { name: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com", type: "Free Course" }
      ],
      docs: [
        { name: "Python Docs", url: "https://docs.python.org/3/", type: "Official" },
        { name: "Python Cheat Sheet", url: "https://www.pythoncheatsheet.org", type: "Cheat Sheet" },
        { name: "Real Python", url: "https://realpython.com", type: "Tutorials" }
      ],
      community: [
        { name: "Python YouTube", url: "https://www.youtube.com/c/Python", type: "Official" },
        { name: "r/learnpython", url: "https://reddit.com/r/learnpython", type: "Reddit" },
        { name: "PyCon", url: "https://pyvideo.org", type: "Talks" }
      ]
    },
    javascript: {
      skill: "JavaScript",
      timeToCert: "8-12 weeks",
      certs: [
        { name: "JavaScript Algorithms", provider: "freeCodeCamp", level: "Certificate", duration: "6-8 weeks", focus: "Algorithms" }
      ],
      studyPath: ["ES6+ features", "Async programming", "DOM manipulation", "APIs", "Testing", "Build tools", "Frameworks"],
      keyTopics: ["Variables", "Functions", "Promises", "Async/Await", "DOM", "Events", "Modules", "Closures"],
      practice: [
        { name: "freeCodeCamp", url: "https://freecodecamp.org/learn/javascript", type: "Free" },
        { name: "JavaScript30", url: "https://javascript30.com", type: "Course" },
        { name: "Codewars JS", url: "https://codewars.com", type: "Practice" }
      ],
      docs: [
        { name: "MDN JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", type: "Official" },
        { name: "JS Info", url: "https://javascript.info", type: "Guide" },
        { name: "Eloquent JS", url: "https://eloquentjavascript.net", type: "Free Book" }
      ],
      community: [
        { name: "Traversy Media", url: "https://youtube.com/c/TraversyMedia", type: "YouTube" },
        { name: "r/javascript", url: "https://reddit.com/r/javascript", type: "Reddit" },
        { name: "JS Discord", url: "https://discord.gg/javascript", type: "Discord" }
      ]
    },

    // FRAMEWORKS
    react: {
      skill: "React",
      timeToCert: "6-10 weeks",
      certs: [
        { name: "Meta Front-End", provider: "Meta", level: "Certificate", duration: "6-8 weeks", focus: "React & Redux" }
      ],
      studyPath: ["JSX & components", "Hooks & state", "Props & context", "React Router", "State management", "Testing", "Next.js"],
      keyTopics: ["Components", "Hooks", "State", "Props", "Context", "Effects", "Refs", "Memoization"],
      practice: [
        { name: "React Docs Tutorial", url: "https://react.dev/learn", type: "Official" },
        { name: "Scrimba React", url: "https://scrimba.com/learn/react", type: "Interactive" },
        { name: "Epic React", url: "https://epicreact.dev", type: "Workshops" }
      ],
      docs: [
        { name: "React.dev", url: "https://react.dev", type: "Official" },
        { name: "React Patterns", url: "https://reactpatterns.com", type: "Guide" },
        { name: "Testing Library", url: "https://testing-library.com/docs/react-testing-library", type: "Testing" }
      ],
      community: [
        { name: "Academind React", url: "https://youtube.com/c/Academind", type: "YouTube" },
        { name: "Reactiflux", url: "https://www.reactiflux.com", type: "Discord" },
        { name: "r/reactjs", url: "https://reddit.com/r/reactjs", type: "Reddit" }
      ]
    },

    // DATABASES
    mongodb: {
      skill: "MongoDB",
      timeToCert: "4-6 weeks",
      certs: [
        { name: "MongoDB Developer", provider: "MongoDB", level: "Associate", duration: "4-6 weeks", focus: "Database design" }
      ],
      studyPath: ["CRUD operations", "Schema design", "Aggregation", "Indexing", "Replication", "Sharding"],
      keyTopics: ["Documents", "Collections", "Indexes", "Aggregation", "Replica Sets", "Sharding", "Atlas"],
      practice: [
        { name: "MongoDB University", url: "https://university.mongodb.com", type: "Official Free" },
        { name: "MongoDB Playground", url: "https://mongoplayground.net", type: "Practice" }
      ],
      docs: [
        { name: "MongoDB Manual", url: "https://www.mongodb.com/docs/", type: "Official" },
        { name: "MongoDB Cheat Sheet", url: "https://www.mongodb.com/try/download/shell", type: "Reference" }
      ],
      community: [
        { name: "MongoDB YouTube", url: "https://youtube.com/c/MongoDB", type: "YouTube" },
        { name: "MongoDB Community", url: "https://community.mongodb.com", type: "Forum" }
      ]
    }
  };

  // Generate comprehensive resources based on skill
  const skillData = skillResources[skillLower];

  if (skillData) {
    return skillData as SkillResources;
  }

  // Generic comprehensive template for  any skill
  return {
    skill: skill,
    timeToCert: "6-12 weeks",
    certs: [
      { name: `${skill} Professional`, provider: "Industry", level: "Associate", duration: "6-8 weeks", focus: "Core concepts" },
      { name: `${skill} Expert`, provider: "Industry", level: "Professional", duration: "4-6 weeks", focus: "Advanced topics" }
    ],
    studyPath: [
      `Learn ${skill} fundamentals`,
      "Build hands-on projects",
      "Practice with real scenarios",
      "Study documentation",
      "Join community discussions"
    ],
    keyTopics: ["Fundamentals", "Core APIs", "Best Practices", "Tools", "Architecture", "Testing", "Deployment", "Security"],
    practice: [
      { name: "Official Documentation", url: `https://docs.${skillLower}.dev`, type: "Official" },
      { name: `${skill} GitHub`, url: `https://github.com/topics/${skillLower}`, type: "GitHub" },
      { name: "freeCodeCamp", url: "https://freecodecamp.org", type: "Free Courses" }
    ],
    docs: [
      { name: "Official Docs", url: `https://docs.${skillLower}.org`, type: "Documentation" },
      { name: "Cheat Sheet", url: `https://quickref.me/${skillLower}`, type: "Reference" },
      { name: "GitHub Awesome Lists", url: `https://github.com/sindresorhus/awesome`, type: "Curated" }
    ],
    community: [
      { name: `${skill} YouTube`, url: `https://youtube.com/results?search_query=${skill}+tutorial`, type: "Tutorials" },
      { name: "Reddit Community", url: `https://reddit.com/r/${skillLower}`, type: "Discussion" },
      { name: "Discord Server", url: "https://discord.com/app", type: "Community" }
    ]
  };
};

export function Resources() {
  const [activeSkill, setActiveSkill] = useState<string>('custom');
  const [customSkill, setCustomSkill] = useState('');
  const [customResources, setCustomResources] = useState<SkillResources | null>(null);

  const current = customResources || { skill: '', timeToCert: '', keyTopics: [], certs: [], studyPath: [], practice: [], docs: [], community: [] };

  const handleCustomSearch = () => {
    if (!customSkill.trim()) return;
    const resources = generateCustomResources(customSkill.trim());
    setCustomResources(resources);
    setActiveSkill('kubernetes'); // dummy so UI shows
  };

  const Pill = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-block px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded-full">
      {children}
    </span>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
          <Award className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-400">Certification Study Hub</span>
        </div>
        <h1 className="text-3xl font-semibold text-white mb-2">Learning Resources</h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Structured paths to certification with curated resources and hands-on practice
        </p>
      </div>

      {/* Custom Skill Search */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-center gap-3">
          <input
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomSearch()}
            placeholder="Enter any skill (React, Python, Java, Go...)"
            className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm w-80 focus:border-purple-500 outline-none"
          />
          <button
            onClick={handleCustomSearch}
            disabled={!customSkill.trim()}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2 hover:bg-purple-700"
          >
            <Search className="w-4 h-4" /> Generate Path
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Overview Card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">{current.skill}</h2>
            <div className="flex items-center gap-2 text-purple-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{current.timeToCert}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {current.keyTopics.map((topic, i) => (
              <Pill key={i}>{topic}</Pill>
            ))}
          </div>
        </div>

        {/* Certification Path */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
            <Target className="w-5 h-5 text-purple-400" /> Certification Track
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {current.certs.map((cert, i) => (
              <div key={i} className="bg-gray-950 rounded-xl p-5 border border-gray-800">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white">{cert.name}</div>
                    <div className="text-sm text-gray-400">{cert.provider} • {cert.level}</div>
                  </div>
                  <Pill>{cert.duration}</Pill>
                </div>
                <div className="text-sm text-gray-400">{cert.focus}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Roadmap */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
            <BookOpen className="w-5 h-5 text-purple-400" /> 5-Week Study Plan
          </h3>
          <div className="space-y-3">
            {current.studyPath.map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-gray-950 rounded-xl border border-gray-800">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 text-sm font-medium">
                  {i + 1}
                </div>
                <div className="text-gray-300 pt-1">{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Hands-on Practice */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <Target className="w-5 h-5 text-green-400" /> Hands-on Practice
            </h3>
            <div className="space-y-3">
              {current.practice.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white group-hover:text-green-400 transition-colors">{resource.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{resource.type}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-green-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Documentation */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <FileText className="w-5 h-5 text-blue-400" /> Documentation
            </h3>
            <div className="space-y-3">
              {current.docs.map((doc, i) => (
                <a
                  key={i}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{doc.name}</div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-blue-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Community */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <Users className="w-5 h-5 text-orange-400" /> Community
            </h3>
            <div className="space-y-3">
              {current.community.map((comm, i) => (
                <a
                  key={i}
                  href={comm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white group-hover:text-orange-400 transition-colors">{comm.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{comm.type}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-orange-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Study Tips</h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-400">
            <div>• Schedule 2-3 focused study sessions weekly</div>
            <div>• Build projects while learning concepts</div>
            <div>• Join community discussions actively</div>
            <div>• Practice with real infrastructure</div>
            <div>• Document your learning journey</div>
            <div>• Review concepts through teaching others</div>
          </div>
        </div>
      </div>
    </div>
  );
}