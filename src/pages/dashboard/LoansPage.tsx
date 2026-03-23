"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, Landmark, TrendingUp, Building, TrendingDown as TrendingDownIcon, ChevronDown, Pencil, Trash2, Home, Car, Wallet, Briefcase, MoreHorizontal, X, ChevronRight, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

type LoanType = "mortgage" | "car" | "personal" | "business" | "other";

interface LoanTypeOption {
  value: LoanType;
  label: string;
  color: string;
  textColor: string;
  bgColor: string;
  icon: any;
}

const loanTypes: LoanTypeOption[] = [
  { value: "mortgage", label: "Hipoteca", color: "bg-blue-500/20", textColor: "text-blue-400", bgColor: "border-blue-500", icon: Home },
  { value: "car", label: "Coche", color: "bg-purple-500/20", textColor: "text-purple-400", bgColor: "border-purple-500", icon: Car },
  { value: "personal", label: "Personal", color: "bg-cyan-500/20", textColor: "text-cyan-400", bgColor: "border-cyan-500", icon: Wallet },
  { value: "business", label: "Negocio", color: "bg-amber-500/20", textColor: "text-amber-400", bgColor: "border-amber-500", icon: Briefcase },
  { value: "other", label: "Otro", color: "bg-slate-500/20", textColor: "text-slate-400", bgColor: "border-slate-500", icon: MoreHorizontal },
];

const universalFees = [
  { key: "tin", label: "TIN (%)", placeholder: "3.5" },
  { key: "tae", label: "TAE (%)", placeholder: "3.8" },
];

const additionalFees = [
  { key: "opening_commission", label: "Comisión apertura (%)", placeholder: "0.5" },
  { key: "early_repayment", label: "Amortización anticipada (%)", placeholder: "0.5" },
  { key: "delay_interest", label: "Interés demora (%)", placeholder: "4.5" },
];

const specificFees: Record<LoanType, { key: string; label: string; placeholder: string }[]> = {
  mortgage: [
    { key: "subrogation", label: "Comisión subrogación (%)", placeholder: "0.5" },
    { key: "novation", label: "Comisión novación (%)", placeholder: "0.3" },
    { key: "valuation", label: "Gastos tasación (€)", placeholder: "300" },
    { key: "insurance", label: "Seguros obligatorios (€)", placeholder: "150" },
  ],
  car: [
    { key: "cancellation", label: "Comisión cancelación (%)", placeholder: "1" },
  ],
  personal: [
    { key: "delay_interest", label: "Interés demora (%)", placeholder: "4.5" },
  ],
  business: [
    { key: "study", label: "Comisión estudio (%)", placeholder: "1" },
  ],
  other: [],
};

const safeParseDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr) return new Date();
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
  } catch {
    return new Date();
  }
};

