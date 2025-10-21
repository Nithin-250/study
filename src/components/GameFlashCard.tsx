import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Star, 
  Zap, 
  Trophy, 
  Target,
  Flame,
  Award,
  Sparkles,
  Crown,
  Shield,
  Gem
} from "lucide-react";

interface GameFlashCardProps {
  question: string;
  answer: string;
  onCorrect: () => void;
  onIncorrect: () => void;
  className?: string;
  streak?: number;
  score?: number;
  level?: number;
}

export const GameFlashCard = ({ 
  question, 
  answer, 
  onCorrect, 
  onIncorrect, 
  className,
  streak = 0,
  score = 0,
  level = 1
}: GameFlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);

  // Calculate combo multiplier based on streak
  useEffect(() => {
    const newMultiplier = Math.floor(streak / 3) + 1;
    setComboMultiplier(newMultiplier);
  }, [streak]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0 && !hasAnswered) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && !hasAnswered) {
      handleAnswer(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, hasAnswered]);

  const handleFlip = () => {
    if (!isActive) setIsActive(true);
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (correct: boolean) => {
    setHasAnswered(true);
    setIsCorrect(correct);
    
    if (correct) {
      onCorrect();
      // Create particle explosion effect
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      setParticles(newParticles);
      
      if (streak > 0 && streak % 5 === 0) {
        setShowConfetti(true);
      }
    } else {
      onIncorrect();
    }
    
    setTimeout(() => {
      setIsFlipped(false);
      setHasAnswered(false);
      setIsCorrect(null);
      setShowConfetti(false);
      setParticles([]);
      setTimeLeft(30);
      setIsActive(false);
    }, 2500);
  };

  const getStreakColor = () => {
    if (streak >= 10) return "text-purple-500";
    if (streak >= 5) return "text-yellow-500";
    if (streak >= 3) return "text-orange-500";
    return "text-primary";
  };

  const getLevelIcon = () => {
    if (level >= 10) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (level >= 5) return <Shield className="w-5 h-5 text-blue-500" />;
    return <Star className="w-5 h-5 text-accent" />;
  };

  const getScoreColor = () => {
    if (score >= 1000) return "text-purple-500";
    if (score >= 500) return "text-yellow-500";
    if (score >= 200) return "text-blue-500";
    return "text-primary";
  };

  return (
    <div className={`perspective-1000 ${className}`}>
      {/* Advanced Game Stats Header */}
      <div className="relative mb-4 p-6 bg-gradient-to-r from-card/80 via-primary/10 to-accent/10 backdrop-blur-sm rounded-xl border border-primary/20 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, hsl(var(--primary)) 1px, transparent 1px),
              radial-gradient(circle at 80% 50%, hsl(var(--accent)) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className={`font-tech font-bold text-2xl ${getScoreColor()}`}>{score.toLocaleString()}</span>
              {comboMultiplier > 1 && (
                <motion.span 
                  className="text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  x{comboMultiplier}
                </motion.span>
              )}
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-2"
              animate={{ scale: streak > 0 ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 1, repeat: streak > 0 ? Infinity : 0 }}
            >
              <Flame className={`w-6 h-6 ${getStreakColor()}`} />
              <span className="font-tech font-bold text-xl">{streak}</span>
              {streak >= 10 && <Sparkles className="w-4 h-4 text-purple-500" />}
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              {getLevelIcon()}
              <span className="font-tech font-semibold">Level {level}</span>
              {level >= 5 && <Gem className="w-4 h-4 text-cyan-500" />}
            </motion.div>
          </div>
          
          {isActive && !hasAnswered && (
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-primary" />
              <div className="w-32">
                <Progress 
                  value={(timeLeft / 30) * 100} 
                  className="h-3"
                />
              </div>
              <span className="font-mono text-lg font-bold min-w-[3rem] text-primary">{timeLeft}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Particle Effects */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full pointer-events-none z-50"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
              y: [-50, -150],
              x: [(Math.random() - 0.5) * 100]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      <motion.div
        className="flip-card relative w-full h-96"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
        }}
      >
        {/* Front Side - Question */}
        <Card 
          className="flip-card-face absolute inset-0 card-3d bg-gradient-to-br from-card via-primary/5 to-accent/10 cursor-pointer group overflow-hidden"
          onClick={!isFlipped ? handleFlip : undefined}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            {/* Enhanced Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <motion.div 
                className="absolute inset-0" 
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 25% 25%, hsl(var(--primary)) 2px, transparent 2px),
                    radial-gradient(circle at 75% 75%, hsl(var(--accent)) 2px, transparent 2px)
                  `,
                  backgroundSize: '40px 40px'
                }}
                animate={{ 
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] 
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </div>
            
            {/* Floating Geometric Shapes */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 border border-primary/20 rounded"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 40}%`,
                  }}
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.6, 0.2]
                  }}
                  transition={{
                    duration: 8 + i * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5
                  }}
                />
              ))}
            </div>
            
            <div className="flex-1 flex items-center justify-center relative z-10">
              <motion.h3 
                className="text-xl md:text-2xl font-tech font-semibold text-card-foreground leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                {question}
              </motion.h3>
            </div>
            
            <motion.div 
              className="mt-6"
              whileHover={{ scale: 1.05 }}
            >
              <Button variant="outline" size="sm" className="pointer-events-none group-hover:bg-primary/10 border-primary/30">
                <RotateCcw className="w-4 h-4 mr-2" />
                <span className="font-modern">Flip to reveal answer</span>
              </Button>
            </motion.div>

            {/* Enhanced Floating Elements */}
            <div className="absolute top-4 right-4">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 10, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                <Zap className="w-6 h-6 text-primary/40" />
              </motion.div>
            </div>
            
            <div className="absolute bottom-4 left-4">
              <motion.div
                animate={{ 
                  y: [-5, 5, -5],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Sparkles className="w-5 h-5 text-accent/40" />
              </motion.div>
            </div>
          </div>
        </Card>

        {/* Back Side - Answer */}
        <Card 
          className="flip-card-face absolute inset-0 card-3d bg-gradient-to-br from-card via-success/5 to-primary/10 overflow-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            {/* Enhanced Success/Fail Animation */}
            <AnimatePresence>
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-40">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][i % 5],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      initial={{ scale: 0, opacity: 1, rotate: 0 }}
                      animate={{ 
                        scale: [0, 1, 0],
                        opacity: [1, 1, 0],
                        y: [-30, -150],
                        x: [(Math.random() - 0.5) * 200],
                        rotate: [0, 360]
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ 
                        duration: 2, 
                        delay: Math.random() * 0.8,
                        ease: "easeOut" 
                      }}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>

            <div className="flex-1 flex items-center justify-center relative z-10">
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground leading-relaxed font-modern"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                {answer}
              </motion.p>
            </div>
            
            {!hasAnswered ? (
              <motion.div 
                className="flex gap-4 mt-6 w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="destructive"
                  onClick={() => handleAnswer(false)}
                  className="flex-1 text-lg py-6 font-modern transform hover:scale-105 transition-transform"
                  size="lg"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Incorrect
                </Button>
                <Button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 text-lg py-6 bg-success hover:bg-success/90 font-modern transform hover:scale-105 transition-transform"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Correct
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-6"
              >
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 360]
                    }}
                    transition={{ duration: 0.8 }}
                    className={`text-6xl ${isCorrect ? 'text-success' : 'text-destructive'} relative`}
                  >
                    {isCorrect ? (
                      <div className="relative">
                        <Award className="w-20 h-20" />
                        <motion.div
                          className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </div>
                    ) : (
                      <XCircle className="w-20 h-20" />
                    )}
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <p className="text-3xl font-tech font-bold mb-2">
                      {isCorrect ? `+${(10 + streak * 2) * comboMultiplier} Points!` : 'Try Again!'}
                    </p>
                    {isCorrect && streak >= 3 && (
                      <motion.p 
                        className="text-xl font-modern text-primary flex items-center justify-center gap-2"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: 3 }}
                      >
                        <Flame className="w-5 h-5" />
                        {streak} Streak! {comboMultiplier > 1 && `${comboMultiplier}x Multiplier!`}
                        <Sparkles className="w-5 h-5" />
                      </motion.p>
                    )}
                    {isCorrect && level > 1 && (
                      <p className="text-lg font-modern text-accent mt-2">
                        Level {level} Mastery!
                      </p>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};