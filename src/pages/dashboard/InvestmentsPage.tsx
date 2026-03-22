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
  Plane, Sparkles, Flame, Shield, Wifi, Heart, ShoppingCart, Shirt, Link2, Landmark
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
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [newInvestment, setNewInvestment] = useState({
    name: "",
    category: "digital",
    initial_value: "",
    current_value: "",
    loan_id: "none",
    patrimony_id: "none",
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
    const { data, error } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setInvestments(data);
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

    // Calcular el porcentaje de retorno
    const initial = parseFloat(newInvestment.initial_value);
    const current = parseFloat(newInvestment.current_value);
    const returnPct = initial > 0 ? ((current - initial) / initial) * 100 : 0;

    // Primero intentamos con loan_id
    let insertData: any = {
      user_id: session.user.id,
      name: newInvestment.name,
      type: newInvestment.category,
      initial_value: initial,
      current_value: current,
      return_percentage: returnPct,
    };

    // Añadir loan_id solo si no es "none" y hay un valor válido
    if (newInvestment.loan_id !== "none" && newInvestment.loan_id) {
      insertData.loan_id = newInvestment.loan_id;
    }

    const { error: insertError } = await supabase.from("investments").insert(insertData);

    // Si falla por tema de columna loan_id, intentamos sin ella
    if (insertError && insertError.message.includes("loan_id")) {
      console.log("La columna loan_id no existe, guardando sin ella...");
      
      const { error: retryError } = await supabase.from("investments").insert({
        user_id: session.user.id,
        name: newInvestment.name,
        type: newInvestment.category,
        initial_value: initial,
        current_value: current,
        return_percentage: returnPct,
      });

      if (retryError) {
        console.error("Error al guardar inversión:", retryError);
        setError("Error al guardar: " + retryError.message);
        setSaving(false);
        return;
      }
    } else if (insertError) {
      console.error("Error al guardar inversión:", insertError);
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
    });
    setError("");
    fetchInvestments(session.user.id);
    setSaving(false);
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

  const getLoanLabel = () => {
    if (newInvestment.loan_id === "none") return "Vincular a préstamo";
    const loan = loans.find(l => l.id === newInvestment.loan_id);
    return loan ? `${loan.borrower_name} - ${loan.bank}` : "Vincular a préstamo";
  };

  const getPatrimonyLabel = () => {
    if (newInvestment.patrimony_id === "none") return "Vincular a patrimonio";
    const pat = patrimony.find(p => p.id === newInvestment.patrimony_id);
    return pat ? pat.name : "Vincular a patrimonio";
  };

  const totalValue = investments.reduce((sum, i) => sum + parseFloat(i.current_value || 0), 0);
  const totalInitial = investments.reduce((sum, i) => sum + parseFloat(i.initial_value || 0), 0);
  const totalReturn = totalValue - totalInitial;
  const returnPercentage = totalInitial > 0 ? (totalReturn / totalInitial) * 100 : 0;

  const getCategoryInfo = (categoryValue: string) => {
    return [...investmentCategories, ...customCategories].find(c => c.value === categoryValue) || investmentCategories[investmentCategories.length - 1];
  };

  const getSelectedCategoryInfo = (categoryValue: string) => {
    return [...investmentCategories, ...customCategories].find(c => c.value === categoryValue) || investmentCategories[0];
  };

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
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Nombre *</label>
                  <Input
                    placeholder="Nombre de la inversión"
                    value={newInvestment.name}
                    onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                {/* Selector de Categoría */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Categoría</label>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="w-full p-4 bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center gap-3 hover:border-zinc-600 transition-all"
                      >
                        {(() => {
                          const cat = getSelectedCategoryInfo(newInvestment.category);
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
                            const isSelected = newInvestment.category === cat.value;
                            return (
                              <button
                                key={cat.value}
                                type="button"
                                onClick={() => {
                                  setNewInvestment({ ...newInvestment, category: cat.value });
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
                      value={newInvestment.initial_value}
                      onChange={(e) => setNewInvestment({ ...newInvestment, initial_value: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Valor Actual (€) *</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newInvestment.current_value}
                      onChange={(e) => setNewInvestment({ ...newInvestment, current_value: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                {/* Vincular a Préstamo */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Vincular a préstamo</label>
                  <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className={`w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3 transition-all ${
                          newInvestment.loan_id !== "none" 
                            ? "border-cyan-500/50 bg-cyan-500/10" 
                            : "border-zinc-700 hover:border-zinc-600"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          newInvestment.loan_id !== "none" 
                            ? "bg-cyan-500/20" 
                            : "bg-zinc-700"
                        }`}>
                          <Landmark className={`w-4 h-4 ${newInvestment.loan_id !== "none" ? "text-cyan-400" : "text-zinc-400"}`} />
                        </div>
                        <span className={`font-medium ${newInvestment.loan_id !== "none" ? "text-cyan-400" : "text-zinc-400"}`}>
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
                            setNewInvestment({ ...newInvestment, loan_id: "none" });
                            setIsLoanDialogOpen(false);
                          }}
                          className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            newInvestment.loan_id === "none"
                              ? "border-zinc-500 bg-zinc-800"
                              : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
                            <Link2 className="w-4 h-4 text-zinc-400" />
                          </div>
                          <span className="text-zinc-400 font-medium">Sin vincular</span>
                        </button>

                        {loans.map((loan) => (
                          <button
                            key={loan.id}
                            type="button"
                            onClick={() => {
                              setNewInvestment({ ...newInvestment, loan_id: loan.id });
                              setIsLoanDialogOpen(false);
                            }}
                            className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                              newInvestment.loan_id === loan.id
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

                {/* Vincular a Patrimonio */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Vincular a patrimonio</label>
                  <Dialog open={isPatrimonyDialogOpen} onOpenChange={setIsPatrimonyDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className={`w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3 transition-all ${
                          newInvestment.patrimony_id !== "none" 
                            ? "border-sky-500/50 bg-sky-500/10" 
                            : "border-zinc-700 hover:border-zinc-600"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          newInvestment.patrimony_id !== "none" 
                            ? "bg-sky-500/20" 
                            : "bg-zinc-700"
                        }`}>
                          <Building className={`w-4 h-4 ${newInvestment.patrimony_id !== "none" ? "text-sky-400" : "text-zinc-400"}`} />
                        </div>
                        <span className={`font-medium ${newInvestment.patrimony_id !== "none" ? "text-sky-400" : "text-zinc-400"}`}>
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
                            setNewInvestment({ ...newInvestment, patrimony_id: "none" });
                            setIsPatrimonyDialogOpen(false);
                          }}
                          className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            newInvestment.patrimony_id === "none"
                              ? "border-zinc-500 bg-zinc-800"
                              : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
                            <Link2 className="w-4 h-4 text-zinc-400" />
                          </div>
                          <span className="text-zinc-400 font-medium">Sin vincular</span>
                        </button>

                        {patrimony.map((pat) => (
                          <button
                            key={pat.id}
                            type="button"
                            onClick={() => {
                              setNewInvestment({ ...newInvestment, patrimony_id: pat.id });
                              setIsPatrimonyDialogOpen(false);
                            }}
                            className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                              newInvestment.patrimony_id === pat.id
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
                  onClick={handleAddInvestment} 
                  className="w-full bg-purple-500 hover:bg-purple-600"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar"}
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
                  const cat = getCategoryInfo(inv.type);
                  const Icon = cat.icon;
                  const returnVal = parseFloat(inv.current_value || 0) - parseFloat(inv.initial_value || 0);
                  const returnPct = parseFloat(inv.initial_value || 0) > 0 ? (returnVal / parseFloat(inv.initial_value || 0)) * 100 : 0;
                  return (
                    <div key={inv.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{inv.name}</p>
                          <p className="text-xs text-zinc-400">{cat.label}</p>
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

      {/* Modal crear categoría */}
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

      {/* Modal nuevo patrimonio */}
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

export default InvestmentsPage;