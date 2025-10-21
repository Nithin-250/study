import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Trophy, 
  Star, 
  Clock, 
  Zap,
  CheckCircle,
  XCircle,
  RotateCcw,
  WifiOff,
  Target,
  Medal,
  Lightbulb,
  Eye,
  Calculator,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { offlineAptitudeService, type OfflineAptitudeQuestion } from '@/services/offlineAptitudeService';
import { AnimatedBackground } from './AnimatedBackground';

interface OfflineAptitudeQuizProps {
  onComplete: (score: number, totalQuestions: number) => void;
  onBackToHome: () => void;
  userId?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  category?: string;
  questionCount?: number;
}

export const OfflineAptitudeQuiz: React.FC<OfflineAptitudeQuizProps> = ({
  onComplete,
  onBackToHome,
  userId = 'guest',
  difficulty = 'mixed',
  category,
  questionCount = 10
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [questions, setQuestions] = useState<OfflineAptitudeQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<string>('');

  // Load questions from offline service
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        let loadedQuestions: OfflineAptitudeQuestion[];
        
        if (category) {
          loadedQuestions = await offlineAptitudeService.getQuestionsByCategory(
            category, 
            difficulty === 'mixed' ? undefined : difficulty, 
            questionCount
          );
        } else if (difficulty === 'mixed') {
          loadedQuestions = await offlineAptitudeService.getMixedQuestions(questionCount);
        } else {
          loadedQuestions = await offlineAptitudeService.getRandomQuestions(
            questionCount, 
            difficulty
          );
        }
        
        setQuestions(loadedQuestions);
        setUserAnswers(new Array(loadedQuestions.length).fill(null));
        setSessionStartTime(new Date().toISOString());
        
        if (loadedQuestions.length > 0) {
          setTimeRemaining(loadedQuestions[0].timeLimit || 30);
          setIsTimerActive(true);
        }
        
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestions();
  }, [category, difficulty, questionCount]);

  const currentQuestion = questions[currentQuestionIndex];
  
  // Loading state
  if (isLoading || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <Brain className="w-16 h-16 text-purple-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Aptitude Questions...</h2>
          <p className="text-gray-600">Preparing your personalized quiz experience</p>
          <motion.div 
            className="mt-4 flex justify-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-purple-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Timer logic
  useEffect(() => {
    if (!isTimerActive || showResult || showFinalResults || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, isTimerActive, showResult, showFinalResults, currentQuestion]);

  const handleTimeUp = () => {
    if (!currentQuestion) return;
    
    setIsTimerActive(false);
    setSelectedAnswer(-1); // -1 indicates timeout
    setShowResult(true);
    
    // Record timeout in user answers
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = -1;
    setUserAnswers(newAnswers);
    
    // Penalty for timeout
    setScore(prev => prev - Math.floor(currentQuestion.points * 0.2));
    
    // Auto advance after showing timeout message
    setTimeout(() => {
      nextQuestion();
    }, 2500);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || !isTimerActive || !currentQuestion) return;
    
    setSelectedAnswer(answerIndex);
    setIsTimerActive(false);
    setShowResult(true);
    setShowHint(false);

    // Record answer
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);

    // Calculate time-based points
    const timeBonusRatio = timeRemaining / currentQuestion.timeLimit;
    const timeBonus = Math.max(0, Math.floor(timeBonusRatio * currentQuestion.points * 0.3));
    const basePoints = currentQuestion.points;
    
    let totalPoints = 0;
    if (answerIndex === currentQuestion.correctAnswer) {
      totalPoints = basePoints + timeBonus;
    } else {
      totalPoints = -Math.floor(basePoints * 0.25); // 25% penalty for wrong answers
    }

    setScore(prev => prev + totalPoints);

    // Auto advance after showing result
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
      
      // Set time limit for next question
      const nextQuestion = questions[nextIndex];
      if (nextQuestion) {
        setTimeRemaining(nextQuestion.timeLimit);
        setIsTimerActive(true);
      }
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    setShowFinalResults(true);
    setIsTimerActive(false);
    
    // Save quiz session to offline storage
    try {
      await offlineAptitudeService.saveQuizSession({
        userId,
        questions,
        userAnswers,
        score,
        totalTime: 0, // Calculate if needed
        completed: true,
        startTime: sessionStartTime,
        endTime: new Date().toISOString()
      });
      console.log('Quiz session saved to offline storage');
    } catch (error) {
      console.error('Failed to save quiz session:', error);
    }
    
    onComplete(score, questions.length);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
    setScore(0);
    setShowFinalResults(false);
    
    // Restart with new questions
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        let loadedQuestions: OfflineAptitudeQuestion[];
        
        if (category) {
          loadedQuestions = await offlineAptitudeService.getQuestionsByCategory(
            category, 
            difficulty === 'mixed' ? undefined : difficulty, 
            questionCount
          );
        } else if (difficulty === 'mixed') {
          loadedQuestions = await offlineAptitudeService.getMixedQuestions(questionCount);
        } else {
          loadedQuestions = await offlineAptitudeService.getRandomQuestions(
            questionCount, 
            difficulty
          );
        }
        
        setQuestions(loadedQuestions);
        setUserAnswers(new Array(loadedQuestions.length).fill(null));
        setSessionStartTime(new Date().toISOString());
        
        if (loadedQuestions.length > 0) {
          setTimeRemaining(loadedQuestions[0].timeLimit || 30);
          setIsTimerActive(true);
        }
        
      } catch (error) {
        console.error('Error reloading questions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestions();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visual': return '👁️';
      case 'logical': return '🧠';
      case 'numerical': return '🔢';
      case 'verbal': return '📝';
      case 'pattern': return '🔄';
      case 'spatial': return '📐';
      default: return '❓';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'visual': return 'bg-purple-100 text-purple-800';
      case 'logical': return 'bg-blue-100 text-blue-800';
      case 'numerical': return 'bg-green-100 text-green-800';
      case 'verbal': return 'bg-orange-100 text-orange-800';
      case 'pattern': return 'bg-pink-100 text-pink-800';
      case 'spatial': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const showHintHandler = () => {
    if (currentQuestion?.hints && currentQuestion.hints.length > 0) {
      setShowHint(true);
    }
  };

  if (showFinalResults) {
    const correctAnswers = userAnswers.filter((answer, index) => 
      answer === questions[index]?.correctAnswer
    ).length;
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    const totalPoints = Math.max(0, score);
    const averageTimePerQuestion = questions.reduce((sum, q) => sum + q.timeLimit, 0) / questions.length;
    
    // Calculate performance level
    const getPerformanceLevel = (acc: number, points: number) => {
      if (acc >= 90 && points >= totalPoints * 0.8) return { level: 'Exceptional', color: 'text-yellow-600', emoji: '🏆' };
      if (acc >= 80 && points >= totalPoints * 0.7) return { level: 'Excellent', color: 'text-green-600', emoji: '🌟' };
      if (acc >= 70 && points >= totalPoints * 0.6) return { level: 'Good', color: 'text-blue-600', emoji: '👍' };
      if (acc >= 60) return { level: 'Average', color: 'text-orange-600', emoji: '👌' };
      return { level: 'Needs Improvement', color: 'text-red-600', emoji: '📚' };
    };
    
    const performance = getPerformanceLevel(accuracy, totalPoints);

    return (
      <div className="min-h-screen relative flex items-center justify-center p-6">
        <AnimatedBackground variant="results" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="max-w-4xl w-full relative z-10"
        >
          <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-0">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                  className="mb-4"
                >
                  <div className="text-6xl mb-4">{performance.emoji}</div>
                  <h1 className="text-4xl font-bold mb-2">Quiz Complete!</h1>
                  <p className="text-xl opacity-90">
                    {performance.level} Performance
                  </p>
                </motion.div>
              </div>
              
              {/* Stats Section */}
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center p-4 bg-purple-50 rounded-lg"
                  >
                    <div className="text-3xl font-bold text-purple-600 mb-2">{totalPoints}</div>
                    <div className="text-sm text-gray-600">Final Score</div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center p-4 bg-blue-50 rounded-lg"
                  >
                    <div className="text-3xl font-bold text-blue-600 mb-2">{accuracy}%</div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-center p-4 bg-green-50 rounded-lg"
                  >
                    <div className="text-3xl font-bold text-green-600 mb-2">{correctAnswers}</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-center p-4 bg-orange-50 rounded-lg"
                  >
                    <div className="text-3xl font-bold text-orange-600 mb-2">{questions.length}</div>
                    <div className="text-sm text-gray-600">Total Questions</div>
                  </motion.div>
                </div>
                
                {/* Performance Breakdown */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mb-8"
                >
                  <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
                    Question Breakdown
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {questions.map((question, index) => {
                      const userAnswer = userAnswers[index];
                      const isCorrect = userAnswer === question.correctAnswer;
                      const isTimeout = userAnswer === -1;
                      
                      return (
                        <motion.div
                          key={question.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + index * 0.1 }}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isCorrect ? 'bg-green-50 border border-green-200' : 
                            isTimeout ? 'bg-yellow-50 border border-yellow-200' : 
                            'bg-red-50 border border-red-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                              isCorrect ? 'bg-green-500 text-white' :
                              isTimeout ? 'bg-yellow-500 text-white' :
                              'bg-red-500 text-white'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 text-sm">
                                {question.type.charAt(0).toUpperCase() + question.type.slice(1)} Question
                              </div>
                              <div className={`text-xs ${
                                question.difficulty === 'easy' ? 'text-green-600' :
                                question.difficulty === 'medium' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)} • {question.points} pts
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${
                              isCorrect ? 'text-green-600' :
                              isTimeout ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {isCorrect ? '✓' : isTimeout ? '⏱️' : '✗'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {isTimeout ? 'Timeout' : isCorrect ? 'Correct' : 'Wrong'}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
                
                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex justify-center gap-4"
                >
                  <Button
                    onClick={resetQuiz}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 transform hover:scale-105 transition-all duration-200"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Challenge
                  </Button>
                  <Button
                    onClick={onBackToHome}
                    variant="outline"
                    className="px-8 py-3 transform hover:scale-105 transition-all duration-200"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
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
                <h1 className="text-2xl font-bold text-gray-800">Offline Aptitude Challenge</h1>
                <p className="text-gray-600">Test your skills without internet!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white/50">
                {difficulty === 'mixed' ? 'Mixed Level' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
              <Button onClick={onBackToHome} variant="outline" size="sm" className="bg-white/50 hover:bg-white/70">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 relative z-10">
        {/* Progress Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <Badge className={`${getTypeColor(currentQuestion.type)} relative overflow-hidden`}>
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      />
                      {getTypeIcon(currentQuestion.type)} {currentQuestion.type.toUpperCase()}
                    </Badge>
                  </motion.div>
                  <Badge variant="outline" className="bg-white/70">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`${
                      currentQuestion.difficulty === 'easy' ? 'border-green-300 text-green-700 bg-green-50' :
                      currentQuestion.difficulty === 'medium' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                      'border-red-300 text-red-700 bg-red-50'
                    }`}
                  >
                    {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="flex items-center gap-2 text-purple-600"
                    animate={{ scale: score > 0 ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Star className="w-4 h-4" />
                    <span className="font-bold">{score} pts</span>
                  </motion.div>
                  <motion.div 
                    className={`flex items-center gap-2 ${
                      timeRemaining <= 10 ? 'text-red-600' : 
                      timeRemaining <= 20 ? 'text-yellow-600' : 'text-blue-600'
                    }`}
                    animate={timeRemaining <= 5 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: timeRemaining <= 5 ? Infinity : 0 }}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">{timeRemaining}s</span>
                  </motion.div>
                  {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                    <Button
                      onClick={showHintHandler}
                      variant="outline"
                      size="sm"
                      className="bg-white/70 hover:bg-white/90"
                      disabled={showHint}
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      Hint
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Progress 
                  value={((currentQuestionIndex + 1) / questions.length) * 100} 
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress: {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
                  <span>{currentQuestion.points} points available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hint Display */}
        {showHint && currentQuestion.hints && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="bg-yellow-50/90 backdrop-blur-sm border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">Hint:</h3>
                    <div className="space-y-1">
                      {currentQuestion.hints.map((hint, index) => (
                        <motion.p
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="text-yellow-700 text-sm"
                        >
                          • {hint}
                        </motion.p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`question-${currentQuestionIndex}-${selectedAnswer}`}
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -50, rotateY: 10 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <Card className="bg-white/98 backdrop-blur-lg shadow-2xl border-0 min-h-[600px] overflow-hidden relative">
              {/* Card Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    radial-gradient(circle at 25% 25%, ${currentQuestion.type === 'visual' ? '#8B5CF6' : 
                                                         currentQuestion.type === 'logical' ? '#3B82F6' :
                                                         currentQuestion.type === 'numerical' ? '#10B981' :
                                                         currentQuestion.type === 'spatial' ? '#6366F1' :
                                                         '#F59E0B'} 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, ${currentQuestion.type === 'visual' ? '#EC4899' : 
                                                         currentQuestion.type === 'logical' ? '#06B6D4' :
                                                         currentQuestion.type === 'numerical' ? '#84CC16' :
                                                         currentQuestion.type === 'spatial' ? '#8B5CF6' :
                                                         '#EF4444'} 0%, transparent 50%)
                  `,
                  backgroundSize: '200px 200px'
                }} />
              </div>
              
              <CardContent className="p-8 relative z-10">
                {!showResult ? (
                  <>
                    {/* Question Header */}
                    <div className="text-center mb-8">
                      {currentQuestion.imagePattern && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="text-6xl md:text-7xl mb-6 tracking-wider font-mono bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                        >
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            {currentQuestion.imagePattern}
                          </motion.div>
                        </motion.div>
                      )}
                      <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl md:text-3xl font-bold text-gray-800 leading-relaxed mb-4"
                      >
                        {currentQuestion.question}
                      </motion.h2>
                      {currentQuestion.type === 'spatial' && currentQuestion.imagePattern && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="bg-gray-100 p-4 rounded-lg font-mono text-sm whitespace-pre-line text-gray-700 max-w-sm mx-auto"
                        >
                          {currentQuestion.imagePattern}
                        </motion.div>
                      )}
                    </div>

                    {/* Timer Ring */}
                    <div className="flex justify-center mb-8">
                      <motion.div
                        className="relative w-20 h-20"
                        animate={{ scale: timeRemaining <= 5 ? [1, 1.1, 1] : 1 }}
                        transition={{ repeat: timeRemaining <= 5 ? Infinity : 0, duration: 0.5 }}
                      >
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 36}`}
                            strokeDashoffset={`${2 * Math.PI * 36 * (1 - timeRemaining / 15)}`}
                            className={timeRemaining <= 5 ? 'text-red-500' : 'text-blue-500'}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-xl font-bold ${timeRemaining <= 5 ? 'text-red-600' : 'text-blue-600'}`}>
                            {timeRemaining}
                          </span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Answer Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentQuestion.options.map((option, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={() => handleAnswerSelect(index)}
                            disabled={selectedAnswer !== null}
                            variant="outline"
                            className="w-full p-6 h-auto text-left border-2 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-base"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span>{option}</span>
                            </div>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Result Display */
                  <div className="text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {selectedAnswer === -1 ? (
                        <div className="text-yellow-600">
                          <Clock className="w-16 h-16 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold">Time's Up!</h3>
                          <p className="text-gray-600">No points awarded</p>
                        </div>
                      ) : selectedAnswer === currentQuestion.correctAnswer ? (
                        <div className="text-green-600">
                          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold">Correct!</h3>
                          <p className="text-gray-600">
                            +{currentQuestion.points + Math.floor((timeRemaining / 15) * 50)} points
                            {timeRemaining > 10 && <span className="text-purple-600"> (Speed bonus!)</span>}
                          </p>
                        </div>
                      ) : (
                        <div className="text-red-600">
                          <XCircle className="w-16 h-16 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold">Incorrect</h3>
                          <p className="text-gray-600">
                            -{Math.floor(currentQuestion.points * 0.3)} points
                          </p>
                        </div>
                      )}
                    </motion.div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
                      <p className="text-blue-700">{currentQuestion.explanation}</p>
                    </div>

                    {selectedAnswer !== -1 && (
                      <div className="text-gray-500 text-sm">
                        Next question coming up...
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
