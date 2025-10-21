import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m VidyaSetu Assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Website features
    if (lowerMessage.includes('feature') || lowerMessage.includes('what can') || lowerMessage.includes('what do')) {
      return 'VidyaSetu offers:\n• Aptitude Quiz with animated solutions\n• Topic Summarizer with AI flashcards\n• Mentorship & Career Counseling\n• Result Analysis & Performance Tracking\n• NGO & Community Service info\n• Points & Rewards system';
    }

    // Aptitude/Quiz
    if (lowerMessage.includes('aptitude') || lowerMessage.includes('quiz') || lowerMessage.includes('test')) {
      return 'Our Aptitude section offers:\n• Quick Animated Challenges\n• Interactive Animations (Boat/Stream problems)\n• Points-based scoring system\n• Performance tracking\n\nClick "Start Now" on the Aptitude section to begin!';
    }

    // Animated problems
    if (lowerMessage.includes('animation') || lowerMessage.includes('boat') || lowerMessage.includes('stream')) {
      return 'Interactive Animations feature visual aptitude problems with step-by-step animated solutions including:\n• Boat & Stream problems\n• Time & Distance\n• Work & Time\n• And more!\n\nClick on "Interactive Animations" in the offline quiz section.';
    }

    // Points system
    if (lowerMessage.includes('point') || lowerMessage.includes('score') || lowerMessage.includes('reward')) {
      return 'Points System:\n• Earn points by completing quizzes\n• Easy: 100 pts, Medium: 150 pts, Hard: 200 pts\n• Speed bonus: Up to +30%\n• Wrong answer: -30% penalty\n• Your points are saved and displayed in the header!';
    }

    // Mentorship
    if (lowerMessage.includes('mentor') || lowerMessage.includes('counsel') || lowerMessage.includes('career')) {
      return 'Our Mentorship program offers guidance for:\n• After 10th: Stream selection\n• After 12th: College & course selection\n• During College: Branch specialization\n• Post-College: Career planning\n• One-to-one personal counseling\n\nClick "Start Now" in the Mentorship section!';
    }

    // Topic Summarizer
    if (lowerMessage.includes('summarizer') || lowerMessage.includes('flashcard') || lowerMessage.includes('study')) {
      return 'Topic Summarizer features:\n• AI-powered flashcards\n• Interactive quizzes\n• Voice summaries\n• Personalized learning\n\nEnter any topic and get instant study materials!';
    }

    // Result Analysis
    if (lowerMessage.includes('result') || lowerMessage.includes('analysis') || lowerMessage.includes('performance')) {
      return 'Result Analysis provides:\n• Performance tracking\n• Subject-wise insights\n• Strengths & weaknesses analysis\n• Personalized recommendations\n• Progress reports\n• Predictive analytics';
    }

    // Login/Account
    if (lowerMessage.includes('login') || lowerMessage.includes('account') || lowerMessage.includes('register')) {
      return 'To access all features:\n1. Click "Login" in the header\n2. Register with your email\n3. Start earning points!\n\nYour progress and points are saved to your account.';
    }

    // How to use
    if (lowerMessage.includes('how to') || lowerMessage.includes('use') || lowerMessage.includes('start')) {
      return 'Getting started:\n1. Login/Register\n2. Explore sections: Aptitude, Summarizer, Mentorship\n3. Complete quizzes to earn points\n4. Track your progress\n5. Get personalized recommendations\n\nClick any "Start Now" button to begin!';
    }

    // NGO
    if (lowerMessage.includes('ngo') || lowerMessage.includes('community') || lowerMessage.includes('social')) {
      return 'VIT Chennai\'s NGO initiatives:\n• Sahathya Club - Social Service Wing\n• Community outreach programs\n• NGO partnerships & volunteer drives\n• Environmental campaigns\n• Rural education & health initiatives';
    }

    // Language
    if (lowerMessage.includes('language') || lowerMessage.includes('tamil') || lowerMessage.includes('english')) {
      return 'VidyaSetu supports multiple languages!\n• Switch between English and Tamil\n• Use the language toggle in the header\n• All content is translated automatically';
    }

    // Default responses
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
    if (greetings.some(g => lowerMessage.includes(g))) {
      return 'Hello! Welcome to VidyaSetu. I can help you with:\n• Aptitude quizzes\n• Study materials\n• Mentorship programs\n• Points system\n• Website features\n\nWhat would you like to know?';
    }

    if (lowerMessage.includes('thank')) {
      return 'You\'re welcome! Feel free to ask if you need anything else. Happy learning! 📚';
    }

    // Fallback
    return 'I can help you with:\n• Aptitude quizzes & animations\n• Topic summarizer & flashcards\n• Mentorship & career guidance\n• Points & rewards system\n• Result analysis\n• Website features\n\nWhat would you like to know more about?';
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot typing and response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-2xl"
              size="lg"
            >
              <MessageCircle className="w-8 h-8" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] shadow-2xl"
          >
            <Card className="h-full flex flex-col bg-white dark:bg-gray-800">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">VidyaSetu Assistant</h3>
                    <p className="text-white/80 text-xs">Always here to help</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'bot' && (
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-none shadow'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
