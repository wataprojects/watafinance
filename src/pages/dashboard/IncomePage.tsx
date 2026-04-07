"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Plus,
  TrendingUp,
  DollarSign,
  Briefcase,
  Home,
  Building,
  ShoppingCart,
  Globe,
  Zap,
  Music,
  BookOpen,
  Car,
  Plane,
  Laptop,
  Smartphone,
  ChevronRight,
  X,
  PiggyBank,
  CreditCard,
  MoreHorizontal,
  Heart,
  Shirt,
  Pencil,
  Trash2,
  RefreshCcw,
  TrendingDown,
  Sparkles,
  BadgeCheck,
  Search,
  CalendarOff,
  Ban,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { formatCurrency } from "@/utils/currency";
import { getVisualBarWidth } from "@/utils/helpers";
import { toast } from "sonner";

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

interface CategoryOption {
  value: string;
  label: string;
  icon: any;
  color: string;
  textColor: string;
}

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
  { value: "rental_income", label: "Renta", icon: Home, color: "bg-teal-500/20", textColor: "text-teal-400" },
  { value: "dividends", label: "Dividendos", icon: TrendingUp, color: "bg-yellow-500/20", textColor: "text-yellow-400" },
  { value: "royalties", label: "Regalias", icon: BookOpen, color: "bg-orange-500/20", textColor: "text-orange-400" },
  { value: "transport", label: "Transporte", icon: Car, color: "bg-sky-500/20", textColor: "text-sky-400" },
  { value: "travel", label: "Viajes", icon: Plane, color: "bg-violet-500/20", textColor: "text-violet-400" },
  { value: "entertainment", label: "Entretenimiento", icon: Music, color: "bg-pink-500/20", textColor: "text-pink-400" },
  { value: "other", label: "Otros", icon: MoreHorizontal, color: "bg-slate-500/20", textColor: "text-slate-400" },
];

