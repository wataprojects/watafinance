"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const TopExpenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("expenses")
      .select("amount, category")
      .eq("user_id", session.user.id)
      .order("amount", { ascending: false })
      .limit(5);

    if (data) setExpenses(data);
    setLoading(false);
  };

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: "bg-emerald-500",
      transport: "bg-purple-500",
      housing: "bg-sky-500",
      utilities: "bg-yellow-500",
      shopping: "bg-rose-500",
      entertainment: "bg-pink-500",
      other: "bg-slate-500",
    };
    return colors[category] || "bg-slate-500";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      food: "Comida",
      transport: "Transporte",
      housing: "Vivienda",
      utilities: "Servicios",
      shopping: "Compras",
      entertainment: "Entretenimiento",
      other: "Otros",
    };
    return labels[category] || category;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
          <CreditCard className="w-5 h-5 text-sky-400" />
          Principales Gastos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400"></div>
          </div>
        ) : expenses.length === 0 ? (
          <p className="text-sky-200 text-center py-8">No hay gastos registrados</p>
        ) : (
          <>
            <div className="space-y-3">
              {expenses.map((expense, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(expense.category)}`}></div>
                    <span className="font-medium text-white">
                      {getCategoryLabel(expense.category)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-white">
                      {formatCurrency(expense.amount)}
                    </span>
                    <span className="text-xs text-sky-200 ml-2">
                      ({total > 0 ? Math.round((expense.amount / total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-sky-200">
                  Total
                </span>
                <span className="text-lg font-bold text-white">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TopExpenses;