"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, TrendingUp, DollarSign, Briefcase, Home, Building, ShoppingCart, Globe, Zap, Music, BookOpen, Car, Plane, Laptop, Smartphone, ChevronRight, X, PiggyBank, CreditCard, MoreHorizontal, Heart, Shirt, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { formatCurrency } from "@/utils/currency";

const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const safeDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr) return new Date();
  const date = new Date(dateStr + "T00:00:00");
  return isNaN(date.getTime()) ? new Date() : date;
};

const formatDateSafe = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr + "T00:00:00");
  return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("es-ES");
};

type FilterType = "all" | "active" | "passive";
type InsightType = "positive" | "neutral" | "warning";

interface CategoryOption {
  value: string;
  label: string;
  icon: any;
  color: string;
  textColor: string;
}

interface GroupedIncomes {
  today: any[];
  thisWeek: any[];
  thisMonth: any[];
}

interface Insight {
  text: string;
  type: InsightType;
}

interface TopCategory {
  category: string;
  amount: number;
  percentage: number;
}

const availableIcons = [
  { value: "Briefcase", icon: Briefcase },
  { value: "Home", icon: Home },
  { value: "ShoppingCart", icon: ShoppingCart },
  { value: "Laptop", icon: Laptop },
  { value: "Globe", icon: Globe },
  { value: "TrendingUp", icon: TrendingUp },
  { value: "DollarSign", icon: DollarSign },
  { value: "Wallet", icon: DollarSign },
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
  { value: "UtensilsCrossed", icon: Shirt },
  { value: "Shirt", icon: Shirt },
  { value: "MoreHorizontal", icon: MoreHorizontal },
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

const incomeCategories: CategoryOption[] = [
  { value: "salary", label: "Sueldo", icon: Briefcase, color: "bg-blue-500/20", textColor: "text-blue-400" },
  { value: "rental", label: "Alquiler", icon: Home, color: "bg-emerald-500/20", textColor: "text-emerald-400" },
  { value: "digital_sales", label: "Ventas Digitales", icon: ShoppingCart, color: "bg-purple-500/20", textColor: "text-purple-400" },
  { value: "services", label: "Servicios", icon: Laptop, color: "bg-cyan-500/20", textColor: "text-cyan-400" },
  { value: "affiliates", label: "Afiliados", icon: Globe, color: "bg-amber-500/20", textColor: "text-amber-400" },
  { value: "investments", label: "Inversiones", icon: TrendingUp, color: "bg-green-500/20", textColor: "text-green-400" },
  { value: "freelance", label: "Freelance", icon: DollarSign, color: "bg-indigo-500/20", textColor: "text-indigo-400" },
  { value: "business", label: "Negocio", icon: Building, color: "bg-rose-500/20", textColor: "text-rose-400" },
];

const generateInsight = (currentIncomes: any[], previousIncomes: any[]): Insight | null => {
  if (currentIncomes.length === 0) return null;
  const currentTotal = currentIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const previousTotal = previousIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const currentPassive = currentIncomes.filter(i => i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const passivePercentage = currentTotal > 0 ? (currentPassive / currentTotal) * 100 : 0;
  const uniqueCategories = new Set(currentIncomes.map(i => i.category));

  if (previousTotal > 0 && currentTotal > 0) {
    const changePercent = ((currentTotal - previousTotal) / previousTotal) * 100;
    if (changePercent >= 10) return { text: `Tus ingresos han aumentado un ${changePercent.toFixed(0)}% respecto al mes anterior`, type: "positive" };
    if (changePercent <= -10) return { text: `Tus ingresos han disminuido un ${Math.abs(changePercent).toFixed(0)}% respecto al mes anterior`, type: "warning" };
  }
  if (passivePercentage < 30 && currentTotal > 0) return { text: `Dependes principalmente de ingresos activos (${(100 - passivePercentage).toFixed(0)}%)`, type: "neutral" };
  if (passivePercentage >= 50) return { text: `¡Buen camino! Tus ingresos pasivos superan el ${passivePercentage.toFixed(0)}%`, type: "positive" };
  if (uniqueCategories.size >= 3) return { text: `Tienes ingresos bien diversificados (${uniqueCategories.size} fuentes)`, type: "positive" };
  return null;
};

const groupIncomesByDate = (incomes: any[]): GroupedIncomes => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const grouped: GroupedIncomes = { today: [], thisWeek: [], thisMonth: [] };

  incomes.forEach((income) => {
    if (!income.date) return;
    const incomeDate = new Date(income.date + "T00:00:00");
    incomeDate.setHours(0, 0, 0, 0);
    if (incomeDate.getTime() === today.getTime()) grouped.today.push(income);
    else if (incomeDate >= startOfWeek && incomeDate < today) grouped.thisWeek.push(income);
    else grouped.thisMonth.push(income);
  });

  return grouped;
};

const IncomePage = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<any>(null);
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);
  const [isInvestmentDialogOpen, setIsInvestmentDialogOpen] = useState(false);
  const [isPatrimonyDialogOpen, setIsPatrimonyDialogOpen] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);

  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const currentYear = new Date().getFullYear().toString();
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);

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

  const fetchOptions = async (userId: string) => {
    const [invResult, patResult] = await Promise.all([
      supabase.from("investments").select("id, name").eq("user_id", userId),
      supabase.from("patrimony").select("id, name").eq("user_id", userId),
    ]);
    if (invResult.data) setInvestments(invResult.data);
    if (patResult.data) setPatrimony(patResult.data);
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    await fetchOptions(session.user.id);
    await fetchIncomes(session.user.id);
  };

  const fetchIncomes = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase.from("incomes").select("*").eq("user_id", userId).order("date", { ascending: false });
    if (data) {
      setIncomes(data);
      setInsight(generateInsight(data, []));
    }
    setLoading(false);
  };

  const allCategories = [...incomeCategories, ...customCategories];

  const getCategoryInfo = (categoryValue: string) => allCategories.find((c) => c.value === categoryValue) || incomeCategories[0];
  const getSelectedCategoryInfo = (categoryValue: string) => allCategories.find((c) => c.value === categoryValue) || incomeCategories[0];

  const filteredIncomes = incomes.filter((income) => {
    if (!income.date) return false;
    const incomeDate = new Date(income.date + "T00:00:00");
    if (isNaN(incomeDate.getTime())) return false;
    const incomeYear = incomeDate.getFullYear().toString();
    const incomeMonth = (incomeDate.getMonth() + 1).toString().padStart(2, "0");
    if (filterYear !== "all" && incomeYear !== filterYear) return false;
    if (filterMonth !== "all" && incomeMonth !== filterMonth) return false;
    if (filterType === "active") return !income.is_passive;
    if (filterType === "passive") return income.is_passive;
    return true;
  });

  const totalIncome = filteredIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const activeIncome = filteredIncomes.filter((i) => !i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const passiveIncome = filteredIncomes.filter((i) => i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const activePercentage = totalIncome > 0 ? (activeIncome / totalIncome) * 100 : 0;
  const passivePercentage = totalIncome > 0 ? (passiveIncome / totalIncome) * 100 : 0;
  const groupedIncomes = groupIncomesByDate(filteredIncomes);

  const incomeByCategory: Record<string, number> = {};
  filteredIncomes.forEach((income) => {
    const cat = income.category || "other";
    incomeByCategory[cat] = (incomeByCategory[cat] || 0) + parseFloat(income.amount || 0);
  });

  const sortedCategories = Object.entries(incomeByCategory).sort(([, a], [, b]) => b - a).map(([category, amount]) => ({ category, amount }));
  const top3 = sortedCategories.slice(0, 3);
  const others = sortedCategories.slice(3);
  const othersTotal = others.reduce((sum, cat) => sum + cat.amount, 0);
  const topCategories: TopCategory[] = [
    ...top3.map((cat) => ({ category: cat.category, amount: cat.amount, percentage: totalIncome > 0 ? (cat.amount / totalIncome) * 100 : 0 })),
    ...(othersTotal > 0 ? [{ category: "others", amount: othersTotal, percentage: totalIncome > 0 ? (othersTotal / totalIncome) * 100 : 0 }] : []),
  ];

  const handleAddIncome = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !newIncome.amount || !newIncome.source) return;
    const { error } = await supabase.from("incomes").insert({
      user_id: session.user.id,
      amount: parseFloat(newIncome.amount),
      description: newIncome.source,
      category: newIncome.category,
      is_passive: newIncome.income_type === "passive",
      date: formatDateToISO(newIncome.date),
      is_recurring: newIncome.is_recurring,
      investment_id: newIncome.investment_id === "none" ? null : newIncome.investment_id,
      patrimony_id: newIncome.patrimony_id === "none" ? null : newIncome.patrimony_id,
    });
    if (!error) {
      setIsDialogOpen(false);
      setNewIncome({ source: "", amount: "", is_recurring: false, income_type: "active", category: "salary", date: new Date(), investment_id: "none", patrimony_id: "none" });
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
      date: formatDateToISO(editIncome.date),
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
    setEditIncome({
      id: income.id,
      source: income.description || "",
      amount: income.amount?.toString() || "",
      is_recurring: !!income.is_recurring,
      income_type: income.is_passive ? "passive" : "active",
      category: income.category,
      date: safeDate(income.date),
      investment_id: income.investment_id || "none",
      patrimony_id: income.patrimony_id || "none",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (income: any) => {
    setSelectedIncome(income);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateCustomCategory = () => {
    // keep simple; no custom editor flow here
  };

  const renderIncomeItem = (income: any) => {
    const cat = getCategoryInfo(income.category);
    const Icon = cat.icon;
    const isPassive = income.is_passive;
    return (
      <div key={income.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
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
            <p className={`text-xs ${isPassive ? "text-green-400" : "text-blue-400"}`}>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${isPassive ? "bg-green-500/10" : "bg-blue-500/10"}`}>
                {isPassive ? <><PiggyBank className="w-3 h-3 mr-1" />Pasivo</> : <><Briefcase className="w-3 h-3 mr-1" />Activo</>}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <button onClick={() => openEditDialog(income)} className="p-2 rounded-lg hover:bg-zinc-700 transition-colors"><Pencil className="w-4 h-4 text-zinc-400" /></button>
            <button onClick={() => openDeleteDialog(income)} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black pb-28">
      <DashboardHeader title="FinPro" subtitle="Gestión de Ingresos" />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-full p-4 h-auto bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center justify-between hover:border-zinc-600 transition-all group">
              <span className="text-zinc-400 text-sm group-hover:text-zinc-300">Año</span>
              <div className="flex items-center gap-2"><span className="text-white font-semibold text-lg">{filterYear}</span></div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all" className="text-white">Todos</SelectItem>
              {Array.from({ length: new Date().getFullYear() - 1990 + 1 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <SelectItem key={year} value={year.toString()} className="text-white">{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-full p-4 h-auto bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center justify-between hover:border-zinc-600 transition-all group">
              <span className="text-zinc-400 text-sm group-hover:text-zinc-300">Mes</span>
              <div className="flex items-center gap-2"><span className="text-white font-semibold text-lg">{months.find(m => m.value === filterMonth)?.label}</span></div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value} className="text-white">{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 text-center">
            <p className="text-zinc-400 text-sm mb-1">Total Ingresos</p>
            <p className="text-4xl font-bold text-green-500 mb-4">{formatCurrency(totalIncome)}</p>
            {totalIncome > 0 && (
              <div className="space-y-2">
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${activePercentage}%` }} />
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${passivePercentage}%` }} />
                </div>
                <div className="flex justify-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-blue-400"><Briefcase className="w-3 h-3" />{activePercentage.toFixed(0)}% activos</span>
                  <span className="flex items-center gap-1 text-green-400"><PiggyBank className="w-3 h-3" />{passivePercentage.toFixed(0)}% pasivos</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-green-500 hover:bg-green-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo ingreso
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Nuevo Ingreso</DialogTitle>
            </DialogHeader>
            <button onClick={() => setIsDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white">
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-3 mt-2">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Concepto</label>
                <Input placeholder="Ej: Sueldo..." value={newIncome.source} onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Importe (€)</label>
                <Input type="number" step="0.01" placeholder="0.00" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Fecha</label>
                <DatePicker date={newIncome.date} onDateChange={(date) => setNewIncome({ ...newIncome, date: date || new Date() })} />
              </div>
              <Button onClick={handleAddIncome} className="w-full bg-green-500 hover:bg-green-600 text-black">
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <p className="text-white font-semibold mb-4">Ingresos</p>
            {loading ? (
              <p className="text-zinc-500 text-center">Cargando...</p>
            ) : filteredIncomes.length === 0 ? (
              <p className="text-zinc-500 text-center">Sin ingresos</p>
            ) : (
              <div className="space-y-3">
                {filteredIncomes.map(renderIncomeItem)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Editar Ingreso</DialogTitle></DialogHeader>
          <button onClick={() => setIsEditDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Concepto</label>
              <Input value={editIncome.source} onChange={(e) => setEditIncome({ ...editIncome, source: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Importe (€)</label>
              <Input type="number" step="0.01" value={editIncome.amount} onChange={(e) => setEditIncome({ ...editIncome, amount: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" />
            </div>
            <Button onClick={handleEditIncome} className="w-full bg-green-500 hover:bg-green-600 text-black">Guardar cambios</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Eliminar Ingreso</DialogTitle></DialogHeader>
          <button onClick={() => setIsDeleteDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300">¿Eliminar este ingreso?</p>
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

export default IncomePage;