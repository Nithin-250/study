import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, User as UserIcon, Shield, Globe } from 'lucide-react';
import { toast, Toaster } from "sonner";
import { authService } from './services/authService';

function App() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

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
        await authService.login({
          email: formData.email,
          password: formData.password
        });
        toast.success('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = 'homepage_2.html';
        }, 1000);
      } else {
        await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        toast.success('Registration successful! Redirecting...');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-pink-700 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">VidyaSetu</h1>
          <p className="text-blue-100 text-xl mb-3">Smart Learning Platform</p>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-blue-200">
              <Shield className="w-4 h-4 text-green-400" />
              Secure
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-200">
              <Globe className="w-4 h-4 text-blue-400" />
              PostgreSQL
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
              ✅ Data stored securely in PostgreSQL
            </div>
          </div>
        </Card>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
