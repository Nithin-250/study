import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthPage } from "./AuthPage";
import { UserOnboarding } from "./UserOnboarding";
import { Hero3D } from "./Hero3D";
import { TopicInput } from "./TopicInput";
import { GameFlashCard } from "./GameFlashCard";
import { ProgressTracker } from "./ProgressTracker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, VolumeX, Shuffle, RotateCcw, Home, User } from "lucide-react";
import { toast } from "sonner";

interface StudyData {
  topic: string;
  flashcards: Array<{ question: string; answer: string; }>;
  summary: string;
}

type AppMode = "auth" | "onboarding" | "study";
type StudyMode = "input" | "flashcards" | "summary";

interface UserData {
  name: string;
  age: string;
}

// Mock study data generator
const generateStudyData = (topic: string): StudyData => {
  const flashcards = [
    { 
      question: `What is the main concept of ${topic}?`, 
      answer: `${topic} is a fundamental concept that involves key principles and applications in its field.` 
    },
    { 
      question: `Why is ${topic} important?`, 
      answer: `${topic} plays a crucial role in understanding broader concepts and has practical applications.` 
    },
    { 
      question: `What are the key components of ${topic}?`, 
      answer: `The main components include theoretical foundations, practical applications, and related concepts.` 
    },
    { 
      question: `How does ${topic} relate to other concepts?`, 
      answer: `${topic} connects to various related fields and serves as a building block for advanced topics.` 
    },
    { 
      question: `What are common applications of ${topic}?`, 
      answer: `${topic} is applied in real-world scenarios, research, and serves as foundation for further learning.` 
    },
  ];

  return {
    topic,
    flashcards,
    summary: `This is a comprehensive overview of ${topic}. The topic covers essential concepts, practical applications, and theoretical foundations that are important for understanding the subject matter.`
  };
};

