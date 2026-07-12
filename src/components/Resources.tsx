'use client';

import React, { useState, useMemo } from 'react';
import { ExternalLink, Search, Filter, BookOpen, Award, Users, Video, Code, Database, Shield, Cloud, Target, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { allResources, getUniqueCategories, getUniqueSkills, Resource } from '@/data/resources';

export function Resources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedPricing, setSelectedPricing] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const categories = getUniqueCategories();
  const skills = getUniqueSkills();
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const pricingOptions = ['Free', 'Freemium', 'Paid'];
  const sources = ['Official', 'Community'];

  const filteredResources = useMemo(() => {
    let result = allResources;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some(tag => tag.toLowerCase().includes(query)) ||
        r.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    if (selectedSkill) {
      result = result.filter(r =>
        r.skills.some(skill => skill.toLowerCase().includes(selectedSkill.toLowerCase()))
      );
    }

    if (selectedCategory) {
      result = result.filter(r => r.category === selectedCategory);
    }

    if (selectedLevel) {
      result = result.filter(r => r.level === selectedLevel);
    }

    if (selectedPricing) {
      result = result.filter(r => r.pricing === selectedPricing);
    }

    if (selectedSource) {
      result = result.filter(r => r.source === selectedSource);
    }

    return result.sort((a, b) => b.priorityScore - a.priorityScore);
  }, [searchQuery, selectedSkill, selectedCategory, selectedLevel, selectedPricing, selectedSource]);

  const resourcesByCategory = useMemo(() => {
    const grouped: { [key: string]: Resource[] } = {};
    filteredResources.forEach(resource => {
      if (!grouped[resource.category]) {
        grouped[resource.category] = [];
      }
      grouped[resource.category].push(resource);
    });
    return grouped;
  }, [filteredResources]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSkill('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedPricing('');
    setSelectedSource('');
  };

  const hasActiveFilters = searchQuery || selectedSkill || selectedCategory || selectedLevel || selectedPricing || selectedSource;

  const getCategoryIcon = (category: string) => {
    if (category.includes('Documentation')) return <BookOpen className="w-4 h-4" />;
    if (category.includes('Learning')) return <Target className="w-4 h-4" />;
    if (category.includes('Certification')) return <Award className="w-4 h-4" />;
    if (category.includes('Labs')) return <Code className="w-4 h-4" />;
    if (category.includes('GitHub')) return <Code className="w-4 h-4" />;
    if (category.includes('YouTube')) return <Video className="w-4 h-4" />;
    if (category.includes('Communities')) return <Users className="w-4 h-4" />;
    if (category.includes('Security')) return <Shield className="w-4 h-4" />;
    if (category.includes('Architecture')) return <Database className="w-4 h-4" />;
    return <Cloud className="w-4 h-4" />;
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'Free': return 'text-green-400 bg-green-400/10';
      case 'Freemium': return 'text-blue-400 bg-blue-400/10';
      case 'Paid': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-white/60 bg-white/10';
    }
  };

  const getSourceColor = (source: string) => {
    return source === 'Official'
      ? 'text-purple-400 bg-purple-400/10'
      : 'text-cyan-400 bg-cyan-400/10';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">BRIDAIN Resources Hub</h1>
            <p className="text-white/60">Curated learning resources for DevOps, Cloud, SRE & more</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="glass rounded-lg px-4 py-2">
            <span className="text-white/60">Total Resources:</span>{' '}
            <span className="font-semibold">{allResources.length}</span>
          </div>
          <div className="glass rounded-lg px-4 py-2">
            <span className="text-white/60">Categories:</span>{' '}
            <span className="font-semibold">{categories.length}</span>
          </div>
          <div className="glass rounded-lg px-4 py-2">
            <span className="text-white/60">Skills Covered:</span>{' '}
            <span className="font-semibold">{skills.length}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search resources, skills, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-colors ${
              showFilters ? 'bg-primary/20 border-primary/50' : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Skill Quick Select */}
        <div className="mb-4">
          <div className="text-sm text-white/60 mb-2">Quick Skills:</div>
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 20).map(skill => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(selectedSkill === skill ? '' : skill)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedSkill === skill
                    ? 'bg-primary text-white'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 pt-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50"
                >
                  <option value="">All Levels</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>

                <select
                  value={selectedPricing}
                  onChange={(e) => setSelectedPricing(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50"
                >
                  <option value="">All Pricing</option>
                  {pricingOptions.map(price => (
                    <option key={price} value={price}>{price}</option>
                  ))}
                </select>

                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50"
                >
                  <option value="">All Sources</option>
                  {sources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>

                <div className="text-sm text-white/60 flex items-center">
                  Showing {filteredResources.length} of {allResources.length} resources
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedSkill && (
            <div className="glass rounded-lg px-3 py-1 flex items-center gap-2">
              Skill: {selectedSkill}
              <button onClick={() => setSelectedSkill('')}><X className="w-3 h-3" /></button>
            </div>
          )}
          {selectedCategory && (
            <div className="glass rounded-lg px-3 py-1 flex items-center gap-2">
              {selectedCategory}
              <button onClick={() => setSelectedCategory('')}><X className="w-3 h-3" /></button>
            </div>
          )}
          {selectedLevel && (
            <div className="glass rounded-lg px-3 py-1 flex items-center gap-2">
              {selectedLevel}
              <button onClick={() => setSelectedLevel('')}><X className="w-3 h-3" /></button>
            </div>
          )}
          {selectedPricing && (
            <div className="glass rounded-lg px-3 py-1 flex items-center gap-2">
              {selectedPricing}
              <button onClick={() => setSelectedPricing('')}><X className="w-3 h-3" /></button>
            </div>
          )}
          {selectedSource && (
            <div className="glass rounded-lg px-3 py-1 flex items-center gap-2">
              {selectedSource}
              <button onClick={() => setSelectedSource('')}><X className="w-3 h-3" /></button>
            </div>
          )}
        </div>
      )}

      {/* Resources Grid */}
      {Object.keys(resourcesByCategory).length > 0 ? (
        Object.entries(resourcesByCategory).map(([category, resources]) => (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-primary">{getCategoryIcon(category)}</div>
              <h2 className="text-xl font-semibold">{category}</h2>
              <span className="text-white/40 text-sm">({resources.length})</span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  onClick={() => setSelectedResource(resource)}
                  className="glass rounded-xl p-5 cursor-pointer hover:bg-white/5 transition-all border border-white/10 hover:border-white/20 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold pr-2 group-hover:text-primary transition-colors">{resource.name}</h3>
                    <ExternalLink className="w-4 h-4 text-white/40 flex-shrink-0" />
                  </div>

                  <p className="text-sm text-white/60 mb-4 line-clamp-2">{resource.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${getPricingColor(resource.pricing)}`}>
                      {resource.pricing}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getSourceColor(resource.source)}`}>
                      {resource.source}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60">
                      {resource.level}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {resource.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 glass rounded-2xl">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-white/40" />
          <p className="text-white/60">No resources found matching your filters.</p>
          <button onClick={clearFilters} className="mt-4 text-primary hover:underline">
            Clear all filters
          </button>
        </div>
      )}

      {/* Resource Modal */}
      <AnimatePresence>
        {selectedResource && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedResource(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="glass rounded-2xl p-8 max-w-2xl w-full"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">{selectedResource.name}</h2>
                <button onClick={() => setSelectedResource(null)} className="text-white/40 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-white/80 mb-6 text-lg">{selectedResource.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Category</div>
                  <div className="font-semibold">{selectedResource.category}</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Source</div>
                  <div className="font-semibold">{selectedResource.source}</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Level</div>
                  <div className="font-semibold">{selectedResource.level}</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Pricing</div>
                  <div className="font-semibold">{selectedResource.pricing}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-white/60 mb-2">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {selectedResource.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-white/10 rounded-lg text-sm">{skill}</span>
                  ))}
                </div>
              </div>

              <a
                href={selectedResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl font-semibold transition-colors"
              >
                Visit Resource <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}