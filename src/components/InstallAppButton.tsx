"use client";

import { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    beforeinstallprompt?: BeforeInstallPromptEvent;
  }
}

type DeviceType = 'desktop' | 'android' | 'ios';

const detectDevice = (): DeviceType => {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  return 'desktop';
};

interface InstallAppButtonProps {
  variant?: 'banner' | 'footer' | 'hero';
  className?: string;
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  variant = 'footer',
  className = '',
}) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const device = detectDevice();
    setDeviceType(device);

    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIosStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isIosStandalone);
    };

    checkInstalled();

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deviceType === 'ios') {
      // iOS: Show instructions
      alert('Para instalar FinPro en tu iPhone:\n\n1. Abre este sitio en Safari\n2. Pulsa el botón Compartir (□↗)\n3. Selecciona "Añadir a pantalla de inicio"\n4. Pulsa "Añadir"');
      return;
    }

    if (deviceType === 'android' && !canInstall) {
      // Android but can't install yet
      alert('Para instalar FinPro en tu Android:\n\n1. Abre este sitio en Chrome\n2. Cuando aparezca el banner de instalación, pulsa "Instalar"\n3. O usa el menú del navegador → "Añadir a pantalla de inicio"');
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstall(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }

    // Desktop or fallback
    alert('Para instalar FinPro en tu ordenador:\n\n1. Usa Chrome o Edge\n2. Busca el icono de instalación en la barra de direcciones\n3. O haz clic en el menú → "Instalar FinPro"');
  };

  if (isInstalled) {
    return (
      <div className={`inline-flex items-center gap-2 text-green-400 text-sm font-medium ${className}`}>
        <CheckCircle className="w-4 h-4" />
        App instalada
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <button
        onClick={handleInstall}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-400 hover:bg-green-500/20 transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
      >
        <Download className="w-4 h-4" />
        Descargar app
      </button>
    );
  }

  if (variant === 'footer') {
    return (
      <button
        onClick={handleInstall}
        className={`
          inline-flex items-center justify-center gap-3 
          bg-gradient-to-r from-green-500 to-green-600 
          hover:from-green-600 hover:to-green-700
          text-black font-bold text-base
          px-8 py-4 rounded-2xl
          transition-all duration-200
          hover:scale-105 active:scale-95
          shadow-lg shadow-green-500/30
          ${className}
        `}
      >
        {deviceType === 'android' && <Smartphone className="w-6 h-6" />}
        {deviceType === 'ios' && <Smartphone className="w-6 h-6" />}
        {deviceType === 'desktop' && <Monitor className="w-6 h-6" />}
        <div className="text-left">
          <div className="text-xs opacity-80">
            {deviceType === 'android' && 'Instalar en Android'}
            {deviceType === 'ios' && 'Instalar en iPhone'}
            {deviceType === 'desktop' && 'Instalar app'}
          </div>
          <div>
            {deviceType === 'android' && 'FinPro Android'}
            {deviceType === 'ios' && 'FinPro iPhone'}
            {deviceType === 'desktop' && 'FinPro PC'}
          </div>
        </div>
      </button>
    );
  }

  // Banner variant
  return (
    <button
      onClick={handleInstall}
      className={`flex items-center gap-1.5 bg-black hover:bg-zinc-900 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-md ${className}`}
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">
        {deviceType === 'android' && 'Instalar'}
        {deviceType === 'ios' && 'Instalar'}
        {deviceType === 'desktop' && 'Instalar'}
      </span>
    </button>
  );
};

export default InstallAppButton;