import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  Users, 
  Hash, 
  Clock, 
  Wrench, 
  Dices, 
  Target,
  Droplets,
  Car,
  Anchor,
  Shuffle,
  ArrowRight,
  Home,
  RotateCcw,
  Zap
} from 'lucide-react';

// Import all animation components
import { DirectionSenseExample } from './DirectionSenseAnimation';
import { BloodRelationsExample } from './BloodRelationsAnimation';
import { NumberSeriesExample } from './NumberSeriesAnimation';
import { ClockProblemsExample } from './ClockProblemsAnimation';
import { PermutationCombinationExample } from './PermutationCombinationAnimation';
import { BoatStreamExample } from './BoatStreamAnimation';

// Animation types available
export type AnimationType = 
  | 'direction-sense'
  | 'blood-relations' 
  | 'number-series'
  | 'clock-problems'
  | 'work-time'
  | 'permutations'
  | 'probability'
  | 'pipes-cisterns'
  | 'speed-distance'
  | 'boat-stream';

interface AnimationOption {
  id: AnimationType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  isImplemented: boolean;
  comingSoon?: boolean;
}

interface AnimationManagerProps {
  onBackToHome?: () => void;
  selectedAnimation?: AnimationType | null;
  onAnimationChange?: (animation: AnimationType | null) => void;
  autoSelectRandom?: boolean;
}

