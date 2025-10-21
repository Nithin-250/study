# VidyaSetu - AI-Powered Learning Platform 🧠✨

A comprehensive educational platform that transforms any topic into interactive flashcards, quizzes, and audio summaries. Built with React, TypeScript, and modern web technologies for an engaging gamified learning experience.

## 🌟 Features

### 🔐 Authentication
- **Supabase powered OAuth Integration** - Secure sign-in with Google
- **User Onboarding** - Personalized welcome experience
- **Profile Management** - User preferences and settings

### 📚 Study Materials
- **Text Input** - Enter any topic or paste study content
- **AI-Generated Flashcards** - Smart question-answer pairs
- **Audio Summaries** - Multi-language text-to-speech 
- **Visual Flowcharts** - Topic visualization

### 🎮 Interactive Learning
- **Flip Card Animations** - Smooth Framer Motion animations
- **Guess & Flip Mechanics** - Engaging interaction patterns
- **Scoring System** - Earn 10 points per correct answer
- **Progress Tracking** - Real-time session progress
- **Reward Animations** - Visual feedback for achievements

### 🏆 Gamification
- **Streak Tracking** - Daily learning streaks with "7-Day Streak!" rewards
- **Points & Achievements** - Comprehensive progression system
- **Leaderboard** - Global, weekly, and monthly rankings
- **Sponsor Integration** - Rewards for top performers

### 📱 Offline Capabilities
- **IndexedDB Storage** - Local data persistence
- **Offline Quiz Mode** - Aptitude questions with animations
- **Question Shuffling** - Dynamic content variety
- **Sync on Reconnect** - Seamless online/offline transitions
- **Connection Status** - Real-time connectivity monitoring

### 🎨 Design System
- **Growth & Trust Theme** - Professional + inspiring design
- **Primary Color**: #2563EB (Bright Blue) - Trust & guidance
- **Secondary Color**: #16A34A (Green) - Growth & success  
- **Accent Color**: #FACC15 (Yellow) - Optimism & energy
- **3D Visual Effects** - Card animations, floating elements
- **Responsive Design** - Mobile-first approach

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Nithin-250/study-spark-guru-17.git
cd study-spark-guru-17

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Shadcn/UI** - Component library
- **React Query** - Server state management
- **Sonner** - Toast notifications

### Storage & Offline
- **IndexedDB** - Browser database
- **Local Storage** - Session persistence
- **Service Workers** - Offline functionality (planned)

## 🎯 Usage Guide

### Getting Started
1. **Sign In** - Use "Continue with Google" button
2. **Onboarding** - Complete your profile setup
3. **Study Input** - Enter a topic, paste content, or upload PDF
4. **Learn** - Study generated flashcards with flip animations
5. **Quiz** - Test knowledge with interactive questions
6. **Compete** - Check your rank on the leaderboard

### Offline Mode
1. **Connection Lost** - App automatically switches to offline mode
2. **Offline Quiz** - Practice aptitude questions with timer
3. **Local Storage** - Progress saved locally
4. **Auto Sync** - Data syncs when reconnected

### Badges & Achievements
- **Bronze Badge**: Master 10 flashcards
- **Silver Badge**: Master 25 flashcards  
- **Gold Badge**: Master 50+ flashcards
- **Streak Rewards**: "7-Day Streak!" and more
- **Leaderboard**: Compete globally, weekly, monthly

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Build variants
npm run build:dev    # Development build
```

## 🚀 Deployment

### Frontend Deployment

**Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Netlify**
```bash
# Build command: npm run build
# Publish directory: dist
```

### Backend Deployment
See `backend-setup.md` for detailed backend configuration and MongoDB schema.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core flashcard system
- ✅ Offline quiz functionality
- ✅ Leaderboard & gamification
- ✅ Basic audio synthesis

### Phase 2 (Next)
- 🔄 AI-powered content generation
- 🔄 Advanced audio features (Hindi support)
- 🔄 PDF processing improvements
- 🔄 Sponsor integration

### Phase 3 (Future)
- 📋 Flowchart generation
- 📋 Advanced analytics
- 📋 Social features
- 📋 Mobile app (React Native)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/UI** - Beautiful component library
- **Framer Motion** - Smooth animations
- **Tailwind CSS** - Utility-first styling
- **Lovable** - Development platform
- **Google** - OAuth & Cloud services

---

**StudyGenius** - Transform learning into an engaging, gamified experience! 🎓✨
