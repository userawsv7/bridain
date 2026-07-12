'use client';

import React, { useState } from 'react';
import {
  Brain, Mic, Eye, Video, Music, Code, Search, Bot, Zap, Target,
  MessageCircle, Globe, Cpu, Layers, Award, ArrowRight, BookOpen
} from 'lucide-react';

interface AIType {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  whatItDoes: string;
  howToUse: string[];
  specialties: string[];
  bestModels: string[];
  realWorldUses: string[];
  techStack: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  freeOptions: string[];
}

const aiTypes: AIType[] = [
  {
    id: 'llm',
    name: 'Large Language Models',
    category: 'Text & Language',
    icon: <MessageCircle className="w-6 h-6" />,
    description: 'AI that understands and generates human-like text',
    whatItDoes: 'Processes and generates text, answers questions, writes code, translates languages',
    howToUse: [
      'Chat interfaces for conversation',
      'API calls for integration',
      'Fine-tuning for specific tasks',
      'Prompt engineering for better results'
    ],
    specialties: ['Code generation', 'Creative writing', 'Analysis', 'Translation', 'Summarization'],
    bestModels: ['GPT-4', 'Claude 3', 'Gemini Pro', 'Llama 3', 'Mistral Large'],
    realWorldUses: ['Customer support chatbots', 'Content creation', 'Code assistants', 'Documentation'],
    techStack: ['OpenAI API', 'Anthropic API', 'LangChain', 'Hugging Face'],
    difficulty: 'Beginner',
    freeOptions: ['OpenAI ($5 free)', 'Anthropic ($5 free)', 'Google Gemini (free tier)']
  },
  {
    id: 'vision',
    name: 'Computer Vision',
    category: 'Image & Video',
    icon: <Eye className="w-6 h-6" />,
    description: 'AI that can "see" and understand images and videos',
    whatItDoes: 'Identifies objects, reads text in images, analyzes visual content, detects faces',
    howToUse: [
      'Upload images for analysis',
      'Real-time video processing',
      'OCR for document scanning',
      'Visual search and matching'
    ],
    specialties: ['Object detection', 'OCR/Text extraction', 'Face recognition', 'Image classification'],
    bestModels: ['GPT-4 Vision', 'Claude 3 Vision', 'Gemini Vision', 'CLIP', 'ResNet'],
    realWorldUses: ['Medical imaging', 'Security systems', 'Quality control', 'Autonomous vehicles'],
    techStack: ['OpenCV', 'TensorFlow', 'PyTorch', 'YOLO', 'EasyOCR'],
    difficulty: 'Intermediate',
    freeOptions: ['Google Vision API (free tier)', 'AWS Rekognition (free tier)', 'Azure Computer Vision']
  },
  {
    id: 'speech',
    name: 'Speech Recognition',
    category: 'Audio & Voice',
    icon: <Mic className="w-6 h-6" />,
    description: 'Converts spoken words to text and text to speech',
    whatItDoes: 'Transcribes audio, synthesizes voice, detects emotions, supports multiple languages',
    howToUse: [
      'Real-time voice transcription',
      'Voice assistants integration',
      'Podcast/video captioning',
      'Voice cloning and synthesis'
    ],
    specialties: ['Speech-to-text', 'Text-to-speech', 'Voice cloning', 'Emotion detection'],
    bestModels: ['Whisper', 'Deepgram', 'ElevenLabs', 'Azure Speech', 'Google Speech-to-Text'],
    realWorldUses: ['Meeting transcription', 'Voice assistants', 'Accessibility tools', 'Call centers'],
    techStack: ['Whisper API', 'SpeechRecognition.js', 'Google Cloud Speech', 'AWS Transcribe'],
    difficulty: 'Beginner',
    freeOptions: ['OpenAI Whisper (pay per use)', 'Google Speech (60 min/month free)', 'Azure Speech (5h free)']
  },
  {
    id: 'generation',
    name: 'Generative AI',
    category: 'Creative Content',
    icon: <Layers className="w-6 h-6" />,
    description: 'Creates new content like images, music, videos, and 3D models',
    whatItDoes: 'Generates images from text, creates music, produces videos, designs 3D objects',
    howToUse: [
      'Text-to-image generation',
      'Music composition',
      'Video creation from text',
      'Style transfer and editing'
    ],
    specialties: ['Image synthesis', 'Music generation', 'Video creation', '3D modeling'],
    bestModels: ['DALL-E 3', 'Midjourney', 'Stable Diffusion', 'Suno', 'Runway Gen-2'],
    realWorldUses: ['Digital art', 'Marketing materials', 'Game assets', 'Content creation'],
    techStack: ['Stable Diffusion', 'ComfyUI', 'Automatic1111', 'Midjourney Discord'],
    difficulty: 'Intermediate',
    freeOptions: ['Hugging Face Spaces', 'Replicate ($10 free)', 'Leonardo.ai (free tier)']
  },
  {
    id: 'agents',
    name: 'AI Agents & Automation',
    category: 'Autonomous Systems',
    icon: <Bot className="w-6 h-6" />,
    description: 'AI systems that can plan and execute multi-step tasks autonomously',
    whatItDoes: 'Breaks down complex tasks, uses tools, makes decisions, learns from results',
    howToUse: [
      'Task automation workflows',
      'Research agents',
      'Code review automation',
      'Personal assistant agents'
    ],
    specialties: ['Task planning', 'Tool use', 'Multi-step reasoning', 'Self-improvement'],
    bestModels: ['AutoGPT', 'BabyAGI', 'LangGraph', 'CrewAI', 'MetaGPT'],
    realWorldUses: ['Research automation', 'DevOps automation', 'Content pipelines', 'Data analysis'],
    techStack: ['LangChain', 'AutoGPT', 'BabyAGI', 'Semantic Kernel', 'CrewAI'],
    difficulty: 'Advanced',
    freeOptions: ['LangChain (open source)', 'AutoGPT (self-hosted)', 'BabyAGI (open source)']
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    category: 'Data & Prediction',
    icon: <Target className="w-6 h-6" />,
    description: 'Algorithms that learn patterns from data to make predictions',
    whatItDoes: 'Predicts outcomes, classifies data, finds patterns, optimizes decisions',
    howToUse: [
      'Train models on datasets',
      'Deploy prediction APIs',
      'Real-time inference',
      'Model fine-tuning'
    ],
    specialties: ['Classification', 'Regression', 'Clustering', 'Recommendation', 'Anomaly detection'],
    bestModels: ['XGBoost', 'Random Forest', 'Neural Networks', 'Transformers', 'BERT'],
    realWorldUses: ['Fraud detection', 'Recommendation systems', 'Demand forecasting', 'Risk analysis'],
    techStack: ['scikit-learn', 'TensorFlow', 'PyTorch', 'XGBoost', 'MLflow'],
    difficulty: 'Intermediate',
    freeOptions: ['Google Colab (free GPU)', 'Kaggle (free compute)', 'Azure ML (free tier)']
  },
  {
    id: 'rag',
    name: 'Retrieval Augmented Generation',
    category: 'Knowledge Systems',
    icon: <Search className="w-6 h-6" />,
    description: 'AI that retrieves relevant information before generating responses',
    whatItDoes: 'Searches knowledge bases, finds relevant context, generates informed responses',
    howToUse: [
      'Enterprise knowledge search',
      'Document Q&A systems',
      'Customer support automation',
      'Research assistant tools'
    ],
    specialties: ['Document retrieval', 'Semantic search', 'Context matching', 'Source citation'],
    bestModels: ['GPT-4 + Pinecone', 'Claude + Chroma', 'LlamaIndex', 'Haystack'],
    realWorldUses: ['Company knowledge bases', 'Legal document analysis', 'Medical research', 'Support systems'],
    techStack: ['Pinecone', 'Weaviate', 'Chroma', 'LlamaIndex', 'Haystack'],
    difficulty: 'Advanced',
    freeOptions: ['Chroma (local)', 'Qdrant Cloud (free tier)', 'Pinecone (starter free)']
  },
  {
    id: 'multimodal',
    name: 'Multimodal AI',
    category: 'Multi-Modal',
    icon: <Globe className="w-6 h-6" />,
    description: 'AI that processes and generates multiple types of content (text, image, audio, video)',
    whatItDoes: 'Understands relationships between different media types, generates cross-modal content',
    howToUse: [
      'Image captioning and description',
      'Audio-visual analysis',
      'Cross-modal search',
      'Multimedia generation'
    ],
    specialties: ['Cross-modal understanding', 'Unified embeddings', 'Multi-input processing'],
    bestModels: ['GPT-4V', 'Gemini Ultra', 'Claude 3', 'LLaVA', 'Flamingo'],
    realWorldUses: ['Content moderation', 'Accessibility tools', 'Smart assistants', 'Media analysis'],
    techStack: ['OpenAI Vision', 'Google Gemini', 'LLaVA', 'CLIP', 'DALL-E'],
    difficulty: 'Advanced',
    freeOptions: ['GPT-4 Vision (usage-based)', 'Google Gemini (free tier)', 'Hugging Face Spaces']
  }
];

