"use client";

import { useState, useEffect } from 'react';
import { X, Download, Smartphone, ChevronRight } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Button } from '@/components/ui/button';

const InstallPromptBanner: React.FC = () => {
  const { isInstallable, showPrompt, dismiss, isInstalled } = useInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isInstallable && !isInstalled) {
      // Small delay for smooth entrance animation
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleDismiss = () => {
    setIsAnimating(false);
    // Wait for exit animation to complete
    setTimeout(() => {
      setIsVisible(false);
      dismiss();
    }, 300);
  };

  const handleInstall = async () => {
    const success = await showPrompt();
    if (success) {
      handleDismiss();
    }
  };

  // Don't render if not installable or already installed
  if (!isInstallable && !isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop for mobile touch prevention */}
      {isVisible && (
        <div 
          className="fixed inset-0 z-40 pointer-events-none" 
          aria-hidden="true"
        />
      )}
      
      {/* Banner */}
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
              {/* Left: Icon + Text */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="hidden sm:flex w-10 h-10 bg-black/20 rounded-xl items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold text-sm sm:text-base truncate">
                    ¿Quieres instalar FinPro en tu móvil?
                  </p>
                  <p className="text-green-100 text-xs hidden sm:block">
                    Accede más rápido desde tu pantalla de inicio
                  </p>
                </div>
              </div>

              {/* Right: Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleInstall}
                  className="
                    flex items-center gap-1.5 
                    bg-black hover:bg-zinc-900 
                    text-white 
                    px-3 py-2 sm:px-4 sm:py-2 
                    rounded-lg 
                    font-medium text-sm
                    transition-all duration-200
                    hover:scale-105 active:scale-95
                    shadow-md
                  "
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Descargar</span>
                  <span className="sm:hidden">Instalar</span>
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="
                    w-8 h-8 
                    flex items-center justify-center 
                    bg-black/20 hover:bg-black/30 
                    text-white/80 hover:text-white 
                    rounded-lg 
                    transition-all duration-200
                    hover:scale-110 active:scale-95
                  "
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Decorative bottom border */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-50" />
        </div>
      </div>

      {/* Spacer to prevent content from being hidden */}
      {isVisible && (
        <div className="h-[60px] sm:h-[60px]" aria-hidden="true" />
      )}
    </>
  );
};

export default InstallPromptBanner;