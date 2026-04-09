"use client";

import React, { useState, useEffect } from 'react';
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const features = [
  {
    title: "Ingresos",
    description: "Gestiona tus fuentes de ingresos activos y pasivos con detalle.",
    icon: TrendingUp,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "group-hover:border-green-500/50"
  },
  {
    title: "Gastos",
    description: "Analiza tus hábitos de consumo y optimiza tus salidas de dinero.",
    icon: CreditCard,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "group-hover:border-red-500/50"
  },
  {
    title: "Inversiones",
    description: "Sigue el rendimiento de tu portafolio en tiempo real.",
    icon: PiggyBank,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "group-hover:border-purple-500/50"
  },
  {
    title: "Deudas",
    description: "Controla lo que debes y lo que te deben de forma colaborativa.",
    icon: Target,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "group-hover:border-amber-500/50"
  },
  {
    title: "Préstamos",
    description: "Simula amortizaciones y visualiza el fin de tus deudas bancarias.",
    icon: Landmark,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "group-hover:border-blue-500/50"
  },
  {
    title: "Analíticas",
    description: "Gráficos avanzados para entender tu salud financiera mensual.",
    icon: BarChart3,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "group-hover:border-rose-500/50"
  },
  {
    title: "Patrimonio",
    description: "Visión integral de todos tus activos y pasivos netos.",
    icon: Shield,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "group-hover:border-emerald-500/50"
  },
  {
    title: "Perfil",
    description: "Personaliza tu experiencia y configura tus preferencias.",
    icon: User,
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/10",
    borderColor: "group-hover:border-zinc-500/50"
  },
  {
    title: "Admin",
    description: "Panel de control avanzado para la gestión de la plataforma.",
    icon: Settings,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "group-hover:border-cyan-500/50"
  }
];

// Función para dividir en grupos de 3
const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const FeaturesGrid: React.FC = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const featureChunks = chunkArray(features, 3);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="py-24 bg-zinc-950/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Todo lo que necesitas</h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
            Una suite completa de herramientas diseñadas para darte el control total sobre tu futuro financiero.
          </p>
        </AnimatedSection>

        <div className="max-w-6xl mx-auto">
          <Carousel 
            setApi={setApi}
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-4">
              {featureChunks.map((chunk, chunkIndex) => (
                <CarouselItem key={chunkIndex} className="pl-4 basis-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {chunk.map((feature, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "group h-full p-8 rounded-[32px] bg-zinc-900/40 border border-zinc-800/50 transition-all duration-500",
                          "hover:bg-zinc-900 hover:border-zinc-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50",
                          feature.borderColor
                        )}
                      >
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                          feature.bgColor
                        )}>
                          <feature.icon className={cn("w-7 h-7", feature.color)} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-between">
                          {feature.title}
                          <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors" />
                        </h3>
                        <p className="text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors text-sm">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Indicadores de posición */}
          <div className="flex justify-center gap-2 mt-12">
            {featureChunks.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "h-1.5 transition-all duration-300 rounded-full",
                  current === index ? "w-8 bg-green-500" : "w-2 bg-zinc-800 hover:bg-zinc-700"
                )}
                aria-label={`Ir al bloque ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;