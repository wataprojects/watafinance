"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Banknote, 
  User, 
  TrendingUp, 
  TrendingDown as TrendingDownIcon, 
  X, 
  Pencil, 
  Trash2, 
  TrendingDown,
  Mail,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { formatCurrency } from "@/utils/currency";
import DebtStatusBadge from "@/components/dashboard/DebtStatusBadge";
import DebtDetailModal from "@/components/dashboard/DebtDetailModal";

type DebtType = "they_owe" | "i_owe";
type FilterType = "all" | "they_owe" | "i_owe";

interface Debt {
  id: string;
  name: string;
  creditor: string;
  initial_amount: number;
  current_amount: number;
  paid_amount: number;
  category: string;
  status: string;
  created_at: string;
  creditor_email?: string;
}

const DebtsPage = () => {
  const navigate = useNavigate();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [saving, setSaving] = useState(false);
  
  // Detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);
  
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

  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYearStr = currentYear.toString();
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  const [newDebt, setNewDebt] = useState({
    person_name: "",
    amount: "",
    description: "",
    debt_type: "they_owe" as DebtType,
    creditor_email: "",
  });

  const [editDebt, setEditDebt] = useState({
    id: "",
    person_name: "",
    amount: "",
    description: "",
    debt_type: "they_owe" as DebtType,
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
    }
  };

  const fetchDebts = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setDebts(data);
    setLoading(false);
  };

  const handleAddDebt = async () => {
    if (saving || !newDebt.person_name || !newDebt.amount) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }

    const { data, error } = await supabase.from("debts").insert({
      user_id: session.user.id,
      name: newDebt.person_name,
      creditor: newDebt.description,
      initial_amount: parseFloat(newDebt.amount),
      current_amount: parseFloat(newDebt.amount),
      category: newDebt.debt_type,
      status: 'pending',
      original_creator_id: session.user.id,
      // Save email for both debt types
      creditor_email: newDebt.creditor_email || null,
    }).select().single();

    // Send invite email if email provided (works for both debt types now)
    if (!error && data && newDebt.creditor_email) {
      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL || 'https://eoupodozovwxbldzptlp.supabase.co'}/functions/v1/send-debt-invite`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              debtId: data.id,
              creditorEmail: newDebt.creditor_email,
              creditorName: newDebt.person_name,
              amount: parseFloat(newDebt.amount),
              description: newDebt.description,
              debtType: newDebt.debt_type
            })
          }
        );
      } catch (e) {
        console.error('Failed to send invite:', e);
      }
    }

    setIsDialogOpen(false);
    setNewDebt({ person_name: "", amount: "", description: "", debt_type: "they_owe", creditor_email: "" });
    fetchDebts(session.user.id);
    setSaving(false);
  };

  const handleEditDebt = async () => {
    if (saving || !selectedDebt) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }

    await supabase.from("debts").update({
      name: editDebt.person_name,
      creditor: editDebt.description,
      initial_amount: parseFloat(editDebt.amount),
      current_amount: parseFloat(editDebt.amount),
      category: editDebt.debt_type,
    }).eq("id", selectedDebt.id);

    setIsEditDialogOpen(false);
    setSelectedDebt(null);
    fetchDebts(session.user.id);
    setSaving(false);
  };

  const handleDeleteDebt = async () => {
    if (!selectedDebt) return;
    await supabase.from("debts").delete().eq("id", selectedDebt.id);
    setIsDeleteDialogOpen(false);
    setSelectedDebt(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) fetchDebts(session.user.id);
  };

  const openEditDialog = (debt: Debt) => {
    setSelectedDebt(debt);
    setEditDebt({
      id: debt.id,
      person_name: debt.name || "",
      amount: debt.current_amount?.toString() || debt.initial_amount?.toString() || "",
      description: debt.creditor || "",
      debt_type: debt.category === "they_owe" ? "they_owe" : "i_owe",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsDeleteDialogOpen(true);
  };

  const openDetailModal = (debtId: string) => {
    setSelectedDebtId(debtId);
    setDetailModalOpen(true);
  };

  // Filter debts by type AND date
  const filteredDebts = debts.filter((debt) => {
    // Filter by type
    if (filterType !== "all") {
      if (filterType === "they_owe" && debt.category !== "they_owe") return false;
      if (filterType === "i_owe" && debt.category !== "i_owe") return false;
    }
    
    // Filter by date (created_at)
    if (debt.created_at) {
      const debtDate = new Date(debt.created_at);
      const debtYear = debtDate.getFullYear().toString();
      const debtMonth = (debtDate.getMonth() + 1).toString().padStart(2, '0');
      
      if (filterYear !== "all" && debtYear !== filterYear) return false;
      if (filterMonth !== "all" && debtMonth !== filterMonth) return false;
    }
    
    return true;
  });

  // Calculate totals for filtered debts
  const totalTheyOwe = filteredDebts
    .filter(d => d.category === "they_owe")
    .reduce((sum, d) => sum + parseFloat(d.current_amount || d.initial_amount || 0), 0);
  
  const totalIOwe = filteredDebts
    .filter(d => d.category === "i_owe")
    .reduce((sum, d) => sum + parseFloat(d.current_amount || d.initial_amount || 0), 0);

  const netBalance = totalTheyOwe - totalIOwe;

  return (
    <div className="min-h-screen bg-black pb-28">
      <DashboardHeader title="FinPro" subtitle="Gestión de Deudas" />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Date filters */}
        <div className="grid grid-cols-2 gap-4">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-full p-4 h-auto bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center justify-between hover:border-zinc-600 transition-all group">
              <span className="text-zinc-400 text-sm group-hover:text-zinc-300">Año</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-lg">{filterYear === "all" ? "Todos" : filterYear}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 max-h-[300px]">
              <SelectItem value="all" className="text-white">Todos</SelectItem>
              {years.map((year) => (
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

        {/* Totals - Darker backgrounds with brighter text */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-[#052e16] border-green-600/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-xs font-medium">Me deben</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(totalTheyOwe)}</p>
              <p className="text-green-500/60 text-[10px] mt-1">{filteredDebts.filter(d => d.category === "they_owe").length} deudas</p>
            </CardContent>
          </Card>

          <Card className="bg-[#450a0a] border-red-600/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingDownIcon className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-xs font-medium">Debo yo</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(totalIOwe)}</p>
              <p className="text-red-500/60 text-[10px] mt-1">{filteredDebts.filter(d => d.category === "i_owe").length} deudas</p>
            </CardContent>
          </Card>
        </div>

        {/* Net balance */}
        {netBalance !== 0 && (
          <Card className={`${netBalance >= 0 ? "bg-green-900/30 border-green-700/40" : "bg-red-900/30 border-red-700/40"}`}>
            <CardContent className="p-3 text-center">
              <p className={`text-sm font-medium ${netBalance >= 0 ? "text-green-400" : "text-red-400"}`}>
                Balance: {netBalance >= 0 ? "+" : ""}{formatCurrency(netBalance)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* New debt button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black py-4 text-sm font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Deuda
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Nueva deuda</DialogTitle>
            </DialogHeader>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-4 mt-4">
              {/* Debt type */}
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Tipo de deuda</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewDebt({ ...newDebt, debt_type: "they_owe" })}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      newDebt.debt_type === "they_owe"
                        ? "border-green-500 bg-green-500/20"
                        : "border-zinc-700 bg-zinc-800"
                    }`}
                  >
                    <TrendingUp className={`w-6 h-6 ${newDebt.debt_type === "they_owe" ? "text-green-400" : "text-zinc-400"}`} />
                    <span className={`font-medium ${newDebt.debt_type === "they_owe" ? "text-white" : "text-zinc-400"}`}>Me deben</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDebt({ ...newDebt, debt_type: "i_owe" })}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      newDebt.debt_type === "i_owe"
                        ? "border-red-500 bg-red-500/20"
                        : "border-zinc-700 bg-zinc-800"
                    }`}
                  >
                    <TrendingDownIcon className={`w-6 h-6 ${newDebt.debt_type === "i_owe" ? "text-red-400" : "text-zinc-400"}`} />
                    <span className={`font-medium ${newDebt.debt_type === "i_owe" ? "text-white" : "text-zinc-400"}`}>Debo yo</span>
                  </button>
                </div>
              </div>

              {/* Person name */}
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Persona *</label>
                <Input
                  placeholder="Nombre"
                  value={newDebt.person_name}
                  onChange={(e) => setNewDebt({ ...newDebt, person_name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              {/* Email - Now shows for BOTH debt types */}
              <div>
                <label className="text-sm text-zinc-400 mb-1 block flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {newDebt.debt_type === "they_owe" 
                    ? "Email de la persona (opcional)" 
                    : "Email de la persona a quien debo (opcional)"}
                </label>
                <Input
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={newDebt.creditor_email}
                  onChange={(e) => setNewDebt({ ...newDebt, creditor_email: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                {newDebt.creditor_email && (
                  <p className="text-xs text-amber-400 mt-2 flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    Se enviará una invitación por email para confirmar la deuda
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Cantidad (€) *</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newDebt.amount}
                  onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Motivo</label>
                <Input
                  placeholder="Ej: Cena sábado..."
                  value={newDebt.description}
                  onChange={(e) => setNewDebt({ ...newDebt, description: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <Button
                onClick={handleAddDebt}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Registrar deuda"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Debts list */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2 mb-4">
              <Banknote className="w-5 h-5 text-amber-500" />
              Deudas
            </CardTitle>
            {/* Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setFilterType("all")}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${
                  filterType === "all"
                    ? "bg-green-500 text-black"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType("they_owe")}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${
                  filterType === "they_owe"
                    ? "bg-green-500 text-black"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                Me deben
              </button>
              <button
                onClick={() => setFilterType("i_owe")}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${
                  filterType === "i_owe"
                    ? "bg-red-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                Debo yo
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : filteredDebts.length === 0 ? (
              <div className="text-center py-8">
                <Banknote className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                <p className="text-zinc-500 text-sm">No hay deudas en este período</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDebts.map((debt) => {
                  const isTheyOwe = debt.category === "they_owe";
                  return (
                    <div 
                      key={debt.id} 
                      className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-all cursor-pointer"
                      onClick={() => openDetailModal(debt.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isTheyOwe ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
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
                              {isTheyOwe ? "+" : "-"}{formatCurrency(debt.current_amount || debt.initial_amount)}
                            </p>
                            <DebtStatusBadge status={debt.status} size="sm" />
                          </div>
                          <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
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

      {/* Edit modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Editar deuda</DialogTitle>
          </DialogHeader>
          <button
            onClick={() => setIsEditDialogOpen(false)}
            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Persona *</label>
              <Input
                value={editDebt.person_name}
                onChange={(e) => setEditDebt({ ...editDebt, person_name: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Cantidad (€) *</label>
              <Input
                type="number"
                value={editDebt.amount}
                onChange={(e) => setEditDebt({ ...editDebt, amount: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <Button
              onClick={handleEditDebt}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete modal */}
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
            <p className="text-zinc-300">¿Estás seguro de que quieres eliminar esta deuda?</p>
            {selectedDebt && (
              <div className="p-4 bg-zinc-800/50 rounded-xl">
                <p className="text-white font-medium">{selectedDebt.name}</p>
                <p className="text-amber-400 font-bold">{formatCurrency(selectedDebt.current_amount || selectedDebt.initial_amount)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button onClick={handleDeleteDebt} className="flex-1 bg-red-500 hover:bg-red-600">
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail modal */}
      <DebtDetailModal
        debtId={selectedDebtId}
        isOpen={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      <BottomNav />
    </div>
  );
};

export default DebtsPage;