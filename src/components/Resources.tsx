'use client';

import React, { useState } from 'react';
import { ExternalLink, Github, Briefcase, Award, Target, Search, Loader2, BookOpen, PlayCircle, FileText, Users } from 'lucide-react';

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

const skills = [
  'Docker', 'Kubernetes', 'AWS', 'Python', 'Terraform', 'React', 'CI/CD', 'DevOps',
  'System Design', 'Machine Learning', 'Data Engineering', 'Cloud Architecture', 'Linux', 'Git',
  'Node.js', 'Java', 'Go', 'Rust', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Redis'
];

export function Resources() {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<ResourcesData | null>(null);

  const fetchResources = async (skill: string) => {
    setIsLoading(true);
    setSelectedSkill(skill);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate comprehensive learning resources for ${skill}`,
          context: `Generate 100% accurate technical resources for ${skill}`,
          skill: skill,
          mode: 'resources'
        })
      });

      const data = await response.json();
      const parsed = JSON.parse(data.response.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

      setResources(parsed);
    } catch (error) {
      console.error('Failed to fetch resources');
    }

    setIsLoading(false);
  };

  const handleSkillSelect = (skill: string) => {
    fetchResources(skill);
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
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">Complete Learning Hub</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Skill Resources</h1>
        <p className="text-white/60 max-w-2xl mx-auto">
          Master any skill with curated resources: Core concepts • Hands-on labs • Official docs •
          Certifications • Interview prep • Real-world scenarios
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {skills.map((skill) => (
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
                        <FileText className="w-4 h-4" /> Study Guides & Practice
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

          {/* Interview Preparation */}
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

          {/* Learning Resources */}
          <div className="grid md:grid-cols-2 gap-6">
            <ResourceSection title="YouTube Tutorials" icon={PlayCircle}>
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

            <ResourceSection title="Official Documentation & Websites" icon={BookOpen}>
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
          <ResourceSection title="Concept Explanation Websites - The Best One-Stop Solutions" icon={BookOpen} color="secondary">
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

          <ResourceSection title="Additional Free Resources" icon={Search}>
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