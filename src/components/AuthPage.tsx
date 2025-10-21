import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chrome, BookOpen, Brain, Trophy } from "lucide-react";
import { toast } from "sonner";

interface AuthPageProps {
  onSignIn: () => void;
}

export const AuthPage = ({ onSignIn }: AuthPageProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    toast.success("Connecting to Google...");
    
    // Simulate Google sign in
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    onSignIn();
    toast.success("Successfully signed in!");
  };

  const floatingElements = [
    { icon: BookOpen, delay: 0, position: "top-20 left-20", color: "text-primary" },
    { icon: Brain, delay: 0.5, position: "top-32 right-32", color: "text-accent" },
    { icon: Trophy, delay: 1, position: "bottom-32 left-32", color: "text-secondary" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Floating Background Icons */}
      {floatingElements.map(({ icon: Icon, delay, position, color }, index) => (
        <motion.div
          key={index}
          className={`absolute ${position} opacity-10 hidden lg:block`}
          initial={{ y: 0, rotate: 0, scale: 1 }}
          animate={{ 
            y: [-20, 20, -20], 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 8,
            delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon size={100} className={color} />
        </motion.div>
      ))}

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-30, -60, -30],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto"
        >
          {/* Logo and Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 pulse-glow">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-4">
              StudyGenius
            </h1>
            <p className="text-muted-foreground text-lg">
              Your AI-powered learning companion
            </p>
          </motion.div>

          {/* Sign In Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="card-3d p-8 bg-card/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Welcome Back!</h2>
                  <p className="text-muted-foreground">
                    Sign in to continue your learning journey
                  </p>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full text-lg py-6"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-3"
                    >
                      <Chrome className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Chrome className="w-5 h-5 mr-3" />
                  )}
                  {isLoading ? "Signing in..." : "Continue with Google"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Secure authentication powered by Google</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-3 gap-4 mt-8"
          >
            {[
              { icon: BookOpen, label: "Smart Cards" },
              { icon: Brain, label: "AI Quizzes" },
              { icon: Trophy, label: "Achievements" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <feature.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">{feature.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};