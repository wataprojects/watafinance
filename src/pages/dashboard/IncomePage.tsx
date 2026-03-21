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
  Pencil, Trash2
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

// Función para convertir Date a string YYYY-MM-DD sin problemas de timezone
const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type FilterType = "all" | "active" | "passive";

interface CategoryOption {
  value: string;
  label: string;
  icon: any;
  color: string;
}

const defaultCategories: CategoryOption[] = [
  { value: "salary", label: "Sueldo", icon: Briefcase, color: "bg-blue-500/20 text-blue-400" },
  { value: "rental", label: "Ingreso Alquiler", icon: Home, color: "bg-emerald-500/20 text-emerald-400" },
  { value: "digital_sales", label: "Ventas Digitales", icon: ShoppingCart, color: "bg-purple-500/20 text-purple-400" },
  { value: "services", label: "Servicios", icon: Laptop, color: "bg-cyan-500/20 text-cyan-400" },
  { value: "affiliates", label: "Afiliados", icon: Globe, color: "bg-amber-500/20 text-amber-400" },
  { value: "investments", label: "Inversiones", icon: TrendingUp, color: "bg-green-500/20 text-green-400" },
  { value: "other", label: "Otros", icon: DollarSign, color: "bg-slate-500/20 text-slate-400" },
];

const iconOptions = [
  { icon: Briefcase, label: "Trabajo" },
  { icon: Home, label: "Casa" },
  { icon: ShoppingCart, label: "Tienda" },
  { icon: Laptop, label: "Tecnología" },
  { icon: Smartphone, label: "App" },
  { icon: Globe, label: "Web" },
  { icon: Music, label: "Música" },
  { icon: BookOpen, label: "Educación" },
  { icon: Car, label: "Vehículo" },
  { icon: Plane, label: "Viajes" },
  { icon: Wallet, label: "Billetera" },
  { icon: CreditCard, label: "Tarjeta" },
  { icon: PiggyBank, label: "Ahorros" },
  { icon: Building, label: "Banco" },
  { icon: Zap, label: "Energía" },
  { icon: DollarSign, label: "Dinero" },
  { icon: TrendingUp, label: "Gráfico" },
];