export function AITypesGuide() {
  const [selectedType, setSelectedType] = useState<AIType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(aiTypes.map(t => t.category)))];

  const filteredTypes = selectedCategory === 'All'
    ? aiTypes
    : aiTypes.filter(t => t.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-500 bg-green-500/10';
      case 'Intermediate': return 'text-yellow-500 bg-yellow-500/10';
      case 'Advanced': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="w-8 h-8 text-purple-500" />
          <h1 className="text-4xl font-bold text-white">AI Types & Specialties</h1>
        </div>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Explore different types of AI and their real-world applications
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* AI Types Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {filteredTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type)}
            className="group bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-xl p-6 text-left transition-all hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gray-800 rounded-xl text-purple-400 group-hover:text-purple-500 transition-colors">
                {type.icon}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(type.difficulty)}`}>
                {type.difficulty}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-1">{type.name}</h3>
            <p className="text-sm text-purple-400 mb-2">{type.category}</p>
            <p className="text-sm text-gray-400 line-clamp-2 mb-4">{type.description}</p>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{type.bestModels.length} models</span>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-purple-500 transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {/* Selected Type Details */}
      {selectedType && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gray-950 p-6 border-b border-gray-800">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gray-800 rounded-xl text-purple-400">
                  {selectedType.icon}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-white">{selectedType.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedType.difficulty)}`}>
                      {selectedType.difficulty}
                    </span>
                  </div>
                  <p className="text-purple-400">{selectedType.category}</p>
                </div>
              </div>
              <button onClick={() => setSelectedType(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <p className="text-lg text-gray-300">{selectedType.description}</p>
          </div>

          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* What It Does */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium text-purple-500 mb-3">
                    <Zap className="w-4 h-4" /> WHAT IT DOES
                  </h4>
                  <p className="text-gray-300">{selectedType.whatItDoes}</p>
                </div>

                {/* How to Use */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium text-purple-500 mb-3">
                    <BookOpen className="w-4 h-4" /> HOW TO USE
                  </h4>
                  <ul className="space-y-2">
                    {selectedType.howToUse.map((use, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <span className="text-purple-500 mt-1">→</span> {use}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Specialties */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium text-purple-500 mb-3">
                    <Award className="w-4 h-4" /> SPECIALTIES
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedType.specialties.map((specialty, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Best Models */}
                <div>
                  <h4 className="text-sm font-medium text-purple-500 mb-3">TOP MODELS</h4>
                  <div className="space-y-2">
                    {selectedType.bestModels.map((model, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2">
                        <span className="text-gray-300">{model}</span>
                        <span className="text-xs text-green-500">Recommended</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real World Uses */}
                <div>
                  <h4 className="text-sm font-medium text-purple-500 mb-3">REAL-WORLD APPLICATIONS</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedType.realWorldUses.map((use, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300">
                        {use}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <h4 className="text-sm font-medium text-purple-500 mb-3">TECH STACK</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedType.techStack.map((tech, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-sm border border-purple-500/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Free Options */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-green-500 mb-3">🆓 FREE OPTIONS</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {selectedType.freeOptions.map((option, index) => (
                      <li key={index}>• {option}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reference Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-500" /> Quick AI Selection Guide
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-purple-400 font-medium">For Text/Chat:</span>
            <p className="text-gray-400 mt-1">Start with GPT-4 or Claude 3. Free credits available from both.</p>
          </div>
          <div>
            <span className="text-purple-400 font-medium">For Images:</span>
            <p className="text-gray-400 mt-1">DALL-E 3 or Stable Diffusion. Use Replicate for free credits.</p>
          </div>
          <div>
            <span className="text-purple-400 font-medium">For Code:</span>
            <p className="text-gray-400 mt-1">Claude 3 or Codestral. Best at complex coding tasks.</p>
          </div>
        </div>
      </div>
    </div>
  );
}