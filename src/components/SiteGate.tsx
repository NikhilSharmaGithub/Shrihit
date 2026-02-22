import React, { useState } from 'react';
import { useSiteGate } from '@/contexts/SiteGateContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/shrihit-logo.jpg';

interface SiteGateProps {
  children: React.ReactNode;
}

const SiteGate: React.FC<SiteGateProps> = ({ children }) => {
  const { isUnlocked, unlock } = useSiteGate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlock(password);
    if (!success) {
      setError('Invalid access code');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-cream via-white to-sacred-cream/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={logo} 
              alt="Shrihit" 
              className="h-20 w-20 rounded-full object-cover shadow-lg border-2 border-sacred-gold/30"
            />
          </div>
          <h1 className="text-3xl font-bold text-sacred-brown font-playfair">Shrihit</h1>
          <p className="text-sacred-copper mt-2">Divine Pooja Essentials</p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-sacred-gold/20 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sacred-gold/10 mb-4">
              <Lock className="w-8 h-8 text-sacred-gold" />
            </div>
            <h2 className="text-xl font-semibold text-sacred-brown mb-2">Coming Soon</h2>
            <p className="text-muted-foreground text-sm">
              We're working on something divine. Enter access code to preview.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter access code"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className={`pr-10 text-center text-lg tracking-wider ${
                  isShaking ? 'animate-shake' : ''
                } ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full bg-sacred-gold hover:bg-sacred-gold/90 text-white"
              size="lg"
            >
              Enter Site
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-sacred-gold/10 text-center">
            <p className="text-xs text-muted-foreground">
              © 2024 Shrihit. All rights reserved.
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center gap-2">
          <span className="text-sacred-gold text-2xl">🙏</span>
          <span className="text-sacred-copper text-2xl">🪔</span>
          <span className="text-sacred-gold text-2xl">🙏</span>
        </div>
      </div>
    </div>
  );
};

export default SiteGate;
