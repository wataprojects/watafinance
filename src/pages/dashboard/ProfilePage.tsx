"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AvatarUpload from "@/components/dashboard/AvatarUpload";
import BottomNav from "@/components/dashboard/BottomNav";
import { toast } from "sonner";

type ProfileData = {
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  created_at: string | null;
  subscription_status: string | null;
  subscription_tier: string | null;
  trial_end_date: string | null;
  current_period_end: string | null;
};

type SettingsData = {
  recommendations_enabled: boolean;
  notifications_enabled: boolean;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
        first_name: "",
        last_name: "",
        avatar_url: null,
        created_at: null,
        subscription_status: null,
        subscription_tier: null,
        trial_end_date: null,
        current_period_end: null,
      });
  const [settings, setSettings] = useState<SettingsData>({
    recommendations_enabled: true,
    notifications_enabled: true,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate("/login");
      return;
    }

    setUserId(session.user.id);

    const [profileResult, settingsResult] = await Promise.all([
              supabase
                .from("profiles")
                .select("first_name, last_name, avatar_url, created_at, subscription_status, subscription_tier, trial_end_date, current_period_end")
                .eq("id", session.user.id)
                .single(),
          supabase
            .from("user_monetization_settings")
            .select("recommendations_enabled, notifications_enabled")
            .eq("user_id", session.user.id)
            .maybeSingle(),
        ]);
    
        if (profileResult.data) {
              setProfile({
                first_name: profileResult.data.first_name || "",
                last_name: profileResult.data.last_name || "",
                avatar_url: profileResult.data.avatar_url || null,
                created_at: profileResult.data.created_at || null,
                subscription_status: profileResult.data.subscription_status || "trial",
                subscription_tier: profileResult.data.subscription_tier || "none",
                trial_end_date: profileResult.data.trial_end_date || null,
                current_period_end: profileResult.data.current_period_end || null,
              });
            }

    if (settingsResult.data) {
      setSettings({
        recommendations_enabled: settingsResult.data.recommendations_enabled ?? true,
        notifications_enabled: settingsResult.data.notifications_enabled ?? true,
      });
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);

    const [profileUpdate, settingsUpdate] = await Promise.all([
      supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId),
      supabase
        .from("user_monetization_settings")
        .upsert({
          user_id: userId,
          recommendations_enabled: settings.recommendations_enabled,
          notifications_enabled: settings.notifications_enabled,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        }),
    ]);

    if (profileUpdate.error) {
      toast.error(profileUpdate.error.message);
      setSaving(false);
      return;
    }

    if (settingsUpdate.error) {
      toast.error(settingsUpdate.error.message);
      setSaving(false);
      return;
    }

    toast.success("Perfil guardado correctamente");
    setSaving(false);
  };

  const handleLogout = async () => {
      setLogoutLoading(true);
      await supabase.auth.signOut();
      toast.success("Sesión cerrada");
      navigate("/");
    };
  
    const calculateTrialDays = (trialEndDate: string | null) => {
          if (!trialEndDate) return { daysRemaining: 0, isInTrial: false };
          
          const now = new Date();
          const endDate = new Date(trialEndDate);
          
          const diffTime = endDate.getTime() - now.getTime();
          const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return {
            daysRemaining: Math.max(0, daysRemaining),
            isInTrial: daysRemaining > 0
          };
        };
    
        const getSubscriptionDisplay = () => {
          const status = profile.subscription_status;
          const tier = profile.subscription_tier;
          
          if (status === "active") {
            const tierName = tier === "yearly" ? "Anual" : "Mensual";
            return {
              label: `Plan Premium ${tierName}`,
              color: "green",
              description: tier === "yearly" ? "25€/año" : "2.8€/mes"
            };
          } else if (status === "cancelled") {
            return {
              label: "Suscripción cancelada",
              color: "yellow",
              description: "Acceso hasta fin de período"
            };
          } else if (status === "past_due") {
            return {
              label: "Pago pendiente",
              color: "red",
              description: "Actualiza tu método de pago"
            };
          } else {
            // Trial
            const trialInfo = calculateTrialDays(profile.trial_end_date);
            return {
              label: trialInfo.isInTrial
                ? `Prueba gratuita (${trialInfo.daysRemaining} días restantes)`
                : "Período de prueba terminado",
              color: trialInfo.isInTrial ? "green" : "red",
              description: trialInfo.isInTrial ? "60 días de prueba" : "2.8€/mes para continuar"
            };
          }
        };
  
    if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardHeader title="Monyro" subtitle="Perfil" />
        <div className="container mx-auto px-4 py-6 space-y-4">
          <div className="h-48 rounded-3xl bg-zinc-900 animate-pulse" />
          <div className="h-56 rounded-3xl bg-zinc-900 animate-pulse" />
          <div className="h-32 rounded-3xl bg-zinc-900 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      <DashboardHeader title="Monyro" subtitle="Gestión de perfil" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card className="rounded-3xl border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-xl text-white">Tu perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <AvatarUpload
              userId={userId}
              currentUrl={profile.avatar_url}
              onUpload={(url) => setProfile((prev) => ({ ...prev, avatar_url: url }))}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Nombre</label>
                <Input
                  value={profile.first_name}
                  onChange={(e) => setProfile((prev) => ({ ...prev, first_name: e.target.value }))}
                  className="rounded-2xl border-zinc-800 bg-zinc-950 text-white"
                  placeholder="Tu nombre"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Apellido</label>
                <Input
                  value={profile.last_name}
                  onChange={(e) => setProfile((prev) => ({ ...prev, last_name: e.target.value }))}
                  className="rounded-2xl border-zinc-800 bg-zinc-950 text-white"
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-2xl bg-green-500 text-black hover:bg-green-600"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-white">
              <ShieldCheck className="h-5 w-5 text-green-400" />
              Suscripción y preferencias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div>
                <p className="font-medium text-white">Recomendaciones</p>
                <p className="text-sm text-zinc-500">Recibir sugerencias personalizadas de la app</p>
              </div>
              <Switch
                checked={settings.recommendations_enabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, recommendations_enabled: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div>
                <p className="font-medium text-white">Notificaciones</p>
                <p className="text-sm text-zinc-500">Activar avisos y recordatorios de la app</p>
              </div>
              <Switch
                checked={settings.notifications_enabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, notifications_enabled: checked }))
                }
              />
            </div>

            {/* Mostrar estado de suscripción */}
                                                {(() => {
                                                  const subDisplay = getSubscriptionDisplay();
                                                  const isNotActive = profile.subscription_status !== 'active';
                                                  const colorClasses = {
                                                    green: "border-green-500/20 bg-green-500/10 text-green-300",
                                                    yellow: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
                                                    red: "border-red-500/20 bg-red-500/10 text-red-300"
                                                  };
                                                  return (
                                                    <div className="space-y-3">
                                                      <div className={`rounded-2xl border p-4 ${colorClasses[subDisplay.color as keyof typeof colorClasses]}`}>
                                                        <p className="text-sm font-medium">
                                                          {subDisplay.label}
                                                        </p>
                                                        <p className="mt-1 text-xs opacity-80">
                                                          {subDisplay.description}
                                                        </p>
                                                      </div>
                                                      
                                                      {isNotActive && (
                                                        <Button
                                                          onClick={() => navigate("/subscription-required")}
                                                          className="w-full rounded-2xl bg-green-500 text-black hover:bg-green-600"
                                                        >
                                                          🎯 Ver planes de suscripción
                                                        </Button>
                                                      )}
                                                    </div>
                                                  );
                                                })()}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;