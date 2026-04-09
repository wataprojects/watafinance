"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Eye, EyeOff, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    // Get full response (data + error)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Check if there's a session in the response
        if (data?.session) {
          // User created and authenticated automatically - check onboarding status
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", data.session.user.id)
            .single();
    
          if (profile?.onboarding_completed === false) {
            navigate("/onboarding");
          } else {
            navigate("/dashboard");
          }
        } else {
          // Requires email confirmation
          setSuccessMessage("Revisa tu correo electrónico para confirmar tu cuenta");
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate("/login", { state: { message: "Revisa tu correo electrónico para confirmar tu cuenta" } });
          }, 2000);
        }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const passwordRequirements = [
    { met: password.length >= 6, text: "Al menos 6 caracteres" },
    { met: /[A-Z]/.test(password), text: "Una mayúscula" },
    { met: /[0-9]/.test(password), text: "Un número" },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <Wallet className="w-7 h-7 text-black" />
          </div>
          <span className="text-3xl font-bold text-white">Monyro</span>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Crear Cuenta</CardTitle>
            <CardDescription className="text-zinc-400">
              Regístrate para empezar a gestionar tus finanzas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Success message */}
              {successMessage && (
                <div className="p-3 bg-green-900/30 border border-green-800 rounded-lg">
                  <p className="text-green-400 text-sm">{successMessage}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Correo electrónico</label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Contraseña</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password requirements */}
                {password.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? "bg-green-500" : "bg-zinc-700"}`}>
                          {req.met ? (
                            <Check className="w-2.5 h-2.5 text-black" />
                          ) : (
                            <X className="w-2.5 h-2.5 text-zinc-500" />
                          )}
                        </div>
                        <span className={`text-xs ${req.met ? "text-green-400" : "text-zinc-500"}`}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Confirmar Contraseña</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 ${
                    confirmPassword && password !== confirmPassword ? "border-red-500" : ""
                  }`}
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400">Las contraseñas no coinciden</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !isValidEmail(email) || !allRequirementsMet || password !== confirmPassword}
                className="w-full bg-green-500 hover:bg-green-600 text-black py-6 font-semibold"
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/login")}
                className="text-green-400 hover:text-green-300 text-sm"
              >
                ¿Ya tienes cuenta? Inicia sesión aquí
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;