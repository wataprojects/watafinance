"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, Landmark, TrendingUp, Building, TrendingDown as TrendingDownIcon, Pencil, Trash2, Home, Car, Wallet, Briefcase, MoreHorizontal, X, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { formatCurrency } from "@/utils/currency";

type LoanType = "mortgage" | "car" | "personal" | "business" | "other";

interface LoanTypeOption {
  value: LoanType; label: string; color: string; textColor: string; bgColor: string; icon: any;
}

const loanTypes: LoanTypeOption[] = [
  { value: "mortgage", label: "Hipoteca", color: "bg-blue-500/20", textColor: "text-blue-400", bgColor: "border-blue-500", icon: Home },
  { value: "car", label: "Coche", color: "bg-purple-500/20", textColor: "text-purple-400", bgColor: "border-purple-500", icon: Car },
  { value: "personal", label: "Personal", color: "bg-cyan-500/20", textColor: "text-cyan-400", bgColor: "border-cyan-500", icon: Wallet },
  { value: "business", label: "Negocio", color: "bg-amber-500/20", textColor: "text-amber-400", bgColor: "border-amber-500", icon: Briefcase },
  { value: "other", label: "Otro", color: "bg-slate-500/20", textColor: "text-slate-400", bgColor: "border-slate-500", icon: MoreHorizontal },
];

