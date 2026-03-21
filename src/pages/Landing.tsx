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
    <div className="min-h-screen bg-black">
      <header className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-black" />
          </div>
          <span className="text-xl font-bold text-white">FinPro</span>
        </div>
        <Button 
          className="bg-green-500 hover:bg-green-600 text-black text-sm px-4 py-2 font-semibold"
          onClick={() => navigate("/dashboard")}
        >
          Iniciar Sesión
        </Button>
      </header>

      <section className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-green-400 text-xs">Particulares, Emprendedores y Profesionales</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            Controla tus finanzas
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
              como un profesional
            </span>
          </h1>
          
          <p className="text-sm md:text-base text-zinc-400 mb-6">
            La herramienta definitiva para gestionar ingresos, gastos, inversiones y alcanzar 
            la libertad financiera.
          </p>
          
          <Button 
            className="bg-green-500 hover:bg-green-600 text-black w-full md:w-auto font-semibold"
            onClick={() => navigate("/dashboard")}
          >
            Iniciar Sesión
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-green-500/50 transition-all">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Ingresos</h3>
            <p className="text-xs text-zinc-500">Controla tus fuentes</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-red-500/50 transition-all">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mb-2">
              <CreditCard className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Gastos</h3>
            <p className="text-xs text-zinc-500">Analiza tus gastos</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-purple-500/50 transition-all">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
              <PiggyBank className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Inversiones</h3>
            <p className="text-xs text-zinc-500">Tu portafolio</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-amber-500/50 transition-all">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center mb-2">
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Deudas</h3>
            <p className="text-xs text-zinc-500">Gestiona préstamos</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-rose-500/50 transition-all">
            <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center mb-2">
              <BarChart3 className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Analíticas</h3>
            <p className="text-xs text-zinc-500">Gráficos detallados</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-blue-500/50 transition-all">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Patrimonio</h3>
            <p className="text-xs text-zinc-500">Tu riqueza total</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-green-900 to-zinc-900 rounded-2xl p-6 text-center border border-green-800">
          <h2 className="text-xl font-bold text-white mb-2">
            ¿Listo para tomar control?
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            Únete a miles de personas.
          </p>
          <Button 
            className="bg-green-500 text-black hover:bg-green-600 w-full font-semibold"
            onClick={() => navigate("/dashboard")}
          >
            Iniciar Sesión
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      <footer className="container mx-auto px-4 py-4 border-t border-zinc-800">
        <div className="flex justify-center items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
            <Wallet className="w-3 h-3 text-black" />
          </div>
          <span className="text-white text-sm font-semibold">FinPro</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;