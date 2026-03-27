"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, Building2, Briefcase, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface IncomeSourceStepProps {
  onNext: (data: { category: string; amount: number }) => void;
}

type IncomeCategory = "sueldo" | "alquiler" | "negocio";

const incomeOptions = [
  { id: "sueldo" as IncomeCategory, label: "Sueldo", icon: Wallet },
  { id: "alquiler" as IncomeCategory, label: "Alquiler", icon: Building2 },
  { id: "negocio" as IncomeCategory, label: "Negocio", icon: Briefcase },
];

const IncomeSourceStep: React.FC<IncomeSourceStepProps> = ({ onNext }) => {
  const [selectedCategory, setSelectedCategory] = useState<IncomeCategory | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidAmount = (value: string) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  };

  const handleContinue = async () => {
    if (!selectedCategory || !isValidAmount(amount)) return;

    setLoading(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("No se encontró la sesión. Por favor, inicia sesión de nuevo.");
        setLoading(false);
        return;
      }

      // Insert income record
      const { error: insertError } = await supabase.from("incomes").insert({
        user_id: session.user.id,
        amount: parseFloat(amount),
        category: selectedCategory,
        date: new Date().toISOString().split("T")[0],
        is_recurring: true,
      });

      if (insertError) {
        setError("Error al guardar los datos. Por favor, inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      onNext({ category: selectedCategory, amount: parseFloat(amount) });
    } catch (err) {
      setError("Ha ocurrido un error. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">
          ¿Cuál es tu principal fuente de ingresos?
        </h2>
        <p className="text-zinc-400">Selecciona una opción para continuar</p>
      </div>

      <div className="space-y-4">
        {incomeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedCategory === option.id;

          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-green-900/30 border-green-500"
                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
              }`}
              onClick={() => setSelectedCategory(option.id)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? "bg-green-500" : "bg-zinc-800"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? "text-black" : "text-zinc-400"}`} />
                </div>
                <span className={`text-lg font-medium ${isSelected ? "text-green-400" : "text-white"}`}>
                  {option.label}
                </span>
                {isSelected && (
                  <div className="ml-auto w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedCategory && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
          <label className="text-sm text-zinc-400">
            ¿Cuánto recibes mensualmente?
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">€</span>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 pl-8 text-lg h-14"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <Button
        onClick={handleContinue}
        disabled={!selectedCategory || !isValidAmount(amount) || loading}
        className="w-full bg-green-500 hover:bg-green-600 text-black py-6 font-semibold text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Guardando..." : "Continuar"}
      </Button>
    </div>
  );
};

export default IncomeSourceStep;