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
import { Plus, Banknote, User, ChevronRight, TrendingUp, Building, TrendingDown as TrendingDownIcon, X, Link2, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";
import YearMonthPicker from "@/components/dashboard/YearMonthPicker";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateTo<dyad-write path="src/pages/dashboard/DebtsPage.tsx">
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
import { Plus, Banknote, User, ChevronRight, TrendingUp, Building, TrendingDown as TrendingDownIcon, X, Link2, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";
import YearMonthPicker from "@/components/dashboard/YearMonthPicker";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const safeDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr) return new Date();
  const date = new Date(dateStr + 'T00:00:00');
  return isNaN(date.getTime()) ? new Date() : date;
};

type DebtType = "they_owe" | "i_owe";
type FilterType = "all" | "they_owe" | "i_owe" | "settled";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

const DebtsPage = () => {
  const navigate = useNavigate();
  const [debts, setDebts] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [isInvestmentDialogOpen, setIsInvestmentDialogOpen] = useState(false);
  const [isPatrimonyDialogOpen, setIsPatrimonyDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYearStr = new Date().getFullYear().toString();
  const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
  const [filterYear, setFilterYear] = useState<string>(currentYearStr);
  
  const [saving, setSaving] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  
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

  const [editDebt, setEditDebt] = useState({
    id: "",
    person_name: "",
    amount: "",
    description: "",
    debt_type: "they_owe" as DebtType,
    date: new Date(),
    due_date: null as Date | null,
    notes: "",
    investment_id: "none",
    patrimony_id: "none",
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
    if (saving) return;
    if (!newDebt.person_name || !newDebt.amount) {
      alert("Por favor, completa los campos obligatorios");
      return;
    }

    setSaving(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("debts").insert({
      user_id: session.user.id,
      name: newDebt.person_name,
      creditor: newDebt.description,
      initial_amount: parseFloat(newDebt.amount),
      current_amount: parseFloat(newDebt.amount),
      interest_rate: null,
      monthly_payment: null,
      category: newDebt.debt_type,
      investment_id: newDebt.investment_id === "none" ? null : newDebt.investment_id,
      patrimony_id: newDebt.patrimony_id === "none" ? null : newDebt.patrimony_id,
    });

    if (error) {
      console.error("Error al guardar deuda:", error);
      alert("Error al guardar: " + error.message);
    } else {
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
    setSaving(false);
  };

  const handleEditDebt = async () => {
    if (saving || !selectedDebt) return;
    if (!editDebt.person_name || !editDebt.amount) {
      alert("Por favor, completa los campos obligatorios");
      return;
    }

    setSaving(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("debts").update({
      name: editDebt.person_name,
      creditor: editDebt.description,
      initial_amount: parseFloat(editDebt.amount),
      current_amount: parseFloat(editDebt.amount),
      category: editDebt.debt_type,
      investment_id: editDebt.investment_id === "none" ? null : editDebt.investment_id,
      patrimony_id: editDebt.patrimony_id === "none" ? null : editDebt.patrimony_id,
    }).eq("id", selectedDebt.id);

    if (error) {
      console.error("Error al editar deuda:", error);
      alert("Error al editar: " + error.message);
    } else {
      setIsEditDialogOpen(false);
      setSelectedDebt(null);
      fetchDebts(session.user.id);
    }
    setSaving(false);
  };

  const handleDeleteDebt = async () => {
    if (!selectedDebt) return;

    const { error } = await supabase.from("debts").delete().eq("id", selectedDebt.id);

    if (error) {
      console.error("Error al eliminar deuda:", error);
      alert("Error al eliminar: " + error.message);
    } else {
      setIsDeleteDialogOpen(false);
      setSelectedDebt(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchDebts(session.user.id);
    }
  };

  const openEditDialog = (debt: any) => {
    setSelectedDebt(debt);
    setEditDebt({
      id: debt.id,
      person_name: debt.name || "",
      amount: debt.current_amount?.toString() || debt.initial_amount?.toString() || "",
      description: debt.creditor || "",
      debt_type: debt.category === "they_owe" ? "they_owe" : "i_owe",
      date: safeDate(debt.created_at),
      due_date: debt.due_date ? safeDate(debt.due_date) : null,
      notes: debt.notes || "",
      investment_id: debt.investment_id || "none",
      patrimony_id: debt.patrimony_id || "none",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (debt: any) => {
    setSelectedDebt(debt);
    setIsDeleteDialogOpen(true);
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
      setNewDebt({ ...newDebt, investment_id: data.id });
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
      setNewDebt({ ...newDebt, patrimony_id: data.id });
      setIsNewPatrimonyOpen(false);
      setNewPatrimonyAsset({ name: "", category: "real_estate", value: "" });
    }
  };

  const filteredDebts = debts.filter((debt) => {
    // Filtrar por fecha
    if (debt.created_at) {
      const debtDate = new Date(debt.created_at + 'T00:00:00');
      if (!isNaN(debtDate.getTime())) {
        const debtYear = debtDate.getFullYear().toString();
        const debtMonth = (debtDate.getMonth() + 1).toString().padStart(2, '0');
        
        if (filterYear !== "all" && debtYear !== filterYear) return false;
        if (filterMonth !== "all" && debtMonth !== filterMonth) return false;
      }
    }
    
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

  return (
    <div className="min-h-screen bg-black pb-28">
      <div className="container mx-auto px-4 py-6">
        {/* Header - solo título y subtítulo */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Deudas</h1>
          <p className="text-amber-400 text-sm">Gestiona tus deudas y cobros</p>
        </div>

        {/* YearMonthPicker integrado */}
        <div className="mb-6">
          <YearMonthPicker
            selectedMonth={filterMonth}
            selectedYear={filterYear}
            setSelectedMonth={setFilterMonth}
            setSelectedYear={setFilterYear}
          />
        </div>

        {/* Segunda línea: botón Nueva */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          {/* Botón Nueva */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Nueva
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Nueva deuda</DialogTitle>
                <p className="text-zinc-400 text-sm">Registra quién debe a quién</p>
              </DialogHeader>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <DebtForm 
                debt={newDebt} 
                setDebt={setNewDebt} 
                onSubmit={handleAddDebt}
                isSubmitting={saving}
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
                handleCreateInvestment={handleCreateInvestment}
                handleCreatePatrimony={handleCreatePatrimony}
                investmentTypes={investmentTypes}
                patrimonyCategories={patrimonyCategories}
                isInvestmentDialogOpen={isInvestmentDialogOpen}
                setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
                isPatrimonyDialogOpen={isPatrimonyDialogOpen}
                setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
                getInvestmentLabel={getInvestmentLabel}
                getPatrimonyLabel={getPatrimonyLabel}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros de tipo de deuda */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterType("all")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "all"
                ? "bg-green-500 text-black"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterType("they_owe")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "they_owe"
                ? "bg-green-500 text-black"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Me deben
          </button>
          <button
            onClick={() => setFilterType("i_owe")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "i_owe"
                ? "bg-red-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Debo yo
          </button>
        </div>

        {/* Cards de totales */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-green-900/30 border-green-800">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-3xl font-bold text-green-500">{formatCurrency(totalTheyOwe)}</p>
              <p className="text-green-400 text-sm">Me deben</p>
            </CardContent>
          </Card>
          
          <Card className="bg-red-900/30 border-red-800">
            <CardContent className="p-6 text-center">
              <TrendingDownIcon className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <p className="text-3xl font-bold text-red-500">{formatCurrency(totalIOwe)}</p>
              <p className="text-red-400 text-sm">Debo yo</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de deudas */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Banknote className="w-5 h-5 text-amber-500" />
              Deudas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-zinc-500 text-center">Cargando...</p>
            ) : filteredDebts.length === 0 ? (
              <p className="text-zinc-500 text-center">No hay deudas registradas</p>
            ) : (
              <div className="space-y-3">
                {filteredDebts.map((debt) => {
                  const isTheyOwe = debt.category === "they_owe";
                  const isSettled = debt.status === "settled";
                  
                  return (
                    <div 
                      key={debt.id} 
                      className={`p-4 bg-zinc-800/50 rounded-xl ${isSettled ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isTheyOwe ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          }`}>
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{debt.name}</p>
                            <p className="text-xs text-zinc-500">{debt.creditor || "Sin motivo"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`font-bold ${isTheyOwe ? "text-green-500" : "text-red-500"}`}>
                              {isTheyOwe ? "+" : "-"}{formatCurrency(debt.current_amount)}
                            </p>
                            {isSettled && <p className="text-xs text-zinc-500">Saldada</p>}
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => openEditDialog(debt)}
                              className="p-2 rounded-lg hover:bg-zinc-700 transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-zinc-400" />
                            </button>
                            <button
                              onClick={() => openDeleteDialog(debt)}
                              className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
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

      {/* Modal edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Editar deuda</DialogTitle>
            <p className="text-zinc-400 text-sm">Modifica los datos de la deuda</p>
          </DialogHeader>
          <button 
            onClick={() => setIsEditDialogOpen(false)}
            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <DebtForm 
            debt={editDebt} 
            setDebt={setEditDebt} 
            onSubmit={handleEditDebt}
            isSubmitting={saving}
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
            handleCreateInvestment={handleCreateInvestment}
            handleCreatePatrimony={handleCreatePatrimony}
            investmentTypes={investmentTypes}
            patrimonyCategories={patrimonyCategories}
            isInvestmentDialogOpen={isInvestmentDialogOpen}
            setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
            isPatrimonyOpen={isPatrimonyDialogOpen}
            setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
            getInvestmentLabel={getInvestmentLabel}
            getPatrimonyLabel={getPatrimonyLabel}
          />
        </DialogContent>
      </Dialog>

      {/* Modal eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Eliminar deuda</DialogTitle>
          </DialogHeader>
          <button 
            onClick={() => setIsDeleteDialogOpen(false)}
            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300">
              ¿Estás seguro de que quieres eliminar esta deuda?
            </p>
            {selectedDebt && (
              <div className="p-4 bg-zinc-800/50 rounded-xl">
                <p className="text-white font-medium">{selectedDebt.name}</p>
                <p className="text-amber-400 font-bold">{formatCurrency(selectedDebt.current_amount)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800">
                Cancelar
              </Button>
              <Button onClick={handleDeleteDebt} className="flex-1 bg-red-500 hover:bg-red-600">
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
          <button 
            onClick={() => setIsNewInvestmentOpen(false)}
            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
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
            <Button onClick={handleCreateInvestment} className="w-full bg-emerald-500 hover:bg-emerald-600 text-black">Crear</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal nuevo patrimonio */}
      <Dialog open={isNewPatrimonyOpen} onOpenChange={setIsNewPatrimonyOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Nuevo Patrimonio</DialogTitle></DialogHeader>
          <button 
            onClick={() => setIsNewPatrimonyOpen(false)}
            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="space-y-3 mt-2">
            <div><label className="text-sm text-zinc-400 mb-1 block">Nombre</label><Input placeholder="Nombre" value={newPatrimonyAsset.name} onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Categoría</label>
              <Select value={newPatrimonyAsset.category} onValueChange={(v) => setNewPatrimonyAsset({ ...newPatrimonyAsset, category: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">{patrimonyCategories.map((c) => (<SelectItem key={c.value} value={c.value} className="text-white">{c.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Valor</label><Input type="number" placeholder="0.00" value={newPatrimonyAsset.value} onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
            <Button onClick={handleCreatePatrimony} className="w-full bg-sky-500 hover:bg-sky-600 text-white">Crear</Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

// Componente reutilizable para el formulario de deudas
const DebtForm = ({ debt, setDebt, onSubmit, isSubmitting, isNew, investments, patrimony, isNewInvestmentOpen, setIsNewInvestmentOpen, isNewPatrimonyOpen, setIsNewPatrimonyOpen, newInvestment, setNewInvestment, newPatrimonyAsset, setNewPatrimonyAsset, handleCreateInvestment, handleCreatePatrimony, investmentTypes, patrimonyCategories, isInvestmentDialogOpen, setIsInvestmentDialogOpen, isPatrimonyDialogOpen, setIsPatrimonyDialogOpen, getInvestmentLabel, getPatrimonyLabel }: any) => {
  const getInvestmentLabelLocal = () => debt.investment_id === "none" ? "Sin vincular" : investments.find((i: any) => i.id === debt.investment_id)?.name || "Sin vincular";
  const getPatrimonyLabelLocal = () => debt.patrimony_id === "none" ? "Sin vincular" : patrimony.find((p: any) => p.id === debt.patrimony_id)?.name || "Sin vincular";

  const handleStartDateChange = (date: Date | undefined) => {
    setDebt({ ...debt, date: date || new Date() });
  };

  const handleDueDateChange = (date: Date | undefined) => {
    setDebt({ ...debt, due_date: date || null });
  };

  return (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Tipo de deuda</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDebt({ ...debt, debt_type: "they_owe" })}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
              debt.debt_type === "they_owe"
                ? "border-green-500 bg-green-500/20"
                : "border-zinc-700 bg-zinc-800"
            }`}
          >
            <TrendingUp className={`w-6 h-6 ${debt.debt_type === "they_owe" ? "text-green-400" : "text-zinc-400"}`} />
            <span className={`font-medium ${debt.debt_type === "they_owe" ? "text-white" : "text-zinc-400"}`}>Me deben</span>
          </button>
          <button
            type="button"
            onClick={() => setDebt({ ...debt, debt_type: "i_owe" })}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
              debt.debt_type === "i_owe"
                ? "border-red-500 bg-red-500/20"
                : "border-zinc-700 bg-zinc-800"
            }`}
          >
            <TrendingDownIcon className={`w-6 h-6 ${debt.debt_type === "i_owe" ? "text-red-400" : "text-zinc-400"}`} />
            <span className={`font-medium ${debt.debt_type === "i_owe" ? "text-white" : "text-zinc-400"}`}>Debo yo</span>
          </button>
        </div>
      </div>
      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Persona *</label>
        <Input
          placeholder="Nombre"
          value={debt.person_name}
          onChange={(e) => setDebt({ ...debt, person_name: e.target.value })}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>
      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Cantidad (€) *</label>
        <Input
          type="number"
          placeholder="0.00"
          value={debt.amount}
          onChange={(e) => setDebt({ ...debt, amount: e.target.value })}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>
      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Motivo</label>
        <Input
          placeholder="Ej: Cena sábado, Préstamo piso..."
          value={debt.description}
          onChange={(e) => setDebt({ ...debt, description: e.target.value })}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Fecha inicio</label>
          <DatePicker
            date={debt.date}
            onDateChange={handleStartDateChange}
          />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Fecha fin (opcional)</label>
          <DatePicker
            date={debt.due_date || undefined}
            onDateChange={handleDueDateChange}
            placeholder="Sin fecha"
          />
        </div>
      </div>

      {/* Vinculación a Inversión */}
      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Vincular a inversión</label>
        <Dialog open={isInvestmentDialogOpen} onOpenChange={setIsInvestmentDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={`w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3 transition-all ${
                debt.investment_id !== "none" 
                  ? "border-emerald-500/50 bg-emerald-500/10" 
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                debt.investment_id !== "none" 
                  ? "bg-emerald-500/20" 
                  : "bg-zinc-700"
              }`}>
                <TrendingUp className={`w-4 h-4 ${debt.investment_id !== "none" ? "text-emerald-400" : "text-zinc-400"}`} />
              </div>
              <span className={`font-medium ${debt.investment_id !== "none" ? "text-emerald-400" : "text-zinc-400"}`}>
                {getInvestmentLabelLocal()}
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
              className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setDebt({ ...debt, investment_id: "none" });
                  setIsInvestmentDialogOpen(false);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  debt.investment_id === "none"
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
                    setDebt({ ...debt, investment_id: inv.id });
                    setIsInvestmentDialogOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    debt.investment_id === inv.id
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

      {/* Vinculación a Patrimonio */}
      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Vincular a patrimonio</label>
        <Dialog open={isPatrimonyDialogOpen} onOpenChange={setIsPatrimonyDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={`w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3 transition-all ${
                debt.patrimony_id !== "none" 
                  ? "border-sky-500/50 bg-sky-500/10" 
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                debt.patrimony_id !== "none" 
                  ? "bg-sky-500/20" 
                  : "bg-zinc-700"
              }`}>
                <Building className={`w-4 h-4 ${debt.patrimony_id !== "none" ? "text-sky-400" : "text-zinc-400"}`} />
              </div>
              <span className={`font-medium ${debt.patrimony_id !== "none" ? "text-sky-400" : "text-zinc-400"}`}>
                {getPatrimonyLabelLocal()}
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
                  setDebt({ ...debt, patrimony_id: "none" });
                  setIsPatrimonyDialogOpen(false);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  debt.patrimony_id === "none"
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
                    setDebt({ ...debt, patrimony_id: pat.id });
                    setIsPatrimonyDialogOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    debt.patrimony_id === pat.id
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

      <Button 
        onClick={onSubmit} 
        className="w-full bg-amber-500 hover:bg-amber-600 text-black"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Guardando..." : isNew ? "Registrar deuda" : "Guardar cambios"}
      </Button>
    </div>
  );
};

export default DebtsPage;