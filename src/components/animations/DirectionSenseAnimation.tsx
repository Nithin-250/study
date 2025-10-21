import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin, Target, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface DirectionStep {
  direction: 'north' | 'south' | 'east' | 'west';
  steps: number;
  label: string;
}

interface DirectionSenseProps {
  steps: DirectionStep[];
  startPosition: { x: number; y: number };
  onComplete?: (finalPosition: { x: number; y: number }) => void;
  autoPlay?: boolean;
}

export const DirectionSenseAnimation: React.FC<DirectionSenseProps> = ({
  steps,
  startPosition,
  onComplete,
  autoPlay = false
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [currentPosition, setCurrentPosition] = useState(startPosition);
  const [isPlaying, setIsPlaying] = useState(false);
  const [path, setPath] = useState<{ x: number; y: number }[]>([startPosition]);
  const [animationKey, setAnimationKey] = useState(0);

  const CELL_SIZE = 30; // Size of each grid cell
  const GRID_SIZE = 15; // 15x15 grid
  const CENTER_X = Math.floor(GRID_SIZE / 2);
  const CENTER_Y = Math.floor(GRID_SIZE / 2);

  // Convert grid coordinates to pixel coordinates
  const toPixelCoords = (gridX: number, gridY: number) => ({
    x: (gridX + CENTER_X) * CELL_SIZE,
    y: (CENTER_Y - gridY) * CELL_SIZE // Invert Y for screen coordinates
  });

  // Get direction arrow icon
  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'north': return <ArrowUp className="w-5 h-5 text-blue-600" />;
      case 'south': return <ArrowDown className="w-5 h-5 text-red-600" />;
      case 'east': return <ArrowRight className="w-5 h-5 text-green-600" />;
      case 'west': return <ArrowLeft className="w-5 h-5 text-orange-600" />;
      default: return <Navigation className="w-5 h-5" />;
    }
  };

  // Calculate final position
  const calculateFinalPosition = () => {
    let x = startPosition.x;
    let y = startPosition.y;
    
    steps.forEach(step => {
      switch (step.direction) {
        case 'north': y += step.steps; break;
        case 'south': y -= step.steps; break;
        case 'east': x += step.steps; break;
        case 'west': x -= step.steps; break;
      }
    });
    
    return { x, y };
  };

  // Execute one step
  const executeStep = (stepIndex: number) => {
    if (stepIndex >= steps.length) return;
    
    const step = steps[stepIndex];
    let newX = currentPosition.x;
    let newY = currentPosition.y;
    
    switch (step.direction) {
      case 'north': newY += step.steps; break;
      case 'south': newY -= step.steps; break;
      case 'east': newX += step.steps; break;
      case 'west': newX -= step.steps; break;
    }
    
    setCurrentPosition({ x: newX, y: newY });
    setPath(prev => [...prev, { x: newX, y: newY }]);
    setCurrentStepIndex(stepIndex);
  };

  // Auto play animation
  useEffect(() => {
    if (autoPlay && !isPlaying) {
      startAnimation();
    }
  }, [autoPlay]);

  const startAnimation = () => {
    setIsPlaying(true);
    setCurrentStepIndex(-1);
    setCurrentPosition(startPosition);
    setPath([startPosition]);
    setAnimationKey(prev => prev + 1);
    
    steps.forEach((step, index) => {
      setTimeout(() => {
        executeStep(index);
        
        if (index === steps.length - 1) {
          setTimeout(() => {
            setIsPlaying(false);
            const finalPos = calculateFinalPosition();
            onComplete?.(finalPos);
          }, 1000);
        }
      }, (index + 1) * 2000);
    });
  };

  const resetAnimation = () => {
    setCurrentStepIndex(-1);
    setCurrentPosition(startPosition);
    setPath([startPosition]);
    setIsPlaying(false);
    setAnimationKey(prev => prev + 1);
  };

  const pixelPosition = toPixelCoords(currentPosition.x, currentPosition.y);
  const finalPosition = calculateFinalPosition();
  const finalPixelPosition = toPixelCoords(finalPosition.x, finalPosition.y);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-6 h-6 text-blue-600" />
          Direction Sense Problem
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={startAnimation}
              disabled={isPlaying}
              className="bg-blue-600 hover:bg-blue-700"
            >
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

          {/* Animation Area */}
          <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 overflow-hidden">
            <svg
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="border-2 border-gray-200 rounded-lg bg-white"
            >
              {/* Grid Lines */}
              {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
                <g key={i}>
                  <line
                    x1={i * CELL_SIZE}
                    y1={0}
                    x2={i * CELL_SIZE}
                    y2={GRID_SIZE * CELL_SIZE}
                    stroke="#f0f0f0"
                    strokeWidth={1}
                  />
                  <line
                    x1={0}
                    y1={i * CELL_SIZE}
                    x2={GRID_SIZE * CELL_SIZE}
                    y2={i * CELL_SIZE}
                    stroke="#f0f0f0"
                    strokeWidth={1}
                  />
                </g>
              ))}

              {/* Origin marker */}
              <circle
                cx={toPixelCoords(startPosition.x, startPosition.y).x}
                cy={toPixelCoords(startPosition.x, startPosition.y).y}
                r={8}
                fill="#10b981"
                stroke="#065f46"
                strokeWidth={2}
              />
              <text
                x={toPixelCoords(startPosition.x, startPosition.y).x}
                y={toPixelCoords(startPosition.x, startPosition.y).y + 25}
                textAnchor="middle"
                className="text-xs font-bold fill-green-700"
              >
                START
              </text>

              {/* Path visualization */}
              {path.length > 1 && (
                <motion.polyline
                  key={`path-${animationKey}`}
                  points={path.map(pos => {
                    const pixel = toPixelCoords(pos.x, pos.y);
                    return `${pixel.x},${pixel.y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2 }}
                />
              )}

              {/* Animated character */}
              <motion.g
                key={`character-${animationKey}`}
                initial={{ x: toPixelCoords(startPosition.x, startPosition.y).x, y: toPixelCoords(startPosition.x, startPosition.y).y }}
                animate={{ x: pixelPosition.x, y: pixelPosition.y }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                <circle
                  r={12}
                  fill="#f59e0b"
                  stroke="#92400e"
                  strokeWidth={2}
                />
                <circle cx={-4} cy={-3} r={2} fill="#000" />
                <circle cx={4} cy={-3} r={2} fill="#000" />
                <path d="M -6,3 Q 0,8 6,3" stroke="#000" strokeWidth={2} fill="none" />
              </motion.g>

              {/* Final position marker */}
              {currentStepIndex === steps.length - 1 && (
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 2 }}
                >
                  <circle
                    cx={finalPixelPosition.x}
                    cy={finalPixelPosition.y}
                    r={15}
                    fill="#ef4444"
                    stroke="#dc2626"
                    strokeWidth={3}
                    opacity={0.8}
                  />
                  <Target className="w-6 h-6" x={finalPixelPosition.x - 12} y={finalPixelPosition.y - 12} />
                  <text
                    x={finalPixelPosition.x}
                    y={finalPixelPosition.y + 35}
                    textAnchor="middle"
                    className="text-xs font-bold fill-red-700"
                  >
                    FINAL
                  </text>
                </motion.g>
              )}
            </svg>
          </div>

          {/* Step Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  index === currentStepIndex
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : index < currentStepIndex
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : index < currentStepIndex
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    {getDirectionIcon(step.direction)}
                    <span className="font-semibold capitalize">{step.direction}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {step.label || `Move ${step.steps} steps ${step.direction}`}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Final Position Display */}
          {currentStepIndex === steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 text-center border-2 border-purple-200"
            >
              <h3 className="text-xl font-bold text-purple-800 mb-2">Final Position</h3>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="text-lg font-semibold">
                    ({finalPosition.x}, {finalPosition.y})
                  </span>
                </div>
                {startPosition.x !== finalPosition.x || startPosition.y !== finalPosition.y ? (
                  <div className="text-sm text-gray-600">
                    Displaced by: ({finalPosition.x - startPosition.x}, {finalPosition.y - startPosition.y})
                  </div>
                ) : (
                  <div className="text-sm text-green-600 font-semibold">
                    Returned to starting position!
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Example usage component with preset problems
export const DirectionSenseExample: React.FC = () => {
  const [currentProblem, setCurrentProblem] = useState(0);

  const problems = [
    {
      id: 1,
      title: "Basic Movement Problem",
      description: "A person starts at the origin and follows these directions:",
      steps: [
        { direction: 'north' as const, steps: 5, label: "Move 5 steps north" },
        { direction: 'east' as const, steps: 3, label: "Move 3 steps east" },
        { direction: 'south' as const, steps: 2, label: "Move 2 steps south" },
      ]
    },
    {
      id: 2,
      title: "Complex Navigation",
      description: "Navigate through this path:",
      steps: [
        { direction: 'north' as const, steps: 10, label: "Move 10 units north" },
        { direction: 'west' as const, steps: 5, label: "Move 5 units west" },
        { direction: 'south' as const, steps: 15, label: "Move 15 units south" },
      ]
    },
    {
      id: 3,
      title: "Return Journey",
      description: "Can you find the final position?",
      steps: [
        { direction: 'east' as const, steps: 8, label: "Walk 8 steps east" },
        { direction: 'north' as const, steps: 6, label: "Walk 6 steps north" },
        { direction: 'west' as const, steps: 4, label: "Walk 4 steps west" },
        { direction: 'south' as const, steps: 3, label: "Walk 3 steps south" },
      ]
    }
  ];

  const currentProblemData = problems[currentProblem];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {currentProblemData.title}
        </h2>
        <p className="text-gray-600 mb-4">{currentProblemData.description}</p>
        
        <div className="flex justify-center gap-4 mb-6">
          <Button
            onClick={() => setCurrentProblem((prev) => Math.max(0, prev - 1))}
            disabled={currentProblem === 0}
            variant="outline"
          >
            Previous Problem
          </Button>
          <span className="flex items-center px-4 py-2 bg-gray-100 rounded-lg">
            Problem {currentProblem + 1} of {problems.length}
          </span>
          <Button
            onClick={() => setCurrentProblem((prev) => Math.min(problems.length - 1, prev + 1))}
            disabled={currentProblem === problems.length - 1}
            variant="outline"
          >
            Next Problem
          </Button>
        </div>
      </div>

      <DirectionSenseAnimation
        key={currentProblem}
        steps={currentProblemData.steps}
        startPosition={{ x: 0, y: 0 }}
        autoPlay={false}
        onComplete={(finalPos) => {
          console.log('Final position:', finalPos);
        }}
      />
    </div>
  );
};
