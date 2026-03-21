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
import { showError, showSuccess } from "@/utils/toast";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Función para convertir Date a string YYYY-MM-DD sin problemas de timezone
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

// Icono personalizado para gotas de agua
function DropletsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

const iconOptions = [
  { icon: Home, label: "Casa" },
  { icon: Zap, label: "Luz" },
  { icon: DropletsIcon, label: "Agua" },
  { icon: Heart, label: "Salud" },
  { icon: DollarSign, label: "Dinero" },
  { icon: Shield, label: "Seguridad" },
  { icon: Wifi, label: "Internet" },
  { icon: Smartphone, label: "Móvil" },
  { icon: Flame, label: "Gas" },
  { icon: Sparkles, label: "Limpieza" },
  { icon: Car, label: "Coche" },
  { icon: ShoppingCart, label: "Compra" },
  { icon: Film, label: "Ocio" },
  { icon: Briefcase, label: "Trabajo" },
  { icon: TrendingUp, label: "Inversión" },
  { icon: Megaphone, label: "Publicidad" },
  { icon: Train, label: "Transporte" },
  { icon: UtensilsCrossed, label: "Comida" },
  { icon: Shirt, label: "Ropa" },
  { icon: MoreHorizontal, label: "Otros" },
  { icon: CreditCard, label: "Tarjeta" },
  { icon: Wallet, label: "Billetera" },
  { icon: PiggyBank, label: "Ahorros" },
  { icon: Building, label: "Banco" },
];

function Wallet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}