export const StudyApp = () => {
  const [appMode, setAppMode] = useState<AppMode>("auth");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [studyMode, setStudyMode] = useState<StudyMode>("input");
  const [studyData, setStudyData] = useState<StudyData | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check for badge unlocks
  useEffect(() => {
    const correctAnswers = score / 10; // 10 points per correct answer
    const newBadges: string[] = [];
    
    if (correctAnswers >= 10 && !badges.includes("bronze")) {
      newBadges.push("bronze");
      toast.success("🏆 Bronze Badge Unlocked! 10 correct answers!");
    }
    if (correctAnswers >= 25 && !badges.includes("silver")) {
      newBadges.push("silver");
      toast.success("🏆 Silver Badge Unlocked! 25 correct answers!");
    }
    if (correctAnswers >= 50 && !badges.includes("gold")) {
      newBadges.push("gold");
      toast.success("🏆 Gold Badge Unlocked! 50 correct answers!");
    }

    if (newBadges.length > 0) {
      setBadges(prev => [...prev, ...newBadges]);
    }
  }, [score, badges]);

  const handleTopicSubmit = async (topic: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const data = generateStudyData(topic);
    setStudyData(data);
    setStudyMode("flashcards");
    setCurrentCardIndex(0);
    setAnsweredQuestions(0);
    setIsLoading(false);
    
    toast.success(`Study materials generated for "${topic}"!`);
  };

  const handleCorrectAnswer = () => {
    setScore(prev => prev + 10);
    setStreak(prev => prev + 1);
    setAnsweredQuestions(prev => prev + 1);
    
    // Move to next card
    setTimeout(() => {
      if (studyData && currentCardIndex < studyData.flashcards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        toast.success("🎉 Session completed! Great job!");
      }
    }, 1500);
  };

  const handleIncorrectAnswer = () => {
    setStreak(0);
    setAnsweredQuestions(prev => prev + 1);
    
    // Move to next card
    setTimeout(() => {
      if (studyData && currentCardIndex < studyData.flashcards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        toast.success("Session completed! Keep practicing!");
      }
    }, 1500);
  };

  const shuffleCards = () => {
    if (studyData) {
      const shuffled = [...studyData.flashcards].sort(() => Math.random() - 0.5);
      setStudyData({ ...studyData, flashcards: shuffled });
      setCurrentCardIndex(0);
      toast.success("Cards shuffled!");
    }
  };

  const resetSession = () => {
    setCurrentCardIndex(0);
    setAnsweredQuestions(0);
    toast.success("Session reset!");
  };

  const handleSignIn = () => {
    setAppMode("onboarding");
  };

  const handleOnboardingComplete = (user: UserData) => {
    setUserData(user);
    setAppMode("study");
    
    // Welcome animation
    setTimeout(() => {
      toast.success(`Welcome to StudyGenius, ${user.name}! 🎉`);
    }, 1000);
  };

  const speakSummary = () => {
    if (studyData && 'speechSynthesis' in window) {
      if (isAudioPlaying && audioRef.current) {
        // Stop current audio
        speechSynthesis.cancel();
        setIsAudioPlaying(false);
        toast.success("Audio paused");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(studyData.summary);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      utterance.onstart = () => {
        setIsAudioPlaying(true);
        toast.success("Playing audio summary!");
      };
      
      utterance.onend = () => {
        setIsAudioPlaying(false);
        audioRef.current = null;
      };

      utterance.onerror = () => {
        setIsAudioPlaying(false);
        audioRef.current = null;
        toast.error("Audio playback failed");
      };

      audioRef.current = utterance;
      speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech not supported in this browser");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <AnimatePresence mode="wait">
        {appMode === "auth" && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <AuthPage onSignIn={handleSignIn} />
          </motion.div>
        )}

        {appMode === "onboarding" && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6 }}
          >
            <UserOnboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        )}

        {appMode === "study" && studyMode === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* User Welcome Header */}
            {userData && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="fixed top-4 right-4 z-50"
              >
                <Card className="card-3d p-4 bg-card/90 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Welcome back!</p>
                      <p className="text-xs text-muted-foreground">{userData.name}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
            
            <Hero3D />
            <TopicInput onTopicSubmit={handleTopicSubmit} isLoading={isLoading} />
          </motion.div>
        )}

        {appMode === "study" && studyMode === "flashcards" && studyData && (
          <motion.div
            key="flashcards"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen py-8"
          >
            <div className="container mx-auto px-4">
              {/* User Header */}
              {userData && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-between items-center mb-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Hey {userData.name}! 👋</p>
                      <p className="text-sm text-muted-foreground">Keep up the great work!</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setAppMode("auth")}>
                    Sign Out
                  </Button>
                </motion.div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Studying: {studyData.topic}</h1>
                <p className="text-muted-foreground">
                  Card {currentCardIndex + 1} of {studyData.flashcards.length}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {/* Progress Tracker */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                  <ProgressTracker
                    score={score}
                    streak={streak}
                    totalQuestions={studyData.flashcards.length}
                    answeredQuestions={answeredQuestions}
                    badges={badges}
                  />
                </div>

                {/* Main Flashcard */}
                <div className="lg:col-span-2 order-1 lg:order-2">
                  <div className="max-w-2xl mx-auto">
                     {currentCardIndex < studyData.flashcards.length ? (
                       <GameFlashCard
                         key={currentCardIndex}
                         question={studyData.flashcards[currentCardIndex].question}
                         answer={studyData.flashcards[currentCardIndex].answer}
                         onCorrect={handleCorrectAnswer}
                         onIncorrect={handleIncorrectAnswer}
                         streak={streak}
                         score={score}
                         level={Math.floor(score / 100) + 1}
                       />
                     ) : (
                      <Card className="card-3d p-8 text-center bg-gradient-to-br from-success/10 to-success/5">
                        <h2 className="text-2xl font-bold mb-4">🎉 Session Complete!</h2>
                        <p className="text-muted-foreground mb-6">
                          You've completed all flashcards for {studyData.topic}
                        </p>
                        <div className="flex gap-4 justify-center">
                          <Button variant="hero" onClick={resetSession}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Study Again
                          </Button>
                          <Button variant="outline" onClick={() => setStudyMode("input")}>
                            <Home className="w-4 h-4 mr-2" />
                            New Topic
                          </Button>
                        </div>
                      </Card>
                    )}

                    {/* Controls */}
                    <div className="flex gap-4 mt-6 justify-center">
                      <Button variant="outline" onClick={shuffleCards}>
                        <Shuffle className="w-4 h-4 mr-2" />
                        Shuffle
                      </Button>
                      <Button variant="outline" onClick={speakSummary}>
                        {isAudioPlaying ? (
                          <VolumeX className="w-4 h-4 mr-2" />
                        ) : (
                          <Volume2 className="w-4 h-4 mr-2" />
                        )}
                        {isAudioPlaying ? "Pause Audio" : "Audio Summary"}
                      </Button>
                      <Button variant="outline" onClick={() => setStudyMode("input")}>
                        <Home className="w-4 h-4 mr-2" />
                        Home
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};