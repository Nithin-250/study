# StudyGenius Backend Setup

## MongoDB Database Schema

### Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  googleId: String, // Google OAuth ID
  email: String,
  name: String,
  avatar: String,
  createdAt: Date,
  lastActive: Date,
  preferences: {
    language: String, // for audio synthesis
    theme: String,
    notifications: Boolean
  }
}
```

#### UserProgress Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users collection
  totalScore: Number,
  currentStreak: Number,
  longestStreak: Number,
  totalAnswered: Number,
  correctAnswers: Number,
  badges: [String], // ["bronze", "silver", "gold"]
  achievements: [{
    name: String,
    unlockedAt: Date,
    description: String
  }],
  studySessions: [{
    topic: String,
    score: Number,
    duration: Number, // in minutes
    completedAt: Date,
    flashcardsStudied: Number
  }],
  updatedAt: Date
}
```

#### StudyMaterials Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  topic: String,
  source: {
    type: String, // "text", "pdf", "url"
    content: String,
    filename: String, // for PDFs
    url: String // for URLs
  },
  flashcards: [{
    question: String,
    answer: String,
    difficulty: Number, // 1-5
    mastered: Boolean,
    timesStudied: Number,
    lastStudied: Date
  }],
  summary: String,
  audioSummaryUrl: String, // URL to generated audio file
  flowchartUrl: String, // URL to generated flowchart image
  createdAt: Date,
  lastAccessedAt: Date
}
```

#### Leaderboard Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  userName: String,
  score: Number,
  badge: String,
  streak: Number,
  totalAnswered: Number,
  accuracy: Number,
  lastActive: Date,
  weeklyScore: Number,
  monthlyScore: Number,
  updatedAt: Date
}
```

#### OfflineQuizzes Collection
```javascript
{
  _id: ObjectId,
  category: String, // "mathematics", "logical-reasoning", etc.
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number, // index of correct option
    difficulty: Number, // 1-5
    explanation: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### SponsorIntegration Collection
```javascript
{
  _id: ObjectId,
  name: String,
  logo: String,
  website: String,
  isActive: Boolean,
  rewards: [{
    title: String,
    description: String,
    requiredScore: Number,
    category: String, // "bronze", "silver", "gold"
    rewardType: String, // "discount", "freebie", "course"
    value: String,
    termsUrl: String
  }],
  analytics: {
    totalUsers: Number,
    totalInteractions: Number,
    conversionRate: Number
  },
  createdAt: Date
}
```

## API Endpoints

### Authentication
- `POST /auth/google` - Google OAuth login
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user info

### Study Materials
- `POST /api/study/generate` - Generate flashcards from text/PDF/URL
- `GET /api/study/materials/:userId` - Get user's study materials
- `PUT /api/study/materials/:id` - Update study material
- `DELETE /api/study/materials/:id` - Delete study material
- `POST /api/study/audio` - Generate audio summary
- `POST /api/study/flowchart` - Generate flowchart

### Progress Tracking
- `GET /api/progress/:userId` - Get user progress
- `PUT /api/progress/:userId` - Update user progress
- `POST /api/progress/session` - Log study session
- `GET /api/progress/badges/:userId` - Get user badges

### Leaderboard
- `GET /api/leaderboard/global` - Get global leaderboard
- `GET /api/leaderboard/weekly` - Get weekly leaderboard
- `GET /api/leaderboard/monthly` - Get monthly leaderboard
- `POST /api/leaderboard/sync` - Sync offline data

### Offline Quiz
- `GET /api/quiz/offline` - Get offline quiz questions
- `POST /api/quiz/submit` - Submit quiz results

### Sponsors
- `GET /api/sponsors` - Get active sponsors
- `GET /api/sponsors/rewards` - Get available rewards
- `POST /api/sponsors/redeem` - Redeem reward

## Environment Variables
```
MONGODB_URI=mongodb://localhost:27017/studygenius
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key (for AI features)
CLOUDINARY_URL=your_cloudinary_url (for file uploads)
```

## Tech Stack
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Google OAuth 2.0 + JWT
- **File Upload**: Cloudinary or AWS S3
- **AI Integration**: OpenAI API for content generation
- **Audio Generation**: Web Speech API (client-side) or Google Text-to-Speech
- **PDF Processing**: PDF.js or similar library
- **Real-time**: Socket.io (for leaderboard updates)

## Deployment
- **Backend**: Railway, Vercel, or AWS
- **Database**: MongoDB Atlas
- **Frontend**: Vercel or Netlify
- **CDN**: Cloudinary for media files

## Security Considerations
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Secure JWT token handling
- File upload restrictions (size, type)
- User data privacy compliance
