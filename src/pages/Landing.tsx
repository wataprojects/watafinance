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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">FinPro</span>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </Button>
          <Button 
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => navigate("/dashboard")}
          >
            Empezar Gratis
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-emerald-300 text-sm">Para emprendedores y profesionales</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Controla tus finanzas
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              como un profesional
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            La herramienta definitiva para gestionar ingresos, gastos, inversiones y alcanzar 
            la libertad financiera. Diseñada para emprendedores que quieren más.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-8 py-6"
              onClick={() => navigate("/dashboard")}
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-600 text-white hover:bg-white/10 hover:text-white text-lg px-8 py-6"
            >
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Gestión de Ingresos</h3>
            <p className="text-slate-400">
              Controla ingresos activos y pasivos. Analiza tus fuentes de dinero y optimiza tu flujo de caja.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Control de Gastos</h3>
            <p className="text-slate-400">
              Categoriza y analiza todos tus gastos. Encuentra oportunidades de ahorro.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
              <PiggyBank className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Inversiones</h3>
            <p className="text-slate-400">
              Registra y sigue tu portafolio de inversiones. Mide tu progreso hacia la libertad financiera.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Deudas y Préstamos</h3>
            <p className="text-slate-400">
              Gestiona tus deudas y préstamos. Crea estrategias parapagarlos más rápido.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Analíticas Avanzadas</h3>
            <p className="text-slate-400">
              Gráficos y análisis detallados. Toma decisiones informadas sobre tu dinero.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Patrimonio Total</h3>
            <p className="text-slate-400">
              Visualiza tu patrimonio neto. Sigue tu riqueza total en un solo lugar.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            ¿Listo para tomar control de tus finanzas?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Únete a miles de emprendedores que ya están construyendo su libertad financiera.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-emerald-600 hover:bg-slate-100 text-lg px-10 py-6"
            onClick={() => navigate("/dashboard")}
          >
            Empezar Gratis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
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