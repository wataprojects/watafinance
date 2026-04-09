"use client";

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

const InstallPromptBanner: React.FC = () => {
  const { isInstallable, isBannerVisible, showPrompt, dismiss, isInstalled } = useInstallPrompt();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isBannerVisible) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isBannerVisible]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      dismiss();
    }, 300);
  };

  const handleInstall = async () => {
    const success = await showPrompt();
    if (success) {
      handleDismiss();
    }
  };

  if (!isInstallable && !isBannerVisible) {
    return null;
  }

  return (
    <>
      {isBannerVisible && <div className="fixed inset-0 z-40 pointer-events-none" aria-hidden="true" />}
      
      <div
        className={`
          fixed top-0 left-0 right-0 z-50 
          transform transition-all duration-300 ease-out
          ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        `}
        role="banner"
        aria-label="Instalar Monyro"
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
                    ¿Quieres instalar Monyro en tu móvil?
                  </p>
                  <p className="text-green-100 text-xs hidden sm:block">
                    Accede más rápido desde tu pantalla de inicio
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 bg-black hover:bg-zinc-900 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Descargar</span>
                  <span className="sm:hidden">Instalar</span>
                </button>
                
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

      {isBannerVisible && <div className="h-[60px] sm:h-[60px]" aria-hidden="true" />}
    </>
  );
};

export default InstallPromptBanner;