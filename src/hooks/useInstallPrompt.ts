import { useState, useEffect, useCallback } from 'react';

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

interface UseInstallPromptReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isDismissed: boolean;
  isBannerVisible: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  showPrompt: () => Promise<boolean>;
  dismiss: () => void;
  resetDismiss: () => void;
}

const DISMISSED_KEY = 'monyro_install_dismissed';

export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    // Check if already dismissed in current session
    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    // Check if app is already installed (standalone mode)
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInstalledMobile = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInstalledMobile);
    };

    checkInstalled();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      sessionStorage.removeItem(DISMISSED_KEY);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Also check on resize (for mobile)
    window.addEventListener('resize', checkInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('resize', checkInstalled);
    };
  }, []);

  const isInstallable = !!deferredPrompt && !isInstalled && !isDismissed;

  useEffect(() => {
    if (isInstallable) {
      const timer = setTimeout(() => {
        setIsBannerVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsBannerVisible(false);
    }
  }, [isInstallable]);

  const showPrompt = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
        sessionStorage.removeItem(DISMISSED_KEY);
        return true;
      } else {
        // User dismissed the native prompt, also dismiss our banner
        setIsDismissed(true);
        sessionStorage.setItem(DISMISSED_KEY, 'true');
        return false;
      }
    } catch (error) {
      console.error('[useInstallPrompt] Error showing prompt:', error);
      return false;
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, 'true');
  }, []);

  const resetDismiss = useCallback(() => {
    setIsDismissed(false);
    sessionStorage.removeItem(DISMISSED_KEY);
  }, []);

  return {
    isInstallable,
    isInstalled,
    isDismissed,
    isBannerVisible,
    deferredPrompt,
    showPrompt,
    dismiss,
    resetDismiss,
  };
}

export default useInstallPrompt;