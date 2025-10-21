import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'quiz' | 'loading' | 'results';
  className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  variant = 'quiz', 
  className = '' 
}) => {
  const getParticleCount = () => {
    switch (variant) {
      case 'quiz': return 20;
      case 'loading': return 15;
      case 'results': return 30;
      default: return 20;
    }
  };

  const getParticleColors = () => {
    switch (variant) {
      case 'quiz': return ['bg-purple-300', 'bg-blue-300', 'bg-pink-300', 'bg-indigo-300'];
      case 'loading': return ['bg-gray-300', 'bg-gray-400', 'bg-gray-500'];
      case 'results': return ['bg-yellow-300', 'bg-green-300', 'bg-blue-300', 'bg-purple-300'];
      default: return ['bg-purple-300', 'bg-blue-300', 'bg-pink-300'];
    }
  };

  const particles = Array.from({ length: getParticleCount() });
  const colors = getParticleColors();

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100" />
      
      {/* Animated Gradient Overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 80%, rgba(119, 179, 255, 0.3) 0%, transparent 50%)",
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      {/* Floating Particles */}
      {particles.map((_, index) => {
        const size = Math.random() * 8 + 4;
        const initialX = Math.random() * window.innerWidth;
        const initialY = Math.random() * window.innerHeight;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 20 + 15;
        
        return (
          <motion.div
            key={index}
            className={`absolute rounded-full ${color} opacity-20`}
            style={{
              width: size,
              height: size,
              left: initialX,
              top: initialY,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
              scale: [1, 1.2, 0.8, 1],
              opacity: [0.1, 0.3, 0.1, 0.2]
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
          />
        );
      })}

      {/* Geometric Shapes */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 border-2 border-purple-200 rounded-full opacity-20"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="absolute top-40 right-32 w-24 h-24 border-2 border-blue-200 opacity-20"
        style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
        animate={{
          rotate: [0, -360],
          y: [0, -20, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-32 left-1/3 w-28 h-28 border-2 border-pink-200 opacity-20 transform rotate-45"
        animate={{
          rotate: [45, 405],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Pulsing Orbs */}
      {variant === 'quiz' && (
        <>
          <motion.div
            className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-10"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.1, 0.25, 0.1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </>
      )}

      {/* Success Celebration Effect (for results variant) */}
      {variant === 'results' && (
        <div className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, index) => (
            <motion.div
              key={`celebration-${index}`}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [0, (Math.cos(index * (360 / 8) * (Math.PI / 180)) * 200)],
                y: [0, (Math.sin(index * (360 / 8) * (Math.PI / 180)) * 200)],
                scale: [1, 0.5, 0],
                opacity: [1, 0.7, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(120, 119, 198, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 119, 198, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
};
