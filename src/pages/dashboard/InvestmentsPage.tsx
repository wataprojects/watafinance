"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TrendingUp, TrendingDown, BarChart3, PieChart, Laptop, Home, Briefcase, Film, Coins, Warehouse, Car, Bitcoin, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const formatCurrency = (amount: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

interface CategoryOption {
  value: string; label: string; icon: any; color: string; textColor: string;
}

const investmentCategories: CategoryOption[] = [
  { value: "digital", label: "Digital", icon: Laptop, color: "bg-blue-500/20", textColor: "text-blue-400" },
  { value: "inmuebles", label: "Inmuebles", icon: Home, color: "bg-emerald-500/20", textColor: "text-emerald-400" },
  { value: "bolsa", label: "Bolsa", icon: BarChart3, color: "bg-purple-500/20", textColor: "text-purple-400" },
  { value: "negocio", label: "Negocio", icon: Briefcase, color: "bg-amber-500/20", textColor: "text-amber-400" },
  { value: "contenido", label: "Contenido", icon: Film, color: "bg-rose-500/20", textColor: "text-rose-400" },
  { value: "oro", label: "Oro", icon: Coins, color: "bg-yellow-500/20", textColor: "text-yellow-400" },
  { value: "crypto", label: "Crypto", icon: Bitcoin, color: "bg-orange-500/20", textColor: "text-orange-400" },
  { value: "otros", label: "Otros", icon: MoreHorizontal, color: "bg-zinc-500/20", textColor: "text-zinc-400" },
];