const months = [
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

type IncomeFilterType = "all" | "active" | "passive";

const IncomePage = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isInvestmentDialogOpen, setIsInvestmentDialogOpen] = useState(false);
  const [isPatrimonyDialogOpen, setIsPatrimonyDialogOpen] = useState(false);
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filterIncomeType, setFilterIncomeType] = useState<IncomeFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const currentYear = new Date().getFullYear().toString();
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
    type: "digital",
    initial_value: "",
    current_value: "",
  });

  const [newPatrimonyAsset, setNewPatrimonyAsset] = useState({
    name: "",
    category: "real_estate",
    value: "",
  });

  const investmentTypes = [
    { value: "digital", label: "Digital" },
    { value: "inmuebles", label: "Inmuebles" },
    { value: "bolsa", label: "Bolsa" },
    { value: "negocio", label: "Negocio" },
    { value: "contenido", label: "Contenido" },
    { value: "oro", label: "Oro" },
    { value: "crypto", label: "Crypto" },
    { value: "otros", label: "Otros" },
  ];

  const patrimonyCategories = [
    { value: "real_estate", label: "Bienes Raices" },
    { value: "vehicle", label: "Vehiculos" },
    { value: "investments", label: "Inversiones" },
    { value: "savings", label: "Ahorros" },
    { value: "business", label: "Negocios" },
    { value: "other", label: "Otros" },
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
    if (data) setIncomes(data);
    setLoading(false);
  };

  const getCategoryInfo = (categoryValue: string) =>
    incomeCategories.find((c) => c.value === categoryValue) || incomeCategories[incomeCategories.length - 1];

  const getSelectedCategoryInfo = (categoryValue: string) =>
    incomeCategories.find((c) => c.value === categoryValue) || incomeCategories[0];

  const filteredIncomes = incomes.filter((income) => {
    if (income.is_skipped) return false;
    if (!income.date) return false;
    const incomeDate = new Date(income.date + "T00:00:00");
    if (isNaN(incomeDate.getTime())) return false;
    const incomeYear = incomeDate.getFullYear().toString();
    const incomeMonth = (incomeDate.getMonth() + 1).toString().padStart(2, "0");
    if (filterYear !== "all" && incomeYear !== filterYear) return false;
    if (filterMonth !== "all" && incomeMonth !== filterMonth) return false;
    if (filterIncomeType === "active") return !income.is_passive;
    if (filterIncomeType === "passive") return income.is_passive;
    
    // Filtro de búsqueda por nombre
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesDescription = income.description?.toLowerCase().includes(query);
      if (!matchesDescription) return false;
    }
    
    return true;
  });

  const totalIncome = filteredIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const activeIncome = filteredIncomes.filter((i) => !i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const passiveIncome = filteredIncomes.filter((i) => i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const activePercentage = totalIncome > 0 ? (activeIncome / totalIncome) * 100 : 0;
  const passivePercentage = totalIncome > 0 ? (passiveIncome / totalIncome) * 100 : 0;

  const incomeByCategory: Record<string, number> = {};
  filteredIncomes.forEach((income) => {
    const cat = income.category || "other";
    incomeByCategory[cat] = (incomeByCategory[cat] || 0) + parseFloat(income.amount || 0);
  });

  const sortedCategories = Object.entries(incomeByCategory)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([category, amount]) => ({ category, amount: amount as number }));

  const topCategories = sortedCategories.slice(0, 5);
  const otherTotal = sortedCategories.slice(5).reduce((sum, cat) => sum + cat.amount, 0);

  const handleAddIncome = async () => {
    if (isSubmitting || !newIncome.amount || !newIncome.source) return;
    setIsSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsSubmitting(false);
      return;
    }

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
      start_date: newIncome.is_recurring ? formatDateToISO(newIncome.date) : null,
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
      toast.success("Ingreso añadido correctamente");
    } else {
      toast.error("Error al añadir ingreso");
    }

    setIsSubmitting(false);
  };

  const handleEditIncome = async () => {
    if (isSubmitting || !selectedIncome) return;
    setIsSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsSubmitting(false);
      return;
    }

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
      toast.success("Ingreso actualizado");
    } else {
      toast.error("Error al actualizar ingreso");
    }

    setIsSubmitting(false);
  };

  const handleDeleteIncome = async () => {
    if (!selectedIncome) return;

    const { error } = await supabase.from("incomes").delete().eq("id", selectedIncome.id);
    if (!error) {
      setIsDeleteDialogOpen(false);
      setSelectedIncome(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchIncomes(session.user.id);
      toast.success("Ingreso eliminado");
    } else {
      toast.error("Error al eliminar ingreso");
    }
  };

  const handleSkipMonth = async () => {
    if (!selectedIncome) return;
    setIsSubmitting(true);

    const { error } = await supabase
      .from("incomes")
      .update({ is_skipped: true })
      .eq("id", selectedIncome.id);

    if (!error) {
      setIsDeleteDialogOpen(false);
      setSelectedIncome(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchIncomes(session.user.id);
      toast.success("Ingreso omitido para este mes");
    } else {
      toast.error("Error al omitir ingreso");
    }
    setIsSubmitting(false);
  };

  const handleStopRecurrence = async () => {
    if (!selectedIncome) return;
    setIsSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // 1. Delete current instance
    const { error: deleteError } = await supabase
      .from("incomes")
      .delete()
      .eq("id", selectedIncome.id);

    if (deleteError) {
      toast.error("Error al detener recurrencia");
      setIsSubmitting(false);
      return;
    }

    // 2. Set end_date for all previous instances of this series
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const endDate = formatDateToISO(yesterday);

    const { error: updateError } = await supabase
      .from("incomes")
      .update({ end_date: endDate })
      .eq("user_id", session.user.id)
      .eq("description", selectedIncome.description)
      .eq("category", selectedIncome.category)
      .eq("is_recurring", true);

    if (!updateError) {
      setIsDeleteDialogOpen(false);
      setSelectedIncome(null);
      fetchIncomes(session.user.id);
      toast.success("Recurrencia detenida");
    } else {
      toast.error("Error al actualizar serie recurrente");
    }
    setIsSubmitting(false);
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

  const handleCreateInvestment = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !newInvestment.name || !newInvestment.initial_value) return;

    const initial = parseFloat(newInvestment.initial_value);
    const current = parseFloat(newInvestment.current_value) || initial;
    const returnPct = initial > 0 ? ((current - initial) / initial) * 100 : 0;

    const { data, error } = await supabase.from("investments").insert({
      user_id: session.user.id,
      name: newInvestment.name,
      type: newInvestment.type,
      initial_value: initial,
      current_value: current,
      return_percentage: returnPct,
    }).select().single();

    if (!error && data) {
      setInvestments([...investments, { id: data.id, name: data.name }]);
      setNewIncome({ ...newIncome, investment_id: data.id });
      setIsNewInvestmentOpen(false);
      setNewInvestment({ name: "", type: "digital", initial_value: "", current_value: "" });
      toast.success("Inversion creada");
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
      toast.success("Patrimonio creado");
    }
  };

  const getInvestmentLabel = (id: string) =>
    id === "none" ? "Sin vincular" : investments.find((i: any) => i.id === id)?.name || "Sin vincular";

  const getPatrimonyLabel = (id: string) =>
    id === "none" ? "Sin vincular" : patrimony.find((p: any) => p.id === id)?.name || "Sin vincular";

  return (
    <div className="min-h-screen bg-black pb-28">
      <DashboardHeader title="FinPro" subtitle="Gestion de Ingresos" />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-full p-4 h-auto bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center justify-between hover:border-zinc-600 transition-all group">
              <span className="text-zinc-400 text-sm group-hover:text-zinc-300">Ano</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-lg">{filterYear}</span>
              </div>
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
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-lg">
                  {filterMonth === "all" ? "Todos" : months.find(m => m.value === filterMonth)?.label}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all" className="text-white">Todos</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value} className="text-white">{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <p className="text-zinc-400 text-sm mb-1 text-center">Total Ingresos</p>
            <p className="text-4xl font-bold text-green-500 mb-4 text-center">{formatCurrency(totalIncome)}</p>

            {totalIncome > 0 && (
              <>
                <div className="space-y-3 mb-4">
                  <div className="h-4 bg-zinc-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${getVisualBarWidth(activePercentage, 5)}%` }} />
                    <div className="h-full bg-green-500 transition-all" style={{ width: `${getVisualBarWidth(passivePercentage, 5)}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        <span className="text-zinc-400 text-xs font-medium">Activos</span>
                      </div>
                      <p className="text-white font-bold text-sm">{formatCurrency(activeIncome)}</p>
                      <p className="text-zinc-500 text-xs">{activePercentage.toFixed(0)}%</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        <span className="text-zinc-400 text-xs font-medium">Pasivos</span>
                      </div>
                      <p className="text-green-400 font-bold text-sm">{formatCurrency(passiveIncome)}</p>
                      <p className="text-zinc-500 text-xs">{passivePercentage.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-green-500 hover:bg-green-600 text-black py-4 text-sm font-semibold mb-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Ingreso
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-white">Nuevo Ingreso</DialogTitle>
                    </DialogHeader>
                    <button onClick={() => setIsDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white">
                      <X className="w-4 h-4" />
                    </button>
                    <IncomeForm
                      income={newIncome}
                      setIncome={setNewIncome}
                      onSubmit={handleAddIncome}
                      isSubmitting={isSubmitting}
                      isNew={true}
                      investments={investments}
                      patrimony={patrimony}
                      isCategoryDialogOpen={isCategoryDialogOpen}
                      setIsCategoryDialogOpen={setIsCategoryDialogOpen}
                      isInvestmentDialogOpen={isInvestmentDialogOpen}
                      setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
                      isPatrimonyDialogOpen={isPatrimonyDialogOpen}
                      setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
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
                      getSelectedCategoryInfo={getSelectedCategoryInfo}
                      getInvestmentLabel={getInvestmentLabel}
                      getPatrimonyLabel={getPatrimonyLabel}
                    />
                  </DialogContent>
                </Dialog>

                {topCategories.length > 0 && (
                  <div className="pt-4 border-t border-zinc-700">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-zinc-500 font-medium">Distribucion por categoria</p>
                      <p className="text-xs text-zinc-500">
                        {topCategories.length} {topCategories.length === 1 ? "categoria" : "categorias"}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {topCategories.map((cat) => {
                        const catInfo = getCategoryInfo(cat.category);
                        const Icon = catInfo.icon;
                        const percentage = totalIncome > 0 ? (cat.amount / totalIncome) * 100 : 0;
                        const isPassive = catInfo.value === "rental" || catInfo.value === "investments" || catInfo.value === "dividends" || catInfo.value === "royalties";

                        return (
                          <div key={cat.category} className="w-full p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-all min-w-0 overflow-hidden">
                            {/* Fila 1: Icono + Barra de progreso con % */}
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${catInfo.color}`}>
                                <Icon className={`w-4 h-4 ${catInfo.textColor}`} />
                              </div>
                              
                              {/* Barra de progreso con % dentro */}
                              <div className="relative flex-1 h-3 bg-zinc-700 rounded-full overflow-hidden">
                                <div
                                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${catInfo.color.replace('/20', '')}`}
                                  style={{ width: `${getVisualBarWidth(percentage, 5)}%` }}
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white drop-shadow-sm">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            
                            {/* Fila 2: Nombre + Badge + Monto */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-shrink">
                                <span className="text-xs text-zinc-200 font-medium truncate">{catInfo.label}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium flex-shrink-0 ${isPassive ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>
                                  {isPassive ? "Pasivo" : "Activo"}
                                </span>
                              </div>
                              <span className="font-bold text-white text-sm flex-shrink-0 truncate">{formatCurrency(cat.amount)}</span>
                            </div>
                          </div>
                        );
                      })}

                      {otherTotal > 0 && (
                        <div className="w-full p-3 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-500">Otras categorias ({sortedCategories.length - 5})</span>
                            <span className="font-bold text-zinc-400">{formatCurrency(otherTotal)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {totalIncome === 0 && !loading && (
              <div className="text-center py-4">
                <p className="text-zinc-500 text-sm mb-4">No hay ingresos registrados</p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-500 hover:bg-green-600 text-black py-3 text-sm font-semibold">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Ingreso
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-white">Nuevo Ingreso</DialogTitle>
                    </DialogHeader>
                    <button onClick={() => setIsDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white">
                      <X className="w-4 h-4" />
                    </button>
                    <IncomeForm
                      income={newIncome}
                      setIncome={setNewIncome}
                      onSubmit={handleAddIncome}
                      isSubmitting={isSubmitting}
                      isNew={true}
                      investments={investments}
                      patrimony={patrimony}
                      isCategoryDialogOpen={isCategoryDialogOpen}
                      setIsCategoryDialogOpen={setIsCategoryDialogOpen}
                      isInvestmentDialogOpen={isInvestmentDialogOpen}
                      setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
                      isPatrimonyDialogOpen={isPatrimonyDialogOpen}
                      setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
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
                      getSelectedCategoryInfo={getSelectedCategoryInfo}
                      getInvestmentLabel={getInvestmentLabel}
                      getPatrimonyLabel={getPatrimonyLabel}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-semibold">Ingresos</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-40 bg-zinc-800 border-zinc-700 text-white text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-700 rounded"
                  >
                    <X className="w-3 h-3 text-zinc-400" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setFilterIncomeType("all")}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${
                  filterIncomeType === "all"
                    ? "bg-zinc-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterIncomeType("active")}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${
                  filterIncomeType === "active"
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                Activos
              </button>
              <button
                onClick={() => setFilterIncomeType("passive")}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${
                  filterIncomeType === "passive"
                    ? "bg-green-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                Pasivos
              </button>
            </div>

            {loading ? (
              <p className="text-zinc-500 text-center">Cargando...</p>
            ) : filteredIncomes.length === 0 ? (
              <p className="text-zinc-500 text-center">Sin ingresos</p>
            ) : (
              <div className="space-y-3">
                {filteredIncomes.map((income) => {
                  const cat = getCategoryInfo(income.category);
                  const Icon = cat.icon;
                  const isPassive = income.is_passive;

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
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">{income.description || cat.label}</p>
                            {income.is_recurring && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[9px] font-bold flex items-center gap-1">
                                <RefreshCcw className="w-2 h-2" />
                                Recurrente
                              </span>
                            )}
                          </div>
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
                          <button onClick={() => openEditDialog(income)} className="p-2 rounded-lg hover:bg-zinc-700 transition-colors">
                            <Pencil className="w-4 h-4 text-zinc-400" />
                          </button>
                          <button onClick={() => openDeleteDialog(income)} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors">
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Ingreso</DialogTitle>
          </DialogHeader>
          <button onClick={() => setIsEditDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white">
            <X className="w-4 h-4" />
          </button>
          <IncomeForm
            income={editIncome}
            setIncome={setEditIncome}
            onSubmit={handleEditIncome}
            isSubmitting={isSubmitting}
            isNew={false}
            investments={investments}
            patrimony={patrimony}
            isCategoryDialogOpen={isCategoryDialogOpen}
            setIsCategoryDialogOpen={setIsCategoryDialogOpen}
            isInvestmentDialogOpen={isInvestmentDialogOpen}
            setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
            isPatrimonyDialogOpen={isPatrimonyDialogOpen}
            setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
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
            getSelectedCategoryInfo={getSelectedCategoryInfo}
            getInvestmentLabel={getInvestmentLabel}
            getPatrimonyLabel={getPatrimonyLabel}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Eliminar Ingreso</DialogTitle>
          </DialogHeader>
          <button onClick={() => setIsDeleteDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white">
            <X className="w-4 h-4" />
          </button>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300 text-sm">
              {selectedIncome?.is_recurring 
                ? "Este es un ingreso recurrente. ¿Qué deseas hacer?" 
                : "¿Eliminar este ingreso?"}
            </p>
            {selectedIncome && (
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedIncome.description}</p>
                <p className="text-green-400 font-bold">{formatCurrency(selectedIncome.amount)}</p>
              </div>
            )}
            
            {selectedIncome?.is_recurring ? (
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleSkipMonth} 
                  disabled={isSubmitting}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 flex items-center justify-center gap-2"
                >
                  <CalendarOff className="w-4 h-4" />
                  Eliminar solo este mes
                </Button>
                <Button 
                  onClick={handleStopRecurrence} 
                  disabled={isSubmitting}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 flex items-center justify-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Detener recurrencia
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)} 
                  className="w-full border-zinc-700 text-white hover:bg-zinc-800"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800 text-xs">
                  Cancelar
                </Button>
                <Button onClick={handleDeleteIncome} className="flex-1 bg-red-500 hover:bg-red-600 text-xs">
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

interface IncomeFormProps {
  income: any;
  setIncome: (income: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isNew: boolean;
  investments: any[];
  patrimony: any[];
  isCategoryDialogOpen: boolean;
  setIsCategoryDialogOpen: (open: boolean) => void;
  isInvestmentDialogOpen: boolean;
  setIsInvestmentDialogOpen: (open: boolean) => void;
  isPatrimonyDialogOpen: boolean;
  setIsPatrimonyDialogOpen: (open: boolean) => void;
  isNewInvestmentOpen: boolean;
  setIsNewInvestmentOpen: (open: boolean) => void;
  isNewPatrimonyOpen: boolean;
  setIsNewPatrimonyOpen: (open: boolean) => void;
  newInvestment: any;
  setNewInvestment: (inv: any) => void;
  newPatrimonyAsset: any;
  setNewPatrimonyAsset: (pat: any) => void;
  handleCreateInvestment: () => void;
  handleCreatePatrimony: () => void;
  investmentTypes: any[];
  patrimonyCategories: any[];
  getSelectedCategoryInfo: (category: string) => CategoryOption;
  getInvestmentLabel: (id: string) => string;
  getPatrimonyLabel: (id: string) => string;
}

const IncomeForm: React.FC<IncomeFormProps> = ({
  income,
  setIncome,
  onSubmit,
  isSubmitting,
  isNew,
  investments,
  patrimony,
  isCategoryDialogOpen,
  setIsCategoryDialogOpen,
  isInvestmentDialogOpen,
  setIsInvestmentDialogOpen,
  isPatrimonyDialogOpen,
  setIsPatrimonyDialogOpen,
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
  getSelectedCategoryInfo,
  getInvestmentLabel,
  getPatrimonyLabel,
}) => {
  const selectedCategory = getSelectedCategoryInfo(income.category);
  const SelectedIcon = selectedCategory.icon;

  return (
    <div className="space-y-3 mt-2">
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Concepto</label>
        <Input
          placeholder="Ej: Sueldo, Alquiler..."
          value={income.source}
          onChange={(e) => setIncome({ ...income, source: e.target.value })}
          className="bg-zinc-800 border-zinc-700 text-white text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Importe (EUR)</label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={income.amount}
          onChange={(e) => setIncome({ ...income, amount: e.target.value })}
          className="bg-zinc-800 border-zinc-700 text-white text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Fecha</label>
        <DatePicker
          date={income.date}
          onDateChange={(date) => setIncome({ ...income, date: date || new Date() })}
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Categoria</label>
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="w-full p-2 bg-zinc-800 border-2 border-zinc-700 rounded-lg flex items-center gap-2 hover:border-zinc-600 transition-all"
            >
              <div className={`w-6 h-6 rounded flex items-center justify-center ${selectedCategory.color}`}>
                <SelectedIcon className={`w-3 h-3 ${selectedCategory.textColor}`} />
              </div>
              <span className="text-white text-sm">{selectedCategory.label}</span>
              <ChevronRight className="w-4 h-4 text-zinc-400 ml-auto" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[70vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-sm">Categoria</DialogTitle>
            </DialogHeader>
            <button
              onClick={() => setIsCategoryDialogOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-3 gap-2 mt-2">
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
                    className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                      income.category === cat.value
                        ? "border-green-500 bg-green-500/20"
                        : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${cat.color}`}>
                      <Icon className={`w-4 h-4 ${cat.textColor}`} />
                    </div>
                    <span className={`text-[10px] font-medium ${income.category === cat.value ? "text-white" : "text-zinc-400"}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-2 block">Tipo de ingreso</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIncome({ ...income, income_type: "active" })}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
              income.income_type === "active"
                ? "border-blue-500 bg-blue-500/20"
                : "border-zinc-700 bg-zinc-800"
            }`}
          >
            <Briefcase className={`w-5 h-5 ${income.income_type === "active" ? "text-blue-400" : "text-zinc-400"}`} />
            <span className={`font-medium text-xs ${income.income_type === "active" ? "text-white" : "text-zinc-400"}`}>
              Activo
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIncome({ ...income, income_type: "passive" })}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
              income.income_type === "passive"
                ? "border-green-500 bg-green-500/20"
                : "border-zinc-700 bg-zinc-800"
            }`}
          >
            <PiggyBank className={`w-5 h-5 ${income.income_type === "passive" ? "text-green-400" : "text-zinc-400"}`} />
            <span className={`font-medium text-xs ${income.income_type === "passive" ? "text-white" : "text-zinc-400"}`}>
              Pasivo
            </span>
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-2 block">Es recurrente?</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIncome({ ...income, is_recurring: true })}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
              income.is_recurring
                ? "border-purple-500 bg-purple-500/20"
                : "border-zinc-700 bg-zinc-800"
            }`}
          >
            <RefreshCcw className={`w-5 h-5 ${income.is_recurring ? "text-purple-400" : "text-zinc-400"}`} />
            <span className={`font-medium text-xs ${income.is_recurring ? "text-white" : "text-zinc-400"}`}>
              Si
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIncome({ ...income, is_recurring: false })}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
              !income.is_recurring
                ? "border-zinc-500 bg-zinc-700"
                : "border-zinc-700 bg-zinc-800"
            }`}
          >
            <X className={`w-5 h-5 ${!income.is_recurring ? "text-white" : "text-zinc-400"}`} />
            <span className={`font-medium text-xs ${!income.is_recurring ? "text-white" : "text-zinc-400"}`}>
              No
            </span>
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Vincular a Inversion</label>
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
                {getInvestmentLabel(income.investment_id)}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500 ml-auto" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Vincular a Inversion</DialogTitle>
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
                  <X className="w-4 h-4 text-zinc-400" />
                </div>
                <span className="text-zinc-400 font-medium">Sin vincular</span>
              </button>

              {(investments || []).map((inv: any) => (
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
                <span className="text-emerald-400 font-medium">Crear nueva inversion</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Vincular a Patrimonio</label>
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
                <Home className={`w-4 h-4 ${income.patrimony_id !== "none" ? "text-sky-400" : "text-zinc-400"}`} />
              </div>
              <span className={`font-medium ${income.patrimony_id !== "none" ? "text-sky-400" : "text-zinc-400"}`}>
                {getPatrimonyLabel(income.patrimony_id)}
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
                  <X className="w-4 h-4 text-zinc-400" />
                </div>
                <span className="text-zinc-400 font-medium">Sin vincular</span>
              </button>

              {(patrimony || []).map((pat: any) => (
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
                    <Home className="w-4 h-4 text-sky-400" />
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

      <Button
        onClick={onSubmit}
        className="w-full bg-green-500 hover:bg-green-600 text-black text-sm py-4"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Guardando..." : isNew ? "Guardar" : "Guardar cambios"}
      </Button>

      <Dialog open={isNewInvestmentOpen} onOpenChange={setIsNewInvestmentOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Nueva Inversion</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Nombre</label>
              <Input
                value={newInvestment.name}
                onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Tipo</label>
              <Select value={newInvestment.type} onValueChange={(v) => setNewInvestment({ ...newInvestment, type: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {investmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white">{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Valor inicial</label>
                <Input
                  type="number"
                  value={newInvestment.initial_value}
                  onChange={(e) => setNewInvestment({ ...newInvestment, initial_value: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Valor actual</label>
                <Input
                  type="number"
                  value={newInvestment.current_value}
                  onChange={(e) => setNewInvestment({ ...newInvestment, current_value: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
            </div>
            <Button onClick={handleCreateInvestment} className="w-full bg-emerald-500 hover:bg-emerald-600 text-black">
              Crear
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewPatrimonyOpen} onOpenChange={setIsNewPatrimonyOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Nuevo Patrimonio</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Nombre</label>
              <Input
                value={newPatrimonyAsset.name}
                onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, name: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Categoria</label>
              <Select value={newPatrimonyAsset.category} onValueChange={(v) => setNewPatrimonyAsset({ ...newPatrimonyAsset, category: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {patrimonyCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white">{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Valor</label>
              <Input
                type="number"
                value={newPatrimonyAsset.value}
                onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, value: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white text-sm"
              />
            </div>
            <Button onClick={handleCreatePatrimony} className="w-full bg-sky-500 hover:bg-sky-600 text-white">
              Crear
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncomePage;