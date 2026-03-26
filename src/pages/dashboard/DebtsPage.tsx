"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Banknote, User, TrendingUp, TrendingDown as TrendingDownIcon, X, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { formatCurrency } from "@/utils/currency";

type DebtType = "they_owe" | "i_owe";
type FilterType = "all" | "they_owe" | "i_owe";

const DebtsPage = () => {
  const navigate = useNavigate();
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [saving, setSaving] = useState(false);
  
  const [newDebt, setNewDebt] = useState({
    person_name: "",
    amount: "",
    description: "",
    debt_type: "they_owe" as DebtType,
  });

  const [editDebt, setEditDebt] = useState({
    id: "",
    person_name: "",
    amount: "",
    description: "",
    debt_type: "they_owe" as DebtType,
  });

  const years = Array.from({ length: new Date().getFullYear() - 1990 + 1 }, (_, i) => new Date().getFullYear() - i);
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
  const currentYear = new Date().getFullYear().toString();
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);

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

    await supabase.from("debts").insert({
      user_id: session.user.id,
      name: newDebt.person_name,
      creditor: newDebt.description,
      initial_amount: parseFloat(newDebt.amount),
      current_amount: parseFloat(newDebt.amount),
      category: newDebt.debt_type,
    });

    setIsDialogOpen(false);
    setNewDebt({ person_name: "", amount: "", description: "", debt_type: "they_owe" });
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

  const openEditDialog = (debt: any) => {
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

  const openDeleteDialog = (debt: any) => {
    setSelectedDebt(debt);
    setIsDeleteDialogOpen(true);
  };

  const filteredDebts = debts.filter((debt) => {
    if (filterType === "all") return true;
    if (filterType === "they_owe") return debt.category === "they_owe";
    if (filterType === "i_owe") return debt.category === "i_owe";
    return true;
  });

  const totalTheyOwe = debts.filter(d => d.category === "they_owe").reduce((sum, d) => sum + parseFloat(d.current_amount || d.initial_amount || 0), 0);
  const totalIOwe = debts.filter(d => d.category === "i_owe").reduce((sum, d) => sum + parseFloat(d.current_amount || d.initial_amount || 0), 0);

  return (
    <div className="min-h-screen bg-black pb-28">
      <DashboardHeader title="FinPro" subtitle="Gestión de Deudas" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex gap-2 flex-1">
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[90px] bg-zinc-800 border-zinc-700 text-white text-xs">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="text-white text-xs">{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-[90px] bg-zinc-800 border-zinc-700 text-white text-xs">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value} className="text-white text-xs">{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                <Plus className="w-4 h-4 mr-2" />Nueva
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
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Persona *</label>
                  <Input
                    placeholder="Nombre"
                    value={newDebt.person_name}
                    onChange={(e) => setNewDebt({ ...newDebt, person_name: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
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
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterType("all")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "all" ? "bg-green-500 text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterType("they_owe")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "they_owe" ? "bg-green-500 text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Me deben
          </button>
          <button
            onClick={() => setFilterType("i_owe")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "i_owe" ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Debo yo
          </button>
        </div>

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
                  return (
                    <div key={debt.id} className="p-4 bg-zinc-800/50 rounded-xl">
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

      <BottomNav />
    </div>
  );
};

export default DebtsPage;