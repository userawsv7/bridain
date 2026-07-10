'use client';

import React, { useState } from 'react';
import {
  ExternalLink, Award, Target, BookOpen, Youtube, Github, FileText,
  Search, Star, HelpCircle, Loader2, ChevronDown, ChevronUp, User
} from 'lucide-react';

// New Groq schema interfaces
interface CoreConcept {
  level: string;
  concept: string;
  explanation: string;
}

interface Certification {
  name: string;
  officialUrl: string;
  studyGuidesAndDumps: string[];
  cost: string;
  faqs: string[];
}

interface InterviewPrep {
  question: string;
  answer: string;
  difficulty: string;
}

interface DayToDayScenario {
  scenario: string;
  struggle: string;
  solution: string;
}

interface LearningResource {
  title: string;
  url: string;
}

interface GitHubResource {
  name: string;
  url: string;
  description: string;
}

interface CheatsheetResource {
  topic: string;
  url: string;
}

interface WebsiteResource {
  name: string;
  url: string;
  description: string;
}

interface OtherResource {
  title: string;
  type: string;
  url: string;
  description: string;
}

interface LearningResources {
  bestYoutubeTutorials: LearningResource[];
  githubRepos: GitHubResource[];
  cheatsheets: CheatsheetResource[];
  popularWebsites: WebsiteResource[];
  otherValuableResources: OtherResource[];
}

interface GroqResourcesData {
  coreConcepts: CoreConcept[];
  certifications: Certification[];
  interviewPrep: InterviewPrep[];
  dayToDayRealWorld: DayToDayScenario[];
  learningResources: LearningResources;
}

