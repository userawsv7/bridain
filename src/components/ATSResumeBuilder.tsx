'use client';

import React, { useState } from 'react';
import { Download, Target, Award, Copy, FileText, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface JobTarget {
  role: string;
  keywords: string[];
}

interface AnalysisScore {
  overall: number;
  breakdown: { label: string; score: number; note: string }[];
}

export function ATSResumeBuilder() {
  const [activeTab, setActiveTab] = useState<'build' | 'analyze'>('build');
  const [jobTarget, setJobTarget] = useState<JobTarget>({ role: '', keywords: [] });
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [template, setTemplate] = useState<'engineer' | 'devops' | 'manager'>('engineer');

  const templates = {
    engineer: {
      label: 'Software Engineer',
      keywords: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'REST APIs', 'Agile']
    },
    devops: {
      label: 'DevOps Engineer',
      keywords: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Jenkins', 'Prometheus', 'Linux']
    },
    manager: {
      label: 'Engineering Manager',
      keywords: ['Leadership', 'Strategy', 'Team Management', 'Scrum', 'Budget', 'Stakeholder', 'Hiring', 'Mentorship']
    }
  };

  const generateResume = () => {
    if (!jobTarget.role) {
      toast.error('Enter target role');
      return;
    }

    const templateData = templates[template];
    const allKeywords = [...new Set([
      ...jobTarget.keywords,
      ...templateData.keywords,
      ...jobDescription.toLowerCase().match(/\b[A-Za-z]{3,}\b/g) || []
    ])].slice(0, 15);

    const optimizedResume = `${jobTarget.role}
${'='.repeat(40)}

PROFESSIONAL SUMMARY
Results-driven professional with expertise in ${allKeywords.slice(0, 5).join(', ')}. Proven ability to deliver scalable solutions and drive measurable business outcomes through technical excellence and collaborative leadership.

TECHNICAL EXPERTISE
${allKeywords.join(' • ')}

PROFESSIONAL EXPERIENCE

Senior ${jobTarget.role}
[Organization] | [Dates]
• Architected scalable solutions using ${allKeywords[0]}, resulting in 45% performance improvement
• Led development of ${allKeywords[1]} systems serving 500K+ users with 99.9% uptime
• Implemented ${allKeywords[2]} automation reducing deployment time by 60%
• Mentored team of 6 engineers, establishing code review standards and testing practices

${jobTarget.role}
[Previous Organization] | [Dates]
• Developed and optimized ${allKeywords[3]} applications handling 10K+ daily transactions
• Designed ${allKeywords[4]} architecture supporting 3x traffic growth
• Established CI/CD pipelines achieving 95% test coverage
• Collaborated with cross-functional teams to define technical requirements

KEY ACHIEVEMENTS
• Reduced operational costs by $150K through infrastructure optimization
• Improved system reliability from 95% to 99.8% uptime
• Delivered 12 major features ahead of schedule
• Trained 20+ engineers on best practices and development standards

EDUCATION
[Bachelor's/Master's] in [Field of Study]
[Institution] | [Year]

CERTIFICATIONS
• ${allKeywords[0]} Professional Certification
• Cloud Architecture (AWS/GCP/Azure)
• Agile/Scrum Master`;

    setResume(optimizedResume);
    setAnalysis(null);
    toast.success('ATS-optimized resume generated');
  };

  const analyzeATS = () => {
    if (!resume) {
      toast.error('Generate a resume first');
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      const resumeText = resume.toLowerCase();
      const jobWords = jobDescription.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const matchedKeywords = jobWords.filter(word => resumeText.includes(word)).length;
      const keywordScore = jobWords.length ? Math.round((matchedKeywords / jobWords.length) * 100) : 75;

      const hasMetrics = /\d+%|\d+x|\$\d+|increased|reduced|improved/i.test(resume);
      const formatScore = hasMetrics ? 90 : 65;

      const sectionScore = ['summary', 'experience', 'education'].every(s =>
        resumeText.includes(s)
      ) ? 95 : 70;

      const overall = Math.round((keywordScore + formatScore + sectionScore) / 3);

      setAnalysis({
        overall,
        breakdown: [
          { label: 'Keyword Match', score: keywordScore, note: `${matchedKeywords}/${jobWords.length} keywords matched` },
          { label: 'Format & Structure', score: formatScore, note: hasMetrics ? 'Quantifiable results included' : 'Add metrics for better scoring' },
          { label: 'Section Completeness', score: sectionScore, note: 'All key sections present' }
        ]
      });

      setIsAnalyzing(false);
      toast.success(`ATS Score: ${overall}%`);
    }, 800);
  };

  const exportResume = () => {
    const blob = new Blob([resume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${jobTarget.role.replace(/\s+/g, '_')}_ATS.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported ATS-compatible format');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resume);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
          <Target className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">ATS Optimization Engine</span>
        </div>
        <h1 className="text-3xl font-semibold text-white mb-2">Resume Builder</h1>
        <p className="text-gray-400">Optimized for Applicant Tracking Systems and human reviewers</p>
      </div>

      {/* Target Input */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Target Role"
            value={jobTarget.role}
            onChange={(e) => setJobTarget(prev => ({ ...prev, role: e.target.value }))}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500"
          >
            {Object.entries(templates).map(([key, t]) => (
              <option key={key} value={key}>{t.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Additional keywords (comma-separated)"
            onChange={(e) => setJobTarget(prev => ({
              ...prev,
              keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
            }))}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>

        <textarea
          placeholder="Paste job description for keyword optimization..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full h-24 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={generateResume}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Target className="w-4 h-4" /> Generate ATS-Optimized Resume
          </button>
          <button
            onClick={analyzeATS}
            disabled={!resume}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl text-white transition-colors flex items-center gap-2"
          >
            <Award className="w-4 h-4" /> Analyze Score
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 px-1">
        {(['build', 'analyze'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'build' ? 'Resume Builder' : 'ATS Analysis'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'build' && resume && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <span className="font-medium text-white">ATS-Optimized Resume</span>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2">
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button onClick={exportResume} className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>
          <pre className="p-6 text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
            {resume}
          </pre>
        </div>
      )}

      {activeTab === 'analyze' && (
        <div>
          {analysis ? (
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-5xl font-semibold text-white">{analysis.overall}</div>
                    <div className="text-green-400 text-sm mt-1">ATS Compatibility Score</div>
                  </div>
                  <div className={`text-6xl ${analysis.overall > 85 ? 'text-green-400' : analysis.overall > 70 ? 'text-yellow-400' : 'text-orange-400'}`}>
                    {analysis.overall > 85 ? '✓' : analysis.overall > 70 ? '◐' : '○'}
                  </div>
                </div>

                <div className="space-y-4">
                  {analysis.breakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-950 rounded-xl">
                      <div>
                        <div className="font-medium text-white">{item.label}</div>
                        <div className="text-sm text-gray-400 mt-0.5">{item.note}</div>
                      </div>
                      <div className="text-2xl font-semibold text-white">{item.score}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" /> ATS Best Practices
                </h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  {[
                    ['Use standard section headers', 'Summary, Experience, Education'],
                    ['Include quantifiable metrics', '%, $, increased, reduced'],
                    ['Match job description keywords', 'Exact phrase matching'],
                    ['Simple formatting only', 'No tables, graphics, or text boxes'],
                    ['Standard fonts', 'Arial, Calibri, 10-12pt'],
                    ['Save as .txt or .docx', 'ATS parsers work best with these']
                  ].map(([title, desc], i) => (
                    <div key={i} className="flex gap-3 p-3 bg-gray-950 rounded-lg">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white">{title}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400">Generate a resume to analyze ATS compatibility</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}