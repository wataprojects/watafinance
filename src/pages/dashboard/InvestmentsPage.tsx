"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, TrendingUp, TrendingDown, BarChart3, PieChart, 
  Laptop, Home, Briefcase, Film, Coins, Warehouse, Car, Bitcoin, 
  Fuel, MoreHorizontal, ChevronRight, X, DollarSign, Wallet, CreditCard,
  PiggyBank, Building, Globe, Smartphone, Music, BookOpen, Car as CarIcon,
  Plane, Sparkles, Flame, Shield, Wifi, Heart, ShoppingCart, Shirt, Link2, Landmark,
  Pencil, Trash2, ChevronDown
} from "lucide-react";
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

interface CategoryOption {
  value: string;
  label: string;
  icon: any;
  color: string;
  textColor: string;
}

interface CapitalBreakdownItem {
  id: string;
  name: string;
  amount: number;
}

const availableIcons = [
  { value: "Laptop", icon: Laptop },
  { value: "Home", icon: Home },
  { value: "Briefcase", icon: Briefcase },
  { value: "Film", icon: Film },
  { value: "Coins", icon: Coins },
  { value: "Warehouse", icon: Warehouse },
  { value: "Car", icon: Car },
  { value: "Bitcoin", icon: Bitcoin },
  { value: "Fuel", icon: Fuel },
  { value: "MoreHorizontal", icon: MoreHorizontal },
  { value: "DollarSign", icon: DollarSign },
  { value: "Wallet", icon: Wallet },
  { value: "CreditCard", icon: CreditCard },
  { value: "PiggyBank", icon: PiggyBank },
  { value: "Building", icon: Building },
  { value: "Globe", icon: Globe },
  { value: "Smartphone", icon: Smartphone },
  { value: "Music", icon: Music },
  { value: "BookOpen", icon: BookOpen },
  { value: "CarIcon", icon: CarIcon },
  { value: "Plane", icon: Plane },
  { value: "Sparkles", icon: Sparkles },
  { value: "Flame", icon: Flame },
  { value: "Shield", icon: Shield },
  { value: "Wifi", icon: Wifi },
  { value: "Heart", icon: Heart },
  { value: "ShoppingCart", icon: ShoppingCart },
  { value: "Shirt", icon: Shirt },
];

const investmentCategories: CategoryOption[] = [
  { value: "digital", label: "Digital", icon: Laptop, color: "bg-blue-500/20", textColor: "text-blue-400" },
  { value: "inmuebles", label: "Inmuebles", icon: Home, color: "bg-emerald-500/20", textColor: "text-emerald-400" },
  { value: "bolsa", label: "Bolsa", icon: BarChart3, color: "bg-purple-500/20", textColor: "text-purple-400" },
  { value: "negocio", label: "Negocio", icon: Briefcase, color: "bg-amber-500/20", textColor: "text-amber-400" },
  { value: "contenido", label: "Contenido", icon: Film, color: "bg-rose-500/20", textColor: "text-rose-400" },
  { value: "oro", label: "Oro", icon: Coins, color: "bg-yellow-500/20", textColor: "text-yellow-400" },
  { value: "plata", label: "Plata", icon: Coins, color: "bg-slate-500/20", textColor: "text-slate-400" },
  { value: "trasteros", label: "Trasteros", icon: Warehouse, color: "bg-cyan-500/20", textColor: "text-cyan-400" },
  { value: "parkings", label: "Parkings", icon: Car, color: "bg-indigo-500/20", textColor: "text-indigo-400" },
  { value: "crypto", label: "Crypto", icon: Bitcoin, color: "bg-orange-500/20", textColor: "text-orange-400" },
  { value: "petroleo", label: "Petroleum", icon: Fuel, color: "bg-red-500/20", textColor: "text-red-400" },
  { value: "otros", label: "Otros", icon: MoreHorizontal, color: "bg-zinc-500/20", textColor: "text-zinc-400" },
];