export function Resources() {
  const [inputSkill, setInputSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'concepts' | 'certifications' | 'interview' | 'daytoday' | 'learning'>('concepts');
  const [resourceData, setResourceData] = useState<GroqResourcesData | null>(null);
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async (skill: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate comprehensive resources for ${skill}`,
          context: `You must return ONLY a JSON object matching this exact schema for skill: ${skill}.

JSON SCHEMA:
{
  "coreConcepts": [
    {
      "level": "string (Basic / Intermediate / Expert)",
      "concept": "string",
      "explanation": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "officialUrl": "string",
      "studyGuidesAndDumps": ["string"],
      "cost": "string",
      "faqs": ["string"]
    }
  ],
  "interviewPrep": [
    {
      "question": "string",
      "answer": "string",
      "difficulty": "string (Easy/Medium/Hard)"
    }
  ],
  "dayToDayRealWorld": [
    {
      "scenario": "string",
      "struggle": "string",
      "solution": "string"
    }
  ],
  "learningResources": {
    "bestYoutubeTutorials": [{"title": "string", "url": "string"}],
    "githubRepos": [{"name": "string", "url": "string", "description": "string"}],
    "cheatsheets": [{"topic": "string", "url": "string"}],
    "popularWebsites": [{"name": "string", "url": "string", "description": "string"}],
    "otherValuableResources": [{"title": "string", "type": "string", "url": "string", "description": "string"}]
  }
}

Use Groq llama3-70b-8192 or llama3-8b-8192 model for this generation.
STRICT RULES:
- All arrays must be populated with real, helpful resources
- URLs must be real working URLs
- Provide concepts progression: 3-5 Basic, 3-5 Intermediate, 3-5 Expert
- List ALL major certifications
- Generate 10+ interview questions with difficulty levels
- Include 5-8 real-world scenarios
- Generate comprehensive learning resources
- Return ONLY valid JSON, no markdown or commentary`,
          skill: skill,
          mode: 'resource_generation'
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Parse JSON from API response - updated for Groq schema
        let parsedData: GroqResourcesData;
        try {
          const jsonMatch = data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[0]);
          } else {
            parsedData = JSON.parse(data.response);
          }
        } catch {
          // Fallback structure if parsing fails
          parsedData = {
            coreConcepts: [],
            certifications: [],
            interviewPrep: [],
            dayToDayRealWorld: [],
            learningResources: {
              bestYoutubeTutorials: [],
              githubRepos: [],
              cheatsheets: [],
              popularWebsites: [],
              otherValuableResources: []
            }
          };
        }

        setResourceData(parsedData);
      }
    } catch (err) {
      setError('Failed to fetch resources. Please try again.');
    }

    setIsLoading(false);
  };

  const handleSearch = () => {
    if (!inputSkill.trim()) return;
    fetchResources(inputSkill.trim());
  };

  const toggleAccordion = (key: string) => {
    const newExpanded = new Set(expandedAccordions);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedAccordions(newExpanded);
  };

  const Accordion = ({ title, icon: Icon, children, count, id }: {
    title: string;
    icon: any;
    children: React.ReactNode;
    count?: number;
    id: string;
  }) => {
    const isExpanded = expandedAccordions.has(id);

    return (
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden mb-4">
        <button
          onClick={() => toggleAccordion(id)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-primary" />
            <span className="font-semibold text-white">{title}</span>
            {count !== undefined && <span className="text-sm text-white/50">({count})</span>}
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {isExpanded && (
          <div className="px-6 pb-6">{children}</div>
        )}
      </div>
    );
  };

  const ResourceLink = ({ url, children, className = "" }: {
    url: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 text-primary hover:text-primary/80 transition-colors ${className}`}
    >
      {children}
      <ExternalLink className="w-4 h-4" />
    </a>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">Universal Resource Discovery</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Career Resources</h1>
        <p className="text-white/60 max-w-2xl mx-auto">
          Enter any skill to get a personalized career path and curated learning resources
        </p>
      </div>

      {/* Search */}
      <div className="flex justify-center gap-3">
        <input
          type="text"
          value={inputSkill}
          onChange={(e) => setInputSkill(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter any skill (React, Marketing, Welding, Project Management...)"
          className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white w-96 focus:border-primary/50 outline-none"
          disabled={isLoading}
        />
        <button
          onClick={handleSearch}
          disabled={!inputSkill.trim() || isLoading}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary disabled:opacity-50 font-medium flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Discover Resources
        </button>
      </div>

      {error && (
        <div className="text-center text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
          {error}
        </div>
      )}

      {resourceData && (
        <>
          {/* Tabs for new Groq schema */}
          <div className="flex justify-center gap-2 border-b border-white/10 pb-4 flex-wrap">
            <button
              onClick={() => setActiveTab('concepts')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'concepts'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Core Concepts
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'certifications'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Certifications
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'interview'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Interview Prep
            </button>
            <button
              onClick={() => setActiveTab('daytoday')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'daytoday'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Day-to-Day
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'learning'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Learning Resources
            </button>
          </div>

          {/* Core Concepts Tab */}
          {activeTab === 'concepts' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Core Concepts: {inputSkill}</h2>
              </div>

              {['Basic', 'Intermediate', 'Expert'].map(level => {
                const concepts = resourceData.coreConcepts?.filter(c => c.level === level) || [];
                if (concepts.length === 0) return null;

                return (
                  <div key={level} className="mb-6">
                    <h3 className="text-xl font-semibold text-primary mb-4">{level} Level</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {concepts.map((concept, i) => (
                        <div key={i} className="p-5 bg-white/5 rounded-xl border border-white/10">
                          <h4 className="font-semibold text-white mb-2">{concept.concept}</h4>
                          <p className="text-sm text-white/70 leading-relaxed">{concept.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Certifications Tab */}
          {activeTab === 'certifications' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Certifications</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {resourceData.certifications?.map((cert, i) => (
                  <div key={i} className="p-5 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="font-semibold text-lg text-white mb-2">{cert.name}</h4>
                    <ResourceLink url={cert.officialUrl} className="mb-3 inline-block">Official Site</ResourceLink>

                    <div className="text-sm text-white/50 mb-1">Cost: <span className="text-white/70">{cert.cost}</span></div>

                    {cert.studyGuidesAndDumps?.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm text-white/50 mb-1">Study Guides & Dumps</div>
                        <div className="flex flex-wrap gap-2">
                          {cert.studyGuidesAndDumps.map((url, j) => (
                            <a key={j} href={url} target="_blank" rel="noopener noreferrer"
                               className="px-2 py-0.5 bg-white/10 rounded text-xs hover:bg-white/20 transition-colors">
                              Resource {j + 1} <ExternalLink className="w-3 h-3 inline" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {cert.faqs?.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm text-white/50 mb-1">FAQs</div>
                        <ul className="text-xs text-white/70 space-y-0.5">
                          {cert.faqs.map((faq, j) => (
                            <li key={j}>• {faq}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interview Prep Tab */}
          {activeTab === 'interview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Interview Preparation</h2>
              </div>

              <div className="space-y-3">
                {resourceData.interviewPrep?.map((prep, i) => (
                  <div key={i} className="p-5 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white">{prep.question}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        prep.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                        prep.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{prep.difficulty}</span>
                    </div>
                    <p className="text-sm text-white/70">{prep.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day-to-Day Tab */}
          {activeTab === 'daytoday' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Day-to-Day Realities</h2>
              </div>

              <div className="space-y-4">
                {resourceData.dayToDayRealWorld?.map((scenario, i) => (
                  <div key={i} className="p-5 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="font-semibold text-white mb-3">{scenario.scenario}</h4>
                    <div className="mb-2">
                      <span className="text-sm text-red-400">Challenge: </span>
                      <span className="text-sm text-white/70">{scenario.struggle}</span>
                    </div>
                    <div>
                      <span className="text-sm text-green-400">Solution: </span>
                      <span className="text-sm text-white/70">{scenario.solution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Resources Tab */}
          {activeTab === 'learning' && resourceData.learningResources && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Learning Resources</h2>
              </div>

              {/* YouTube Tutorials */}
              {resourceData.learningResources.bestYoutubeTutorials?.length > 0 && (
                <Accordion title="Best YouTube Tutorials" icon={Youtube} count={resourceData.learningResources.bestYoutubeTutorials.length} id="youtube">
                  <div className="space-y-2 pt-4">
                    {resourceData.learningResources.bestYoutubeTutorials.map((video, i) => (
                      <a key={i} href={video.url} target="_blank" rel="noopener noreferrer"
                         className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 transition-all group">
                        <span className="text-white group-hover:text-primary transition-colors">{video.title}</span>
                        <ExternalLink className="w-4 h-4 text-white/50" />
                      </a>
                    ))}
                  </div>
                </Accordion>
              )}

              {/* GitHub Repos */}
              {resourceData.learningResources.githubRepos?.length > 0 && (
                <Accordion title="GitHub Repositories" icon={Github} count={resourceData.learningResources.githubRepos.length} id="github">
                  <div className="space-y-2 pt-4">
                    {resourceData.learningResources.githubRepos.map((repo, i) => (
                      <a key={i} href={repo.url} target="_blank" rel="noopener noreferrer"
                         className="block p-3 bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 transition-all group">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-white group-hover:text-primary transition-colors">{repo.name}</h4>
                            <p className="text-sm text-white/60 mt-0.5">{repo.description}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-white/50 flex-shrink-0" />
                        </div>
                      </a>
                    ))}
                  </div>
                </Accordion>
              )}

              {/* Cheatsheets */}
              {resourceData.learningResources.cheatsheets?.length > 0 && (
                <Accordion title="Cheatsheets" icon={FileText} count={resourceData.learningResources.cheatsheets.length} id="cheatsheets">
                  <div className="grid md:grid-cols-2 gap-3 pt-4">
                    {resourceData.learningResources.cheatsheets.map((sheet, i) => (
                      <a key={i} href={sheet.url} target="_blank" rel="noopener noreferrer"
                         className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 transition-all group">
                        <span className="text-white group-hover:text-primary transition-colors">{sheet.topic}</span>
                        <ExternalLink className="w-4 h-4 text-white/50" />
                      </a>
                    ))}
                  </div>
                </Accordion>
              )}

              {/* Popular Websites */}
              {resourceData.learningResources.popularWebsites?.length > 0 && (
                <Accordion title="Popular Websites" icon={BookOpen} count={resourceData.learningResources.popularWebsites.length} id="websites">
                  <div className="grid md:grid-cols-2 gap-3 pt-4">
                    {resourceData.learningResources.popularWebsites.map((site, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="font-medium text-white mb-1">{site.name}</h4>
                        <p className="text-xs text-white/60 mb-2">{site.description}</p>
                        <ResourceLink url={site.url}>Visit Site</ResourceLink>
                      </div>
                    ))}
                  </div>
                </Accordion>
              )}

              {/* Other Resources */}
              {resourceData.learningResources.otherValuableResources?.length > 0 && (
                <Accordion title="Other Valuable Resources" icon={Star} count={resourceData.learningResources.otherValuableResources.length} id="other">
                  <div className="space-y-2 pt-4">
                    {resourceData.learningResources.otherValuableResources.map((resource, i) => (
                      <a key={i} href={resource.url} target="_blank" rel="noopener noreferrer"
                         className="block p-3 bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 transition-all group">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/60">{resource.type}</span>
                            <h4 className="font-medium text-white group-hover:text-primary transition-colors mt-1">{resource.title}</h4>
                            <p className="text-sm text-white/60 mt-0.5">{resource.description}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-white/50 flex-shrink-0" />
                        </div>
                      </a>
                    ))}
                  </div>
                </Accordion>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}