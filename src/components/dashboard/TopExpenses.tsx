"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UtensilsCrossed, Car, Home, Zap, ShoppingBag, Film, MoreHorizontal, Coffee, DropletsIcon, Shield, Wifi, Smartphone, Flame, Sparkles, Train, Shirt, Briefcase } from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    food: <UtensilsCrossed className="w-4 h-4" />,
    transport: <Car className="w-4 h-4" />,
    housing: <Home className="w-4 h-4" />,
    electricity: <Zap className="w-4 h-4" />,
    water: <DropletsIcon className="w-4 h-4" />,
    security: <Shield className="w-4 h-4" />,
    insurance: <Shield className="w-4 h-4" />,
    internet: <Wifi className="w-4 h-4" />,
    subscriptions: <Smartphone className="w-4 h-4" />,
    gas: <Flame className="w-4 h-4" />,
    cleaning: <Sparkles className="w-4 h-4" />,
    fuel: <Car className="w-4 h-4" />,
    groceries: <ShoppingBag className="w-4 h-4" />,
    entertainment: <Film className="w-4 h-4" />,
    business_investment: <Briefcase className="w-4 h-4" />,
    advertising: <Sparkles className="w-4 h-4" />,
    transport_local: <Train className="w-4 h-4" />,
    restaurants: <UtensilsCrossed className="w-4 h-4" />,
    shopping: <Shirt className="w-4 h-4" />,
    health: <Shield className="w-4 h-4" />,
    other: <MoreHorizontal className="w-4 h-4" />,
  };
  return icons[category] || <MoreHorizontal className="w-4 h-4" />;
};

const getCategoryIconColor = (category: string) => {
  const colors: Record<string, string> = {
    food: "text-green-500",
    transport: "text-purple-500",
    housing: "text-blue-500",
    electricity: "text-yellow-500",
    water: "text-cyan-500",
    security: "text-slate-500",
    insurance: "text-indigo-500",
    internet: "text-violet-500",
    subscriptions: "text-pink-500",
    gas: "text-orange-500",
    cleaning: "text-teal-500",
    fuel: "text-red-500",
    groceries: "text-emerald-500",
    entertainment: "text-rose-500",
    business_investment: "text-amber-500",
    advertising: "text-fuchsia-500",
    transport_local: "text-sky-500",
    restaurants: "text-orange-400",
    shopping: "text-pink-400",
    health: "text-red-400",
    other: "text-zinc-500",
  };
  return colors[category] || "text-zinc-500";
};

const getCategoryBgColor = (category: string) => {
  const colors: Record<string, string> = {
    food: "bg-green-500/20",
    transport: "bg-purple-500/20",
    housing: "bg-blue-500/20",
    electricity: "bg-yellow-500/20",
    water: "bg-cyan-500/20",
    security: "bg-slate-500/20",
    insurance: "bg-indigo-500/20",
    internet: "bg-violet-500/20",
    subscriptions: "bg-pink-500/20",
    gas: "bg-orange-500/20",
    cleaning: "bg-teal-500/20",
    fuel: "bg-red-500/20",
    groceries: "bg-emerald-500/20",
    entertainment: "bg-rose-500/20",
    business_investment: "bg-amber-500/20",
    advertising: "bg-fuchsia-500/20",
    transport_local: "bg-sky-500/20",
    restaurants: "bg-orange-500/20",
    shopping: "bg-pink-500/20",
    health: "bg-red-500/20",
    other: "bg-zinc-500/20",
  };
  return colors[category] || "bg-zinc-500/20";
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    food: "Comida",
    transport: "Transporte",
    housing: "Vivienda",
    electricity: "Luz",
    water: "Agua",
    security: "Alarmas",
    insurance: "Seguros",
    internet: "Internet",
    subscriptions: "Suscripciones",
    gas: "Gas",
    cleaning: "Limpieza",
    fuel: "Gasolina",
    groceries: "Supermercado",
    entertainment: "Ocio",
    business_investment: "Inversión",
    advertising: "Publicidad",
    transport_local: "Transporte",
    restaurants: "Restaurantes",
    shopping: "Compras",
    health: "Salud",
    other: "Otros",
  };
  return labels[category] || category;
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
      .limit(10);

    if (data) setExpenses(data);
    setLoading(false);
  };

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
          <CreditCard className="w-5 h-5 text-green-500" />
          Principales Gastos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : expenses.length === 0 ? (
          <p className="text-zinc-400 text-center py-4 text-sm">No hay gastos registrados</p>
        ) : (
          <div 
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {expenses.map((expense, index) => {
              const percentage = total > 0 ? Math.round((expense.amount / total) * 100) : 0;
              const iconColor = getCategoryIconColor(expense.category);
              const iconBg = getCategoryBgColor(expense.category);
              
              return (
                <div 
                  key={index} 
                  className="flex-shrink-0 w-28 p-2 bg-zinc-800/50 rounded-xl space-y-2"
                >
                  {/* Icono y categoría */}
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
                      <span className={iconColor}>
                        {getCategoryIcon(expense.category)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Categoría label */}
                  <p className="text-xs text-zinc-400 truncate">
                    {getCategoryLabel(expense.category)}
                  </p>
                  
                  {/* Importe */}
                  <p className="text-sm font-bold text-white">
                    {formatCurrency(expense.amount)}
                  </p>
                  
                  {/* Barra de progreso */}
                  <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  {/* Porcentaje */}
                  <p className="text-[10px] text-zinc-500">
                    {percentage}% del total
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopExpenses;