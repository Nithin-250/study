import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface UserOnboardingProps {
  onComplete: (userData: { name: string; age: string }) => void;
}

export const UserOnboarding = ({ onComplete }: UserOnboardingProps) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name!");
      return;
    }
    if (!age) {
      toast.error("Please select your age!");
      return;
    }

    setIsSubmitting(true);
    toast.success("Setting up your personalized experience...");
    
    // Simulate profile setup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onComplete({ name: name.trim(), age });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
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
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Let's Get Started!
            </h1>
            <p className="text-muted-foreground text-lg">
              Tell us a bit about yourself for a personalized experience
            </p>
          </motion.div>

          {/* Onboarding Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="card-3d p-8 bg-card/80 backdrop-blur-sm">
              <div className="space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-base font-medium">
                    <User className="w-4 h-4 text-primary" />
                    What's your name?
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-base py-3"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Age Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base font-medium">
                    <Calendar className="w-4 h-4 text-primary" />
                    How old are you?
                  </Label>
                  <Select value={age} onValueChange={setAge} disabled={isSubmitting}>
                    <SelectTrigger className="text-base py-3">
                      <SelectValue placeholder="Select your age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-13">Under 13</SelectItem>
                      <SelectItem value="13-17">13-17 years</SelectItem>
                      <SelectItem value="18-24">18-24 years</SelectItem>
                      <SelectItem value="25-34">25-34 years</SelectItem>
                      <SelectItem value="35-44">35-44 years</SelectItem>
                      <SelectItem value="45-54">45-54 years</SelectItem>
                      <SelectItem value="55-plus">55+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !name.trim() || !age}
                  className="w-full text-lg py-6 mt-8"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-3"
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Sparkles className="w-5 h-5 mr-3" />
                  )}
                  {isSubmitting ? "Creating your profile..." : "Start Learning Journey"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  We'll use this information to personalize your learning experience
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-center mt-6"
          >
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <div className="w-2 h-2 rounded-full bg-primary/30"></div>
              <div className="w-2 h-2 rounded-full bg-primary/30"></div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};