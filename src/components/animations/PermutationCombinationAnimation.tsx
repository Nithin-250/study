import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dices, Shuffle, Target, Calculator, ArrowRight, RotateCcw, Zap, CheckCircle } from 'lucide-react';

interface ArrangementStep {
  step: number;
  description: string;
  arrangements: string[][];
  highlightIndices?: number[];
  explanation: string;
}

interface PermutationCombinationProblem {
  title: string;
  description: string;
  type: 'permutation' | 'combination' | 'circular-permutation';
  objects: string[];
  selectCount?: number;
  answer: number;
  formula: string;
  steps: ArrangementStep[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface PermutationCombinationAnimationProps {
  title: string;
  description: string;
  type: 'permutation' | 'combination' | 'circular-permutation';
  objects: string[];
  selectCount?: number;
  answer: number;
  formula: string;
  steps: ArrangementStep[];
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete?: (correct: boolean) => void;
}

export const PermutationCombinationAnimation: React.FC<PermutationCombinationAnimationProps> = ({
  title,
  description,
  type,
  objects,
  selectCount,
  answer,
  formula,
  steps,
  difficulty,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [showFormula, setShowFormula] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentArrangements, setCurrentArrangements] = useState<string[][]>([]);

  const startAnimation = () => {
    setIsAnimating(true);
    setCurrentStep(-1);
    setShowFormula(false);
    setShowAnswer(false);
    setUserAnswer('');
    setCurrentArrangements([]);

    // Show initial step
    setTimeout(() => {
      setCurrentStep(0);
      setCurrentArrangements(steps[0].arrangements);
    }, 500);

    // Animate through each step
    steps.forEach((step, index) => {
      if (index > 0) {
        setTimeout(() => {
          setCurrentStep(index);
          setCurrentArrangements(step.arrangements);
        }, (index + 1) * 2500);
      }
    });

    // Show formula after all steps
    setTimeout(() => {
      setShowFormula(true);
      setIsAnimating(false);
    }, (steps.length + 1) * 2500);
  };

  const resetAnimation = () => {
    setCurrentStep(-1);
    setShowFormula(false);
    setShowAnswer(false);
    setUserAnswer('');
    setIsAnimating(false);
    setCurrentArrangements([]);
  };

  const handleSubmitAnswer = () => {
    const isCorrect = parseInt(userAnswer) === answer;
    setShowAnswer(true);
    onComplete?.(isCorrect);
  };

  const getTypeDescription = () => {
    switch (type) {
      case 'permutation':
        return selectCount ? `Permutation of ${selectCount} objects from ${objects.length}` : `Permutation of ${objects.length} distinct objects`;
      case 'combination':
        return `Combination of ${selectCount} objects from ${objects.length}`;
      case 'circular-permutation':
        return `Circular permutation of ${objects.length} distinct objects`;
      default:
        return '';
    }
  };

  const getFormulaExplanation = () => {
    switch (type) {
      case 'permutation':
        return selectCount ? `P(${objects.length}, ${selectCount}) = ${objects.length}! / (${objects.length} - ${selectCount})!` : `${objects.length}!`;
      case 'combination':
        return `C(${objects.length}, ${selectCount}) = ${objects.length}! / (${selectCount}! × (${objects.length} - ${selectCount})!)`;
      case 'circular-permutation':
        return `(${objects.length} - 1)!`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-yellow-800">
            <Dices className="w-6 h-6" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 mb-4">{description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge className={`${
              type === 'permutation' ? 'bg-blue-100 text-blue-700' :
              type === 'combination' ? 'bg-green-100 text-green-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {type === 'permutation' ? 'Permutation' :
               type === 'combination' ? 'Combination' :
               'Circular Permutation'}
            </Badge>
            <Badge className={`${
              difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {difficulty}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Animation Area */}
      <Card className="min-h-96">
        <CardContent className="p-6">
          {/* Objects Display */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-4">Available Objects</h3>
            <div className="flex justify-center gap-3 mb-4">
              {objects.map((obj, index) => (
                <motion.div
                  key={obj}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                >
                  {obj}
                </motion.div>
              ))}
            </div>
            <p className="text-gray-600">{getTypeDescription()}</p>
          </div>

          {/* Current Step Display */}
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

                {/* Arrangements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {currentArrangements.slice(0, 6).map((arrangement, arrIndex) => (
                    <motion.div
                      key={arrIndex}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: arrIndex * 0.1 }}
                      className={`p-3 rounded-lg border-2 ${
                        steps[currentStep].highlightIndices?.includes(arrIndex)
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-center gap-2">
                        {arrangement.map((item, itemIndex) => (
                          <motion.div
                            key={itemIndex}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: (arrIndex * 0.1) + (itemIndex * 0.05) }}
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm"
                          >
                            {item}
                          </motion.div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Arrangement {arrIndex + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {currentArrangements.length > 6 && (
                  <p className="text-sm text-gray-500">
                    +{currentArrangements.length - 6} more arrangements...
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formula Display */}
          {showFormula && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-6"
            >
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="text-lg font-bold mb-2 text-blue-800">Formula</h4>
                  <div className="text-2xl font-mono font-bold text-blue-600 mb-2">{formula}</div>
                  <p className="text-sm text-blue-700">{getFormulaExplanation()}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Answer Input */}
          {showFormula && !showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="max-w-xs mx-auto">
                <label className="block text-sm font-medium mb-2">Your Answer:</label>
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-lg font-bold"
                  placeholder="Enter number"
                />
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim()}
                  className="mt-3 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
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
              <Card className={`border-2 ${parseInt(userAnswer) === answer ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                <CardContent className="p-4">
                  <div className={`text-4xl mb-2 ${parseInt(userAnswer) === answer ? 'text-green-600' : 'text-red-600'}`}>
                    {parseInt(userAnswer) === answer ? '✅' : '❌'}
                  </div>
                  <h4 className="text-lg font-bold mb-2">
                    {parseInt(userAnswer) === answer ? 'Correct!' : 'Incorrect'}
                  </h4>
                  <p className="text-gray-700">
                    Answer: <span className="font-bold text-lg">{answer.toLocaleString()}</span>
                  </p>
                  {userAnswer && parseInt(userAnswer) !== answer && (
                    <p className="text-sm text-gray-600 mt-2">
                      Your answer: {userAnswer}
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
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
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
export const PermutationCombinationExample: React.FC = () => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const problems: PermutationCombinationProblem[] = [
    {
      title: "Word Arrangements",
      description: "How many different 3-letter words can be formed using the letters A, B, C?",
      type: 'permutation',
      objects: ['A', 'B', 'C'],
      answer: 6,
      formula: "3! = 6",
      difficulty: 'easy',
      steps: [
        {
          step: 1,
          description: "First Position",
          arrangements: [['A'], ['B'], ['C']],
          explanation: "Any of the 3 letters can go in the first position",
          highlightIndices: [0, 1, 2]
        },
        {
          step: 2,
          description: "Second Position",
          arrangements: [
            ['A', 'B'], ['A', 'C'],
            ['B', 'A'], ['B', 'C'],
            ['C', 'A'], ['C', 'B']
          ],
          explanation: "For each first letter, 2 remaining letters can go in second position",
          highlightIndices: [0, 2, 4]
        },
        {
          step: 3,
          description: "Third Position",
          arrangements: [
            ['A', 'B', 'C'], ['A', 'C', 'B'],
            ['B', 'A', 'C'], ['B', 'C', 'A'],
            ['C', 'A', 'B'], ['C', 'B', 'A']
          ],
          explanation: "For each combination of first two letters, only 1 letter remains",
          highlightIndices: [0, 2, 4]
        }
      ]
    },
    {
      title: "Committee Selection",
      description: "How many ways can we select a committee of 2 students from 4 students (A, B, C, D)?",
      type: 'combination',
      objects: ['A', 'B', 'C', 'D'],
      selectCount: 2,
      answer: 6,
      formula: "C(4,2) = 6",
      difficulty: 'easy',
      steps: [
        {
          step: 1,
          description: "Select First Member",
          arrangements: [
            ['A'], ['B'], ['C'], ['D']
          ],
          explanation: "Choose any of the 4 students for the first position",
          highlightIndices: [0, 1, 2, 3]
        },
        {
          step: 2,
          description: "Select Second Member",
          arrangements: [
            ['A', 'B'], ['A', 'C'], ['A', 'D'],
            ['B', 'C'], ['B', 'D'],
            ['C', 'D']
          ],
          explanation: "For each first choice, select from remaining students (order doesn't matter)",
          highlightIndices: [0, 3, 5]
        }
      ]
    },
    {
      title: "Circular Arrangements",
      description: "In how many ways can 3 people (A, B, C) be seated in a circular table?",
      type: 'circular-permutation',
      objects: ['A', 'B', 'C'],
      answer: 2,
      formula: "(3-1)! = 2",
      difficulty: 'medium',
      steps: [
        {
          step: 1,
          description: "Fix One Position",
          arrangements: [['A']],
          explanation: "In circular arrangements, we fix one person's position to avoid counting rotations as different",
          highlightIndices: [0]
        },
        {
          step: 2,
          description: "Arrange Remaining",
          arrangements: [
            ['A', 'B', 'C'],
            ['A', 'C', 'B']
          ],
          explanation: "With A fixed, arrange B and C in the remaining 2 positions",
          highlightIndices: [0, 1]
        }
      ]
    },
    {
      title: "Word Formation with Restrictions",
      description: "How many 4-letter words can be formed from letters A,B,C,D,E,F with no repetitions?",
      type: 'permutation',
      objects: ['A', 'B', 'C', 'D', 'E', 'F'],
      selectCount: 4,
      answer: 360,
      formula: "P(6,4) = 360",
      difficulty: 'medium',
      steps: [
        {
          step: 1,
          description: "First Position",
          arrangements: [['A'], ['B'], ['C'], ['D'], ['E'], ['F']],
          explanation: "6 choices for first letter",
          highlightIndices: [0, 1, 2, 3, 4, 5]
        },
        {
          step: 2,
          description: "Second Position",
          arrangements: [
            ['A', 'B'], ['A', 'C'], ['A', 'D'], ['A', 'E'], ['A', 'F'],
            ['B', 'A'], ['B', 'C'], ['B', 'D'], ['B', 'E'], ['B', 'F'],
            ['C', 'A'], ['C', 'B'], ['C', 'D'], ['C', 'E'], ['C', 'F'],
            ['D', 'A'], ['D', 'B'], ['D', 'C'], ['D', 'E'], ['D', 'F'],
            ['E', 'A'], ['E', 'B'], ['E', 'C'], ['E', 'D'], ['E', 'F'],
            ['F', 'A'], ['F', 'B'], ['F', 'C'], ['F', 'D'], ['F', 'E']
          ].slice(0, 6),
          explanation: "5 choices remain for second position",
          highlightIndices: [0, 6, 12, 18, 24, 30]
        },
        {
          step: 3,
          description: "Third Position",
          arrangements: [
            ['A', 'B', 'C'], ['A', 'B', 'D'], ['A', 'B', 'E'], ['A', 'B', 'F'], ['A', 'B', 'F'],
            ['A', 'C', 'B'], ['A', 'C', 'D'], ['A', 'C', 'E'], ['A', 'C', 'F'], ['A', 'C', 'F']
          ].slice(0, 6),
          explanation: "4 choices remain for third position",
          highlightIndices: [0, 5, 10, 15, 20, 25]
        },
        {
          step: 4,
          description: "Fourth Position",
          arrangements: [
            ['A', 'B', 'C', 'D'], ['A', 'B', 'C', 'E'], ['A', 'B', 'C', 'F'],
            ['A', 'B', 'D', 'C'], ['A', 'B', 'D', 'E'], ['A', 'B', 'D', 'F']
          ],
          explanation: "3 choices remain for fourth position",
          highlightIndices: [0, 3]
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
          Permutations & Combinations Challenge
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

      <PermutationCombinationAnimation
        key={currentProblem}
        title={currentProblemData.title}
        description={currentProblemData.description}
        type={currentProblemData.type}
        objects={currentProblemData.objects}
        selectCount={currentProblemData.selectCount}
        answer={currentProblemData.answer}
        formula={currentProblemData.formula}
        steps={currentProblemData.steps}
        difficulty={currentProblemData.difficulty}
        onComplete={handleComplete}
      />
    </div>
  );
};
