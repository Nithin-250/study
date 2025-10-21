import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Trophy, 
  Star, 
  Clock, 
  CheckCircle,
  XCircle,
  X,
  WifiOff,
  Zap,
  Target,
  Home,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { offlineAptitudeService, type OfflineAptitudeQuestion } from '@/services/offlineAptitudeService';
import { AnimatedBackground } from './AnimatedBackground';

interface QuickOfflineQuizProps {
  onClose: () => void;
  userId?: string;
}

export const QuickOfflineQuiz: React.FC<QuickOfflineQuizProps> = ({
  onClose,
  userId = 'guest'
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
  const [sessionStartTime] = useState<string>(new Date().toISOString());

  // Load 20 random questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        // Get 20 completely random questions from all categories and difficulties
        const loadedQuestions = await offlineAptitudeService.getMixedQuestions(20);
        
        if (loadedQuestions.length === 0) {
          // Fallback in case no questions are available
          console.warn('No questions available in offline database');
          onClose();
          return;
        }
        
        setQuestions(loadedQuestions);
        setUserAnswers(new Array(loadedQuestions.length).fill(null));
        
        if (loadedQuestions.length > 0) {
          setTimeRemaining(loadedQuestions[0].timeLimit || 30);
          setIsTimerActive(true);
        }
        
      } catch (error) {
        console.error('Error loading quick quiz questions:', error);
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestions();
  }, [onClose]);

  const currentQuestion = questions[currentQuestionIndex];

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
    }, 2000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || !isTimerActive || !currentQuestion) return;
    
    setSelectedAnswer(answerIndex);
    setIsTimerActive(false);
    setShowResult(true);

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
    }, 2500);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setShowResult(false);
      
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
        totalTime: 0,
        completed: true,
        startTime: sessionStartTime,
        endTime: new Date().toISOString()
      });
      console.log('Quick quiz session saved to offline storage');
    } catch (error) {
      console.error('Failed to save quick quiz session:', error);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setShowFinalResults(false);
    setIsLoading(true);
    
    // Load new random questions
    const loadNewQuestions = async () => {
      try {
        const loadedQuestions = await offlineAptitudeService.getMixedQuestions(20);
        setQuestions(loadedQuestions);
        setUserAnswers(new Array(loadedQuestions.length).fill(null));
        
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
    
    loadNewQuestions();
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

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center"
      >
        <AnimatedBackground variant="loading" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10 bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <Brain className="w-16 h-16 text-purple-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Preparing Quick Quiz...</h2>
          <p className="text-gray-600">Loading 20 random questions</p>
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
      </motion.div>
    );
  }

  // Final Results
  if (showFinalResults) {
    const correctAnswers = userAnswers.filter((answer, index) => 
      answer === questions[index]?.correctAnswer
    ).length;
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    const totalPoints = Math.max(0, score);
    
    const getPerformanceLevel = (acc: number) => {
      if (acc >= 90) return { level: 'Exceptional', color: 'text-yellow-600', emoji: '🏆' };
      if (acc >= 80) return { level: 'Excellent', color: 'text-green-600', emoji: '🌟' };
      if (acc >= 70) return { level: 'Good', color: 'text-blue-600', emoji: '👍' };
      if (acc >= 60) return { level: 'Average', color: 'text-orange-600', emoji: '👌' };
      return { level: 'Keep Practicing', color: 'text-red-600', emoji: '📚' };
    };
    
    const performance = getPerformanceLevel(accuracy);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <AnimatedBackground variant="results" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="max-w-2xl w-full relative z-10"
        >
          <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white text-center relative">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="text-4xl mb-3">{performance.emoji}</div>
                  <h1 className="text-3xl font-bold mb-2">Quick Quiz Complete!</h1>
                  <p className="text-xl opacity-90">{performance.level} Performance</p>
                </motion.div>
              </div>
              
              {/* Stats */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center p-3 bg-purple-50 rounded-lg"
                  >
                    <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
                    <div className="text-xs text-gray-600">Final Score</div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
                    <div className="text-xs text-gray-600">Accuracy</div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center p-3 bg-green-50 rounded-lg"
                  >
                    <div className="text-2xl font-bold text-green-600">{correctAnswers}/20</div>
                    <div className="text-xs text-gray-600">Correct</div>
                  </motion.div>
                </div>
                
                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center gap-3"
                >
                  <Button
                    onClick={restartQuiz}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New 20 Questions
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="px-6 py-2"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
    >
      <AnimatedBackground variant="quiz" />
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b shadow-lg relative z-10">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <WifiOff className="w-6 h-6 text-red-500" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Quick Offline Quiz</h1>
                <p className="text-sm text-gray-600">20 random questions • No internet needed</p>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 relative z-10">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-white/95 backdrop-blur-lg shadow-xl border-0">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <Badge className={getTypeColor(currentQuestion.type)}>
                    {getTypeIcon(currentQuestion.type)} {currentQuestion.type.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    Question {currentQuestionIndex + 1} of 20
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-purple-600">
                    <Star className="w-4 h-4" />
                    <span className="font-bold">{score} pts</span>
                  </div>
                  <div className={`flex items-center gap-2 ${
                    timeRemaining <= 10 ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">{timeRemaining}s</span>
                  </div>
                </div>
              </div>
              <Progress value={((currentQuestionIndex + 1) / 20) * 100} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`question-${currentQuestionIndex}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-white/98 backdrop-blur-lg shadow-2xl border-0 min-h-[400px] relative overflow-hidden">
              <CardContent className="p-6">
                {!showResult ? (
                  <>
                    {/* Question */}
                    <div className="text-center mb-6">
                      {currentQuestion.imagePattern && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-5xl mb-4 tracking-wider"
                        >
                          {currentQuestion.imagePattern}
                        </motion.div>
                      )}
                      <h2 className="text-xl font-bold text-gray-800 leading-relaxed">
                        {currentQuestion.question}
                      </h2>
                    </div>

                    {/* Timer Ring */}
                    <div className="flex justify-center mb-6">
                      <motion.div
                        className="relative w-16 h-16"
                        animate={{ scale: timeRemaining <= 5 ? [1, 1.1, 1] : 1 }}
                        transition={{ repeat: timeRemaining <= 5 ? Infinity : 0, duration: 0.5 }}
                      >
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - timeRemaining / currentQuestion.timeLimit)}`}
                            className={timeRemaining <= 5 ? 'text-red-500' : 'text-blue-500'}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-lg font-bold ${timeRemaining <= 5 ? 'text-red-600' : 'text-blue-600'}`}>
                            {timeRemaining}
                          </span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Answer Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentQuestion.options.map((option, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={() => handleAnswerSelect(index)}
                            disabled={selectedAnswer !== null}
                            variant="outline"
                            className="w-full p-4 h-auto text-left border-2 hover:border-purple-300 hover:bg-purple-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
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
                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {selectedAnswer === -1 ? (
                        <div className="text-yellow-600">
                          <Clock className="w-12 h-12 mx-auto mb-3" />
                          <h3 className="text-xl font-bold">Time's Up!</h3>
                        </div>
                      ) : selectedAnswer === currentQuestion.correctAnswer ? (
                        <div className="text-green-600">
                          <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                          <h3 className="text-xl font-bold">Correct!</h3>
                        </div>
                      ) : (
                        <div className="text-red-600">
                          <XCircle className="w-12 h-12 mx-auto mb-3" />
                          <h3 className="text-xl font-bold">Incorrect</h3>
                        </div>
                      )}
                    </motion.div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-700 text-sm">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
