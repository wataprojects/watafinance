"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Calendar, CreditCard, Shield, Bell, HelpCircle, LogOut, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface SubscriptionInfo {
  plan: string;
  status: string;
  current_period_end: string;
  is_trial: boolean;
}

const MiCuenta: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate("/");
      return;
    }

    // Get user metadata from session
    const user = session.user;
    setProfile({
      id: user.id,
      email: user.email || "",
      first_name: user.user_metadata?.first_name || null,
      last_name: user.user_metadata?.last_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: user.created_at,
    });

    // Mock subscription data (replace with actual API call when Stripe is integrated)
    setSubscription({
      plan: "Premium",
      status: "active",
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_trial: false,
    });

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const menuItems = [
    {
      icon: CreditCard,
      title: "Suscripción",
      description: "Gestiona tu plan y métodos de pago",
      action: () => console.log("Navigate to subscription"),
      badge: subscription?.plan || "Free",
    },
    {
      icon: Bell,
      title: "Notificaciones",
      description: "Configura tus preferencias",
      action: () => console.log("Navigate to notifications"),
    },
    {
      icon: Shield,
      title: "Privacidad y Seguridad",
      description: "Protege tu cuenta",
      action: () => console.log("Navigate to security"),
    },
    {
      icon: HelpCircle,
      title: "Ayuda y Soporte",
      description: "Obtén ayuda con la aplicación",
      action: () => console.log("Navigate to help"),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">Mi Cuenta</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-black" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">
                  {profile?.first_name && profile?.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : "Usuario"}
                </h2>
                <div className="flex items-center gap-2 text-zinc-400 text-sm mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{profile?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-xs mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>Miembro desde {profile?.created_at ? formatDate(profile.created_at) : "N/A"}</span>
                </div>
              </div>
              {subscription?.is_trial && (
                <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-medium">
                  Trial
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-green-400" />
                <CardTitle className="text-black text-lg">Plan {subscription?.plan || "Free"}</CardTitle>
              </div>
              {subscription?.status === "active" && (
                <div className="flex items-center gap-1 text-green-400 text-xs">
                  <Check className="w-3 h-3" />
                  <span>Activo</span>
                </div>
              )}
            </div>
            <CardDescription className="text-zinc-400">
              {subscription?.is_trial
                ? `Tu período de prueba termina el ${subscription.current_period_end ? formatDate(subscription.current_period_end) : ""}`
                : `Tu suscripción está activa hasta el ${subscription?.current_period_end ? formatDate(subscription.current_period_end) : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
              onClick={() => console.log("Manage subscription")}
            >
              Gestionar Suscripción
            </Button>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center gap-4 p-4 hover:bg-zinc-800 rounded-xl transition-colors text-left"
              >
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">{item.title}</h3>
                    {item.badge && (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-500 text-sm">{item.description}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};

export default MiCuenta;