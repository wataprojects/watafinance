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
import { Plus, Landmark, TrendingUp, Building, TrendingDown as TrendingDownIcon, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

type LoanType = "mortgage" | "car" | "personal" | "business" | "other";

const loanTypes = [
  { value: "mortgage", label: "Hipoteca", color: "bg-blue-500/20 text-blue-400" },
  { value: "car", label: "Coche", color: "bg-purple-500/20 text-purple-400" },
  { value: "personal", label: "Personal", color: "bg-cyan-500/20 text-cyan-400" },
  { value: "business", label: "Negocio", color: "bg-amber-500/20 text-amber-400" },
  { value: "other", label: "Otro", color: "bg-slate-500/20 text-slate-400" },
];

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
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para nuevo préstamo
  const [newLoan, setNewLoan] = useState({
    loan_type: "personal" as LoanType,
    name: "", bank: "", total_amount: "", pending_amount: "", monthly_payment: "", collection_day: "1",
    start_date: new Date(), end_date: null as Date | null, 
    notes: "",
    tin: "", 
  });

  // Estado para editar préstamo
  const [editLoan, setEditLoan] = useState({
    id: "",
    loan_type: "personal" as LoanType,
    name: "", bank: "", total_amount: "", pending_amount: "", monthly_payment: "", collection_day: "1",
    start_date: new Date(), end_date: null as Date | null, 
    notes: "",
    tin: "", 
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { 
    checkAuth(); 
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { 
      navigate("/login"); 
    } else { 
      fetchLoans(session.user.id); 
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

  const fetchLoans = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase.from("loans").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data) setLoans(data);
    setLoading(false);
  };

  const validateForm = (loan: any) => {
    const newErrors: Record<string, string> = {};
    if (!loan.name?.trim()) newErrors.name = "Obligatorio";
    if (!loan.bank?.trim()) newErrors.bank = "Obligatorio";
    if (!loan.total_amount || parseFloat(loan.total_amount) <= 0) newErrors.total_amount = "Obligatorio";
    if (!loan.pending_amount || parseFloat(loan.pending_amount) <= 0) newErrors.pending_amount = "Obligatorio";
    if (!loan.monthly_payment || parseFloat(loan.monthly_payment) <= 0) newErrors.monthly_payment = "Obligatorio";
    if (!loan.collection_day) newErrors.collection_day = "Obligatorio";
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
      borrower_name: newLoan.name,
      bank: newLoan.bank,
      initial_amount: parseFloat(newLoan.total_amount),
      current_amount: parseFloat(newLoan.pending_amount),
      interest_rate: newLoan.tin ? parseFloat(newLoan.tin) : null,
      monthly_payment: parseFloat(newLoan.monthly_payment),
      collection_day: newLoan.collection_day ? parseInt(newLoan.collection_day) : 1,
      start_date: formatDateToISO(newLoan.start_date),
      end_date: formatDateToISO(newLoan.end_date),
      notes: newLoan.notes || null,
      loan_type: newLoan.loan_type,
    };

    const { error } = await supabase.from("loans").insert(loanData);

    if (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar: " + error.message);
    } else {
      setIsDialogOpen(false);
      setNewLoan({
        loan_type: "personal", name: "", bank: "", total_amount: "", pending_amount: "", monthly_payment: "", collection_day: "1",
        start_date: new Date(), end_date: null, notes: "", tin: "",
      });
      setErrors({});
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
      borrower_name: editLoan.name,
      bank: editLoan.bank,
      initial_amount: parseFloat(editLoan.total_amount),
      current_amount: parseFloat(editLoan.pending_amount),
      interest_rate: editLoan.tin ? parseFloat(editLoan.tin) : null,
      monthly_payment: parseFloat(editLoan.monthly_payment),
      collection_day: editLoan.collection_day ? parseInt(editLoan.collection_day) : 1,
      start_date: formatDateToISO(editLoan.start_date),
      end_date: formatDateToISO(editLoan.end_date),
      notes: editLoan.notes || null,
      loan_type: editLoan.loan_type,
    };

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
    setEditLoan({
      id: loan.id,
      loan_type: loan.loan_type || "personal",
      name: loan.borrower_name || "",
      bank: loan.bank || "",
      total_amount: loan.initial_amount?.toString() || "",
      pending_amount: loan.current_amount?.toString() || "",
      monthly_payment: loan.monthly_payment?.toString() || "",
      collection_day: loan.collection_day?.toString() || "1",
      start_date: loan.start_date ? new Date(loan.start_date + 'T00:00:00') : new Date(),
      end_date: loan.end_date ? new Date(loan.end_date + 'T00:00:00') : null,
      notes: loan.notes || "",
      tin: loan.interest_rate?.toString() || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (loan: any) => {
    setSelectedLoan(loan);
    setIsDeleteDialogOpen(true);
  };

  const activeLoans = loans.filter(l => l.status === "active");
  const settledLoans = loans.filter(l => l.status === "settled");
  const totalDebt = activeLoans.reduce((sum, l) => sum + parseFloat(l.current_amount), 0);
  const totalMonthly = activeLoans.reduce((sum, l) => sum + parseFloat(l.monthly_payment || 0), 0);

  const collectionDays = Array.from({ length: 28 }, (_, i) => i + 1);

  const getLoanTypeInfo = (type: string) => loanTypes.find(t => t.value === type) || loanTypes[loanTypes.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-24">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Préstamos</h1>
            <p className="text-slate-400">Gestiona tus préstamos y créditos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-500 hover:bg-cyan-600"><Plus className="w-4 h-4 mr-2" />Nuevo Préstamo</Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Nuevo Préstamo</DialogTitle>
                <p className="text-slate-400 text-sm">Registra las condiciones del préstamo</p>
              </DialogHeader>
              <LoanForm 
                loan={newLoan} 
                setLoan={setNewLoan} 
                errors={errors}
                isSaving={isSaving}
                onSubmit={handleAddLoan}
                isNew={true}
                collectionDays={collectionDays}
                loanTypes={loanTypes}
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
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-cyan-400" />
              Préstamos Activos ({activeLoans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (<p className="text-slate-400 text-center">Cargando...</p>) : activeLoans.length === 0 ? (<p className="text-slate-400 text-center">No hay préstamos activos</p>) : (
              <div className="space-y-3">
                {activeLoans.map((loan) => {
                  const progress = ((parseFloat(loan.initial_amount) - parseFloat(loan.current_amount)) / parseFloat(loan.initial_amount)) * 100;
                  const typeInfo = getLoanTypeInfo(loan.loan_type);
                  return (
                    <div key={loan.id} className="p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
                            <Landmark className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{loan.borrower_name}</p>
                            <p className="text-xs text-slate-400">{loan.bank} • {typeInfo.label}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEditDialog(loan)} className="p-2 rounded-lg hover:bg-slate-700 transition-colors">
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </button>
                          <button onClick={() => openDeleteDialog(loan)} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div><p className="text-xs text-slate-400">Pendiente</p><p className="font-bold text-cyan-400">{formatCurrency(loan.current_amount)}</p></div>
                        <div className="text-right"><p className="text-xs text-slate-400">de {formatCurrency(loan.initial_amount)}</p><p className="text-xs text-emerald-400">Cuota: {formatCurrency(loan.monthly_payment)}/mes</p></div>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-slate-500">{progress.toFixed(1)}% pagado</p>
                        {loan.end_date && <p className="text-xs text-slate-500">Fin: {new Date(loan.end_date).toLocaleDateString('es-ES')}</p>}
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
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <TrendingDownIcon className="w-4 h-4 text-slate-400" />
                Préstamos Saldados ({settledLoans.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {settledLoans.map((loan) => {
                  const typeInfo = getLoanTypeInfo(loan.loan_type);
                  return (
                    <div key={loan.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl opacity-60">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeInfo.color}`}>
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{loan.borrower_name}</p>
                          <p className="text-xs text-slate-400">{loan.bank}</p>
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
        <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Préstamo</DialogTitle>
          </DialogHeader>
          <LoanForm 
            loan={editLoan} 
            setLoan={setEditLoan} 
            errors={errors}
            isSaving={isSaving}
            onSubmit={handleEditLoan}
            isNew={false}
            collectionDays={collectionDays}
            loanTypes={loanTypes}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Eliminar Préstamo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-slate-300">
              ¿Estás seguro de que quieres eliminar este préstamo? Esta acción no se puede deshacer.
            </p>
            {selectedLoan && (
              <div className="p-4 bg-slate-700/50 rounded-xl">
                <p className="text-white font-medium">{selectedLoan.borrower_name}</p>
                <p className="text-cyan-400 font-bold">{formatCurrency(selectedLoan.current_amount)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-slate-600 text-white hover:bg-slate-700">
                Cancelar
              </Button>
              <Button onClick={handleDeleteLoan} className="flex-1 bg-red-500 hover:bg-red-600">
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

// Componente simplificado para el formulario de préstamo
const LoanForm = ({ loan, setLoan, errors, isSaving, onSubmit, isNew, collectionDays, loanTypes }: any) => {
  return (
    <div className="space-y-4 mt-2">
      {/* Tipo de préstamo */}
      <div>
        <label className="text-sm text-slate-300 mb-2 block">Tipo de préstamo</label>
        <div className="grid grid-cols-5 gap-2">
          {loanTypes.map((type: any) => (
            <button key={type.value} type="button" onClick={() => setLoan({ ...loan, loan_type: type.value })}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${loan.loan_type === type.value ? "border-cyan-500 bg-cyan-500/20" : "border-slate-600 bg-slate-700/30 hover:border-slate-500"}`}>
              <span className={`text-xs font-medium ${loan.loan_type === type.value ? "text-white" : "text-slate-400"}`}>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nombre y Banco */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-slate-300 mb-1 block">Nombre *</label>
          <Input placeholder="Ej: Hipoteca casa" value={loan.name} onChange={(e) => setLoan({ ...loan, name: e.target.value })}
            className={`bg-slate-700 border-slate-600 text-white ${errors.name ? "border-red-500" : ""}`} />
        </div>
        <div>
          <label className="text-sm text-slate-300 mb-1 block">Banco *</label>
          <Input placeholder="Ej: BBVA, Santander" value={loan.bank} onChange={(e) => setLoan({ ...loan, bank: e.target.value })}
            className={`bg-slate-700 border-slate-600 text-white ${errors.bank ? "border-red-500" : ""}`} />
        </div>
      </div>

      {/* Importe y Capital pendiente */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-slate-300 mb-1 block">Importe total (€) *</label>
          <Input type="number" placeholder="€ 0.00" value={loan.total_amount} onChange={(e) => setLoan({ ...loan, total_amount: e.target.value })}
            className={`bg-slate-700 border-slate-600 text-white ${errors.total_amount ? "border-red-500" : ""}`} />
        </div>
        <div>
          <label className="text-sm text-slate-300 mb-1 block">Capital pendiente (€) *</label>
          <Input type="number" placeholder="€ 0.00" value={loan.pending_amount} onChange={(e) => setLoan({ ...loan, pending_amount: e.target.value })}
            className={`bg-slate-700 border-slate-600 text-white ${errors.pending_amount ? "border-red-500" : ""}`} />
        </div>
      </div>

      {/* Cuota y Día de cobro */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-slate-300 mb-1 block">Cuota mensual (€) *</label>
          <Input type="number" placeholder="€ 0.00" value={loan.monthly_payment} onChange={(e) => setLoan({ ...loan, monthly_payment: e.target.value })}
            className={`bg-slate-700 border-slate-600 text-white ${errors.monthly_payment ? "border-red-500" : ""}`} />
        </div>
        <div>
          <label className="text-sm text-slate-300 mb-1 block">Día de cobro *</label>
          <Select value={loan.collection_day} onValueChange={(v) => setLoan({ ...loan, collection_day: v })}>
            <SelectTrigger className={`bg-slate-700 border-slate-600 text-white ${errors.collection_day ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {collectionDays.map((day: number) => (<SelectItem key={day} value={day.toString()} className="text-white">{day}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fechas */}
      <div className="space-y-3">
        <div>
          <label className="text-sm text-slate-300 mb-1 block">Fecha inicio</label>
          <DatePicker date={loan.start_date} onDateChange={(date) => setLoan({ ...loan, start_date: date })} />
        </div>
        <div>
          <label className="text-sm text-slate-300 mb-1 block">Fecha fin (opcional)</label>
          <DatePicker date={loan.end_date} onDateChange={(date) => setLoan({ ...loan, end_date: date })} placeholder="Sin fecha fin" />
        </div>
      </div>

      {/* TIN */}
      <div>
        <label className="text-sm text-slate-300 mb-1 block">TIN (%) (opcional)</label>
        <Input type="number" step="0.01" placeholder="3.5" value={loan.tin} onChange={(e) => setLoan({ ...loan, tin: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
      </div>

      {/* Notas */}
      <div>
        <label className="text-sm text-slate-300 mb-1 block">Notas (opcional)</label>
        <Textarea placeholder="Condiciones especiales..." value={loan.notes} onChange={(e) => setLoan({ ...loan, notes: e.target.value })} className="bg-slate-700 border-slate-600 text-white" rows={2} />
      </div>

      <Button onClick={onSubmit} className="w-full bg-cyan-500 hover:bg-cyan-600 py-5" disabled={isSaving}>
        {isSaving ? "Guardando..." : isNew ? "Registrar préstamo" : "Guardar cambios"}
      </Button>
    </div>
  );
};

export default LoansPage;