// Universal skills database - supports ANY skill input
export const universalSkillsDatabase: { [key: string]: string[] } = {
  // Programming Languages
  'javascript': ['JavaScript', 'JS', 'ES6', 'TypeScript'],
  'typescript': ['TypeScript', 'TS', 'JavaScript'],
  'python': ['Python', 'Py', 'Django', 'Flask', 'FastAPI'],
  'java': ['Java', 'Spring', 'Spring Boot', 'JVM'],
  'go': ['Go', 'Golang'],
  'rust': ['Rust', 'Systems Programming'],
  'csharp': ['C#', '.NET', 'ASP.NET'],
  'ruby': ['Ruby', 'Ruby on Rails'],
  'php': ['PHP', 'Laravel', 'Symfony'],
  'swift': ['Swift', 'iOS', 'macOS'],
  'kotlin': ['Kotlin', 'Android'],

  // Frontend/UI
  'react': ['React', 'ReactJS', 'Frontend'],
  'vue': ['Vue', 'Vue.js', 'VueJS', 'Frontend'],
  'angular': ['Angular', 'AngularJS', 'Frontend'],
  'svelte': ['Svelte', 'SvelteKit', 'Frontend'],
  'html': ['HTML', 'HTML5', 'Markup'],
  'css': ['CSS', 'CSS3', 'Styling', 'Tailwind', 'Bootstrap'],
  'ui': ['UI', 'User Interface', 'Frontend'],
  'ux': ['UX', 'User Experience', 'Design'],

  // Testing & QA
  'testing': ['Testing', 'QA', 'Quality Assurance'],
  'automation': ['Automation', 'Test Automation'],
  'selenium': ['Selenium', 'WebDriver', 'Testing'],
  'cypress': ['Cypress', 'E2E Testing', 'Testing'],
  'playwright': ['Playwright', 'E2E Testing', 'Testing'],
  'jest': ['Jest', 'Unit Testing', 'JavaScript'],
  'pytest': ['Pytest', 'Python Testing', 'Testing'],
  'junit': ['JUnit', 'Java Testing', 'Testing'],
  'postman': ['Postman', 'API Testing', 'Testing'],
  'api testing': ['API Testing', 'RestAssured', 'Testing'],
  'performance testing': ['Performance Testing', 'Load Testing', 'JMeter'],
  'jmeter': ['JMeter', 'Performance Testing', 'Load Testing'],

  // Backend/API
  'api': ['API', 'REST', 'RESTful', 'GraphQL'],
  'rest': ['REST', 'REST API', 'API'],
  'graphql': ['GraphQL', 'API'],
  'nodejs': ['Node.js', 'NodeJS', 'Backend'],
  'express': ['Express', 'Express.js', 'Node.js'],
  'django': ['Django', 'Python', 'Backend'],
  'flask': ['Flask', 'Python', 'Backend'],
  'spring boot': ['Spring Boot', 'Java', 'Backend'],
  'fastapi': ['FastAPI', 'Python', 'API'],

  // DevOps & Cloud
  'kubernetes': ['Kubernetes', 'K8s', 'Container Orchestration'],
  'docker': ['Docker', 'Containers', 'Containerization'],
  'helm': ['Helm', 'Kubernetes', 'Package Manager'],
  'terraform': ['Terraform', 'IaC', 'Infrastructure as Code'],
  'ansible': ['Ansible', 'Configuration Management'],
  'argocd': ['ArgoCD', 'GitOps', 'Continuous Deployment'],
  'jenkins': ['Jenkins', 'CI/CD', 'Pipeline'],
  'github actions': ['GitHub Actions', 'CI/CD', 'Automation'],
  'gitlab ci': ['GitLab CI', 'CI/CD', 'Pipeline'],
  'aws': ['AWS', 'Amazon Web Services', 'Cloud'],
  'azure': ['Azure', 'Microsoft Azure', 'Cloud'],
  'gcp': ['GCP', 'Google Cloud', 'Cloud'],
  'cloud': ['Cloud', 'AWS', 'Azure', 'GCP'],

  // Monitoring & Observability
  'prometheus': ['Prometheus', 'Monitoring', 'Metrics'],
  'grafana': ['Grafana', 'Dashboards', 'Visualization'],
  'elk': ['ELK', 'Elasticsearch', 'Logstash', 'Kibana'],
  'datadog': ['Datadog', 'Monitoring', 'Observability'],
  'newrelic': ['New Relic', 'APM', 'Monitoring'],
  'splunk': ['Splunk', 'Log Management', 'SIEM'],

  // AI/ML
  'ai': ['AI', 'Artificial Intelligence', 'Machine Learning'],
  'ml': ['ML', 'Machine Learning', 'AI'],
  'machine learning': ['Machine Learning', 'ML', 'AI'],
  'deep learning': ['Deep Learning', 'Neural Networks', 'AI'],
  'tensorflow': ['TensorFlow', 'Deep Learning', 'ML'],
  'pytorch': ['PyTorch', 'Deep Learning', 'ML'],
  'llm': ['LLM', 'Large Language Models', 'AI'],
  'nlp': ['NLP', 'Natural Language Processing', 'AI'],

  // Databases
  'sql': ['SQL', 'Database', 'Relational'],
  'postgresql': ['PostgreSQL', 'Postgres', 'Database'],
  'mysql': ['MySQL', 'Database', 'RDBMS'],
  'mongodb': ['MongoDB', 'NoSQL', 'Database'],
  'redis': ['Redis', 'Caching', 'Database'],
  'elasticsearch': ['Elasticsearch', 'Search', 'Database'],
  'database': ['Database', 'SQL', 'NoSQL'],

  // Security
  'security': ['Security', 'Cybersecurity', 'InfoSec'],
  'owasp': ['OWASP', 'Web Security', 'Security'],
  'penetration testing': ['Penetration Testing', 'Pentest', 'Security'],
  'iam': ['IAM', 'Identity Access Management', 'Security'],
  'encryption': ['Encryption', 'Cryptography', 'Security'],

  // Version Control
  'git': ['Git', 'Version Control', 'VCS'],
  'github': ['GitHub', 'Git', 'Version Control'],
  'gitlab': ['GitLab', 'Git', 'Version Control'],
  'bitbucket': ['Bitbucket', 'Git', 'Version Control'],

  // Agile & Collaboration
  'agile': ['Agile', 'Scrum', 'Project Management'],
  'scrum': ['Scrum', 'Agile', 'Project Management'],
  'jira': ['Jira', 'Project Management', 'Atlassian'],
  'confluence': ['Confluence', 'Documentation', 'Atlassian'],

  // Other
  'linux': ['Linux', 'Unix', 'Shell'],
  'bash': ['Bash', 'Shell Scripting', 'Linux'],
  'powershell': ['PowerShell', 'Windows Scripting', 'Automation'],
  'networking': ['Networking', 'Network', 'TCP/IP'],
  'microservices': ['Microservices', 'Distributed Systems', 'Architecture'],
  'architecture': ['Architecture', 'System Design', 'Software Architecture'],
  'design patterns': ['Design Patterns', 'Software Patterns', 'Architecture'],
  'system design': ['System Design', 'Architecture', 'Scalability'],
  'scalability': ['Scalability', 'Performance', 'Architecture'],
  'performance': ['Performance', 'Optimization', 'Tuning'],
  'ci/cd': ['CI/CD', 'DevOps', 'Pipeline'],
  'devops': ['DevOps', 'SRE', 'Platform Engineering'],
  'sre': ['SRE', 'Site Reliability', 'DevOps'],
  'infrastructure': ['Infrastructure', 'IaC', 'Cloud'],
  'iac': ['IaC', 'Infrastructure as Code', 'Terraform'],
};

