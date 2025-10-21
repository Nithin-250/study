import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, Zap, Target, Eye, Sparkles, TrendingUp, Calculator, ArrowRight } from 'lucide-react';

interface NumberSeriesStep {
  number: number;
  operation: string;
  explanation: string;
  difference?: number;
  pattern?: string;
}

interface NumberSeriesProps {
  title: string;
  description: string;
  series: number[];
  missingIndex: number;
  answer: number;
  pattern: string;
  steps: NumberSeriesStep[];
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete?: (correct: boolean) => void;
}

export const NumberSeriesAnimation: React.FC<NumberSeriesProps> = ({
  title,
  description,
  series,
  missingIndex,
  answer,
  pattern,
  steps,
  difficulty,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [revealedNumbers, setRevealedNumbers] = useState<boolean[]>(new Array(series.length).fill(false));
  const [showPattern, setShowPattern] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Initialize with first number revealed
  useEffect(() => {
    const initialRevealed = new Array(series.length).fill(false);
    initialRevealed[0] = true;
    setRevealedNumbers(initialRevealed);
  }, [series.length]);

  const startAnimation = () => {
    setIsPlaying(true);
    setCurrentStep(-1);
    setShowPattern(false);
    setShowAnswer(false);
    setUserAnswer('');
    
    const initialRevealed = new Array(series.length).fill(false);
    initialRevealed[0] = true;
    setRevealedNumbers(initialRevealed);
    setAnimationKey(prev => prev + 1);

    // Reveal numbers step by step
    steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
        setRevealedNumbers(prev => {
          const newRevealed = [...prev];
          if (index + 1 < series.length && index + 1 !== missingIndex) {
            newRevealed[index + 1] = true;
          }
          return newRevealed;
        });

        if (index === steps.length - 1) {
          setTimeout(() => {
            setShowPattern(true);
            setIsPlaying(false);
          }, 1500);
        }
      }, (index + 1) * 2000);
    });
  };

  const resetAnimation = () => {
    setCurrentStep(-1);
    setShowPattern(false);
    setShowAnswer(false);
    setUserAnswer('');
    setIsPlaying(false);
    const initialRevealed = new Array(series.length).fill(false);
    initialRevealed[0] = true;
    setRevealedNumbers(initialRevealed);
    setAnimationKey(prev => prev + 1);
  };

  const handleSubmitAnswer = () => {
    const userNum = parseInt(userAnswer);
    const isCorrect = userNum === answer;
    setShowAnswer(true);
    
    if (isCorrect) {
      const newRevealed = [...revealedNumbers];
      newRevealed[missingIndex] = true;
      setRevealedNumbers(newRevealed);
    }
    
    onComplete?.(isCorrect);
  };

  const getDifficultyColor = (diff: 'easy' | 'medium' | 'hard') => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getNumberColor = (index: number) => {
    if (index === missingIndex) return 'from-red-400 to-red-600';
    if (index === 0) return 'from-blue-400 to-blue-600';
    return 'from-purple-400 to-purple-600';
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-6 h-6 text-blue-600" />
            Number Series Problem
          </div>
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        </CardTitle>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Control Panel */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={startAnimation}
              disabled={isPlaying}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isPlaying ? 'Playing...' : 'Start Animation'}
            </Button>
            <Button
              onClick={resetAnimation}
              disabled={isPlaying}
              variant="outline"
            >
              Reset
            </Button>
          </div>

          {/* Number Series Display */}
          <div className="relative">
            <div className="flex justify-center items-center gap-4 flex-wrap p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
              {series.map((number, index) => (
                <div key={index} className="relative">
                  <motion.div
                    key={`${index}-${animationKey}`}
                    className={`w-20 h-20 rounded-xl bg-gradient-to-r ${getNumberColor(index)} 
                               shadow-lg flex items-center justify-center text-white font-bold text-xl
                               border-4 border-white relative overflow-hidden`}
                    initial={{ 
                      scale: 0, 
                      opacity: 0,
                      rotateY: index === 0 ? 0 : 180
                    }}
                    animate={{ 
                      scale: revealedNumbers[index] || showAnswer ? 1 : 0.8, 
                      opacity: revealedNumbers[index] || showAnswer ? 1 : 0.3,
                      rotateY: revealedNumbers[index] || showAnswer ? 0 : 180
                    }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      scale: revealedNumbers[index] || showAnswer ? 1.1 : 0.8 
                    }}
                  >
                    {/* Number */}
                    {(revealedNumbers[index] || (index === missingIndex && showAnswer)) ? (
                      <motion.span
                        key={`number-${index}-${animationKey}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        {index === missingIndex ? answer : number}
                      </motion.span>
                    ) : index === missingIndex ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-3xl"
                      >
                        ?
                      </motion.span>
                    ) : (
                      <motion.span
                        className="text-3xl opacity-50"
                      >
                        ?
                      </motion.span>
                    )}

                    {/* Sparkle effect for revealed numbers */}
                    {revealedNumbers[index] && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 1, delay: 0.5 }}
                      >
                        <Sparkles className="w-8 h-8 text-yellow-300" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Position label */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 font-medium">
                    {index + 1}
                  </div>

                  {/* Arrow between numbers */}
                  {index < series.length - 1 && (
                    <motion.div
                      className="absolute top-1/2 -right-6 transform -translate-y-1/2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: revealedNumbers[index] ? 1 : 0.3, x: 0 }}
                      transition={{ delay: (index + 1) * 0.2 }}
                    >
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current Step Display */}
          <AnimatePresence>
            {currentStep >= 0 && currentStep < steps.length && (
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {currentStep + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      Step {currentStep + 1}: {steps[currentStep].operation}
                    </h4>
                    <p className="text-gray-700">{steps[currentStep].explanation}</p>
                    {steps[currentStep].difference && (
                      <div className="mt-2 text-sm text-blue-700">
                        <strong>Difference:</strong> {steps[currentStep].difference}
                      </div>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {steps[currentStep].number}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pattern Revelation */}
          <AnimatePresence>
            {showPattern && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center justify-center gap-2">
                    <Eye className="w-6 h-6" />
                    Pattern Discovered!
                  </h3>
                  <div className="text-lg font-semibold text-gray-800 mb-4">
                    {pattern}
                  </div>
                  
                  {/* Differences visualization */}
                  <div className="flex justify-center items-center gap-2 mb-6">
                    {steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {index > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-500">+</span>
                            <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">
                              {step.difference || 'N/A'}
                            </div>
                          </div>
                        )}
                        {index < steps.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Answer Input */}
                  <div className="space-y-4">
                    <p className="text-gray-700">What number should replace the question mark?</p>
                    <div className="flex justify-center gap-4">
                      <input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Your answer"
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-center font-bold text-lg"
                        disabled={showAnswer}
                      />
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={!userAnswer.trim() || showAnswer}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer Feedback */}
          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`rounded-lg p-6 border-4 ${
                  parseInt(userAnswer) === answer
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {parseInt(userAnswer) === answer ? '🎉' : '❌'}
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${
                    parseInt(userAnswer) === answer ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {parseInt(userAnswer) === answer ? 'Correct!' : 'Incorrect!'}
                  </h3>
                  <p className="text-lg text-gray-700 mb-4">
                    The correct answer is: <strong>{answer}</strong>
                  </p>
                  {parseInt(userAnswer) !== answer && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
                      <p className="text-blue-700">{pattern}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

// Example usage with preset number series problems
export const NumberSeriesExample: React.FC = () => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const problems = [
    {
      title: "Arithmetic Progression",
      description: "Find the missing number in this arithmetic sequence",
      series: [2, 5, 8, 11, 14],
      missingIndex: 3,
      answer: 11,
      pattern: "Add 3 to each number to get the next number (+3 pattern)",
      difficulty: 'easy' as const,
      steps: [
        { number: 2, operation: "Starting number", explanation: "The sequence begins with 2", difference: 0 },
        { number: 5, operation: "Add 3", explanation: "2 + 3 = 5", difference: 3 },
        { number: 8, operation: "Add 3", explanation: "5 + 3 = 8", difference: 3 },
        { number: 11, operation: "Add 3", explanation: "8 + 3 = 11", difference: 3 },
        { number: 14, operation: "Add 3", explanation: "11 + 3 = 14", difference: 3 }
      ]
    },
    {
      title: "Quadratic Sequence",
      description: "This sequence follows a quadratic pattern",
      series: [1, 4, 9, 16, 25],
      missingIndex: 2,
      answer: 9,
      pattern: "Perfect squares: 1², 2², 3², 4², 5²",
      difficulty: 'medium' as const,
      steps: [
        { number: 1, operation: "1²", explanation: "1 × 1 = 1", difference: 0 },
        { number: 4, operation: "2²", explanation: "2 × 2 = 4", difference: 3 },
        { number: 9, operation: "3²", explanation: "3 × 3 = 9", difference: 5 },
        { number: 16, operation: "4²", explanation: "4 × 4 = 16", difference: 7 },
        { number: 25, operation: "5²", explanation: "5 × 5 = 25", difference: 9 }
      ]
    },
    {
      title: "Fibonacci-like Sequence",
      description: "Each number is the sum of the two preceding ones",
      series: [1, 1, 2, 3, 5, 8],
      missingIndex: 4,
      answer: 5,
      pattern: "Each number = sum of previous two numbers (Fibonacci pattern)",
      difficulty: 'hard' as const,
      steps: [
        { number: 1, operation: "First term", explanation: "Starting with 1", difference: 0 },
        { number: 1, operation: "Second term", explanation: "Second starting number is 1", difference: 0 },
        { number: 2, operation: "1+1", explanation: "1 + 1 = 2", difference: 1 },
        { number: 3, operation: "1+2", explanation: "1 + 2 = 3", difference: 1 },
        { number: 5, operation: "2+3", explanation: "2 + 3 = 5", difference: 2 },
        { number: 8, operation: "3+5", explanation: "3 + 5 = 8", difference: 3 }
      ]
    },
    {
      title: "Geometric Progression",
      description: "Each number is multiplied by a constant factor",
      series: [2, 6, 18, 54, 162],
      missingIndex: 3,
      answer: 54,
      pattern: "Multiply by 3 each time (×3 geometric progression)",
      difficulty: 'medium' as const,
      steps: [
        { number: 2, operation: "Starting number", explanation: "The sequence begins with 2", difference: 0 },
        { number: 6, operation: "×3", explanation: "2 × 3 = 6", difference: 4 },
        { number: 18, operation: "×3", explanation: "6 × 3 = 18", difference: 12 },
        { number: 54, operation: "×3", explanation: "18 × 3 = 54", difference: 36 },
        { number: 162, operation: "×3", explanation: "54 × 3 = 162", difference: 108 }
      ]
    }
  ];

  const currentProblemData = problems[currentProblem];

  const handleComplete = (correct: boolean) => {
    setAttempts(prev => prev + 1);
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const nextProblem = () => {
    setCurrentProblem((prev) => (prev + 1) % problems.length);
  };

  const prevProblem = () => {
    setCurrentProblem((prev) => (prev - 1 + problems.length) % problems.length);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Number Series Challenge
        </h2>
        
        {/* Score Display */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="bg-green-100 px-4 py-2 rounded-lg border border-green-300">
            <div className="text-green-800 font-bold">Score: {score}/{attempts}</div>
          </div>
          <div className="bg-blue-100 px-4 py-2 rounded-lg border border-blue-300">
            <div className="text-blue-800 font-bold">
              Accuracy: {attempts > 0 ? Math.round((score / attempts) * 100) : 0}%
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-6">
          <Button onClick={prevProblem} variant="outline">
            Previous Problem
          </Button>
          <span className="flex items-center px-4 py-2 bg-gray-100 rounded-lg">
            Problem {currentProblem + 1} of {problems.length}
          </span>
          <Button onClick={nextProblem} variant="outline">
            Next Problem
          </Button>
        </div>
      </div>

      <NumberSeriesAnimation
        key={currentProblem}
        title={currentProblemData.title}
        description={currentProblemData.description}
        series={currentProblemData.series}
        missingIndex={currentProblemData.missingIndex}
        answer={currentProblemData.answer}
        pattern={currentProblemData.pattern}
        steps={currentProblemData.steps}
        difficulty={currentProblemData.difficulty}
        onComplete={handleComplete}
      />
    </div>
  );
};
