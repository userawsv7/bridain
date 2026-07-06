'use client';

import React, { useState } from 'react';
import { Download, Plus, Trash2, Award, Briefcase, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

interface Experience {
  id: number;
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface Certification {
  id: number;
  name: string;
  issuer: string;
  date: string;
}

export function ResumeBuilder() {
  const [name, setName] = useState('Your Name');
  const [title, setTitle] = useState('DevOps Engineer | Cloud Enthusiast');
  const [email, setEmail] = useState('you@email.com');
  const [summary, setSummary] = useState('Passionate learner building expertise in cloud-native technologies and automation.');
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: 1, role: 'Junior DevOps Engineer', company: 'TechCorp', duration: '2023 - Present', description: 'Managed CI/CD pipelines and container orchestration' }
  ]);
  const [certs, setCerts] = useState<Certification[]>([
    { id: 1, name: 'AWS Cloud Practitioner', issuer: 'Amazon', date: '2024' }
  ]);
  const [skills, setSkills] = useState(['Docker', 'Kubernetes', 'Python', 'AWS', 'Terraform']);

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now(),
      role: 'New Role',
      company: 'Company Name',
      duration: '2024 - Present',
      description: 'Key achievements and responsibilities'
    };
    setExperiences([...experiences, newExp]);
    toast.success('Experience added! 💼');
  };

  const addCert = () => {
    const newCert: Certification = {
      id: Date.now(),
      name: 'New Certification',
      issuer: 'Issuer',
      date: '2024'
    };
    setCerts([...certs, newCert]);
    toast.success('Certification added! 🎓');
  };

  const addSkill = () => {
    const skill = prompt('Enter skill:');
    if (skill) {
      setSkills([...skills, skill]);
      toast.success('Skill added! ⚡');
    }
  };

  const downloadResume = () => {
    const resumeText = `
${name}
${title}
${email}

📝 Professional Summary
${summary}

💼 Experience
${experiences.map(e => `
${e.role} @ ${e.company}
${e.duration}
${e.description}`).join('\n')}

🎓 Certifications
${certs.map(c => `• ${c.name} - ${c.issuer} (${c.date})`).join('\n')}

⚡ Skills
${skills.join(' • ')}
    `.trim();

    const blob = new Blob([resumeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(' ', '-')}-resume.txt`;
    a.click();

    toast.success('Resume downloaded! 📄', {
      description: 'Customize it further with your real achievements!'
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="glass rounded-3xl p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              Resume Builder 📄
            </h3>
            <p className="text-white/60">Create a standout resume with AI-guided tips</p>
          </div>
          <button
            onClick={downloadResume}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary"
          >
            <Download className="w-4 h-4" /> Download
          </button>
        </div>

        {/* Resume Preview */}
        <div className="bg-white rounded-2xl p-8 text-black space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-6">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-3xl font-bold text-center w-full outline-none"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-gray-600 text-center w-full outline-none"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm text-gray-500 text-center w-full outline-none"
            />
          </div>

          {/* Summary */}
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold mb-2">
              <Briefcase className="w-4 h-4" /> Professional Summary
            </div>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full text-sm text-gray-700 outline-none resize-none"
              rows={2}
            />
          </div>

          {/* Experience */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Briefcase className="w-4 h-4" /> Experience
              </div>
              <button onClick={addExperience} className="text-xs flex items-center gap-1 text-primary">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {experiences.map((exp, index) => (
              <div key={exp.id} className="mb-3 text-sm">
                <div className="font-semibold">{exp.role} @ {exp.company}</div>
                <div className="text-gray-500 text-xs">{exp.duration}</div>
                <div className="text-gray-600">{exp.description}</div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Award className="w-4 h-4" /> Certifications
              </div>
              <button onClick={addCert} className="text-xs flex items-center gap-1 text-primary">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {certs.map((cert) => (
                <div key={cert.id} className="px-3 py-1 bg-primary/10 rounded-full text-xs">
                  {cert.name} • {cert.issuer}
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <GraduationCap className="w-4 h-4" /> Skills
              </div>
              <button onClick={addSkill} className="text-xs flex items-center gap-1 text-primary">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-white/40">
          💡 Pro tip: Tailor your resume for each job application!
        </div>
      </div>
    </div>
  );
}