const LoansPage = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [showSpecificFees, setShowSpecificFees] = useState(false);
  const [showAdditionalFees, setShowAdditionalFees] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoanTypeDialogOpen, setIsLoanTypeDialogOpen] = useState(false);
  const [isInvestmentDialogOpen, setIsInvestmentDialogOpen] = useState(false);
  const [isPatrimonyDialogOpen, setIsPatrimonyDialogOpen] = useState(false);
  
  const defaultDate = new Date();
  
  const [newLoan, setNewLoan] = useState({
    loan_type: "personal" as LoanType,
    name: "", bank: "", total_amount: "", pending_amount: "", monthly_payment: "", collection_day: "1",
    start_date: defaultDate, end_date: null as Date | null, 
    investment_id: "none", patrimony_id: "none", notes: "",
    tin: "", tae: "", 
    opening_commission: "", early_repayment: "", delay_interest: "",
    subrogation: "", novation: "", valuation: "", insurance: "", cancellation: "", study: "",
  });

  const [editLoan, setEditLoan] = useState({
    id: "",
    loan_type: "personal" as LoanType,
    name: "", bank: "", total_amount: "", pending_amount: "", monthly_payment: "", collection_day: "1",
    start_date: defaultDate, end_date: null as Date | null, 
    investment_id: "none", patrimony_id: "none", notes: "",
    tin: "", tae: "", 
    opening_commission: "", early_repayment: "", delay_interest: "",
    subrogation: "", novation: "", valuation: "", insurance: "", cancellation: "", study: "",
  });

  const [newInvestment, setNewInvestment] = useState({ name: "", type: "stocks", initial_value: "", current_value: "" });
  const [newPatrimonyAsset, setNewPatrimonyAsset] = useState({ name: "", category: "real_estate", value: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/login"); } else { fetchLoans(session.user.id); fetchOptions(session.user.id); }
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
    setLoading(true);
    const { data } = await supabase.from("loans").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data) setLoans(data);
    setLoading(false);
  };

  const validateForm = (loan: any) => {
    const newErrors: Record<string, string> = {};
    
    if (!loan.name || !loan.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    if (!loan.bank || !loan.bank.trim()) {
      newErrors.bank = "El banco es obligatorio";
    }
    if (!loan.total_amount || parseFloat(loan.total_amount) <= 0) {
      newErrors.total_amount = "El importe total es obligatorio";
    }
    if (!loan.pending_amount || parseFloat(loan.pending_amount) <= 0) {
      newErrors.pending_amount = "El capital pendiente es obligatorio";
    }
    if (!loan.monthly_payment || parseFloat(loan.monthly_payment) <= 0) {
      newErrors.monthly_payment = "La cuota mensual es obligatoria";
    }
    if (!loan.collection_day) {
      newErrors.collection_day = "El día de cobro es obligatorio";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateToISO = (date: Date | null): string | null => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAddLoan = async () => {
    if (isSaving) return;
    if (!validateForm(newLoan)) return;
    
    setIsSaving(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsSaving(false);
      return;
    }

    const loanData = {
      user_id: session.user.id,
      borrower_name: newLoan.name.trim(),
      bank: newLoan.bank.trim(),
      initial_amount: parseFloat(newLoan.total_amount),
      current_amount: parseFloat(newLoan.pending_amount),
      interest_rate: newLoan.tin ? parseFloat(newLoan.tin) : null,
      monthly_payment: parseFloat(newLoan.monthly_payment),
      collection_day: newLoan.collection_day ? parseInt(newLoan.collection_day) : 1,
      start_date: formatDateToISO(newLoan.start_date),
      end_date: formatDateToISO(newLoan.end_date),
      opening_commission: newLoan.opening_commission ? parseFloat(newLoan.opening_commission) : null,
      early_repayment: newLoan.early_repayment ? parseFloat(newLoan.early_repayment) : null,
      delay_interest: newLoan.delay_interest ? parseFloat(newLoan.delay_interest) : null,
      subrogation: newLoan.subrogation ? parseFloat(newLoan.subrogation) : null,
      novation: newLoan.novation ? parseFloat(newLoan.novation) : null,
      valuation: newLoan.valuation ? parseFloat(newLoan.valuation) : null,
      insurance: newLoan.insurance ? parseFloat(newLoan.insurance) : null,
      cancellation: newLoan.cancellation ? parseFloat(newLoan.cancellation) : null,
      study: newLoan.study ? parseFloat(newLoan.study) : null,
      notes: newLoan.notes || null,
      loan_type: newLoan.loan_type,
    };

    // Guardar también investment_id y patrimony_id si existen
    if (newLoan.investment_id && newLoan.investment_id !== "none") {
      (loanData as any).investment_id = newLoan.investment_id;
    }
    if (newLoan.patrimony_id && newLoan.patrimony_id !== "none") {
      (loanData as any).patrimony_id = newLoan.patrimony_id;
    }

    const { error } = await supabase.from("loans").insert(loanData);

    if (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar: " + error.message);
    } else {
      setIsDialogOpen(false);
      setNewLoan({
        loan_type: "personal", name: "", bank: "", total_amount: "", pending_amount: "", monthly_payment: "", collection_day: "1",
        start_date: new Date(), end_date: null, investment_id: "none", patrimony_id: "none", notes: "",
        tin: "", tae: "", opening_commission: "", early_repayment: "", delay_interest: "",
        subrogation: "", novation: "", valuation: "", insurance: "", cancellation: "", study: "",
      });
      setErrors({});
      setShowAdditionalFees(false);
      setShowSpecificFees(false);
      fetchLoans(session.user.id);
    }
    
    setIsSaving(false);
  };

  const handleEditLoan = async () => {
    if (isSaving || !selectedLoan) return;
    if (!validateForm(editLoan)) return;
    
    setIsSaving(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsSaving(false);
      return;
    }

    const loanData = {
      borrower_name: editLoan.name.trim(),
      bank: editLoan.bank.trim(),
      initial_amount: parseFloat(editLoan.total_amount),
      current_amount: parseFloat(editLoan.pending_amount),
      interest_rate: editLoan.tin ? parseFloat(editLoan.tin) : null,
      monthly_payment: parseFloat(editLoan.monthly_payment),
      collection_day: editLoan.collection_day ? parseInt(editLoan.collection_day) : 1,
      start_date: formatDateToISO(editLoan.start_date),
      end_date: formatDateToISO(editLoan.end_date),
      opening_commission: editLoan.opening_commission ? parseFloat(editLoan.opening_commission) : null,
      early_repayment: editLoan.early_repayment ? parseFloat(editLoan.early_repayment) : null,
      delay_interest: editLoan.delay_interest ? parseFloat(editLoan.delay_interest) : null,
      subrogation: editLoan.subrogation ? parseFloat(editLoan.subrogation) : null,
      novation: editLoan.novation ? parseFloat(editLoan.novation) : null,
      valuation: editLoan.valuation ? parseFloat(editLoan.valuation) : null,
      insurance: editLoan.insurance ? parseFloat(editLoan.insurance) : null,
      cancellation: editLoan.cancellation ? parseFloat(editLoan.cancellation) : null,
      study: editLoan.study ? parseFloat(editLoan.study) : null,
      notes: editLoan.notes || null,
      loan_type: editLoan.loan_type,
    };

    // Guardar también investment_id y patrimony_id si existen
    if (editLoan.investment_id && editLoan.investment_id !== "none") {
      (loanData as any).investment_id = editLoan.investment_id;
    } else {
      (loanData as any).investment_id = null;
    }
    if (editLoan.patrimony_id && editLoan.patrimony_id !== "none") {
      (loanData as any).patrimony_id = editLoan.patrimony_id;
    } else {
      (loanData as any).patrimony_id = null;
    }

    const { error } = await supabase.from("loans").update(loanData).eq("id", selectedLoan.id);

    if (error) {
      console.error("Error al editar:", error);
      alert("Error al editar: " + error.message);
    } else {
      setIsEditDialogOpen(false);
      setSelectedLoan(null);
      fetchLoans(session.user.id);
    }
    
    setIsSaving(false);
  };

  const handleDeleteLoan = async () => {
    if (!selectedLoan) return;
    
    const { error } = await supabase.from("loans").delete().eq("id", selectedLoan.id);

    if (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar: " + error.message);
    } else {
      setIsDeleteDialogOpen(false);
      setSelectedLoan(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchLoans(session.user.id);
      }
    }
  };

  const openEditDialog = (loan: any) => {
    setSelectedLoan(loan);
    // Obtener los valores de investment_id y patrimony_id del préstamo
    const loanInvestmentId = loan.investment_id || "none";
    const loanPatrimonyId = loan.patrimony_id || "none";
    
    setEditLoan({
      id: loan.id,
      loan_type: loan.loan_type || "personal",
      name: loan.borrower_name || "",
      bank: loan.bank || "",
      total_amount: loan.initial_amount?.toString() || "",
      pending_amount: loan.current_amount?.toString() || "",
      monthly_payment: loan.monthly_payment?.toString() || "",
      collection_day: loan.collection_day?.toString() || "1",
      start_date: safeParseDate(loan.start_date),
      end_date: loan.end_date ? safeParseDate(loan.end_date) : null,
      investment_id: loanInvestmentId,
      patrimony_id: loanPatrimonyId,
      notes: loan.notes || "",
      tin: loan.interest_rate?.toString() || "",
      tae: "",
      opening_commission: loan.opening_commission?.toString() || "",
      early_repayment: loan.early_repayment?.toString() || "",
      delay_interest: loan.delay_interest?.toString() || "",
      subrogation: loan.subrogation?.toString() || "",
      novation: loan.novation?.toString() || "",
      valuation: loan.valuation?.toString() || "",
      insurance: loan.insurance?.toString() || "",
      cancellation: loan.cancellation?.toString() || "",
      study: loan.study?.toString() || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (loan: any) => {
    setSelectedLoan(loan);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateInvestment = async (forEdit: boolean = false) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !newInvestment.name || !newInvestment.initial_value) return;
    const { data, error } = await supabase.from("investments").insert({
      user_id: session.user.id, name: newInvestment.name, type: newInvestment.type,
      initial_value: parseFloat(newInvestment.initial_value),
      current_value: parseFloat(newInvestment.current_value) || parseFloat(newInvestment.initial_value),
    }).select().single();
    if (!error && data) {
      setInvestments([...investments, { id: data.id, name: data.name }]);
      if (forEdit) {
        setEditLoan({ ...editLoan, investment_id: data.id });
      } else {
        setNewLoan({ ...newLoan, investment_id: data.id });
      }
      setIsNewInvestmentOpen(false);
      setNewInvestment({ name: "", type: "stocks", initial_value: "", current_value: "" });
    }
  };

  const handleCreatePatrimony = async (forEdit: boolean = false) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !newPatrimonyAsset.name || !newPatrimonyAsset.value) return;
    const { data, error } = await supabase.from("patrimony").insert({
      user_id: session.user.id, name: newPatrimonyAsset.name, category: newPatrimonyAsset.category, value: parseFloat(newPatrimonyAsset.value),
    }).select().single();
    if (!error && data) {
      setPatrimony([...patrimony, { id: data.id, name: data.name }]);
      if (forEdit) {
        setEditLoan({ ...editLoan, patrimony_id: data.id });
      } else {
        setNewLoan({ ...newLoan, patrimony_id: data.id });
      }
      setIsNewPatrimonyOpen(false);
      setNewPatrimonyAsset({ name: "", category: "real_estate", value: "" });
    }
  };

  const activeLoans = loans.filter(l => l.status === "active");
  const settledLoans = loans.filter(l => l.status === "settled");
  const totalDebt = activeLoans.reduce((sum, l) => sum + parseFloat(l.current_amount), 0);
  const totalMonthly = activeLoans.reduce((sum, l) => sum + parseFloat(l.monthly_payment || 0), 0);

  const getInvestmentLabel = (loan: any) => {
    const invId = loan.investment_id;
    if (!invId || invId === "none") return "Sin vincular";
    const inv = investments.find(i => i.id === invId);
    return inv ? inv.name : "Sin vincular";
  };

  const getPatrimonyLabel = (loan: any) => {
    const patId = loan.patrimony_id;
    if (!patId || patId === "none") return "Sin vincular";
    const pat = patrimony.find(p => p.id === patId);
    return pat ? pat.name : "Sin vincular";
  };

  const investmentTypes = [{ value: "stocks", label: "Acciones" }, { value: "etf", label: "ETF" }, { value: "crypto", label: "Criptomonedas" }, { value: "bonds", label: "Bonos" }, { value: "real_estate", label: "Bienes Raíces" }, { value: "other", label: "Otros" }];
  const patrimonyCategories = [{ value: "real_estate", label: "Bienes Raíces" }, { value: "vehicle", label: "Vehículos" }, { value: "investments", label: "Inversiones" }, { value: "savings", label: "Ahorros" }, { value: "business", label: "Negocios" }, { value: "other", label: "Otros" }];
  const collectionDays = Array.from({ length: 28 }, (_, i) => i + 1);

  const getLoanTypeInfo = (type: string) => loanTypes.find(t => t.value === type) || loanTypes[loanTypes.length - 1];

  const getSelectedLoanTypeInfo = (type: LoanType) => loanTypes.find(t => t.value === type) || loanTypes[0];

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Préstamos</h1>
            <p className="text-cyan-400 text-sm">Gestiona tus préstamos y créditos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-black"><Plus className="w-4 h-4 mr-2" />Nuevo Préstamo</Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Nuevo Préstamo</DialogTitle>
                <p className="text-zinc-400 text-sm">Registra las condiciones del préstamo</p>
              </DialogHeader>
              <LoanForm 
                loan={newLoan} 
                setLoan={setNewLoan} 
                errors={errors}
                showSpecificFees={showSpecificFees}
                setShowSpecificFees={setShowSpecificFees}
                showAdditionalFees={showAdditionalFees}
                setShowAdditionalFees={setShowAdditionalFees}
                isSaving={isSaving}
                onSubmit={handleAddLoan}
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
                handleCreateInvestment={() => handleCreateInvestment(false)}
                handleCreatePatrimony={() => handleCreatePatrimony(false)}
                collectionDays={collectionDays}
                investmentTypes={investmentTypes}
                patrimonyCategories={patrimonyCategories}
                loanTypes={loanTypes}
                universalFees={universalFees}
                additionalFees={additionalFees}
                specificFees={specificFees}
                isLoanTypeDialogOpen={isLoanTypeDialogOpen}
                setIsLoanTypeDialogOpen={setIsLoanTypeDialogOpen}
                isInvestmentDialogOpen={isInvestmentDialogOpen}
                setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
                isPatrimonyDialogOpen={isPatrimonyDialogOpen}
                setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
                getSelectedLoanTypeInfo={getSelectedLoanTypeInfo}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-cyan-600 to-cyan-700">
            <CardContent className="p-6 text-center">
              <Landmark className="w-8 h-8 mx-auto mb-2 text-white/80" />
              <p className="text-3xl font-bold text-white">{formatCurrency(totalDebt)}</p>
              <p className="text-white/80 text-sm">Deuda total</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-rose-500">
            <CardContent className="p-6 text-center">
              <TrendingDownIcon className="w-8 h-8 mx-auto mb-2 text-white/80" />
              <p className="text-3xl font-bold text-white">{formatCurrency(totalMonthly)}</p>
              <p className="text-white/80 text-sm">Cuotas/mes</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de préstamos activos */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-cyan-400" />
              Préstamos Activos ({activeLoans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (<p className="text-zinc-500 text-center">Cargando...</p>) : activeLoans.length === 0 ? (<p className="text-zinc-500 text-center">No hay préstamos activos</p>) : (
              <div className="space-y-3">
                {activeLoans.map((loan) => {
                  const progress = ((parseFloat(loan.initial_amount) - parseFloat(loan.current_amount)) / parseFloat(loan.initial_amount)) * 100;
                  const typeInfo = getLoanTypeInfo(loan.loan_type);
                  const Icon = typeInfo.icon;
                  return (
                    <div key={loan.id} className="p-4 bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
                            <Icon className={`w-6 h-6 ${typeInfo.textColor}`} />
                          </div>
                          <div>
                            <p className="font-medium text-white">{loan.borrower_name}</p>
                            <p className="text-xs text-zinc-500">{loan.bank} • {typeInfo.label}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEditDialog(loan)} className="p-2 rounded-lg hover:bg-zinc-700 transition-colors">
                            <Pencil className="w-4 h-4 text-zinc-400" />
                          </button>
                          <button onClick={() => openDeleteDialog(loan)} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div><p className="text-xs text-zinc-500">Pendiente</p><p className="font-bold text-cyan-400">{formatCurrency(loan.current_amount)}</p></div>
                        <div className="text-right"><p className="text-xs text-zinc-500">de {formatCurrency(loan.initial_amount)}</p><p className="text-xs text-emerald-400">Cuota: {formatCurrency(loan.monthly_payment)}/mes</p></div>
                      </div>
                      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-zinc-500">{progress.toFixed(1)}% pagado</p>
                        {loan.end_date && <p className="text-xs text-zinc-500">Fin: {new Date(loan.end_date).toLocaleDateString('es-ES')}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Préstamos saldados */}
        {settledLoans.length > 0 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <TrendingDownIcon className="w-4 h-4 text-zinc-400" />
                Préstamos Saldados ({settledLoans.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {settledLoans.map((loan) => {
                  const typeInfo = getLoanTypeInfo(loan.loan_type);
                  const Icon = typeInfo.icon;
                  return (
                    <div key={loan.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl opacity-60">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeInfo.color}`}>
                          <Icon className={`w-4 h-4 ${typeInfo.textColor}`} />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{loan.borrower_name}</p>
                          <p className="text-xs text-zinc-500">{loan.bank}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-emerald-400">Saldado</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Préstamo</DialogTitle>
          </DialogHeader>
          <LoanForm 
            loan={editLoan} 
            setLoan={setEditLoan} 
            errors={errors}
            showSpecificFees={showSpecificFees}
            setShowSpecificFees={setShowSpecificFees}
            showAdditionalFees={showAdditionalFees}
            setShowAdditionalFees={setShowAdditionalFees}
            isSaving={isSaving}
            onSubmit={handleEditLoan}
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
            handleCreateInvestment={() => handleCreateInvestment(true)}
            handleCreatePatrimony={() => handleCreatePatrimony(true)}
            collectionDays={collectionDays}
            investmentTypes={investmentTypes}
            patrimonyCategories={patrimonyCategories}
            loanTypes={loanTypes}
            universalFees={universalFees}
            additionalFees={additionalFees}
            specificFees={specificFees}
            isLoanTypeDialogOpen={isLoanTypeDialogOpen}
            setIsLoanTypeDialogOpen={setIsLoanTypeDialogOpen}
            isInvestmentDialogOpen={isInvestmentDialogOpen}
            setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
            isPatrimonyDialogOpen={isPatrimonyDialogOpen}
            setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
            getSelectedLoanTypeInfo={getSelectedLoanTypeInfo}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Eliminar Préstamo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300">
              ¿Estás seguro de que quieres eliminar este préstamo? Esta acción no se puede deshacer.
            </p>
            {selectedLoan && (
              <div className="p-4 bg-zinc-800/50 rounded-xl">
                <p className="text-white font-medium">{selectedLoan.borrower_name}</p>
                <p className="text-cyan-400 font-bold">{formatCurrency(selectedLoan.current_amount)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800">
                Cancelar
              </Button>
              <Button onClick={handleDeleteLoan} className="flex-1 bg-red-500 hover:bg-red-600">
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
            <Button onClick={() => handleCreateInvestment(false)} className="w-full bg-emerald-500 hover:bg-emerald-600">Crear</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal nuevo patrimonio */}
      <Dialog open={isNewPatrimonyOpen} onOpenChange={setIsNewPatrimonyOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Nuevo Patrimonio</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-sm text-zinc-400 mb-1 block">Nombre</label><Input placeholder="Nombre" value={newPatrimonyAsset.name} onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Categoría</label>
              <Select value={newPatrimonyAsset.category} onValueChange={(v) => setNewPatrimonyAsset({ ...newPatrimonyAsset, category: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">{patrimonyCategories.map((c) => (<SelectItem key={c.value} value={c.value} className="text-white">{c.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Valor</label><Input type="number" placeholder="0.00" value={newPatrimonyAsset.value} onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
            <Button onClick={() => handleCreatePatrimony(false)} className="w-full bg-emerald-500 hover:bg-emerald-600">Crear</Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

// Componente reutilizable para el formulario de préstamo
const LoanForm = ({ loan, setLoan, errors, showSpecificFees, setShowSpecificFees, showAdditionalFees, setShowAdditionalFees, isSaving, onSubmit, isNew, investments, patrimony, isNewInvestmentOpen, setIsNewInvestmentOpen, isNewPatrimonyOpen, setIsNewPatrimonyOpen, newInvestment, setNewInvestment, newPatrimonyAsset, setNewPatrimonyAsset, handleCreateInvestment, handleCreatePatrimony, collectionDays, investmentTypes, patrimonyCategories, loanTypes, universalFees, additionalFees, specificFees, isLoanTypeDialogOpen, setIsLoanTypeDialogOpen, isInvestmentDialogOpen, setIsInvestmentDialogOpen, isPatrimonyDialogOpen, setIsPatrimonyDialogOpen, getSelectedLoanTypeInfo }: any) => {
  const currentSpecificFees = specificFees[loan.loan_type] || [];
  
  // Función para obtener el label de inversión vinculada
  const getInvestmentLabel = () => {
    const invId = loan.investment_id;
    // Si no hay ID o es "none", mostrar "Sin vincular"
    if (!invId || invId === "none") return "Sin vincular";
    // Buscar la inversión en la lista
    const inv = investments.find((i: any) => i.id === invId);
    return inv ? inv.name : "Sin vincular";
  };
  
  // Función para obtener el label de patrimonio vinculado
  const getPatrimonyLabel = () => {
    const patId = loan.patrimony_id;
    // Si no hay ID o es "none", mostrar "Sin vincular"
    if (!patId || patId === "none") return "Sin vincular";
    // Buscar el patrimonio en la lista
    const pat = patrimony.find((p: any) => p.id === patId);
    return pat ? pat.name : "Sin vincular";
  };

  // Función para verificar si hay una inversión vinculada
  const hasInvestment = () => {
    const invId = loan.investment_id;
    return invId && invId !== "none";
  };

  // Función para verificar si hay patrimonio vinculado
  const hasPatrimony = () => {
    const patId = loan.patrimony_id;
    return patId && patId !== "none";
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setLoan({ ...loan, start_date: date || new Date() });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setLoan({ ...loan, end_date: date || null });
  };

  const selectedLoanType = getSelectedLoanTypeInfo(loan.loan_type);
  const SelectedIcon = selectedLoanType.icon;

  return (
    <div className="space-y-4 mt-2">
      {/* Tipo de préstamo con selector estilo categoría */}
      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Tipo de préstamo</label>
        <Dialog open={isLoanTypeDialogOpen} onOpenChange={setIsLoanTypeDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="w-full p-4 bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center gap-3 hover:border-zinc-600 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedLoanType.color}`}>
                <SelectedIcon className={`w-6 h-6 ${selectedLoanType.textColor}`} />
              </div>
              <span className="text-white font-medium">{selectedLoanType.label}</span>
              <ChevronRight className="w-5 h-5 text-zinc-400 ml-auto" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Seleccionar Tipo de Préstamo</DialogTitle>
            </DialogHeader>
            <button 
              onClick={() => setIsLoanTypeDialogOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white z-50"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-3 gap-2">
                {loanTypes.map((type: LoanTypeOption) => {
                  const Icon = type.icon;
                  const isSelected = loan.loan_type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setLoan({ ...loan, loan_type: type.value });
                        setIsLoanTypeDialogOpen(false);
                        setShowSpecificFees(true);
                      }}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? `bg-cyan-500/20 ${type.bgColor}`
                          : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${type.color}`}>
                        <Icon className={`w-6 h-6 ${type.textColor}`} />
                      </div>
                      <span className={`text-xs font-medium ${isSelected ? "text-white" : "text-zinc-400"}`}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Nombre y Banco */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Nombre *</label>
          <Input 
            placeholder="Ej: Hipoteca casa" 
            value={loan.name} 
            onChange={(e) => setLoan({ ...loan, name: e.target.value })}
            className={`bg-zinc-800 border-zinc-700 text-white ${errors.name ? "border-red-500" : ""}`} 
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Banco *</label>
          <Input 
            placeholder="Ej: BBVA, Santander" 
            value={loan.bank} 
            onChange={(e) => setLoan({ ...loan, bank: e.target.value })}
            className={`bg-zinc-800 border-zinc-700 text-white ${errors.bank ? "border-red-500" : ""}`} 
          />
          {errors.bank && <p className="text-red-400 text-xs mt-1">{errors.bank}</p>}
        </div>
      </div>

      {/* Importe y Capital pendiente */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Importe total (€) *</label>
          <Input 
            type="number" 
            placeholder="€ 0.00" 
            value={loan.total_amount} 
            onChange={(e) => setLoan({ ...loan, total_amount: e.target.value })}
            className={`bg-zinc-800 border-zinc-700 text-white ${errors.total_amount ? "border-red-500" : ""}`} 
          />
          {errors.total_amount && <p className="text-red-400 text-xs mt-1">{errors.total_amount}</p>}
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Capital pendiente (€) *</label>
          <Input 
            type="number" 
            placeholder="€ 0.00" 
            value={loan.pending_amount} 
            onChange={(e) => setLoan({ ...loan, pending_amount: e.target.value })}
            className={`bg-zinc-800 border-zinc-700 text-white ${errors.pending_amount ? "border-red-500" : ""}`} 
          />
          {errors.pending_amount && <p className="text-red-400 text-xs mt-1">{errors.pending_amount}</p>}
        </div>
      </div>

      {/* Cuota y Día de cobro */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Cuota mensual (€) *</label>
          <Input 
            type="number" 
            placeholder="€ 0.00" 
            value={loan.monthly_payment} 
            onChange={(e) => setLoan({ ...loan, monthly_payment: e.target.value })}
            className={`bg-zinc-800 border-zinc-700 text-white ${errors.monthly_payment ? "border-red-500" : ""}`} 
          />
          {errors.monthly_payment && <p className="text-red-400 text-xs mt-1">{errors.monthly_payment}</p>}
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Día de cobro *</label>
          <Select value={loan.collection_day} onValueChange={(v) => setLoan({ ...loan, collection_day: v })}>
            <SelectTrigger className={`bg-zinc-800 border-zinc-700 text-white ${errors.collection_day ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {collectionDays.map((day: number) => (<SelectItem key={day} value={day.toString()} className="text-white">{day}</SelectItem>))}
            </SelectContent>
          </Select>
          {errors.collection_day && <p className="text-red-400 text-xs mt-1">{errors.collection_day}</p>}
        </div>
      </div>

      {/* Fechas */}
      <div className="space-y-3">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Fecha inicio</label>
          <DatePicker date={loan.start_date} onDateChange={handleStartDateChange} />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Fecha fin (opcional)</label>
          <DatePicker date={loan.end_date || undefined} onDateChange={handleEndDateChange} placeholder="Sin fecha fin" />
        </div>
      </div>

      {/* Comisiones */}
      <div className="border border-zinc-700 rounded-xl p-3">
        <p className="text-sm text-zinc-400 font-medium mb-3">Comisiones</p>
        
        <div className="grid grid-cols-2 gap-3">
          {universalFees.map((fee: any) => (
            <div key={fee.key}>
              <label className="text-xs text-zinc-500 mb-1 block">{fee.label}</label>
              <Input type="number" step="0.01" placeholder={fee.placeholder} value={loan[fee.key]} onChange={(e) => setLoan({ ...loan, [fee.key]: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" />
            </div>
          ))}
        </div>
        
        <button type="button" onClick={() => setShowAdditionalFees(!showAdditionalFees)} className="flex items-center gap-2 mt-3 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
          {showAdditionalFees ? (<>Ocultar opciones <ChevronDown className="w-4 h-4 rotate-180" /></>) : (<>+ Más opciones <ChevronDown className="w-4 h-4" /></>)}
        </button>
        
        {showAdditionalFees && (
          <div className="space-y-3 mt-3 pt-3 border-t border-zinc-700">
            <div className="grid grid-cols-2 gap-3">
              {additionalFees.map((fee: any) => (
                <div key={fee.key}>
                  <label className="text-xs text-zinc-500 mb-1 block">{fee.label}</label>
                  <Input type="number" step="0.01" placeholder={fee.placeholder} value={loan[fee.key]} onChange={(e) => setLoan({ ...loan, [fee.key]: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" />
                </div>
              ))}
            </div>

            {currentSpecificFees.length > 0 && (
              <div className="pt-3 border-t border-zinc-700">
                <p className="text-sm text-cyan-300 font-medium mb-3">Comisiones específicas: {loanTypes.find((t: LoanTypeOption) => t.value === loan.loan_type)?.label}</p>
                <div className="grid grid-cols-2 gap-3">
                  {currentSpecificFees.map((fee: any) => (
                    <div key={fee.key}>
                      <label className="text-xs text-zinc-500 mb-1 block">{fee.label}</label>
                      <Input type="number" step="0.01" placeholder={fee.placeholder} value={loan[fee.key]} onChange={(e) => setLoan({ ...loan, [fee.key]: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vinculación a Inversión - Botón estilo selector */}
      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Vincular a inversión</label>
        <Dialog open={isInvestmentDialogOpen} onOpenChange={setIsInvestmentDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={`w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3 transition-all ${
                hasInvestment()
                  ? "border-emerald-500/50 bg-emerald-500/10" 
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                hasInvestment()
                  ? "bg-emerald-500/20" 
                  : "bg-zinc-700"
              }`}>
                <TrendingUp className={`w-4 h-4 ${hasInvestment() ? "text-emerald-400" : "text-zinc-400"}`} />
              </div>
              <span className={`font-medium ${hasInvestment() ? "text-emerald-400" : "text-zinc-400"}`}>
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
              className="absolute right-4 top-4 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white z-50"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setLoan({ ...loan, investment_id: "none" });
                  setIsInvestmentDialogOpen(false);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  !hasInvestment()
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
                    setLoan({ ...loan, investment_id: inv.id });
                    setIsInvestmentDialogOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    loan.investment_id === inv.id
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
                hasPatrimony()
                  ? "border-sky-500/50 bg-sky-500/10" 
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                hasPatrimony()
                  ? "bg-sky-500/20" 
                  : "bg-zinc-700"
              }`}>
                <Building className={`w-4 h-4 ${hasPatrimony() ? "text-sky-400" : "text-zinc-400"}`} />
              </div>
              <span className={`font-medium ${hasPatrimony() ? "text-sky-400" : "text-zinc-400"}`}>
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
              className="absolute right-4 top-4 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white z-50"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setLoan({ ...loan, patrimony_id: "none" });
                  setIsPatrimonyDialogOpen(false);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  !hasPatrimony()
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
                    setLoan({ ...loan, patrimony_id: pat.id });
                    setIsPatrimonyDialogOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    loan.patrimony_id === pat.id
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

      {/* Notas */}
      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Notas (opcional)</label>
        <Textarea placeholder="Condiciones especiales..." value={loan.notes} onChange={(e) => setLoan({ ...loan, notes: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" rows={2} />
      </div>

      <Button onClick={onSubmit} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black py-5" disabled={isSaving}>
        {isSaving ? "Guardando..." : isNew ? "Registrar préstamo" : "Guardar cambios"}
      </Button>
    </div>
  );
};

export default LoansPage;