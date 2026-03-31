"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AvatarUpload from "@/components/dashboard/AvatarUpload";
import { toast } from "sonner";

type ProfileData = {
  first_name: string;
  last_name: string;
  avatar_url: string | null;
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
        .select("first_name, last_name, avatar_url")
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardHeader title="FinPro" subtitle="Perfil" />
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
      <DashboardHeader title="FinPro" subtitle="Gestión de perfil" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="rounded-2xl text-zinc-300 hover:bg-zinc-900 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="rounded-2xl border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            {logoutLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            Salir
          </Button>
        </div>

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

            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-sm text-green-300">
                Estado de suscripción: <span className="font-semibold">Activa</span>
              </p>
              <p className="mt-1 text-xs text-green-200/80">
                Una única suscripción activa controla el acceso a las funciones premium.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfilePage;