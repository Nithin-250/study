# 🚀 Quick Start Guide for StudyGenius

## Option 1: Automated Setup (Recommended)

1. **Run the setup script:**
   ```powershell
   .\setup.ps1
   ```

2. **If you get an execution policy error:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\setup.ps1
   ```

## Option 2: Manual Setup

### Step 1: Install Node.js
1. Go to https://nodejs.org
2. Download the LTS version (recommended)
3. Run the installer
4. Restart PowerShell/Command Prompt

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Start Development Server
```powershell
npm run dev
```

### Step 4: Open Your Browser
- Navigate to: http://localhost:5173

## 🔗 MongoDB Connection
Your MongoDB connection is already configured in the `.env` file:
- **Database**: MongoDB Atlas Cluster
- **Connection**: Automatically configured
- **Status**: Ready to use

## 🌟 What You'll See

### 🔐 Login Page
- Beautiful animated background
- "Continue with Google" button
- Professional blue and green design

### 🏠 Main Dashboard
- 3D animated landing page
- Study material input (text/PDF/URL)
- Interactive flashcards with flip animations
- Progress tracking with badges
- Offline quiz mode
- Global leaderboard

### 🎮 Features Available
- ✅ Interactive flashcards (+10 points each)
- ✅ Badge system (Bronze/Silver/Gold)
- ✅ Streak tracking
- ✅ Offline quiz (15 questions)
- ✅ Leaderboard rankings
- ✅ MongoDB integration ready
- ✅ Responsive design
- ✅ 3D animations

## 🔧 Troubleshooting

### "localhost refused to connect"
- Make sure the development server is running (`npm run dev`)
- Check if port 5173 is available
- Try: `npm run dev -- --port 3000` for different port

### Node.js not found
- Install Node.js from https://nodejs.org
- Restart your terminal
- Run `node --version` to verify

### Dependencies issues
```powershell
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

## 📱 Mobile Testing
- The site is fully responsive
- Test on mobile by visiting: `http://your-ip:5173`

## 🔐 Google OAuth Setup (Optional)
1. Go to Google Cloud Console
2. Create OAuth credentials
3. Add your client ID to `.env` file
4. Replace `your_google_client_id` with actual ID

## 🎯 Next Steps
Once running, you can:
1. Sign in (mock authentication works)
2. Try the flashcard system
3. Take the offline quiz
4. Check the leaderboard
5. Test offline functionality (disconnect internet)

---
**Your StudyGenius platform is ready! 🎓✨**
