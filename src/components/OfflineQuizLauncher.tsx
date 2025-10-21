import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Brain, 
  WifiOff, 
  Play,
  Target,
  Trophy,
  Clock,
  BookOpen,
  Calculator,
  Eye,
  Lightbulb,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { offlineAptitudeService } from '@/services/offlineAptitudeService';
import { OfflineAptitudeQuiz } from './OfflineAptitudeQuiz';
import { AnimatedBackground } from './AnimatedBackground';

interface OfflineQuizLauncherProps {
  userId?: string;
  onComplete?: (score: number, totalQuestions: number) => void;
  onBackToHome?: () => void;
}

interface QuizStats {
  total: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
}

export const OfflineQuizLauncher: React.FC<OfflineQuizLauncherProps> = ({
  userId = 'guest',
  onComplete,
  onBackToHome
}) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [questionCount, setQuestionCount] = useState([10]);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuizStats();
  }, []);

  const loadQuizStats = async () => {
    try {
      const stats = await offlineAptitudeService.getQuestionStats();
      setQuizStats(stats);
    } catch (error) {
      console.error('Error loading quiz stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    setShowQuiz(false);
    if (onComplete) {
      onComplete(score, totalQuestions);
    }
  };

  const handleBackFromQuiz = () => {
    setShowQuiz(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reasoning': return <Brain className="w-5 h-5" />;
      case 'quantitative': return <Calculator className="w-5 h-5" />;
      case 'english': return <BookOpen className="w-5 h-5" />;
      case 'general_knowledge': return <Lightbulb className="w-5 h-5" />;
      case 'data_interpretation': return <BarChart3 className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      case 'mixed': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (showQuiz) {
    return (
      <OfflineAptitudeQuiz
        userId={userId}
        difficulty={selectedDifficulty}
        category={selectedCategory || undefined}
        questionCount={questionCount[0]}
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
            className="w-16 h-16 mx-auto mb-6"
          >
            <Brain className="w-16 h-16 text-purple-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Quiz Database...</h2>
          <p className="text-gray-600">Preparing offline aptitude questions</p>
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
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="relative"
              >
                <WifiOff className="w-8 h-8 text-red-500" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Offline Aptitude Quiz</h1>
                <p className="text-gray-600">Challenge yourself without internet!</p>
              </div>
            </div>
            {onBackToHome && (
              <Button onClick={onBackToHome} variant="outline" className="bg-white/50 hover:bg-white/70">
                Back to Home
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Quiz Statistics */}
        {quizStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{quizStats.total}</div>
                <div className="text-gray-600">Total Questions</div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Object.keys(quizStats.byCategory).length}
                </div>
                <div className="text-gray-600">Categories</div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Object.keys(quizStats.byDifficulty).length}
                </div>
                <div className="text-gray-600">Difficulty Levels</div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
                <div className="text-gray-600">Offline Ready</div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Configuration */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-purple-600" />
                  Quiz Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Difficulty Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Difficulty Level</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['easy', 'medium', 'hard', 'mixed'] as const).map((difficulty) => (
                      <motion.button
                        key={difficulty}
                        onClick={() => setSelectedDifficulty(difficulty)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedDifficulty === difficulty
                            ? getDifficultyColor(difficulty) + ' border-current'
                            : 'bg-white hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="font-medium capitalize">{difficulty}</div>
                        {quizStats && (
                          <div className="text-xs text-gray-500">
                            {difficulty === 'mixed' 
                              ? 'All levels' 
                              : `${quizStats.byDifficulty[difficulty] || 0} questions`
                            }
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Category (Optional)</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="All Categories (Mixed)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {quizStats && Object.entries(quizStats.byCategory).map(([category, count]) => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            <span className="capitalize">
                              {category.replace('_', ' ')} ({count})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Count */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Number of Questions</label>
                    <Badge variant="outline">{questionCount[0]} questions</Badge>
                  </div>
                  <Slider
                    value={questionCount}
                    onValueChange={setQuestionCount}
                    min={5}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>5 min</span>
                    <span>20 max</span>
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Estimated Time</span>
                  </div>
                  <div className="text-blue-600 mt-1">
                    {Math.ceil(questionCount[0] * 1.5)} - {Math.ceil(questionCount[0] * 2)} minutes
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview & Launch */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Quiz Preview */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-purple-700">
                  <Eye className="w-6 h-6" />
                  Quiz Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <Badge className={getDifficultyColor(selectedDifficulty)}>
                    {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category:</span>
                  <div className="flex items-center gap-2">
                    {selectedCategory ? getCategoryIcon(selectedCategory) : <Sparkles className="w-4 h-4" />}
                    <span className="capitalize">
                      {selectedCategory ? selectedCategory.replace('_', ' ') : 'Mixed Categories'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium">{questionCount[0]}</span>
                </div>

                <div className="pt-4 border-t border-purple-200">
                  <div className="flex items-center gap-2 text-purple-700 mb-2">
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">Scoring</span>
                  </div>
                  <div className="text-sm text-purple-600 space-y-1">
                    <div>• Correct answers: Base points + Time bonus</div>
                    <div>• Wrong answers: -25% penalty</div>
                    <div>• Timeout: -20% penalty</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Launch Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleStartQuiz}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-xl font-bold shadow-2xl"
              >
                <Play className="w-6 h-6 mr-3" />
                Start Quiz Challenge
                <Sparkles className="w-5 h-5 ml-3" />
              </Button>
            </motion.div>

            {/* Features List */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Quiz Features</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Works completely offline</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Animated questions & feedback</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span>Hints for challenging questions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span>Detailed performance breakdown</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    <span>Time-based scoring system</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
