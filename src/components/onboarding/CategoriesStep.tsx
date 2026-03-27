"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Tv, Gamepad2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CategoriesStepProps {
  onNext: (categories: string[]) => void;
}

type ExpenseCategory = "alquiler" | "suscripciones" | "ocio";

const categoryOptions = [
  { id: "alquiler" as ExpenseCategory, label: "Alquiler", icon: Home },
  { id: "suscripciones" as ExpenseCategory, label: "Suscripciones", icon: Tv },
  { id: "ocio" as ExpenseCategory, label: "Ocio", icon: Gamepad2 },
];

const CategoriesStep: React.FC<CategoriesStepProps> = ({ onNext }) => {
  const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleCategory = (category: ExpenseCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, category];
    });
  };

  const handleContinue = async () => {
    if (selectedCategories.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("No se encontró la sesión. Por favor, inicia sesión de nuevo.");
        setLoading(false);
        return;
      }

      // Update profile with selected categories
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ selected_categories: selectedCategories })
        .eq("id", session.user.id);

      if (updateError) {
        setError("Error al guardar las categorías. Por favor, inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      onNext(selectedCategories);
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
          Selecciona hasta 3 categorías que quieras controlar
        </h2>
        <p className="text-zinc-400">Elige las más relevantes para ti</p>
      </div>

      <div className="text-center">
        <span className={`text-lg font-medium ${selectedCategories.length > 0 ? "text-green-400" : "text-zinc-500"}`}>
          {selectedCategories.length}/3 seleccionadas
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {categoryOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedCategories.includes(option.id);

          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-green-900/30 border-green-500"
                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
              }`}
              onClick={() => toggleCategory(option.id)}
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

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <Button
        onClick={handleContinue}
        disabled={selectedCategories.length === 0 || loading}
        className="w-full bg-green-500 hover:bg-green-600 text-black py-6 font-semibold text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Guardando..." : "Continuar"}
      </Button>
    </div>
  );
};

export default CategoriesStep;