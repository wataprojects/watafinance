"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { 
  Plus, TrendingUp, DollarSign, Briefcase, Home, ArrowUpRight, 
  Filter, Wallet, CreditCard, PiggyBank, Building, ShoppingCart, 
  Globe, Zap, Music, BookOpen, Car, Plane, Laptop, Smartphone,
  ChevronRight, X, Check, Calendar as CalendarIcon, TrendingDown
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
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
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

    const { error } = await supabase.from("incomes").insert({
      user_id: session.user.id,
      amount: parseFloat(newIncome.amount),
      description: newIncome.source,
      category: newIncome.category,
      is_passive: newIncome.income_type === "passive",
      date: newIncome.date.toISOString().split("T")[0],
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

  const filteredIncomes = incomes.filter((income) => {
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

  const getInvestmentLabel = () => {
    if (newIncome.investment_id === "none") return "Sin vincular";
    const inv = investments.find(i => i.id === newIncome.investment_id);
    return inv ? inv.name : "Sin vincular";
  };

  const getPatrimonyLabel = () => {
    if (newIncome.patrimony_id === "none") return "Sin vincular";
    const pat = patrimony.find(p => p.id === newIncome.patrimony_id);
    return pat ? pat.name : "Sin vincular";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Ingresos</h1>
            <p className="text-slate-400">Gestiona tus fuentes de dinero</p>
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
                <DialogTitle className="text-white">Nuevo Ingreso</DialogTitle>
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
                  <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full bg-slate-700 border-slate-600 text-white justify-between hover:bg-slate-600"
                      >
                        <span className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {newIncome.date.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 p-0">
                      <Calendar
                        mode="single"
                        selected={newIncome.date}
                        onSelect={(date) => {
                          if (date) {
                            setNewIncome({ ...newIncome, date });
                            setIsDatePickerOpen(false);
                          }
                        }}
                        className="bg-slate-800 text-white rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Asociar Inversión - Formato con label integrado */}
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
                          <span className="text-white font-medium">{getInvestmentLabel()}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="none" className="text-slate-400">
                        <span className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4" />
                          Sin vincular
                        </span>
                      </SelectItem>
                      {investments.length > 0 && (
                        <div className="px-2 py-1 text-xs text-slate-500 font-medium">INVERSIONES</div>
                      )}
                      {investments.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id} className="text-white">
                          <span className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            {inv.name}
                          </span>
                        </SelectItem>
                      ))}
                      <SelectItem value="new" className="text-emerald-400 font-medium">
                        <span className="flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Nueva inversión
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Asociar Patrimonio - Formato con label integrado */}
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
                          <span className="text-white font-medium">{getPatrimonyLabel()}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="none" className="text-slate-400">
                        <span className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4" />
                          Sin vincular
                        </span>
                      </SelectItem>
                      {patrimony.length > 0 && (
                        <div className="px-2 py-1 text-xs text-slate-500 font-medium">PATRIMONIO</div>
                      )}
                      {patrimony.map((pat) => (
                        <SelectItem key={pat.id} value={pat.id} className="text-white">
                          <span className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-sky-400" />
                            {pat.name}
                          </span>
                        </SelectItem>
                      ))}
                      <SelectItem value="new" className="text-emerald-400 font-medium">
                        <span className="flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Nuevo patrimonio
                        </span>
                      </SelectItem>
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

        {/* Filtro */}
        <div className="flex gap-2 mb-6">
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
                    <div key={income.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{income.description || cat.label}</p>
                          <p className="text-xs text-slate-400">{new Date(income.date).toLocaleDateString("es-ES")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">+{formatCurrency(income.amount)}</p>
                        <p className="text-xs text-slate-400">{income.is_passive ? "Pasivo" : "Activo"}</p>
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