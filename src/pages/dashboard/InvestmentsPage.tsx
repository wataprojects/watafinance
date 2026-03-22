"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart } from "lucide-react";
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

const InvestmentsPage = () => {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    name: "",
    type: "stocks",
    initial_value: "",
    current_value: "",
    return_percentage: "",
    monthly_contribution: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    } else {
      fetchInvestments(session.user.id);
    }
  };

  const fetchInvestments = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setInvestments(data);
    setLoading(false);
  };

  const handleAddInvestment = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("investments").insert({
      user_id: session.user.id,
      name: newInvestment.name,
      type: newInvestment.type,
      initial_value: parseFloat(newInvestment.initial_value),
      current_value: parseFloat(newInvestment.current_value),
      return_percentage: newInvestment.return_percentage ? parseFloat(newInvestment.return_percentage) : null,
      monthly_contribution: newInvestment.monthly_contribution ? parseFloat(newInvestment.monthly_contribution) : null,
    });

    if (!error) {
      setIsDialogOpen(false);
      setNewInvestment({
        name: "",
        type: "stocks",
        initial_value: "",
        current_value: "",
        return_percentage: "",
        monthly_contribution: "",
      });
      fetchInvestments(session.user.id);
    }
  };

  const totalValue = investments.reduce((sum, i) => sum + parseFloat(i.current_value), 0);
  const totalInitial = investments.reduce((sum, i) => sum + parseFloat(i.initial_value), 0);
  const totalReturn = totalValue - totalInitial;
  const returnPercentage = totalInitial > 0 ? (totalReturn / totalInitial) * 100 : 0;

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      stocks: BarChart3,
      etf: PieChart,
      crypto: LineChart,
      bonds: TrendingUp,
      real_estate: TrendingUp,
      other: TrendingUp,
    };
    return icons[type] || TrendingUp;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      stocks: "bg-blue-500/20 text-blue-400",
      etf: "bg-purple-500/20 text-purple-400",
      crypto: "bg-yellow-500/20 text-yellow-400",
      bonds: "bg-emerald-500/20 text-emerald-400",
      real_estate: "bg-rose-500/20 text-rose-400",
      other: "bg-slate-500/20 text-slate-400",
    };
    return colors[type] || "bg-slate-500/20 text-slate-400";
  };

  const types = [
    { value: "stocks", label: "Acciones" },
    { value: "etf", label: "ETF" },
    { value: "crypto", label: "Criptomonedas" },
    { value: "bonds", label: "Bonos" },
    { value: "real_estate", label: "Bienes Raíces" },
    { value: "other", label: "Otros" },
  ];

  return (
    <div className="min-h-screen bg-black pb-28">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Inversiones</h1>
            <p className="text-purple-400 text-sm">Gestiona tu portafolio de inversiones</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-500 hover:bg-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Inversión
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-white">Agregar Inversión</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-zinc-300">Nombre</label>
                  <Input
                    placeholder="Nombre de la inversión"
                    value={newInvestment.name}
                    onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-300">Tipo</label>
                  <Select value={newInvestment.type} onValueChange={(v) => setNewInvestment({ ...newInvestment, type: v })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {types.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-zinc-300">Valor Inicial</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newInvestment.initial_value}
                      onChange={(e) => setNewInvestment({ ...newInvestment, initial_value: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-300">Valor Actual</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newInvestment.current_value}
                      onChange={(e) => setNewInvestment({ ...newInvestment, current_value: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-zinc-300">Retorno (%)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newInvestment.return_percentage}
                      onChange={(e) => setNewInvestment({ ...newInvestment, return_percentage: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-300">Aportación Mensual</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newInvestment.monthly_contribution}
                      onChange={(e) => setNewInvestment({ ...newInvestment, monthly_contribution: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
                <Button onClick={handleAddInvestment} className="w-full bg-purple-500 hover:bg-purple-600">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <p className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-zinc-400">Valor Total</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              {totalReturn >= 0 ? (
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
              ) : (
                <TrendingDown className="w-6 h-6 mx-auto mb-2 text-rose-400" />
              )}
              <p className={`text-2xl font-bold ${totalReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {totalReturn >= 0 ? "+" : ""}{formatCurrency(totalReturn)}
              </p>
              <p className="text-xs text-zinc-400">Retorno Total</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <PieChart className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <p className={`text-2xl font-bold ${returnPercentage >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {returnPercentage >= 0 ? "+" : ""}{returnPercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-zinc-400">Porcentaje</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de inversiones */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Mi Portafolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-zinc-400 text-center">Cargando...</p>
            ) : investments.length === 0 ? (
              <p className="text-zinc-400 text-center">No hay inversiones registradas</p>
            ) : (
              <div className="space-y-3">
                {investments.map((inv) => {
                  const Icon = getTypeIcon(inv.type);
                  const returnVal = parseFloat(inv.current_value) - parseFloat(inv.initial_value);
                  const returnPct = parseFloat(inv.initial_value) > 0 ? (returnVal / parseFloat(inv.initial_value)) * 100 : 0;
                  return (
                    <div key={inv.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(inv.type)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{inv.name}</p>
                          <p className="text-xs text-zinc-400">{inv.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{formatCurrency(inv.current_value)}</p>
                        <p className={`text-xs ${returnVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {returnVal >= 0 ? "+" : ""}{returnPct.toFixed(1)}%
                        </p>
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

export default InvestmentsPage;