function PiggyBank({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
      <path d="M2 9v1c0 1.1.9 2 2 2h1" />
      <circle cx="16" cy="10" r="1" />
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
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
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

  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<any>(ShoppingCart);
    
    // Filtros - por defecto mes y año actual
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
    
    if (!newExpense.amount || !newExpense.source) {
      showError("Por favor, completa los campos obligatorios");
      return;
    }

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

    if (error) {
      console.error("Error inserting expense:", error);
      showError("Error al guardar el gasto: " + error.message);
    } else {
      showSuccess("Gasto guardado correctamente");
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

  const handleCreateInvestment = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !newInvestment.name || !newInvestment.initial_value) return;

    const { data, error } = await supabase.from("investments").insert({
      user_id: session.user.id,
      name: newInvestment.name,
      type: newInvestment.type,
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
      user_id: session.user.id,
      name: newPatrimonyAsset.name,
      category: newPatrimonyAsset.category,
      value: parseFloat(newPatrimonyAsset.value),
    }).select().single();

    if (!error && data) {
      setPatrimony([...patrimony, { id: data.id, name: data.name }]);
      setNewExpense({ ...newExpense, patrimony_id: data.id });
      setIsNewPatrimonyOpen(false);
      setNewPatrimonyAsset({ name: "", category: "real_estate", value: "" });
    }
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCat: CategoryOption = {
      value: `custom_${Date.now()}`,
      label: newCategoryName,
      icon: selectedIcon,
      color: "bg-rose-500/20 text-rose-400"
    };
    
    expenseCategories.push(newCat);
    setNewExpense({ ...newExpense, category: newCat.value });
    setIsNewCategoryModalOpen(false);
    setIsCategoryModalOpen(false);
    setNewCategoryName("");
    setSelectedIcon(ShoppingCart);
  };

  // Filtrar gastos
    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date + 'T00:00:00');
      const expenseYear = expenseDate.getFullYear().toString();
      const expenseMonth = (expenseDate.getMonth() + 1).toString().padStart(2, '0');
      
      // Filtro por año
      if (filterYear !== "all" && expenseYear !== filterYear) return false;
      
      // Filtro por mes
      if (filterMonth !== "all" && expenseMonth !== filterMonth) return false;
      
      return true;
    });
  
    // Calcular total de gastos
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    // Calcular total de préstamos activos (como gasto recurrente)
    const totalLoans = loans.reduce((sum, loan) => sum + parseFloat(loan.monthly_payment || 0), 0);
    
    // Total general incluyendo préstamos
    const totalWithLoans = totalExpenses + totalLoans;

  const getCategoryInfo = (categoryValue: string) => {
    return expenseCategories.find(c => c.value === categoryValue) || expenseCategories[expenseCategories.length - 1];
  };

  const getCategoryIcon = (category: string) => {
    const cat = getCategoryInfo(category);
    return cat.icon;
  };

  const getCategoryColor = (category: string) => {
    const cat = getCategoryInfo(category);
    return cat.color;
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
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gastos</h1>
            <p className="text-slate-500">Controla tus gastos mensuales</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-rose-500 hover:bg-rose-600">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-slate-900">Agregar Gasto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Fuente de Gasto - Campo de texto */}
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Fuente de gasto</label>
                  <Input
                    placeholder="Ej: Supermercado, Luz, Gasolina..."
                    value={newExpense.source}
                    onChange={(e) => setNewExpense({ ...newExpense, source: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                {/* Importe */}
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Importe *</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                {/* Categoría - Modal visual en grid */}
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Categoría</label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="w-full bg-slate-700 border-slate-600 text-white justify-between hover:bg-slate-600"
                  >
                    <span className="flex items-center gap-2">
                      {(() => {
                        const cat = getCategoryInfo(newExpense.category);
                        const Icon = cat.icon;
                        return <Icon className="w-4 h-4" />;
                      })()}
                      {getCategoryInfo(newExpense.category).label}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Fecha con calendario */}
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Fecha</label>
                  <DatePicker
                    date={newExpense.date}
                    onDateChange={(date) => setNewExpense({ ...newExpense, date })}
                  />
                </div>

                {/* Asociar Inversión */}
                <div>
                  <Select value={newExpense.investment_id} onValueChange={(v) => {
                    if (v === "new") {
                      setIsNewInvestmentOpen(true);
                    } else {
                      setNewExpense({ ...newExpense, investment_id: v });
                    }
                  }}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-auto py-3">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-slate-300">Inversión:</span>
                          <span className="text-white font-medium">{getInvestmentLabel()}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="none" className="text-slate-400">Sin vincular</SelectItem>
                      {investments.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id} className="text-white">{inv.name}</SelectItem>
                      ))}
                      <SelectItem value="new" className="text-emerald-400 font-medium">+ Nueva inversión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Asociar Patrimonio */}
                <div>
                  <Select value={newExpense.patrimony_id} onValueChange={(v) => {
                    if (v === "new") {
                      setIsNewPatrimonyOpen(true);
                    } else {
                      setNewExpense({ ...newExpense, patrimony_id: v });
                    }
                  }}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-auto py-3">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-sky-400" />
                          <span className="text-slate-300">Patrimonio:</span>
                          <span className="text-white font-medium">{getPatrimonyLabel()}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="none" className="text-slate-400">Sin vincular</SelectItem>
                      {patrimony.map((pat) => (
                        <SelectItem key={pat.id} value={pat.id} className="text-white">{pat.name}</SelectItem>
                      ))}
                      <SelectItem value="new" className="text-emerald-400 font-medium">+ Nuevo patrimonio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleAddExpense} 
                  className="w-full bg-rose-500 hover:bg-rose-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Modal de selección de categoría en grid */}
        <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 max-h-[80vh] overflow-y-auto">
            <DialogHeader className="relative">
              <DialogTitle className="text-white pr-8">Seleccionar Categoría</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {expenseCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setNewExpense({ ...newExpense, category: cat.value });
                      setIsCategoryModalOpen(false);
                    }}
                    className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      newExpense.category === cat.value
                        ? "bg-sky-500/20 border-2 border-sky-500"
                        : "bg-slate-700/50 border-2 border-transparent hover:bg-slate-700"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-white text-sm font-medium text-center">{cat.label}</span>
                  </button>
                );
              })}
              
              {/* Botón añadir nueva categoría */}
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setIsNewCategoryModalOpen(true);
                }}
                className="p-4 rounded-xl flex flex-col items-center gap-2 transition-all bg-slate-700/30 border-2 border-dashed border-slate-600 hover:border-slate-500 hover:bg-slate-700"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-emerald-400 text-sm font-medium text-center">Añadir</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal para nueva categoría */}
        <Dialog open={isNewCategoryModalOpen} onOpenChange={setIsNewCategoryModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Nueva Categoría</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Nombre de la categoría</label>
                <Input
                  placeholder="Ej: Gimnasio, Netflix..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Seleccionar icono</label>
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                  {iconOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedIcon(opt.icon)}
                      className={`p-3 rounded-lg transition-colors flex items-center justify-center ${
                        selectedIcon === opt.icon 
                          ? "bg-sky-500/20 border-2 border-sky-500" 
                          : "bg-slate-700 hover:bg-slate-600"
                      }`}
                    >
                      <opt.icon className="w-5 h-5 text-white" />
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateCategory} className="w-full bg-emerald-500 hover:bg-emerald-600">
                Crear Categoría
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal nueva inversión */}
        <Dialog open={isNewInvestmentOpen} onOpenChange={setIsNewInvestmentOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Nueva Inversión</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Nombre</label>
                <Input
                  placeholder="Nombre de la inversión"
                  value={newInvestment.name}
                  onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Tipo</label>
                <Select value={newInvestment.type} onValueChange={(v) => setNewInvestment({ ...newInvestment, type: v })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {investmentTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-white">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Valor inicial</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newInvestment.initial_value}
                    onChange={(e) => setNewInvestment({ ...newInvestment, initial_value: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Valor actual</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newInvestment.current_value}
                    onChange={(e) => setNewInvestment({ ...newInvestment, current_value: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <Button onClick={handleCreateInvestment} className="w-full bg-emerald-500 hover:bg-emerald-600">
                Crear Inversión
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal nuevo patrimonio */}
        <Dialog open={isNewPatrimonyOpen} onOpenChange={setIsNewPatrimonyOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Nuevo Patrimonio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Nombre</label>
                <Input
                  placeholder="Nombre del activo"
                  value={newPatrimonyAsset.name}
                  onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Categoría</label>
                <Select value={newPatrimonyAsset.category} onValueChange={(v) => setNewPatrimonyAsset({ ...newPatrimonyAsset, category: v })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {patrimonyCategories.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-white">{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Valor</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newPatrimonyAsset.value}
                  onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, value: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button onClick={handleCreatePatrimony} className="w-full bg-emerald-500 hover:bg-emerald-600">
                Crear Patrimonio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
          
        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="flex-1 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white">Todos</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()} className="text-white">{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="flex-1 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value} className="text-white">{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats - Total de Gastos */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardContent className="p-6 text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-rose-400" />
            <p className="text-4xl font-bold text-white">{formatCurrency(totalWithLoans)}</p>
            <p className="text-slate-400">Total de Gastos</p>
            {totalLoans > 0 && (
              <p className="text-xs text-cyan-300 mt-1">
                (+ {formatCurrency(totalLoans)} en préstamos)
              </p>
            )}
          </CardContent>
        </Card>

        {/* Bloque de Préstamos Activos */}
        {loans.length > 0 && (
          <Card className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-500/30 mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-cyan-400" />
                Préstamos Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loans.map((loan) => {
                  const progress = ((parseFloat(loan.initial_amount) - parseFloat(loan.current_amount)) / parseFloat(loan.initial_amount)) * 100;
                  return (
                    <div key={loan.id} className="p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-white">{loan.borrower_name}</p>
                          <p className="text-xs text-slate-400">{loan.bank}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-cyan-400">{formatCurrency(loan.monthly_payment)}/mes</p>
                          <p className="text-xs text-slate-400">Pendiente: {formatCurrency(loan.current_amount)}</p>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-cyan-500/30 flex justify-between items-center">
                <span className="text-sm text-cyan-300">Total préstamos mensuales</span>
                <span className="text-lg font-bold text-cyan-400">{formatCurrency(totalLoans)}</span>
              </div>
            </CardContent>
          </Card>
        )}

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
              <p className="text-slate-500 text-center">Cargando...</p>
            ) : filteredExpenses.length === 0 ? (
              <p className="text-slate-400 text-center">No hay gastos registrados</p>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => {
                  const cat = getCategoryInfo(expense.category);
                  const Icon = cat.icon;
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{expense.description || cat.label}</p>
                          <p className="text-xs text-slate-400">{new Date(expense.date + 'T00:00:00').toLocaleDateString("es-ES")}</p>
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