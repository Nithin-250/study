import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotateCcw, Eye, EyeOff } from 'lucide-react';

interface AnimatedFlipcardProps {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cardNumber: number;
  totalCards: number;
  showAnswer: boolean;
  onToggleAnswer: () => void;
}

export const AnimatedFlipcard: React.FC<AnimatedFlipcardProps> = ({
  question,
  answer,
  difficulty,
  cardNumber,
  totalCards,
  showAnswer,
  onToggleAnswer
}) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      onToggleAnswer();
      setIsFlipping(false);
    }, 300);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="perspective-1000 w-full max-w-2xl mx-auto">
      <motion.div
        className="relative w-full h-[450px] preserve-3d cursor-pointer"
        initial={{ rotateY: 0 }}
        animate={{ 
          rotateY: showAnswer ? 180 : 0,
          scale: isHovered ? 1.02 : 1,
          y: isHovered ? -5 : 0
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.6 
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleFlip}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {/* Front Side - Question */}
        <motion.div
          className="absolute inset-0 backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)'
          }}
        >
          <Card className="w-full h-full bg-gradient-to-br from-purple-50 via-white to-pink-50 border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8 h-full flex flex-col justify-between">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                    📚 Question {cardNumber} of {totalCards}
                  </Badge>
                  <Badge className={getDifficultyColor(difficulty)}>
                    {difficulty.toUpperCase()}
                  </Badge>
                </div>
                <motion.div
                  animate={{ rotate: isFlipping ? 360 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Eye className="w-5 h-5 text-purple-600" />
                </motion.div>
              </div>

              {/* Question Content */}
              <div className="flex-1 flex flex-col justify-center text-center">
                <motion.h3 
                  className="text-2xl font-bold text-gray-800 mb-6 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {question}
                </motion.h3>
              </div>

              {/* Footer */}
              <div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFlip();
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full shadow-lg"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Flip to Answer
                  </Button>
                </motion.div>
                <p className="text-sm text-gray-500 mt-3 flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    💡
                  </motion.span>
                  Click anywhere to flip the card
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back Side - Answer */}
        <motion.div
          className="absolute inset-0 backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <Card className="w-full h-full bg-gradient-to-br from-green-50 via-white to-blue-50 border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8 h-full flex flex-col justify-between">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    ✅ Answer {cardNumber} of {totalCards}
                  </Badge>
                  <Badge className={getDifficultyColor(difficulty)}>
                    {difficulty.toUpperCase()}
                  </Badge>
                </div>
                <motion.div
                  animate={{ rotate: isFlipping ? 360 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <EyeOff className="w-5 h-5 text-green-600" />
                </motion.div>
              </div>

              {/* Answer Content */}
              <div className="flex-1 flex flex-col justify-center">
                <motion.div 
                  className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-100 mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-lg text-gray-800 leading-relaxed text-center">
                    {answer}
                  </p>
                </motion.div>
              </div>

              {/* Study Complete Message */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 mb-4">
                  <p className="text-blue-800 font-medium">
                    📚 Study this concept and continue when ready
                  </p>
                </div>
              </div>

              {/* Back to Question */}
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    🔄
                  </motion.span>
                  Click anywhere to flip back to question
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* CSS for 3D flip effect */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};
