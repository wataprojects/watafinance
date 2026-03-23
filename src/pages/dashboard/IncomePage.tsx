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
  Plus, TrendingUp, DollarSign, Briefcase, Home,
  Wallet, CreditCard, PiggyBank, Building, ShoppingCart,
  Globe, Zap, Music, BookOpen, Car, Plane, Laptop, Smartphone,
  ChevronRight, X, TrendingDown as TrendingDownIcon, Link2
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
  textColor: string;
}

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
];

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

const defaultIncomeState = {
  source: "",
  amount: "",
  is_recurring: false,
  income_type: "active" as "active" | "passive",
  category: "salary",
  date: new Date(),
  investment_id: "none",
  patrimony_id: "none",
};

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
  const [selectedIncome, setSelectedIncome] = useState<any>(null);
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>([]);

  const [filterType, setFilterType] = useState<FilterType>("all");

  const [newIncome, setNewIncome] = useState(defaultIncomeState);
  const [editIncome, setEditIncome] = useState({ ...defaultIncomeState, id: "" });

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
    const { data } = await supabase.from("incomes").select("*").eq("user_id", userId).order("date", { ascending: false });
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
      date: newIncome.date.toISOString().slice(0, 10),
    });

    if (!error) {
      setIsDialogOpen(false);
      setNewIncome(defaultIncomeState);
      fetchIncomes(session.user.id);
    }
  };

  const handleEditIncome = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !selectedIncome) return;

    const { error } = await supabase.from("incomes").update({
      amount: parseFloat(editIncome.amount),
      description: editIncome.source,
      category: editIncome.category,
      is_passive: editIncome.income_type === "passive",
      date: editIncome.date.toISOString().slice(0, 10),
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
    setEditIncome({
      id: income.id,
      source: income.description || "",
      amount: income.amount?.toString() || "",
      is_recurring: false,
      income_type: income.is_passive ? "passive" : "active",
      category: income.category || "salary",
      date: income.date ? new Date(`${income.date}T00:00:00`) : new Date(),
      investment_id: income.investment_id || "none",
      patrimony_id: income.patrimony_id || "none",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (income: any) => {
    setSelectedIncome(income);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateInvestment = async (forEdit = false) => {
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
      if (forEdit) {
        setEditIncome({ ...editIncome, investment_id: data.id });
      } else {
        setNewIncome({ ...newIncome, investment_id: data.id });
      }
      setIsNewInvestmentOpen(false);
      setNewInvestment({ name: "", type: "stocks", initial_value: "", current_value: "" });
    }
  };

  const handleCreatePatrimony = async (forEdit = false) => {
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
      if (forEdit) {
        setEditIncome({ ...editIncome, patrimony_id: data.id });
      } else {
        setNewIncome({ ...newIncome, patrimony_id: data.id });
      }
      setIsNewPatrimonyOpen(false);
      setNewPatrimonyAsset({ name: "", category: "real_estate", value: "" });
    }
  };

  const handleCreateCustomCategory = (forEdit = false) => {
    if (!newCustomCategory.name) return;
    const iconData = availableIcons.find((i) => i.value === newCustomCategory.icon);
    const categoryValue = `custom_${newCustomCategory.name.toLowerCase().replace(/\s+/g, "_")}`;
    const newCategory: CategoryOption = {
      value: categoryValue,
      label: newCustomCategory.name,
      icon: iconData?.icon || Briefcase,
      color: newCustomCategory.color,
      textColor: newCustomCategory.textColor,
    };
    setCustomCategories((prev) => [...prev, newCategory]);
    if (forEdit) {
      setEditIncome({ ...editIncome, category: categoryValue });
    } else {
      setNewIncome({ ...newIncome, category: categoryValue });
    }
    setNewCustomCategory({
      name: "",
      icon: "Briefcase",
      color: "bg-blue-500/20",
      textColor: "text-blue-400",
    });
  };

  const displayedIncomes = filterType === "all"
    ? incomes
    : incomes.filter((income) => filterType === "passive" ? income.is_passive : !income.is_passive);

  const totalIncome = displayedIncomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);

  const getCategoryInfo = (categoryValue: string) =>
    [...incomeCategories, ...customCategories].find((c) => c.value === categoryValue) || incomeCategories[0];

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
              <IncomeForm
                income={newIncome}
                setIncome={setNewIncome}
                onSubmit={handleAddIncome}
                isNew
                investments={investments}
                patrimony={patrimony}
                onCreateInvestment={() => handleCreateInvestment(false)}
                onCreatePatrimony={() => handleCreatePatrimony(false)}
                onCreateCustomCategory={() => handleCreateCustomCategory(false)}
                newInvestment={newInvestment}
                setNewInvestment={setNewInvestment}
                newPatrimonyAsset={newPatrimonyAsset}
                setNewPatrimonyAsset={setNewPatrimonyAsset}
                newCustomCategory={newCustomCategory}
                setNewCustomCategory={setNewCustomCategory}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setFilterType("all")} className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${filterType === "all" ? "bg-green-500 text-black" : "bg-zinc-800 text-zinc-400"}`}>Todos</button>
          <button onClick={() => setFilterType("passive")} className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${filterType === "passive" ? "bg-purple-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>Pasivos</button>
          <button onClick={() => setFilterType("active")} className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${filterType === "active" ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>Activos</button>
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
            ) : displayedIncomes.length === 0 ? (
              <p className="text-zinc-500 text-center">No hay ingresos registrados</p>
            ) : (
              <div className="space-y-3">
                {displayedIncomes.map((income) => {
                  const cat = getCategoryInfo(income.category);
                  const Icon = cat.icon;
                  return (
                    <div key={income.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                          <Icon className={`w-5 h-5 ${cat.textColor}`} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{income.description || cat.label}</p>
                          <p className="text-xs text-zinc-500">{income.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-green-500">+{formatCurrency(income.amount)}</p>
                          <p className="text-xs text-zinc-500">{income.is_passive ? "Pasivo" : "Activo"}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => openEditDialog(income)} className="p-2 rounded-lg hover:bg-zinc-700 transition-colors">
                            <Briefcase className="w-4 h-4 text-zinc-400" />
                          </button>
                          <button onClick={() => openDeleteDialog(income)} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors">
                            <X className="w-4 h-4 text-red-400" />
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Ingreso</DialogTitle>
          </DialogHeader>
          <IncomeForm
            income={editIncome}
            setIncome={setEditIncome}
            onSubmit={handleEditIncome}
            isNew={false}
            investments={investments}
            patrimony={patrimony}
            onCreateInvestment={() => handleCreateInvestment(true)}
            onCreatePatrimony={() => handleCreatePatrimony(true)}
            onCreateCustomCategory={() => handleCreateCustomCategory(true)}
            newInvestment={newInvestment}
            setNewInvestment={setNewInvestment}
            newPatrimonyAsset={newPatrimonyAsset}
            setNewPatrimonyAsset={setNewPatrimonyAsset}
            newCustomCategory={newCustomCategory}
            setNewCustomCategory={setNewCustomCategory}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Eliminar Ingreso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300">¿Estás seguro de que quieres eliminar este ingreso?</p>
            {selectedIncome && (
              <div className="p-4 bg-zinc-800/50 rounded-xl">
                <p className="text-white font-medium">{selectedIncome.description}</p>
                <p className="text-green-400 font-bold">{formatCurrency(selectedIncome.amount)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800">Cancelar</Button>
              <Button onClick={handleDeleteIncome} className="flex-1 bg-red-500 hover:bg-red-600">Eliminar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

const IncomeForm = ({
  income,
  setIncome,
  onSubmit,
  isNew,
  investments,
  patrimony,
  onCreateInvestment,
  onCreatePatrimony,
  onCreateCustomCategory,
  newInvestment,
  setNewInvestment,
  newPatrimonyAsset,
  setNewPatrimonyAsset,
  newCustomCategory,
  setNewCustomCategory,
}: any) => {
  const allCategories = [...incomeCategories];
  const selectedCategory = allCategories.find((c) => c.value === income.category) || incomeCategories[0];
  const SelectedIcon = selectedCategory.icon;

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

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Categoría</label>
        <div className="grid grid-cols-2 gap-2">
          {incomeCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = income.category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setIncome({ ...income, category: cat.value })}
                className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${isActive ? "border-green-500 bg-green-500/10" : "border-zinc-700 bg-zinc-800"}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                  <Icon className={`w-4 h-4 ${cat.textColor}`} />
                </div>
                <span className="text-sm text-white">{cat.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 p-3 rounded-xl bg-zinc-800 border border-zinc-700 space-y-3">
          <p className="text-xs text-zinc-400">Crear categoría personalizada</p>
          <Input placeholder="Nombre" value={newCustomCategory.name} onChange={(e) => setNewCustomCategory({ ...newCustomCategory, name: e.target.value })} className="bg-zinc-900 border-zinc-700 text-white" />
          <Button type="button" onClick={onCreateCustomCategory} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white">
            Crear categoría
          </Button>
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Tipo de ingreso</label>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setIncome({ ...income, income_type: "active" })} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${income.income_type === "active" ? "border-green-500 bg-green-500/20" : "border-zinc-700 bg-zinc-800"}`}>
            <Briefcase className={`w-6 h-6 ${income.income_type === "active" ? "text-green-400" : "text-zinc-400"}`} />
            <span className={`font-medium ${income.income_type === "active" ? "text-white" : "text-zinc-400"}`}>Activo</span>
          </button>
          <button type="button" onClick={() => setIncome({ ...income, income_type: "passive" })} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${income.income_type === "passive" ? "border-purple-500 bg-purple-500/20" : "border-zinc-700 bg-zinc-800"}`}>
            <PiggyBank className={`w-6 h-6 ${income.income_type === "passive" ? "text-purple-400" : "text-zinc-400"}`} />
            <span className={`font-medium ${income.income_type === "passive" ? "text-white" : "text-zinc-400"}`}>Pasivo</span>
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">¿Es recurrente?</label>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setIncome({ ...income, is_recurring: true })} className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${income.is_recurring ? "border-green-500 bg-green-500/20" : "border-zinc-700 bg-zinc-800"}`}>
            <TrendingDownIcon className={`w-5 h-5 ${income.is_recurring ? "text-green-400" : "text-zinc-400"}`} />
            <span className={`font-medium ${income.is_recurring ? "text-white" : "text-zinc-400"}`}>Recurrente</span>
          </button>
          <button type="button" onClick={() => setIncome({ ...income, is_recurring: false })} className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${!income.is_recurring ? "border-zinc-500 bg-zinc-700" : "border-zinc-700 bg-zinc-800"}`}>
            <DollarSign className={`w-5 h-5 ${!income.is_recurring ? "text-white" : "text-zinc-400"}`} />
            <span className={`font-medium ${!income.is_recurring ? "text-white" : "text-zinc-400"}`}>Puntual</span>
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Fecha</label>
        <DatePicker date={income.date} onDateChange={(date) => setIncome({ ...income, date: date || new Date() })} />
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Vincular a inversión</label>
        <Select value={income.investment_id} onValueChange={(v) => setIncome({ ...income, investment_id: v })}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Selecciona una inversión" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="none" className="text-white">Sin vincular</SelectItem>
            {investments.map((inv: any) => (
              <SelectItem key={inv.id} value={inv.id} className="text-white">{inv.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-3 p-3 rounded-xl bg-zinc-800 border border-zinc-700 space-y-3">
          <p className="text-xs text-zinc-400">Crear inversión rápida</p>
          <Input placeholder="Nombre" value={newInvestment.name} onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })} className="bg-zinc-900 border-zinc-700 text-white" />
          <Input type="number" placeholder="Valor inicial" value={newInvestment.initial_value} onChange={(e) => setNewInvestment({ ...newInvestment, initial_value: e.target.value })} className="bg-zinc-900 border-zinc-700 text-white" />
          <Button type="button" onClick={onCreateInvestment} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white">
            Crear inversión
          </Button>
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Vincular a patrimonio</label>
        <Select value={income.patrimony_id} onValueChange={(v) => setIncome({ ...income, patrimony_id: v })}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Selecciona patrimonio" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="none" className="text-white">Sin vincular</SelectItem>
            {patrimony.map((pat: any) => (
              <SelectItem key={pat.id} value={pat.id} className="text-white">{pat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-3 p-3 rounded-xl bg-zinc-800 border border-zinc-700 space-y-3">
          <p className="text-xs text-zinc-400">Crear patrimonio rápido</p>
          <Input placeholder="Nombre" value={newPatrimonyAsset.name} onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, name: e.target.value })} className="bg-zinc-900 border-zinc-700 text-white" />
          <Input type="number" placeholder="Valor" value={newPatrimonyAsset.value} onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, value: e.target.value })} className="bg-zinc-900 border-zinc-700 text-white" />
          <Button type="button" onClick={onCreatePatrimony} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white">
            Crear patrimonio
          </Button>
        </div>
      </div>

      <Button onClick={onSubmit} className="w-full bg-green-500 hover:bg-green-600 text-black py-6">
        {isNew ? "Guardar" : "Guardar cambios"}
      </Button>
    </div>
  );
};

export default IncomePage;