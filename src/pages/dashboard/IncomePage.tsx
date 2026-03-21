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
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<any>(null);
  
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear().toString();
  
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
      color: "bg-green-500/20 text-green-400"
    };
    setCustomCategories([...customCategories, newCat]);
    setNewIncome({ ...newIncome, category: newCat.value });
    setIsNewCategoryModalOpen(false);
  };

  const filteredIncomes = incomes.filter((income) => {
    const incomeDate = new Date(income.date + 'T00:00:00');
    const incomeYear = incomeDate.getFullYear().toString();
    const incomeMonth = (incomeDate.getMonth() + 1).toString().padStart(2, '0');
    
    if (filterYear !== "all" && incomeYear !== filterYear) return false;
    if (filterMonth !== "all" && incomeMonth !== filterMonth) return false;
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
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Fuente de ingreso</label>
                  <Input
                    placeholder="Ej: Mi trabajo, Alquiler piso..."
                    value={newIncome.source}
                    onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Cantidad</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white text-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Tipo de ingreso</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewIncome({ ...newIncome, income_type: "active" })}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        newIncome.income_type === "active" 
                          ? "border-green-500 bg-green-500/20" 
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <Briefcase className={`w-6 h-6 ${newIncome.income_type === "active" ? "text-green-400" : "text-zinc-400"}`} />
                      <span className={`font-medium ${newIncome.income_type === "active" ? "text-white" : "text-zinc-400"}`}>Activo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewIncome({ ...newIncome, income_type: "passive" })}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        newIncome.income_type === "passive" 
                          ? "border-purple-500 bg-purple-500/20" 
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <PiggyBank className={`w-6 h-6 ${newIncome.income_type === "passive" ? "text-purple-400" : "text-zinc-400"}`} />
                      <span className={`font-medium ${newIncome.income_type === "passive" ? "text-white" : "text-zinc-400"}`}>Pasivo</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Fecha</label>
                  <DatePicker
                    date={newIncome.date}
                    onDateChange={(date) => setNewIncome({ ...newIncome, date })}
                  />
                </div>
                <Button onClick={handleAddIncome} className="w-full bg-green-500 hover:bg-green-600 text-black py-6">
                  Guardar
                </Button>
              </div>
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
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{income.description || cat.label}</p>
                          <p className="text-xs text-zinc-500">{new Date(income.date + 'T00:00:00').toLocaleDateString("es-ES")}</p>
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
      <BottomNav />
    </div>
  );
};

export default IncomePage;