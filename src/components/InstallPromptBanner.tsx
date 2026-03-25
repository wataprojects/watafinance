"use client";

import { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';
import InstallAppButton from './InstallAppButton';

const InstallPromptBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Show banner after a short delay if the app is not installed
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsAnimating(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 pointer-events-none" aria-hidden="true" />
      
      <div
        className={`
          fixed top-0 left-0 right-0 z-50 
          transform transition-transform duration-300 ease-out
          ${isAnimating ? 'translate-y-0' : '-translate-y-full'}
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        role="banner"
        aria-label="Instalar FinPro"
      >
        <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 shadow-lg shadow-green-500/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="hidden sm:flex w-10 h-10 bg-black/20 rounded-xl items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold text-sm sm:text-base truncate">
                    Instala FinPro en tu móvil
                  </p>
                  <p className="text-green-100 text-xs hidden sm:block">
                    Accede más rápido desde tu pantalla de inicio
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <InstallAppButton variant="banner" />
                
                <button
                  onClick={handleDismiss}
                  className="w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/30 text-white/80 hover:text-white rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-50" />
        </div>
      </div>

      <div className="h-[60px]" aria-hidden="true" />
    </>
  );
};

export default InstallPromptBanner;