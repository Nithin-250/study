import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  WifiOff, 
  Wifi,
  Brain,
  Zap,
  Play
} from 'lucide-react';

interface OfflineModeIndicatorProps {
  onOfflineQuizLaunch: () => void;
  className?: string;
}

export const OfflineModeIndicator: React.FC<OfflineModeIndicatorProps> = ({
  onOfflineQuizLaunch,
  className = ''
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowPulse(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowPulse(true);
      // Stop pulse after 5 seconds
      setTimeout(() => setShowPulse(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial pulse if already offline
    if (!isOnline) {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 5000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`fixed top-4 right-4 z-50 ${className}`}
            >
              <div className="flex items-center gap-2 bg-green-50/90 backdrop-blur-sm border border-green-200 rounded-full px-3 py-2 shadow-sm">
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Online</span>
              </div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white border shadow-lg">
            <p className="text-sm">Connected to internet</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`fixed top-4 right-4 z-50 ${className}`}
          >
            <motion.div
              animate={showPulse ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: showPulse ? Infinity : 0 }}
            >
              <Button
                onClick={onOfflineQuizLaunch}
                variant="outline"
                size="sm"
                className="relative bg-red-50/95 hover:bg-red-100/95 border-red-200 hover:border-red-300 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                {/* Pulse Ring */}
                <AnimatePresence>
                  {showPulse && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      exit={{ scale: 1, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-red-400"
                    />
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <WifiOff className="w-4 h-4 text-red-600" />
                  </motion.div>
                  
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-medium text-red-700">Offline Mode</span>
                    <div className="flex items-center gap-1">
                      <Brain className="w-3 h-3 text-red-500" />
                      <span className="text-[10px] text-red-600">Quiz Ready</span>
                    </div>
                  </div>
                  
                  {/* New Quiz Badge */}
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      delay: 1 
                    }}
                  >
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-[8px] px-1 py-0 ml-1">
                      20Q
                    </Badge>
                  </motion.div>

                  {/* Hover Play Icon */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    className="absolute -right-2 -top-2 bg-purple-500 text-white rounded-full p-1 shadow-lg"
                  >
                    <Play className="w-3 h-3" />
                  </motion.div>
                </div>
              </Button>
            </motion.div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-white border shadow-lg max-w-xs">
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-700">You're Offline!</p>
            <p className="text-xs text-gray-600">
              Click to start a 20-question aptitude quiz that works without internet
            </p>
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <Zap className="w-3 h-3" />
              <span>New questions each time</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
