"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Laptop, 
  Home, 
  Briefcase, 
  Film, 
  Coins, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  X, 
  Landmark, 
  DollarSign, 
  ListChecks, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX, 
  PlusCircle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { formatCurrency } from "@/utils/currency";
import { useInvestmentMetrics, InvestmentMetrics } from "@/hooks/useInvestmentMetrics";
import { generateInsights, Insight } from "@/utils/investmentInsights";
import { InvestmentMetricsCard } from "@/components/InvestmentMetricsCard";
import { InvestmentInsights } from "@/components/InvestmentInsights";
import { toast } from "sonner";

interface CategoryOption {
  value: string;
  label: string;
  icon: any;
  color: string;
  textColor: string;
}

const investmentCategories: CategoryOption[] = [
  { value: "digital", label: "Digital", icon: Laptop, color: "bg-blue-500/20", textColor: "text-blue-400" },
  { value: "inmuebles", label: "Inmuebles", icon: Home, color: "bg-emerald-500/20", textColor: "text-emerald-400" },
  { value: "bolsa", label: "Bolsa", icon: BarChart3, color: "bg-purple-500/20", textColor: "text-purple-400" },
  { value: "negocio", label: "Negocio", icon: Briefcase, color: "bg-amber-500/20", textColor: "text-amber-400" },
  { value: "contenido", label: "Contenido", icon: Film, color: "bg-rose-500/20", textColor: "text-rose-400" },
  { value: "oro", label: "Oro", icon: Coins, color: "bg-yellow-500/20", textColor: "text-yellow-400" },
  { value: "crypto", label: "Crypto", icon: Landmark, color: "bg-orange-500/20", textColor: "text-orange-400" },
  { value: "otros", label: "Otros", icon: MoreHorizontal, color: "bg-zinc-500/20", textColor: "text-zinc-400" },
];

const INVESTMENT_TYPES = [
  { value: "revalorization", label: "Revalorización", description: "Inmuebles, acciones, crypto..." },
  { value: "income", label: "Generadora de ingresos", description: "Negocios, alquileres, side projects..." },
];

const RISK_LEVELS = [
  { value: "bajo", label: "Bajo", description: "Depósitos, bonos, bienes raíces estables", icon: ShieldCheck, color: "text-emerald-400", bgColor: "bg-emerald-500/20", borderColor: "border-emerald-500/30" },
  { value: "medio", label: "Medio", description: "Fondos indexados, ETFs, negocios establecidos", icon: ShieldAlert, color: "text-amber-400", bgColor: "bg-amber-500/20", borderColor: "border-amber-500/30" },
  { value: "alto", label: "Alto", description: "Crypto, acciones individuales, startups", icon: ShieldX, color: "text-rose-400", bgColor: "bg-rose-500/20", borderColor: "border-rose-500/30" },
];

