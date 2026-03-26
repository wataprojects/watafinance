"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currency";
import { UtensilsCrossed, Car, Home, Zap, ShoppingBag, Film, MoreHorizontal, DropletsIcon, Shield, Wifi, Smartphone, Flame, Sparkles, Train, Shirt, Briefcase, Landmark } from "lucide-react";

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
    loans: <Landmark className="w-4 h-4" />,
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
    loans: "text-cyan-400",
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
    loans: "bg-cyan-500/20",
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
    loans: "Préstamos",
    other: "Otros",
  };
  return labels[category] || category;
};

// Función auxiliar para dividir gastos en grupos de 4
const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
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

    // Fetch regular expenses
    const expensesResult = await supabase
      .from("expenses")
      .select("amount, category")
      .eq("user_id", session.user.id)
      .order("amount", { ascending: false })
      .limit(10);

    // Fetch active loans with monthly payment
    const loansResult = await supabase
      .from("loans")
      .select("monthly_payment, borrower_name, bank")
      .eq("user_id", session.user.id)
      .eq("status", "active");

    // Process expenses data
    let allExpenses: any[] = [];
    
    if (expensesResult.data) {
      const expenseData = expensesResult.data.map((e: any) => ({
        amount: parseFloat(e.amount || 0),
        category: e.category,
        description: null
      }));
      allExpenses = [...allExpenses, ...expenseData];
    }

    // Process loans data - treat each loan as a category
    if (loansResult.data) {
      const loansData = loansResult.data
        .filter((loan: any) => loan.monthly_payment && parseFloat(loan.monthly_payment) > 0)
        .map((loan: any) => ({
          amount: parseFloat(loan.monthly_payment || 0),
          category: "loans",
          description: loan.borrower_name || loan.bank || "Préstamo"
        }));
      allExpenses = [...allExpenses, ...loansData];
    }

    // Sort by amount descending and take top 10
    allExpenses.sort((a, b) => b.amount - a.amount);
    setExpenses(allExpenses.slice(0, 10));
    setLoading(false);
  };

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  
  // Dividir los gastos en grupos de 4
  const expenseChunks = chunkArray(expenses, 4);

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2 pt-6">
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
          <div className="relative px-1">
            <Carousel
              className="w-full"
              opts={{
                align: "start",
                loop: false,
              }}
            >
              <CarouselContent className="ml-0">
                {expenseChunks.map((chunk, chunkIndex) => (
                  <CarouselItem key={chunkIndex} className="p-0">
                    <div className="space-y-2 px-1">
                      {chunk.map((expense, index) => {
                        const percentage = total > 0 ? Math.round((expense.amount / total) * 100) : 0;
                        const iconColor = getCategoryIconColor(expense.category);
                        const iconBg = getCategoryBgColor(expense.category);
                        const categoryLabel = expense.description 
                          ? `${getCategoryLabel(expense.category)} - ${expense.description}`
                          : getCategoryLabel(expense.category);
                        
                        return (
                          <div 
                            key={index} 
                            className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl"
                          >
                            {/* Icono de la categoría */}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                              <span className={iconColor}>
                                {getCategoryIcon(expense.category)}
                              </span>
                            </div>
                            
                            {/* Nombre de la categoría */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-zinc-300 truncate">
                                {categoryLabel}
                              </p>
                              {/* Barra de progreso horizontal */}
                              <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden mt-1">
                                <div 
                                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                            
                            {/* Importe y porcentaje */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-white">
                                {formatCurrency(expense.amount)}
                              </p>
                              <p className="text-[10px] text-zinc-500">
                                {percentage}%
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            
            {/* Indicadores de posición (puntos) */}
            {expenseChunks.length > 1 && (
              <div className="flex justify-center gap-1 mt-3">
                {expenseChunks.map((_, index) => (
                  <div
                    key={index}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-600"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopExpenses;