'use client';

import React, { useState } from 'react';
import { ExternalLink, Github, Briefcase, Award, Target, Search, Loader2 } from 'lucide-react';

interface Resource {
  name: string;
  url: string;
  description: string;
}

interface ResourcesData {
  githubRepos: Resource[];
  jobSites: Resource[];
  interviewPrep: Resource[];
  certificationPrep: Resource[];
  conceptLearning: Resource[];
  productionIssues: Resource[];
}

const skills = [
  'Docker', 'Kubernetes', 'AWS', 'Python', 'Terraform', 'React', 'CI/CD', 'DevOps',
  'System Design', 'Machine Learning', 'Data Engineering', 'Cloud Architecture'
];

export function Resources() {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<ResourcesData | null>(null);

  const fetchResources = async (skill: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate learning resources for ${skill}`,
          context: `Generate comprehensive free resources for ${skill} covering:

1. GitHub repos for hands-on practice and learning
2. Job sites for finding ${skill} positions
3. Interview preparation materials and practice
4. Certification exam preparation resources
5. Concept learning materials and tutorials
6. Production issues troubleshooting guides

Return exactly this JSON format:
{
  "githubRepos": [{"name": "Repo name", "url": "GitHub URL", "description": "What you'll learn"}],
  "jobSites": [{"name": "Site name", "url": "URL", "description": "${skill} jobs"}],
  "interviewPrep": [{"name": "Resource name", "url": "URL", "description": "Interview prep focus"}],
  "certificationPrep": [{"name": "Resource name", "url": "URL", "description": "Certification focus"}],
  "conceptLearning": [{"name": "Resource name", "url": "URL", "description": "What concepts covered"}],
  "productionIssues": [{"name": "Resource name", "url": "URL", "description": "Production scenarios covered"}]
}

Focus on FREE resources, GitHub repos, job boards, interview sites, certification prep platforms. No paid books or courses.`
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
    setSelectedSkill(skill);
    fetchResources(skill);
  };

  const ResourceCard = ({ title, icon: Icon, resources: resList }: {
    title: string;
    icon: any;
    resources: Resource[];
  }) => (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">
        {resList?.map((resource, index) => (
          <a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-white group-hover:text-primary transition-colors">{resource.name}</h4>
                <p className="text-sm text-white/60 mt-1">{resource.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/50 flex-shrink-0" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">Learning Resources</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Skill Resources</h1>
        <p className="text-white/60">GitHub repos • Job sites • Interview prep • Certification materials</p>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          <Search className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/60">Select a skill to explore resources</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {skills.map((skill) => (
          <button
            key={skill}
            onClick={() => handleSkillSelect(skill)}
            className={`p-3 rounded-xl border transition-all ${
              selectedSkill === skill
                ? 'bg-primary/20 border-primary text-primary'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            {skill}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {resources && (
        <div className="space-y-6">
          <ResourceCard title="GitHub Repositories" icon={Github} resources={resources.githubRepos} />
          <ResourceCard title="Job Sites" icon={Briefcase} resources={resources.jobSites} />
          <ResourceCard title="Interview Preparation" icon={Target} resources={resources.interviewPrep} />
          <ResourceCard title="Certification Prep" icon={Award} resources={resources.certificationPrep} />
          <ResourceCard title="Concept Learning" icon={Search} resources={resources.conceptLearning} />
          <ResourceCard title="Production Issues" icon={Target} resources={resources.productionIssues} />
        </div>
      )}
    </div>
  );
}