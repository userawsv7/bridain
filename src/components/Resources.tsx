'use client';

import React from 'react';
import { ExternalLink, Award, BookOpen, Gift } from 'lucide-react';

interface Resource {
  title: string;
  description: string;
  type: string;
  link: string;
  emoji: string;
  free: boolean;
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

  const types = ['All', 'DevOps', 'MLOps', 'Testing', 'Certification'];
  const filteredResources = selectedType === 'All'
    ? resources
    : resources.filter(r => r.type === selectedType);

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
      </div>
    </div>
  );
}