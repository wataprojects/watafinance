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
import { Plus, Landmark, TrendingUp, Building, TrendingDown as TrendingDownIcon, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

type LoanType = "mortgage" | "car" | "personal" | "business" | "other";

const loanTypes = [
  { value: "mortgage", label: "Hipoteca", icon: Building, color: "bg-blue-500/20 text-blue-400" },
  { value: "car", label: "Coche", icon: Landmark, color: "bg-purple-500/20 text-purple-400" },
  { value: "personal", label: "Personal", icon: Landmark, color: "bg-cyan-500/20 text-cyan-400" },
  { value: "business", label: "Negocio", icon: Landmark, color: "bg-amber-500/20 text-amber-400" },
  { value: "other", label: "Otro", icon: Landmark, color: "bg-slate-500/20 text-slate-400" },
];

const LoansPage = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const defaultDate = new Date();
  
  const [newLoan, setNewLoan] = useState({
    name: "", 
    total_amount: "", 
    current_amount: "", 
    monthly_payment: "", 
    interest_rate: "",
    investment_id: "none", 
    patrimony_id: "none", 
    notes: "",
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!newLoan.name.trim()) newErrors.name = "Obligatorio";
    if (!newLoan.total_amount || parseFloat(newLoan.total_amount) <= 0) newErrors.total_amount = "Obligatorio";
    if (!newLoan.current_amount || parseFloat(newLoan.current_amount) <= 0) newErrors.current_amount = "Obligatorio";
    if (!newLoan.monthly_payment || parseFloat(newLoan.monthly_payment) <= 0) newErrors.monthly_payment = "Obligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddLoan = async () => {
    if (isSaving) return;
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsSaving(false);
      return;
    }

    // Solo guardar las columnas que existen en la tabla loans:
    // id, user_id, borrower_name, initial_amount, current_amount, interest_rate, monthly_payment, status, created_at, updated_at
    const loanData = {
      user_id: session.user.id,
      borrower_name: newLoan.name,
      initial_amount: parseFloat(newLoan.total_amount),
      current_amount: parseFloat(newLoan.current_amount),
      interest_rate: newLoan.interest_rate ? parseFloat(newLoan.interest_rate) : null,
      monthly_payment: parseFloat(newLoan.monthly_payment),
    };

    console.log("Guardando préstamo:", loanData);

    const { error } = await supabase.from("loans").insert(loanData);

    if (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar: " + error.message);
    } else {
      console.log("Préstamo guardado correctamente");
      setIsDialogOpen(false);
      setNewLoan({
        name: "", 
        total_amount: "", 
        current_amount: "", 
        monthly_payment: "", 
        interest_rate: "",
        investment_id: "none", 
        patrimony_id: "none", 
        notes: "",
      });
      setErrors({});
      fetchLoans(session.user.id);
    }
    
    setIsSaving(false);
  };

  const handleCreateInvestment = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !newInvestment.name || !newInvestment.initial_value) return;
    const { data, error } = await supabase.from("investments").insert({
      user_id: session.user.id, name: newInvestment.name, type: newInvestment.type,
      initial_value: parseFloat(newInvestment.initial_value),
      current_value: parseFloat(newInvestment.current_value) || parseFloat(newInvestment.initial_value),
    }).select().single();
    if (!error && data) {
      setInvestments([...investments, { id: data.id, name: data.name }]);
      setNewLoan({ ...newLoan, investment_id: data.id });
      setIsNewInvestmentOpen(false);
      setNewInvestment({ name: "", type: "stocks", initial_value: "", current_value: "" });
    }
  };

  const handleCreatePatrimony = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !newPatrimonyAsset.name || !newPatrimonyAsset.value) return;
    const { data, error } = await supabase.from("patrimony").insert({
      user_id: session.user.id, name: newPatrimonyAsset.name, category: newPatrimonyAsset.category, value: parseFloat(newPatrimonyAsset.value),
    }).select().single();
    if (!error && data) {
      setPatrimony([...patrimony, { id: data.id, name: data.name }]);
      setNewLoan({ ...newLoan, patrimony_id: data.id });
      setIsNewPatrimonyOpen(false);
      setNewPatrimonyAsset({ name: "", category: "real_estate", value: "" });
    }
  };

  const activeLoans = loans.filter(l => l.status === "active");
  const totalDebt = activeLoans.reduce((sum, l) => sum + parseFloat(l.current_amount), 0);
  const totalMonthly = activeLoans.reduce((sum, l) => sum + parseFloat(l.monthly_payment || 0), 0);

  const getInvestmentLabel = () => newLoan.investment_id === "none" ? "Sin vincular" : investments.find(i => i.id === newLoan.investment_id)?.name || "Sin vincular";
  const getPatrimonyLabel = () => newLoan.patrimony_id === "none" ? "Sin vincular" : patrimony.find(p => p.id === newLoan.patrimony_id)?.name || "Sin vincular";

  const investmentTypes = [{ value: "stocks", label: "Acciones" }, { value: "etf", label: "ETF" }, { value: "crypto", label: "Criptomonedas" }, { value: "bonds", label: "Bonos" }, { value: "real_estate", label: "Bienes Raíces" }, { value: "other", label: "Otros" }];
  const patrimonyCategories = [{ value: "real_estate", label: "Bienes Raíces" }, { value: "vehicle", label: "Vehículos" }, { value: "investments", label: "Inversiones" }, { value: "savings", label: "Ahorros" }, { value: "business", label: "Negocios" }, { value: "other", label: "Otros" }];

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
              <div className="space-y-4 mt-2">
                {/* Nombre del préstamo */}
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Nombre del préstamo *</label>
                  <Input placeholder="Ej: Hipoteca casa, Coche nuevo" value={newLoan.name} onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
                    className={`bg-slate-700 border-slate-600 text-white ${errors.name ? "border-red-500" : ""}`} />
                </div>

                {/* Importe total y Capital pendiente */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-300 mb-1 block">Importe total (€) *</label>
                    <Input type="number" placeholder="€ 0.00" value={newLoan.total_amount} onChange={(e) => setNewLoan({ ...newLoan, total_amount: e.target.value })}
                      className={`bg-slate-700 border-slate-600 text-white ${errors.total_amount ? "border-red-500" : ""}`} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-1 block">Capital pendiente (€) *</label>
                    <Input type="number" placeholder="€ 0.00" value={newLoan.current_amount} onChange={(e) => setNewLoan({ ...newLoan, current_amount: e.target.value })}
                      className={`bg-slate-700 border-slate-600 text-white ${errors.current_amount ? "border-red-500" : ""}`} />
                  </div>
                </div>

                {/* Cuota mensual y Tipo de interés */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-300 mb-1 block">Cuota mensual (€) *</label>
                    <Input type="number" placeholder="€ 0.00" value={newLoan.monthly_payment} onChange={(e) => setNewLoan({ ...newLoan, monthly_payment: e.target.value })}
                      className={`bg-slate-700 border-slate-600 text-white ${errors.monthly_payment ? "border-red-500" : ""}`} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-1 block">Tipo de interés (%)</label>
                    <Input type="number" step="0.01" placeholder="Ej: 3.5" value={newLoan.interest_rate} onChange={(e) => setNewLoan({ ...newLoan, interest_rate: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                </div>

                {/* Inversión y Patrimonio */}
                <div className="space-y-3">
                  <Select value={newLoan.investment_id} onValueChange={(v) => { if (v === "new") setIsNewInvestmentOpen(true); else setNewLoan({ ...newLoan, investment_id: v }); }}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <div className="flex items-center gap-2 w-full">
                        <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">Inversión:</span>
                        <span className="text-white text-sm font-medium truncate">{getInvestmentLabel()}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="none" className="text-slate-400">Sin vincular</SelectItem>
                      {investments.map((inv) => (<SelectItem key={inv.id} value={inv.id} className="text-white">{inv.name}</SelectItem>))}
                      <SelectItem value="new" className="text-emerald-400 font-medium">+ Nueva inversión</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={newLoan.patrimony_id} onValueChange={(v) => { if (v === "new") setIsNewPatrimonyOpen(true); else setNewLoan({ ...newLoan, patrimony_id: v }); }}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <div className="flex items-center gap-2 w-full">
                        <Building className="w-4 h-4 text-sky-400 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">Patrimonio:</span>
                        <span className="text-white text-sm font-medium truncate">{getPatrimonyLabel()}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="none" className="text-slate-400">Sin vincular</SelectItem>
                      {patrimony.map((pat) => (<SelectItem key={pat.id} value={pat.id} className="text-white">{pat.name}</SelectItem>))}
                      <SelectItem value="new" className="text-emerald-400 font-medium">+ Nuevo patrimonio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notas */}
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Notas (opcional)</label>
                  <Textarea placeholder="Condiciones especiales..." value={newLoan.notes} onChange={(e) => setNewLoan({ ...newLoan, notes: e.target.value })} className="bg-slate-700 border-slate-600 text-white" rows={2} />
                </div>

                <Button 
                  onClick={handleAddLoan} 
                  className="w-full bg-cyan-500 hover:bg-cyan-600 py-5"
                  disabled={isSaving}
                >
                  {isSaving ? "Guardando..." : "Registrar préstamo"}
                </Button>
              </div>
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

        {/* Lista de préstamos */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Landmark className="w-5 h-5 text-cyan-400" />Préstamos Activos</CardTitle></CardHeader>
          <CardContent>
            {loading ? (<p className="text-slate-400 text-center">Cargando...</p>) : activeLoans.length === 0 ? (<p className="text-slate-400 text-center">No hay préstamos registrados</p>) : (
              <div className="space-y-3">
                {activeLoans.map((loan) => {
                  const progress = ((parseFloat(loan.initial_amount) - parseFloat(loan.current_amount)) / parseFloat(loan.initial_amount)) * 100;
                  return (
                    <div key={loan.id} className="p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div><p className="font-medium text-white">{loan.borrower_name}</p><p className="text-xs text-slate-400">{loan.status === "active" ? "Activo" : "Pagado"}</p></div>
                        <div className="text-right"><p className="font-bold text-cyan-400">{formatCurrency(loan.current_amount)}</p><p className="text-xs text-slate-400">de {formatCurrency(loan.initial_amount)}</p></div>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full" style={{ width: `${progress}%` }} /></div>
                      <p className="text-xs text-slate-400 mt-1">{progress.toFixed(1)}% pagado</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal nueva inversión */}
      <Dialog open={isNewInvestmentOpen} onOpenChange={setIsNewInvestmentOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader><DialogTitle className="text-white">Nueva Inversión</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-sm text-slate-300 mb-1 block">Nombre</label><Input placeholder="Nombre" value={newInvestment.name} onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })} className="bg-slate-700 border-slate-600 text-white" /></div>
            <div><label className="text-sm text-slate-300 mb-1 block">Tipo</label>
              <Select value={newInvestment.type} onValueChange={(v) => setNewInvestment({ ...newInvestment, type: v })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">{investmentTypes.map((t) => (<SelectItem key={t.value} value={t.value} className="text-white">{t.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-slate-300 mb-1 block">Valor inicial</label><Input type="number" placeholder="0.00" value={newInvestment.initial_value} onChange={(e) => setNewInvestment({ ...newInvestment, initial_value: e.target.value })} className="bg-slate-700 border-slate-600 text-white" /></div>
              <div><label className="text-sm text-slate-300 mb-1 block">Valor actual</label><Input type="number" placeholder="0.00" value={newInvestment.current_value} onChange={(e) => setNewInvestment({ ...newInvestment, current_value: e.target.value })} className="bg-slate-700 border-slate-600 text-white" /></div>
            </div>
            <Button onClick={handleCreateInvestment} className="w-full bg-emerald-500 hover:bg-emerald-600">Crear</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal nuevo patrimonio */}
      <Dialog open={isNewPatrimonyOpen} onOpenChange={setIsNewPatrimonyOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader><DialogTitle className="text-white">Nuevo Patrimonio</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-sm text-slate-300 mb-1 block">Nombre</label><Input placeholder="Nombre" value={newPatrimonyAsset.name} onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, name: e.target.value })} className="bg-slate-700 border-slate-600 text-white" /></div>
            <div><label className="text-sm text-slate-300 mb-1 block">Categoría</label>
              <Select value={newPatrimonyAsset.category} onValueChange={(v) => setNewPatrimonyAsset({ ...newPatrimonyAsset, category: v })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">{patrimonyCategories.map((c) => (<SelectItem key={c.value} value={c.value} className="text-white">{c.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm text-slate-300 mb-1 block">Valor</label><Input type="number" placeholder="0.00" value={newPatrimonyAsset.value} onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, value: e.target.value })} className="bg-slate-700 border-slate-600 text-white" /></div>
            <Button onClick={handleCreatePatrimony} className="w-full bg-emerald-500 hover:bg-emerald-600">Crear</Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default LoansPage;