"use client";

import React from 'react';
import { 
  TrendingUp, 
  CreditCard, 
  PiggyBank, 
  Target, 
  Landmark, 
  BarChart3, 
  Shield, 
  User, 
  Settings,
  ArrowUpRight
} from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { cn } from '@/lib/utils';

const features = [
  {
    title: "Ingresos",
    description: "Gestiona tus fuentes de ingresos activos y pasivos con detalle.",
    icon: TrendingUp,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    hoverGradient: "from-green-500/20 via-emerald-500/10 to-transparent",
    colSpan: "md:col-span-2",
    rowSpan: "md:row-span-2"
  },
  {
    title: "Gastos",
    description: "Analiza tus hábitos de consumo y optimiza tus salidas.",
    icon: CreditCard,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    hoverGradient: "from-red-500/20 via-rose-500/10 to-transparent",
    colSpan: "md:col-span-2",
    rowSpan: "md:row-span-1"
  },
  {
    title: "Inversiones",
    description: "Sigue el rendimiento de tu portafolio.",
    icon: PiggyBank,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    hoverGradient: "from-purple-500/20 via-violet-500/10 to-transparent",
    colSpan: "md:col-span-1",
    rowSpan: "md:row-span-1"
  },
  {
    title: "Deudas",
    description: "Controla lo que debes.",
    icon: Target,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    hoverGradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    colSpan: "md:col-span-1",
    rowSpan: "md:row-span-1"
  },
  {
    title: "Patrimonio",
    description: "Visión integral de todos tus activos y pasivos netos en un solo lugar.",
    icon: Shield,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    hoverGradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    colSpan: "md:col-span-2",
    rowSpan: "md:row-span-2"
  },
  {
    title: "Préstamos",
    description: "Simula amortizaciones y visualiza el fin de tus deudas.",
    icon: Landmark,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    hoverGradient: "from-blue-500/20 via-sky-500/10 to-transparent",
    colSpan: "md:col-span-2",
    rowSpan: "md:row-span-1"
  },
  {
    title: "Analíticas",
    description: "Gráficos avanzados.",
    icon: BarChart3,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    hoverGradient: "from-rose-500/20 via-pink-500/10 to-transparent",
    colSpan: "md:col-span-1",
    rowSpan: "md:row-span-1"
  },
  {
    title: "Perfil",
    description: "Personaliza todo.",
    icon: User,
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/10",
    hoverGradient: "from-zinc-500/20 via-slate-500/10 to-transparent",
    colSpan: "md:col-span-1",
    rowSpan: "md:row-span-1"
  },
  {
    title: "Panel de Administración",
    description: "Gestión avanzada de clientes y métricas globales para administradores.",
    icon: Settings,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    hoverGradient: "from-cyan-500/20 via-sky-500/10 to-transparent",
    colSpan: "md:col-span-4",
    rowSpan: "md:row-span-1"
  }
];

const FeaturesGrid: React.FC = () => {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Todo lo que <span className="text-green-500">necesitas</span>
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
            Una suite completa de herramientas diseñadas para darte el control total sobre tu futuro financiero.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[160px]">
          {features.map((feature, index) => (
            <AnimatedSection 
              key={index} 
              delay={index * 50}
              className={cn("group", feature.colSpan, feature.rowSpan)}
            >
              <div className={cn(
                "relative h-full p-6 md:p-8 rounded-[32px] bg-zinc-900/40 border border-zinc-800/50 overflow-hidden transition-all duration-500",
                "hover:border-zinc-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 backdrop-blur-xl flex flex-col justify-between"
              )}>
                {/* Animated Gradient Background on Hover */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br animate-gradient-xy pointer-events-none",
                  feature.hoverGradient
                )} />

                <div className="relative z-10">
                  <div className={cn(
                    "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 md:mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg",
                    feature.bgColor
                  )}>
                    <feature.icon className={cn("w-6 h-6 md:w-7 md:h-7", feature.color)} />
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 flex items-center justify-between">
                    {feature.title}
                    <ArrowUpRight className="w-5 h-5 text-zinc-700 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </h3>
                  
                  <p className="text-zinc-500 leading-relaxed group-hover:text-zinc-300 transition-colors text-xs md:text-sm">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative element for larger cards */}
                {feature.rowSpan.includes('row-span-2') && (
                  <div className="mt-auto pt-4 opacity-20 group-hover:opacity-40 transition-opacity hidden md:block">
                    <div className="h-1 w-12 bg-zinc-700 rounded-full mb-1" />
                    <div className="h-1 w-8 bg-zinc-700 rounded-full" />
                  </div>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;