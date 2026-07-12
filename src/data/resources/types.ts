export interface Resource {
  id: string;
  name: string;
  url: string;
  category: ResourceCategory;
  skills: string[];
  pricing: 'Free' | 'Freemium' | 'Paid';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  source: 'Official' | 'Community';
  type: ResourceType;
  description: string;
  priorityScore: number;
  tags: string[];
}

export type ResourceCategory =
  | 'Official Documentation'
  | 'Official Learning'
  | 'Certification'
  | 'Hands-on Labs'
  | 'Interactive Labs'
  | 'Practice Projects'
  | 'GitHub'
  | 'Open Source'
  | 'Cheat Sheets'
  | 'Engineering Blogs'
  | 'Architecture'
  | 'Troubleshooting'
  | 'Best Practices'
  | 'YouTube'
  | 'Books'
  | 'Podcasts'
  | 'Communities'
  | 'Mock Exams'
  | 'Interview Preparation'
  | 'Practice Questions';

export type ResourceType =
  | 'Documentation'
  | 'Course'
  | 'Video'
  | 'Book'
  | 'Blog'
  | 'Repository'
  | 'Tool'
  | 'Community'
  | 'Certification'
  | 'Lab'
  | 'Cheat Sheet'
  | 'Podcast';