import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, RotateCcw, Calculator, Eye, Zap } from 'lucide-react';

interface ClockTime {
  hours: number;
  minutes: number;
}

interface ClockProblemsProps {
  question: string;
  targetTime: ClockTime;
  showAngle?: boolean;
  showSteps?: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  onAngleCalculated?: (angle: number) => void;
}

export const ClockProblemsAnimation: React.FC<ClockProblemsProps> = ({
  question,
  targetTime,
  showAngle = true,
  showSteps = true,
  difficulty,
  onAngleCalculated
}) => {
  const [currentTime, setCurrentTime] = useState<ClockTime>({ hours: 12, minutes: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Clock calculations
  const calculateHourAngle = (hours: number, minutes: number) => {
    return ((hours % 12) * 30 + minutes * 0.5) % 360;
  };

  const calculateMinuteAngle = (minutes: number) => {
    return (minutes * 6) % 360;
  };

  const calculateAngleBetweenHands = (hours: number, minutes: number) => {
    const hourAngle = calculateHourAngle(hours, minutes);
    const minuteAngle = calculateMinuteAngle(minutes);
    let angle = Math.abs(hourAngle - minuteAngle);
    return angle > 180 ? 360 - angle : angle;
  };

  const currentAngle = calculateAngleBetweenHands(currentTime.hours, currentTime.minutes);
  const targetAngle = calculateAngleBetweenHands(targetTime.hours, targetTime.minutes);

  const startAnimation = () => {
    setIsAnimating(true);
    setShowCalculation(false);
    setAnimationKey(prev => prev + 1);
    
    // Start from 12:00
    setCurrentTime({ hours: 12, minutes: 0 });
    
    // Animate to target time
    setTimeout(() => {
      setCurrentTime(targetTime);
      setTimeout(() => {
        setIsAnimating(false);
        setShowCalculation(true);
        onAngleCalculated?.(targetAngle);
      }, 2000);
    }, 1000);
  };

  const resetAnimation = () => {
    setCurrentTime({ hours: 12, minutes: 0 });
    setIsAnimating(false);
    setShowCalculation(false);
    setAnimationKey(prev => prev + 1);
  };

  const formatTime = (time: ClockTime) => {
    const hours = time.hours === 0 ? 12 : time.hours > 12 ? time.hours - 12 : time.hours;
    const minutes = time.minutes.toString().padStart(2, '0');
    const period = time.hours >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${period}`;
  };

  const getDifficultyColor = (diff: 'easy' | 'medium' | 'hard') => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  // Generate clock numbers
  const clockNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Clock Problems
          </div>
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        </CardTitle>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <p className="text-lg font-medium text-gray-800">{question}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Control Panel */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={startAnimation}
              disabled={isAnimating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isAnimating ? 'Animating...' : 'Show Time'}
            </Button>
            <Button
              onClick={resetAnimation}
              disabled={isAnimating}
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Clock Display */}
          <div className="flex justify-center">
            <div className="relative">
              <svg
                width="400"
                height="400"
                className="drop-shadow-lg"
                viewBox="0 0 400 400"
              >
                {/* Clock Face */}
                <circle
                  cx="200"
                  cy="200"
                  r="190"
                  fill="white"
                  stroke="#374151"
                  strokeWidth="4"
                  className="drop-shadow-md"
                />
                
                {/* Hour Markers */}
                {clockNumbers.map((num) => {
                  const angle = (num - 3) * 30 * (Math.PI / 180);
                  const x = 200 + 160 * Math.cos(angle);
                  const y = 200 + 160 * Math.sin(angle);
                  
                  return (
                    <g key={num}>
                      {/* Hour mark lines */}
                      <line
                        x1={200 + 180 * Math.cos(angle)}
                        y1={200 + 180 * Math.sin(angle)}
                        x2={200 + 160 * Math.cos(angle)}
                        y2={200 + 160 * Math.sin(angle)}
                        stroke="#374151"
                        strokeWidth="3"
                      />
                      {/* Numbers */}
                      <text
                        x={x}
                        y={y + 6}
                        textAnchor="middle"
                        className="text-2xl font-bold fill-gray-800"
                      >
                        {num}
                      </text>
                    </g>
                  );
                })}

                {/* Minute Markers */}
                {Array.from({ length: 60 }).map((_, i) => {
                  if (i % 5 !== 0) {
                    const angle = (i - 15) * 6 * (Math.PI / 180);
                    return (
                      <line
                        key={i}
                        x1={200 + 180 * Math.cos(angle)}
                        y1={200 + 180 * Math.sin(angle)}
                        x2={200 + 170 * Math.cos(angle)}
                        y2={200 + 170 * Math.sin(angle)}
                        stroke="#9CA3AF"
                        strokeWidth="1"
                      />
                    );
                  }
                  return null;
                })}

                {/* Hour Hand */}
                <motion.line
                  key={`hour-hand-${animationKey}`}
                  x1="200"
                  y1="200"
                  x2="200"
                  y2="110"
                  stroke="#EF4444"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ 
                    rotate: -90,
                    transformOrigin: "200px 200px"
                  }}
                  animate={{ 
                    rotate: calculateHourAngle(currentTime.hours, currentTime.minutes) - 90,
                    transformOrigin: "200px 200px"
                  }}
                  transition={{ 
                    duration: isAnimating ? 2 : 0.1, 
                    ease: "easeInOut" 
                  }}
                />

                {/* Minute Hand */}
                <motion.line
                  key={`minute-hand-${animationKey}`}
                  x1="200"
                  y1="200"
                  x2="200"
                  y2="60"
                  stroke="#3B82F6"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ 
                    rotate: -90,
                    transformOrigin: "200px 200px"
                  }}
                  animate={{ 
                    rotate: calculateMinuteAngle(currentTime.minutes) - 90,
                    transformOrigin: "200px 200px"
                  }}
                  transition={{ 
                    duration: isAnimating ? 2 : 0.1, 
                    ease: "easeInOut" 
                  }}
                />

                {/* Angle Arc */}
                {showAngle && currentAngle > 0 && (
                  <motion.path
                    key={`angle-arc-${animationKey}`}
                    d={(() => {
                      const hourAngle = calculateHourAngle(currentTime.hours, currentTime.minutes);
                      const minuteAngle = calculateMinuteAngle(currentTime.minutes);
                      
                      const startAngle = Math.min(hourAngle, minuteAngle);
                      const endAngle = Math.max(hourAngle, minuteAngle);
                      
                      const start = (startAngle - 90) * (Math.PI / 180);
                      const end = (endAngle - 90) * (Math.PI / 180);
                      const radius = 120;
                      
                      const x1 = 200 + radius * Math.cos(start);
                      const y1 = 200 + radius * Math.sin(start);
                      const x2 = 200 + radius * Math.cos(end);
                      const y2 = 200 + radius * Math.sin(end);
                      
                      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                      
                      return `M 200 200 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                    })()}
                    fill="rgba(249, 115, 22, 0.2)"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showCalculation ? 1 : 0 }}
                    transition={{ delay: 0.5 }}
                  />
                )}

                {/* Center Dot */}
                <circle
                  cx="200"
                  cy="200"
                  r="12"
                  fill="#374151"
                />
                
                {/* Angle Label */}
                {showAngle && showCalculation && (
                  <motion.text
                    x="200"
                    y="250"
                    textAnchor="middle"
                    className="text-xl font-bold fill-orange-600"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, type: "spring" }}
                  >
                    {currentAngle.toFixed(1)}°
                  </motion.text>
                )}
              </svg>
            </div>
          </div>

          {/* Time Display */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 bg-gray-100 rounded-lg px-6 py-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <span className="text-2xl font-bold text-gray-800">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>

          {/* Calculation Steps */}
          <AnimatePresence>
            {showCalculation && showSteps && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                    <Calculator className="w-6 h-6" />
                    Angle Calculation
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Hour Hand Position:</h4>
                      <div className="bg-white p-4 rounded border">
                        <p className="text-sm text-gray-600 mb-2">Formula: (Hours × 30°) + (Minutes × 0.5°)</p>
                        <p className="text-lg">
                          ({currentTime.hours % 12} × 30°) + ({currentTime.minutes} × 0.5°) = <span className="font-bold text-red-600">{calculateHourAngle(currentTime.hours, currentTime.minutes)}°</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Minute Hand Position:</h4>
                      <div className="bg-white p-4 rounded border">
                        <p className="text-sm text-gray-600 mb-2">Formula: Minutes × 6°</p>
                        <p className="text-lg">
                          {currentTime.minutes} × 6° = <span className="font-bold text-blue-600">{calculateMinuteAngle(currentTime.minutes)}°</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-white p-4 rounded border">
                    <h4 className="font-semibold text-gray-800 mb-2">Angle Between Hands:</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      |Hour Angle - Minute Angle| = |{calculateHourAngle(currentTime.hours, currentTime.minutes)}° - {calculateMinuteAngle(currentTime.minutes)}°|
                    </p>
                    <p className="text-xl">
                      = <span className="font-bold text-orange-600">{currentAngle.toFixed(1)}°</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      (If result {'>'}  180°, subtract from 360° to get the smaller angle)
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fun Facts */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Clock Facts
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>• The hour hand moves 0.5° per minute</div>
              <div>• The minute hand moves 6° per minute</div>
              <div>• Hands overlap 11 times in 12 hours</div>
              <div>• Maximum angle between hands is 180°</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Example usage with preset clock problems
export const ClockProblemsExample: React.FC = () => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [calculatedAngles, setCalculatedAngles] = useState<number[]>([]);

  const problems = [
    {
      question: "What is the angle between the clock hands at 3:00?",
      time: { hours: 3, minutes: 0 },
      difficulty: 'easy' as const,
      expectedAngle: 90
    },
    {
      question: "Find the angle between the hands at 6:30?",
      time: { hours: 6, minutes: 30 },
      difficulty: 'medium' as const,
      expectedAngle: 15
    },
    {
      question: "What is the angle at 4:20?",
      time: { hours: 4, minutes: 20 },
      difficulty: 'hard' as const,
      expectedAngle: 10
    },
    {
      question: "Calculate the angle between hands at 9:45?",
      time: { hours: 9, minutes: 45 },
      difficulty: 'hard' as const,
      expectedAngle: 22.5
    },
    {
      question: "What is the angle at 12:15?",
      time: { hours: 12, minutes: 15 },
      difficulty: 'medium' as const,
      expectedAngle: 82.5
    }
  ];

  const currentProblemData = problems[currentProblem];

  const handleAngleCalculated = (angle: number) => {
    const newAngles = [...calculatedAngles];
    newAngles[currentProblem] = angle;
    setCalculatedAngles(newAngles);
  };

  const nextProblem = () => {
    setCurrentProblem((prev) => (prev + 1) % problems.length);
  };

  const prevProblem = () => {
    setCurrentProblem((prev) => (prev - 1 + problems.length) % problems.length);
  };

  const getAccuracyColor = (calculated: number, expected: number) => {
    const diff = Math.abs(calculated - expected);
    if (diff < 1) return 'text-green-600';
    if (diff < 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Clock Problems Challenge
        </h2>
        
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

        {/* Results Summary */}
        {calculatedAngles.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Results Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {problems.map((problem, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded text-sm ${
                    index === currentProblem ? 'bg-blue-200 border-2 border-blue-500' : 'bg-white border'
                  }`}
                >
                  <div className="font-medium">Problem {index + 1}</div>
                  {calculatedAngles[index] !== undefined && (
                    <div className={getAccuracyColor(calculatedAngles[index], problem.expectedAngle)}>
                      {calculatedAngles[index].toFixed(1)}° / {problem.expectedAngle}°
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ClockProblemsAnimation
        key={currentProblem}
        question={currentProblemData.question}
        targetTime={currentProblemData.time}
        difficulty={currentProblemData.difficulty}
        showAngle={true}
        showSteps={true}
        onAngleCalculated={handleAngleCalculated}
      />
    </div>
  );
};
