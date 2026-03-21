"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  Plus, TrendingDown, CreditCard, ShoppingCart, Car, Home, Utensils, Zap, Film, 
  ChevronRight, Calendar as CalendarIcon, TrendingUp, Building, TrendingDown as TrendingDownIcon,
  Wifi, Smartphone, Heart, Shield, Flame, Sparkles, DollarSign, Briefcase, Megaphone,
  Train, UtensilsCrossed, Shirt, MoreHorizontal, X, Landmark
} from "lucide-react";
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

const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface CategoryOption {
  value: string;
  label: string;
  icon: any;
  color: string;
}

const expenseCategories: CategoryOption[] = [
  { value: "housing", label: "Casa / Alquiler", icon: Home, color: "bg-blue-500/20 text-blue-400" },
  { value: "electricity", label: "Luz / Electricidad", icon: Zap, color: "bg-yellow-500/20 text-yellow-400" },
  { value: "water", label: "Agua", icon: DropletsIcon, color: "bg-cyan-500/20 text-cyan-400" },
  { value: "health", label: "Médico / Salud", icon: Heart, color: "bg-rose-500/20 text-rose-400" },
  { value: "security", label: "Alarmas / Hogar", icon: Shield, color: "bg-slate-500/20 text-slate-400" },
  { value: "insurance", label: "Seguros Vehículos", icon: Shield, color: "bg-indigo-500/20 text-indigo-400" },
  { value: "internet", label: "Internet / Móvil", icon: Wifi, color: "bg-violet-500/20 text-violet-400" },
  { value: "subscriptions", label: "Suscripciones", icon: Smartphone, color: "bg-pink-500/20 text-pink-400" },
  { value: "gas", label: "Calefacción / Gas", icon: Flame, color: "bg-orange-500/20 text-orange-400" },
  { value: "cleaning", label: "Limpieza / Hogar", icon: Sparkles, color: "bg-teal-500/20 text-teal-400" },
  { value: "fuel", label: "Gasolina", icon: Car, color: "bg-red-500/20 text-red-400" },
  { value: "groceries", label: "Supermercado", icon: ShoppingCart, color: "bg-green-500/20 text-green-400" },
  { value: "entertainment", label: "Ocio / Salidas", icon: Film, color: "bg-purple-500/20 text-purple-400" },
  { value: "business_investment", label: "Inversión Negocio", icon: TrendingUp, color: "bg-emerald-500/20 text-emerald-400" },
  { value: "advertising", label: "Publicidad / Ads", icon: Megaphone, color: "bg-rose-500/20 text-rose-400" },
  { value: "transport", label: "Transporte", icon: Train, color: "bg-sky-500/20 text-sky-400" },
  { value: "restaurants", label: "Restaurantes / Comida", icon: UtensilsCrossed, color: "bg-orange-500/20 text-orange-400" },
  { value: "shopping", label: "Compras", icon: Shirt, color: "bg-pink-500/20 text-pink-400" },
];

function DropletsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newExpense, setNewExpense] = useState({
    source: "",
    amount: "",
    is_recurring: false,
    category: "groceries",
    date: new Date(),
    investment_id: "none",
    patrimony_id: "none",
  });

  const [newInvestment, setNewInvestment] = useState({
    name: "",
    type: "stocks",
    initial_value: "",
    current_value: "",
  });
  
  const [newPatrimonyAsset, setNewPatrimonyAsset] = useState({
    name: "",
    category: "real_estate",
    value: "",
  });

  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear().toString();
  const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
  const [filterYear, setFilterYear] = useState<string>(currentYear);
  
  const years = [2024, 2025, 2026, 2027, 2028];
  const months = [
    { value: "all", label: "Todos" },
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    } else {
      fetchExpenses(session.user.id);
      fetchLoans(session.user.id);
      fetchOptions(session.user.id);
    }
  };

  const fetchOptions = async (userId: string) => {
    const [invResult, patResult] = await Promise.all([
      supabase.from("investments").select("id, name").eq("user_id", userId),
      supabase.from("patrimony").select("id, name").eq("user_id", userId),
    ]);
    if (invResult.data) setInvestments(invResult.data);
    if (patResult.data) setPatrimony(patResult.data);
  };

  const fetchLoans = async (userId: string) => {
    const { data } = await supabase
      .from("loans")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active");
    if (data) setLoans(data);
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
    if (isSubmitting) return;
    if (!newExpense.amount || !newExpense.source) return;

    setIsSubmitting(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("expenses").insert({
      user_id: session.user.id,
      amount: parseFloat(newExpense.amount),
      description: newExpense.source,
      category: newExpense.category,
      date: formatDateToISO(newExpense.date),
    });

    if (!error) {
      setIsDialogOpen(false);
      setNewExpense({
        source: "",
        amount: "",
        is_recurring: false,
        category: "groceries",
        date: new Date(),
        investment_id: "none",
        patrimony_id: "none",
      });
      fetchExpenses(session.user.id);
    }
    
    setIsSubmitting(false);
  };

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date + 'T00:00:00');
    const expenseYear = expenseDate.getFullYear().toString();
    const expenseMonth = (expenseDate.getMonth() + 1).toString().padStart(2, '0');
    
    if (filterYear !== "all" && expenseYear !== filterYear) return false;
    if (filterMonth !== "all" && expenseMonth !== filterMonth) return false;
    return true;
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalLoans = loans.reduce((sum, loan) => sum + parseFloat(loan.monthly_payment || 0), 0);
  const totalWithLoans = totalExpenses + totalLoans;

  const getCategoryInfo = (categoryValue: string) => {
    return expenseCategories.find(c => c.value === categoryValue) || expenseCategories[expenseCategories.length - 1];
  };

  const investmentTypes = [
    { value: "stocks", label: "Acciones" },
    { value: "etf", label: "ETF" },
    { value: "crypto", label: "Criptomonedas" },
    { value: "bonds", label: "Bonos" },
    { value: "real_estate", label: "Bienes Raíces" },
    { value: "other", label: "Otros" },
  ];

  const patrimonyCategories = [
    { value: "real_estate", label: "Bienes Raíces" },
    { value: "vehicle", label: "Vehículos" },
    { value: "investments", label: "Inversiones" },
    { value: "savings", label: "Ahorros" },
    { value: "business", label: "Negocios" },
    { value: "other", label: "Otros" },
  ];

  const getInvestmentLabel = () => {
    if (newExpense.investment_id === "none") return "Sin vincular";
    const inv = investments.find(i => i.id === newExpense.investment_id);
    return inv ? inv.name : "Sin vincular";
  };

  const getPatrimonyLabel = () => {
    if (newExpense.patrimony_id === "none") return "Sin vincular";
    const pat = patrimony.find(p => p.id === newExpense.patrimony_id);
    return pat ? pat.name : "Sin vincular";
  };

  return (
    <div className="min-h-screen bg-black pb-28">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Gastos</h1>
            <p className="text-red-400 text-sm">Controla tus gastos mensuales</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Agregar Gasto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Fuente de gasto</label>
                  <Input
                    placeholder="Ej: Supermercado, Luz, Gasolina..."
                    value={newExpense.source}
                    onChange={(e) => setNewExpense({ ...newExpense, source: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Importe *</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Fecha</label>
                  <DatePicker
                    date={newExpense.date}
                    onDateChange={(date) => setNewExpense({ ...newExpense, date })}
                  />
                </div>
                <Button 
                  onClick={handleAddExpense} 
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 mb-6">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="flex-1 bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="all" className="text-white">Todos</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()} className="text-white">{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="flex-1 bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value} className="text-white">{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-6 text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="text-4xl font-bold text-red-500">{formatCurrency(totalWithLoans)}</p>
            <p className="text-zinc-400">Total de Gastos</p>
            {totalLoans > 0 && (
              <p className="text-xs text-cyan-400 mt-1">
                (+ {formatCurrency(totalLoans)} en préstamos)
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Historial de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-zinc-500 text-center">Cargando...</p>
            ) : filteredExpenses.length === 0 ? (
              <p className="text-zinc-500 text-center">No hay gastos registrados</p>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => {
                  const cat = getCategoryInfo(expense.category);
                  const Icon = cat.icon;
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{expense.description || cat.label}</p>
                          <p className="text-xs text-zinc-500">{new Date(expense.date + 'T00:00:00').toLocaleDateString("es-ES")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-500">-{formatCurrency(expense.amount)}</p>
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