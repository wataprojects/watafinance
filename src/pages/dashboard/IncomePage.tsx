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
  Plus, TrendingUp, DollarSign, Briefcase, Home, ArrowUpRight, 
  Filter, Wallet, CreditCard, PiggyBank, Building, ShoppingCart, 
  Globe, Zap, Music, BookOpen, Car, Plane, Laptop, Smartphone,
  ChevronRight, X, Check, Calendar as CalendarIcon, TrendingDown,
  Pencil, Trash2, TrendingDown as TrendingDownIcon, Link2
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

const safeDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr) return new Date();
  const date = new Date(dateStr + 'T00:00:00');
  return isNaN(date.getTime()) ? new Date() : date;
};

const formatDateSafe = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr + 'T00:00:00');
  return isNaN(date.getTime()) ? '-' : date.toLocaleDateString("es-ES");
};

type FilterType = "all" | "active" | "passive";

interface CategoryOption {
  value: string;
  label: string;
  icon: any;
  color: string;
  textColor: string;
}

// Iconos disponibles para categorías personalizadas
const availableIcons = [
  { value: "Briefcase", icon: Briefcase },
  { value: "Home", icon: Home },
  { value: "ShoppingCart", icon: ShoppingCart },
  { value: "Laptop", icon: Laptop },
  { value: "Globe", icon: Globe },
  { value: "TrendingUp", icon: TrendingUp },
  { value: "DollarSign", icon: DollarSign },
  { value: "Wallet", icon: Wallet },
  { value: "CreditCard", icon: CreditCard },
  { value: "PiggyBank", icon: PiggyBank },
  { value: "Building", icon: Building },
  { value: "Car", icon: Car },
  { value: "Plane", icon: Plane },
  { value: "Smartphone", icon: Smartphone },
  { value: "Music", icon: Music },
  { value: "BookOpen", icon: BookOpen },
  { value: "Zap", icon: Zap },
  { value: "Heart", icon: Heart },
  { value: "UtensilsCrossed", icon: UtensilsCrossed },
  { value: "Shirt", icon: Shirt },
];

function UtensilsCrossed({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function Shirt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    </svg>
  );
}

function Heart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

// Categorías para ingresos - usando los mismos iconos que en el historial
const incomeCategories: CategoryOption[] = [
  { value: "salary", label: "Sueldo", icon: Briefcase, color: "bg-blue-500/20", textColor: "text-blue-400" },
  { value: "rental", label: "Alquiler", icon: Home, color: "bg-emerald-500/20", textColor: "text-emerald-400" },
  { value: "digital_sales", label: "Ventas Digitales", icon: ShoppingCart, color: "bg-purple-500/20", textColor: "text-purple-400" },
  { value: "services", label: "Servicios", icon: Laptop, color: "bg-cyan-500/20", textColor: "text-cyan-400" },
  { value: "affiliates", label: "Afiliados", icon: Globe, color: "bg-amber-500/20", textColor: "text-amber-400" },
  { value: "investments", label: "Inversiones", icon: TrendingUp, color: "bg-green-500/20", textColor: "text-green-400" },
  { value: "freelance", label: "Freelance", icon: Wallet, color: "bg-indigo-500/20", textColor: "text-indigo-400" },
  { value: "business", label: "Negocio", icon: Building, color: "bg-rose-500/20", textColor: "text-rose-400" },
];