const IncomePage = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isEditDatePickerOpen, setIsEditDatePickerOpen] = useState(false);
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<any>(null);
  
  // Obtener fecha actual
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear().toString();
  
  // Filtros - por defecto mes y año actual
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
  const [filterYear, setFilterYear] = useState<string>(currentYear);
  
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>([]);
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

  // Años disponibles para filtro
  const years = [2024, 2025, 2026, 2027, 2028];
  
  // Meses para filtro
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

  useEffect(() => {
    if (navigate) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate("/login");
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [navigate]);

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

    // Usar la función que evita problemas de timezone
    const dateStr = formatDateToISO(newIncome.date);

    const { error } = await supabase.from("incomes").insert({
      user_id: session.user.id,
      amount: parseFloat(newIncome.amount),
      description: newIncome.source,
      category: newIncome.category,
      is_passive: newIncome.income_type === "passive",
      date: dateStr,
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

    // Usar la función que evita problemas de timezone
    const dateStr = formatDateToISO(editIncome.date);

    const { error } = await supabase.from("incomes").update({
      amount: parseFloat(editIncome.amount),
      description: editIncome.source,
      category: editIncome.category,
      is_passive: editIncome.income_type === "passive",
      date: dateStr,
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
    // Convertir la fecha del string a Date
    const incomeDate = new Date(income.date + 'T00:00:00');
    setEditIncome({
      id: income.id,
      source: income.description || "",
      amount: income.amount.toString(),
      is_recurring: false,
      income_type: income.is_passive ? "passive" : "active",
      category: income.category,
      date: incomeDate,
      investment_id: "none",
      patrimony_id: "none",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (income: any) => {
    setSelectedIncome(income);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateInvestment = async (isForEdit: boolean = false) => {
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
      if (isForEdit) {
        setEditIncome({ ...editIncome, investment_id: data.id });
      } else {
        setNewIncome({ ...newIncome, investment_id: data.id });
      }
      setIsNewInvestmentOpen(false);
      setNewInvestment({ name: "", type: "stocks", initial_value: "", current_value: "" });
    }
  };

  const handleCreatePatrimony = async (isForEdit: boolean = false) => {
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
      if (isForEdit) {
        setEditIncome({ ...editIncome, patrimony_id: data.id });
      } else {
        setNewIncome({ ...newIncome, patrimony_id: data.id });
      }
      setIsNewPatrimonyOpen(false);
      setNewPatrimonyAsset({ name: "", category: "real_estate", value: "" });
    }
  };

  const handleCreateCategory = (name: string, icon: any) => {
    const newCat: CategoryOption = {
      value: `custom_${Date.now()}`,
      label: name,
      icon: icon,
      color: "bg-rose-500/20 text-rose-400"
    };
    setCustomCategories([...customCategories, newCat]);
    setNewIncome({ ...newIncome, category: newCat.value });
    setIsNewCategoryModalOpen(false);
  };

  // Filtrar ingresos
  const filteredIncomes = incomes.filter((income) => {
    const incomeDate = new Date(income.date + 'T00:00:00');
    const incomeYear = incomeDate.getFullYear().toString();
    const incomeMonth = (incomeDate.getMonth() + 1).toString().padStart(2, '0');
    
    // Filtro por año
    if (filterYear !== "all" && incomeYear !== filterYear) return false;
    
    // Filtro por mes
    if (filterMonth !== "all" && incomeMonth !== filterMonth) return false;
    
    // Filtro por tipo (activo/pasivo)
    if (filterType === "active") return !income.is_passive;
    if (filterType === "passive") return income.is_passive;
    return true;
  });

  const totalIncome = filteredIncomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);

  const byCategory = filteredIncomes.reduce((acc, income) => {
    const cat = income.category;
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += parseFloat(income.amount);
    return acc;
  }, {} as Record<string, number>);

  const allCategories = [...defaultCategories, ...customCategories];

  const getCategoryInfo = (categoryValue: string) => {
    return allCategories.find(c => c.value === categoryValue) || allCategories[allCategories.length - 1];
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

  const getInvestmentLabel = (investmentId: string) => {
    if (investmentId === "none") return "Sin vincular";
    const inv = investments.find(i => i.id === investmentId);
    return inv ? inv.name : "Sin vincular";
  };

  const getPatrimonyLabel = (patrimonyId: string) => {
    if (patrimonyId === "none") return "Sin vincular";
    const pat = patrimony.find(p => p.id === patrimonyId);
    return pat ? pat.name : "Sin vincular";
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ingresos</h1>
            <p className="text-slate-500">Gestiona tus fuentes de dinero</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-slate-900">Nuevo Ingreso</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Fuente de ingreso */}
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Fuente de ingreso</label>
                  <Input
                    placeholder="Ej: Mi trabajo, Alquiler piso..."
                    value={newIncome.source}
                    onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                {/* Cantidad */}
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Cantidad</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white text-lg"
                  />
                </div>

                {/* ¿Es recurrente? */}
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Ingreso Recurrente</p>
                    <p className="text-xs text-slate-400">Se repite mensualmente</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewIncome({ ...newIncome, is_recurring: !newIncome.is_recurring })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      newIncome.is_recurring ? "bg-emerald-500" : "bg-slate-600"
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      newIncome.is_recurring ? "translate-x-6" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>

                {/* Tipo: Activo o Pasivo */}
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Tipo de ingreso</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewIncome({ ...newIncome, income_type: "active" })}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        newIncome.income_type === "active" 
                          ? "border-sky-500 bg-sky-500/20" 
                          : "border-slate-600 bg-slate-700/30"
                      }`}
                    >
                      <Briefcase className={`w-6 h-6 ${newIncome.income_type === "active" ? "text-sky-400" : "text-slate-400"}`} />
                      <span className={`font-medium ${newIncome.income_type === "active" ? "text-white" : "text-slate-400"}`}>Activo</span>
                      <span className={`text-xs ${newIncome.income_type === "active" ? "text-sky-300" : "text-slate-500"}`}>(Requiere trabajo)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewIncome({ ...newIncome, income_type: "passive" })}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        newIncome.income_type === "passive" 
                          ? "border-purple-500 bg-purple-500/20" 
                          : "border-slate-600 bg-slate-700/30"
                      }`}
                    >
                      <PiggyBank className={`w-6 h-6 ${newIncome.income_type === "passive" ? "text-purple-400" : "text-slate-400"}`} />
                      <span className={`font-medium ${newIncome.income_type === "passive" ? "text-white" : "text-slate-400"}`}>Pasivo</span>
                      <span className={`text-xs ${newIncome.income_type === "passive" ? "text-purple-300" : "text-slate-500"}`}>(Automático)</span>
                    </button>
                  </div>
                </div>

                {/* Categoría */}
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
                        const cat = getCategoryInfo(newIncome.category);
                        const Icon = cat.icon;
                        return <Icon className="w-4 h-4" />;
                      })()}
                      {getCategoryInfo(newIncome.category).label}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Fecha con calendario */}
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Fecha</label>
                  <DatePicker
                    date={newIncome.date}
                    onDateChange={(date) => setNewIncome({ ...newIncome, date })}
                  />
                </div>

                {/* Asociar Inversión */}
                <div>
                  <Select value={newIncome.investment_id} onValueChange={(v) => {
                    if (v === "new") {
                      setIsNewInvestmentOpen(true);
                    } else {
                      setNewIncome({ ...newIncome, investment_id: v });
                    }
                  }}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-auto py-3">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-slate-300">Inversión:</span>
                          <span className="text-white font-medium">{getInvestmentLabel(newIncome.investment_id)}</span>
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
                  <Select value={newIncome.patrimony_id} onValueChange={(v) => {
                    if (v === "new") {
                      setIsNewPatrimonyOpen(true);
                    } else {
                      setNewIncome({ ...newIncome, patrimony_id: v });
                    }
                  }}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-auto py-3">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-sky-400" />
                          <span className="text-slate-300">Patrimonio:</span>
                          <span className="text-white font-medium">{getPatrimonyLabel(newIncome.patrimony_id)}</span>
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

                <Button onClick={handleAddIncome} className="w-full bg-emerald-500 hover:bg-emerald-600 py-6">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

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
              <Button onClick={() => handleCreateInvestment(false)} className="w-full bg-emerald-500 hover:bg-emerald-600">
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
              <Button onClick={() => handleCreatePatrimony(false)} className="w-full bg-emerald-500 hover:bg-emerald-600">
                Crear Patrimonio
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de selección de categoría */}
        <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Seleccionar Categoría</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {allCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setNewIncome({ ...newIncome, category: cat.value });
                      setIsCategoryModalOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                      newIncome.category === cat.value
                        ? "bg-sky-500/20 border-2 border-sky-500"
                        : "bg-slate-700/50 border-2 border-transparent hover:bg-slate-700"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-white font-medium">{cat.label}</span>
                    {newIncome.category === cat.value && <Check className="w-5 h-5 text-sky-400 ml-auto" />}
                  </button>
                );
              })}
              
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setIsNewCategoryModalOpen(true);
                }}
                className="w-full p-3 rounded-xl flex items-center gap-3 bg-slate-700/30 border-2 border-dashed border-slate-600 hover:border-slate-500 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <span className="text-slate-300 font-medium">Nueva categoría</span>
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
                  placeholder="Ej: YouTube, Consulting..."
                  className="bg-slate-700 border-slate-600 text-white"
                  id="newCatName"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Seleccionar icono</label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("newCatName") as HTMLInputElement;
                        if (input?.value) {
                          handleCreateCategory(input.value, opt.icon);
                        }
                      }}
                      className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors flex items-center justify-center"
                    >
                      <opt.icon className="w-5 h-5 text-white" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de editar ingreso */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Editar Ingreso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Fuente de ingreso */}
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Fuente de ingreso</label>
                <Input
                  placeholder="Ej: Mi trabajo, Alquiler piso..."
                  value={editIncome.source}
                  onChange={(e) => setEditIncome({ ...editIncome, source: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              {/* Cantidad */}
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Cantidad</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={editIncome.amount}
                  onChange={(e) => setEditIncome({ ...editIncome, amount: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white text-lg"
                />
              </div>

              {/* Tipo: Activo o Pasivo */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Tipo de ingreso</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditIncome({ ...editIncome, income_type: "active" })}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      editIncome.income_type === "active" 
                        ? "border-sky-500 bg-sky-500/20" 
                        : "border-slate-600 bg-slate-700/30"
                    }`}
                  >
                    <Briefcase className={`w-5 h-5 ${editIncome.income_type === "active" ? "text-sky-400" : "text-slate-400"}`} />
                    <span className={`font-medium ${editIncome.income_type === "active" ? "text-white" : "text-slate-400"}`}>Activo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIncome({ ...editIncome, income_type: "passive" })}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      editIncome.income_type === "passive" 
                        ? "border-purple-500 bg-purple-500/20" 
                        : "border-slate-600 bg-slate-700/30"
                    }`}
                  >
                    <PiggyBank className={`w-5 h-5 ${editIncome.income_type === "passive" ? "text-purple-400" : "text-slate-400"}`} />
                    <span className={`font-medium ${editIncome.income_type === "passive" ? "text-white" : "text-slate-400"}`}>Pasivo</span>
                  </button>
                </div>
              </div>

              {/* Categoría en edición */}
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
                      const cat = getCategoryInfo(editIncome.category);
                      const Icon = cat.icon;
                      return <Icon className="w-4 h-4" />;
                    })()}
                    {getCategoryInfo(editIncome.category).label}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Fecha con calendario en edición */}
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Fecha</label>
                <DatePicker
                  date={editIncome.date}
                  onDateChange={(date) => setEditIncome({ ...editIncome, date })}
                />
              </div>

              {/* Asociar Inversión en edición */}
              <div>
                <Select value={editIncome.investment_id} onValueChange={(v) => {
                  if (v === "new") {
                    setIsNewInvestmentOpen(true);
                  } else {
                    setEditIncome({ ...editIncome, investment_id: v });
                  }
                }}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-auto py-3">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-300">Inversión:</span>
                        <span className="text-white font-medium">{getInvestmentLabel(editIncome.investment_id)}</span>
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

              {/* Asociar Patrimonio en edición */}
              <div>
                <Select value={editIncome.patrimony_id} onValueChange={(v) => {
                  if (v === "new") {
                    setIsNewPatrimonyOpen(true);
                  } else {
                    setEditIncome({ ...editIncome, patrimony_id: v });
                  }
                }}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-auto py-3">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-sky-400" />
                        <span className="text-slate-300">Patrimonio:</span>
                        <span className="text-white font-medium">{getPatrimonyLabel(editIncome.patrimony_id)}</span>
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

              <Button onClick={handleEditIncome} className="w-full bg-sky-500 hover:bg-sky-600 py-6">
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de eliminar ingreso */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Eliminar Ingreso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-slate-300">
                ¿Estás seguro de que quieres eliminar este ingreso? Esta acción no se puede deshacer.
              </p>
              {selectedIncome && (
                <div className="p-4 bg-slate-700/50 rounded-xl">
                  <p className="text-white font-medium">{selectedIncome.description || "Sin descripción"}</p>
                  <p className="text-emerald-400 font-bold">{formatCurrency(selectedIncome.amount)}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleDeleteIncome}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filtros - Fecha y Tipo */}
        <div className="space-y-3 mb-6">
          {/* Filtro por fecha (año y mes) */}
          <div className="flex gap-2">
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="flex-1 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-white">Todos los años</SelectItem>
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

          {/* Filtro por tipo */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                filterType === "all"
                  ? "bg-sky-500 text-white"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType("passive")}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                filterType === "passive"
                  ? "bg-purple-500 text-white"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              Pasivos
            </button>
            <button
              onClick={() => setFilterType("active")}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                filterType === "active"
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              Activos
            </button>
          </div>
        </div>

        {/* Total */}
        <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-white/80 text-sm mb-1">Total Ingresos</p>
            <p className="text-4xl font-bold text-white">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>

        {/* Por categoría */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {allCategories.map((cat) => {
            const value = byCategory[cat.value] || 0;
            if (value === 0) return null;
            const Icon = cat.icon;
            return (
              <Card key={cat.value} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-300">{cat.label}</span>
                  </div>
                  <p className="text-lg font-bold text-white">{formatCurrency(value)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lista de ingresos */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Historial
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400 text-center">Cargando...</p>
            ) : filteredIncomes.length === 0 ? (
              <p className="text-slate-400 text-center">No hay ingresos registrados</p>
            ) : (
              <div className="space-y-3">
                {filteredIncomes.map((income) => {
                  const cat = getCategoryInfo(income.category);
                  const Icon = cat.icon;
                  return (
                    <div 
                      key={income.id} 
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => openEditDialog(income)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{income.description || cat.label}</p>
                          <p className="text-xs text-slate-400">{new Date(income.date + 'T00:00:00').toLocaleDateString("es-ES")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-emerald-400">+{formatCurrency(income.amount)}</p>
                          <p className="text-xs text-slate-400">{income.is_passive ? "Pasivo" : "Activo"}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(income);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(income);
                            }}
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
      <BottomNav />
    </div>
  );
};

export default IncomePage;