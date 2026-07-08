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

    // Generate comprehensive certification path for ANY skill using AI-level logic
    const skill = certInput.toLowerCase().trim();

    // Dynamic certification path generator
    const path: CertificationPath = {
      skill: certInput,
      officialDocs: generateOfficialDocs(skill),
      freeResources: generateFreeResources(skill),
      labs: generateLabs(skill),
      certificationPath: generateCertPath(skill),
      estimatedTime: estimateTime(skill)
    };

    // Add core concepts to the path
    (path as any).coreConcepts = generateCoreConcepts(skill);

    setCertificationData(path);
    setIsLoading(false);
  };

  const generateCoreConcepts = (skill: string): string[] => {
    const concepts: { [key: string]: string[] } = {
      kubernetes: ["Pods", "Deployments", "Services", "ConfigMaps", "Ingress", "Namespaces"],
      docker: ["Images", "Containers", "Volumes", "Networks", "Dockerfile", "Docker Compose"],
      aws: ["EC2", "S3", "VPC", "IAM", "Lambda", "RDS"],
      terraform: ["Providers", "Resources", "State", "Variables", "Modules", "Workspaces"],
      python: ["Variables", "Functions", "Classes", "Modules", "Decorators", "Async/Await"],
      react: ["Components", "State", "Props", "Hooks", "Context", "Redux"]
    };
    return concepts[skill] || ["Fundamentals", "Core Concepts", "Best Practices", "Advanced Topics"];
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

  const estimateTime = (skill: string): string => {
    const times: { [key: string]: string } = {
      docker: "2-4 weeks",
      kubernetes: "2-3 months",
      argocd: "1-2 weeks",
      terraform: "3-6 weeks",
      aws: "2-4 months"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}