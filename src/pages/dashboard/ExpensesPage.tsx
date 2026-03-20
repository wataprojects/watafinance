"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TrendingDown, CreditCard, ShoppingCart, Car, Home, Utensils, Zap, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    category: "food",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    } else {
      fetchExpenses(session.user.id);
    }
  };

  const fetchExpenses = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (data) setExpenses(data);
    setLoading(false);
  };

  const handleAddExpense = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("expenses").insert({
      user_id: session.user.id,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      category: newExpense.category,
      date: newExpense.date,
    });

    if (!error) {
      setIsDialogOpen(false);
      setNewExpense({
        amount: "",
        description: "",
        category: "food",
        date: new Date().toISOString().split("T")[0],
      });
      fetchExpenses(session.user.id);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      food: Utensils,
      transport: Car,
      housing: Home,
      utilities: Zap,
      shopping: ShoppingCart,
      entertainment: Film,
      other: CreditCard,
    };
    return icons[category] || CreditCard;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: "bg-emerald-500/20 text-emerald-400",
      transport: "bg-purple-500/20 text-purple-400",
      housing: "bg-blue-500/20 text-blue-400",
      utilities: "bg-yellow-500/20 text-yellow-400",
      shopping: "bg-rose-500/20 text-rose-400",
      entertainment: "bg-pink-500/20 text-pink-400",
      other: "bg-slate-500/20 text-slate-400",
    };
    return colors[category] || "bg-slate-500/20 text-slate-400";
  };

  const categories = [
    { value: "food", label: "Comida" },
    { value: "transport", label: "Transporte" },
    { value: "housing", label: "Vivienda" },
    { value: "utilities", label: "Servicios" },
    { value: "shopping", label: "Compras" },
    { value: "entertainment", label: "Entretenimiento" },
    { value: "other", label: "Otros" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Gastos</h1>
            <p className="text-slate-400">Controla tus gastos mensuales</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-rose-500 hover:bg-rose-600">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Agregar Gasto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-slate-300">Monto</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Descripción</label>
                  <Input
                    placeholder="Descripción del gasto"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Categoría</label>
                  <Select value={newExpense.category} onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddExpense} className="w-full bg-rose-500 hover:bg-rose-600">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardContent className="p-6 text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-rose-400" />
            <p className="text-4xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
            <p className="text-slate-400">Total de Gastos</p>
          </CardContent>
        </Card>

        {/* Lista de gastos */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              Historial de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400 text-center">Cargando...</p>
            ) : expenses.length === 0 ? (
              <p className="text-slate-400 text-center">No hay gastos registrados</p>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => {
                  const Icon = getCategoryIcon(expense.category);
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(expense.category)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{expense.description || expense.category}</p>
                          <p className="text-xs text-slate-400">{new Date(expense.date).toLocaleDateString("es-ES")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-rose-400">-{formatCurrency(expense.amount)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default ExpensesPage;
