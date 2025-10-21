import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  WifiOff, 
  Brain, 
  Target,
  Trophy,
  Clock,
  BookOpen,
  Calculator,
  Eye,
  Lightbulb,
  Sparkles,
  BarChart3,
  Play,
  Home,
  ArrowRight,
  Zap,
  Star,
  Medal,
  CheckCircle
} from 'lucide-react';
import { offlineAptitudeService } from '@/services/offlineAptitudeService';
import { OfflineAptitudeQuiz } from './OfflineAptitudeQuiz';
import { AnimatedBackground } from './AnimatedBackground';
import AnimationManager, { AnimationType } from './animations/AnimationManager';
import { DarkModeToggle } from './DarkModeToggle';

interface OfflineAptitudeSectionProps {
  onBackToHome: () => void;
  userId?: string;
}

interface QuizStats {
  total: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
}

interface QuizOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  category?: string;
  questionCount: number;
  estimatedTime: string;
}

export const OfflineAptitudeSection: React.FC<OfflineAptitudeSectionProps> = ({
  onBackToHome,
  userId = 'guest'
}) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<QuizOption | null>(null);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [showAnimations, setShowAnimations] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationType | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const stats = await offlineAptitudeService.getQuestionStats();
      const history = await offlineAptitudeService.getUserQuizHistory(userId, 5);
      setQuizStats(stats);
      setQuizHistory(history);
    } catch (error) {
      console.error('Error loading offline data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quizOptions: QuizOption[] = [
    {
      id: 'animated-challenge',
      title: '⚡ Quick Animated Challenge',
      description: 'Random animated aptitude problems for instant practice',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      difficulty: 'mixed',
      questionCount: 1,
      estimatedTime: '5-15 min'
    },
    {
      id: 'animated-aptitude',
      title: '🎯 Interactive Animations',
      description: 'Visual aptitude problems with step-by-step animated solutions (Boat/Stream, Time-Distance, etc.)',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'from-indigo-500 to-purple-500',
      difficulty: 'mixed',
      questionCount: 0,
      estimatedTime: 'Variable'
    }
  ];

  const handleQuizStart = (option: QuizOption) => {
    if (option.id === 'animated-aptitude') {
      setShowAnimations(true);
      setSelectedQuizOption(option);
    } else if (option.id === 'animated-challenge') {
      setShowAnimations(true);
      setSelectedQuizOption(option);
    } else {
      setSelectedQuizOption(option);
      setShowQuiz(true);
    }
  };

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    // Add points to user's account
    try {
      const currentUserStr = localStorage.getItem('vidyasetu_current_user');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        const usersStr = localStorage.getItem('vidyasetu_users');
        
        if (usersStr) {
          const users = JSON.parse(usersStr);
          const userIndex = users.findIndex((u: any) => u.email === currentUser.email);
          
          if (userIndex !== -1) {
            // Add quiz points to user's total points
            const pointsToAdd = Math.max(0, score);
            users[userIndex].points = (users[userIndex].points || 0) + pointsToAdd;
            
            // Update localStorage
            localStorage.setItem('vidyasetu_users', JSON.stringify(users));
            localStorage.setItem('vidyasetu_current_user', JSON.stringify(users[userIndex]));
            
            console.log(`✅ Added ${pointsToAdd} points to user account. New total: ${users[userIndex].points}`);
          }
        }
      }
    } catch (error) {
      console.error('Error updating user points:', error);
    }
    
    setShowQuiz(false);
    setSelectedQuizOption(null);
    // Reload history after quiz completion
    await loadData();
  };

  const handleBackFromQuiz = () => {
    setShowQuiz(false);
    setSelectedQuizOption(null);
  };

  const handleBackFromAnimations = () => {
    setShowAnimations(false);
    setSelectedAnimation(null);
  };

  const handleAnimationChange = (animation: AnimationType | null) => {
    setSelectedAnimation(animation);
  };

  // Show animations if selected
  if (showAnimations) {
    return (
      <AnimationManager
        onBackToHome={handleBackFromAnimations}
        selectedAnimation={selectedAnimation}
        onAnimationChange={handleAnimationChange}
        autoSelectRandom={selectedQuizOption?.id === 'animated-challenge'}
      />
    );
  }

  if (showQuiz && selectedQuizOption) {
    return (
      <OfflineAptitudeQuiz
        userId={userId}
        difficulty={selectedQuizOption.difficulty}
        category={selectedQuizOption.category}
        questionCount={selectedQuizOption.questionCount}
        onComplete={handleQuizComplete}
        onBackToHome={handleBackFromQuiz}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <AnimatedBackground variant="loading" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6"
          >
            <Brain className="w-20 h-20 text-purple-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Loading Offline Mode...</h2>
          <p className="text-gray-600">Preparing your aptitude testing environment</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground variant="quiz" />
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="relative"
              >
                <WifiOff className="w-10 h-10 text-red-500" />
                <motion.div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Offline Aptitude Mode</h1>
                <p className="text-gray-600">Complete aptitude testing without internet connection</p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-300">
                <CheckCircle className="w-4 h-4 mr-1" />
                100% Offline Ready
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <Button onClick={onBackToHome} variant="outline" className="bg-white/50 hover:bg-white/70">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Statistics Overview */}
        {quizStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">{quizStats.total}</div>
                <div className="text-gray-600">Questions Available</div>
                <div className="text-sm text-green-600 mt-1 flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  All Offline
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {Object.keys(quizStats.byCategory).length}
                </div>
                <div className="text-gray-600">Categories</div>
                <div className="text-sm text-blue-600 mt-1">Ready to Test</div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {Object.keys(quizStats.byDifficulty).length}
                </div>
                <div className="text-gray-600">Difficulty Levels</div>
                <div className="text-sm text-green-600 mt-1">All Available</div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">{quizHistory.length}</div>
                <div className="text-gray-600">Completed Quizzes</div>
                <div className="text-sm text-orange-600 mt-1">This Session</div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quiz Options */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Target className="w-7 h-7 text-purple-600" />
                Choose Your Challenge
              </h2>
              
              <div className="grid gap-6">
                {quizOptions.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center text-white shadow-lg`}>
                              {option.icon}
                            </div>
                            
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-1">{option.title}</h3>
                              <p className="text-gray-600 mb-2">{option.description}</p>
                              
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-blue-600">
                                  <Target className="w-4 h-4" />
                                  <span>{option.questionCount} Questions</span>
                                </div>
                                <div className="flex items-center gap-1 text-green-600">
                                  <Clock className="w-4 h-4" />
                                  <span>{option.estimatedTime}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              onClick={() => handleQuizStart(option)}
                              size="lg"
                              className={`bg-gradient-to-r ${option.color} hover:shadow-xl`}
                            >
                              <Play className="w-5 h-5 mr-2" />
                              Start
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-purple-700">
                    <Sparkles className="w-6 h-6" />
                    Offline Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Works without internet connection</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Animated questions & feedback</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span>Different questions each time</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span>Detailed performance analytics</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-pink-500 rounded-full" />
                      <span>Smart scoring with time bonuses</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full" />
                      <span>Progress saved locally</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Quiz History */}
            {quizHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Recent Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quizHistory.slice(0, 3).map((quiz, index) => {
                        const accuracy = Math.round((quiz.userAnswers.filter((answer: any, i: any) => 
                          answer === quiz.questions[i]?.correctAnswer
                        ).length / quiz.questions.length) * 100);
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium text-sm">{quiz.questions.length} Questions</div>
                              <div className="text-xs text-gray-500">
                                {new Date(quiz.startTime).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${
                                accuracy >= 80 ? 'text-green-600' : 
                                accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {accuracy}%
                              </div>
                              <div className="text-xs text-gray-500">{quiz.score} pts</div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-blue-700">
                    <Lightbulb className="w-6 h-6" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-blue-700">
                  <div>💡 Read questions carefully before selecting answers</div>
                  <div>⏱️ Time bonuses reward quick thinking</div>
                  <div>🎯 Practice different categories for balanced skills</div>
                  <div>🧠 Use hints when available for tough questions</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
