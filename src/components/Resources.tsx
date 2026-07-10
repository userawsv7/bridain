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
        console.log("GROQ RESPONSE:", data);

        // Parse JSON from API response - handle markdown code blocks
        let parsedData: GroqResourcesData;
        try {
          let jsonString = data.response;

          // Strip markdown code blocks if present
          if (jsonString.includes('```')) {
            // Remove ```json and ``` markers
            jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
          }

          // Find JSON object in the response
          const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[0]);
          } else {
            parsedData = JSON.parse(jsonString);
          }
          console.log("PARSED DATA:", parsedData);
        } catch (parseError) {
          console.error("JSON PARSE ERROR:", parseError);
          setError(`Failed to parse response: ${parseError}`);
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
      } else {
        console.error("API RESPONSE NOT OK:", response.status);
        setError(`API request failed with status: ${response.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch resources. Please try again.';
      console.error("FETCH ERROR:", err);
      setError(errorMessage);
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

              {!resourceData.coreConcepts || resourceData.coreConcepts.length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-white/60">No core concepts available yet.</p>
                </div>
              ) : (
                ['Basic', 'Intermediate', 'Expert'].map(level => {
                  const concepts = resourceData.coreConcepts.filter(c => c.level === level);
                  if (concepts.length === 0) return null;

                  const levelColors = {
                    Basic: 'bg-green-500/20 text-green-400 border-green-500/30',
                    Intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                    Expert: 'bg-red-500/20 text-red-400 border-red-500/30'
                  };

                  return (
                    <div key={level} className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${levelColors[level as keyof typeof levelColors]}`}>
                          {level}
                        </div>
                        <div className="h-px flex-1 bg-white/10"></div>
                      </div>
                      <div className="space-y-3">
                        {concepts.map((concept, i) => (
                          <div key={i} className="relative pl-8 pb-8 border-l-2 border-white/20 last:border-l-0 last:pb-0 group">
                            <div className="absolute -left-1.5 top-3 w-3 h-3 rounded-full bg-primary border-4 border-primary/20 group-hover:scale-125 transition-transform"></div>
                            <div className="p-5 bg-white/5 rounded-xl border border-white/10 ml-4 hover:border-primary/30 transition-all">
                              <h4 className="font-semibold text-white mb-2 text-lg">{concept.concept}</h4>
                              <p className="text-sm text-white/70 leading-relaxed">{concept.explanation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Certifications Tab */}
          {activeTab === 'certifications' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Certifications</h2>
              </div>

              {!resourceData.certifications || resourceData.certifications.length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-white/60">No certifications available yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resourceData.certifications.map((cert, i) => (
                    <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10 flex flex-col">
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-white mb-2">{cert.name}</h4>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
                          {cert.cost}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <a href={cert.officialUrl} target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all">
                              Official Site <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>

                          {cert.studyGuidesAndDumps && cert.studyGuidesAndDumps.length > 0 && (
                            <div>
                              <div className="text-xs text-white/50 mb-2 uppercase tracking-wide">Study Guides</div>
                              <div className="flex flex-wrap gap-2">
                                {cert.studyGuidesAndDumps.map((url, j) => (
                                  <a key={j} href={url} target="_blank" rel="noopener noreferrer"
                                     className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-all">
                                    Guide {j + 1} <ExternalLink className="w-3 h-3" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {cert.faqs && cert.faqs.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="mb-2">
                            <button onClick={() => toggleAccordion(`cert-faq-${i}`)}
                              className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white">
                              <HelpCircle className="w-4 h-4" /> FAQs ({cert.faqs.length})
                              {expandedAccordions.has(`cert-faq-${i}`) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                          {expandedAccordions.has(`cert-faq-${i}`) && (
                            <ul className="space-y-2 text-sm text-white/70 pl-6">
                              {cert.faqs.map((faq, j) => (
                                <li key={j} className="list-disc">{faq}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Interview Prep Tab */}
          {activeTab === 'interview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Interview Preparation</h2>
              </div>

              {!resourceData.interviewPrep || resourceData.interviewPrep.length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-white/60">No interview questions available yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {resourceData.interviewPrep.map((prep, i) => {
                    const isExpanded = expandedAccordions.has(`interview-${i}`);
                    const difficultyColors = {
                      Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
                      Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                      Hard: 'bg-red-500/20 text-red-400 border-red-500/30'
                    };
                    return (
                      <div key={i} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                        <button
                          onClick={() => toggleAccordion(`interview-${i}`)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 pr-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyColors[prep.difficulty as keyof typeof difficultyColors] || 'bg-white/20 text-white/60'}`}>
                              {prep.difficulty}
                            </span>
                            <span className="font-medium text-white">{prep.question}</span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-white/60" /> : <ChevronDown className="w-5 h-5 text-white/60" />}
                        </button>
                        {isExpanded && (
                          <div className="px-6 pb-6">
                            <p className="text-white/80 leading-relaxed pl-1">{prep.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Day-to-Day Tab */}
          {activeTab === 'daytoday' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Day-to-Day Realities</h2>
              </div>

              {!resourceData.dayToDayRealWorld || resourceData.dayToDayRealWorld.length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-white/60">No day-to-day scenarios available yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {resourceData.dayToDayRealWorld.map((scenario, i) => (
                    <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10 flex flex-col h-full">
                      <h4 className="font-bold text-lg text-white mb-4 pb-3 border-b border-white/10">{scenario.scenario}</h4>

                      <div className="flex-1 space-y-4">
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-red-400 font-semibold text-sm">⚠️ THE STRUGGLE</span>
                          </div>
                          <p className="text-sm text-white/80 leading-relaxed">{scenario.struggle}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-green-400 font-semibold text-sm">✓ THE SOLUTION</span>
                          </div>
                          <p className="text-sm text-white/80 leading-relaxed">{scenario.solution}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Learning Resources Tab */}
          {activeTab === 'learning' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Learning Resources</h2>
              </div>

              {!resourceData.learningResources ? (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-white/60">No learning resources available yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* YouTube Tutorials */}
                  {resourceData.learningResources.bestYoutubeTutorials && resourceData.learningResources.bestYoutubeTutorials.length > 0 ? (
                    <Accordion title="Best YouTube Tutorials" icon={Youtube} count={resourceData.learningResources.bestYoutubeTutorials.length} id="youtube">
                      <div className="grid md:grid-cols-2 gap-3 pt-4">
                        {resourceData.learningResources.bestYoutubeTutorials.map((video, i) => (
                          <a key={i} href={video.url} target="_blank" rel="noopener noreferrer"
                             className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-all group">
                            <span className="text-white group-hover:text-primary transition-colors pr-3">{video.title}</span>
                            <ExternalLink className="w-4 h-4 text-white/50 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </Accordion>
                  ) : null}

                  {/* GitHub Repos */}
                  {resourceData.learningResources.githubRepos && resourceData.learningResources.githubRepos.length > 0 ? (
                    <Accordion title="GitHub Repositories" icon={Github} count={resourceData.learningResources.githubRepos.length} id="github">
                      <div className="grid md:grid-cols-2 gap-3 pt-4">
                        {resourceData.learningResources.githubRepos.map((repo, i) => (
                          <a key={i} href={repo.url} target="_blank" rel="noopener noreferrer"
                             className="block p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-all group">
                            <div className="flex items-start justify-between">
                              <div className="pr-3">
                                <h4 className="font-semibold text-white group-hover:text-primary transition-colors">{repo.name}</h4>
                                <p className="text-sm text-white/60 mt-1.5 line-clamp-2">{repo.description}</p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-white/50 flex-shrink-0 mt-1" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </Accordion>
                  ) : null}

                  {/* Cheatsheets */}
                  {resourceData.learningResources.cheatsheets && resourceData.learningResources.cheatsheets.length > 0 ? (
                    <Accordion title="Cheatsheets" icon={FileText} count={resourceData.learningResources.cheatsheets.length} id="cheatsheets">
                      <div className="grid md:grid-cols-2 gap-3 pt-4">
                        {resourceData.learningResources.cheatsheets.map((sheet, i) => (
                          <a key={i} href={sheet.url} target="_blank" rel="noopener noreferrer"
                             className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-all group">
                            <span className="text-white group-hover:text-primary transition-colors pr-3">{sheet.topic}</span>
                            <ExternalLink className="w-4 h-4 text-white/50 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </Accordion>
                  ) : null}

                  {/* Popular Websites */}
                  {resourceData.learningResources.popularWebsites && resourceData.learningResources.popularWebsites.length > 0 ? (
                    <Accordion title="Popular Websites" icon={BookOpen} count={resourceData.learningResources.popularWebsites.length} id="websites">
                      <div className="grid md:grid-cols-2 gap-3 pt-4">
                        {resourceData.learningResources.popularWebsites.map((site, i) => (
                          <a key={i} href={site.url} target="_blank" rel="noopener noreferrer"
                             className="block p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-all group">
                            <div>
                              <h4 className="font-semibold text-white group-hover:text-primary transition-colors mb-1">{site.name}</h4>
                              <p className="text-sm text-white/60 mb-3 line-clamp-2">{site.description}</p>
                              <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                                Visit Site <ExternalLink className="w-3 h-3" />
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </Accordion>
                  ) : null}

                  {/* Other Resources */}
                  {resourceData.learningResources.otherValuableResources && resourceData.learningResources.otherValuableResources.length > 0 ? (
                    <Accordion title="Other Valuable Resources" icon={Star} count={resourceData.learningResources.otherValuableResources.length} id="other">
                      <div className="grid md:grid-cols-2 gap-3 pt-4">
                        {resourceData.learningResources.otherValuableResources.map((resource, i) => (
                          <a key={i} href={resource.url} target="_blank" rel="noopener noreferrer"
                             className="block p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-all group">
                            <div className="flex items-start justify-between">
                              <div className="pr-3">
                                <span className="inline-block px-2.5 py-0.5 bg-white/10 rounded text-xs text-white/60 mb-2">{resource.type}</span>
                                <h4 className="font-semibold text-white group-hover:text-primary transition-colors">{resource.title}</h4>
                                <p className="text-sm text-white/60 mt-1.5 line-clamp-2">{resource.description}</p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-white/50 flex-shrink-0 mt-1" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </Accordion>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </>
      )}
      {!resourceData && !isLoading && (
        <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-white/60">Enter a skill above and click "Discover Resources" to load comprehensive career guidance.</p>
        </div>
      )}
    </div>
  );
}