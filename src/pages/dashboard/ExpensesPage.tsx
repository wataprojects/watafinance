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
  Plus, TrendingDown, CreditCard, ShoppingCart, Car, Home, Zap, Film, 
  TrendingUp, Building, TrendingDown as TrendingDownIcon,
  Wifi, Smartphone, Heart, Shield, Flame, Sparkles, DollarSign, Briefcase, Megaphone,
  Train, UtensilsCrossed, Shirt, MoreHorizontal, X, ChevronRight, Link2, ChevronDown, PieChart,
  Pencil, Trash2, RefreshCcw, Landmark
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
  textColor: string;
}

const availableIcons = [
  { value: "Home", icon: Home },
  { value: "Zap", icon: Zap },
  { value: "Heart", icon: Heart },
  { value: "Shield", icon: Shield },
  { value: "Wifi", icon: Wifi },
  { value: "Smartphone", icon: Smartphone },
  { value: "Flame", icon: Flame },
  { value: "Sparkles", icon: Sparkles },
  { value: "Car", icon: Car },
  { value: "ShoppingCart", icon: ShoppingCart },
  { value: "Film", icon: Film },
  { value: "TrendingUp", icon: TrendingUp },
  { value: "Megaphone", icon: Megaphone },
  { value: "Train", icon: Train },
  { value: "UtensilsCrossed", icon: UtensilsCrossed },
  { value: "Shirt", icon: Shirt },
  { value: "Briefcase", icon: Briefcase },
  { value: "Wallet", icon: DollarSign },
  { value: "CreditCard", icon: CreditCard },
  { value: "Building", icon: Building },
  { value: "DollarSign", icon: DollarSign },
  { value: "MoreHorizontal", icon: MoreHorizontal },
];

