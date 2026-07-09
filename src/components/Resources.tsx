'use client';

import React, { useState } from 'react';
import { ExternalLink, Award, BookOpen, Gift, Search, Loader2 } from 'lucide-react';

interface CertificationPath {
  skill: string;
  estimatedTime: string;
  officialDocs: Array<{name: string, url: string}>;
  freeResources: Array<{name: string, url: string, type: string}>;
  labs: Array<{name: string, description: string, setup: string}>;
  certificationPath: string[];
  cheatsheets: Array<{name: string, url: string}>;
  githubRepos: Array<{name: string, url: string, desc: string}>;
  communities: Array<{name: string, url: string, type: string}>;
  youtubeChannels: Array<{name: string, url: string, subs: string}>;
  popularWebsites: Array<{name: string, url: string, type: string}>;
}

const tips = [
  "🎯 Practice daily - consistency beats intensity!",
  "🤝 Join communities: Reddit r/devops, Discord servers",
  "📝 Document your learning journey publicly",
  "🛠️ Build side projects to solidify knowledge",
  "💬 Explain concepts to others (rubber duck debugging!)",
  "🔄 Review and iterate on past scenarios",
];

const REAL_CERTIFIED_RESOURCES: { [key: string]: Partial<CertificationPath> } = {
  kubernetes: {
    skill: "Kubernetes",
    estimatedTime: "2-3 months",
    officialDocs: [
      { name: "Kubernetes Official Documentation", url: "https://kubernetes.io/docs" },
      { name: "kubectl Cheat Sheet", url: "https://kubernetes.io/docs/reference/kubectl/cheatsheet" },
      { name: "Kubernetes API Reference", url: "https://kubernetes.io/docs/reference/generated/kubernetes-api" },
      { name: "Kubernetes Best Practices", url: "https://kubernetes.io/docs/concepts/configuration/overview" }
    ],
    freeResources: [
      { name: "Kubernetes the Hard Way", url: "https://github.com/kelseyhightower/kubernetes-the-hard-way", type: "Tutorial" },
      { name: "Official Kubernetes Tutorials", url: "https://kubernetes.io/docs/tutorials", type: "Interactive" },
      { name: "CNCF Kubernetes Training", url: "https://training.linuxfoundation.org/training/kubernetes-fundamentals", type: "Course" }
    ],
    labs: [
      { name: "Katacoda Kubernetes", description: "Interactive browser-based Kubernetes scenarios", setup: "https://www.katacoda.com/courses/kubernetes" },
      { name: "Play with Kubernetes", description: "Free Kubernetes cluster in browser", setup: "https://labs.play-with-k8s.com" },
      { name: "Minikube Local Setup", description: "Run Kubernetes locally on your machine", setup: "https://minikube.sigs.k8s.io/docs/start" }
    ],
    certificationPath: [
      "1. Kubernetes and Cloud Native Associate (KCNA) - Entry level",
      "2. Certified Kubernetes Application Developer (CKAD) - Developer role",
      "3. Certified Kubernetes Administrator (CKA) - Admin/DevOps role",
      "4. Certified Kubernetes Security Specialist (CKS) - Security specialist"
    ],
    cheatsheets: [
      { name: "Kubernetes Cheat Sheet", url: "https://kubernetes.io/docs/reference/kubectl/cheatsheet" },
      { name: "kubectl Quick Reference", url: "https://cheatsheetops.com/kubectl-cheatsheet" }
    ],
    githubRepos: [
      { name: "kubernetes/kubernetes", url: "https://github.com/kubernetes/kubernetes", desc: "Official Kubernetes source code (140k+ stars)" },
      { name: "kubernetes/examples", url: "https://github.com/kubernetes/examples", desc: "Official Kubernetes examples" },
      { name: "awesome-kubernetes", url: "https://github.com/ramitsurana/awesome-kubernetes", desc: "Curated Kubernetes resources" }
    ],
    communities: [
      { name: "r/kubernetes", url: "https://reddit.com/r/kubernetes", type: "Reddit" },
      { name: "Kubernetes Slack", url: "https://kubernetes.slack.com", type: "Slack" },
      { name: "Kubernetes Stack Overflow", url: "https://stackoverflow.com/questions/tagged/kubernetes", type: "Q&A" }
    ],
    youtubeChannels: [
      { name: "KubeSphere", url: "https://youtube.com/c/KubeSphere", subs: "Official tutorials" },
      { name: "Just me and Opensource", url: "https://youtube.com/c/Justmeandopensource", subs: "Practical demos" }
    ],
    popularWebsites: [
      { name: "Kubernetes.io Docs", url: "https://kubernetes.io/docs", type: "Official Documentation" },
      { name: "CNCF Landscape", url: "https://landscape.cncf.io", type: "Ecosystem Overview" },
      { name: "Learn Kubernetes", url: "https://www.linode.com/docs/guides/kubernetes", type: "Tutorials" }
    ]
  },
  docker: {
    skill: "Docker",
    estimatedTime: "2-4 weeks",
    officialDocs: [
      { name: "Docker Documentation", url: "https://docs.docker.com" },
      { name: "Docker Compose Reference", url: "https://docs.docker.com/compose" },
      { name: "Docker Hub Registry", url: "https://hub.docker.com" }
    ],
    freeResources: [
      { name: "Docker Curriculum", url: "https://docker-curriculum.com", type: "Course" },
      { name: "Play with Docker", url: "https://labs.play-with-docker.com", type: "Lab" },
      { name: "Docker Get Started", url: "https://docs.docker.com/get-started", type: "Tutorial" }
    ],
    labs: [
      { name: "Play with Docker", description: "Browser-based Docker environment", setup: "https://labs.play-with-docker.com" },
      { name: "Docker Desktop", description: "Local Docker environment", setup: "https://www.docker.com/products/docker-desktop" }
    ],
    certificationPath: [
      "1. Docker Certified Associate - Entry level container certification",
      "2. Docker Certified Developer - For application developers",
      "3. Advanced container orchestration (Kubernetes path)"
    ],
    cheatsheets: [
      { name: "Docker Cheat Sheet", url: "https://dockerlabs.collabnix.com/docker/cheatsheet" },
      { name: "Docker Commands Reference", url: "https://docs.docker.com/engine/reference/commandline/docker" }
    ],
    githubRepos: [
      { name: "docker/labs", url: "https://github.com/docker/labs", desc: "Official Docker labs and tutorials" },
      { name: "awesome-docker", url: "https://github.com/veggiemonk/awesome-docker", desc: "Curated Docker resources" }
    ],
    communities: [
      { name: "r/docker", url: "https://reddit.com/r/docker", type: "Reddit" },
      { name: "Docker Community Forums", url: "https://forums.docker.com", type: "Forum" }
    ],
    youtubeChannels: [
      { name: "Docker", url: "https://youtube.com/docker", subs: "Official Docker channel" }
    ],
    popularWebsites: [
      { name: "Docker Hub", url: "https://hub.docker.com", type: "Container Registry" },
      { name: "Docker Docs", url: "https://docs.docker.com", type: "Official Documentation" }
    ]
  },
  aws: {
    skill: "AWS",
    estimatedTime: "2-4 months",
    officialDocs: [
      { name: "AWS Documentation", url: "https://docs.aws.amazon.com" },
      { name: "AWS Well-Architected Framework", url: "https://docs.aws.amazon.com/wellarchitected" },
      { name: "AWS CLI Reference", url: "https://awscli.amazonaws.com/v2/documentation/api" }
    ],
    freeResources: [
      { name: "AWS Free Tier", url: "https://aws.amazon.com/free", type: "Practice" },
      { name: "AWS Skill Builder", url: "https://skillbuilder.aws", type: "Course" },
      { name: "AWS Well-Architected Labs", url: "https://www.wellarchitectedlabs.com", type: "Lab" }
    ],
    labs: [
      { name: "AWS Free Tier", description: "12 months free tier services", setup: "https://aws.amazon.com/free" },
      { name: "AWS Cloud9", description: "Cloud-based IDE with AWS resources", setup: "https://aws.amazon.com/cloud9" }
    ],
    certificationPath: [
      "1. AWS Cloud Practitioner - Entry level foundational knowledge",
      "2. AWS Solutions Architect Associate - Design and deploy on AWS",
      "3. AWS Developer Associate - Develop and maintain AWS applications",
      "4. AWS DevOps Engineer Professional - CI/CD and automation",
      "5. AWS Solutions Architect Professional - Advanced architecture"
    ],
    cheatsheets: [
      { name: "AWS Cheat Sheet", url: "https://digitalcloud.training/aws-cheat-sheet" },
      { name: "AWS CLI Reference", url: "https://docs.aws.amazon.com/cli/latest/reference" }
    ],
    githubRepos: [
      { name: "aws/aws-cli", url: "https://github.com/aws/aws-cli", desc: "Official AWS CLI (8k+ stars)" },
      { name: "awesome-aws", url: "https://github.com/donnemartin/awesome-aws", desc: "Curated AWS resources" }
    ],
    communities: [
      { name: "r/aws", url: "https://reddit.com/r/aws", type: "Reddit" },
      { name: "AWS re:Post", url: "https://repost.aws", type: "Q&A" }
    ],
    youtubeChannels: [
      { name: "AWS", url: "https://youtube.com/aws", subs: "Official AWS channel" },
      { name: "freeCodeCamp AWS", url: "https://youtube.com/results?search_query=freecodecamp+aws+course", subs: "Full courses" }
    ],
    popularWebsites: [
      { name: "AWS Docs", url: "https://docs.aws.amazon.com", type: "Official Documentation" },
      { name: "AWS Skill Builder", url: "https://skillbuilder.aws", type: "Free Training" }
    ]
  },
  terraform: {
    skill: "Terraform",
    estimatedTime: "3-6 weeks",
    officialDocs: [
      { name: "Terraform Documentation", url: "https://developer.hashicorp.com/terraform/docs" },
      { name: "Terraform Registry", url: "https://registry.terraform.io" },
      { name: "Terraform AWS Provider", url: "https://registry.terraform.io/providers/hashicorp/aws" }
    ],
    freeResources: [
      { name: "Terraform Tutorials", url: "https://learn.hashicorp.com/terraform", type: "Tutorial" },
      { name: "Terraform by Example", url: "https://www.terraform.io/intro", type: "Guide" }
    ],
    labs: [
      { name: "Terraform Cloud", description: "Free remote state management", setup: "https://app.terraform.io/signup" }
    ],
    certificationPath: [
      "1. HashiCorp Certified: Terraform Associate - Infrastructure as Code certification",
      "2. Advanced multi-cloud deployment patterns"
    ],
    cheatsheets: [
      { name: "Terraform Cheat Sheet", url: "https://www.terraform.io/docs/cli/commands" }
    ],
    githubRepos: [
      { name: "hashicorp/terraform", url: "https://github.com/hashicorp/terraform", desc: "Official Terraform (38k+ stars)" },
      { name: "awesome-terraform", url: "https://github.com/shuaibiyy/awesome-terraform", desc: "Curated Terraform resources" }
    ],
    communities: [
      { name: "r/terraform", url: "https://reddit.com/r/Terraform", type: "Reddit" },
      { name: "HashiCorp Discuss", url: "https://discuss.hashicorp.com", type: "Forum" }
    ],
    youtubeChannels: [
      { name: "HashiCorp", url: "https://youtube.com/hashicorp", subs: "Official tutorials" }
    ],
    popularWebsites: [
      { name: "Terraform Learn", url: "https://learn.hashicorp.com/terraform", type: "Official Training" }
    ]
  }
};

