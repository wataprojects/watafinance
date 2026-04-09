"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ModernHeader: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-4",
        isScrolled ? "bg-black/80 backdrop-blur-md border-b border-zinc-800 py-3" : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
            <Wallet className="w-5 h-5 text-black" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">FinPro</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/login')} className="text-zinc-400 hover:text-white transition-colors font-medium">
            Iniciar Sesión
          </button>
          <Button 
            onClick={() => navigate('/register')}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 rounded-2xl transition-all hover:scale-105 active:scale-95"
          >
            Empezar Gratis
          </Button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden",
        isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-y-10"
      )}>
        <button 
          onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
          className="text-2xl text-zinc-400 hover:text-white font-medium"
        >
          Iniciar Sesión
        </button>
        <Button 
          onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }}
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-10 py-6 text-xl rounded-3xl"
        >
          Empezar Gratis
        </Button>
        <button 
          className="absolute top-6 right-6 text-zinc-500"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X size={32} />
        </button>
      </div>
    </header>
  );
};

export default ModernHeader;