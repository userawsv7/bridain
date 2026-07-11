'use client';

import React, { useState } from 'react';
import { Download, Plus, Trash2, Award, Briefcase, GraduationCap, User, Mail } from 'lucide-react';
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

interface Education {
  id: number;
  degree: string;
  institution: string;
  year: string;
}

export function ResumeBuilder() {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // Add Experience
  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now(),
      role: '',
      company: '',
      duration: '',
      description: ''
    };
    setExperiences([...experiences, newExp]);
  };

  const updateExperience = (id: number, field: keyof Experience, value: string) => {
    setExperiences(experiences.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id: number) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
    toast.info('Experience removed');
  };

  // Add Certification
  const addCert = () => {
    const newCert: Certification = {
      id: Date.now(),
      name: '',
      issuer: '',
      date: ''
    };
    setCerts([...certs, newCert]);
  };

  const updateCert = (id: number, field: keyof Certification, value: string) => {
    setCerts(certs.map(cert =>
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  const removeCert = (id: number) => {
    setCerts(certs.filter(cert => cert.id !== id));
    toast.info('Certification removed');
  };

  // Add Education
  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now(),
      degree: '',
      institution: '',
      year: ''
    };
    setEducation([...education, newEdu]);
  };

  const updateEducation = (id: number, field: keyof Education, value: string) => {
    setEducation(education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id: number) => {
    setEducation(education.filter(edu => edu.id !== id));
    toast.info('Education removed');
  };

  // Skills
  const addSkill = () => {
    const skill = prompt('Enter skill:');
    if (skill && skill.trim()) {
      setSkills([...skills, skill.trim()]);
      toast.success('Skill added');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Projects
  const addProject = () => {
    const newProject = {
      id: Date.now(),
      name: '',
      description: '',
      tech: ''
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: number, field: string, value: string) => {
    setProjects(projects.map(proj =>
      proj.id === id ? { ...proj, [field]: value } : proj
    ));
  };

  const removeProject = (id: number) => {
    setProjects(projects.filter(proj => proj.id !== id));
    toast.info('Project removed');
  };

  // Download Resume
  const downloadResume = () => {
    if (!name) {
      toast.error('Please enter your name');
      return;
    }

    const resumeContent = `
${name.toUpperCase()}
${title}
${email} | ${phone} | ${location}

PROFESSIONAL SUMMARY
${summary || 'Add your professional summary here'}

${experiences.length > 0 ? `
EXPERIENCE
${experiences.map(exp => `
${exp.role} | ${exp.company}
${exp.duration}
${exp.description}
`).join('\n')}` : ''}

${skills.length > 0 ? `
TECHNICAL SKILLS
${skills.join(' • ')}` : ''}

${education.length > 0 ? `
EDUCATION
${education.map(edu => `
${edu.degree}
${edu.institution} | ${edu.year}
`).join('\n')}` : ''}

${certs.length > 0 ? `
CERTIFICATIONS
${certs.map(cert => `• ${cert.name} | ${cert.issuer} | ${cert.date}`).join('\n')}` : ''}

${projects.length > 0 ? `
PROJECTS
${projects.map(proj => `
${proj.name}
${proj.description}
Technologies: ${proj.tech}
`).join('\n')}` : ''}
    `.trim();

    const blob = new Blob([resumeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '-')}-resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Resume downloaded successfully!');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="glass rounded-3xl p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Professional Resume Builder</h3>
            <p className="text-white/60">Create a polished, ATS-friendly resume</p>
          </div>
          <button
            onClick={downloadResume}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary font-medium"
          >
            <Download className="w-4 h-4" /> Download Resume
          </button>
        </div>

        {/* Personal Information */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary font-semibold mb-4">
            <User className="w-5 h-5" /> Personal Information
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name *"
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Job Title / Professional Headline"
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State / Country"
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none md:col-span-2"
            />
          </div>
        </div>

        {/* Professional Summary */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary font-semibold mb-4">
            <Briefcase className="w-5 h-5" /> Professional Summary
          </div>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write a compelling 3-4 sentence professional summary highlighting your expertise, achievements, and career goals..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none resize-none"
            rows={4}
          />
        </div>

        {/* Experience Section */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Briefcase className="w-5 h-5" /> Professional Experience
            </div>
            <button onClick={addExperience} className="px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Experience
            </button>
          </div>

          {experiences.length === 0 && (
            <p className="text-white/40 text-sm text-center py-4">No experience added yet. Click "Add Experience" to begin.</p>
          )}

          {experiences.map((exp) => (
            <div key={exp.id} className="bg-white/5 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="grid md:grid-cols-3 gap-3 flex-1">
                  <input
                    value={exp.role}
                    onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                    placeholder="Job Title"
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-primary/50"
                  />
                  <input
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    placeholder="Company Name"
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-primary/50"
                  />
                  <input
                    value={exp.duration}
                    onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                    placeholder="Duration (e.g., Jan 2023 - Present)"
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-primary/50"
                  />
                </div>
                <button onClick={() => removeExperience(exp.id)} className="ml-2 p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={exp.description}
                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                placeholder="Describe your key achievements, responsibilities, and impact. Use action verbs and quantify results (e.g., 'Improved deployment speed by 40%')"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-primary/50 resize-none"
                rows={3}
              />
            </div>
          ))}
        </div>

        {/* Skills Section */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <GraduationCap className="w-5 h-5" /> Technical Skills
            </div>
            <button onClick={addSkill} className="px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>

          {skills.length === 0 && (
            <p className="text-white/40 text-sm text-center py-4">No skills added. Add your technical skills, tools, and technologies.</p>
          )}

          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="px-4 py-2 bg-white/10 rounded-full text-sm flex items-center gap-2">
                {skill}
                <button onClick={() => removeSkill(index)} className="text-red-400 hover:text-red-300">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <GraduationCap className="w-5 h-5" /> Education
            </div>
            <button onClick={addEducation} className="px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Education
            </button>
          </div>

          {education.length === 0 && (
            <p className="text-white/40 text-sm text-center py-4">No education added yet.</p>
          )}

          {education.map((edu) => (
            <div key={edu.id} className="bg-white/5 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="grid md:grid-cols-3 gap-3 flex-1">
                  <input
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    placeholder="Degree / Certification"
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-primary/50"
                  />
                  <input
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    placeholder="University / Institution"
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-primary/50"
                  />
                  <input
                    value={edu.year}
                    onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                    placeholder="Year / Expected"
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-primary/50"
                  />
                </div>
                <button onClick={() => removeEducation(edu.id)} className="ml-2 p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications Section */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Award className="w-5 h-5" /> Certifications & Licenses
            </div>
            <button onClick={addCert} className="px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Certification
            </button>
          </div>

          {certs.length === 0 && (
            <p className="text-white/40 text-sm text-center py-4">No certifications added yet.</p>
          )}

          {certs.map((cert) => (
            <div key={cert.id} className="bg-white/5 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div className="grid md:grid-cols-3 gap-3 flex-1">
                  <input
                    value={cert.name}
                    onChange={(e) => updateCert(cert.id, 'name', e.target.value)}
                    placeholder="Certification Name"
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-primary/50"
                  />
                  <input
                    value={cert.issuer}
                    onChange={(e) => updateCert(cert.id, 'issuer', e.target.value)}
                    placeholder="Issuing Organization"
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-primary/50"
                  />
                  <input
                    value={cert.date}
                    onChange={(e) => updateCert(cert.id, 'date', e.target.value)}
                    placeholder="Date Obtained"
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-primary/50"
                  />
                </div>
                <button onClick={() => removeCert(cert.id)} className="ml-2 p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Projects Section */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Briefcase className="w-5 h-5" /> Key Projects
            </div>
            <button onClick={addProject} className="px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>

          {projects.length === 0 && (
            <p className="text-white/40 text-sm text-center py-4">No projects added. Showcase your notable projects here.</p>
          )}

          {projects.map((proj) => (
            <div key={proj.id} className="bg-white/5 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <input
                  value={proj.name}
                  onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                  placeholder="Project Name"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-primary/50"
                />
                <button onClick={() => removeProject(proj.id)} className="ml-2 p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={proj.description}
                onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                placeholder="Project description and your contributions"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-primary/50 resize-none"
                rows={2}
              />
              <input
                value={proj.tech}
                onChange={(e) => updateProject(proj.id, 'tech', e.target.value)}
                placeholder="Technologies used (comma separated)"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-primary/50"
              />
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="text-center text-sm text-white/40 bg-white/5 rounded-xl p-4">
          💡 <strong>Pro Tips:</strong> Use action verbs (Led, Developed, Optimized), quantify achievements (40% improvement, managed $X budget), and tailor keywords for ATS scanning.
        </div>
      </div>
    </div>
  );
}