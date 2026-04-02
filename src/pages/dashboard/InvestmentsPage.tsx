"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TrendingUp, TrendingDown, BarChart3, PieChart, Laptop, Home, Briefcase, Film, Coins, MoreHorizontal, Pencil, Trash2, X, Landmark, DollarSign, TrendingUpIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { formatCurrency } from "@/utils/currency";

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

  const [newInvestment, setNewInvestment] = useState({
    name: "",
    investment_type: "revalorization",
    category: "digital",
    initial_value: "",
    current_value: "",
    monthly_contribution: "",
    loan_id: "none",
    patrimony_id: "none",
    capital_breakdown: "",
  });

  const [editInvestment, setEditInvestment] = useState({
    id: "",
    name: "",
    investment_type: "revalorization",
    category: "digital",
    initial_value: "",
    current_value: "",
    monthly_contribution: "",
    loan_id: "none",
    patrimony_id: "none",
    capital_breakdown: "",
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
      supabase.from("incomes").select("id, amount, description, investment_id").eq("user_id", userId).order("created_at", { ascending: false }),
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

  const getLoanLabel = (id: string) => {
    if (id === "none") return "Sin vincular";
    return loans.find((loan) => loan.id === id)?.borrower_name || "Sin vincular";
  };

  const getPatrimonyLabel = (id: string) => {
    if (id === "none") return "Sin vincular";
    return patrimony.find((asset) => asset.id === id)?.name || "Sin vincular";
  };

  const handleAddInvestment = async () => {
    if (!newInvestment.name || !newInvestment.initial_value) {
      setError("Completa los campos obligatorios");
      return;
    }

    if (newInvestment.investment_type === "revalorization" && !newInvestment.current_value) {
      setError("El valor actual es obligatorio para inversiones de revalorización");
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
    // Si es generadora de ingresos, el valor actual es igual al inicial para evitar error de base de datos
    const current = newInvestment.investment_type === "revalorization" 
      ? normalizeNumber(newInvestment.current_value) 
      : initial;
    
    // Calcular retorno inicial
    const initialReturn = newInvestment.investment_type === "revalorization"
      ? current - initial
      : 0;

    const { error } = await supabase.from("investments").insert({
      user_id: session.user.id,
      name: newInvestment.name,
      type: newInvestment.category,
      investment_type: newInvestment.investment_type,
      initial_value: initial,
      current_value: current,
      return_amount: initialReturn,
      return_percentage: initial > 0 ? (initialReturn / initial) * 100 : 0,
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
      initial_value: "",
      current_value: "",
      monthly_contribution: "",
      loan_id: "none",
      patrimony_id: "none",
      capital_breakdown: "",
    });

    await fetchInvestments(session.user.id);
    await fetchRelations(session.user.id);
    setSaving(false);
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
    // Si es generadora de ingresos, el valor actual es igual al inicial para evitar error de base de datos
    const current = editInvestment.investment_type === "revalorization"
      ? normalizeNumber(editInvestment.current_value)
      : initial;

    // Recalcular retorno basado en tipo
    const calculatedReturn = editInvestment.investment_type === "revalorization"
      ? current - initial
      : getLinkedIncomeTotal(selectedInvestment.id);

    const { error } = await supabase.from("investments").update({
      name: editInvestment.name,
      type: editInvestment.category,
      investment_type: editInvestment.investment_type,
      initial_value: initial,
      current_value: current,
      return_amount: calculatedReturn,
      return_percentage: initial > 0 ? (calculatedReturn / initial) * 100 : 0,
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
  };

  const openEditDialog = (inv: any) => {
    setSelectedInvestment(inv);
    setEditInvestment({
      id: inv.id,
      name: inv.name || "",
      investment_type: inv.investment_type || "revalorization",
      category: inv.type || "digital",
      initial_value: inv.initial_value?.toString() || "",
      current_value: inv.current_value?.toString() || "",
      monthly_contribution: inv.monthly_contribution?.toString() || "",
      loan_id: inv.loan_id || "none",
      patrimony_id: inv.patrimony_id || "none",
      capital_breakdown: typeof inv.capital_breakdown === "string"
        ? inv.capital_breakdown
        : inv.capital_breakdown?.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  // Obtener ingresos asociados a una inversión
  const getLinkedIncomeTotal = (investmentId: string) => {
    return incomes
      .filter(inc => inc.investment_id === investmentId)
      .reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
  };

  // Calcular retorno de una inversión según su tipo
  const getInvestmentReturn = (inv: any) => {
    if (inv.investment_type === "income") {
      // Para inversiones generadoras de ingresos, sumar todos los ingresos asociados
      return getLinkedIncomeTotal(inv.id);
    }
    // Para inversiones de revalorización
    const current = parseFloat(inv.current_value || 0);
    const initial = parseFloat(inv.initial_value || 0);
    return current - initial;
  };

  // Calcular ROI de una inversión según su tipo
  const getInvestmentROI = (inv: any) => {
    const initial = parseFloat(inv.initial_value || 0);
    if (initial <= 0) return 0;
    
    const returnAmount = getInvestmentReturn(inv);
    return (returnAmount / initial) * 100;
  };

  // Calculos para las tarjetas de resumen
  const totalValue = investments.reduce((sum, inv) => {
    if (inv.investment_type === "revalorization") {
      return sum + parseFloat(inv.current_value || 0);
    }
    // Para inversiones de ingresos, mostrar inversión inicial + ingresos acumulados
    return sum + parseFloat(inv.initial_value || 0) + getLinkedIncomeTotal(inv.id);
  }, 0);

  const totalInitial = investments.reduce((sum, i) => sum + parseFloat(i.initial_value || 0), 0);
  
  // Retorno total: suma de todos los retornos individuales
  const totalReturn = investments.reduce((sum, inv) => sum + getInvestmentReturn(inv), 0);
  
  // ROI total: retorno total / inversión inicial total
  const roi = totalInitial > 0 ? (totalReturn / totalInitial) * 100 : 0;

  const getCategoryInfo = (categoryValue: string) => investmentCategories.find((c) => c.value === categoryValue) || investmentCategories[investmentCategories.length - 1];

  const getTypeInfo = (typeValue: string) => INVESTMENT_TYPES.find(t => t.value === typeValue) || INVESTMENT_TYPES[0];

  return (
    <div className="min-h-screen bg-black pb-28">
      <DashboardHeader title="FinPro" subtitle="Gestión de Inversiones" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Inversiones</h1>
          <p className="text-purple-400 text-sm">Gestiona tu portafolio</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><BarChart3 className="w-6 h-6 mx-auto mb-2 text-purple-400" /><p className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</p><p className="text-xs text-zinc-400">Valor Total</p></CardContent></Card>
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center">{totalReturn >= 0 ? <TrendingUp className="w-6 h-6 mx-auto mb-2 text-emerald-400" /> : <TrendingDown className="w-6 h-6 mx-auto mb-2 text-rose-400" />}<p className={`text-2xl font-bold ${totalReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{totalReturn >= 0 ? "+" : ""}{formatCurrency(totalReturn)}</p><p className="text-xs text-zinc-400">Retorno Total</p></CardContent></Card>
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><PieChart className="w-6 h-6 mx-auto mb-2 text-blue-400" /><p className={`text-2xl font-bold ${roi >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{roi >= 0 ? "+" : ""}{roi.toFixed(1)}%</p><p className="text-xs text-zinc-400">ROI</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUpIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Revalorización</p>
                <p className="text-lg font-bold text-white">
                  {investments.filter(i => i.investment_type === "revalorization").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Generadoras</p>
                <p className="text-lg font-bold text-white">
                  {investments.filter(i => i.investment_type === "income").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-base font-semibold rounded-xl mb-4">
              <Plus className="w-5 h-5 mr-2" />Nueva Inversión
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Agregar Inversión</DialogTitle>
            </DialogHeader>
            <button onClick={() => setIsDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white">
              <X className="w-4 h-4" />
            </button>

            <InvestmentForm
              mode="create"
              data={newInvestment}
              setData={setNewInvestment}
              loans={loans}
              patrimony={patrimony}
              getLoanLabel={getLoanLabel}
              getPatrimonyLabel={getPatrimonyLabel}
            />

            {error && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button onClick={handleAddInvestment} className="w-full bg-purple-500 hover:bg-purple-600 mt-4" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogContent>
        </Dialog>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-400" />Mi Portafolio</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (<p className="text-zinc-400 text-center">Cargando...</p>) : investments.length === 0 ? (<p className="text-zinc-400 text-center">No hay inversiones</p>) : (
              <div className="space-y-3">
                {investments.map((inv) => {
                  const cat = getCategoryInfo(inv.type);
                  const typeInfo = getTypeInfo(inv.investment_type);
                  const Icon = cat.icon;
                  const returnVal = getInvestmentReturn(inv);
                  const returnPct = getInvestmentROI(inv);
                  const linkedIncomeTotal = getLinkedIncomeTotal(inv.id);
                  const relatedLoan = inv.loan_id ? loans.find((loan) => loan.id === inv.loan_id) : null;
                  const relatedPatrimony = inv.patrimony_id ? patrimony.find((asset) => asset.id === inv.patrimony_id) : null;

                  return (
                    <div key={inv.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}><Icon className="w-6 h-6" /></div>
                        <div>
                          <p className="font-medium text-white">{inv.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${inv.investment_type === "income" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                              {typeInfo.label}
                            </span>
                            <span className="text-xs text-zinc-500">{cat.label}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {relatedLoan && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
                                Préstamo: {relatedLoan.borrower_name}
                              </span>
                            )}
                            {relatedPatrimony && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400">
                                Patrimonio: {relatedPatrimony.name}
                              </span>
                            )}
                            {inv.investment_type === "income" && linkedIncomeTotal > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                                Ingresos: {formatCurrency(linkedIncomeTotal)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-white">
                            {inv.investment_type === "income" 
                              ? formatCurrency(parseFloat(inv.initial_value || 0) + linkedIncomeTotal)
                              : formatCurrency(inv.current_value)
                            }
                          </p>
                          <p className={`text-xs ${returnVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {returnVal >= 0 ? "+" : ""}{returnPct.toFixed(1)}%
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => openEditDialog(inv)} className="p-2 rounded-lg hover:bg-zinc-700"><Pencil className="w-4 h-4 text-zinc-400" /></button>
                          <button onClick={() => { setSelectedInvestment(inv); setIsDeleteDialogOpen(true); }} className="p-2 rounded-lg hover:bg-red-500/20"><Trash2 className="w-4 h-4 text-red-400" /></button>
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
          <DialogHeader><DialogTitle className="text-white">Editar Inversión</DialogTitle></DialogHeader>
          <button onClick={() => setIsEditDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>

          <InvestmentForm
            mode="edit"
            data={editInvestment}
            setData={setEditInvestment}
            loans={loans}
            patrimony={patrimony}
            getLoanLabel={getLoanLabel}
            getPatrimonyLabel={getPatrimonyLabel}
          />

          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button onClick={handleEditInvestment} className="w-full bg-purple-500 hover:bg-purple-600 mt-4" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Eliminar Inversión</DialogTitle></DialogHeader>
          <button onClick={() => setIsDeleteDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300">¿Eliminar esta inversión?</p>
            {selectedInvestment && (<div className="p-4 bg-zinc-800/50 rounded-xl"><p className="text-white font-medium">{selectedInvestment.name}</p><p className="text-purple-400 font-bold">{formatCurrency(selectedInvestment.current_value || selectedInvestment.initial_value)}</p></div>)}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800">Cancelar</Button>
              <Button onClick={handleDeleteInvestment} className="flex-1 bg-red-500 hover:bg-red-600">Eliminar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

type InvestmentFormProps = {
  mode: "create" | "edit";
  data: any;
  setData: (data: any) => void;
  loans: any[];
  patrimony: any[];
  getLoanLabel: (id: string) => string;
  getPatrimonyLabel: (id: string) => string;
};

const InvestmentForm = ({
  data,
  setData,
  loans,
  patrimony,
  getLoanLabel,
  getPatrimonyLabel,
}: InvestmentFormProps) => {
  const isRevalorization = data.investment_type === "revalorization";

  return (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Nombre *</label>
        <Input
          placeholder="Nombre de la inversión"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Tipo de inversión *</label>
        <div className="grid grid-cols-2 gap-2">
          {INVESTMENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setData({ ...data, investment_type: type.value, current_value: type.value === "income" ? "" : data.current_value })}
              className={`p-3 rounded-xl border transition-all ${
                data.investment_type === type.value
                  ? type.value === "income"
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-emerald-500 bg-emerald-500/10"
                  : "border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800"
              }`}
            >
              <p className={`text-sm font-medium ${data.investment_type === type.value ? "text-white" : "text-zinc-400"}`}>
                {type.label}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Categoría</label>
        <Select value={data.category} onValueChange={(v) => setData({ ...data, category: v })}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            {investmentCategories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value} className="text-white">
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Valor inicial (€) *</label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={data.initial_value}
          onChange={(e) => setData({ ...data, initial_value: e.target.value })}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      {isRevalorization && (
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Valor actual (€) *</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={data.current_value}
            onChange={(e) => setData({ ...data, current_value: e.target.value })}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
      )}

      {!isRevalorization && (
        <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <p className="text-sm text-amber-400">💡 Los ingresos se registran desde la sección de Ingresos y se vinculan automáticamente a esta inversión.</p>
        </div>
      )}

      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Aportación mensual</label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={data.monthly_contribution}
          onChange={(e) => setData({ ...data, monthly_contribution: e.target.value })}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Vincular a préstamo</label>
        <Select value={data.loan_id} onValueChange={(v) => setData({ ...data, loan_id: v })}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Sin vincular" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="none" className="text-white">Sin vincular</SelectItem>
            {loans.map((loan) => (
              <SelectItem key={loan.id} value={loan.id} className="text-white">
                {loan.borrower_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Vincular a patrimonio</label>
        <Select value={data.patrimony_id} onValueChange={(v) => setData({ ...data, patrimony_id: v })}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Sin vincular" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="none" className="text-white">Sin vincular</SelectItem>
            {patrimony.map((asset) => (
              <SelectItem key={asset.id} value={asset.id} className="text-white">
                {asset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Detalle adicional</label>
        <Input
          placeholder="Notas opcionales"
          value={data.capital_breakdown}
          onChange={(e) => setData({ ...data, capital_breakdown: e.target.value })}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      {(data.loan_id !== "none" || data.patrimony_id !== "none") && (
        <div className="grid grid-cols-1 gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          <p className="text-xs text-zinc-500">Relaciones actuales</p>
          <p className="text-sm text-zinc-200">Préstamo: {getLoanLabel(data.loan_id)}</p>
          <p className="text-sm text-zinc-200">Patrimonio: {getPatrimonyLabel(data.patrimony_id)}</p>
        </div>
      )}
    </div>
  );
};

export default InvestmentsPage;