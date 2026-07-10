'use client';

import React, { useState } from 'react';
import {
  ExternalLink, Award, Target, BookOpen, Youtube, Github, FileText,
  Search, Star, HelpCircle, Loader2, ChevronDown, ChevronUp, User
} from 'lucide-react';

interface CareerPathStep {
  step: string;
  description: string;
}

interface WebsiteResource {
  name: string;
  url: string;
  isFree: boolean;
}

interface YouTubeResource {
  title: string;
  url: string;
}

interface GitHubRepo {
  name: string;
  url: string;
  description: string;
}

interface Cheatsheet {
  topic: string;
  url: string;
}

interface Certification {
  name: string;
  officialUrl: string;
  examDumpsOrStudyGuidesUrls?: string[];
  faqs?: string[];
}

interface InterviewPrep {
  question: string;
  answer: string;
}

interface ResourcesData {
  coreConceptsWebsites: WebsiteResource[];
  youtubeTutorials: YouTubeResource[];
  githubRepos: GitHubRepo[];
  cheatsheets: Cheatsheet[];
  certifications: Certification[];
  interviewPrep: InterviewPrep[];
}

interface ResourceState {
  careerPath: CareerPathStep[];
  resources: ResourcesData;
}

export function Resources() {
  const [inputSkill, setInputSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'career' | 'resources'>('career');
  const [resourceData, setResourceData] = useState<ResourceState | null>(null);
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
          message: `Generate comprehensive career path and resources for ${skill}`,
          context: `You must return a JSON object for skill: ${skill}.

REQUIRED JSON SCHEMA:
{
  "careerPath": [{ "step": "string", "description": "string" }],
  "resources": {
    "coreConceptsWebsites": [{ "name": "string", "url": "string", "isFree": boolean }],
    "youtubeTutorials": [{ "title": "string", "url": "string" }],
    "githubRepos": [{ "name": "string", "url": "string", "description": "string" }],
    "cheatsheets": [{ "topic": "string", "url": "string" }],
    "certifications": [{
      "name": "string",
      "officialUrl": "string",
      "examDumpsOrStudyGuidesUrls": ["string"],
      "faqs": ["string"]
    }],
    "interviewPrep": [{ "question": "string", "answer": "string" }]
  }
}

STRICT RULES:
- YouTube: Return minimum 10 tutorials with safe YouTube search URLs if unsure
- URLs: Use real working URLs only, or generate safe search query URLs like "https://www.youtube.com/results?search_query=skill+tutorial"
- Clean Text: NO markdown, NO asterisks, NO special characters in any text
- All arrays must be populated with real, helpful resources
- If unsure of exact URL, generate safe search query instead of hallucinating

Return ONLY the JSON object, nothing else.`,
          skill: skill,
          mode: 'resource_generation'
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Parse JSON from API response
        let parsedData: ResourceState;
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
            careerPath: [
              { step: "Learn Fundamentals", description: "Start with basic concepts and terminology" },
              { step: "Practice Hands-on", description: "Build projects to reinforce learning" },
              { step: "Advanced Topics", description: "Explore complex patterns and optimization" }
            ],
            resources: {
              coreConceptsWebsites: [],
              youtubeTutorials: [],
              githubRepos: [],
              cheatsheets: [],
              certifications: [],
              interviewPrep: []
            }
          };
        }

        // Ensure optional arrays exist
        if (!parsedData.resources.examDumpsOrStudyGuidesUrls) {
          parsedData.resources.certifications = parsedData.resources.certifications.map(cert => ({
            ...cert,
            examDumpsOrStudyGuidesUrls: cert.examDumpsOrStudyGuidesUrls || [],
            faqs: cert.faqs || []
          }));
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
          {/* Tabs */}
          <div className="flex justify-center gap-4 border-b border-white/10 pb-4">
            <button
              onClick={() => setActiveTab('career')}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'career'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Career Path
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'resources'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Resources
            </button>
          </div>

          {/* Career Path Tab */}
          {activeTab === 'career' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Career Path</h2>
              </div>

              {resourceData.careerPath.map((step, index) => (
                <div key={index} className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{step.step}</h3>
                    <p className="text-white/70">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              {/* Core Concepts Websites */}
              {resourceData.resources.coreConceptsWebsites &&
               resourceData.resources.coreConceptsWebsites.length > 0 && (
                <Accordion title="Core Concepts Websites" icon={BookOpen} count={resourceData.resources.coreConceptsWebsites.length} id="websites">
                  <div className="grid md:grid-cols-2 gap-4 pt-4">
                    {resourceData.resources.coreConceptsWebsites.map((site, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white">{site.name}</h4>
                          {site.isFree && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Free</span>}
                        </div>
                        <ResourceLink url={site.url}>Visit Website</ResourceLink>
                      </div>
                    ))}
                  </div>
                </Accordion>
              )}

              {/* YouTube Tutorials */}
              {resourceData.resources.youtubeTutorials &&
               resourceData.resources.youtubeTutorials.length > 0 && (
                <Accordion title="YouTube Tutorials" icon={Youtube} count={resourceData.resources.youtubeTutorials.length} id="youtube">
                  <div className="space-y-3 pt-4">
                    {resourceData.resources.youtubeTutorials.map((video, i) => (
                      <a key={i} href={video.url} target="_blank" rel="noopener noreferrer"
                         className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-all group">
                        <span className="text-white group-hover:text-primary transition-colors">{video.title}</span>
                        <ExternalLink className="w-4 h-4 text-white/50" />
                      </a>
                    ))}
                  </div>
                </Accordion>
              )}

              {/* GitHub Repos */}
              {resourceData.resources.githubRepos &&
               resourceData.resources.githubRepos.length > 0 && (
                <Accordion title="GitHub Repositories" icon={Github} count={resourceData.resources.githubRepos.length} id="github">
                  <div className="space-y-3 pt-4">
                    {resourceData.resources.githubRepos.map((repo, i) => (
                      <a key={i} href={repo.url} target="_blank" rel="noopener noreferrer"
                         className="block p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-all group">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white group-hover:text-primary transition-colors">{repo.name}</h4>
                          <ExternalLink className="w-4 h-4 text-white/50" />
                        </div>
                        <p className="text-sm text-white/70">{repo.description}</p>
                      </a>
                    ))}
                  </div>
                </Accordion>
              )}

              {/* Cheatsheets */}
              {resourceData.resources.cheatsheets &&
               resourceData.resources.cheatsheets.length > 0 && (
                <Accordion title="Cheatsheets" icon={FileText} count={resourceData.resources.cheatsheets.length} id="cheatsheets">
                  <div className="grid md:grid-cols-2 gap-4 pt-4">
                    {resourceData.resources.cheatsheets.map((sheet, i) => (
                      <a key={i} href={sheet.url} target="_blank" rel="noopener noreferrer"
                         className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-all group">
                        <span className="text-white group-hover:text-primary transition-colors">{sheet.topic}</span>
                        <ExternalLink className="w-4 h-4 text-white/50" />
                      </a>
                    ))}
                  </div>
                </Accordion>
              )}

              {/* Certifications */}
              {resourceData.resources.certifications &&
               resourceData.resources.certifications.length > 0 && (
                <Accordion title="Certifications" icon={Award} count={resourceData.resources.certifications.length} id="certifications">
                  <div className="space-y-4 pt-4">
                    {resourceData.resources.certifications.map((cert, i) => (
                      <div key={i} className="p-5 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-lg text-white">{cert.name}</h4>
                          <ResourceLink url={cert.officialUrl}>Official Site</ResourceLink>
                        </div>

                        {cert.examDumpsOrStudyGuidesUrls && cert.examDumpsOrStudyGuidesUrls.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm text-white/50 mb-2">Study Materials</div>
                            <div className="flex flex-wrap gap-2">
                              {cert.examDumpsOrStudyGuidesUrls.map((url, j) => (
                                <a key={j} href={url} target="_blank" rel="noopener noreferrer"
                                   className="px-3 py-1 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors">
                                  Resource {j + 1} <ExternalLink className="w-3 h-3 inline ml-1" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {cert.faqs && cert.faqs.length > 0 && (
                          <div>
                            <div className="text-sm text-white/50 mb-2">FAQs</div>
                            <ul className="text-sm text-white/70 space-y-1">
                              {cert.faqs.map((faq, j) => (
                                <li key={j} className="flex gap-2">
                                  <span className="text-white/30">•</span> {faq}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Accordion>
              )}

              {/* Interview Prep */}
              {resourceData.resources.interviewPrep &&
               resourceData.resources.interviewPrep.length > 0 && (
                <Accordion title="Interview Preparation" icon={HelpCircle} count={resourceData.resources.interviewPrep.length} id="interview">
                  <div className="space-y-3 pt-4">
                    {resourceData.resources.interviewPrep.map((prep, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="font-medium text-white mb-2">{prep.question}</div>
                        <div className="text-sm text-white/70">{prep.answer}</div>
                      </div>
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