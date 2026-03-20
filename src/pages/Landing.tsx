"use client";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  Shield, 
  ArrowRight,
  CreditCard,
  Target,
  BarChart3
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FinPro</span>
        </div>
        <Button 
          className="bg-sky-500 hover:bg-sky-600 text-white text-sm px-4 py-2"
          onClick={() => navigate("/dashboard")}
        >
          Iniciar Sesión
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4">
            <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></span>
            <span className="text-sky-300 text-xs">Para todos</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            Controla tus finanzas
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
              como un profesional
            </span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-300 mb-6">
            La herramienta definitiva para gestionar ingresos, gastos, inversiones y alcanzar 
            la libertad financiera.
          </p>
          
          <Button 
            className="bg-sky-500 hover:bg-sky-600 text-white w-full md:w-auto"
            onClick={() => navigate("/dashboard")}
          >
            Iniciar Sesión
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Features Grid - Compact */}
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all">
            <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Ingresos</h3>
            <p className="text-xs text-slate-400">Controla tus fuentes</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all">
            <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center mb-2">
              <CreditCard className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Gastos</h3>
            <p className="text-xs text-slate-400">Analiza tus gastos</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
              <PiggyBank className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Inversiones</h3>
            <p className="text-xs text-slate-400">Tu portafolio</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center mb-2">
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Deudas</h3>
            <p className="text-xs text-slate-400">Gestiona préstamos</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all">
            <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center mb-2">
              <BarChart3 className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Analíticas</h3>
            <p className="text-xs text-slate-400">Gráficos detallados</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Patrimonio</h3>
            <p className="text-xs text-slate-400">Tu riqueza total</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            ¿Listo para tomar control?
          </h2>
          <p className="text-white/80 text-sm mb-4">
            Únete a miles de personas.
          </p>
          <Button 
            className="bg-white text-sky-600 hover:bg-slate-100 w-full"
            onClick={() => navigate("/dashboard")}
          >
            Iniciar Sesión
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-4 border-t border-white/10">
        <div className="flex justify-center items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-3 h-3 text-white" />
          </div>
          <span className="text-white text-sm font-semibold">FinPro</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;