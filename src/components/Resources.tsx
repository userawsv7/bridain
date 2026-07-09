'use client';

import React, { useState } from 'react';
import { ExternalLink, Award, Clock, Target, BookOpen, Users, Youtube, Github, FileText } from 'lucide-react';

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

const SKILLS: { [key: string]: SkillResources } = {
  kubernetes: {
    skill: "Kubernetes",
    timeToCert: "8-12 weeks",
    certs: [
      { name: "KCNA", provider: "CNCF", level: "Associate", duration: "4-6 weeks", focus: "Fundamentals & ecosystem" },
      { name: "CKAD", provider: "CNCF", level: "Developer", duration: "6-8 weeks", focus: "Application deployment" },
      { name: "CKA", provider: "CNCF", level: "Administrator", duration: "8-12 weeks", focus: "Cluster operations" },
      { name: "CKS", provider: "CNCF", level: "Security", duration: "4-6 weeks", focus: "Security hardening" }
    ],
    studyPath: [
      "Complete Kubernetes the Hard Way on GitHub",
      "Deploy 3-tier app to Minikube locally",
      "Practice kubectl commands daily (1 hour)",
      "Build CI/CD pipeline with ArgoCD",
      "Configure monitoring with Prometheus"
    ],
    keyTopics: ["Pods & Deployments", "Services & Ingress", "ConfigMaps & Secrets", "RBAC & Security", "Helm Charts", "Networking", "Storage", "Observability"],
    practice: [
      { name: "Kubernetes the Hard Way", url: "https://github.com/kelseyhightower/kubernetes-the-hard-way", type: "Tutorial" },
      { name: "Killer.sh CKA/CKAD", url: "https://killer.sh", type: "Practice Exams" },
      { name: "Play with Kubernetes", url: "https://labs.play-with-k8s.com", type: "Interactive Labs" }
    ],
    docs: [
      { name: "Official Documentation", url: "https://kubernetes.io/docs" },
      { name: "kubectl Cheat Sheet", url: "https://kubernetes.io/docs/reference/kubectl/cheatsheet" },
      { name: "API Reference", url: "https://kubernetes.io/docs/reference/generated/kubernetes-api" }
    ],
    community: [
      { name: "Kubernetes Slack", url: "https://kubernetes.slack.com", type: "Slack" },
      { name: "r/kubernetes", url: "https://reddit.com/r/kubernetes", type: "Reddit" },
      { name: "KubeSphere YouTube", url: "https://youtube.com/c/KubeSphere", type: "YouTube" }
    ]
  },
  docker: {
    skill: "Docker",
    timeToCert: "3-4 weeks",
    certs: [
      { name: "DCA", provider: "Docker", level: "Associate", duration: "3-4 weeks", focus: "Container fundamentals" }
    ],
    studyPath: [
      "Complete Docker curriculum",
      "Containerize 5 different applications",
      "Create multi-stage Dockerfiles",
      "Set up Docker Compose for dev",
      "Push to Docker Hub registry"
    ],
    keyTopics: ["Images & Containers", "Dockerfile Best Practices", "Multi-stage Builds", "Docker Compose", "Networking", "Volumes", "Registry Operations"],
    practice: [
      { name: "Docker Curriculum", url: "https://docker-curriculum.com", type: "Course" },
      { name: "Play with Docker", url: "https://labs.play-with-docker.com", type: "Interactive Labs" },
      { name: "Docker for Beginners", url: "https://docker-curriculum.com", type: "Tutorial" }
    ],
    docs: [
      { name: "Official Docs", url: "https://docs.docker.com" },
      { name: "Docker Compose Reference", url: "https://docs.docker.com/compose" },
      { name: "Docker Hub", url: "https://hub.docker.com" }
    ],
    community: [
      { name: "Docker Community", url: "https://forums.docker.com", type: "Forum" },
      { name: "r/docker", url: "https://reddit.com/r/docker", type: "Reddit" }
    ]
  },
  aws: {
    skill: "AWS",
    timeToCert: "10-16 weeks",
    certs: [
      { name: "Cloud Practitioner", provider: "AWS", level: "Foundational", duration: "2-4 weeks", focus: "Cloud basics" },
      { name: "Solutions Architect Associate", provider: "AWS", level: "Associate", duration: "8-12 weeks", focus: "Architecture design" },
      { name: "Developer Associate", provider: "AWS", level: "Associate", duration: "6-10 weeks", focus: "Application development" },
      { name: "SysOps Administrator", provider: "AWS", level: "Associate", duration: "8-12 weeks", focus: "Operations" }
    ],
    studyPath: [
      "Complete AWS Cloud Practitioner",
      "Build 3-tier architecture on AWS",
      "Implement serverless with Lambda",
      "Set up CI/CD with CodePipeline",
      "Practice with free tier daily"
    ],
    keyTopics: ["EC2 & Auto Scaling", "S3 & Storage", "VPC & Networking", "RDS & DynamoDB", "Lambda & API Gateway", "IAM & Security", "CloudFormation", "Monitoring"],
    practice: [
      { name: "AWS Free Tier", url: "https://aws.amazon.com/free", type: "Practice" },
      { name: "A Cloud Guru", url: "https://acloudguru.com", type: "Courses" },
      { name: "Tutorial Dojo", url: "https://tutorialsdojo.com", type: "Practice Exams" }
    ],
    docs: [
      { name: "AWS Documentation", url: "https://docs.aws.amazon.com" },
      { name: "Well-Architected Framework", url: "https://aws.amazon.com/architecture/well-architected" },
      { name: "AWS Solutions Library", url: "https://aws.amazon.com/solutions" }
    ],
    community: [
      { name: "AWS re:Post", url: "https://repost.aws", type: "Community" },
      { name: "r/aws", url: "https://reddit.com/r/aws", type: "Reddit" },
      { name: "AWS YouTube", url: "https://youtube.com/user/AmazonWebServices", type: "YouTube" }
    ]
  },
  terraform: {
    skill: "Terraform",
    timeToCert: "4-6 weeks",
    certs: [
      { name: "Terraform Associate", provider: "HashiCorp", level: "Associate", duration: "4-6 weeks", focus: "IaC fundamentals" }
    ],
    studyPath: [
      "Complete official tutorials",
      "Build modular infrastructure",
      "Implement state management",
      "Create reusable modules",
      "Deploy to multiple environments"
    ],
    keyTopics: ["HCL Syntax", "Providers & Resources", "State Management", "Modules", "Workspaces", "Variables & Outputs", "Remote State", "Best Practices"],
    practice: [
      { name: "Terraform Tutorials", url: "https://learn.hashicorp.com/terraform", type: "Official" },
      { name: "Terraform Registry", url: "https://registry.terraform.io", type: "Modules" },
      { name: "Infracost", url: "https://infracost.io", type: "Cost Analysis" }
    ],
    docs: [
      { name: "Official Docs", url: "https://terraform.io/docs" },
      { name: "Configuration Language", url: "https://terraform.io/docs/language" },
      { name: "Provider Documentation", url: "https://registry.terraform.io/browse/providers" }
    ],
    community: [
      { name: "HashiCorp Discuss", url: "https://discuss.hashicorp.com", type: "Forum" },
      { name: "r/terraform", url: "https://reddit.com/r/terraform", type: "Reddit" }
    ]
  }
};

export function Resources() {
  const [activeSkill, setActiveSkill] = useState<keyof typeof SKILLS>('kubernetes');
  const current = SKILLS[activeSkill];

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

      {/* Skill Selector */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {Object.keys(SKILLS).map((skill) => (
          <button
            key={skill}
            onClick={() => setActiveSkill(skill as keyof typeof SKILLS)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeSkill === skill
                ? 'bg-purple-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {SKILLS[skill].skill}
          </button>
        ))}
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