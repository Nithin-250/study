import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, User as UserIcon, Shield, Globe, CheckCircle } from 'lucide-react';
import { toast, Toaster } from "sonner";
import { createClient } from '@supabase/supabase-js';
import { OfflineAptitudeSection } from './components/OfflineAptitudeSection';
import { Chatbot } from './components/Chatbot';
import { DarkModeToggle } from './components/DarkModeToggle';

// Initialize Supabase client
const supabase = createClient(
  'https://bgfcskbyxoowhakrjeeb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZmNza2J5eG9vd2hha3JqZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTk0OTMsImV4cCI6MjA3NjM5NTQ5M30.QEmGX-V_kfPyV7PP48GLCY0VxsevYBoL76UzUNhymXw'
);

// Direct Supabase table operations
const supabaseAuth = {
  async login(email: string, password: string) {
    try {
      // Query users table directly - column is password_hash not password
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .maybeSingle();

      if (error || !data) {
        throw new Error('Invalid email or password');
      }

      localStorage.setItem('vidyasetu_current_user', JSON.stringify(data));
      console.log('✅ Login successful:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error('Invalid email or password');
    }
  },
  
  async register(name: string, email: string, password: string) {
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Generate a unique ID for the user
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      console.log('📝 Attempting to insert user:', { id: userId, name, email, password_hash: '***' });

      // Insert with id, name, email, password_hash
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          name: name,
          email: email,
          password_hash: password
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Full error object:', JSON.stringify(error, null, 2));
        console.error('❌ Error details:', error.details, error.hint, error.code);
        throw new Error('Registration failed: ' + error.message);
      }

      if (!data) {
        throw new Error('No data returned after insert');
      }

      localStorage.setItem('vidyasetu_current_user', JSON.stringify(data));
      console.log('✅ Registration successful:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  }
};

type AppMode = 'auth' | 'home' | 'offline-mode' | 'study';

function App() {
  const [appMode, setAppMode] = useState<AppMode>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Check if user is already logged in and handle hash routing
  useEffect(() => {
    const currentUser = localStorage.getItem('vidyasetu_current_user');
    const hash = window.location.hash;
    
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setUser(userData);
      
      // Handle hash-based routing
      if (hash === '#offline-mode') {
        console.log('✅ Loading offline mode');
        setAppMode('offline-mode');
      } else if (hash === '#topic-summarizer' || hash === '#study') {
        console.log('✅ Loading study app');
        setAppMode('study');
      } else if (!hash) {
        // No hash, redirect to homepage
        console.log('✅ Redirecting to homepage...');
        window.location.href = 'homepage_2.html';
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMode === 'register' && !formData.name) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      
      if (authMode === 'login') {
        await supabaseAuth.login(formData.email, formData.password);
        toast.success('✅ Login successful! Redirecting to homepage...');
        setTimeout(() => {
          window.location.href = 'homepage_2.html';
        }, 1000);
      } else {
        await supabaseAuth.register(formData.name, formData.email, formData.password);
        toast.success('✅ Account created in PostgreSQL! Redirecting...');
        setTimeout(() => {
          window.location.href = 'homepage_2.html';
        }, 1000);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Show Offline Aptitude Mode
  if (appMode === 'offline-mode' && user) {
    return (
      <>
        <OfflineAptitudeSection 
          onBackToHome={() => window.location.href = 'homepage_2.html'}
          userId={user.id}
        />
        <Chatbot />
        <Toaster position="top-right" />
      </>
    );
  }

  // Topic Summarizer - redirect back to homepage for now
  // You can create a separate component for this later
  if (appMode === 'study' && user) {
    window.location.href = 'homepage_2.html';
    return null;
  }

  // Show Login Page (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-pink-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">VidyaSetu</h1>
          <p className="text-blue-100 text-xl mb-3">Smart Learning Platform</p>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-blue-200">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Supabase Connected
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-200">
              <Globe className="w-4 h-4 text-blue-400" />
              PostgreSQL Database
            </div>
          </div>
        </div>

        <Card className="p-10 shadow-2xl border-0 bg-white/95 backdrop-blur-lg">
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-6">
                <Button
                  variant={authMode === 'login' ? 'default' : 'outline'}
                  onClick={() => setAuthMode('login')}
                  className="flex-1"
                >
                  Login
                </Button>
                <Button
                  variant={authMode === 'register' ? 'default' : 'outline'}
                  onClick={() => setAuthMode('register')}
                  className="flex-1"
                >
                  Register
                </Button>
              </div>

              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                {authMode === 'login' ? 'Welcome Back' : 'Join VidyaSetu'}
              </h2>
              <p className="text-gray-600 text-lg">
                {authMode === 'login' ? 'Sign in to continue' : 'Create your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    className="h-12"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    {authMode === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    <UserIcon className="w-5 h-5 mr-3" />
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-xs text-gray-500">
              ✅ Data stored securely in Supabase PostgreSQL Database
            </div>
          </div>
        </Card>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