const categoryColors = [
  { value: "bg-blue-500/20", textColor: "text-blue-400", label: "Azul" },
  { value: "bg-emerald-500/20", textColor: "text-emerald-400", label: "Verde" },
  { value: "bg-purple-500/20", textColor: "text-purple-400", label: "Morado" },
  { value: "bg-cyan-500/20", textColor: "text-cyan-400", label: "Cian" },
  { value: "bg-amber-500/20", textColor: "text-amber-400", label: "Ámbar" },
  { value: "bg-green-500/20", textColor: "text-green-400", label: "Verde claro" },
  { value: "bg-slate-500/20", textColor: "text-slate-400", label: "Gris" },
  { value: "bg-pink-500/20", textColor: "text-pink-400", label: "Rosa" },
  { value: "bg-orange-500/20", textColor: "text-orange-400", label: "Naranja" },
  { value: "bg-red-500/20", textColor: "text-red-400", label: "Rojo" },
];

const patrimonyCategories = [
  { value: "real_estate", label: "Bienes Raíces" },
  { value: "vehicle", label: "Vehículos" },
  { value: "investments", label: "Inversiones" },
  { value: "savings", label: "Ahorros" },
  { value: "business", label: "Negocios" },
  { value: "other", label: "Otros" },
];

const InvestmentsPage = () => {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [isPatrimonyDialogOpen, setIsPatrimonyDialogOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [expandedInvestId, setExpandedInvestId] = useState<string | null>(null);
  
  const [newInvestment, setNewInvestment] = useState({
    name: "",
    category: "digital",
    initial_value: "",
    current_value: "",
    loan_id: "none",
    patrimony_id: "none",
    capital_breakdown: [] as CapitalBreakdownItem[],
  });

  const [editInvestment, setEditInvestment] = useState({
    id: "",
    name: "",
    category: "digital",
    initial_value: "",
    current_value: "",
    loan_id: "none",
    patrimony_id: "none",
    capital_breakdown: [] as CapitalBreakdownItem[],
  });

  const [newBreakdownItem, setNewBreakdownItem] = useState({
    name: "",
    amount: "",
  });

  const [newPatrimonyAsset, setNewPatrimonyAsset] = useState({
    name: "",
    category: "real_estate",
    value: "",
  });

  const [newCustomCategory, setNewCustomCategory] = useState({
    name: "",
    icon: "MoreHorizontal",
    color: "bg-purple-500/20",
    textColor: "text-purple-400",
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
      fetchOptions(session.user.id);
    }
  };

  const fetchOptions = async (userId: string) => {
    const [loansResult, patrimonyResult] = await Promise.all([
      supabase.from("loans").select("id, borrower_name, bank").eq("user_id", userId).eq("status", "active"),
      supabase.from("patrimony").select("id, name, category").eq("user_id", userId),
    ]);
    if (loansResult.data) setLoans(loansResult.data);
    if (patrimonyResult.data) setPatrimony(patrimonyResult.data);
  };

  const fetchInvestments = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) {
      const parsedData = data.map((inv: any) => ({
        ...inv,
        capital_breakdown:
          typeof inv.capital_breakdown === "string"
            ? JSON.parse(inv.capital_breakdown)
            : Array.isArray(inv.capital_breakdown)
              ? inv.capital_breakdown
              : [],
      }));
      setInvestments(parsedData);
    }
    setLoading(false);
  };

  const handleAddInvestment = async () => {
    if (!newInvestment.name || !newInvestment.initial_value || !newInvestment.current_value) {
      setError("Por favor, completa los campos obligatorios");
      return;
    }

    setSaving(true);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSaving(false);
      return;
    }

    const initial = parseFloat(newInvestment.initial_value);
    const current = parseFloat(newInvestment.current_value);
    const returnPct = initial > 0 ? ((current - initial) / initial) * 100 : 0;

    const fullInsertData: any = {
      user_id: session.user.id,
      name: newInvestment.name,
      type: newInvestment.category,
      initial_value: initial,
      current_value: current,
      return_percentage: returnPct,
      capital_breakdown: newInvestment.capital_breakdown.length > 0 ? JSON.stringify(newInvestment.capital_breakdown) : null,
    };

    if (newInvestment.loan_id !== "none" && newInvestment.loan_id) {
      fullInsertData.loan_id = newInvestment.loan_id;
    }

    const fallbackInsertData: any = {
      user_id: session.user.id,
      name: newInvestment.name,
      type: newInvestment.category,
      initial_value: initial,
      current_value: current,
      return_percentage: returnPct,
    };

    if (newInvestment.loan_id !== "none" && newInvestment.loan_id) {
      fallbackInsertData.loan_id = newInvestment.loan_id;
    }

    const { error: insertError } = await supabase.from("investments").insert(fullInsertData);

    if (insertError && (insertError.message.includes("capital_breakdown") || insertError.message.includes("loan_id"))) {
      const { error: retryError } = await supabase.from("investments").insert(fallbackInsertData);

      if (retryError) {
        setError("Error al guardar: " + retryError.message);
        setSaving(false);
        return;
      }
    } else if (insertError) {
      setError("Error al guardar: " + insertError.message);
      setSaving(false);
      return;
    }

    setIsDialogOpen(false);
    setNewInvestment({
      name: "",
      category: "digital",
      initial_value: "",
      current_value: "",
      loan_id: "none",
      patrimony_id: "none",
      capital_breakdown: [],
    });
    setError("");
    fetchInvestments(session.user.id);
    setSaving(false);
  };

  const handleEditInvestment = async () => {
    if (!selectedInvestment) return;
    if (!editInvestment.name || !editInvestment.initial_value || !editInvestment.current_value) {
      setError("Por favor, completa los campos obligatorios");
      return;
    }

    setSaving(true);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSaving(false);
      return;
    }

    const initial = parseFloat(editInvestment.initial_value);
    const current = parseFloat(editInvestment.current_value);
    const returnPct = initial > 0 ? ((current - initial) / initial) * 100 : 0;

    const fullUpdateData: any = {
      name: editInvestment.name,
      type: editInvestment.category,
      initial_value: initial,
      current_value: current,
      return_percentage: returnPct,
      capital_breakdown: editInvestment.capital_breakdown.length > 0 ? JSON.stringify(editInvestment.capital_breakdown) : null,
    };

    const fallbackUpdateData: any = {
      name: editInvestment.name,
      type: editInvestment.category,
      initial_value: initial,
      current_value: current,
      return_percentage: returnPct,
    };

    const { error: updateError } = await supabase
      .from("investments")
      .update(fullUpdateData)
      .eq("id", selectedInvestment.id);

    if (updateError && updateError.message.includes("capital_breakdown")) {
      const { error: retryError } = await supabase
        .from("investments")
        .update(fallbackUpdateData)
        .eq("id", selectedInvestment.id);

      if (retryError) {
        setError("Error al guardar: " + retryError.message);
        setSaving(false);
        return;
      }
    } else if (updateError) {
      setError("Error al guardar: " + updateError.message);
      setSaving(false);
      return;
    }

    setIsEditDialogOpen(false);
    setSelectedInvestment(null);
    fetchInvestments(session.user.id);
    setSaving(false);
  };

  const handleDeleteInvestment = async () => {
    if (!selectedInvestment) return;

    const { error } = await supabase.from("investments").delete().eq("id", selectedInvestment.id);

    if (!error) {
      setIsDeleteDialogOpen(false);
      setSelectedInvestment(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchInvestments(session.user.id);
    }
  };

  const openEditDialog = (investment: any) => {
    setSelectedInvestment(investment);
    setEditInvestment({
      id: investment.id,
      name: investment.name || "",
      category: investment.type || "digital",
      initial_value: investment.initial_value?.toString() || "",
      current_value: investment.current_value?.toString() || "",
      loan_id: "none",
      patrimony_id: "none",
      capital_breakdown: investment.capital_breakdown || [],
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (investment: any) => {
    setSelectedInvestment(investment);
    setIsDeleteDialogOpen(true);
  };

  const handleCreatePatrimony = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !newPatrimonyAsset.name || !newPatrimonyAsset.value) return;

    const { data, error } = await supabase.from("patrimony").insert({
      user_id: session.user.id,
      name: newPatrimonyAsset.name,
      category: newPatrimonyAsset.category,
      value: parseFloat(newPatrimonyAsset.value),
    }).select().single();

    if (!error && data) {
      setPatrimony([...patrimony, { id: data.id, name: data.name }]);
      setNewInvestment({ ...newInvestment, patrimony_id: data.id });
      setIsNewPatrimonyOpen(false);
      setNewPatrimonyAsset({ name: "", category: "real_estate", value: "" });
    }
  };

  const handleCreateCustomCategory = () => {
    if (!newCustomCategory.name) return;
    
    const categoryValue = `custom_${newCustomCategory.name.toLowerCase().replace(/\s+/g, '_')}`;
    const iconData = availableIcons.find(i => i.value === newCustomCategory.icon);
    const newCategory: CategoryOption = {
      value: categoryValue,
      label: newCustomCategory.name,
      icon: iconData?.icon || MoreHorizontal,
      color: newCustomCategory.color,
      textColor: newCustomCategory.textColor,
    };
    
    setCustomCategories([...customCategories, newCategory]);
    setNewInvestment({ ...newInvestment, category: categoryValue });
    setIsCreateCategoryDialogOpen(false);
    setNewCustomCategory({ name: "", icon: "MoreHorizontal", color: "bg-purple-500/20", textColor: "text-purple-400" });
  };

  const addBreakdownItem = (isEdit: boolean = false) => {
    if (!newBreakdownItem.name || !newBreakdownItem.amount) return;
    
    const newItem: CapitalBreakdownItem = {
      id: Date.now().toString(),
      name: newBreakdownItem.name,
      amount: parseFloat(newBreakdownItem.amount),
    };

    if (isEdit) {
      setEditInvestment({
        ...editInvestment,
        capital_breakdown: [...editInvestment.capital_breakdown, newItem],
      });
    } else {
      setNewInvestment({
        ...newInvestment,
        capital_breakdown: [...newInvestment.capital_breakdown, newItem],
      });
    }
    setNewBreakdownItem({ name: "", amount: "" });
  };

  const removeBreakdownItem = (id: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditInvestment({
        ...editInvestment,
        capital_breakdown: editInvestment.capital_breakdown.filter((item) => item.id !== id),
      });
    } else {
      setNewInvestment({
        ...newInvestment,
        capital_breakdown: newInvestment.capital_breakdown.filter((item) => item.id !== id),
      });
    }
  };

  const getLoanLabel = () => {
    if (newInvestment.loan_id === "none") return "Vincular a préstamo";
    const loan = loans.find((l) => l.id === newInvestment.loan_id);
    return loan ? `${loan.borrower_name} - ${loan.bank}` : "Vincular a préstamo";
  };

  const getPatrimonyLabel = () => {
    if (newInvestment.patrimony_id === "none") return "Vincular a patrimonio";
    const pat = patrimony.find((p) => p.id === newInvestment.patrimony_id);
    return pat ? pat.name : "Vincular a patrimonio";
  };

  const totalValue = investments.reduce((sum, i) => sum + parseFloat(i.current_value || 0), 0);
  const totalInitial = investments.reduce((sum, i) => sum + parseFloat(i.initial_value || 0), 0);
  const totalReturn = totalValue - totalInitial;
  const returnPercentage = totalInitial > 0 ? (totalReturn / totalInitial) * 100 : 0;

  const getCategoryInfo = (categoryValue: string) => {
    return [...investmentCategories, ...customCategories].find((c) => c.value === categoryValue) || investmentCategories[investmentCategories.length - 1];
  };

  const getSelectedCategoryInfo = (categoryValue: string) => {
    return [...investmentCategories, ...customCategories].find((c) => c.value === categoryValue) || investmentCategories[0];
  };

  const totalBreakdown = (breakdown: CapitalBreakdownItem[]) => {
    return breakdown.reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div className="min-h-screen bg-black pb-28">
      <div className="container mx-auto px-4 py-6">
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
            <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Agregar Inversión</DialogTitle>
              </DialogHeader>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <InvestmentForm 
                investment={newInvestment}
                setInvestment={setNewInvestment}
                onSubmit={handleAddInvestment}
                isSubmitting={saving}
                error={error}
                isNew={true}
                loans={loans}
                patrimony={patrimony}
                isLoanDialogOpen={isLoanDialogOpen}
                setIsLoanDialogOpen={setIsLoanDialogOpen}
                isPatrimonyDialogOpen={isPatrimonyDialogOpen}
                setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
                isNewPatrimonyOpen={isNewPatrimonyOpen}
                setIsNewPatrimonyOpen={setIsNewPatrimonyOpen}
                newPatrimonyAsset={newPatrimonyAsset}
                setNewPatrimonyAsset={setNewPatrimonyAsset}
                handleCreatePatrimony={handleCreatePatrimony}
                getLoanLabel={getLoanLabel}
                getPatrimonyLabel={getPatrimonyLabel}
                isCategoryDialogOpen={isCategoryDialogOpen}
                setIsCategoryDialogOpen={setIsCategoryDialogOpen}
                isCreateCategoryDialogOpen={isCreateCategoryDialogOpen}
                setIsCreateCategoryDialogOpen={setIsCreateCategoryDialogOpen}
                getSelectedCategoryInfo={getSelectedCategoryInfo}
                customCategories={customCategories}
                availableIcons={availableIcons}
                categoryColors={categoryColors}
                newCustomCategory={newCustomCategory}
                setNewCustomCategory={setNewCustomCategory}
                handleCreateCustomCategory={handleCreateCustomCategory}
                showBreakdown={showBreakdown}
                setShowBreakdown={setShowBreakdown}
                newBreakdownItem={newBreakdownItem}
                setNewBreakdownItem={setNewBreakdownItem}
                addBreakdownItem={() => addBreakdownItem(false)}
                removeBreakdownItem={(id: string) => removeBreakdownItem(id, false)}
                totalBreakdown={totalBreakdown}
                patrimonyCategories={patrimonyCategories}
              />
            </DialogContent>
          </Dialog>
        </div>

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
                  const cat = getCategoryInfo(inv.type);
                  const Icon = cat.icon;
                  const returnVal = parseFloat(inv.current_value || 0) - parseFloat(inv.initial_value || 0);
                  const returnPct = parseFloat(inv.initial_value || 0) > 0 ? (returnVal / parseFloat(inv.initial_value || 0)) * 100 : 0;
                  const hasBreakdown = inv.capital_breakdown && inv.capital_breakdown.length > 0;
                  const isExpanded = expandedInvestId === inv.id;
                  
                  return (
                    <div key={inv.id} className="space-y-2">
                      <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{inv.name}</p>
                            <p className="text-xs text-zinc-400">{cat.label}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-white">{formatCurrency(inv.current_value)}</p>
                            <p className={`text-xs ${returnVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {returnVal >= 0 ? "+" : ""}{returnPct.toFixed(1)}%
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => openEditDialog(inv)}
                              className="p-2 rounded-lg hover:bg-zinc-700 transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-zinc-400" />
                            </button>
                            <button
                              onClick={() => openDeleteDialog(inv)}
                              className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {hasBreakdown && (
                        <div className="ml-15">
                          <button
                            onClick={() => setExpandedInvestId(isExpanded ? null : inv.id)}
                            className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors ml-15"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            Desglose de capital ({inv.capital_breakdown.length} items)
                          </button>
                          
                          {isExpanded && (
                            <div className="mt-2 p-3 bg-zinc-800/30 rounded-lg space-y-2 ml-6">
                              {inv.capital_breakdown.map((item: CapitalBreakdownItem) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <span className="text-zinc-300">{item.name}</span>
                                  <span className="text-white font-medium">{formatCurrency(item.amount)}</span>
                                </div>
                              ))}
                              <div className="pt-2 border-t border-zinc-700 flex justify-between">
                                <span className="text-zinc-400 text-xs">Total desglose</span>
                                <span className="text-purple-400 font-medium text-sm">
                                  {formatCurrency(totalBreakdown(inv.capital_breakdown))}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Inversión</DialogTitle>
          </DialogHeader>
          <button 
            onClick={() => setIsEditDialogOpen(false)}
            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <InvestmentForm 
            investment={editInvestment}
            setInvestment={setEditInvestment}
            onSubmit={handleEditInvestment}
            isSubmitting={saving}
            error={error}
            isNew={false}
            loans={loans}
            patrimony={patrimony}
            isLoanDialogOpen={isLoanDialogOpen}
            setIsLoanDialogOpen={setIsLoanDialogOpen}
            isPatrimonyDialogOpen={isPatrimonyDialogOpen}
            setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
            isNewPatrimonyOpen={isNewPatrimonyOpen}
            setIsNewPatrimonyOpen={setIsNewPatrimonyOpen}
            newPatrimonyAsset={newPatrimonyAsset}
            setNewPatrimonyAsset={setNewPatrimonyAsset}
            handleCreatePatrimony={handleCreatePatrimony}
            getLoanLabel={getLoanLabel}
            getPatrimonyLabel={getPatrimonyLabel}
            isCategoryDialogOpen={isCategoryDialogOpen}
            setIsCategoryDialogOpen={setIsCategoryDialogOpen}
            isCreateCategoryDialogOpen={isCreateCategoryDialogOpen}
            setIsCreateCategoryDialogOpen={setIsCreateCategoryDialogOpen}
            getSelectedCategoryInfo={getSelectedCategoryInfo}
            customCategories={customCategories}
            availableIcons={availableIcons}
            categoryColors={categoryColors}
            newCustomCategory={newCustomCategory}
            setNewCustomCategory={setNewCustomCategory}
            handleCreateCustomCategory={handleCreateCustomCategory}
            showBreakdown={showBreakdown}
            setShowBreakdown={setShowBreakdown}
            newBreakdownItem={newBreakdownItem}
            setNewBreakdownItem={setNewBreakdownItem}
            addBreakdownItem={() => addBreakdownItem(true)}
            removeBreakdownItem={(id: string) => removeBreakdownItem(id, true)}
            totalBreakdown={totalBreakdown}
            patrimonyCategories={patrimonyCategories}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Eliminar Inversión</DialogTitle>
          </DialogHeader>
          <button 
            onClick={() => setIsDeleteDialogOpen(false)}
            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300">
              ¿Estás seguro de que quieres eliminar esta inversión?
            </p>
            {selectedInvestment && (
              <div className="p-4 bg-zinc-800/50 rounded-xl">
                <p className="text-white font-medium">{selectedInvestment.name}</p>
                <p className="text-purple-400 font-bold">{formatCurrency(selectedInvestment.current_value)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800">
                Cancelar
              </Button>
              <Button onClick={handleDeleteInvestment} className="flex-1 bg-red-500 hover:bg-red-600">
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateCategoryDialogOpen} onOpenChange={setIsCreateCategoryDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Nueva Categoría</DialogTitle>
          </DialogHeader>
          <button 
            onClick={() => setIsCreateCategoryDialogOpen(false)}
            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Nombre</label>
              <Input
                placeholder="Nombre de la categoría"
                value={newCustomCategory.name}
                onChange={(e) => setNewCustomCategory({ ...newCustomCategory, name: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Icono</label>
              <div className="grid grid-cols-5 gap-2">
                {availableIcons.map((iconOpt) => {
                  const Icon = iconOpt.icon;
                  return (
                    <button
                      key={iconOpt.value}
                      type="button"
                      onClick={() => setNewCustomCategory({ ...newCustomCategory, icon: iconOpt.value })}
                      className={`p-2 rounded-lg border-2 transition-all flex items-center justify-center ${
                        newCustomCategory.icon === iconOpt.value
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${newCustomCategory.icon === iconOpt.value ? "text-purple-400" : "text-zinc-400"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Color</label>
              <div className="grid grid-cols-5 gap-2">
                {categoryColors.map((color) => (
                  <button
                    key={color.label}
                    type="button"
                    onClick={() => setNewCustomCategory({ ...newCustomCategory, color: color.value, textColor: color.textColor })}
                    className={`p-2 rounded-lg border-2 transition-all flex items-center justify-center ${
                      newCustomCategory.color === color.value
                        ? "border-white"
                        : "border-zinc-700"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full ${color.value}`} />
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateCustomCategory} className="w-full bg-purple-500 hover:bg-purple-600">
              Crear Categoría
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewPatrimonyOpen} onOpenChange={setIsNewPatrimonyOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Nuevo Patrimonio</DialogTitle>
          </DialogHeader>
          <button 
            onClick={() => setIsNewPatrimonyOpen(false)}
            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Nombre</label>
              <Input 
                placeholder="Nombre del activo" 
                value={newPatrimonyAsset.name} 
                onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, name: e.target.value })} 
                className="bg-zinc-800 border-zinc-700 text-white" 
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Categoría</label>
              <Select value={newPatrimonyAsset.category} onValueChange={(v) => setNewPatrimonyAsset({ ...newPatrimonyAsset, category: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {patrimonyCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white">{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Valor</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={newPatrimonyAsset.value} 
                onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, value: e.target.value })} 
                className="bg-zinc-800 border-zinc-700 text-white" 
              />
            </div>
            <Button onClick={handleCreatePatrimony} className="w-full bg-sky-500 hover:bg-sky-600 text-white">
              Crear
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

const InvestmentForm = ({ 
  investment, 
  setInvestment, 
  onSubmit, 
  isSubmitting, 
  error, 
  isNew,
  loans,
  patrimony,
  isLoanDialogOpen,
  setIsLoanDialogOpen,
  isPatrimonyDialogOpen,
  setIsPatrimonyDialogOpen,
  isNewPatrimonyOpen,
  setIsNewPatrimonyOpen,
  newPatrimonyAsset,
  setNewPatrimonyAsset,
  handleCreatePatrimony,
  getLoanLabel,
  getPatrimonyLabel,
  isCategoryDialogOpen,
  setIsCategoryDialogOpen,
  isCreateCategoryDialogOpen,
  setIsCreateCategoryDialogOpen,
  getSelectedCategoryInfo,
  customCategories,
  availableIcons,
  categoryColors,
  newCustomCategory,
  setNewCustomCategory,
  handleCreateCustomCategory,
  showBreakdown,
  setShowBreakdown,
  newBreakdownItem,
  setNewBreakdownItem,
  addBreakdownItem,
  removeBreakdownItem,
  totalBreakdown,
  patrimonyCategories,
}: any) => {
  const initialValue = parseFloat(investment.initial_value) || 0;
  const breakdownTotal = totalBreakdown(investment.capital_breakdown);
  const remaining = initialValue - breakdownTotal;

  return (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-sm text-zinc-400 mb-1 block">Nombre *</label>
        <Input
          placeholder="Nombre de la inversión"
          value={investment.name}
          onChange={(e) => setInvestment({ ...investment, name: e.target.value })}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Categoría</label>
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="w-full p-4 bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center gap-3 hover:border-zinc-600 transition-all"
            >
              {(() => {
                const cat = getSelectedCategoryInfo(investment.category);
                const Icon = cat.icon;
                return (
                  <>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                      <Icon className={`w-5 h-5 ${cat.textColor}`} />
                    </div>
                    <span className="text-white font-medium">{cat.label}</span>
                    <ChevronRight className="w-5 h-5 text-zinc-400 ml-auto" />
                  </>
                );
              })()}
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Seleccionar Categoría</DialogTitle>
            </DialogHeader>
            <button 
              onClick={() => setIsCategoryDialogOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-3 gap-2">
                {investmentCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = investment.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        setInvestment({ ...investment, category: cat.value });
                        setIsCategoryDialogOpen(false);
                      }}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                        <Icon className={`w-5 h-5 ${cat.textColor}`} />
                      </div>
                      <span className={`text-xs font-medium ${isSelected ? "text-white" : "text-zinc-400"}`}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setIsCategoryDialogOpen(false);
                  setTimeout(() => setIsCreateCategoryDialogOpen(true), 100);
                }}
                className="w-full p-4 rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-800/50 flex items-center justify-center gap-2 hover:border-purple-500 hover:bg-purple-500/10 transition-all"
              >
                <Plus className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-medium">Crear categoría</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Valor Inicial (€) *</label>
          <Input
            type="number"
            placeholder="0.00"
            value={investment.initial_value}
            onChange={(e) => setInvestment({ ...investment, initial_value: e.target.value })}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Valor Actual (€) *</label>
          <Input
            type="number"
            placeholder="0.00"
            value={investment.current_value}
            onChange={(e) => setInvestment({ ...investment, current_value: e.target.value })}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
      </div>

      <div className="border border-zinc-700 rounded-xl p-4 space-y-3">
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center justify-between w-full"
        >
          <span className="text-sm font-medium text-purple-400">Desglose de Capital</span>
          {showBreakdown ? (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {showBreakdown && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-zinc-500">
              Puedes seguir usando este desglose en pantalla aunque tu base de datos aún no tenga esa columna.
            </p>
            
            {investment.capital_breakdown.length > 0 && (
              <div className="space-y-2">
                {investment.capital_breakdown.map((item: CapitalBreakdownItem) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                    <div>
                      <p className="text-sm text-white">{item.name}</p>
                      <p className="text-xs text-purple-400">{formatCurrency(item.amount)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBreakdownItem(item.id)}
                      className="p-1 rounded hover:bg-red-500/20 transition-colors"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Concepto"
                value={newBreakdownItem.name}
                onChange={(e) => setNewBreakdownItem({ ...newBreakdownItem, name: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white text-sm"
              />
              <Input
                type="number"
                placeholder="Cantidad"
                value={newBreakdownItem.amount}
                onChange={(e) => setNewBreakdownItem({ ...newBreakdownItem, amount: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white text-sm"
              />
            </div>
            <Button
              type="button"
              onClick={addBreakdownItem}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white text-sm"
              disabled={!newBreakdownItem.name || !newBreakdownItem.amount}
            >
              <Plus className="w-4 h-4 mr-1" />
              Añadir
            </Button>

            {investment.capital_breakdown.length > 0 && (
              <div className="pt-2 border-t border-zinc-700">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Total desglose:</span>
                  <span className="text-white font-medium">{formatCurrency(breakdownTotal)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-zinc-400">Restante:</span>
                  <span className={remaining >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {formatCurrency(remaining)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Vincular a préstamo</label>
        <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={`w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3 transition-all ${
                investment.loan_id !== "none" 
                  ? "border-cyan-500/50 bg-cyan-500/10" 
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                investment.loan_id !== "none" 
                  ? "bg-cyan-500/20" 
                  : "bg-zinc-700"
              }`}>
                <Landmark className={`w-4 h-4 ${investment.loan_id !== "none" ? "text-cyan-400" : "text-zinc-400"}`} />
              </div>
              <span className={`font-medium ${investment.loan_id !== "none" ? "text-cyan-400" : "text-zinc-400"}`}>
                {getLoanLabel()}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500 ml-auto" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Vincular a Préstamo</DialogTitle>
            </DialogHeader>
            <button 
              onClick={() => setIsLoanDialogOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setInvestment({ ...investment, loan_id: "none" });
                  setIsLoanDialogOpen(false);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  investment.loan_id === "none"
                    ? "border-zinc-500 bg-zinc-800"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-zinc-400" />
                </div>
                <span className="text-zinc-400 font-medium">Sin vincular</span>
              </button>

              {loans.map((loan: any) => (
                <button
                  key={loan.id}
                  type="button"
                  onClick={() => {
                    setInvestment({ ...investment, loan_id: loan.id });
                    setIsLoanDialogOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    investment.loan_id === loan.id
                      ? "border-cyan-500 bg-cyan-500/20"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Landmark className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-white font-medium">{loan.borrower_name}</span>
                    <p className="text-xs text-zinc-400">{loan.bank}</p>
                  </div>
                </button>
              ))}

              {loans.length === 0 && (
                <p className="text-zinc-500 text-center py-4">No hay préstamos activos</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">Vincular a patrimonio</label>
        <Dialog open={isPatrimonyDialogOpen} onOpenChange={setIsPatrimonyDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={`w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3 transition-all ${
                investment.patrimony_id !== "none" 
                  ? "border-sky-500/50 bg-sky-500/10" 
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                investment.patrimony_id !== "none" 
                  ? "bg-sky-500/20" 
                  : "bg-zinc-700"
              }`}>
                <Building className={`w-4 h-4 ${investment.patrimony_id !== "none" ? "text-sky-400" : "text-zinc-400"}`} />
              </div>
              <span className={`font-medium ${investment.patrimony_id !== "none" ? "text-sky-400" : "text-zinc-400"}`}>
                {getPatrimonyLabel()}
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
                  setInvestment({ ...investment, patrimony_id: "none" });
                  setIsPatrimonyDialogOpen(false);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  investment.patrimony_id === "none"
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
                    setInvestment({ ...investment, patrimony_id: pat.id });
                    setIsPatrimonyDialogOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    investment.patrimony_id === pat.id
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

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <Button 
        onClick={onSubmit} 
        className="w-full bg-purple-500 hover:bg-purple-600"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Guardando..." : isNew ? "Guardar" : "Guardar cambios"}
      </Button>
    </div>
  );
};

export default InvestmentsPage;