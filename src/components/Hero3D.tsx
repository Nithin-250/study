import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Brain, Trophy, Zap, Cpu, Database, Network, Sparkles } from "lucide-react";

export const Hero3D = () => {
  const floatingIcons = [
    { icon: Cpu, delay: 0, position: "top-20 left-20", color: "text-primary" },
    { icon: Database, delay: 0.5, position: "top-32 right-32", color: "text-accent" },
    { icon: Network, delay: 1, position: "bottom-32 left-32", color: "text-secondary" },
    { icon: Sparkles, delay: 1.5, position: "bottom-20 right-20", color: "text-success" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/10 to-accent/20">
      {/* 3D Geometric Background */}
      <div className="absolute inset-0">
        {/* Floating 3D Cubes */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`cube-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              perspective: '1000px'
            }}
            animate={{
              rotateX: [0, 360],
              rotateY: [0, 360],
              y: [-20, 20, -20],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5
            }}
          >
            <div 
              className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${i * 30}deg) rotateY(${i * 45}deg)`
              }}
            />
          </motion.div>
        ))}

        {/* Hexagonal Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexagons" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
                <polygon points="25,0 50,14.43 50,28.87 25,43.3 0,28.87 0,14.43" 
                         fill="none" 
                         stroke="hsl(var(--primary))" 
                         strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        {/* Animated Neural Network Lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.line
              key={`line-${i}`}
              x1={`${10 + i * 15}%`}
              y1="0%"
              x2={`${20 + i * 15}%`}
              y2="100%"
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              opacity="0.2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 0],
                opacity: [0, 0.4, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </svg>

        {/* Pulsing Energy Orbs */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-lg"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              width: `${60 + i * 20}px`,
              height: `${60 + i * 20}px`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
              y: [-10, 10, -10]
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8
            }}
          />
        ))}
      </div>
      {/* Floating Tech Icons */}
      {floatingIcons.map(({ icon: Icon, delay, position, color }, index) => (
        <motion.div
          key={index}
          className={`absolute ${position} opacity-20 hidden lg:block`}
          initial={{ y: 0, rotate: 0, scale: 1 }}
          animate={{ 
            y: [-30, 30, -30], 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 12,
            delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            <Icon size={100} className={`${color} drop-shadow-lg`} />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl"></div>
          </div>
        </motion.div>
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.h1 
                className="text-6xl md:text-8xl font-tech font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.5)",
                    "0 0 40px rgba(139, 92, 246, 0.5)",
                    "0 0 20px rgba(59, 130, 246, 0.5)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                StudyGenius
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Transform any topic into interactive flashcards, quizzes, and audio summaries. 
                Master subjects through gamified learning.
              </motion.p>
            </div>

            {/* Feature Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {[
                { icon: BookOpen, title: "Smart Flashcards", desc: "AI-generated from any text" },
                { icon: Brain, title: "Interactive Quizzes", desc: "Gamified learning experience" },
                { icon: Trophy, title: "Progress Tracking", desc: "Badges and achievements" }
              ].map((feature, index) => (
                <Card key={index} className="card-3d p-6 bg-card/80 backdrop-blur-sm border-border/50">
                  <motion.div
                    className="text-center space-y-3"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </motion.div>
                </Card>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Button 
                variant="hero" 
                size="lg" 
                className="text-lg px-8 py-4 pulse-glow"
                onClick={() => document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Learning Now
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Tech Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-30, -60, -30],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            <div className={`w-${1 + Math.floor(Math.random() * 3)} h-${1 + Math.floor(Math.random() * 3)} bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-sm`}></div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};