const LoansPage = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const defaultDate = new Date();
  const [newLoan, setNewLoan] = useState({
    loan_type: "personal" as LoanType, name: "", bank: "", total_amount: "", pending_amount: "",
    monthly_payment: "", collection_day: "1", start_date: defaultDate, end_date: null as Date | null,
    tin: "", notes: "",
  });

  const [editLoan, setEditLoan] = useState({
    id: "", loan_type: "personal" as LoanType, name: "", bank: "", total_amount: "", pending_amount: "",
    monthly_payment: "", collection_day: "1", start_date: defaultDate, end_date: null as Date | null,
    tin: "", notes: "",
  });

  const collectionDays = Array.from({ length: 28 }, (_, i) => i + 1);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate("/login");
    else fetchLoans(session.user.id);
  };

  const fetchLoans = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase.from("loans").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data) setLoans(data);
    setLoading(false);
  };

  const validateForm = (loan: any) => {
    const newErrors: Record<string, string> = {};
    if (!loan.name?.trim()) newErrors.name = "El nombre es obligatorio";
    if (!loan.bank?.trim()) newErrors.bank = "El banco es obligatorio";
    if (!loan.total_amount || parseFloat(loan.total_amount) <= 0) newErrors.total_amount = "El importe total es obligatorio";
    if (!loan.pending_amount || parseFloat(loan.pending_amount) <= 0) newErrors.pending_amount = "El capital pendiente es obligatorio";
    if (!loan.monthly_payment || parseFloat(loan.monthly_payment) <= 0) newErrors.monthly_payment = "La cuota mensual es obligatoria";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateToISO = (date: Date | null): string | null => {
    if (!date) return null;
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const handleAddLoan = async () => {
    if (isSaving || !validateForm(newLoan)) return;
    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsSaving(false); return; }

    await supabase.from("loans").insert({
      user_id: session.user.id, borrower_name: newLoan.name.trim(), bank: newLoan.bank.trim(),
      initial_amount: parseFloat(newLoan.total_amount), current_amount: parseFloat(newLoan.pending_amount),
      interest_rate: newLoan.tin ? parseFloat(newLoan.tin) : null,
      monthly_payment: parseFloat(newLoan.monthly_payment),
      collection_day: parseInt(newLoan.collection_day),
      start_date: formatDateToISO(newLoan.start_date),
      end_date: formatDateToISO(newLoan.end_date),
      notes: newLoan.notes || null, loan_type: newLoan.loan_type,
    });

    setIsDialogOpen(false);
    setNewLoan({ loan_type: "personal", name: "", bank: "", total_amount: "", pending_amount: "", monthly_payment: "", collection_day: "1", start_date: new Date(), end_date: null, tin: "", notes: "" });
    setErrors({});
    fetchLoans(session.user.id);
    setIsSaving(false);
  };

  const handleEditLoan = async () => {
    if (isSaving || !selectedLoan || !validateForm(editLoan)) return;
    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsSaving(false); return; }

    await supabase.from("loans").update({
      borrower_name: editLoan.name.trim(), bank: editLoan.bank.trim(),
      initial_amount: parseFloat(editLoan.total_amount), current_amount: parseFloat(editLoan.pending_amount),
      interest_rate: editLoan.tin ? parseFloat(editLoan.tin) : null,
      monthly_payment: parseFloat(editLoan.monthly_payment),
      collection_day: parseInt(editLoan.collection_day),
      start_date: formatDateToISO(editLoan.start_date),
      end_date: formatDateToISO(editLoan.end_date),
      notes: editLoan.notes || null, loan_type: editLoan.loan_type,
    }).eq("id", selectedLoan.id);

    setIsEditDialogOpen(false); setSelectedLoan(null);
    fetchLoans(session.user.id);
    setIsSaving(false);
  };

  const handleDeleteLoan = async () => {
    if (!selectedLoan) return;
    await supabase.from("loans").delete().eq("id", selectedLoan.id);
    setIsDeleteDialogOpen(false); setSelectedLoan(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) fetchLoans(session.user.id);
  };

  const openEditDialog = (loan: any) => {
    setSelectedLoan(loan);
    setEditLoan({
      id: loan.id, loan_type: loan.loan_type || "personal",
      name: loan.borrower_name || "", bank: loan.bank || "",
      total_amount: loan.initial_amount?.toString() || "", pending_amount: loan.current_amount?.toString() || "",
      monthly_payment: loan.monthly_payment?.toString() || "", collection_day: loan.collection_day?.toString() || "1",
      start_date: loan.start_date ? new Date(loan.start_date) : new Date(),
      end_date: loan.end_date ? new Date(loan.end_date) : null,
      tin: loan.interest_rate?.toString() || "", notes: loan.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const activeLoans = loans.filter(l => l.status === "active");
  const totalDebt = activeLoans.reduce((sum, l) => sum + parseFloat(l.current_amount), 0);
  const totalMonthly = activeLoans.reduce((sum, l) => sum + parseFloat(l.monthly_payment || 0), 0);

  const getLoanTypeInfo = (type: string) => loanTypes.find(t => t.value === type) || loanTypes[loanTypes.length - 1];

  return (
    <div className="min-h-screen bg-black pb-24">
      <DashboardHeader title="FinPro" subtitle="Gestión de Préstamos" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Préstamos</h1>
            <p className="text-cyan-400 text-sm">Gestiona tus préstamos y créditos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button className="bg-cyan-500 hover:bg-cyan-600 text-black"><Plus className="w-4 h-4 mr-2" />Nuevo Préstamo</Button></DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-white">Nuevo Préstamo</DialogTitle></DialogHeader>
              <button onClick={() => setIsDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
              <LoanForm loan={newLoan} setLoan={setNewLoan} errors={errors} isSaving={isSaving} onSubmit={handleAddLoan} isNew={true} loanTypes={loanTypes} collectionDays={collectionDays} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-cyan-600 to-cyan-700"><CardContent className="p-6 text-center"><Landmark className="w-8 h-8 mx-auto mb-2 text-white/80" /><p className="text-3xl font-bold text-white">{formatCurrency(totalDebt)}</p><p className="text-white/80 text-sm">Deuda total</p></CardContent></Card>
          <Card className="bg-gradient-to-r from-orange-500 to-rose-500"><CardContent className="p-6 text-center"><TrendingDownIcon className="w-8 h-8 mx-auto mb-2 text-white/80" /><p className="text-3xl font-bold text-white">{formatCurrency(totalMonthly)}</p><p className="text-white/80 text-sm">Cuotas/mes</p></CardContent></Card>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Landmark className="w-5 h-5 text-cyan-400" />Préstamos Activos ({activeLoans.length})</CardTitle></CardHeader>
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
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeInfo.color}`}><Icon className={`w-6 h-6 ${typeInfo.textColor}`} /></div>
                          <div><p className="font-medium text-white">{loan.borrower_name}</p><p className="text-xs text-zinc-500">{loan.bank} • {typeInfo.label}</p></div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEditDialog(loan)} className="p-2 rounded-lg hover:bg-zinc-700 transition-colors"><Pencil className="w-4 h-4 text-zinc-400" /></button>
                          <button onClick={() => { setSelectedLoan(loan); setIsDeleteDialogOpen(true); }} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div><p className="text-xs text-zinc-500">Pendiente</p><p className="font-bold text-cyan-400">{formatCurrency(loan.current_amount)}</p></div>
                        <div className="text-right"><p className="text-xs text-zinc-500">de {formatCurrency(loan.initial_amount)}</p><p className="text-xs text-emerald-400">Cuota: {formatCurrency(loan.monthly_payment)}/mes</p></div>
                      </div>
                      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
                      <p className="text-xs text-zinc-500 mt-1">{progress.toFixed(1)}% pagado</p>
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
          <DialogHeader><DialogTitle className="text-white">Editar Préstamo</DialogTitle></DialogHeader>
          <button onClick={() => setIsEditDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <LoanForm loan={editLoan} setLoan={setEditLoan} errors={errors} isSaving={isSaving} onSubmit={handleEditLoan} isNew={false} loanTypes={loanTypes} collectionDays={collectionDays} />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Eliminar Préstamo</DialogTitle></DialogHeader>
          <button onClick={() => setIsDeleteDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300">¿Estás seguro de que quieres eliminar este préstamo?</p>
            {selectedLoan && (<div className="p-4 bg-zinc-800/50 rounded-xl"><p className="text-white font-medium">{selectedLoan.borrower_name}</p><p className="text-cyan-400 font-bold">{formatCurrency(selectedLoan.current_amount)}</p></div>)}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800">Cancelar</Button>
              <Button onClick={handleDeleteLoan} className="flex-1 bg-red-500 hover:bg-red-600">Eliminar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

const LoanForm = ({ loan, setLoan, errors, isSaving, onSubmit, isNew, loanTypes, collectionDays }: any) => {
  const [showFees, setShowFees] = useState(false);
  const selectedLoanType = loanTypes.find((t: LoanTypeOption) => t.value === loan.loan_type) || loanTypes[0];
  const SelectedIcon = selectedLoanType.icon;

  return (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Tipo de préstamo</label>
        <button type="button" className="w-full p-4 bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedLoanType.color}`}><SelectedIcon className={`w-6 h-6 ${selectedLoanType.textColor}`} /></div>
          <span className="text-white font-medium">{selectedLoanType.label}</span>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm text-zinc-400 mb-1 block">Nombre *</label><Input placeholder="Ej: Hipoteca casa" value={loan.name} onChange={(e) => setLoan({ ...loan, name: e.target.value })} className={`bg-zinc-800 border-zinc-700 text-white ${errors.name ? "border-red-500" : ""}`} />{errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}</div>
        <div><label className="text-sm text-zinc-400 mb-1 block">Banco *</label><Input placeholder="Ej: BBVA" value={loan.bank} onChange={(e) => setLoan({ ...loan, bank: e.target.value })} className={`bg-zinc-800 border-zinc-700 text-white ${errors.bank ? "border-red-500" : ""}`} />{errors.bank && <p className="text-red-400 text-xs mt-1">{errors.bank}</p>}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm text-zinc-400 mb-1 block">Importe total (€) *</label><Input type="number" step="0.01" placeholder="€ 0.00" value={loan.total_amount} onChange={(e) => setLoan({ ...loan, total_amount: e.target.value })} className={`bg-zinc-800 border-zinc-700 text-white ${errors.total_amount ? "border-red-500" : ""}`} />{errors.total_amount && <p className="text-red-400 text-xs mt-1">{errors.total_amount}</p>}</div>
        <div><label className="text-sm text-zinc-400 mb-1 block">Capital pendiente (€) *</label><Input type="number" step="0.01" placeholder="€ 0.00" value={loan.pending_amount} onChange={(e) => setLoan({ ...loan, pending_amount: e.target.value })} className={`bg-zinc-800 border-zinc-700 text-white ${errors.pending_amount ? "border-red-500" : ""}`} />{errors.pending_amount && <p className="text-red-400 text-xs mt-1">{errors.pending_amount}</p>}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm text-zinc-400 mb-1 block">Cuota mensual (€) *</label><Input type="number" step="0.01" placeholder="€ 0.00" value={loan.monthly_payment} onChange={(e) => setLoan({ ...loan, monthly_payment: e.target.value })} className={`bg-zinc-800 border-zinc-700 text-white ${errors.monthly_payment ? "border-red-500" : ""}`} />{errors.monthly_payment && <p className="text-red-400 text-xs mt-1">{errors.monthly_payment}</p>}</div>
        <div><label className="text-sm text-zinc-400 mb-1 block">Día de cobro *</label>
          <Select value={loan.collection_day} onValueChange={(v) => setLoan({ ...loan, collection_day: v })}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Selecciona" /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">{collectionDays.map((day: number) => (<SelectItem key={day} value={day.toString()} className="text-white">{day}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>
      <div><label className="text-sm text-zinc-400 mb-1 block">TIN (%)</label><Input type="number" step="0.01" placeholder="3.5" value={loan.tin} onChange={(e) => setLoan({ ...loan, tin: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
      <div><label className="text-sm text-zinc-400 mb-1 block">Notas (opcional)</label><Input placeholder="Condiciones..." value={loan.notes} onChange={(e) => setLoan({ ...loan, notes: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
      <Button onClick={onSubmit} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black py-5" disabled={isSaving}>{isSaving ? "Guardando..." : isNew ? "Registrar préstamo" : "Guardar cambios"}</Button>
    </div>
  );
};

export default LoansPage;