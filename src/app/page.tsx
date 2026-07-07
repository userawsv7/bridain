'use client';

import React, { useState } from 'react';
import { Brain, Target, Trophy, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { CoachChat } from '../components/CoachChat';
import { ScenarioGame } from '../components/ScenarioGame';
import { ResumeBuilder } from '../components/ResumeBuilder';
import { Resources } from '../components/Resources';

export default function Bridain() {
  const [activeTab, setActiveTab] = useState<'coach' | 'game' | 'resume' | 'resources'>('coach');

  const tabs = [
    { id: 'coach', label: 'Coach', icon: Target, emoji: '🎯' },
    { id: 'game', label: 'Scenario Game', icon: Trophy, emoji: '🎮' },
    { id: 'resume', label: 'Resume Builder', icon: FileText, emoji: '📄' },
    { id: 'resources', label: 'Resources', icon: Trophy, emoji: '🎁' },
  ];

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bridain</h1>
              <p className="text-xs text-white/60">Play While You Learn 🚀</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              Level 1 🌟
            </div>
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              0 XP
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
            <span className="text-accent">✨</span>
            <span className="text-sm">AI-Powered Learning Platform</span>
          </div>
          <h2 className="text-6xl font-bold tracking-tight">
            Master Any Skill<br />Through <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Interactive Simulation</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Learn DevOps, AI, MLOps, Testing & more through fun puzzle scenarios.
            Practice with our AI coach and earn certifications! 🎯
          </p>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-2 border-b border-white/10 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.emoji} {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {activeTab === 'coach' && <CoachChat />}
        {activeTab === 'game' && <ScenarioGame />}
        {activeTab === 'resume' && <ResumeBuilder />}
        {activeTab === 'resources' && <Resources />}
      </div>

      {/* Footer Quote */}
      <div className="text-center py-8 text-white/40 text-sm border-t border-white/10">
        "Practice makes perfect. Play makes it fun! 🎮✨" - Your AI Learning Coach
      </div>
    </div>
  );
}