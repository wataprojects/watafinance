"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Check, HelpCircle, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Price IDs - in production these would come from environment variables
const STRIPE_PRICE_MONTHLY = "price_monthly";
const STRIPE_PRICE_YEARLY = "price_yearly";

const SubscriptionRequired = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [trialInfo, setTrialInfo] = useState<{ daysRemaining: number; isInTrial: boolean } | null>(null);

  useEffect(() => {
    const checkTrial = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_end_date, subscription_status')
        .eq('id', session.user.id)
        .single();

      if (profile?.trial_end_date) {
        const now = new Date();
        const endDate = new Date(profile.trial_end_date);
        const diffTime = endDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        setTrialInfo({
          daysRemaining: Math.max(0, daysRemaining),
          isInTrial: daysRemaining > 0 && profile.subscription_status === 'trial'
        });
      }
    };

    checkTrial();
  }, []);

  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      // Call the edge function to create a checkout session
      const response = await fetch(
        "https://eoupodozovwxbldzptlp.supabase.co/functions/v1/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            priceId,
            successUrl: `${window.location.origin}/dashboard?subscription=success`,
            cancelUrl: `${window.location.origin}/subscription-required`,
          }),
        }
      );

      const data = await response.json();

      if (data.testMode) {
        setTestMode(true);
        toast.info("Modo de prueba: La pasarela de pago no está configurada");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Error al procesar el pago. Inténtalo de nuevo.");
    } finally {
      setLoading(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-green-500/5 to-transparent rounded-full" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-green-500/5 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
            {trialInfo?.isInTrial ? (
              <Clock className="w-8 h-8 text-green-500" />
            ) : (
              <span className="text-3xl">🔒</span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            {trialInfo?.isInTrial
              ? `Te quedan ${trialInfo.daysRemaining} días de prueba`
              : "Tu período de prueba ha terminado"}
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            {trialInfo?.isInTrial
              ? "Aprovecha este tiempo para configurar tus finanzas o activa ya tu plan premium para no perder el acceso."
              : "Gracias por probar Monyro. Para seguir disfrutando de todas las funcionalidades premium, elige el plan que mejor se adapte a ti."}
          </p>
        </div>

        {/* Test mode banner */}
        {testMode && (
          <div className="mb-8 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-center">
            <p>⚠️ Modo de prueba activo. La integración con Stripe no está configurada.</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Monthly Plan */}
          <Card className="rounded-3xl border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-lg font-medium text-zinc-400 mb-2">Plan Mensual</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-white">2,8€</span>
                  <span className="text-zinc-500">/mes</span>
                </div>
                <p className="text-sm text-zinc-500 mb-8">Facturación mensual</p>
                
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center gap-3 text-zinc-300">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Acceso completo a Monyro</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Gestión de deudas</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Seguimiento de inversiones</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Patrimonio y análisis</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Soporte prioritario</span>
                  </li>
                </ul>

                <Button
                  onClick={() => handleSubscribe(STRIPE_PRICE_MONTHLY)}
                  disabled={loading === STRIPE_PRICE_MONTHLY}
                  className="w-full rounded-2xl bg-zinc-100 text-black hover:bg-zinc-200 h-12 text-base font-semibold"
                >
                  {loading === STRIPE_PRICE_MONTHLY ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Suscribirse mensual"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card className="rounded-3xl border-green-500/30 bg-green-500/5 backdrop-blur relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl">
              AHORRA 10%
            </div>
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-lg font-medium text-green-400 mb-2">Plan Anual</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-white">25€</span>
                  <span className="text-zinc-500">/año</span>
                </div>
                <p className="text-sm text-zinc-500 mb-8">
                  Equivale a <span className="text-green-400 font-medium">2,08€/mes</span>
                </p>
                
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center gap-3 text-zinc-300">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Todo del plan mensual</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>2 meses gratis</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Acceso prioritario a nuevas funciones</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Soporte premium</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Cancelación flexible</span>
                  </li>
                </ul>

                <Button
                  onClick={() => handleSubscribe(STRIPE_PRICE_YEARLY)}
                  disabled={loading === STRIPE_PRICE_YEARLY}
                  className="w-full rounded-2xl bg-green-500 text-black hover:bg-green-600 h-12 text-base font-semibold"
                >
                  {loading === STRIPE_PRICE_YEARLY ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Suscribirse annually"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-zinc-500 mb-4">
            <HelpCircle className="h-5 w-5" />
            <span>¿Tienes preguntas?</span>
          </div>
          <p className="text-zinc-400 mb-6">
            Contáctanos en{" "}
            <a href="mailto:soporte@monyro.app" className="text-green-400 hover:underline">
              soporte@monyro.app
            </a>
          </p>
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-zinc-500 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-zinc-600 text-sm">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>Pago seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <span>↩️</span>
            <span>Cancelación fácil</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💳</span>
            <span>Visa, Mastercard, PayPal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequired;