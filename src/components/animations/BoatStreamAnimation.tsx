import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Anchor, Waves, Calculator, ArrowRight, RotateCcw, Zap, CheckCircle, Clock, Ruler } from 'lucide-react';

interface StreamStep {
  step: number;
  description: string;
  boatSpeed: number;
  streamSpeed: number;
  effectiveSpeed: number;
  distance: number;
  time: number;
  explanation: string;
  direction: 'downstream' | 'upstream';
}

interface BoatStreamProblem {
  title: string;
  description: string;
  boatSpeed: number; // km/h in still water
  streamSpeed: number; // km/h current
  distance: number; // km
  downstreamTime?: number;
  upstreamTime?: number;
  answer: number;
  answerType: 'time' | 'speed' | 'distance';
  steps: StreamStep[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface BoatStreamAnimationProps {
  title: string;
  description: string;
  boatSpeed: number;
  streamSpeed: number;
  distance: number;
  downstreamTime?: number;
  upstreamTime?: number;
  answer: number;
  answerType: 'time' | 'speed' | 'distance';
  steps: StreamStep[];
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete?: (correct: boolean) => void;
}

export const BoatStreamAnimation: React.FC<BoatStreamAnimationProps> = ({
  title,
  description,
  boatSpeed,
  streamSpeed,
  distance,
  downstreamTime,
  upstreamTime,
  answer,
  answerType,
  steps,
  difficulty,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [showCalculations, setShowCalculations] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [boatPosition, setBoatPosition] = useState(0);

  const startAnimation = () => {
    setIsAnimating(true);
    setCurrentStep(-1);
    setShowCalculations(false);
    setShowAnswer(false);
    setUserAnswer('');
    setBoatPosition(0);

    // Animate through each step
    steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);

        // Animate boat movement
        const animationDuration = (step.time * 1000) / 2; // Half speed for visibility
        const startPos = boatPosition;
        const endPos = startPos + (step.direction === 'downstream' ? 80 : -80);

        let startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / animationDuration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          setBoatPosition(startPos + (endPos - startPos) * easeProgress);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);

        if (index === steps.length - 1) {
          setTimeout(() => {
            setShowCalculations(true);
            setIsAnimating(false);
          }, animationDuration + 1000);
        }
      }, index * 3000);
    });
  };

  const resetAnimation = () => {
    setCurrentStep(-1);
    setShowCalculations(false);
    setShowAnswer(false);
    setUserAnswer('');
    setIsAnimating(false);
    setBoatPosition(0);
  };

  const handleSubmitAnswer = () => {
    const isCorrect = Math.abs(parseFloat(userAnswer) - answer) < 0.01;
    setShowAnswer(true);
    onComplete?.(isCorrect);
  };

  const getAnswerLabel = () => {
    switch (answerType) {
      case 'time': return 'Time (hours)';
      case 'speed': return 'Speed (km/h)';
      case 'distance': return 'Distance (km)';
      default: return 'Answer';
    }
  };

  const formatSpeed = (speed: number) => `${speed} km/h`;
  const formatTime = (time: number) => `${time.toFixed(2)} hours`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-800">
            <Anchor className="w-6 h-6" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 mb-4">{description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg border">
              <div className="font-semibold text-blue-600">Boat Speed</div>
              <div className="text-lg font-bold">{formatSpeed(boatSpeed)}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="font-semibold text-blue-600">Stream Speed</div>
              <div className="text-lg font-bold">{formatSpeed(streamSpeed)}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="font-semibold text-blue-600">Distance</div>
              <div className="text-lg font-bold">{distance} km</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="font-semibold text-blue-600">Direction</div>
              <div className="text-lg font-bold">
                {steps.some(s => s.direction === 'downstream') && steps.some(s => s.direction === 'upstream')
                  ? 'Both Ways'
                  : steps[0]?.direction === 'downstream' ? 'Downstream' : 'Upstream'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animation Area */}
      <Card className="min-h-80">
        <CardContent className="p-6">
          {/* River Visualization */}
          <div className="relative mb-8">
            {/* River banks */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-4 h-16 bg-green-600 rounded-t-full"></div>
              <div className="flex-1 h-8 bg-blue-200 relative overflow-hidden">
                {/* Water flow animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-300 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {/* Current direction arrows */}
                <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                  <motion.div
                    animate={{ x: [0, 20, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-blue-600"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                  <motion.div
                    animate={{ x: [0, 20, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-blue-600"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
              <div className="w-4 h-16 bg-green-600 rounded-t-full"></div>
            </div>

            {/* Distance markers */}
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Start (0 km)</span>
              <span>End ({distance} km)</span>
            </div>

            {/* Boat */}
            <motion.div
              className="relative"
              style={{ left: `${boatPosition}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <motion.div
                animate={isAnimating ? {
                  y: [0, -5, 0],
                  rotate: [0, 2, -2, 0]
                } : {}}
                transition={{
                  duration: 1.5,
                  repeat: isAnimating ? Infinity : 0,
                  ease: "easeInOut"
                }}
                className="w-12 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-lg"
              >
                <Anchor className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>

            {/* Speed indicators */}
            {currentStep >= 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center"
              >
                <div className="inline-block bg-white p-3 rounded-lg shadow-lg border">
                  <div className="text-sm font-semibold text-gray-700 mb-1">
                    {steps[currentStep].direction === 'downstream' ? 'Downstream' : 'Upstream'}
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatSpeed(steps[currentStep].effectiveSpeed)}
                  </div>
                  <div className="text-xs text-gray-500">Effective Speed</div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Current Step Information */}
          <AnimatePresence mode="wait">
            {currentStep >= 0 && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center mb-6"
              >
                <h4 className="text-xl font-bold mb-2">
                  Step {steps[currentStep].step}: {steps[currentStep].description}
                </h4>
                <p className="text-gray-600 mb-4">{steps[currentStep].explanation}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-3 text-center">
                      <div className="text-sm font-semibold text-green-700">Boat Speed</div>
                      <div className="text-lg font-bold text-green-600">
                        {formatSpeed(steps[currentStep].boatSpeed)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3 text-center">
                      <div className="text-sm font-semibold text-blue-700">Stream Speed</div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatSpeed(steps[currentStep].streamSpeed)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-3 text-center">
                      <div className="text-sm font-semibold text-purple-700">Effective Speed</div>
                      <div className="text-lg font-bold text-purple-600">
                        {formatSpeed(steps[currentStep].effectiveSpeed)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-3 text-center">
                      <div className="text-sm font-semibold text-orange-700">Time</div>
                      <div className="text-lg font-bold text-orange-600">
                        {formatTime(steps[currentStep].time)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Calculations Display */}
          {showCalculations && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-6"
            >
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="p-4">
                  <h4 className="text-lg font-bold mb-4 text-indigo-800">Calculations</h4>

                  {steps.map((step, index) => (
                    <div key={index} className="mb-3 p-3 bg-white rounded-lg border">
                      <div className="text-sm font-semibold text-gray-700 mb-1">
                        {step.direction === 'downstream' ? 'Downstream' : 'Upstream'}:
                      </div>
                      <div className="font-mono text-sm">
                        Speed = {step.boatSpeed} {step.direction === 'downstream' ? '+' : '-'} {step.streamSpeed} = {step.effectiveSpeed} km/h
                      </div>
                      <div className="font-mono text-sm">
                        Time = {step.distance} km ÷ {step.effectiveSpeed} km/h = {step.time.toFixed(2)} hours
                      </div>
                    </div>
                  ))}

                  {steps.length > 1 && (
                    <div className="mt-4 p-3 bg-indigo-100 rounded-lg border border-indigo-300">
                      <div className="font-semibold text-indigo-800">Total Time:</div>
                      <div className="font-mono text-lg font-bold text-indigo-600">
                        {steps.reduce((sum, step) => sum + step.time, 0).toFixed(2)} hours
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Answer Input */}
          {showCalculations && !showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="max-w-xs mx-auto">
                <label className="block text-sm font-medium mb-2">Your Answer ({getAnswerLabel()}):</label>
                <input
                  type="number"
                  step="0.01"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-lg font-bold"
                  placeholder="Enter answer"
                />
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim()}
                  className="mt-3 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Answer
                </Button>
              </div>
            </motion.div>
          )}

          {/* Answer Reveal */}
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className={`border-2 ${Math.abs(parseFloat(userAnswer) - answer) < 0.01 ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                <CardContent className="p-4">
                  <div className={`text-4xl mb-2 ${Math.abs(parseFloat(userAnswer) - answer) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(parseFloat(userAnswer) - answer) < 0.01 ? '✅' : '❌'}
                  </div>
                  <h4 className="text-lg font-bold mb-2">
                    {Math.abs(parseFloat(userAnswer) - answer) < 0.01 ? 'Correct!' : 'Incorrect'}
                  </h4>
                  <p className="text-gray-700">
                    Answer: <span className="font-bold text-lg">{answer.toFixed(2)} {answerType === 'time' ? 'hours' : answerType === 'speed' ? 'km/h' : 'km'}</span>
                  </p>
                  {userAnswer && Math.abs(parseFloat(userAnswer) - answer) >= 0.01 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Your answer: {userAnswer} {answerType === 'time' ? 'hours' : answerType === 'speed' ? 'km/h' : 'km'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={startAnimation}
          disabled={isAnimating}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        >
          {isAnimating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Animating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Start Animation
            </>
          )}
        </Button>

        <Button onClick={resetAnimation} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};

// Example component with multiple problems
export const BoatStreamExample: React.FC = () => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const problems: BoatStreamProblem[] = [
    {
      title: "Simple Downstream Journey",
      description: "A boat travels downstream. Find the time taken to cover 24 km.",
      boatSpeed: 12,
      streamSpeed: 4,
      distance: 24,
      answer: 1.5,
      answerType: 'time',
      difficulty: 'easy',
      steps: [
        {
          step: 1,
          description: "Downstream Speed",
          boatSpeed: 12,
          streamSpeed: 4,
          effectiveSpeed: 16,
          distance: 24,
          time: 1.5,
          explanation: "Downstream speed = Boat speed + Stream speed = 12 + 4 = 16 km/h",
          direction: 'downstream'
        }
      ]
    },
    {
      title: "Upstream Journey",
      description: "A boat travels upstream. Find the time taken to cover 15 km.",
      boatSpeed: 10,
      streamSpeed: 3,
      distance: 15,
      answer: 2.0,
      answerType: 'time',
      difficulty: 'easy',
      steps: [
        {
          step: 1,
          description: "Upstream Speed",
          boatSpeed: 10,
          streamSpeed: 3,
          effectiveSpeed: 7,
          distance: 15,
          time: 2.0,
          explanation: "Upstream speed = Boat speed - Stream speed = 10 - 3 = 7 km/h",
          direction: 'upstream'
        }
      ]
    },
    {
      title: "Round Trip Journey",
      description: "A boat goes to a place 20 km downstream and returns. Find total time if boat speed is 15 km/h and stream speed is 5 km/h.",
      boatSpeed: 15,
      streamSpeed: 5,
      distance: 20,
      downstreamTime: 1.0,
      upstreamTime: 2.0,
      answer: 3.0,
      answerType: 'time',
      difficulty: 'medium',
      steps: [
        {
          step: 1,
          description: "Downstream Journey",
          boatSpeed: 15,
          streamSpeed: 5,
          effectiveSpeed: 20,
          distance: 20,
          time: 1.0,
          explanation: "Downstream: Speed = 15 + 5 = 20 km/h, Time = 20 ÷ 20 = 1 hour",
          direction: 'downstream'
        },
        {
          step: 2,
          description: "Upstream Return",
          boatSpeed: 15,
          streamSpeed: 5,
          effectiveSpeed: 10,
          distance: 20,
          time: 2.0,
          explanation: "Upstream: Speed = 15 - 5 = 10 km/h, Time = 20 ÷ 10 = 2 hours",
          direction: 'upstream'
        }
      ]
    },
    {
      title: "Finding Boat Speed",
      description: "A boat takes 4 hours downstream and 6 hours upstream for the same distance. Stream speed is 2 km/h. Find boat speed.",
      boatSpeed: 0, // Will be calculated as 8
      streamSpeed: 2,
      distance: 0, // Will be calculated
      answer: 8,
      answerType: 'speed',
      difficulty: 'hard',
      steps: [
        {
          step: 1,
          description: "Let Boat Speed be x",
          boatSpeed: 8, // Calculated answer
          streamSpeed: 2,
          effectiveSpeed: 10, // x + 2
          distance: 40, // Will be calculated as 4 * (x + 2) = 6 * (x - 2)
          time: 4,
          explanation: "Downstream: Distance = 4 × (x + 2), Upstream: Distance = 6 × (x - 2)",
          direction: 'downstream'
        },
        {
          step: 2,
          description: "Solve Equation",
          boatSpeed: 8,
          streamSpeed: 2,
          effectiveSpeed: 6, // x - 2
          distance: 40,
          time: 6,
          explanation: "4(x + 2) = 6(x - 2) → 4x + 8 = 6x - 12 → 20 = 2x → x = 10 km/h",
          direction: 'upstream'
        }
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
          Boat & Stream Challenge
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

      <BoatStreamAnimation
        key={currentProblem}
        title={currentProblemData.title}
        description={currentProblemData.description}
        boatSpeed={currentProblemData.boatSpeed}
        streamSpeed={currentProblemData.streamSpeed}
        distance={currentProblemData.distance}
        downstreamTime={currentProblemData.downstreamTime}
        upstreamTime={currentProblemData.upstreamTime}
        answer={currentProblemData.answer}
        answerType={currentProblemData.answerType}
        steps={currentProblemData.steps}
        difficulty={currentProblemData.difficulty}
        onComplete={handleComplete}
      />
    </div>
  );
};
