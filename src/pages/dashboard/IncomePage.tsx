"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TrendingUp, DollarSign, Briefcase, Home, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
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

type FilterType = "all" | "active" | "passive";

const IncomePage = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
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

  // Filtrar ingresos según el tipo seleccionado
  const filteredIncomes = incomes.filter((income) => {
    if (filterType === "active") return !income.is_passive;
    if (filterType === "passive") return income.is_passive;
    return true;
  });

  const totalIncome = filteredIncomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);

  // Agrupar por categoría
  const byCategory = filteredIncomes.reduce((acc, income) => {
    const cat = income.category;
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += parseFloat(income.amount);
    return acc;
  }, {} as Record<string, number>);

  const categories = [
    { value: "salary", label: "Salario", icon: Briefcase, color: "bg-blue-500/20 text-blue-400" },
    { value: "freelance", label: "Freelance", icon: DollarSign, color: "bg-purple-500/20 text-purple-400" },
    { value: "business", label: "Negocio", icon: TrendingUp, color: "bg-emerald-500/20 text-emerald-400" },
    { value: "rental", label: "Alquiler", icon: Home, color: "bg-amber-500/20 text-amber-400" },
    { value: "dividends", label: "Dividendos", icon: ArrowUpRight, color: "bg-cyan-500/20 text-cyan-400" },
    { value: "interest", label: "Intereses", icon: DollarSign, color: "bg-rose-500/20 text-rose-400" },
    { value: "other", label: "Otros", icon: DollarSign, color: "bg-slate-500/20 text-slate-400" },
  ];

  const inputCategories = [
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
                Nuevo
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
                      {inputCategories.map((cat) => (
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

        {/* Filtro */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterType("all")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "all"
                ? "bg-sky-500 text-white"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType("passive")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "passive"
                ? "bg-purple-500 text-white"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            Pasivos
          </button>
          <button
            onClick={() => setFilterType("active")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filterType === "active"
                ? "bg-blue-500 text-white"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            Activos
          </button>
        </div>

        {/* Total */}
        <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-white/80 text-sm mb-1">Total Ingresos</p>
            <p className="text-4xl font-bold text-white">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>

        {/* Por categoría */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {categories.map((cat) => {
            const value = byCategory[cat.value] || 0;
            if (value === 0) return null;
            const Icon = cat.icon;
            return (
              <Card key={cat.value} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-300">{cat.label}</span>
                  </div>
                  <p className="text-lg font-bold text-white">{formatCurrency(value)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lista de ingresos */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Historial
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400 text-center">Cargando...</p>
            ) : filteredIncomes.length === 0 ? (
              <p className="text-slate-400 text-center">No hay ingresos registrados</p>
            ) : (
              <div className="space-y-3">
                {filteredIncomes.map((income) => {
                  const cat = categories.find(c => c.value === income.category) || categories[categories.length - 1];
                  const Icon = cat.icon;
                  return (
                    <div key={income.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{income.description || cat.label}</p>
                          <p className="text-xs text-slate-400">{new Date(income.date).toLocaleDateString("es-ES")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">+{formatCurrency(income.amount)}</p>
                        <p className="text-xs text-slate-400">{income.is_passive ? "Pasivo" : "Activo"}</p>
                      </div>
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

export default IncomePage;