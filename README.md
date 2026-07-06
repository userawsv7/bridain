# 🧠 Bridain - Play While You Learn

AI-Powered Learning Simulator for DevOps, AI, MLOps, Testing & More!

## ✨ Features

### 🎮 Interactive Simulations
- **Real-world scenarios** with multiple choice options
- **Instant feedback** with explanations and pro tips
- **Progress tracking** and scoring system
- Covers: Docker, Kubernetes, CI/CD, MLOps, API testing, and more!

### 🎙️ AI Voice Coach
- **Interactive chat** with your personal learning mentor
- **Voice input support** - speak your questions!
- **Text-to-speech** to listen to explanations
- Encouraging messages and personalized guidance

### 📄 Resume Builder
- **Professional resume** creation tool
- Add experiences, certifications, and skills
- One-click download in text format
- AI-guided tips for improvement

### 🎁 Curated Resources
- **Free learning paths** for all skills
- **Official certification** guides
- **Community recommendations** and pro tips
- Organized by skill area (DevOps, MLOps, Testing, etc.)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and add your API keys
cp .env.local.example .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔑 API Setup (Optional but Powerful!)

The app works **without API keys** using smart fallbacks! But for AI-powered responses:

### Option 1: Groq (Recommended - Fastest)
1. Go to [console.groq.com](https://console.groq.com/keys)
2. Sign up (free tier available)
3. Create new API key
4. Add to `.env.local`: `GROQ_API_KEY=gsk_...`

### Option 2: Hugging Face (Free Tier)
1. Visit [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. **Choose token type: "Read"** (for API access)
3. Generate new token
4. Add to `.env.local`: `HUGGINGFACE_API_KEY=hf_...`

### Option 3: OpenRouter (Multiple Free Models)
1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Create free account
3. Generate API key
4. Add: `OPENROUTER_API_KEY=sk-or-...`

### Option 4: Together AI
1. Sign up at [api.together.xyz](https://api.together.xyz)
2. Get free credits on signup
3. Add: `TOGETHER_API_KEY=...`

**💡 Pro tip:** Groq gives you **instant responses** with their lightning-fast inference!

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Beautiful styling
- **Framer Motion** - Smooth animations
- **Lucide Icons** - Beautiful iconography

## 🎯 Learning Path

1. **Start with Simulations** - Practice real scenarios
2. **Chat with AI Coach** - Get personalized help
3. **Build Your Resume** - Showcase your skills
4. **Explore Resources** - Deep dive into topics
5. **Get Certified** - Validate your expertise!

## 🌟 Why Bridain?

- **Learn by doing** - No boring lectures
- **Interview ready** - Practice real scenarios
- **Fun & engaging** - Gamified learning experience
- **Always free** - Quality education for everyone
- **Voice enabled** - Learn hands-free

## 📝 Deployment

This app is ready for Vercel deployment:

1. Push to GitHub
2. Import to Vercel
3. Deploy automatically!

## 🤝 Contributing

Feel free to add more scenarios, improve the UI, or enhance the learning experience!

---

Made with ❤️ for learners everywhere. Practice makes perfect, play makes it fun! 🎮✨