import { Resource } from './types';
import { resourcesDatabase } from './database';
import { extendedResources } from './database-extended';

// Combine all resources
export const allResources: Resource[] = [...resourcesDatabase, ...extendedResources];

// Export types
export * from './types';

// Export utilities
export const getResourcesBySkill = (skill: string): Resource[] => {
  return allResources.filter(resource =>
    resource.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
  );
};

export const getResourcesByCategory = (category: string): Resource[] => {
  return allResources.filter(resource => resource.category === category);
};

export const getResourcesByLevel = (level: string): Resource[] => {
  return allResources.filter(resource => resource.level === level);
};

export const getResourcesByPricing = (pricing: string): Resource[] => {
  return allResources.filter(resource => resource.pricing === pricing);
};

export const searchResources = (query: string): Resource[] => {
  const searchTerm = query.toLowerCase();
  return allResources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm) ||
    resource.description.toLowerCase().includes(searchTerm) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    resource.skills.some(skill => skill.toLowerCase().includes(searchTerm))
  );
};

export const getUniqueCategories = (): string[] => {
  return [...new Set(allResources.map(r => r.category))].sort();
};

export const getUniqueSkills = (): string[] => {
  const skills = allResources.flatMap(r => r.skills);
  return [...new Set(skills)].sort();
};

export const getResourceCount = (): number => allResources.length;