export function Resources() {
  const [selectedType, setSelectedType] = React.useState<string>('All');
  const [certInput, setCertInput] = useState('');
  const [certificationData, setCertificationData] = useState<CertificationPath | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const types = ['All', 'DevOps', 'MLOps', 'Testing', 'Certification'];
  const filteredResources = types.includes(selectedType)
    ? []
    : [];

  const generateCertificationPath = async () => {
    if (!certInput.trim()) return;

    setIsLoading(true);

    const skill = certInput.toLowerCase().trim();
    const pathData = REAL_CERTIFIED_RESOURCES[skill];

    if (pathData) {
      setCertificationData(pathData as CertificationPath);
    } else {
      // Generic fallback for unknown skills
      setCertificationData({
        skill: certInput,
        estimatedTime: "4-8 weeks",
        officialDocs: [
          { name: `${certInput} Official Documentation`, url: `https://docs.${skill}.org` }
        ],
        freeResources: [
          { name: `${certInput} Tutorials`, url: `https://youtube.com/results?search_query=${skill}+tutorial`, type: "Video" }
        ],
        labs: [
          { name: `${certInput} Practice`, description: "Online resource", setup: `https://google.com/search?q=${skill}+practice+lab` }
        ],
        certificationPath: [`1. ${certInput} Fundamentals Certification`],
        cheatsheets: [{ name: `${certInput} Cheat Sheet`, url: `https://cheatsheetops.com/${skill}` }],
        githubRepos: [{ name: `awesome-${skill}`, url: `https://github.com/search?q=awesome+${skill}`, desc: "Community resources" }],
        communities: [{ name: `r/${skill}`, url: `https://reddit.com/r/${skill}`, type: "Reddit" }],
        youtubeChannels: [{ name: `${skill} Tutorials`, url: `https://youtube.com/results?search_query=${skill}+tutorial`, subs: "Search results" }],
        popularWebsites: [{ name: "Google Search", url: `https://google.com/search?q=${skill}+tutorial+course`, type: "Search" }]
      });
    }

    setIsLoading(false);
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

      {/* Certification Path Generator */}
      <div className="glass rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6" />
          <h3 className="text-2xl font-bold">Certification Path Generator 🎓</h3>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateCertificationPath()}
              placeholder="Enter skill (kubernetes, docker, aws, terraform)..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white placeholder:text-white/40"
            />
          </div>
          <button
            onClick={generateCertificationPath}
            disabled={!certInput.trim() || isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Generate Path
          </button>
        </div>

        {certificationData && (
          <div className="space-y-8 mt-8">
            <div className="text-center">
              <h4 className="text-3xl font-bold mb-2">{certificationData.skill}</h4>
              <p className="text-white/60">Estimated Learning Time: {certificationData.estimatedTime}</p>
            </div>

            {/* Official Documentation - Priority 1 */}
            <div>
              <h5 className="text-xl font-semibold mb-4 flex items-center gap-2">
                📚 Official Documentation <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">HIGH PRIORITY</span>
              </h5>
              <div className="grid md:grid-cols-2 gap-3">
                {certificationData.officialDocs.map((doc, i) => (
                  <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 flex items-center justify-between group">
                    <span>{doc.name}</span>
                    <ExternalLink className="w-4 h-4 group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>

            {/* Free Resources - Priority 2 */}
            <div>
              <h5 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🆓 Free Learning Resources <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">VERIFIED</span>
              </h5>
              <div className="grid md:grid-cols-2 gap-3">
                {certificationData.freeResources.map((res, i) => (
                  <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/50 flex items-center justify-between group">
                    <div>
                      <div>{res.name}</div>
                      <div className="text-xs text-white/60">{res.type}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 group-hover:text-green-400" />
                  </a>
                ))}
              </div>
            </div>

            {/* Interactive Labs - Priority 3 */}
            <div>
              <h5 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🧪 Interactive Labs & Practice <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">HANDS-ON</span>
              </h5>
              <div className="grid md:grid-cols-2 gap-3">
                {certificationData.labs.map((lab, i) => (
                  <a key={i} href={lab.setup.startsWith('http') ? lab.setup : '#'} target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50">
                    <div className="font-medium mb-1">{lab.name}</div>
                    <div className="text-sm text-white/60 mb-2">{lab.description}</div>
                    <div className="text-xs text-blue-400">Setup: {lab.setup}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Certification Paths - Priority 4 */}
            <div>
              <h5 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🏆 Certification Paths & Roles <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">CAREER FOCUSED</span>
              </h5>
              <div className="space-y-2">
                {certificationData.certificationPath.map((cert, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    {cert}
                  </div>
                ))}
              </div>
            </div>

            {/* Cheatsheets - Priority 5 */}
            <div>
              <h5 className="text-xl font-semibold mb-4 flex items-center gap-2">📋 Quick Reference Cheatsheets</h5>
              <div className="grid md:grid-cols-2 gap-3">
                {certificationData.cheatsheets.map((sheet, i) => (
                  <a key={i} href={sheet.url} target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 flex items-center justify-between group">
                    <span>{sheet.name}</span>
                    <ExternalLink className="w-4 h-4 group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>

            {/* GitHub Repos - Priority 6 */}
            <div>
              <h5 className="text-xl font-semibold mb-4 flex items-center gap-2">💻 GitHub Repositories</h5>
              <div className="grid md:grid-cols-2 gap-3">
                {certificationData.githubRepos.map((repo, i) => (
                  <a key={i} href={repo.url} target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50">
                    <div className="font-medium mb-1">{repo.name}</div>
                    <div className="text-sm text-white/60 mb-1">{repo.desc}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Communities - Priority 7 */}
            <div>
              <h5 className="text-xl font-semibold mb-4 flex items-center gap-2">👥 Communities & Support</h5>
              <div className="grid md:grid-cols-3 gap-3">
                {certificationData.communities.map((comm, i) => (
                  <a key={i} href={comm.url} target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 flex items-center justify-between group">
                    <div>
                      <div>{comm.name}</div>
                      <div className="text-xs text-white/60">{comm.type}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>

            {/* YouTube & Websites - Priority 8 */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">📺 YouTube Channels</h5>
                <div className="space-y-2">
                  {certificationData.youtubeChannels.map((yt, i) => (
                    <a key={i} href={yt.url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50">
                      {yt.name} • {yt.subs}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">🌐 Learning Websites</h5>
                <div className="space-y-2">
                  {certificationData.popularWebsites.map((site, i) => (
                    <a key={i} href={site.url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50">
                      {site.name} • {site.type}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}