const IncomePage = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);
  const [isInvestmentDialogOpen, setIsInvestmentDialogOpen] = useState(false);
  const [isPatrimonyDialogOpen, setIsPatrimonyDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<any>(null);
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>([]);
  
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear().toString();
  
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
  const [filterYear, setFilterYear] = useState<string>(currentYear);
  
  const [newIncome, setNewIncome] = useState({
    source: "",
    amount: "",
    is_recurring: false,
    income_type: "active" as "active" | "passive",
    category: "salary",
    date: new Date(),
    investment_id: "none",
    patrimony_id: "none",
  });
  
  const [editIncome, setEditIncome] = useState({
    id: "",
    source: "",
    amount: "",
    is_recurring: false,
    income_type: "active" as "active" | "passive",
    category: "salary",
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
    icon: "Briefcase",
    color: "bg-blue-500/20",
    textColor: "text-blue-400",
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
      fetchIncomes(session.user.id);
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

  const fetchIncomes = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("incomes")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (data) setIncomes(data);
    setLoading(false);
  };

  const handleAddIncome = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const dateStr = formatDateToISO(newIncome.date);

    const { error } = await supabase.from("incomes").insert({
      user_id: session.user.id,
      amount: parseFloat(newIncome.amount),
      description: newIncome.source,
      category: newIncome.category,
      is_passive: newIncome.income_type === "passive",
      date: dateStr,
      is_recurring: newIncome.is_recurring,
      investment_id: newIncome.investment_id === "none" ? null : newIncome.investment_id,
      patrimony_id: newIncome.patrimony_id === "none" ? null : newIncome.patrimony_id,
    });

    if (!error) {
      setIsDialogOpen(false);
      setNewIncome({
        source: "",
        amount: "",
        is_recurring: false,
        income_type: "active",
        category: "salary",
        date: new Date(),
        investment_id: "none",
        patrimony_id: "none",
      });
      fetchIncomes(session.user.id);
    }
  };

  const handleEditIncome = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !selectedIncome) return;

    const dateStr = formatDateToISO(editIncome.date);

    const { error } = await supabase.from("incomes").update({
      amount: parseFloat(editIncome.amount),
      description: editIncome.source,
      category: editIncome.category,
      is_passive: editIncome.income_type === "passive",
      date: dateStr,
      is_recurring: editIncome.is_recurring,
      investment_id: editIncome.investment_id === "none" ? null : editIncome.investment_id,
      patrimony_id: editIncome.patrimony_id === "none" ? null : editIncome.patrimony_id,
    }).eq("id", selectedIncome.id);

    if (!error) {
      setIsEditDialogOpen(false);
      setSelectedIncome(null);
      fetchIncomes(session.user.id);
    }
  };

  const handleDeleteIncome = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !selectedIncome) return;

    const { error } = await supabase.from("incomes").delete().eq("id", selectedIncome.id);

    if (!error) {
      setIsDeleteDialogOpen(false);
      setSelectedIncome(null);
      fetchIncomes(session.user.id);
    }
  };

  const openEditDialog = (income: any) => {
    setSelectedIncome(income);
    const incomeDate = safeDate(income.date);
    setEditIncome({
      id: income.id,
      source: income.description || "",
      amount: income.amount.toString(),
      is_recurring: income.is_recurring === true || income.is_recurring === 1 || income.is_recurring === "true",
      income_type: income.is_passive ? "passive" : "active",
      category: income.category,
      date: incomeDate,
      investment_id: income.investment_id || "none",
      patrimony_id: income.patrimony_id || "none",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (income: any) => {
    setSelectedIncome(income);
    setIsDeleteDialogOpen(true);
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
      setNewIncome({ ...newIncome, investment_id: data.id });
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
      setNewIncome({ ...newIncome, patrimony_id: data.id });
      setIsNewPatrimonyOpen(false);
      setNewPatrimonyAsset({ name: "", category: "real_estate", value: "" });
    }
  };

  const handleCreateCustomCategory = () => {
    if (!newCustomCategory.name) return;
    
    const categoryValue = `custom_${newCustomCategory.name.toLowerCase().replace(/\s+/g, '_')}`;
    const iconData = availableIcons.find(i => i.value === newCustomCategory.icon);
    const newCategory: CategoryOption = {
      value: categoryValue,
      label: newCustomCategory.name,
      icon: iconData?.icon || Briefcase,
      color: newCustomCategory.color,
      textColor: newCustomCategory.textColor,
    };
    
    setCustomCategories([...customCategories, newCategory]);
    setNewIncome({ ...newIncome, category: categoryValue });
    setIsCreateCategoryDialogOpen(false);
    setNewCustomCategory({ name: "", icon: "Briefcase", color: "bg-blue-500/20", textColor: "text-blue-400" });
  };

  const filteredIncomes = incomes.filter((income) => {
    if (!income.date) return false;
    const incomeDate = new Date(income.date + 'T00:00:00');
    if (isNaN(incomeDate.getTime())) return false;
    const incomeYear = incomeDate.getFullYear().toString();
    const incomeMonth = (incomeDate.getMonth() + 1).toString().padStart(2, '0');
    
    if (filterYear !== "all" && incomeYear !== filterYear) return false;
    if (filterMonth !== "all" && incomeMonth !== filterMonth) return false;
    if (filterType === "active") return !income.is_passive;
    if (filterType === "passive") return income.is_passive;
    return true;
  });

  const totalIncome = filteredIncomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);

  const allCategories = [...incomeCategories, ...customCategories];

  const getCategoryInfo = (categoryValue: string) => {
    return allCategories.find(c => c.value === categoryValue) || incomeCategories[0];
  };

  const getSelectedCategoryInfo = (categoryValue: string) => {
    return allCategories.find(c => c.value === categoryValue) || incomeCategories[0];
  };

  const getInvestmentLabel = () => {
    if (newIncome.investment_id === "none") return "Vincular a inversión";
    const inv = investments.find(i => i.id === newIncome.investment_id);
    return inv ? inv.name : "Vincular a inversión";
  };

  const getPatrimonyLabel = () => {
    if (newIncome.patrimony_id === "none") return "Vincular a patrimonio";
    const pat = patrimony.find(p => p.id === newIncome.patrimony_id);
    return pat ? pat.name : "Vincular a patrimonio";
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

  return (
    <div className="min-h-screen bg-black pb-28">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Ingresos</h1>
            <p className="text-green-400 text-sm">Gestiona tus fuentes de dinero</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-600 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Nuevo Ingreso</DialogTitle>
              </DialogHeader>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <IncomeForm 
                income={newIncome} 
                setIncome={setNewIncome} 
                onSubmit={handleAddIncome}
                isSubmitting={false}
                isNew={true}
                investments={investments}
                patrimony={patrimony}
                isNewInvestmentOpen={isNewInvestmentOpen}
                setIsNewInvestmentOpen={setIsNewInvestmentOpen}
                isNewPatrimonyOpen={isNewPatrimonyOpen}
                setIsNewPatrimonyOpen={setIsNewPatrimonyOpen}
                newInvestment={newInvestment}
                setNewInvestment={setNewInvestment}
                newPatrimonyAsset={newPatrimonyAsset}
                setNewPatrimonyAsset={setNewPatrimonyAsset}
                handleCreateInvestment={handleCreateInvestment}
                handleCreatePatrimony={handleCreatePatrimony}
                investmentTypes={investmentTypes}
                patrimonyCategories={patrimonyCategories}
                isCategoryDialogOpen={isCategoryDialogOpen}
                setIsCategoryDialogOpen={setIsCategoryDialogOpen}
                isCreateCategoryDialogOpen={isCreateCategoryDialogOpen}
                setIsCreateCategoryDialogOpen={setIsCreateCategoryDialogOpen}
                isInvestmentDialogOpen={isInvestmentDialogOpen}
                setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
                isPatrimonyDialogOpen={isPatrimonyDialogOpen}
                setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
                getSelectedCategoryInfo={getSelectedCategoryInfo}
                customCategories={customCategories}
                availableIcons={availableIcons}
                categoryColors={categoryColors}
                newCustomCategory={newCustomCategory}
                setNewCustomCategory={setNewCustomCategory}
                handleCreateCustomCategory={handleCreateCustomCategory}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterType("all")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "all"
                ? "bg-green-500 text-black"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType("passive")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "passive"
                ? "bg-purple-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Pasivos
          </button>
          <button
            onClick={() => setFilterType("active")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "active"
                ? "bg-blue-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Activos
          </button>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-zinc-400 text-sm mb-1">Total Ingresos</p>
            <p className="text-4xl font-bold text-green-500">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Historial
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-zinc-500 text-center">Cargando...</p>
            ) : filteredIncomes.length === 0 ? (
              <p className="text-zinc-500 text-center">No hay ingresos registrados</p>
            ) : (
              <div className="space-y-3">
                {filteredIncomes.map((income) => {
                  const cat = getCategoryInfo(income.category);
                  const Icon = cat.icon;
                  return (
                    <div 
                      key={income.id} 
                      className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                          <Icon className={`w-5 h-5 ${cat.textColor}`} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{income.description || cat.label}</p>
                          <p className="text-xs text-zinc-500">{formatDateSafe(income.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-green-500">+{formatCurrency(income.amount)}</p>
                          <p className="text-xs text-zinc-500">{income.is_passive ? "Pasivo" : "Activo"}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => openEditDialog(income)}
                            className="p-2 rounded-lg hover:bg-zinc-700 transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-zinc-400" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(income)}
                            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
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

      {/* Modal edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Ingreso</DialogTitle>
          </DialogHeader>
          <button 
            onClick={() => setIsEditDialogOpen(false)}
            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <IncomeForm 
            income={editIncome} 
            setIncome={setEditIncome} 
            onSubmit={handleEditIncome}
            isSubmitting={false}
            isNew={false}
            investments={investments}
            patrimony={patrimony}
            isNewInvestmentOpen={isNewInvestmentOpen}
            setIsNewInvestmentOpen={setIsNewInvestmentOpen}
            isNewPatrimonyOpen={isNewPatrimonyOpen}
            setIsNewPatrimonyOpen={setIsNewPatrimonyOpen}
            newInvestment={newInvestment}
            setNewInvestment={setNewInvestment}
            newPatrimonyAsset={newPatrimonyAsset}
            setNewPatrimonyAsset={setNewPatrimonyAsset}
            handleCreateInvestment={handleCreateInvestment}
            handleCreatePatrimony={handleCreatePatrimony}
            investmentTypes={investmentTypes}
            patrimonyCategories={patrimonyCategories}
            isCategoryDialogOpen={isCategoryDialogOpen}
            setIsCategoryDialogOpen={setIsCategoryDialogOpen}
            isCreateCategoryDialogOpen={isCreateCategoryDialogOpen}
            setIsCreateCategoryDialogOpen={setIsCreateCategoryDialogOpen}
            isInvestmentDialogOpen={isInvestmentDialogOpen}
            setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
            isPatrimonyDialogOpen={isPatrimonyDialogOpen}
            setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
            getSelectedCategoryInfo={getSelectedCategoryInfo}
            customCategories={customCategories}
            availableIcons={availableIcons}
            categoryColors={categoryColors}
            newCustomCategory={newCustomCategory}
            setNewCustomCategory={setNewCustomCategory}
            handleCreateCustomCategory={handleCreateCustomCategory}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Eliminar Ingreso</DialogTitle>
          </DialogHeader>
          <button 
            onClick={() => setIsDeleteDialogOpen(false)}
            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300">
              ¿Estás seguro de que quieres eliminar este ingreso?
            </p>
            {selectedIncome && (
              <div className="p-4 bg-zinc-800/50 rounded-xl">
                <p className="text-white font-medium">{selectedIncome.description}</p>
                <p className="text-green-400 font-bold">{formatCurrency(selectedIncome.amount)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800">
                Cancelar
              </Button>
              <Button onClick={handleDeleteIncome} className="flex-1 bg-red-500 hover:bg-red-600">
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                          ? "border-green-500 bg-green-500/20"
                          : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${newCustomCategory.icon === iconOpt.value ? "text-green-400" : "text-zinc-400"}`} />
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
            <Button onClick={handleCreateCustomCategory} className="w-full bg-green-500 hover:bg-green-600 text-black">
              Crear Categoría
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

// Componente reutilizable para el formulario de ingresos
const IncomeForm = ({ 
  income, 
  setIncome, 
  onSubmit, 
  isSubmitting, 
  isNew,
  investments,
  patrimony,
  isNewInvestmentOpen,
  setIsNewInvestmentOpen,
  isNewPatrimonyOpen,
  setIsNewPatrimonyOpen,
  newInvestment,
  setNewInvestment,
  newPatrimonyAsset,
  setNewPatrimonyAsset,
  handleCreateInvestment,
  handleCreatePatrimony,
  investmentTypes,
  patrimonyCategories,
  isCategoryDialogOpen,
  setIsCategoryDialogOpen,
  isCreateCategoryDialogOpen,
  setIsCreateCategoryDialogOpen,
  isInvestmentDialogOpen,
  setIsInvestmentDialogOpen,
  isPatrimonyDialogOpen,
  setIsPatrimonyDialogOpen,
  getSelectedCategoryInfo,
  customCategories,
  availableIcons,
  categoryColors,
  newCustomCategory,
  setNewCustomCategory,
  handleCreateCustomCategory,
}: any) => {
  const getInvestmentLabel = () => income.investment_id === "none" ? "Sin vincular" : investments.find((i: any) => i.id === income.investment_id)?.name || "Sin vincular";
  const getPatrimonyLabel = () => income.patrimony_id === "none" ? "Sin vincular" : patrimony.find((p: any) => p.id === income.patrimony_id)?.name || "Sin vincular";

  const handleDateChange = (date: Date | undefined) => {
    setIncome({ ...income, date: date || new Date() });
  };

  return (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Fuente de ingreso</label>
        <Input
          placeholder="Ej: Mi trabajo, Alquiler piso..."
          value={income.source}
          onChange={(e) => setIncome({ ...income, source: e.target.value })}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>
      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Cantidad</label>
        <Input
          type="number"
          placeholder="0.00"
          value={income.amount}
          onChange={(e) => setIncome({ ...income, amount: e.target.value })}
          className="bg-zinc-800 border-zinc-700 text-white text-lg"
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
                const cat = getSelectedCategoryInfo(income.category);
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
                {incomeCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        setIncome({ ...income, category: cat.value });
                        setIsCategoryDialogOpen(false);
                      }}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        income.category === cat.value
                          ? "border-green-500 bg-green-500/20"
                          : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                        <Icon className={`w-5 h-5 ${cat.textColor}`} />
                      </div>
                      <span className={`text-xs font-medium ${income.category === cat.value ? "text-white" : "text-zinc-400"}`}>
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
                className="w-full p-4 rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-800/50 flex items-center justify-center gap-2 hover:border-green-500 hover:bg-green-500/10 transition-all"
              >
                <Plus className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Crear categoría</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Tipo de ingreso</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIncome({ ...income, income_type: "active" })}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
              income.income_type === "active" 
                ? "border-green-500 bg-green-500/20" 
                : "border-zinc-700 bg-zinc-800"
            }`}
          >
            <Briefcase className={`w-6 h-6 ${income.income_type === "active" ? "text-green-400" : "text-zinc-400"}`} />
            <span className={`font-medium ${income.income_type === "active" ? "text-white" : "text-zinc-400"}`}>Activo</span>
          </button>
          <button
            type="button"
            onClick={() => setIncome({ ...income, income_type: "passive" })}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
              income.income_type === "passive" 
                ? "border-purple-500 bg-purple-500/20" 
                : "border-zinc-700 bg-zinc-800"
            }`}
          >
            <PiggyBank className={`w-6 h-6 ${income.income_type === "passive" ? "text-purple-400" : "text-zinc-400"}`} />
            <span className={`font-medium ${income.income_type === "passive" ? "text-white" : "text-zinc-400"}`}>Pasivo</span>
          </button>
        </div>
      </div>
      
      <div>
        <label className="text-sm text-zinc-400 mb-2 block">¿Es recurrente?</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIncome({ ...income, is_recurring: true })}
            className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
              income.is_recurring 
                ? "border-green-500 bg-green-500/20" 
                : "border-zinc-700 bg-zinc-800"
            }`}
          >
            <TrendingDownIcon className={`w-5 h-5 ${income.is_recurring ? "text-green-400" : "text-zinc-400"}`} />
            <span className={`font-medium ${income.is_recurring ? "text-white" : "text-zinc-400"}`}>Recurrente</span>
          </button>
          <button
            type="button"
            onClick={() => setIncome({ ...income, is_recurring: false })}
            className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
              !income.is_recurring 
                ? "border-zinc-500 bg-zinc-700" 
                : "border-zinc-700 bg-zinc-800"
            }`}
          >
            <DollarSign className={`w-5 h-5 ${!income.is_recurring ? "text-white" : "text-zinc-400"}`} />
            <span className={`font-medium ${!income.is_recurring ? "text-white" : "text-zinc-400"}`}>Puntual</span>
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Fecha</label>
        <DatePicker
          date={income.date}
          onDateChange={handleDateChange}
        />
      </div>

      {/* Vinculación a Inversión - Botón estilo selector */}
      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Vincular a inversión</label>
        <Dialog open={isInvestmentDialogOpen} onOpenChange={setIsInvestmentDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={`w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3 transition-all ${
                income.investment_id !== "none" 
                  ? "border-emerald-500/50 bg-emerald-500/10" 
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                income.investment_id !== "none" 
                  ? "bg-emerald-500/20" 
                  : "bg-zinc-700"
              }`}>
                <TrendingUp className={`w-4 h-4 ${income.investment_id !== "none" ? "text-emerald-400" : "text-zinc-400"}`} />
              </div>
              <span className={`font-medium ${income.investment_id !== "none" ? "text-emerald-400" : "text-zinc-400"}`}>
                {getInvestmentLabel()}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500 ml-auto" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Vincular a Inversión</DialogTitle>
            </DialogHeader>
            <button 
              onClick={() => setIsInvestmentDialogOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setIncome({ ...income, investment_id: "none" });
                  setIsInvestmentDialogOpen(false);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  income.investment_id === "none"
                    ? "border-zinc-500 bg-zinc-800"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-zinc-400" />
                </div>
                <span className="text-zinc-400 font-medium">Sin vincular</span>
              </button>

              {investments.map((inv: any) => (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => {
                    setIncome({ ...income, investment_id: inv.id });
                    setIsInvestmentDialogOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    income.investment_id === inv.id
                      ? "border-emerald-500 bg-emerald-500/20"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-white font-medium">{inv.name}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setIsInvestmentDialogOpen(false);
                  setTimeout(() => setIsNewInvestmentOpen(true), 100);
                }}
                className="w-full p-3 rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-800/50 flex items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Crear nueva inversión</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vinculación a Patrimonio - Botón estilo selector */}
      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Vincular a patrimonio</label>
        <Dialog open={isPatrimonyDialogOpen} onOpenChange={setIsPatrimonyDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={`w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3 transition-all ${
                income.patrimony_id !== "none" 
                  ? "border-sky-500/50 bg-sky-500/10" 
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                income.patrimony_id !== "none" 
                  ? "bg-sky-500/20" 
                  : "bg-zinc-700"
              }`}>
                <Building className={`w-4 h-4 ${income.patrimony_id !== "none" ? "text-sky-400" : "text-zinc-400"}`} />
              </div>
              <span className={`font-medium ${income.patrimony_id !== "none" ? "text-sky-400" : "text-zinc-400"}`}>
                {getPatrimonyLabel()}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500 ml-auto" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Vincular a Patrimonio</DialogTitle>
            </DialogHeader>
            <button 
              onClick={() => setIsPatrimonyDialogOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setIncome({ ...income, patrimony_id: "none" });
                  setIsPatrimonyDialogOpen(false);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  income.patrimony_id === "none"
                    ? "border-zinc-500 bg-zinc-800"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-zinc-400" />
                </div>
                <span className="text-zinc-400 font-medium">Sin vincular</span>
              </button>

              {patrimony.map((pat: any) => (
                <button
                  key={pat.id}
                  type="button"
                  onClick={() => {
                    setIncome({ ...income, patrimony_id: pat.id });
                    setIsPatrimonyDialogOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    income.patrimony_id === pat.id
                      ? "border-sky-500 bg-sky-500/20"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                    <Building className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-white font-medium">{pat.name}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setIsPatrimonyDialogOpen(false);
                  setTimeout(() => setIsNewPatrimonyOpen(true), 100);
                }}
                className="w-full p-3 rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-800/50 flex items-center justify-center gap-2 hover:border-sky-500 hover:bg-sky-500/10 transition-all"
              >
                <Plus className="w-4 h-4 text-sky-400" />
                <span className="text-sky-400 font-medium">Crear nuevo patrimonio</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Button onClick={onSubmit} className="w-full bg-green-500 hover:bg-green-600 text-black py-6">
        {isSubmitting ? "Guardando..." : isNew ? "Guardar" : "Guardar cambios"}
      </Button>
    </div>
  );
};

export default IncomePage;