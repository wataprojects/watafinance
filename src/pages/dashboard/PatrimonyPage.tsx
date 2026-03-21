"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Briefcase, Home, Car, Wallet, PiggyBank, TrendingUp } from "lucide-react";
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

const PatrimonyPage = () => {
  const navigate = useNavigate();
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: "",
    category: "real_estate",
    value: "",
    description: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    } else {
      fetchPatrimony(session.user.id);
    }
  };

  const fetchPatrimony = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("patrimony")
      .select("*")
      .eq("user_id", userId)
      .order("value", { ascending: false });

    if (data) setPatrimony(data);
    setLoading(false);
  };

  const handleAddAsset = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("patrimony").insert({
      user_id: session.user.id,
      name: newAsset.name,
      category: newAsset.category,
      value: parseFloat(newAsset.value),
      description: newAsset.description,
    });

    if (!error) {
      setIsDialogOpen(false);
      setNewAsset({
        name: "",
        category: "real_estate",
        value: "",
        description: "",
      });
      fetchPatrimony(session.user.id);
    }
  };

  const totalPatrimony = patrimony.reduce((sum, p) => sum + parseFloat(p.value), 0);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      real_estate: Home,
      vehicle: Car,
      investments: TrendingUp,
      savings: PiggyBank,
      business: Briefcase,
      other: Wallet,
    };
    return icons[category] || Wallet;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      real_estate: "bg-blue-500/20 text-blue-400",
      vehicle: "bg-purple-500/20 text-purple-400",
      investments: "bg-emerald-500/20 text-emerald-400",
      savings: "bg-yellow-500/20 text-yellow-400",
      business: "bg-rose-500/20 text-rose-400",
      other: "bg-slate-500/20 text-slate-400",
    };
    return colors[category] || "bg-slate-500/20 text-slate-400";
  };

  const categories = [
    { value: "real_estate", label: "Bienes Raíces" },
    { value: "vehicle", label: "Vehículos" },
    { value: "investments", label: "Inversiones" },
    { value: "savings", label: "Ahorros" },
    { value: "business", label: "Negocios" },
    { value: "other", label: "Otros" },
  ];

  // Agrupar por categoría
  const byCategory = patrimony.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = 0;
    acc[p.category] += parseFloat(p.value);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patrimonio</h1>
            <p className="text-slate-500">Tu riqueza total</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-500 hover:bg-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Activo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Agregar Activo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-slate-300">Nombre</label>
                  <Input
                    placeholder="Nombre del activo"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Categoría</label>
                  <Select value={newAsset.category} onValueChange={(v) => setNewAsset({ ...newAsset, category: v })}>
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
                <div>
                  <label className="text-sm text-slate-300">Valor</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newAsset.value}
                    onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Descripción (opcional)</label>
                  <Input
                    placeholder="Descripción"
                    value={newAsset.description}
                    onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={handleAddAsset} className="w-full bg-indigo-500 hover:bg-indigo-600">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Total Patrimonio */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
          <CardContent className="p-8 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-white/80" />
            <p className="text-5xl font-bold text-white mb-2">{formatCurrency(totalPatrimony)}</p>
            <p className="text-white/80">Patrimonio Total</p>
          </CardContent>
        </Card>

        {/* Por categoría */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {Object.entries(byCategory).map(([cat, value]) => {
              const Icon = getCategoryIcon(cat);
              const catLabel = categories.find(c => c.value === cat)?.label || cat;
              const numValue = typeof value === 'number' ? value : 0;
              return (
              <Card key={cat} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                  <p className="text-lg font-bold text-white">{formatCurrency(numValue)}</p>
                  <p className="text-xs text-slate-400">{catLabel}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lista de activos */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              Mis Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400 text-center">Cargando...</p>
            ) : patrimony.length === 0 ? (
              <p className="text-slate-400 text-center">No hay activos registrados</p>
            ) : (
              <div className="space-y-3">
                {patrimony.map((asset) => {
                  const Icon = getCategoryIcon(asset.category);
                  const percentage = totalPatrimony > 0 ? (parseFloat(asset.value) / totalPatrimony) * 100 : 0;
                  return (
                    <div key={asset.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(asset.category)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{asset.name}</p>
                          <p className="text-xs text-slate-400">{asset.description || asset.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{formatCurrency(asset.value)}</p>
                        <p className="text-xs text-slate-400">{percentage.toFixed(1)}%</p>
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

export default PatrimonyPage;