export const AnimationManager: React.FC<AnimationManagerProps> = ({
  onBackToHome,
  selectedAnimation: controlledAnimation,
  onAnimationChange,
  autoSelectRandom = false
}) => {
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationType | null>(
    controlledAnimation || null
  );
  const [isRandomMode, setIsRandomMode] = useState(false);

  // Auto-select random animation if requested
  useEffect(() => {
    if (autoSelectRandom && !selectedAnimation) {
      selectRandomAnimation();
    }
  }, [autoSelectRandom]);

  // Animation options configuration
  const animationOptions: AnimationOption[] = [
    {
      id: 'direction-sense',
      title: 'Direction Sense',
      description: 'Navigate through paths with animated character movement and track final positions',
      icon: <Navigation className="w-8 h-8" />,
      color: 'from-blue-500 to-indigo-500',
      difficulty: 'easy',
      estimatedTime: '5-8 min',
      isImplemented: true
    },
    {
      id: 'blood-relations',
      title: 'Blood Relations',
      description: 'Interactive family tree with clickable members to explore relationships',
      icon: <Users className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      difficulty: 'medium',
      estimatedTime: '6-10 min',
      isImplemented: true
    },
    {
      id: 'number-series',
      title: 'Number Series',
      description: 'Step-by-step pattern revelation with animated number sequences',
      icon: <Hash className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500',
      difficulty: 'medium',
      estimatedTime: '7-12 min',
      isImplemented: true
    },
    {
      id: 'clock-problems',
      title: 'Clock Problems',
      description: 'Animated clock face with moving hands and angle calculations',
      icon: <Clock className="w-8 h-8" />,
      color: 'from-orange-500 to-red-500',
      difficulty: 'hard',
      estimatedTime: '8-15 min',
      isImplemented: true
    },
    {
      id: 'work-time',
      title: 'Work & Time',
      description: 'Tank filling animation with multiple workers at different rates',
      icon: <Wrench className="w-8 h-8" />,
      color: 'from-teal-500 to-cyan-500',
      difficulty: 'medium',
      estimatedTime: '10-15 min',
      isImplemented: false,
      comingSoon: true
    },
    {
      id: 'permutations',
      title: 'Permutations & Combinations',
      description: 'Visualize arrangements of colored objects with animated transitions',
      icon: <Dices className="w-8 h-8" />,
      color: 'from-yellow-500 to-orange-500',
      difficulty: 'hard',
      estimatedTime: '12-20 min',
      isImplemented: true
    },
    {
      id: 'probability',
      title: 'Probability',
      description: 'Coin flip and dice roll simulations with probability calculations',
      icon: <Target className="w-8 h-8" />,
      color: 'from-rose-500 to-pink-500',
      difficulty: 'medium',
      estimatedTime: '8-12 min',
      isImplemented: false,
      comingSoon: true
    },
    {
      id: 'pipes-cisterns',
      title: 'Pipes & Cisterns',
      description: 'Tank with inlet/outlet pipes and animated water level changes',
      icon: <Droplets className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      difficulty: 'hard',
      estimatedTime: '10-18 min',
      isImplemented: false,
      comingSoon: true
    },
    {
      id: 'speed-distance',
      title: 'Speed, Distance & Time',
      description: 'Car movement animation with distance markers and speed visualization',
      icon: <Car className="w-8 h-8" />,
      color: 'from-indigo-500 to-purple-500',
      difficulty: 'medium',
      estimatedTime: '8-14 min',
      isImplemented: false,
      comingSoon: true
    },
    {
      id: 'boat-stream',
      title: 'Boat & Stream',
      description: 'Boat movement in river with current effects and distance calculations',
      icon: <Anchor className="w-8 h-8" />,
      color: 'from-blue-600 to-indigo-600',
      difficulty: 'hard',
      estimatedTime: '12-20 min',
      isImplemented: true
    }
  ];

  // Handle animation selection
  const handleAnimationSelect = (animationId: AnimationType) => {
    const option = animationOptions.find(opt => opt.id === animationId);
    if (option && option.isImplemented) {
      setSelectedAnimation(animationId);
      onAnimationChange?.(animationId);
    }
  };

  // Handle random animation selection
  const selectRandomAnimation = () => {
    const implementedAnimations = animationOptions.filter(opt => opt.isImplemented);
    if (implementedAnimations.length > 0) {
      const randomIndex = Math.floor(Math.random() * implementedAnimations.length);
      const randomAnimation = implementedAnimations[randomIndex];
      handleAnimationSelect(randomAnimation.id);
      setIsRandomMode(true);
    }
  };

  // Handle back to menu
  const handleBackToMenu = () => {
    setSelectedAnimation(null);
    setIsRandomMode(false);
    onAnimationChange?.(null);
  };

  // Render selected animation component
  const renderSelectedAnimation = () => {
    switch (selectedAnimation) {
      case 'direction-sense':
        return <DirectionSenseExample />;
      case 'blood-relations':
        return <BloodRelationsExample />;
      case 'number-series':
        return <NumberSeriesExample />;
      case 'clock-problems':
        return <ClockProblemsExample />;
      case 'permutations':
        return <PermutationCombinationExample />;
      case 'boat-stream':
        return <BoatStreamExample />;
      default:
        return null;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  // If an animation is selected, show that animation
  if (selectedAnimation) {
    return (
      <div className="space-y-6">
        {/* Animation Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBackToMenu}
              variant="outline"
              className="bg-gray-50 hover:bg-gray-100"
            >
              ← Back to Animations
            </Button>
            <div className="h-6 border-l border-gray-300" />
            <h1 className="text-xl font-bold text-gray-800">
              {animationOptions.find(opt => opt.id === selectedAnimation)?.title}
            </h1>
            {isRandomMode && (
              <Badge className="bg-purple-100 text-purple-800">
                Random Challenge
              </Badge>
            )}
          </div>
          
          {onBackToHome && (
            <Button
              onClick={onBackToHome}
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          )}
        </div>

        {/* Render Selected Animation */}
        <div className="px-4">
          {renderSelectedAnimation()}
        </div>
      </div>
    );
  }

  // Show animation selection menu
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-800 mb-4"
        >
          🎯 Interactive Aptitude Animations
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 mb-8"
        >
          Master aptitude concepts through engaging visual animations
        </motion.p>
        
        {/* Quick Actions */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={selectRandomAnimation}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
          >
            <Shuffle className="w-5 h-5 mr-2" />
            Quick Random Challenge
          </Button>
          
          {onBackToHome && (
            <Button
              onClick={onBackToHome}
              variant="outline"
              className="px-8 py-3 text-lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          )}
        </div>
      </div>

      {/* Animation Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {animationOptions.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: option.isImplemented ? 1.02 : 1 }}
            className="relative"
          >
            <Card className={`h-full cursor-pointer transition-all duration-300 ${
              option.isImplemented
                ? 'hover:shadow-xl border-2 hover:border-blue-300'
                : 'opacity-75 cursor-not-allowed'
            } ${option.comingSoon ? 'bg-gradient-to-br from-gray-50 to-gray-100' : 'bg-white'}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${option.color} 
                                 flex items-center justify-center text-white shadow-lg
                                 ${!option.isImplemented ? 'grayscale' : ''}`}>
                    {option.icon}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Badge className={getDifficultyColor(option.difficulty)}>
                      {option.difficulty}
                    </Badge>
                    {option.comingSoon && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {option.title}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {option.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {option.estimatedTime}
                  </div>
                  
                  <Button
                    onClick={() => handleAnimationSelect(option.id)}
                    disabled={!option.isImplemented}
                    size="sm"
                    className={option.isImplemented
                      ? `bg-gradient-to-r ${option.color} hover:shadow-md`
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  >
                    {option.isImplemented ? (
                      <>
                        Try It <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      'Coming Soon'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">
            {animationOptions.filter(opt => opt.isImplemented).length}
          </div>
          <div className="text-sm text-blue-700">Available Now</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-3xl font-bold text-purple-600">
            {animationOptions.filter(opt => opt.comingSoon).length}
          </div>
          <div className="text-sm text-purple-700">Coming Soon</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-green-600">
            {animationOptions.length}
          </div>
          <div className="text-sm text-green-700">Total Types</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="text-3xl font-bold text-orange-600">100%</div>
          <div className="text-sm text-orange-700">Interactive</div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimationManager;
