"use client";

import React from 'react';
import ModernHeader from "@/components/landing/ModernHeader";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import AppDownloadSection from "@/components/landing/AppDownloadSection";
import InstallPromptBanner from "@/components/InstallPromptBanner";
import { Wallet } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col selection:bg-green-500 selection:text-black">
      <InstallPromptBanner />
      <ModernHeader />

      <main className="flex-1">
        <HeroSection />
        <FeaturesGrid />
        <AppDownloadSection />
      </main>

      <footer className="bg-black border-t border-zinc-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                <Wallet className="w-4 h-4 text-black" />
              </div>
              <span className="text-xl font-bold text-white">Monyro</span>
            </div>

            <div className="flex gap-8 text-sm text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>

            <p className="text-zinc-600 text-sm">
              © 2025 Monyro. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;