// Get all unique skills from the database
export function getAllSkills(): string[] {
  const skillsSet = new Set<string>();
  Object.values(universalSkillsDatabase).forEach(skills => {
    skills.forEach(skill => skillsSet.add(skill));
  });
  return Array.from(skillsSet).sort();
}

// Fuzzy match any skill input to known skills
export function matchSkill(input: string): string[] {
  const normalized = input.toLowerCase().trim();
  const matched: string[] = [];

  // Direct match
  if (universalSkillsDatabase[normalized]) {
    return universalSkillsDatabase[normalized];
  }

  // Partial match in keys
  Object.keys(universalSkillsDatabase).forEach(key => {
    if (key.includes(normalized) || normalized.includes(key)) {
      matched.push(...universalSkillsDatabase[key]);
    }
  });

  // Partial match in values
  Object.values(universalSkillsDatabase).forEach(skills => {
    skills.forEach(skill => {
      if (skill.toLowerCase().includes(normalized)) {
        matched.push(skill);
      }
    });
  });

  // If no matches, return the input as-is (will work for new skills)
  if (matched.length === 0) {
    return [input];
  }

  return [...new Set(matched)];
}

// Generate dynamic resources for any skill
export function generateDynamicResources(skill: string): any[] {
  const matchedSkills = matchSkill(skill);
  const primarySkill = matchedSkills[0] || skill;

  return [
    {
      id: `${skill.toLowerCase()}-official-docs`,
      name: `${primarySkill} Official Documentation`,
      url: `https://www.google.com/search?q=${encodeURIComponent(primarySkill + ' official documentation')}`,
      category: 'Official Documentation',
      skills: matchedSkills,
      pricing: 'Free',
      level: 'Beginner',
      source: 'Official',
      type: 'Documentation',
      description: `Official documentation and guides for ${primarySkill}`,
      priorityScore: 100,
      tags: [skill.toLowerCase(), 'docs']
    },
    {
      id: `${skill.toLowerCase()}-awesome`,
      name: `Awesome ${primarySkill}`,
      url: `https://github.com/search?q=awesome+${encodeURIComponent(skill)}`,
      category: 'GitHub',
      skills: matchedSkills,
      pricing: 'Free',
      level: 'Beginner',
      source: 'Community',
      type: 'Repository',
      description: `Curated list of awesome ${primarySkill} resources`,
      priorityScore: 95,
      tags: [skill.toLowerCase(), 'github', 'awesome']
    },
    {
      id: `${skill.toLowerCase()}-youtube`,
      name: `${primarySkill} YouTube Tutorials`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(primarySkill + ' tutorial')}`,
      category: 'YouTube',
      skills: matchedSkills,
      pricing: 'Free',
      level: 'Beginner',
      source: 'Community',
      type: 'Video',
      description: `Video tutorials and courses for ${primarySkill}`,
      priorityScore: 90,
      tags: [skill.toLowerCase(), 'youtube', 'video']
    },
    {
      id: `${skill.toLowerCase()}-stackoverflow`,
      name: `${primarySkill} Stack Overflow`,
      url: `https://stackoverflow.com/questions/tagged/${encodeURIComponent(skill.toLowerCase())}`,
      category: 'Community',
      skills: matchedSkills,
      pricing: 'Free',
      level: 'Intermediate',
      source: 'Community',
      type: 'Q&A',
      description: `Questions and answers about ${primarySkill}`,
      priorityScore: 85,
      tags: [skill.toLowerCase(), 'stackoverflow']
    },
    {
      id: `${skill.toLowerCase()}-roadmap`,
      name: `${primarySkill} Learning Roadmap`,
      url: `https://roadmap.sh/?q=${encodeURIComponent(skill)}`,
      category: 'Learning Path',
      skills: matchedSkills,
      pricing: 'Free',
      level: 'Beginner',
      source: 'Community',
      type: 'Roadmap',
      description: `Step-by-step learning path for ${primarySkill}`,
      priorityScore: 80,
      tags: [skill.toLowerCase(), 'roadmap', 'learning']
    }
  ];
}