const expenseCategories: CategoryOption[] = [
  { value: "housing", label: "Casa", icon: Home, color: "bg-blue-500/20", textColor: "text-blue-400" },
  { value: "electricity", label: "Luz", icon: Zap, color: "bg-yellow-500/20", textColor: "text-yellow-400" },
  { value: "water", label: "Agua", icon: DropletsIcon, color: "bg-cyan-500/20", textColor: "text-cyan-400" },
  { value: "health", label: "Salud", icon: Heart, color: "bg-rose-500/20", textColor: "text-rose-400" },
  { value: "security", label: "Alarmas", icon: Shield, color: "bg-slate-500/20", textColor: "text-slate-400" },
  { value: "insurance", label: "Seguros", icon: Shield, color: "bg-indigo-500/20", textColor: "text-indigo-400" },
  { value: "internet", label: "Internet", icon: Wifi, color: "bg-violet-500/20", textColor: "text-violet-400" },
  { value: "subscriptions", label: "Suscripciones", icon: Smartphone, color: "bg-pink-500/20", textColor: "text-pink-400" },
  { value: "gas", label: "Gas", icon: Flame, color: "bg-orange-500/20", textColor: "text-orange-400" },
  { value: "cleaning", label: "Limpieza", icon: Sparkles, color: "bg-teal-500/20", textColor: "text-teal-400" },
  { value: "fuel", label: "Gasolina", icon: Car, color: "bg-red-500/20", textColor: "text-red-400" },
  { value: "groceries", label: "Supermercado", icon: ShoppingCart, color: "bg-green-500/20", textColor: "text-green-400" },
  { value: "entertainment", label: "Ocio", icon: Film, color: "bg-purple-500/20", textColor: "text-purple-400" },
  { value: "business_investment", label: "Inversión", icon: TrendingUp, color: "bg-emerald-500/20", textColor: "text-emerald-400" },
  { value: "advertising", label: "Publicidad", icon: Megaphone, color: "bg-rose-500/20", textColor: "text-rose-400" },
  { value: "transport", label: "Transporte", icon: Train, color: "bg-sky-500/20", textColor: "text-sky-400" },
  { value: "restaurants", label: "Restaurantes", icon: UtensilsCrossed, color: "bg-orange-500/20", textColor: "text-orange-400" },
  { value: "shopping", label: "Compras", icon: Shirt, color: "bg-pink-500/20", textColor: "text-pink-400" },
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
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);
  const [isInvestmentDialogOpen, setIsInvestmentDialogOpen] = useState(false);
  const [isPatrimonyDialogOpen, setIsPatrimonyDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>([]);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [showScheduledChange, setShowScheduledChange] = useState(false);
  
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear().toString();
  const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
  const [filterYear, setFilterYear] = useState<string>(currentYear);
  
  const [newExpense, setNewExpense] = useState({
    source: "",
    amount: "",
    is_recurring: false,
    category: "groceries",
    date: new Date(),
    investment_id: "none",
    patrimony_id: "none",
    has_scheduled_change: false,
    scheduled_change_date: null as Date | null,
    scheduled_new_amount: "",
    scheduled_change_type: "increase" as "increase" | "decrease",
  });

  const [editExpense, setEditExpense] = useState({
    id: "",
    source: "",
    amount: "",
    is_recurring: false,
    category: "groceries",
    date: new Date(),
    investment_id: "none",
    patrimony_id: "none",
    has_scheduled_change: false,
    scheduled_change_date: null as Date | null,
    scheduled_new_amount: "",
    scheduled_change_type: "increase" as "increase" | "decrease",
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

  const [newCustomCategory, setNewCustomCategory] = useState({
    name: "",
    icon: "ShoppingCart",
    color: "bg-green-500/20",
    textColor: "text-green-400",
  });

  const years = [2024, 2025, 2026, 2027, 2028];
  const months = [
    { value: "all", label: "Todos" },
    { value: "01", label: "Ene" },
    { value: "02", label: "Feb" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Abr" },
    { value: "05", label: "May" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Ago" },
    { value: "09", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dic" },
  ];

  const categoryColors = [
    { value: "bg-blue-500/20", textColor: "text-blue-400", label: "Azul" },
    { value: "bg-emerald-500/20", textColor: "text-emerald-400", label: "Verde" },
    { value: "bg-purple-500/20", textColor: "text-purple-400", label: "Morado" },
    { value: "bg-cyan-500/20", textColor: "text-cyan-400", label: "Cian" },
    { value: "bg-amber-500/20", textColor: "text-amber-400", label: "Ámbar" },
    { value: "bg-green-500/20", textColor: "text-green-400", label: "Verde claro" },
    { value: "bg-slate-500/20", textColor: "text-slate-400", label: "Gris" },
    { value: "bg-pink-500/20", textColor: "text-pink-400", label: "Rosa" },
    { value: "bg-orange-500/20", textColor: "text-orange-400", label: "Naranja" },
    { value: "bg-red-500/20", textColor: "text-red-400", label: "Rojo" },
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
      fetchIncomes(session.user.id);
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

  const fetchIncomes = async (userId: string) => {
    const { data } = await supabase.from("incomes").select("amount").eq("user_id", userId);
    if (data) setIncomes(data);
  };

  const fetchLoans = async (userId: string) => {
    const { data } = await supabase.from("loans").select("*").eq("user_id", userId).eq("status", "active");
    if (data) setLoans(data);
  };

  const fetchExpenses = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase.from("expenses").select("*").eq("user_id", userId).order("date", { ascending: false });
    if (data) setExpenses(data);
    setLoading(false);
  };

  const handleAddExpense = async () => {
    if (isSubmitting) return;
    if (!newExpense.amount || !newExpense.source) return;
    setIsSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsSubmitting(false); return; }
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
        source: "", amount: "", is_recurring: false, category: "groceries", date: new Date(),
        investment_id: "none", patrimony_id: "none", has_scheduled_change: false,
        scheduled_change_date: null, scheduled_new_amount: "", scheduled_change_type: "increase",
      });
      fetchExpenses(session.user.id);
    }
    setIsSubmitting(false);
  };

  const handleEditExpense = async () => {
    if (isSubmitting || !selectedExpense) return;
    setIsSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsSubmitting(false); return; }
    const { error } = await supabase.from("expenses").update({
      amount: parseFloat(editExpense.amount),
      description: editExpense.source,
      category: editExpense.category,
      date: formatDateToISO(editExpense.date),
    }).eq("id", selectedExpense.id);
    if (!error) {
      setIsEditDialogOpen(false);
      setSelectedExpense(null);
      fetchExpenses(session.user.id);
    }
    setIsSubmitting(false);
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;
    const { error } = await supabase.from("expenses").delete().eq("id", selectedExpense.id);
    if (!error) {
      setIsDeleteDialogOpen(false);
      setSelectedExpense(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchExpenses(session.user.id);
    }
  };

  // ✅ FIX: precargar correctamente recurrencia + vínculos inversión/patrimonio
  const openEditDialog = (expense: any) => {
    setSelectedExpense(expense);
    const expenseDate = new Date(expense.date + 'T00:00:00');
    setEditExpense({
      id: expense.id,
      source: expense.description || "",
      amount: expense.amount.toString(),
      is_recurring:
        expense.is_recurring === true ||
        expense.is_recurring === 1 ||
        expense.is_recurring === "true",
      category: expense.category,
      date: expenseDate,
      investment_id: expense.investment_id || "none",
      patrimony_id: expense.patrimony_id || "none",
      has_scheduled_change:
        expense.has_scheduled_change === true ||
        expense.has_scheduled_change === 1 ||
        expense.has_scheduled_change === "true",
      scheduled_change_date: expense.scheduled_change_date ? new Date(expense.scheduled_change_date + 'T00:00:00') : null,
      scheduled_new_amount: expense.scheduled_new_amount?.toString() || "",
      scheduled_change_type: expense.scheduled_change_type || "increase",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (expense: any) => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateCustomCategory = () => {
    if (!newCustomCategory.name) return;
    const categoryValue = `custom_${newCustomCategory.name.toLowerCase().replace(/\s+/g, '_')}`;
    const iconData = availableIcons.find(i => i.value === newCustomCategory.icon);
    const newCategory: CategoryOption = {
      value: categoryValue,
      label: newCustomCategory.name,
      icon: iconData?.icon || ShoppingCart,
      color: newCustomCategory.color,
      textColor: newCustomCategory.textColor,
    };
    setCustomCategories([...customCategories, newCategory]);
    setNewExpense({ ...newExpense, category: categoryValue });
    setIsCreateCategoryDialogOpen(false);
    setNewCustomCategory({ name: "", icon: "ShoppingCart", color: "bg-green-500/20", textColor: "text-green-400" });
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
  const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const subscriptions = filteredExpenses.filter(e => e.category === "subscriptions");
  const totalSubscriptions = subscriptions.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const expensesByCategory = filteredExpenses.reduce((acc, e) => {
    if (!acc[e.category]) acc[e.category] = 0;
    acc[e.category] += parseFloat(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const allCategories = [...expenseCategories, ...customCategories];
  const getCategoryInfo = (categoryValue: string) => allCategories.find(c => c.value === categoryValue) || expenseCategories[expenseCategories.length - 1];
  const getSelectedCategoryInfo = (categoryValue: string) => allCategories.find(c => c.value === categoryValue) || expenseCategories.find(c => c.value === categoryValue) || expenseCategories[0];
  const getInvestmentLabel = () => newExpense.investment_id === "none" ? "Sin vincular" : investments.find(i => i.id === newExpense.investment_id)?.name || "Sin vincular";
  const getPatrimonyLabel = () => newExpense.patrimony_id === "none" ? "Sin vincular" : patrimony.find(p => p.id === newExpense.patrimony_id)?.name || "Sin vincular";

  const handleCreateInvestment = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !newInvestment.name || !newInvestment.initial_value) return;
    const { data, error } = await supabase.from("investments").insert({
      user_id: session.user.id, name: newInvestment.name, type: newInvestment.type,
      initial_value: parseFloat(newInvestment.initial_value),
      current_value: parseFloat(newInvestment.current_value) || parseFloat(newInvestment.initial_value),
    }).select().single();
    if (!error && data) {
      setInvestments([...investments, { id: data.id, name: data.name }]);
      setNewExpense({ ...newExpense, investment_id: data.id });
      setIsNewInvestmentOpen(false);
      setNewInvestment({ name: "", type: "stocks", initial_value: "", current_value: "" });
    }
  };

  const handleCreatePatrimony = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !newPatrimonyAsset.name || !newPatrimonyAsset.value) return;
    const { data, error } = await supabase.from("patrimony").insert({
      user_id: session.user.id, name: newPatrimonyAsset.name, category: newPatrimonyAsset.category, value: parseFloat(newPatrimonyAsset.value),
    }).select().single();
    if (!error && data) {
      setPatrimony([...patrimony, { id: data.id, name: data.name }]);
      setNewExpense({ ...newExpense, patrimony_id: data.id });
      setIsNewPatrimonyOpen(false);
      setNewPatrimonyAsset({ name: "", category: "real_estate", value: "" });
    }
  };

  const investmentTypes = [
    { value: "stocks", label: "Acciones" }, { value: "etf", label: "ETF" }, { value: "crypto", label: "Criptomonedas" },
    { value: "bonds", label: "Bonos" }, { value: "real_estate", label: "Bienes Raíces" }, { value: "other", label: "Otros" },
  ];
  const patrimonyCategories = [
    { value: "real_estate", label: "Bienes Raíces" }, { value: "vehicle", label: "Vehículos" },
    { value: "investments", label: "Inversiones" }, { value: "savings", label: "Ahorros" },
    { value: "business", label: "Negocios" }, { value: "other", label: "Otros" },
  ];

  const getLoanTypeInfo = (type: string) => {
    const types: Record<string, { label: string; color: string; textColor: string }> = {
      mortgage: { label: "Hipoteca", color: "bg-blue-500/20", textColor: "text-blue-400" },
      car: { label: "Coche", color: "bg-purple-500/20", textColor: "text-purple-400" },
      personal: { label: "Personal", color: "bg-cyan-500/20", textColor: "text-cyan-400" },
      business: { label: "Negocio", color: "bg-amber-500/20", textColor: "text-amber-400" },
      other: { label: "Otro", color: "bg-slate-500/20", textColor: "text-slate-400" },
    };
    return types[type] || types.other;
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
              <Button className="bg-red-500 hover:bg-red-600 text-white"><Plus className="w-4 h-4 mr-2" />Nuevo</Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-white">Agregar Gasto</DialogTitle></DialogHeader>
              <button onClick={() => setIsDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
              <ExpenseForm expense={newExpense} setExpense={setNewExpense} onSubmit={handleAddExpense} isSubmitting={isSubmitting} isNew={true}
                investments={investments} patrimony={patrimony} isNewInvestmentOpen={isNewInvestmentOpen} setIsNewInvestmentOpen={setIsNewInvestmentOpen}
                isNewPatrimonyOpen={isNewPatrimonyOpen} setIsNewPatrimonyOpen={setIsNewPatrimonyOpen} newInvestment={newInvestment} setNewInvestment={setNewInvestment}
                newPatrimonyAsset={newPatrimonyAsset} setNewPatrimonyAsset={setNewPatrimonyAsset} handleCreateInvestment={handleCreateInvestment}
                handleCreatePatrimony={handleCreatePatrimony} investmentTypes={investmentTypes} patrimonyCategories={patrimonyCategories}
                isCategoryDialogOpen={isCategoryDialogOpen} setIsCategoryDialogOpen={setIsCategoryDialogOpen}
                isCreateCategoryDialogOpen={isCreateCategoryDialogOpen} setIsCreateCategoryDialogOpen={setIsCreateCategoryDialogOpen}
                isInvestmentDialogOpen={isInvestmentDialogOpen} setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
                isPatrimonyDialogOpen={isPatrimonyDialogOpen} setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
                getSelectedCategoryInfo={getSelectedCategoryInfo} customCategories={customCategories} availableIcons={availableIcons}
                categoryColors={categoryColors} newCustomCategory={newCustomCategory} setNewCustomCategory={setNewCustomCategory}
                handleCreateCustomCategory={handleCreateCustomCategory} showScheduledChange={showScheduledChange} setShowScheduledChange={setShowScheduledChange} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[90px] bg-zinc-800 border-zinc-700 text-white text-xs"><SelectValue placeholder="Año" /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="all" className="text-white text-xs">Todos</SelectItem>
              {years.map((year) => (<SelectItem key={year} value={year.toString()} className="text-white text-xs">{year}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-[90px] bg-zinc-800 border-zinc-700 text-white text-xs"><SelectValue placeholder="Mes" /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {months.map((month) => (<SelectItem key={month.value} value={month.value} className="text-white text-xs">{month.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 mb-4">
          <CardContent className="p-4 text-center">
            <CreditCard className="w-6 h-6 mx-auto mb-1 text-red-500" />
            <p className="text-2xl font-bold text-red-500">{formatCurrency(totalWithLoans)}</p>
            <p className="text-zinc-400 text-xs">Total de Gastos</p>
            {totalLoans > 0 && (<p className="text-[10px] text-cyan-400 mt-1">(+ {formatCurrency(totalLoans)} préstamos)</p>)}
          </CardContent>
        </Card>

        {loans.length > 0 && (
          <Card className="bg-gradient-to-r from-cyan-900 to-zinc-900 border-cyan-800 mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-sm"><Landmark className="w-4 h-4 text-cyan-400" />Préstamos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loans.map((loan) => {
                  const typeInfo = getLoanTypeInfo(loan.loan_type);
                  return (
                    <div key={loan.id} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeInfo.color}`}>
                          <Landmark className={`w-4 h-4 ${typeInfo.textColor}`} />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{loan.borrower_name}</p>
                          <p className="text-[10px] text-zinc-400">{loan.bank}</p>
                        </div>
                      </div>
                      <div className="text-right"><p className="font-bold text-cyan-400 text-sm">{formatCurrency(loan.monthly_payment)}/mes</p></div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-zinc-700 flex justify-between">
                <span className="text-zinc-400 text-xs">Total</span>
                <span className="text-sm font-bold text-cyan-400">{formatCurrency(totalLoans)}/mes</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-r from-pink-900 to-zinc-900 border-pink-800 mb-4">
          <CardHeader className="pb-2">
            <button onClick={() => setShowSubscriptions(!showSubscriptions)} className="w-full flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-sm"><Smartphone className="w-4 h-4 text-pink-400" />Suscripciones</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-pink-400">{formatCurrency(totalSubscriptions)}</span>
                {showSubscriptions ? (<ChevronDown className="w-4 h-4 text-zinc-400" />) : (<ChevronRight className="w-4 h-4 text-zinc-400" />)}
              </div>
            </button>
          </CardHeader>
          {showSubscriptions && (
            <CardContent>
              {subscriptions.length === 0 ? (<p className="text-zinc-500 text-center py-2 text-xs">Sin suscripciones</p>) : (
                <div className="grid grid-cols-2 gap-2">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                      <div><p className="font-medium text-white text-xs">{sub.description}</p></div>
                      <p className="font-bold text-pink-400 text-xs">{formatCurrency(sub.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 mb-4">
          <CardHeader className="pb-2">
            <button onClick={() => setShowCategories(!showCategories)} className="w-full flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-sm"><PieChart className="w-4 h-4 text-orange-400" />Por Categoría</CardTitle>
              {showCategories ? (<ChevronDown className="w-4 h-4 text-zinc-400" />) : (<ChevronRight className="w-4 h-4 text-zinc-400" />)}
            </button>
          </CardHeader>
          {showCategories && (
            <CardContent>
              {Object.keys(expensesByCategory).length === 0 ? (<p className="text-zinc-500 text-center py-2 text-xs">Sin gastos</p>) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(expensesByCategory).map(([category, amount]) => {
                    const cat = getCategoryInfo(category);
                    const Icon = cat.icon;
                    const percentage = totalWithLoans > 0 ? (amount / totalWithLoans) * 100 : 0;
                    const incomePercentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
                    return (
                      <div key={category} className="p-3 bg-zinc-800/50 rounded-xl space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                            <Icon className={`w-4 h-4 ${cat.textColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm truncate">{cat.label}</p>
                            <p className="text-xs text-orange-400">{incomePercentage.toFixed(1)}% de ingresos</p>
                          </div>
                          <p className="font-bold text-white text-sm">{formatCurrency(amount)}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]"><span className="text-zinc-500">{percentage.toFixed(1)}% del total</span></div>
                          <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all" style={{ width: `${Math.min(percentage, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2 text-sm"><TrendingDown className="w-4 h-4 text-red-500" />Historial</CardTitle></CardHeader>
          <CardContent>
            {loading ? (<p className="text-zinc-500 text-center text-xs">Cargando...</p>) : filteredExpenses.length === 0 ? (<p className="text-zinc-500 text-center text-xs">Sin gastos</p>) : (
              <div className="space-y-2">
                {filteredExpenses.map((expense) => {
                  const cat = getCategoryInfo(expense.category);
                  const Icon = cat.icon;
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                          <Icon className={`w-4 h-4 ${cat.textColor}`} />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{expense.description || cat.label}</p>
                          <p className="text-[10px] text-zinc-500">{new Date(expense.date + 'T00:00:00').toLocaleDateString("es-ES")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right"><p className="font-bold text-red-500 text-sm">-{formatCurrency(expense.amount)}</p></div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => openEditDialog(expense)} className="p-1 rounded hover:bg-zinc-700 transition-colors"><Pencil className="w-3 h-3 text-zinc-400" /></button>
                          <button onClick={() => openDeleteDialog(expense)} className="p-1 rounded hover:bg-red-500/20 transition-colors"><Trash2 className="w-3 h-3 text-red-400" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-white">Editar Gasto</DialogTitle></DialogHeader>
          <button onClick={() => setIsEditDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <ExpenseForm expense={editExpense} setExpense={setEditExpense} onSubmit={handleEditExpense} isSubmitting={isSubmitting} isNew={false}
            investments={investments} patrimony={patrimony} isNewInvestmentOpen={isNewInvestmentOpen} setIsNewInvestmentOpen={setIsNewInvestmentOpen}
            isNewPatrimonyOpen={isNewPatrimonyOpen} setIsNewPatrimonyOpen={setIsNewPatrimonyOpen} newInvestment={newInvestment} setNewInvestment={setNewInvestment}
            newPatrimonyAsset={newPatrimonyAsset} setNewPatrimonyAsset={setNewPatrimonyAsset} handleCreateInvestment={handleCreateInvestment}
            handleCreatePatrimony={handleCreatePatrimony} investmentTypes={investmentTypes} patrimonyCategories={patrimonyCategories}
            isCategoryDialogOpen={isCategoryDialogOpen} setIsCategoryDialogOpen={setIsCategoryDialogOpen}
            isCreateCategoryDialogOpen={isCreateCategoryDialogOpen} setIsCreateCategoryDialogOpen={setIsCreateCategoryDialogOpen}
            isInvestmentDialogOpen={isInvestmentDialogOpen} setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
            isPatrimonyDialogOpen={isPatrimonyDialogOpen} setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
            getSelectedCategoryInfo={getSelectedCategoryInfo} customCategories={customCategories} availableIcons={availableIcons}
            categoryColors={categoryColors} newCustomCategory={newCustomCategory} setNewCustomCategory={setNewCustomCategory}
            handleCreateCustomCategory={handleCreateCustomCategory} showScheduledChange={showScheduledChange} setShowScheduledChange={setShowScheduledChange} />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Eliminar Gasto</DialogTitle></DialogHeader>
          <button onClick={() => setIsDeleteDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300 text-sm">¿Eliminar este gasto?</p>
            {selectedExpense && (
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedExpense.description}</p>
                <p className="text-red-400 font-bold">{formatCurrency(selectedExpense.amount)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800 text-xs">Cancelar</Button>
              <Button onClick={handleDeleteExpense} className="flex-1 bg-red-500 hover:bg-red-600 text-xs">Eliminar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewInvestmentOpen} onOpenChange={setIsNewInvestmentOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white text-sm">Nueva Inversión</DialogTitle></DialogHeader>
          <button onClick={() => setIsNewInvestmentOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs text-zinc-400 mb-1 block">Nombre</label><Input placeholder="Nombre" value={newInvestment.name} onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" /></div>
            <div><label className="text-xs text-zinc-400 mb-1 block">Tipo</label>
              <Select value={newInvestment.type} onValueChange={(v) => setNewInvestment({ ...newInvestment, type: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">{investmentTypes.map((t) => (<SelectItem key={t.value} value={t.value} className="text-white text-xs">{t.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-zinc-400 mb-1 block">Inicial</label><Input type="number" placeholder="0.00" value={newInvestment.initial_value} onChange={(e) => setNewInvestment({ ...newInvestment, initial_value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" /></div>
              <div><label className="text-xs text-zinc-400 mb-1 block">Actual</label><Input type="number" placeholder="0.00" value={newInvestment.current_value} onChange={(e) => setNewInvestment({ ...newInvestment, current_value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" /></div>
            </div>
            <Button onClick={handleCreateInvestment} className="w-full bg-emerald-500 hover:bg-emerald-600 text-black text-sm">Crear</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewPatrimonyOpen} onOpenChange={setIsNewPatrimonyOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white text-sm">Nuevo Patrimonio</DialogTitle></DialogHeader>
          <button onClick={() => setIsNewPatrimonyOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs text-zinc-400 mb-1 block">Nombre</label><Input placeholder="Nombre" value={newPatrimonyAsset.name} onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" /></div>
            <div><label className="text-xs text-zinc-400 mb-1 block">Categoría</label>
              <Select value={newPatrimonyAsset.category} onValueChange={(v) => setNewPatrimonyAsset({ ...newPatrimonyAsset, category: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">{patrimonyCategories.map((c) => (<SelectItem key={c.value} value={c.value} className="text-white text-xs">{c.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><label className="text-xs text-zinc-400 mb-1 block">Valor</label><Input type="number" placeholder="0.00" value={newPatrimonyAsset.value} onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" /></div>
            <Button onClick={handleCreatePatrimony} className="w-full bg-sky-500 hover:bg-sky-600 text-white text-sm">Crear</Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

const ExpenseForm = ({ expense, setExpense, onSubmit, isSubmitting, isNew, investments, patrimony, isNewInvestmentOpen, setIsNewInvestmentOpen, isNewPatrimonyOpen, setIsNewPatrimonyOpen, newInvestment, setNewInvestment, newPatrimonyAsset, setNewPatrimonyAsset, handleCreateInvestment, handleCreatePatrimony, investmentTypes, patrimonyCategories, isCategoryDialogOpen, setIsCategoryDialogOpen, isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen, isInvestmentDialogOpen, setIsInvestmentDialogOpen, isPatrimonyDialogOpen, setIsPatrimonyDialogOpen, getSelectedCategoryInfo, customCategories, availableIcons, categoryColors, newCustomCategory, setNewCustomCategory, handleCreateCustomCategory, showScheduledChange, setShowScheduledChange }: any) => {
  const getInvestmentLabel = () => expense.investment_id === "none" ? "Sin vincular" : investments.find((i: any) => i.id === expense.investment_id)?.name || "Sin vincular";
  const getPatrimonyLabel = () => expense.patrimony_id === "none" ? "Sin vincular" : patrimony.find((p: any) => p.id === expense.patrimony_id)?.name || "Sin vincular";
  const handleScheduledChangeDate = (date: Date | undefined) => { setExpense({ ...expense, scheduled_change_date: date || null }); };

  return (
    <div className="space-y-3 mt-2">
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Concepto</label>
        <Input placeholder="Ej: Supermercado..." value={expense.source} onChange={(e) => setExpense({ ...expense, source: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" />
      </div>
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Importe</label>
        <Input type="number" placeholder="0.00" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" />
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Categoría</label>
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <button type="button" className="w-full p-2 bg-zinc-800 border-2 border-zinc-700 rounded-lg flex items-center gap-2 hover:border-zinc-600 transition-all">
              {(() => { const cat = getSelectedCategoryInfo(expense.category); const Icon = cat.icon; return (<><div className={`w-6 h-6 rounded flex items-center justify-center ${cat.color}`}><Icon className={`w-3 h-3 ${cat.textColor}`} /></div><span className="text-white text-sm">{cat.label}</span><ChevronRight className="w-4 h-4 text-zinc-400 ml-auto" /></>); })()}
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[70vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-white text-sm">Categoría</DialogTitle></DialogHeader>
            <button onClick={() => setIsCategoryDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {expenseCategories.map((cat) => { const Icon = cat.icon; const isSelected = expense.category === cat.value; return (<button key={cat.value} type="button" onClick={() => { setExpense({ ...expense, category: cat.value }); setIsCategoryDialogOpen(false); }} className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${isSelected ? "border-red-500 bg-red-500/20" : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"}`}><div className={`w-8 h-8 rounded flex items-center justify-center ${cat.color}`}><Icon className={`w-4 h-4 ${cat.textColor}`} /></div><span className={`text-[10px] font-medium ${isSelected ? "text-white" : "text-zinc-400"}`}>{cat.label}</span></button>); })}
            </div>
            <button type="button" onClick={() => { setIsCategoryDialogOpen(false); setTimeout(() => setIsCreateCategoryDialogOpen(true), 100); }} className="w-full p-2 rounded-lg border-2 border-dashed border-zinc-600 bg-zinc-800/50 flex items-center justify-center gap-1 hover:border-red-500 hover:bg-red-500/10 transition-all mt-2"><Plus className="w-4 h-4 text-red-400" /><span className="text-red-400 text-xs">Crear</span></button>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-2 block">Tipo de gasto</label>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setExpense({ ...expense, is_recurring: true })} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${expense.is_recurring ? "border-pink-500 bg-pink-500/20" : "border-zinc-700 bg-zinc-800"}`}><RefreshCcw className={`w-5 h-5 ${expense.is_recurring ? "text-pink-400" : "text-zinc-400"}`} /><span className={`font-medium text-xs ${expense.is_recurring ? "text-white" : "text-zinc-400"}`}>Recurrente</span></button>
          <button type="button" onClick={() => setExpense({ ...expense, is_recurring: false })} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${!expense.is_recurring ? "border-zinc-500 bg-zinc-700" : "border-zinc-700 bg-zinc-800"}`}><DollarSign className={`w-5 h-5 ${!expense.is_recurring ? "text-white" : "text-zinc-400"}`} /><span className={`font-medium text-xs ${!expense.is_recurring ? "text-white" : "text-zinc-400"}`}>Puntual</span></button>
        </div>
      </div>

      <div className="border border-zinc-700 rounded-xl p-3">
        <button type="button" onClick={() => setShowScheduledChange(!showScheduledChange)} className="flex items-center justify-between w-full">
          <span className="text-sm font-medium text-orange-400">Cambio de importe programado</span>
          {showScheduledChange ? (<ChevronDown className="w-4 h-4 text-zinc-400" />) : (<ChevronRight className="w-4 h-4 text-zinc-400" />)}
        </button>
        {showScheduledChange && (
          <div className="space-y-3 pt-3 mt-2 border-t border-zinc-700">
            <p className="text-xs text-zinc-500">Configura si este gasto cambiará en el futuro (ej: alquiler que sube cada año)</p>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-zinc-400 mb-1 block">Fecha del cambio</label><DatePicker date={expense.scheduled_change_date || undefined} onDateChange={handleScheduledChangeDate} placeholder="Selecciona fecha" /></div>
              <div><label className="text-xs text-zinc-400 mb-1 block">Nuevo importe</label><Input type="number" placeholder="0.00" value={expense.scheduled_new_amount} onChange={(e) => setExpense({ ...expense, scheduled_new_amount: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" /></div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-2 block">Tipo de cambio</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setExpense({ ...expense, scheduled_change_type: "increase" })} className={`p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-1 ${expense.scheduled_change_type === "increase" ? "border-red-500 bg-red-500/20" : "border-zinc-700 bg-zinc-800"}`}><TrendingUp className={`w-4 h-4 ${expense.scheduled_change_type === "increase" ? "text-red-400" : "text-zinc-400"}`} /><span className={`text-xs ${expense.scheduled_change_type === "increase" ? "text-white" : "text-zinc-400"}`}>Aumenta</span></button>
                <button type="button" onClick={() => setExpense({ ...expense, scheduled_change_type: "decrease" })} className={`p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-1 ${expense.scheduled_change_type === "decrease" ? "border-green-500 bg-green-500/20" : "border-zinc-700 bg-zinc-800"}`}><TrendingDownIcon className={`w-4 h-4 ${expense.scheduled_change_type === "decrease" ? "text-green-400" : "text-zinc-400"}`} /><span className={`text-xs ${expense.scheduled_change_type === "decrease" ? "text-white" : "text-zinc-400"}`}>Disminuye</span></button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Fecha</label>
        <DatePicker date={expense.date} onDateChange={(date) => setExpense({ ...expense, date })} />
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-2 block">Vincular a inversión</label>
        <Dialog open={isInvestmentDialogOpen} onOpenChange={setIsInvestmentDialogOpen}>
          <DialogTrigger asChild>
            <button type="button" className={`w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3 transition-all ${expense.investment_id !== "none" ? "border-emerald-500/50 bg-emerald-500/10" : "border-zinc-700 hover:border-zinc-600"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${expense.investment_id !== "none" ? "bg-emerald-500/20" : "bg-zinc-700"}`}><TrendingUp className={`w-4 h-4 ${expense.investment_id !== "none" ? "text-emerald-400" : "text-zinc-400"}`} /></div>
              <span className={`font-medium ${expense.investment_id !== "none" ? "text-emerald-400" : "text-zinc-400"}`}>{getInvestmentLabel()}</span>
              <ChevronRight className="w-4 h-4 text-zinc-500 ml-auto" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader><DialogTitle className="text-white">Vincular a Inversión</DialogTitle></DialogHeader>
            <button onClick={() => setIsInvestmentDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
            <div className="space-y-3 mt-4">
              <button type="button" onClick={() => { setExpense({ ...expense, investment_id: "none" }); setIsInvestmentDialogOpen(false); }} className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${expense.investment_id === "none" ? "border-zinc-500 bg-zinc-800" : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"}`}><div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center"><Link2 className="w-4 h-4 text-zinc-400" /></div><span className="text-zinc-400 font-medium">Sin vincular</span></button>
              {investments.map((inv: any) => (<button key={inv.id} type="button" onClick={() => { setExpense({ ...expense, investment_id: inv.id }); setIsInvestmentDialogOpen(false); }} className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${expense.investment_id === inv.id ? "border-emerald-500 bg-emerald-500/20" : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"}`}><div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-emerald-400" /></div><span className="text-white font-medium">{inv.name}</span></button>)}
              <button type="button" onClick={() => { setIsInvestmentDialogOpen(false); setTimeout(() => setIsNewInvestmentOpen(true), 100); }} className="w-full p-3 rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-800/50 flex items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all"><Plus className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400 font-medium">Crear nueva inversión</span></button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-2 block">Vincular a patrimonio</label>
        <Dialog open={isPatrimonyDialogOpen} onOpenChange={setIsPatrimonyDialogOpen}>
          <DialogTrigger asChild>
            <button type="button" className={`w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3 transition-all ${expense.patrimony_id !== "none" ? "border-sky-500/50 bg-sky-500/10" : "border-zinc-700 hover:border-zinc-600"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${expense.patrimony_id !== "none" ? "bg-sky-500/20" : "bg-zinc-700"}`}><Building className={`w-4 h-4 ${expense.patrimony_id !== "none" ? "text-sky-400" : "text-zinc-400"}`} /></div>
              <span className={`font-medium ${expense.patrimony_id !== "none" ? "text-sky-400" : "text-zinc-400"}`}>{getPatrimonyLabel()}</span>
              <ChevronRight className="w-4 h-4 text-zinc-500 ml-auto" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader><DialogTitle className="text-white">Vincular a Patrimonio</DialogTitle></DialogHeader>
            <button onClick={() => setIsPatrimonyDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
            <div className="space-y-3 mt-4">
              <button type="button" onClick={() => { setExpense({ ...expense, patrimony_id: "none" }); setIsPatrimonyDialogOpen(false); }} className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${expense.patrimony_id === "none" ? "border-zinc-500 bg-zinc-800" : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"}`}><div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center"><Link2 className="w-4 h-4 text-zinc-400" /></div><span className="text-zinc-400 font-medium">Sin vincular</span></button>
              {patrimony.map((pat: any) => (<button key={pat.id} type="button" onClick={() => { setExpense({ ...expense, patrimony_id: pat.id }); setIsPatrimonyDialogOpen(false); }} className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${expense.patrimony_id === pat.id ? "border-sky-500 bg-sky-500/20" : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"}`}><div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center"><Building className="w-4 h-4 text-sky-400" /></div><span className="text-white font-medium">{pat.name}</span></button>)}
              <button type="button" onClick={() => { setIsPatrimonyDialogOpen(false); setTimeout(() => setIsNewPatrimonyOpen(true), 100); }} className="w-full p-3 rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-800/50 flex items-center justify-center gap-2 hover:border-sky-500 hover:bg-sky-500/10 transition-all"><Plus className="w-4 h-4 text-sky-400" /><span className="text-sky-400 font-medium">Crear nuevo patrimonio</span></button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Button onClick={onSubmit} className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-4" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : isNew ? "Guardar" : "Guardar cambios"}
      </Button>
    </div>
  );
};

export default ExpensesPage;