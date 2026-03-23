"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Briefcase, Home, Car, Wallet, PiggyBank, TrendingUp, Pencil, Trash2, X } from "lucide-react";
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [newAsset, setNewAsset] = useState({
    name: "",
    category: "real_estate",
    value: "",
    description: "",
  });
  const [editAsset, setEditAsset] = useState({
    id: "",
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
    const { data } = await supabase
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

  const handleEditAsset = async () => {
    if (!selectedAsset) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("patrimony")
      .update({
        name: editAsset.name,
        category: editAsset.category,
        value: parseFloat(editAsset.value),
        description: editAsset.description,
      })
      .eq("id", selectedAsset.id);

    if (!error) {
      setIsEditDialogOpen(false);
      setSelectedAsset(null);
      fetchPatrimony(session.user.id);
    }
  };

  const handleDeleteAsset = async () => {
    if (!selectedAsset) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("patrimony").delete().eq("id", selectedAsset.id);

    if (!error) {
      setIsDeleteDialogOpen(false);
      setSelectedAsset(null);
      fetchPatrimony(session.user.id);
    }
  };

  const openEditDialog = (asset: any) => {
    setSelectedAsset(asset);
    setEditAsset({
      id: asset.id,
      name: asset.name || "",
      category: asset.category || "real_estate",
      value: asset.value?.toString() || "",
      description: asset.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (asset: any) => {
    setSelectedAsset(asset);
    setIsDeleteDialogOpen(true);
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

  const byCategory = patrimony.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = 0;
    acc[p.category] += parseFloat(p.value);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-black pb-28">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Patrimonio</h1>
            <p className="text-blue-400 text-sm">Tu riqueza total</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Activo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-white">Agregar Activo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-zinc-400">Nombre</label>
                  <Input
                    placeholder="Nombre del activo"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Categoría</label>
                  <Select value={newAsset.category} onValueChange={(v) => setNewAsset({ ...newAsset, category: v })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="text-white">{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Valor</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newAsset.value}
                    onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Descripción</label>
                  <Input
                    placeholder="Descripción"
                    value={newAsset.description}
                    onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <Button onClick={handleAddAsset} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-gradient-to-r from-blue-900 to-zinc-900 border-blue-800 mb-6">
          <CardContent className="p-8 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <p className="text-5xl font-bold text-white mb-2">{formatCurrency(totalPatrimony)}</p>
            <p className="text-blue-300">Patrimonio Total</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {Object.entries(byCategory).map(([cat, value]) => {
            const Icon = getCategoryIcon(cat);
            const catLabel = categories.find(c => c.value === cat)?.label || cat;
            const numValue = typeof value === "number" ? value : 0;
            return (
              <Card key={cat} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <p className="text-lg font-bold text-white">{formatCurrency(numValue)}</p>
                  <p className="text-xs text-zinc-500">{catLabel}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Mis Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-zinc-500 text-center">Cargando...</p>
            ) : patrimony.length === 0 ? (
              <p className="text-zinc-500 text-center">No hay activos registrados</p>
            ) : (
              <div className="space-y-3">
                {patrimony.map((asset) => {
                  const Icon = getCategoryIcon(asset.category);
                  const percentage = totalPatrimony > 0 ? (parseFloat(asset.value) / totalPatrimony) * 100 : 0;
                  return (
                    <div key={asset.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(asset.category)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{asset.name}</p>
                          <p className="text-xs text-zinc-500">{asset.description || asset.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-white">{formatCurrency(asset.value)}</p>
                          <p className="text-xs text-zinc-500">{percentage.toFixed(1)}%</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => openEditDialog(asset)} className="p-2 rounded-lg hover:bg-zinc-700 transition-colors">
                            <Pencil className="w-4 h-4 text-zinc-400" />
                          </button>
                          <button onClick={() => openDeleteDialog(asset)} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
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
            <DialogTitle className="text-white">Editar Activo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-zinc-400">Nombre</label>
              <Input
                placeholder="Nombre del activo"
                value={editAsset.name}
                onChange={(e) => setEditAsset({ ...editAsset, name: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400">Categoría</label>
              <Select value={editAsset.category} onValueChange={(v) => setEditAsset({ ...editAsset, category: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white">{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-zinc-400">Valor</label>
              <Input
                type="number"
                placeholder="0.00"
                value={editAsset.value}
                onChange={(e) => setEditAsset({ ...editAsset, value: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400">Descripción</label>
              <Input
                placeholder="Descripción"
                value={editAsset.description}
                onChange={(e) => setEditAsset({ ...editAsset, description: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <Button onClick={handleEditAsset} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Eliminar Activo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300">¿Estás seguro de que quieres eliminar este activo?</p>
            {selectedAsset && (
              <div className="p-4 bg-zinc-800/50 rounded-xl">
                <p className="text-white font-medium">{selectedAsset.name}</p>
                <p className="text-blue-400 font-bold">{formatCurrency(selectedAsset.value)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800">
                Cancelar
              </Button>
              <Button onClick={handleDeleteAsset} className="flex-1 bg-red-500 hover:bg-red-600">
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

export default PatrimonyPage;