const InvestmentsPage = () => {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [newInvestment, setNewInvestment] = useState({
    name: "", category: "digital", initial_value: "", current_value: "",
  });

  const [editInvestment, setEditInvestment] = useState({
    id: "", name: "", category: "digital", initial_value: "", current_value: "",
  });

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate("/login");
    else fetchInvestments(session.user.id);
  };

  const fetchInvestments = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase.from("investments").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data) setInvestments(data);
    setLoading(false);
  };

  const handleAddInvestment = async () => {
    if (!newInvestment.name || !newInvestment.initial_value || !newInvestment.current_value) {
      setError("Completa los campos obligatorios"); return;
    }
    setSaving(true); setError("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }

    const initial = parseFloat(newInvestment.initial_value);
    const current = parseFloat(newInvestment.current_value);
    const returnPct = initial > 0 ? ((current - initial) / initial) * 100 : 0;

    await supabase.from("investments").insert({
      user_id: session.user.id, name: newInvestment.name, type: newInvestment.category,
      initial_value: initial, current_value: current, return_percentage: returnPct,
    });

    setIsDialogOpen(false);
    setNewInvestment({ name: "", category: "digital", initial_value: "", current_value: "" });
    fetchInvestments(session.user.id);
    setSaving(false);
  };

  const handleEditInvestment = async () => {
    if (!selectedInvestment) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }

    const initial = parseFloat(editInvestment.initial_value);
    const current = parseFloat(editInvestment.current_value);
    const returnPct = initial > 0 ? ((current - initial) / initial) * 100 : 0;

    await supabase.from("investments").update({ name: editInvestment.name, type: editInvestment.category, initial_value: initial, current_value: current, return_percentage: returnPct }).eq("id", selectedInvestment.id);

    setIsEditDialogOpen(false); setSelectedInvestment(null);
    fetchInvestments(session.user.id);
    setSaving(false);
  };

  const handleDeleteInvestment = async () => {
    if (!selectedInvestment) return;
    await supabase.from("investments").delete().eq("id", selectedInvestment.id);
    setIsDeleteDialogOpen(false); setSelectedInvestment(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) fetchInvestments(session.user.id);
  };

  const openEditDialog = (inv: any) => {
    setSelectedInvestment(inv);
    setEditInvestment({ id: inv.id, name: inv.name || "", category: inv.type || "digital", initial_value: inv.initial_value?.toString() || "", current_value: inv.current_value?.toString() || "" });
    setIsEditDialogOpen(true);
  };

  const totalValue = investments.reduce((sum, i) => sum + parseFloat(i.current_value || 0), 0);
  const totalInitial = investments.reduce((sum, i) => sum + parseFloat(i.initial_value || 0), 0);
  const totalReturn = totalValue - totalInitial;
  const returnPercentage = totalInitial > 0 ? (totalReturn / totalInitial) * 100 : 0;

  const getCategoryInfo = (categoryValue: string) => investmentCategories.find((c) => c.value === categoryValue) || investmentCategories[investmentCategories.length - 1];

  return (
    <div className="min-h-screen bg-black pb-28">
      <DashboardHeader title="FinPro" subtitle="Gestión de Inversiones" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Inversiones</h1>
            <p className="text-purple-400 text-sm">Gestiona tu portafolio</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button className="bg-purple-500 hover:bg-purple-600"><Plus className="w-4 h-4 mr-2" />Nueva</Button></DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader><DialogTitle className="text-white">Agregar Inversión</DialogTitle></DialogHeader>
              <button onClick={() => setIsDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
              <div className="space-y-4 mt-4">
                <div><label className="text-sm text-zinc-400 mb-1 block">Nombre *</label><Input placeholder="Nombre" value={newInvestment.name} onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
                <div><label className="text-sm text-zinc-400 mb-1 block">Categoría</label>
                  <Select value={newInvestment.category} onValueChange={(v) => setNewInvestment({ ...newInvestment, category: v })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">{investmentCategories.map((cat) => (<SelectItem key={cat.value} value={cat.value} className="text-white">{cat.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm text-zinc-400 mb-1 block">Valor inicial (€) *</label><Input type="number" placeholder="0.00" value={newInvestment.initial_value} onChange={(e) => setNewInvestment({ ...newInvestment, initial_value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
                  <div><label className="text-sm text-zinc-400 mb-1 block">Valor actual (€) *</label><Input type="number" placeholder="0.00" value={newInvestment.current_value} onChange={(e) => setNewInvestment({ ...newInvestment, current_value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
                </div>
                {error && <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg"><p className="text-red-400 text-sm">{error}</p></div>}
                <Button onClick={handleAddInvestment} className="w-full bg-purple-500 hover:bg-purple-600" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><BarChart3 className="w-6 h-6 mx-auto mb-2 text-purple-400" /><p className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</p><p className="text-xs text-zinc-400">Valor Total</p></CardContent></Card>
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center">{totalReturn >= 0 ? <TrendingUp className="w-6 h-6 mx-auto mb-2 text-emerald-400" /> : <TrendingDown className="w-6 h-6 mx-auto mb-2 text-rose-400" />}<p className={`text-2xl font-bold ${totalReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{totalReturn >= 0 ? "+" : ""}{formatCurrency(totalReturn)}</p><p className="text-xs text-zinc-400">Retorno Total</p></CardContent></Card>
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><PieChart className="w-6 h-6 mx-auto mb-2 text-blue-400" /><p className={`text-2xl font-bold ${returnPercentage >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{returnPercentage >= 0 ? "+" : ""}{returnPercentage.toFixed(1)}%</p><p className="text-xs text-zinc-400">Porcentaje</p></CardContent></Card>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-400" />Mi Portafolio</CardTitle></CardHeader>
          <CardContent>
            {loading ? (<p className="text-zinc-400 text-center">Cargando...</p>) : investments.length === 0 ? (<p className="text-zinc-400 text-center">No hay inversiones</p>) : (
              <div className="space-y-3">
                {investments.map((inv) => {
                  const cat = getCategoryInfo(inv.type);
                  const Icon = cat.icon;
                  const returnVal = parseFloat(inv.current_value || 0) - parseFloat(inv.initial_value || 0);
                  const returnPct = parseFloat(inv.initial_value || 0) > 0 ? (returnVal / parseFloat(inv.initial_value || 0)) * 100 : 0;
                  return (
                    <div key={inv.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}><Icon className="w-6 h-6" /></div>
                        <div><p className="font-medium text-white">{inv.name}</p><p className="text-xs text-zinc-400">{cat.label}</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right"><p className="font-bold text-white">{formatCurrency(inv.current_value)}</p><p className={`text-xs ${returnVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{returnVal >= 0 ? "+" : ""}{returnPct.toFixed(1)}%</p></div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => openEditDialog(inv)} className="p-2 rounded-lg hover:bg-zinc-700"><Pencil className="w-4 h-4 text-zinc-400" /></button>
                          <button onClick={() => { setSelectedInvestment(inv); setIsDeleteDialogOpen(true); }} className="p-2 rounded-lg hover:bg-red-500/20"><Trash2 className="w-4 h-4 text-red-400" /></button>
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
          <DialogHeader><DialogTitle className="text-white">Editar Inversión</DialogTitle></DialogHeader>
          <button onClick={() => setIsEditDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <div className="space-y-4 mt-4">
            <div><label className="text-sm text-zinc-400 mb-1 block">Nombre *</label><Input value={editInvestment.name} onChange={(e) => setEditInvestment({ ...editInvestment, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block">Categoría</label>
              <Select value={editInvestment.category} onValueChange={(v) => setEditInvestment({ ...editInvestment, category: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">{investmentCategories.map((cat) => (<SelectItem key={cat.value} value={cat.value} className="text-white">{cat.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-zinc-400 mb-1 block">Valor inicial (€) *</label><Input type="number" value={editInvestment.initial_value} onChange={(e) => setEditInvestment({ ...editInvestment, initial_value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
              <div><label className="text-sm text-zinc-400 mb-1 block">Valor actual (€) *</label><Input type="number" value={editInvestment.current_value} onChange={(e) => setEditInvestment({ ...editInvestment, current_value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" /></div>
            </div>
            <Button onClick={handleEditInvestment} className="w-full bg-purple-500 hover:bg-purple-600" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Eliminar Inversión</DialogTitle></DialogHeader>
          <button onClick={() => setIsDeleteDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300">¿Eliminar esta inversión?</p>
            {selectedInvestment && (<div className="p-4 bg-zinc-800/50 rounded-xl"><p className="text-white font-medium">{selectedInvestment.name}</p><p className="text-purple-400 font-bold">{formatCurrency(selectedInvestment.current_value)}</p></div>)}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800">Cancelar</Button>
              <Button onClick={handleDeleteInvestment} className="flex-1 bg-red-500 hover:bg-red-600">Eliminar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default InvestmentsPage;