"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TrendingUp, DollarSign, Briefcase, Home, ArrowUpRight, ArrowDownRight } from "lucide-react";
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

const IncomePage = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIncome, setNewIncome] = useState({
    amount: "",
    description: "",
    category: "salary",
    is_passive: false,
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    } else {
      fetchIncomes(session.user.id);
    }
  };

  const fetchIncomes = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("incomes")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (data) setIncomes(data);
    setLoading(false);
  };

  const handleAddIncome = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("incomes").insert({
      user_id: session.user.id,
      amount: parseFloat(newIncome.amount),
      description: newIncome.description,
      category: newIncome.category,
      is_passive: newIncome.is_passive,
      date: newIncome.date,
    });

    if (!error) {
      setIsDialogOpen(false);
      setNewIncome({
        amount: "",
        description: "",
        category: "salary",
        is_passive: false,
        date: new Date().toISOString().split("T")[0],
      });
      fetchIncomes(session.user.id);
    }
  };

  const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const activeIncome = incomes.filter(i => !i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const passiveIncome = incomes.filter(i => i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount), 0);

  const categories = [
    { value: "salary", label: "Salario" },
    { value: "freelance", label: "Freelance" },
    { value: "business", label: "Negocio" },
    { value: "rental", label: "Alquiler" },
    { value: "dividends", label: "Dividendos" },
    { value: "interest", label: "Intereses" },
    { value: "other", label: "Otros" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Ingresos</h1>
            <p className="text-slate-400">Gestiona tus fuentes de dinero</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Ingreso
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Agregar Ingreso</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-slate-300">Monto</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Descripción</label>
                  <Input
                    placeholder="Descripción del ingreso"
                    value={newIncome.description}
                    onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Categoría</label>
                  <Select value={newIncome.category} onValueChange={(v) => setNewIncome({ ...newIncome, category: v })}>
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_passive"
                    checked={newIncome.is_passive}
                    onChange={(e) => setNewIncome({ ...newIncome, is_passive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_passive" className="text-sm text-slate-300">Es ingreso pasivo</label>
                </div>
                <Button onClick={handleAddIncome} className="w-full bg-emerald-500 hover:bg-emerald-600">
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
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
              <p className="text-2xl font-bold text-white">{formatCurrency(totalIncome)}</p>
              <p className="text-xs text-slate-400">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Briefcase className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <p className="text-2xl font-bold text-white">{formatCurrency(activeIncome)}</p>
              <p className="text-xs text-slate-400">Activos</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Home className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <p className="text-2xl font-bold text-white">{formatCurrency(passiveIncome)}</p>
              <p className="text-xs text-slate-400">Pasivos</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de ingresos */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Historial de Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400 text-center">Cargando...</p>
            ) : incomes.length === 0 ? (
              <p className="text-slate-400 text-center">No hay ingresos registrados</p>
            ) : (
              <div className="space-y-3">
                {incomes.map((income) => (
                  <div key={income.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${income.is_passive ? "bg-purple-500/20" : "bg-blue-500/20"}`}>
                        {income.is_passive ? (
                          <Home className="w-5 h-5 text-purple-400" />
                        ) : (
                          <Briefcase className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{income.description || income.category}</p>
                        <p className="text-xs text-slate-400">{new Date(income.date).toLocaleDateString("es-ES")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">+{formatCurrency(income.amount)}</p>
                      <p className="text-xs text-slate-400">{income.is_passive ? "Pasivo" : "Activo"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default IncomePage;
