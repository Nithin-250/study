# Offline Aptitude Quiz Integration Guide

This guide shows how to integrate the enhanced offline aptitude quiz into your existing VidyaSetu application.

## Files Added

1. **`/src/services/offlineAptitudeService.ts`** - Manages offline aptitude questions using IndexedDB
2. **`/src/components/AnimatedBackground.tsx`** - Animated background component for visual appeal
3. **`/src/components/OfflineAptitudeQuiz.tsx`** - Enhanced main quiz component with animations
4. **`/src/components/OfflineQuizLauncher.tsx`** - Quiz launcher with configuration options

## Integration Steps

### Step 1: Add to Your Main App Router

In your `App.tsx` or routing component, add the offline quiz option:

```typescript
import { OfflineQuizLauncher } from '@/components/OfflineQuizLauncher';

// Add to your app state
const [appMode, setAppMode] = useState<'auth' | 'home' | 'study' | 'learning' | 'quiz' | 'offline-quiz'>('auth');

// Add this case to your app mode rendering logic
if (appMode === 'offline-quiz') {
  return (
    <OfflineQuizLauncher
      userId={user?._id}
      onComplete={(score, totalQuestions) => {
        console.log(`Quiz completed! Score: ${score}/${totalQuestions}`);
        // Update user progress, save to database, etc.
        setAppMode('home');
      }}
      onBackToHome={() => setAppMode('home')}
    />
  );
}
```

### Step 2: Add Offline Quiz Button to Home Page

In your home page component, add a button to launch the offline quiz:

```typescript
// In your home page JSX, add this button
<Button
  onClick={() => setAppMode('offline-quiz')}
  size="lg"
  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-6 text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
>
  <WifiOff className="w-6 h-6 mr-3" />
  Offline Aptitude Quiz
  <Badge className="ml-3 bg-white/20">New!</Badge>
</Button>
```

### Step 3: Add Network Detection (Optional)

Add network status detection to automatically show offline features:

```typescript
// Add to your App.tsx state
const [isOnline, setIsOnline] = useState(navigator.onLine);

// Add network detection effect
useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

// Show offline quiz option when offline
{!isOnline && (
  <Card className="p-6 bg-red-50 border-red-200">
    <h3 className="font-bold text-red-800 mb-2">You're Offline!</h3>
    <p className="text-red-600 mb-4">But you can still practice with our offline aptitude quiz.</p>
    <Button 
      onClick={() => setAppMode('offline-quiz')}
      className="bg-red-600 hover:bg-red-700"
    >
      <WifiOff className="w-4 h-4 mr-2" />
      Start Offline Quiz
    </Button>
  </Card>
)}
```

## Features

### ✅ **Fully Offline Capable**
- All questions stored in IndexedDB
- No internet connection required
- Persistent local storage

### ✅ **Rich Question Types**
- Visual pattern recognition
- Logical reasoning
- Numerical sequences
- Verbal analogies
- Spatial reasoning
- Data interpretation

### ✅ **Advanced Animations**
- Animated backgrounds with particles
- Smooth question transitions
- Interactive feedback animations
- Celebration effects for results

### ✅ **Smart Scoring System**
- Base points for correct answers
- Time-based bonus points
- Penalty system for wrong answers
- Timeout penalties

### ✅ **User Experience Features**
- Hints for difficult questions
- Detailed progress tracking
- Performance breakdown
- Question difficulty indicators

### ✅ **Customization Options**
- Choose difficulty levels
- Select specific categories
- Adjust question count (5-20)
- Mixed difficulty mode

## Database Schema

The offline service automatically creates these IndexedDB tables:

```typescript
// Questions table
interface OfflineAptitudeQuestion {
  id: string;
  question: string;
  type: 'visual' | 'logical' | 'numerical' | 'verbal' | 'pattern' | 'spatial';
  category: 'reasoning' | 'quantitative' | 'english' | 'general_knowledge' | 'data_interpretation';
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imagePattern?: string;
  points: number;
  timeLimit: number;
  hints?: string[];
  tags: string[];
}

// Quiz sessions table
interface QuizSession {
  id?: number;
  userId: string;
  questions: OfflineAptitudeQuestion[];
  userAnswers: (number | null)[];
  score: number;
  totalTime: number;
  completed: boolean;
  startTime: string;
  endTime?: string;
}
```

## Usage Examples

### Basic Integration
```typescript
import { OfflineQuizLauncher } from '@/components/OfflineQuizLauncher';

<OfflineQuizLauncher 
  userId="user123"
  onComplete={(score, total) => console.log(`Score: ${score}/${total}`)}
  onBackToHome={() => navigateToHome()}
/>
```

### Direct Quiz (Skip Launcher)
```typescript
import { OfflineAptitudeQuiz } from '@/components/OfflineAptitudeQuiz';

<OfflineAptitudeQuiz
  userId="user123"
  difficulty="mixed"
  questionCount={10}
  onComplete={(score, total) => handleQuizComplete(score, total)}
  onBackToHome={() => navigateToHome()}
/>
```

### Check Available Questions
```typescript
import { offlineAptitudeService } from '@/services/offlineAptitudeService';

// Get statistics
const stats = await offlineAptitudeService.getQuestionStats();
console.log(`Total questions: ${stats.total}`);

// Get specific questions
const reasoningQuestions = await offlineAptitudeService.getQuestionsByCategory('reasoning', 'medium', 5);
const mixedQuestions = await offlineAptitudeService.getMixedQuestions(10);
```

## Performance Notes

- **Initial Load**: ~50KB for question database
- **Memory Usage**: Minimal, IndexedDB handles storage
- **Animations**: Optimized with Framer Motion
- **Responsive**: Works on all screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Browser Support

- ✅ Chrome 58+
- ✅ Firefox 55+
- ✅ Safari 10+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Next Steps

1. **Add More Questions**: Extend the question database in `offlineAptitudeService.ts`
2. **Custom Themes**: Modify `AnimatedBackground.tsx` for different visual themes
3. **Analytics**: Track user performance and question difficulty
4. **Gamification**: Add achievements, streaks, and leaderboards
5. **Export Results**: Allow users to download their quiz results

The offline aptitude quiz is now ready to be integrated into your VidyaSetu application!
