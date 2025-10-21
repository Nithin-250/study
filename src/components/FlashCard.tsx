import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, CheckCircle, XCircle } from "lucide-react";

interface FlashCardProps {
  question: string;
  answer: string;
  onCorrect: () => void;
  onIncorrect: () => void;
  className?: string;
}

export const FlashCard = ({ question, answer, onCorrect, onIncorrect, className }: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (isCorrect: boolean) => {
    setHasAnswered(true);
    if (isCorrect) {
      onCorrect();
    } else {
      onIncorrect();
    }
    
    // Reset card after a delay
    setTimeout(() => {
      setIsFlipped(false);
      setHasAnswered(false);
    }, 1500);
  };

  return (
    <div className={`perspective-1000 ${className}`}>
      <motion.div
        className="flip-card relative w-full h-80"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front Side - Question */}
        <Card 
          className="flip-card-face absolute inset-0 card-3d bg-gradient-to-br from-card to-primary/5 cursor-pointer"
          onClick={!isFlipped ? handleFlip : undefined}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-xl md:text-2xl font-semibold text-card-foreground leading-relaxed">
                {question}
              </h3>
            </div>
            <div className="mt-6">
              <Button variant="outline" size="sm" className="pointer-events-none">
                <RotateCcw className="w-4 h-4 mr-2" />
                Click to reveal answer
              </Button>
            </div>
          </div>
        </Card>

        {/* Back Side - Answer */}
        <Card 
          className="flip-card-face absolute inset-0 card-3d bg-gradient-to-br from-card to-success/5"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {answer}
              </p>
            </div>
            
            {!hasAnswered ? (
              <motion.div 
                className="flex gap-4 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="destructive"
                  onClick={() => handleAnswer(false)}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Incorrect
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleAnswer(true)}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Correct
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-6"
              >
                <div className="text-2xl">
                  {hasAnswered ? "✨" : ""}
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};