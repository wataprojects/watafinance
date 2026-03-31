"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  isPopular?: boolean;
}

const planes: Plan[] = [
  {
    id: "premium",
    name: "Premium",
    price: 9.99,
    interval: "mes",
    isPopular: true,
    features: [
      "Gestión completa de finanzas",
      "Análisis de gastos e ingresos",
      "Gestión de deudas",
      "Gestión de inversiones",
      "Patrimonio",
      "Sugerencias de ahorro",
      "Ofertas personalizadas",
    ],
  },
];

const Suscripcion: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    // Here you would integrate with Stripe for payment
    console.log("Subscribing to plan:", selectedPlan);
    
    // Simulate subscription
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard/mi-cuenta");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/mi-cuenta")}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white">Gestionar Suscripción</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Elige tu plan</h2>
          <p className="text-zinc-400">Desbloquea todas las funcionalidades premium</p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          {planes.map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? "bg-green-500/10 border-green-500"
                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-green-400" />
                    <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                    {plan.isPopular && (
                      <span className="bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">€{plan.price}</span>
                    <span className="text-zinc-400 text-sm">/{plan.interval}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

          <Button
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold mt-6"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? "Procesando..." : "Suscribirse ahora"}
          </Button>

          <p className="text-center text-zinc-500 text-xs mt-4">
            Al suscribirte, aceptas nuestros términos y condiciones.
            Puedes cancelar en cualquier momento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Suscripcion;