const InvestmentsPage = () => {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [selectedInvestmentForIncome, setSelectedInvestmentForIncome] = useState<any>(null);
  const [newIncome, setNewIncome] = useState({ description: "", amount: "", date: new Date() });

  const [newInvestment, setNewInvestment] = useState({
    name: "",
    investment_type: "revalorization",
    category: "digital",
    risk_level: "medio",
    initial_value: "",
    current_value: "",
    monthly_contribution: "",
    loan_id: "none",
    patrimony_id: "none",
    capital_breakdown: "",
    start_date: new Date(),
  });

  const [editInvestment, setEditInvestment] = useState({
    id: "",
    name: "",
    investment_type: "revalorization",
    category: "digital",
    risk_level: "medio",
    initial_value: "",
    current_value: "",
    monthly_contribution: "",
    loan_id: "none",
    patrimony_id: "none",
    capital_breakdown: "",
    start_date: new Date(),
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    await Promise.all([
      fetchInvestments(session.user.id),
      fetchRelations(session.user.id),
    ]);
  };

  const fetchRelations = async (userId: string) => {
    const [loansResult, patrimonyResult, incomesResult] = await Promise.all([
      supabase.from("loans").select("id, borrower_name").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("patrimony").select("id, name").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("incomes")
        .select("id, amount, description, investment_id")
        .eq("user_id", userId)
        .not("investment_id", "is", null),
    ]);

    if (loansResult.data) setLoans(loansResult.data);
    if (patrimonyResult.data) setPatrimony(patrimonyResult.data);
    if (incomesResult.data) setIncomes(incomesResult.data);
  };

  const fetchInvestments = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setInvestments(data);
    setLoading(false);
  };

  const normalizeNumber = (value: string) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const toNullableNumber = (value: string) => {
    if (!value.trim()) return null;
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

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

  const handleAddInvestment = async () => {
    if (!newInvestment.name || !newInvestment.initial_value) {
      setError("Completa los campos obligatorios");
      return;
    }

    setSaving(true);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSaving(false);
      return;
    }

    const initial = normalizeNumber(newInvestment.initial_value);
    const current = newInvestment.investment_type === "revalorization" 
      ? normalizeNumber(newInvestment.current_value || newInvestment.initial_value) 
      : initial;
    
    const { error } = await supabase.from("investments").insert({
      user_id: session.user.id,
      name: newInvestment.name,
      type: newInvestment.category,
      investment_type: newInvestment.investment_type,
      risk_level: newInvestment.risk_level,
      initial_value: initial,
      current_value: current,
      start_date: formatDateToISO(newInvestment.start_date),
      monthly_contribution: toNullableNumber(newInvestment.monthly_contribution),
      loan_id: newInvestment.loan_id === "none" ? null : newInvestment.loan_id,
      patrimony_id: newInvestment.patrimony_id === "none" ? null : newInvestment.patrimony_id,
      capital_breakdown: newInvestment.capital_breakdown.trim() ? { notes: newInvestment.capital_breakdown.trim() } : null,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setIsDialogOpen(false);
    setNewInvestment({
      name: "",
      investment_type: "revalorization",
      category: "digital",
      risk_level: "medio",
      initial_value: "",
      current_value: "",
      monthly_contribution: "",
      loan_id: "none",
      patrimony_id: "none",
      capital_breakdown: "",
      start_date: new Date(),
    });

    await fetchInvestments(session.user.id);
    await fetchRelations(session.user.id);
    setSaving(false);
    toast.success("Inversión añadida correctamente");
  };

  const handleEditInvestment = async () => {
    if (!selectedInvestment) return;

    setSaving(true);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSaving(false);
      return;
    }

    const initial = normalizeNumber(editInvestment.initial_value);
    const current = editInvestment.investment_type === "revalorization"
      ? normalizeNumber(editInvestment.current_value || editInvestment.initial_value)
      : initial;

    const { error } = await supabase.from("investments").update({
      name: editInvestment.name,
      type: editInvestment.category,
      investment_type: editInvestment.investment_type,
      risk_level: editInvestment.risk_level,
      initial_value: initial,
      current_value: current,
      start_date: formatDateToISO(editInvestment.start_date),
      monthly_contribution: toNullableNumber(editInvestment.monthly_contribution),
      loan_id: editInvestment.loan_id === "none" ? null : editInvestment.loan_id,
      patrimony_id: editInvestment.patrimony_id === "none" ? null : editInvestment.patrimony_id,
      capital_breakdown: editInvestment.capital_breakdown.trim() ? { notes: editInvestment.capital_breakdown.trim() } : null,
    }).eq("id", selectedInvestment.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setIsEditDialogOpen(false);
    setSelectedInvestment(null);
    await fetchInvestments(session.user.id);
    await fetchRelations(session.user.id);
    setSaving(false);
    toast.success("Inversión actualizada");
  };

  const handleDeleteInvestment = async () => {
    if (!selectedInvestment) return;
    await supabase.from("investments").delete().eq("id", selectedInvestment.id);
    setIsDeleteDialogOpen(false);
    setSelectedInvestment(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetchInvestments(session.user.id);
      await fetchRelations(session.user.id);
    }
    toast.success("Inversión eliminada");
  };

  const openEditDialog = (inv: any) => {
    setSelectedInvestment(inv);
    setEditInvestment({
      id: inv.id,
      name: inv.name || "",
      investment_type: inv.investment_type || "revalorization",
      category: inv.type || "digital",
      risk_level: inv.risk_level || "medio",
      initial_value: inv.initial_value?.toString() || "",
      current_value: inv.current_value?.toString() || "",
      monthly_contribution: inv.monthly_contribution?.toString() || "",
      loan_id: inv.loan_id || "none",
      patrimony_id: inv.patrimony_id || "none",
      capital_breakdown: typeof inv.capital_breakdown === "string"
        ? inv.capital_breakdown
        : inv.capital_breakdown?.notes || "",
      start_date: safeDate(inv.start_date),
    });
    setIsEditDialogOpen(true);
  };

  const getCategoryInfo = (categoryValue: string) => investmentCategories.find((c) => c.value === categoryValue) || investmentCategories[investmentCategories.length - 1];
  const getTypeInfo = (typeValue: string) => INVESTMENT_TYPES.find(t => t.value === typeValue) || INVESTMENT_TYPES[0];
  const getRiskInfo = (riskValue: string) => RISK_LEVELS.find(r => r.value === riskValue) || RISK_LEVELS[1];

  // Use the new metrics hook
  const portfolioMetrics = useInvestmentMetrics(investments, incomes);
  
  // Generate insights when portfolio metrics change
  useEffect(() => {
    const allInsights = generateInsights(portfolioMetrics, investments);
    const filteredInsights = allInsights.filter(i => !dismissedInsights.includes(i.id));
    setInsights(filteredInsights);
  }, [portfolioMetrics, dismissedInsights, investments]);

  const handleDismissInsight = (id: string) => {
    setDismissedInsights(prev => [...prev, id]);
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  const handleInsightAction = (insight: Insight) => {
    if (insight.investmentId) {
      const inv = investments.find(i => i.id === insight.investmentId);
      if (inv && inv.investment_type === 'income') {
        setSelectedInvestmentForIncome(inv);
        setIsIncomeDialogOpen(true);
      }
    }
  };

  const handleCreateIncomeForInvestment = async () => {
    if (!selectedInvestmentForIncome || !newIncome.amount || !newIncome.description) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error: incomeError } = await supabase.from("incomes").insert({
      user_id: session.user.id,
      description: newIncome.description,
      amount: parseFloat(newIncome.amount),
      category: "inversion",
      date: formatDateToISO(newIncome.date),
      investment_id: selectedInvestmentForIncome.id,
      is_passive: true,
      is_recurring: false,
    });

    if (!incomeError) {
      setIsIncomeDialogOpen(false);
      setNewIncome({ description: "", amount: "", date: new Date() });
      setSelectedInvestmentForIncome(null);
      // Refresh data
      await fetchInvestments(session.user.id);
      await fetchRelations(session.user.id);
      toast.success("Ingreso vinculado correctamente");
    } else {
      toast.error("Error al vincular ingreso");
    }
  };

  return (
    <div className="min-h-screen bg-black pb-28">
      <DashboardHeader title="FinPro" subtitle="Gestión de Inversiones" />
      
      <div className="container mx-auto px-4 py-6">
        {/* Insights Panel */}
        {insights.length > 0 && (
          <div className="mb-6">
            <InvestmentInsights 
              insights={insights} 
              onDismiss={handleDismissInsight}
              onAction={handleInsightAction}
            />
          </div>
        )}

        {/* Resumen del Portfolio */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-2 sm:p-4 text-center overflow-hidden">
              <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-purple-400" />
              <p className="text-[10px] xs:text-xs sm:text-lg md:text-xl font-bold text-white truncate" title={formatCurrency(portfolioMetrics.totalPortfolioValue)}>
                {formatCurrency(portfolioMetrics.totalPortfolioValue, false)}
              </p>
              <p className="text-[8px] sm:text-[10px] text-zinc-400 uppercase tracking-wider truncate">Activos</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-2 sm:p-4 text-center overflow-hidden">
              {portfolioMetrics.totalReturn >= 0 ? <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-emerald-400" /> : <TrendingDown className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-rose-400" />}
              <p className={`text-[10px] xs:text-xs sm:text-lg md:text-xl font-bold truncate ${portfolioMetrics.totalReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`} title={formatCurrency(portfolioMetrics.totalReturn)}>
                {portfolioMetrics.totalReturn >= 0 ? "+" : ""}{formatCurrency(portfolioMetrics.totalReturn, false)}
              </p>
              <p className="text-[8px] sm:text-[10px] text-zinc-400 uppercase tracking-wider truncate">Retorno</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-2 sm:p-4 text-center overflow-hidden">
              <PieChart className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-400" />
              <p className={`text-[10px] xs:text-xs sm:text-lg md:text-xl font-bold truncate ${portfolioMetrics.totalROI >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {portfolioMetrics.totalROI >= 0 ? "+" : ""}{portfolioMetrics.totalROI.toFixed(1)}%
              </p>
              <p className="text-[8px] sm:text-[10px] text-zinc-400 uppercase tracking-wider truncate">ROI</p>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-base font-semibold rounded-xl mb-6">
              <Plus className="w-5 h-5 mr-2" />Nueva Inversión
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-white">Agregar Inversión</DialogTitle></DialogHeader>
            <button onClick={() => setIsDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>

            <InvestmentForm
              data={newInvestment}
              setData={setNewInvestment}
              loans={loans}
              patrimony={patrimony}
            />

            {error && <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg"><p className="text-red-400 text-sm">{error}</p></div>}

            <Button onClick={handleAddInvestment} className="w-full bg-purple-500 hover:bg-purple-600 mt-4" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogContent>
        </Dialog>

        {/* Lista de Inversiones */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-zinc-400 text-center py-8">Cargando inversiones...</p>
          ) : portfolioMetrics.processedInvestments.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">No hay inversiones registradas</p>
          ) : (
            portfolioMetrics.processedInvestments.map((inv) => {
              const cat = getCategoryInfo(inv.type);
              const typeInfo = getTypeInfo(inv.investment_type);
              const riskInfo = getRiskInfo(inv.risk_level || 'medio');
              const Icon = cat.icon;
              const RiskIcon = riskInfo.icon;

              return (
                <Card key={inv.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 flex items-center justify-between border-b border-zinc-800/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{inv.name}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${inv.investment_type === "income" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                              {typeInfo.label}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${riskInfo.bgColor} ${riskInfo.color} border ${riskInfo.borderColor}`}>
                              <RiskIcon className="w-3 h-3 inline mr-1" />
                              {riskInfo.label}
                            </span>
                            {inv.incomeCount > 0 && (
                              <span className="text-[10px] text-zinc-500 flex items-center gap-1 truncate">
                                <ListChecks className="w-3 h-3 flex-shrink-0" />
                                {inv.incomeCount} ingresos
                              </span>
                            )}
                            {inv.investment_type === 'income' && inv.incomeCount === 0 && (
                              <button 
                                onClick={() => { setSelectedInvestmentForIncome(inv); setIsIncomeDialogOpen(true); }}
                                className="text-[10px] text-amber-400 flex items-center gap-1 hover:text-amber-300"
                              >
                                <PlusCircle className="w-3 h-3" />
                                Vincular ingreso
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openEditDialog(inv)} className="p-2 rounded-lg hover:bg-zinc-800"><Pencil className="w-4 h-4 text-zinc-500" /></button>
                        <button onClick={() => { setSelectedInvestment(inv); setIsDeleteDialogOpen(true); }} className="p-2 rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4 text-red-400" /></button>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-2 gap-4 bg-zinc-900/50">
                      <div className="min-w-0">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 truncate">Valor Activo</p>
                        <p className="text-base sm:text-lg font-bold text-white truncate" title={formatCurrency(inv.assetValue)}>
                          {formatCurrency(inv.assetValue)}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">Invertido: {formatCurrency(inv.initial_value)}</p>
                      </div>
                      <div className="text-right min-w-0">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 truncate">Beneficio Total</p>
                        <p className={`text-base sm:text-lg font-bold truncate ${inv.retornoTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`} title={formatCurrency(inv.retornoTotal)}>
                          {inv.retornoTotal >= 0 ? "+" : ""}{formatCurrency(inv.retornoTotal)}
                        </p>
                        <p className={`text-[10px] font-medium truncate ${inv.roiTotal >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                          ROI: {inv.roiTotal.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Métricas Avanzadas */}
                    <div className="px-4 pb-4">
                      <InvestmentMetricsCard 
                        metrics={inv as InvestmentMetrics}
                        showPerformanceIndicator={true}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Modales de Edición y Eliminación */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-white">Editar Inversión</DialogTitle></DialogHeader>
          <button onClick={() => setIsEditDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <InvestmentForm data={editInvestment} setData={setEditInvestment} loans={loans} patrimony={patrimony} />
          {error && <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg"><p className="text-red-400 text-sm">{error}</p></div>}
          <Button onClick={handleEditInvestment} className="w-full bg-purple-500 hover:bg-purple-600 mt-4" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Eliminar Inversión</DialogTitle></DialogHeader>
          <button onClick={() => setIsDeleteDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300">¿Eliminar esta inversión? Se perderán los vínculos con ingresos y préstamos.</p>
            {selectedInvestment && (<div className="p-4 bg-zinc-800/50 rounded-xl"><p className="text-white font-medium">{selectedInvestment.name}</p><p className="text-purple-400 font-bold">{formatCurrency(selectedInvestment.assetValue)}</p></div>)}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800">Cancelar</Button>
              <Button onClick={handleDeleteInvestment} className="flex-1 bg-red-500 hover:bg-red-600">Eliminar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para vincular ingreso rápido */}
      <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Vincular Ingreso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-400 text-sm">Registra un ingreso generado por "{selectedInvestmentForIncome?.name}"</p>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Concepto</label>
              <Input 
                placeholder="Ej: Dividendo mensual, Alquiler..." 
                value={newIncome.description}
                onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Importe (€)</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={newIncome.amount}
                onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Fecha</label>
              <DatePicker 
                date={newIncome.date} 
                onDateChange={(d) => setNewIncome({ ...newIncome, date: d || new Date() })} 
              />
            </div>
            <Button onClick={handleCreateIncomeForInvestment} className="w-full bg-emerald-500 hover:bg-emerald-600 text-black">
              Registrar Ingreso
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

const InvestmentForm = ({ data, setData, loans, patrimony }: any) => {
  const isRevalorization = data.investment_type === "revalorization";

  return (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Nombre *</label>
        <Input placeholder="Ej: Apartamento Playa, Cartera Bolsa..." value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Tipo de inversión *</label>
        <div className="grid grid-cols-2 gap-2">
          {INVESTMENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setData({ ...data, investment_type: type.value })}
              className={`p-3 rounded-xl border text-left transition-all ${data.investment_type === type.value ? "border-purple-500 bg-purple-500/10" : "border-zinc-700 bg-zinc-800/50"}`}
            >
              <p className={`text-sm font-medium ${data.investment_type === type.value ? "text-white" : "text-zinc-400"}`}>{type.label}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Categoría</label>
          <Select value={data.category} onValueChange={(v) => setData({ ...data, category: v })}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {investmentCategories.map((cat) => (<SelectItem key={cat.value} value={cat.value} className="text-white">{cat.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Nivel de Riesgo</label>
          <Select value={data.risk_level} onValueChange={(v) => setData({ ...data, risk_level: v })}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {RISK_LEVELS.map((risk) => (
                <SelectItem key={risk.value} value={risk.value} className="text-white">
                  <div className="flex items-center gap-2">
                    <risk.icon className={`w-4 h-4 ${risk.color}`} />
                    {risk.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Inversión Inicial (€) *</label>
          <Input type="number" step="0.01" placeholder="0.00" value={data.initial_value} onChange={(e) => setData({ ...data, initial_value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
        </div>
        {isRevalorization ? (
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Valor Actual (€) *</label>
            <Input type="number" step="0.01" placeholder="0.00" value={data.current_value} onChange={(e) => setData({ ...data, current_value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
        ) : (
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Aportación Mensual</label>
            <Input type="number" step="0.01" placeholder="0.00" value={data.monthly_contribution} onChange={(e) => setData({ ...data, monthly_contribution: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Fecha Inicio</label>
          <DatePicker date={data.start_date} onDateChange={(d) => setData({ ...data, start_date: d || new Date() })} />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Vincular Préstamo</label>
          <Select value={data.loan_id} onValueChange={(v) => setData({ ...data, loan_id: v })}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Ninguno" /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="none" className="text-white">Ninguno</SelectItem>
              {loans.map((l) => (<SelectItem key={l.id} value={l.id} className="text-white">{l.borrower_name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Vincular Patrimonio</label>
        <Select value={data.patrimony_id} onValueChange={(v) => setData({ ...data, patrimony_id: v })}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Ninguno" /></SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="none" className="text-white">Ninguno</SelectItem>
            {patrimony.map((p) => (<SelectItem key={p.id} value={p.id} className="text-white">{p.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Notas</label>
        <Input placeholder="Detalles adicionales..." value={data.capital_breakdown} onChange={(e) => setData({ ...data, capital_breakdown: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
      </div>
    </div>
  );
};

export default InvestmentsPage;