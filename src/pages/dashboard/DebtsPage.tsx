"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Banknote, AlertTriangle, TrendingDown } from "lucide-react";
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

const DebtsPage = () => {
  const navigate = useNavigate();
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDebt, setNewDebt] = useState({
    name: "",
    creditor: "",
    initial_amount: "",
    current_amount: "",
    interest_rate: "",
    monthly_payment: "",
    category: "personal",
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
      name: newDebt.name,
      creditor: newDebt.creditor,
      initial_amount: parseFloat(newDebt.initial_amount),
      current_amount: parseFloat(newDebt.current_amount),
      interest_rate: newDebt.interest_rate ? parseFloat(newDebt.interest_rate) : null,
      monthly_payment: newDebt.monthly_payment ? parseFloat(newDebt.monthly_payment) : null,
      category: newDebt.category,
    });

    if (!error) {
      setIsDialogOpen(false);
      setNewDebt({
        name: "",
        creditor: "",
        initial_amount: "",
        current_amount: "",
        interest_rate: "",
        monthly_payment: "",
        category: "personal",
      });
      fetchDebts(session.user.id);
    }
  };

  const totalDebt = debts.reduce((sum, d) => sum + parseFloat(d.current_amount), 0);
  const totalInitial = debts.reduce((sum, d) => sum + parseFloat(d.initial_amount), 0);
  const paidOff = totalInitial - totalDebt;

  const categories = [
    { value: "personal", label: "Personal" },
    { value: "mortgage", label: "Hipoteca" },
    { value: "car", label: "Coche" },
    { value: "credit_card", label: "Tarjeta de Crédito" },
    { value: "student", label: "Estudiante" },
    { value: "other", label: "Otros" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Deudas</h1>
            <p className="text-slate-400">Gestiona tus deudas pendientes</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Deuda
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Agregar Deuda</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-slate-300">Nombre</label>
                  <Input
                    placeholder="Nombre de la deuda"
                    value={newDebt.name}
                    onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Acreedor</label>
                  <Input
                    placeholder="Banco / Entidad"
                    value={newDebt.creditor}
                    onChange={(e) => setNewDebt({ ...newDebt, creditor: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-300">Monto Inicial</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newDebt.initial_amount}
                      onChange={(e) => setNewDebt({ ...newDebt, initial_amount: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">Monto Actual</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newDebt.current_amount}
                      onChange={(e) => setNewDebt({ ...newDebt, current_amount: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-300">Tasa de Interés (%)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newDebt.interest_rate}
                      onChange={(e) => setNewDebt({ ...newDebt, interest_rate: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">Pago Mensual</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newDebt.monthly_payment}
                      onChange={(e) => setNewDebt({ ...newDebt, monthly_payment: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-300">Categoría</label>
                  <Select value={newDebt.category} onValueChange={(v) => setNewDebt({ ...newDebt, category: v })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddDebt} className="w-full bg-orange-500 hover:bg-orange-600">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Banknote className="w-6 h-6 mx-auto mb-2 text-orange-400" />
              <p className="text-2xl font-bold text-white">{formatCurrency(totalDebt)}</p>
              <p className="text-xs text-slate-400">Total Deuda</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <TrendingDown className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
              <p className="text-2xl font-bold text-white">{formatCurrency(paidOff)}</p>
              <p className="text-xs text-slate-400">Pagado</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-rose-400" />
              <p className="text-2xl font-bold text-white">{debts.length}</p>
              <p className="text-xs text-slate-400">Deudas Activas</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de deudas */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Banknote className="w-5 h-5 text-orange-400" />
              Mis Deudas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400 text-center">Cargando...</p>
            ) : debts.length === 0 ? (
              <p className="text-slate-400 text-center">No hay deudas registradas</p>
            ) : (
              <div className="space-y-3">
                {debts.map((debt) => {
                  const progress = ((parseFloat(debt.initial_amount) - parseFloat(debt.current_amount)) / parseFloat(debt.initial_amount)) * 100;
                  return (
                    <div key={debt.id} className="p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-white">{debt.name}</p>
                          <p className="text-xs text-slate-400">{debt.creditor}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-400">{formatCurrency(debt.current_amount)}</p>
                          <p className="text-xs text-slate-400">de {formatCurrency(debt.initial_amount)}</p>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{progress.toFixed(1)}% pagado</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default DebtsPage;
