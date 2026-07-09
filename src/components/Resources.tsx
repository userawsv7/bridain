'use client';

import React, { useState } from 'react';
import { ExternalLink, Award, Clock, Target, BookOpen, Users, Youtube, Github, FileText, Search, Plus } from 'lucide-react';

interface Resource {
  name: string;
  url: string;
  type?: string;
  desc?: string;
}

interface Certification {
  name: string;
  provider: string;
  level: string;
  duration: string;
  focus: string;
}

interface SkillResources {
  skill: string;
  timeToCert: string;
  certs: Certification[];
  studyPath: string[];
  keyTopics: string[];
  practice: Resource[];
  docs: Resource[];
  community: Resource[];
}

const generateCustomResources = (skill: string): SkillResources => {
  const skillLower = skill.toLowerCase();

  // Career paths and resources based on skill
  const skillMappings: { [key: string]: Partial<SkillResources> } = {
    react: {
      skill: "React",
      timeToCert: "6-10 weeks",
      certs: [
        { name: "Meta React", provider: "Meta", level: "Associate", duration: "4-6 weeks", focus: "React fundamentals & hooks" },
        { name: "Frontend Masters", provider: "FEM", level: "Intermediate", duration: "6-8 weeks", focus: "Advanced patterns" }
      ],
      studyPath: ["Master React hooks & state", "Build 5 complete apps", "Practice with React testing", "Learn Next.js", "Deploy production apps"],
      keyTopics: ["Components & JSX", "Hooks & State", "Props & Context", "React Router", "State Management", "Testing", "Performance", "SSR"],
      practice: [
        { name: "React Docs", url: "https://react.dev/learn", type: "Official" },
        { name: "Scrimba React", url: "https://scrimba.com/learn/react", type: "Interactive" },
        { name: "Epic React", url: "https://epicreact.dev", type: "Course" }
      ],
      docs: [
        { name: "React Documentation", url: "https://react.dev" },
        { name: "React Testing", url: "https://testing-library.com/docs/react-testing-library" },
        { name: "React Patterns", url: "https://reactpatterns.com" }
      ],
      community: [
        { name: "Reactiflux Discord", url: "https://reactiflux.com", type: "Discord" },
        { name: "r/reactjs", url: "https://reddit.com/r/reactjs", type: "Reddit" },
        { name: "React YouTube", url: "https://youtube.com/c/React", type: "YouTube" }
      ]
    },
    python: {
      skill: "Python",
      timeToCert: "8-12 weeks",
      certs: [
        { name: "PCAP", provider: "Python Institute", level: "Associate", duration: "6-8 weeks", focus: "Python fundamentals" },
        { name: "PCEP", provider: "Python Institute", level: "Entry", duration: "4-6 weeks", focus: "Basic coding" }
      ],
      studyPath: ["Learn Python basics", "Build automation scripts", "Practice data structures", "Work with APIs", "Complete personal projects"],
      keyTopics: ["Syntax & Basics", "OOP", "Data Structures", "APIs & Requests", "Testing", "Virtual Environments", "Packaging", "Async"],
      practice: [
        { name: "LeetCode Python", url: "https://leetcode.com", type: "Practice" },
        { name: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com", type: "Course" },
        { name: "Real Python", url: "https://realpython.com", type: "Tutorials" }
      ],
      docs: [
        { name: "Python Docs", url: "https://docs.python.org/3" },
        { name: "Python Package Index", url: "https://pypi.org" },
        { name: "Real Python Guide", url: "https://realpython.com/tutorials" }
      ],
      community: [
        { name: "Python Discord", url: "https://pythondiscord.com", type: "Discord" },
        { name: "r/python", url: "https://reddit.com/r/python", type: "Reddit" },
        { name: "PyCon YouTube", url: "https://youtube.com/user/PyCon" , type: "YouTube" }
      ]
    },
    java: {
      skill: "Java",
      timeToCert: "10-14 weeks",
      certs: [
        { name: "Oracle Java SE 17", provider: "Oracle", level: "Associate", duration: "8-10 weeks", focus: "Core Java" },
        { name: "Spring Professional", provider: "VMware", level: "Associate", duration: "6-8 weeks", focus: "Spring Framework" }
      ],
      studyPath: ["Master Java syntax & OOP", "Build Spring Boot apps", "Practice algorithms", "Learn JVM internals", "Complete certification mock exams"],
      keyTopics: ["Core Java", "Collections", "Multithreading", "Spring Boot", "JPA & Hibernate", "Testing", "Design Patterns", "JVM Tuning"],
      practice: [
        { name: "HackerRank Java", url: "https://hackerrank.com/domains/java", type: "Practice" },
        { name: "Baeldung", url: "https://baeldung.com", type: "Tutorials" },
        { name: "CodingBat", url: "https://codingbat.com/java", type: "Exercises" }
      ],
      docs: [
        { name: "Java Documentation", url: "https://docs.oracle.com/en/java" },
        { name: "Spring Docs", url: "https://spring.io/projects/spring-boot" },
        { name: "Baeldung Guides", url: "https://baeldung.com/java-tutorial" }
      ],
      community: [
        { name: "Java Discord", url: "https://discord.gg/java", type: "Discord" },
        { name: "r/java", url: "https://reddit.com/r/java", type: "Reddit" },
        { name: "Java YouTube", url: "https://youtube.com/c/Java", type: "YouTube" }
      ]
    }
  };

  // Default generic structure for unknown skills
  const defaults: SkillResources = {
    skill: skill,
    timeToCert: "6-10 weeks",
    certs: [
      { name: `${skill} Fundamentals`, provider: "Industry", level: "Associate", duration: "4-6 weeks", focus: "Core concepts" },
      { name: `${skill} Professional`, provider: "Industry", level: "Professional", duration: "6-8 weeks", focus: "Advanced topics" }
    ],
    studyPath: [`Learn ${skill} basics and syntax`, `Build 3-5 hands-on projects`, `Practice with interactive labs`, `Study documentation daily`, "Join community discussions"],
    keyTopics: ["Fundamentals", "Core Concepts", "Best Practices", "Tools", "Patterns", "Testing", "Deployment", "Performance"],
    practice: [
      { name: "Official Tutorials", url: `https://google.com/search?q=${encodeURIComponent(skill)}+official+tutorial`, type: "Tutorial" },
      { name: "Practice Platform", url: `https://google.com/search?q=${encodeURIComponent(skill)}+practice+exercises`, type: "Practice" },
      { name: "Interactive Labs", url: `https://google.com/search?q=${encodeURIComponent(skill)}+interactive+labs`, type: "Labs" }
    ],
    docs: [
      { name: "Official Documentation", url: `https://google.com/search?q=${encodeURIComponent(skill)}+documentation`, type: "Docs" },
      { name: "Cheat Sheets", url: `https://google.com/search?q=${encodeURIComponent(skill)}+cheat+sheet`, type: "Reference" },
      { name: "API Reference", url: `https://google.com/search?q=${encodeURIComponent(skill)}+api+reference`, type: "API" }
    ],
    community: [
      { name: "Official Community", url: `https://google.com/search?q=${encodeURIComponent(skill)}+community+forum`, type: "Forum" },
      { name: "Reddit Community", url: `https://reddit.com/r/${skill.toLowerCase()}`, type: "Reddit" },
      { name: "YouTube Channel", url: `https://youtube.com/results?search_query=${encodeURIComponent(skill)}+tutorial`, type: "YouTube" }
    ]
  };

  // Use specific mapping if exists, else use defaults with skill name
  const mapped = skillMappings[skillLower] || defaults;

  return {
    skill: mapped.skill || skill,
    timeToCert: mapped.timeToCert || defaults.timeToCert,
    certs: mapped.certs || defaults.certs,
    studyPath: mapped.studyPath || defaults.studyPath,
    keyTopics: mapped.keyTopics || defaults.keyTopics,
    practice: mapped.practice || defaults.practice,
    docs: mapped.docs || defaults.docs,
    community: mapped.community || defaults.community
  };
};

export function Resources() {
  const [activeSkill, setActiveSkill] = useState<keyof typeof SKILLS>('kubernetes');
  const [customSkill, setCustomSkill] = useState('');
  const [customResources, setCustomResources] = useState<SkillResources | null>(null);

  const current = customResources || SKILLS[activeSkill];

  const handleCustomSearch = () => {
    if (!customSkill.trim()) return;
    const resources = generateCustomResources(customSkill.trim());
    setCustomResources(resources);
    setActiveSkill('kubernetes'); // dummy so UI shows
  };

  const Pill = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-block px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded-full">
      {children}
    </span>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
          <Award className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-400">Certification Study Hub</span>
        </div>
        <h1 className="text-3xl font-semibold text-white mb-2">Learning Resources</h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Structured paths to certification with curated resources and hands-on practice
        </p>
      </div>

      {/* Skill Selector + Custom Search */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.keys(SKILLS).map((skill) => (
            <button
              key={skill}
              onClick={() => {
                setActiveSkill(skill as keyof typeof SKILLS);
                setCustomResources(null);
              }}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeSkill === skill && !customResources
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {SKILLS[skill].skill}
            </button>
          ))}
        </div>

        {/* Custom Skill Search */}
        <div className="flex justify-center gap-3">
          <input
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomSearch()}
            placeholder="Enter any skill (React, Python, Java, Go...)"
            className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm w-80 focus:border-purple-500 outline-none"
          />
          <button
            onClick={handleCustomSearch}
            disabled={!customSkill.trim()}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2 hover:bg-purple-700"
          >
            <Search className="w-4 h-4" /> Generate Path
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Overview Card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">{current.skill}</h2>
            <div className="flex items-center gap-2 text-purple-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{current.timeToCert}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {current.keyTopics.map((topic, i) => (
              <Pill key={i}>{topic}</Pill>
            ))}
          </div>
        </div>

        {/* Certification Path */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
            <Target className="w-5 h-5 text-purple-400" /> Certification Track
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {current.certs.map((cert, i) => (
              <div key={i} className="bg-gray-950 rounded-xl p-5 border border-gray-800">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white">{cert.name}</div>
                    <div className="text-sm text-gray-400">{cert.provider} • {cert.level}</div>
                  </div>
                  <Pill>{cert.duration}</Pill>
                </div>
                <div className="text-sm text-gray-400">{cert.focus}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Roadmap */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
            <BookOpen className="w-5 h-5 text-purple-400" /> 5-Week Study Plan
          </h3>
          <div className="space-y-3">
            {current.studyPath.map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-gray-950 rounded-xl border border-gray-800">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 text-sm font-medium">
                  {i + 1}
                </div>
                <div className="text-gray-300 pt-1">{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Hands-on Practice */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <Target className="w-5 h-5 text-green-400" /> Hands-on Practice
            </h3>
            <div className="space-y-3">
              {current.practice.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white group-hover:text-green-400 transition-colors">{resource.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{resource.type}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-green-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Documentation */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <FileText className="w-5 h-5 text-blue-400" /> Documentation
            </h3>
            <div className="space-y-3">
              {current.docs.map((doc, i) => (
                <a
                  key={i}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{doc.name}</div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-blue-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Community */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <Users className="w-5 h-5 text-orange-400" /> Community
            </h3>
            <div className="space-y-3">
              {current.community.map((comm, i) => (
                <a
                  key={i}
                  href={comm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white group-hover:text-orange-400 transition-colors">{comm.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{comm.type}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-orange-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Study Tips</h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-400">
            <div>• Schedule 2-3 focused study sessions weekly</div>
            <div>• Build projects while learning concepts</div>
            <div>• Join community discussions actively</div>
            <div>• Practice with real infrastructure</div>
            <div>• Document your learning journey</div>
            <div>• Review concepts through teaching others</div>
          </div>
        </div>
      </div>
    </div>
  );
}