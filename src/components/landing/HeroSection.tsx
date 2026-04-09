"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedSection from './AnimatedSection';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection delay={100}>
            <div className="inline-flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs font-bold uppercase tracking-widest">La nueva era de las finanzas</span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Controla tu dinero <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600">
                como un experto
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={500}>
            <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              La plataforma integral para gestionar ingresos, gastos, inversiones y patrimonio. 
              Diseñada para quienes buscan la libertad financiera real.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={700}>
            <div className="flex justify-center items-center">
              <Button
                onClick={() => navigate('/register')}
                className="bg-green-500 hover:bg-green-600 text-black h-14 px-8 text-lg font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
              >
                Empezar ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={900} className="mt-16">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-white font-medium">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-500" />
                <span className="text-white font-medium">Ultra Rápido</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-500" />
                <span className="text-white font-medium">IA Integrada</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;