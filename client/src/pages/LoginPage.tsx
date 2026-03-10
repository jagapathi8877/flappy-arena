import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../services/api';
import type { UserData } from '../types/user';

interface LoginPageProps {
  onLogin: (user: UserData) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.login(rollNo, password);
      onLogin(res.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-sky-bg flex items-center justify-center p-4 px-5 sm:px-4">
      {/* Decorative clouds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-[10%] w-24 h-10 bg-white rounded-full opacity-70" />
        <div className="absolute top-12 left-[12%] w-16 h-8 bg-white rounded-full opacity-70" />
        <div className="absolute top-24 right-[15%] w-32 h-12 bg-white rounded-full opacity-60" />
        <div className="absolute top-20 right-[18%] w-20 h-8 bg-white rounded-full opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-ground" />
        <div className="absolute bottom-20 left-0 right-0 h-3 bg-pipe-dark" />
      </div>

      <Card className="w-full max-w-md p-5 sm:p-8 relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          {/* Logo */}
          <div className="w-16 h-16 bg-gradient-to-br from-bird-yellow to-gold rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg border-2 border-gold/40">
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 17V11L8 14L12 7L16 14L20 11V17H4Z" fill="white"/>
              <rect x="4" y="17" width="16" height="2.5" rx="1" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-dark tracking-tight">
            FLAPPY<span className="text-pipe-dark"> ARENA</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-dark/60 uppercase tracking-wider mb-1.5 ml-1">
              Roll Number
            </label>
            <Input
              type="text"
              placeholder="e.g. 24B11CS001"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-dark/60 uppercase tracking-wider mb-1.5 ml-1">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-text-dark/40 mt-1.5 ml-1">
              * Use roll number as default password
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 text-lg"
          >
            {isLoading ? 'Logging in...' : 'Enter Arena'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
