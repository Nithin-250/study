import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Flame, Star } from "lucide-react";

interface ProgressTrackerProps {
  score: number;
  streak: number;
  totalQuestions: number;
  answeredQuestions: number;
  badges: string[];
  className?: string;
}

export const ProgressTracker = ({ 
  score, 
  streak, 
  totalQuestions, 
  answeredQuestions, 
  badges,
  className 
}: ProgressTrackerProps) => {
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  
  const getBadgeInfo = (badge: string) => {
    switch (badge) {
      case "bronze":
        return { icon: Trophy, color: "bg-gradient-to-r from-orange-600 to-orange-400", label: "Bronze Badge" };
      case "silver":
        return { icon: Trophy, color: "bg-gradient-to-r from-gray-400 to-gray-300", label: "Silver Badge" };
      case "gold":
        return { icon: Trophy, color: "bg-gradient-to-r from-yellow-400 to-yellow-300", label: "Gold Badge" };
      default:
        return { icon: Star, color: "bg-gradient-to-r from-purple-500 to-pink-500", label: badge };
    }
  };

  return (
    <Card className={`card-3d p-6 bg-card/80 backdrop-blur-sm ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-card-foreground mb-2">Your Progress</h3>
          <p className="text-muted-foreground">Keep learning to unlock achievements!</p>
        </div>

        {/* Score and Streak */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-primary mr-2" />
              <span className="text-2xl font-bold text-primary">{score}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Score</p>
          </motion.div>

          <motion.div
            className="text-center p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-center mb-2">
              <Flame className="w-6 h-6 text-secondary mr-2" />
              <span className="text-2xl font-bold text-secondary">{streak}</span>
            </div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Session Progress</span>
            <span className="font-medium">{answeredQuestions}/{totalQuestions}</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(progressPercentage)}% Complete
          </p>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-center">Achievements</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {badges.map((badge, index) => {
                const badgeInfo = getBadgeInfo(badge);
                return (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      bounce: 0.6, 
                      delay: index * 0.1 
                    }}
                  >
                    <Badge 
                      className={`${badgeInfo.color} text-white px-3 py-1 text-xs font-medium shadow-lg`}
                    >
                      <badgeInfo.icon className="w-3 h-3 mr-1" />
                      {badgeInfo.label}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Next Achievement Preview */}
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground mb-1">Next Achievement</p>
          <div className="flex items-center justify-center text-sm">
            <Trophy className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>
              {badges.length === 0 ? "Bronze Badge - 10 correct answers" :
               badges.length === 1 ? "Silver Badge - 25 correct answers" :
               badges.length === 2 ? "Gold Badge - 50 correct answers" :
               "Master Badge - 100 correct answers"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};