"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Banknote, User, Calendar as CalendarIcon, ChevronRight, TrendingUp, Building, TrendingDown as TrendingDownIcon } from "lucide-react";
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

// Función para convertir Date a string YYYY-MM-DD sin problemas de timezone
const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type DebtType = "they_owe" | "i_owe";
type FilterType = "all" | "they_owe" | "i_owe" | "settled";

const DebtsPage = () => {
  const navigate = useNavigate();
  const [debts, setDebts] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDueDatePickerOpen, setIsDueDatePickerOpen] = useState(false);
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  
  const [newDebt, setNewDebt] = useState({
    person_name: "",
    amount: "",
    description: "",
    debt_type: "they_owe" as DebtType,
    date: new Date(),
    due_date: null as Date | null,
    notes: "",
    investment_id: "none",
    patrimony_id: "none",
    status: "pending",
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
      fetchDebts(session.user.id);
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

  const fetchDebts = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setDebts(data);
    setLoading(false);
  };

  const handleAddDebt = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
  
      const { error } = await supabase.from("debts").insert({
        user_id: session.user.id,
        name: newDebt.person_name,
        creditor: newDebt.description,
        initial_amount: parseFloat(newDebt.amount),
        current_amount: parseFloat(newDebt.amount),
        interest_rate: null,
        monthly_payment: null,
        category: newDebt.debt_type,
        date: formatDateToISO(newDebt.date),
        due_date: newDebt.due_date ? formatDateToISO(newDebt.due_date) : null,
      });

    if (!error) {
      setIsDialogOpen(false);
      setNewDebt({
        person_name: "",
        amount: "",
        description: "",
        debt_type: "they_owe",
        date: new Date(),
        due_date: null,
        notes: "",
        investment_id: "none",
        patrimony_id: "none",
        status: "pending",
      });
      fetchDebts(session.user.id);
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
      setNewDebt({ ...newDebt, investment_id: data.id });
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
      setNewDebt({ ...newDebt, patrimony_id: data.id });
      setIsNewPatrimonyOpen(false);
      setNewPatrimonyAsset({ name: "", category: "real_estate", value: "" });
    }
  };

  const filteredDebts = debts.filter((debt) => {
    const isTheyOwe = debt.category === "they_owe";
    const isIOwe = debt.category === "i_owe";
    const isSettled = debt.status === "settled";
    
    if (filterType === "all") return true;
    if (filterType === "they_owe") return isTheyOwe && !isSettled;
    if (filterType === "i_owe") return isIOwe && !isSettled;
    if (filterType === "settled") return isSettled;
    return true;
  });

  const totalTheyOwe = debts
    .filter(d => d.category === "they_owe" && d.status !== "settled")
    .reduce((sum, d) => sum + parseFloat(d.current_amount), 0);
    
  const totalIOwe = debts
    .filter(d => d.category === "i_owe" && d.status !== "settled")
    .reduce((sum, d) => sum + parseFloat(d.current_amount), 0);

  const getInvestmentLabel = () => {
    if (newDebt.investment_id === "none") return "Sin vincular";
    const inv = investments.find(i => i.id === newDebt.investment_id);
    return inv ? inv.name : "Sin vincular";
  };

  const getPatrimonyLabel = () => {
    if (newDebt.patrimony_id === "none") return "Sin vincular";
    const pat = patrimony.find(p => p.id === newDebt.patrimony_id);
    return pat ? pat.name : "Sin vincular";
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

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Deudas</h1>
            <p className="text-slate-500">Gestiona préstamos y cobros</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Nueva
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-slate-200 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-slate-900">Nueva deuda</DialogTitle>
                <p className="text-slate-500 text-sm">Registra quién debe a quién</p>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Tipo de deuda - Toggle */}
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Tipo de deuda</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewDebt({ ...newDebt, debt_type: "they_owe" })}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        newDebt.debt_type === "they_owe"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <TrendingUp className={`w-6 h-6 ${newDebt.debt_type === "they_owe" ? "text-emerald-600" : "text-slate-400"}`} />
                      <span className={`font-medium ${newDebt.debt_type === "they_owe" ? "text-slate-900" : "text-slate-600"}`}>Me deben</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDebt({ ...newDebt, debt_type: "i_owe" })}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        newDebt.debt_type === "i_owe"
                          ? "border-rose-500 bg-rose-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <TrendingDownIcon className={`w-6 h-6 ${newDebt.debt_type === "i_owe" ? "text-rose-600" : "text-slate-400"}`} />
                      <span className={`font-medium ${newDebt.debt_type === "i_owe" ? "text-slate-900" : "text-slate-600"}`}>Debo yo</span>
                    </button>
                  </div>
                </div>

                {/* Persona */}
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Persona</label>
                  <Input
                    placeholder="Nombre"
                    value={newDebt.person_name}
                    onChange={(e) => setNewDebt({ ...newDebt, person_name: e.target.value })}
                    className="bg-slate-50 border-slate-200 text-slate-900"
                  />
                </div>

                {/* Cantidad */}
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Cantidad (€)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newDebt.amount}
                    onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
                    className="bg-slate-50 border-slate-200 text-slate-900"
                  />
                </div>

                {/* Motivo */}
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Motivo</label>
                  <Input
                    placeholder="Ej: Cena sábado, Préstamo piso..."
                    value={newDebt.description}
                    onChange={(e) => setNewDebt({ ...newDebt, description: e.target.value })}
                    className="bg-slate-50 border-slate-200 text-slate-900"
                  />
                </div>

                {/* Fecha */}
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Fecha</label>
                  <DatePicker
                    date={newDebt.date}
                    onDateChange={(date) => setNewDebt({ ...newDebt, date })}
                  />
                </div>

                {/* Vence (opcional) */}
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Vence (opcional)</label>
                  <DatePicker
                    date={newDebt.due_date || new Date()}
                    onDateChange={(date) => setNewDebt({ ...newDebt, due_date: date })}
                    placeholder="Seleccionar fecha"
                  />
                </div>

                {/* Notas (opcional) */}
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Notas (opcional)</label>
                  <Textarea
                    placeholder="Notas adicionales..."
                    value={newDebt.notes}
                    onChange={(e) => setNewDebt({ ...newDebt, notes: e.target.value })}
                    className="bg-slate-50 border-slate-200 text-slate-900"
                    rows={3}
                  />
                </div>

                {/* Asociar Inversión */}
                <div>
                  <Select value={newDebt.investment_id} onValueChange={(v) => {
                    if (v === "new") {
                      setIsNewInvestmentOpen(true);
                    } else {
                      setNewDebt({ ...newDebt, investment_id: v });
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
                          <TrendingDownIcon className="w-4 h-4" />
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

                {/* Asociar Patrimonio */}
                <div>
                  <Select value={newDebt.patrimony_id} onValueChange={(v) => {
                    if (v === "new") {
                      setIsNewPatrimonyOpen(true);
                    } else {
                      setNewDebt({ ...newDebt, patrimony_id: v });
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
                          <TrendingDownIcon className="w-4 h-4" />
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

                <Button onClick={handleAddDebt} className="w-full bg-orange-500 hover:bg-orange-600">
                  Registrar deuda
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumen superior - 2 tarjetas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Me deben */}
          <Card className="bg-emerald-500/20 border-emerald-500/40">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <p className="text-3xl font-bold text-white">{formatCurrency(totalTheyOwe)}</p>
              <p className="text-emerald-300 text-sm">Me deben</p>
            </CardContent>
          </Card>
          
          {/* Debo yo */}
          <Card className="bg-rose-500/20 border-rose-500/40">
            <CardContent className="p-6 text-center">
              <TrendingDownIcon className="w-8 h-8 mx-auto mb-2 text-rose-400" />
              <p className="text-3xl font-bold text-white">{formatCurrency(totalIOwe)}</p>
              <p className="text-rose-300 text-sm">Debo yo</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterType("all")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "all"
                ? "bg-sky-500 text-white"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterType("they_owe")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "they_owe"
                ? "bg-emerald-500 text-white"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            Me deben
          </button>
          <button
            onClick={() => setFilterType("i_owe")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "i_owe"
                ? "bg-rose-500 text-white"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            Debo yo
          </button>
          <button
            onClick={() => setFilterType("settled")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "settled"
                ? "bg-slate-500 text-white"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            Saldadas
          </button>
        </div>

        {/* Listado de deudas */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Banknote className="w-5 h-5 text-orange-400" />
              Deudas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400 text-center">Cargando...</p>
            ) : filteredDebts.length === 0 ? (
              <p className="text-slate-400 text-center">No hay deudas registradas</p>
            ) : (
              <div className="space-y-3">
                {filteredDebts.map((debt) => {
                  const isTheyOwe = debt.category === "they_owe";
                  const isSettled = debt.status === "settled";
                  
                  return (
                    <div 
                      key={debt.id} 
                      className={`p-4 bg-white/5 rounded-xl ${isSettled ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isTheyOwe ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                          }`}>
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{debt.name}</p>
                            <p className="text-xs text-slate-400">{debt.creditor || "Sin motivo"}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(debt.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${isTheyOwe ? "text-emerald-400" : "text-rose-400"}`}>
                            {isTheyOwe ? "+" : "-"}{formatCurrency(debt.current_amount)}
                          </p>
                          {isSettled && <p className="text-xs text-slate-500">Saldada</p>}
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

      <BottomNav />
    </div>
  );
};

export default DebtsPage;