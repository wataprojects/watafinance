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
  TrendingUp, Building, TrendingDown as TrendingDownIcon,
  Wifi, Smartphone, Heart, Shield, Flame, Sparkles, DollarSign, Briefcase, Megaphone,
  Train, UtensilsCrossed, Shirt, MoreHorizontal, X, Landmark, TrendingDown as RecurringIcon,
  Wallet, Globe, Laptop, BookOpen, Plane, Music, ChevronRight
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

// Iconos disponibles para categorías personalizadas
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
  { value: "Wallet", icon: Wallet },
  { value: "CreditCard", icon: CreditCard },
  { value: "Building", icon: Building },
  { value: "Laptop", icon: Laptop },
  { value: "Globe", icon: Globe },
  { value: "BookOpen", icon: BookOpen },
  { value: "Plane", icon: Plane },
  { value: "Music", icon: Music },
  { value: "DollarSign", icon: DollarSign },
  { value: "MoreHorizontal", icon: MoreHorizontal },
];

// Categorías para gastos - usando los mismos iconos que en la home
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
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>([]);
  
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

  const allCategories = [...expenseCategories, ...customCategories];

  const getCategoryInfo = (categoryValue: string) => {
    return allCategories.find(c => c.value === categoryValue) || expenseCategories[expenseCategories.length - 1];
  };

  const getSelectedCategoryInfo = (categoryValue: string) => {
    return allCategories.find(c => c.value === categoryValue) || expenseCategories.find(c => c.value === categoryValue) || expenseCategories[0];
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
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                <X className="w-4 h-4" />
              </button>
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

                {/* Selector de Categoría con botón */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Categoría</label>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="w-full p-4 bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center gap-3 hover:border-zinc-600 transition-all"
                      >
                        {(() => {
                          const cat = getSelectedCategoryInfo(newExpense.category);
                          const Icon = cat.icon;
                          return (
                            <>
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                                <Icon className={`w-5 h-5 ${cat.textColor}`} />
                              </div>
                              <span className="text-white font-medium">{cat.label}</span>
                              <ChevronRight className="w-5 h-5 text-zinc-400 ml-auto" />
                            </>
                          );
                        })()}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-white">Seleccionar Categoría</DialogTitle>
                      </DialogHeader>
                      <button 
                        onClick={() => setIsCategoryDialogOpen(false)}
                        className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="space-y-3 mt-4">
                        <div className="grid grid-cols-3 gap-2">
                          {expenseCategories.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = newExpense.category === cat.value;
                            return (
                              <button
                                key={cat.value}
                                type="button"
                                onClick={() => {
                                  setNewExpense({ ...newExpense, category: cat.value });
                                  setIsCategoryDialogOpen(false);
                                }}
                                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                                  isSelected
                                    ? "border-red-500 bg-red-500/20"
                                    : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                                  <Icon className={`w-5 h-5 ${cat.textColor}`} />
                                </div>
                                <span className={`text-xs font-medium ${isSelected ? "text-white" : "text-zinc-400"}`}>
                                  {cat.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Botón para crear categoría personalizada */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsCategoryDialogOpen(false);
                            setTimeout(() => {
                              setIsCreateCategoryDialogOpen(true);
                            }, 100);
                          }}
                          className="w-full p-4 rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-800/50 flex items-center justify-center gap-2 hover:border-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Plus className="w-5 h-5 text-red-400" />
                          <span className="text-red-400 font-medium">Crear categoría</span>
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">¿Es recurrente?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewExpense({ ...newExpense, is_recurring: true })}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                        newExpense.is_recurring 
                          ? "border-red-500 bg-red-500/20" 
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <RecurringIcon className={`w-5 h-5 ${newExpense.is_recurring ? "text-red-400" : "text-zinc-400"}`} />
                      <span className={`font-medium ${newExpense.is_recurring ? "text-white" : "text-zinc-400"}`}>Recurrente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewExpense({ ...newExpense, is_recurring: false })}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                        !newExpense.is_recurring 
                          ? "border-zinc-500 bg-zinc-700" 
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <DollarSign className={`w-5 h-5 ${!newExpense.is_recurring ? "text-white" : "text-zinc-400"}`} />
                      <span className={`font-medium ${!newExpense.is_recurring ? "text-white" : "text-zinc-400"}`}>Puntual</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Fecha</label>
                  <DatePicker
                    date={newExpense.date}
                    onDateChange={(date) => setNewExpense({ ...newExpense, date })}
                  />
                </div>

                {/* Vinculación a Inversión */}
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Vincular a Inversión</label>
                  <Select value={newExpense.investment_id} onValueChange={(v) => { if (v === "new") setIsNewInvestmentOpen(true); else setNewExpense({ ...newExpense, investment_id: v }); }}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Sin vincular" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="none" className="text-zinc-400">Sin vincular</SelectItem>
                      {investments.map((inv) => (<SelectItem key={inv.id} value={inv.id} className="text-white">{inv.name}</SelectItem>))}
                      <SelectItem value="new" className="text-green-400 font-medium">+ Nueva inversión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vinculación a Patrimonio */}
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Vincular a Patrimonio</label>
                  <Select value={newExpense.patrimony_id} onValueChange={(v) => { if (v === "new") setIsNewPatrimonyOpen(true); else setNewExpense({ ...newExpense, patrimony_id: v }); }}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Sin vincular" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="none" className="text-zinc-400">Sin vincular</SelectItem>
                      {patrimony.map((pat) => (<SelectItem key={pat.id} value={pat.id} className="text-white">{pat.name}</SelectItem>))}
                      <SelectItem value="new" className="text-green-400 font-medium">+ Nuevo patrimonio</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                          <Icon className={`w-5 h-5 ${cat.textColor}`} />
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

      {/* Modal nueva inversión */}
      <Dialog open={isNewInvestmentOpen} onOpenChange={setIsNewInvestmentOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Nueva Inversión</DialogTitle></DialogHeader>
          <button 
            onClick={() => setIsNewInvestmentOpen(false)}
            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="space-y-3 mt-2">
            <div><label className="text-sm text-zinc-400 mb-1 block">Nombre</label><Input placeholder="Nombre" value={newInvestment.name} onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Tipo</label>
              <Select value={newInvestment.type} onValueChange={(v) => setNewInvestment({ ...newInvestment, type: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">{investmentTypes.map((t) => (<SelectItem key={t.value} value={t.value} className="text-white">{t.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-zinc-400 mb-1 block">Valor inicial</label><Input type="number" placeholder="0.00" value={newInvestment.initial_value} onChange={(e) => setNewInvestment({ ...newInvestment, initial_value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
              <div><label className="text-sm text-zinc-400 mb-1 block">Valor actual</label><Input type="number" placeholder="0.00" value={newInvestment.current_value} onChange={(e) => setNewInvestment({ ...newInvestment, current_value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
            </div>
            <Button onClick={handleCreateInvestment} className="w-full bg-green-500 hover:bg-green-600 text-black">Crear</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal nuevo patrimonio */}
      <Dialog open={isNewPatrimonyOpen} onOpenChange={setIsNewPatrimonyOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Nuevo Patrimonio</DialogTitle></DialogHeader>
          <button 
            onClick={() => setIsNewPatrimonyOpen(false)}
            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="space-y-3 mt-2">
            <div><label className="text-sm text-zinc-400 mb-1 block">Nombre</label><Input placeholder="Nombre" value={newPatrimonyAsset.name} onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Categoría</label>
              <Select value={newPatrimonyAsset.category} onValueChange={(v) => setNewPatrimonyAsset({ ...newPatrimonyAsset, category: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">{patrimonyCategories.map((c) => (<SelectItem key={c.value} value={c.value} className="text-white">{c.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Valor</label><Input type="number" placeholder="0.00" value={newPatrimonyAsset.value} onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
            <Button onClick={handleCreatePatrimony} className="w-full bg-green-500 hover:bg-green-600 text-black">Crear</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal crear categoría personalizada */}
      <Dialog open={isCreateCategoryDialogOpen} onOpenChange={setIsCreateCategoryDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Nueva Categoría</DialogTitle>
          </DialogHeader>
          <button 
            onClick={() => setIsCreateCategoryDialogOpen(false)}
            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Nombre</label>
              <Input
                placeholder="Nombre de la categoría"
                value={newCustomCategory.name}
                onChange={(e) => setNewCustomCategory({ ...newCustomCategory, name: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Icono</label>
              <div className="grid grid-cols-5 gap-2">
                {availableIcons.map((iconOpt) => {
                  const Icon = iconOpt.icon;
                  return (
                    <button
                      key={iconOpt.value}
                      type="button"
                      onClick={() => setNewCustomCategory({ ...newCustomCategory, icon: iconOpt.value })}
                      className={`p-2 rounded-lg border-2 transition-all flex items-center justify-center ${
                        newCustomCategory.icon === iconOpt.value
                          ? "border-red-500 bg-red-500/20"
                          : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${newCustomCategory.icon === iconOpt.value ? "text-red-400" : "text-zinc-400"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Color</label>
              <div className="grid grid-cols-5 gap-2">
                {categoryColors.map((color) => (
                  <button
                    key={color.label}
                    type="button"
                    onClick={() => setNewCustomCategory({ ...newCustomCategory, color: color.value, textColor: color.textColor })}
                    className={`p-2 rounded-lg border-2 transition-all flex items-center justify-center ${
                      newCustomCategory.color === color.value
                        ? "border-white"
                        : "border-zinc-700"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full ${color.value}`} />
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateCustomCategory} className="w-full bg-red-500 hover:bg-red-600 text-white">
              Crear Categoría
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default ExpensesPage;