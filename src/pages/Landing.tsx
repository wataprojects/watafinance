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
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">FinPro</span>
        </div>
        <Button 
          className="bg-sky-500 hover:bg-sky-600 text-white"
          onClick={() => navigate("/dashboard")}
        >
          Iniciar Sesión
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></span>
            <span className="text-sky-300 text-sm">Para emprendedores y profesionales</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Controla tus finanzas
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
              como un profesional
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl mx-auto">
            La herramienta definitiva para gestionar ingresos, gastos, inversiones y alcanzar 
            la libertad financiera.
          </p>
          
          <Button 
            size="lg" 
            className="bg-sky-500 hover:bg-sky-600 text-white text-lg px-8 py-6 w-full md:w-auto"
            onClick={() => navigate("/dashboard")}
          >
            Iniciar Sesión
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
            <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Gestión de Ingresos</h3>
            <p className="text-sm text-slate-400">
              Controla ingresos activos y pasivos.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
            <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Control de Gastos</h3>
            <p className="text-sm text-slate-400">
              Categoriza y analiza todos tus gastos.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3">
              <PiggyBank className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Inversiones</h3>
            <p className="text-sm text-slate-400">
              Registra y sigue tu portafolio.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Deudas y Préstamos</h3>
            <p className="text-sm text-slate-400">
              Gestiona tus deudas y préstamos.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
            <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Analíticas Avanzadas</h3>
            <p className="text-sm text-slate-400">
              Gráficos y análisis detallados.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Patrimonio Total</h3>
            <p className="text-sm text-slate-400">
              Visualiza tu patrimonio neto.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 rounded-3xl p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            ¿Listo para tomar control?
          </h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Únete a miles de emprendedores que ya están construyendo su libertad financiera.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-sky-600 hover:bg-slate-100 text-lg px-10 py-6 w-full md:w-auto"
            onClick={() => navigate("/dashboard")}
          >
            Iniciar Sesión
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">FinPro</span>
          </div>
          <p className="text-slate-400 text-sm">
            © 2026 FinPro. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;