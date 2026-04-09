"use client";

import React from 'react';
import { Download, Smartphone, Zap, Shield, Monitor, SmartphoneIcon } from 'lucide-react';
import { useDeviceDetection, getDownloadConfig } from '@/hooks/useDeviceDetection';
import AnimatedSection from './AnimatedSection';

const AppDownloadSection: React.FC = () => {
  const deviceType = useDeviceDetection();
  const downloadConfig = getDownloadConfig(deviceType);

  const handleDownloadApp = () => {
    const link = document.querySelector('[data-install-app-button="true"]') as HTMLButtonElement | null;
    link?.click();
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[40px] p-8 md:p-16 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Lleva FinPro contigo</h2>
            <p className="text-zinc-400 text-lg mb-12 max-w-2xl mx-auto">
              Instala nuestra aplicación en tu dispositivo para acceder más rápido, recibir notificaciones en tiempo real y gestionar tus finanzas sin conexión.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto mb-16">
            <AnimatedSection delay={200}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-3xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Ultra Rápido</h4>
                  <p className="text-zinc-500 text-sm">Acceso instantáneo</p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-3xl flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Sin Conexión</h4>
                  <p className="text-zinc-500 text-sm">Funciona siempre</p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={600}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-3xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">100% Seguro</h4>
                  <p className="text-zinc-500 text-sm">Datos encriptados</p>
                </div>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={800}>
            <button
              type="button"
              onClick={handleDownloadApp}
              className="
                inline-flex items-center justify-center gap-4 
                bg-white hover:bg-zinc-200
                text-black font-bold text-xl
                px-10 py-6 rounded-3xl
                transition-all duration-300
                hover:scale-105 active:scale-95
                shadow-2xl shadow-white/10
              "
            >
              {deviceType === 'android' && <SmartphoneIcon className="w-8 h-8" />}
              {deviceType === 'ios' && <SmartphoneIcon className="w-8 h-8" />}
              {deviceType === 'desktop' && <Monitor className="w-8 h-8" />}
              <div className="text-left">
                <div className="text-xs opacity-60 uppercase tracking-widest font-bold">{downloadConfig.sublabel}</div>
                <div>{downloadConfig.label}</div>
              </div>
            </button>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;