"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { UtensilsCrossed, Car, Home, Zap, ShoppingBag, Film, MoreHorizontal, Coffee } from "lucide-react";

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
    food: <UtensilsCrossed className="w-5 h-5" />,
    transport: <Car className="w-5 h-5" />,
    housing: <Home className="w-5 h-5" />,
    utilities: <Zap className="w-5 h-5" />,
    shopping: <ShoppingBag className="w-5 h-5" />,
    entertainment: <Film className="w-5 h-5" />,
    other: <MoreHorizontal className="w-5 h-5" />,
  };
  return icons[category] || <MoreHorizontal className="w-5 h-5" />;
};

const getCategoryIconColor = (category: string) => {
  const colors: Record<string, string> = {
    food: "text-green-500",
    transport: "text-purple-500",
    housing: "text-blue-500",
    utilities: "text-yellow-500",
    shopping: "text-pink-500",
    entertainment: "text-indigo-500",
    other: "text-zinc-500",
  };
  return colors[category] || "text-zinc-500";
};

const getCategoryBgColor = (category: string) => {
  const colors: Record<string, string> = {
    food: "bg-green-500/20",
    transport: "bg-purple-500/20",
    housing: "bg-blue-500/20",
    utilities: "bg-yellow-500/20",
    shopping: "bg-pink-500/20",
    entertainment: "bg-indigo-500/20",
    other: "bg-zinc-500/20",
  };
  return colors[category] || "bg-zinc-500/20";
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
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : expenses.length === 0 ? (
          <p className="text-zinc-400 text-center py-8">No hay gastos registrados</p>
        ) : (
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-2">
              {expenses.map((expense, index) => {
                const percentage = total > 0 ? Math.round((expense.amount / total) * 100) : 0;
                const iconColor = getCategoryIconColor(expense.category);
                const iconBg = getCategoryBgColor(expense.category);
                
                return (
                  <CarouselItem key={index} className="pl-2">
                    <div className="p-3 bg-zinc-800/50 rounded-xl space-y-3">
                      {/* Icono y categoría */}
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
                          <span className={iconColor}>
                            {getCategoryIcon(expense.category)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">
                            {getCategoryLabel(expense.category)}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {percentage}% del total
                          </p>
                        </div>
                      </div>
                      
                      {/* Importe */}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-white">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                      
                      {/* Barra de progreso */}
                      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-0 bg-zinc-800 border-zinc-700 hover:bg-zinc-700" />
            <CarouselNext className="right-0 bg-zinc-800 border-zinc-700 hover:bg-zinc-700" />
          </Carousel>
        )}
      </CardContent>
    </Card>
  );
};

export default TopExpenses;