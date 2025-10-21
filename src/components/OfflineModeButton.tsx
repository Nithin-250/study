import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  WifiOff, 
  Brain,
  Zap,
  Target,
  ArrowRight
} from 'lucide-react';

interface OfflineModeButtonProps {
  onClick: () => void;
  className?: string;
}

export const OfflineModeButton: React.FC<OfflineModeButtonProps> = ({
  onClick,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Button
        onClick={onClick}
        size="lg"
        className="relative bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-6 text-lg shadow-xl transform hover:scale-105 transition-all duration-300 group overflow-hidden"
      >
        {/* Background Animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
        
        {/* Content */}
        <div className="relative flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <WifiOff className="w-6 h-6" />
          </motion.div>
          
          <div className="flex flex-col items-start">
            <span className="font-bold">Offline Mode</span>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Brain className="w-4 h-4" />
              <span>Aptitude Quiz Ready</span>
            </div>
          </div>
          
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="w-5 h-5" />
          </motion.div>
          
          {/* Pulse Badge */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: 0.5 
            }}
          >
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white ml-2">
              <Target className="w-3 h-3 mr-1" />
              Ready
            </Badge>
          </motion.div>
        </div>
        
        {/* Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            repeatDelay: 2,
            ease: "easeInOut" 
          }}
        />
      </Button>
    </motion.div>
  );
};
