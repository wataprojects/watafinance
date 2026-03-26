"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  Plus, TrendingUp, DollarSign, Briefcase, Home, ArrowUpRight, 
  Filter, Wallet, CreditCard, PiggyBank, Building, ShoppingCart, 
  Globe, Zap, Music, BookOpen, Car, Plane, Laptop, Smartphone,
  ChevronRight, X, Check, Calendar as CalendarIcon, TrendingDown,
  Pencil, Trash2, TrendingDown as TrendingDownIcon, Link2,
  Lightbulb, Sparkles, AlertCircle, MoreHorizontal
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { formatCurrency } from "@/utils/currency";

const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const safeDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr) return new Date();
  const date = new Date(dateStr + 'T00:00:00');
  return isNaN(date.getTime()) ? new Date() : date;
};

const formatDateSafe = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr + 'T00:00:00');
  return isNaN(date.getTime()) ? '-' : date.toLocaleDateString("es-ES");
};

type FilterType = "all" | "active" | "passive";
type InsightType = 'positive' | 'neutral' | 'warning';

interface CategoryOption {
  value: string;
  label: string;
  icon: any;
  color: string;
  textColor: string;
}

interface GroupedIncomes {
  today: any[];
  thisWeek: any[];
  thisMonth: any[];
}

interface Insight {
  text: string;
  type: InsightType;
}

interface TopCategory {
  category: string;
  amount: number;
  percentage: number;
}

const availableIcons = [
  { value: "Briefcase", icon: Briefcase },
  { value: "Home", icon: Home },
  { value: "ShoppingCart", icon: ShoppingCart },
  { value: "Laptop", icon: Laptop },
  { value: "Globe", icon: Globe },
  { value: "TrendingUp", icon: TrendingUp },
  { value: "DollarSign", icon: DollarSign },
  { value: "Wallet", icon: Wallet },
  { value: "CreditCard", icon: CreditCard },
  { value: "PiggyBank", icon: PiggyBank },
  { value: "Building", icon: Building },
  { value: "Car", icon: Car },
  { value: "Plane", icon: Plane },
  { value: "Smartphone", icon: Smartphone },
  { value: "Music", icon: Music },
  { value: "BookOpen", icon: BookOpen },
  { value: "Zap", icon: Zap },
  { value: "Heart", icon: Heart },
  { value: "UtensilsCrossed", icon: UtensilsCrossed },
  { value: "Shirt", icon: Shirt },
  { value: "MoreHorizontal", icon: MoreHorizontal },
];

function UtensilsCrossed({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function Shirt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    </svg>
  );
}

function Heart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

const incomeCategories: CategoryOption[] = [
  { value: "salary", label: "Sueldo", icon: Briefcase, color: "bg-blue-500/20", textColor: "text-blue-400" },
  { value: "rental", label: "Alquiler", icon: Home, color: "bg-emerald-500/20", textColor: "text-emerald-400" },
  { value: "digital_sales", label: "Ventas Digitales", icon: ShoppingCart, color: "bg-purple-500/20", textColor: "text-purple-400" },
  { value: "services", label: "Servicios", icon: Laptop, color: "bg-cyan-500/20", textColor: "text-cyan-400" },
  { value: "affiliates", label: "Afiliados", icon: Globe, color: "bg-amber-500/20", textColor: "text-amber-400" },
  { value: "investments", label: "Inversiones", icon: TrendingUp, color: "bg-green-500/20", textColor: "text-green-400" },
  { value: "freelance", label: "Freelance", icon: Wallet, color: "bg-indigo-500/20", textColor: "text-indigo-400" },
  { value: "business", label: "Negocio", icon: Building, color: "bg-rose-500/20", textColor: "text-rose-400" },
];

const generateInsight = (currentIncomes: any[], previousIncomes: any[]): Insight | null => {
  if (currentIncomes.length === 0) return null;

  const currentTotal = currentIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const previousTotal = previousIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  
  const currentPassive = currentIncomes.filter(i => i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const previousPassive = previousIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  
  const passivePercentage = currentTotal > 0 ? (currentPassive / currentTotal) * 100 : 0;
  const uniqueCategories = new Set(currentIncomes.map(i => i.category));
  
  if (previousTotal > 0 && currentTotal > 0) {
    const changePercent = ((currentTotal - previousTotal) / previousTotal) * 100;
    if (changePercent >= 10) {
      return { text: `Tus ingresos han aumentado un ${changePercent.toFixed(0)}% respecto al mes anterior`, type: 'positive' };
    }
    if (changePercent <= -10) {
      return { text: `Tus ingresos han disminuido un ${Math.abs(changePercent).toFixed(0)}% respecto al mes anterior`, type: 'warning' };
    }
  }
  
  if (passivePercentage < 30 && currentTotal > 0) {
    return { text: `Dependes principalmente de ingresos activos (${(100 - passivePercentage).toFixed(0)}%)`, type: 'neutral' };
  }
  
  if (passivePercentage >= 50) {
    return { text: `¡Buen camino! Tus ingresos pasivos superan el ${passivePercentage.toFixed(0)}%`, type: 'positive' };
  }
  
  if (uniqueCategories.size >= 3) {
    return { text: `Tienes ingresos bien diversificados (${uniqueCategories.size} fuentes)`, type: 'positive' };
  }
  
  if (previousPassive > 0 && currentPassive > previousPassive) {
    const passiveGrowth = ((currentPassive - previousPassive) / previousPassive) * 100;
    return { text: `Tus ingresos pasivos están aumentando (+${passiveGrowth.toFixed(0)}%)`, type: 'positive' };
  }
  
  if (currentPassive > 0 && previousPassive === 0) {
    return { text: `Has generado nuevos ingresos pasivos este mes`, type: 'positive' };
  }
  
  return null;
};

const groupIncomesByDate = (incomes: any[]): GroupedIncomes => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const grouped: GroupedIncomes = {
    today: [],
    thisWeek: [],
    thisMonth: []
  };
  
  incomes.forEach(income => {
    if (!income.date) return;
    
    const incomeDate = new Date(income.date + 'T00:00:00');
    incomeDate.setHours(0, 0, 0, 0);
    
    if (incomeDate.getTime() === today.getTime()) {
      grouped.today.push(income);
    } else if (incomeDate >= startOfWeek && incomeDate < today) {
      grouped.thisWeek.push(income);
    } else {
      grouped.thisMonth.push(income);
    }
  });
  
  return grouped;
};

const IncomePage = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState<any[]>([]);
  const [previousMonthIncomes, setPreviousMonthIncomes] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);
  const [isInvestmentDialogOpen, setIsInvestmentDialogOpen] = useState(false);
  const [isPatrimonyDialogOpen, setIsPatrimonyDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<any>(null);
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear().toString();
  
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
  const [filterYear, setFilterYear] = useState<string>(currentYear);
  
  const years = Array.from({ length: new Date().getFullYear() - 1990 + 1 }, (_, i) => new Date().getFullYear() - i);
  
  const [newIncome, setNewIncome] = useState({
    source: "",
    amount: "",
    is_recurring: false,
    income_type: "active" as "active" | "passive",
    category: "salary",
    date: new Date(),
    investment_id: "none",
    patrimony_id: "none",
  });
  
  const [editIncome, setEditIncome] = useState({
    id: "",
    source: "",
    amount: "",
    is_recurring: false,
    income_type: "active" as "active" | "passive",
    category: "salary",
    date: new Date(),
    investment_id: "none",
    patrimony_id: "none",
  });
  
  const [newInvestment, setNewInvestment] = useState({
    name: "",
    type: "stocks",
    initial_value: "",
    current_value: "",
  });
  
  const [newPatrimonyAsset, setNewPatrimonyAsset] = useState({
    name: "",
    category: "real_estate",
    value: "",
  });

  const [newCustomCategory, setNewCustomCategory] = useState({
    name: "",
    icon: "Briefcase",
    color: "bg-blue-500/20",
    textColor: "text-blue-400",
  });

  const months = [
    { value: "all", label: "Todos" },
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    } else {
      fetchIncomes(session.user.id);
      fetchOptions(session.user.id);
    }
  };

  const fetchOptions = async (userId: string) => {
    const [invResult, patResult] = await Promise.all([
      supabase.from("investments").select("id, name").eq("user_id", userId),
      supabase.from("patrimony").select("id, name").eq("user_id", userId),
    ]);
    if (invResult.data) setInvestments(invResult.data);
    if (patResult.data) setPatrimony(patResult.data);
  };

  const fetchIncomes = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("incomes")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (data) {
      setIncomes(data);
      setInsight(generateInsight(data, []));
    }
    
    const year = parseInt(filterYear);
    const month = parseInt(filterMonth);
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear = year - 1;
    }
    
    const prevStartDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-01`;
    const prevEndDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-31`;
    
    const { data: prevData } = await supabase
      .from("incomes")
      .select("*")
      .eq("user_id", userId)
      .gte("date", prevStartDate)
      .lte("date", prevEndDate);
    
    if (prevData) {
      setPreviousMonthIncomes(prevData);
      if (data) {
        setInsight(generateInsight(data, prevData));
      }
    }
    
    setLoading(false);
  };

  const handleAddIncome = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const dateStr = formatDateToISO(newIncome.date);

    const { error } = await supabase.from("incomes").insert({
      user_id: session.user.id,
      amount: parseFloat(newIncome.amount),
      description: newIncome.source,
      category: newIncome.category,
      is_passive: newIncome.income_type === "passive",
      date: dateStr,
      is_recurring: newIncome.is_recurring,
      investment_id: newIncome.investment_id === "none" ? null : newIncome.investment_id,
      patrimony_id: newIncome.patrimony_id === "none" ? null : newIncome.patrimony_id,
    });

    if (!error) {
      setIsDialogOpen(false);
      setNewIncome({
        source: "",
        amount: "",
        is_recurring: false,
        income_type: "active",
        category: "salary",
        date: new Date(),
        investment_id: "none",
        patrimony_id: "none",
      });
      fetchIncomes(session.user.id);
    }
  };

  const handleEditIncome = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !selectedIncome) return;

    const dateStr = formatDateToISO(editIncome.date);

    const { error } = await supabase.from("incomes").update({
      amount: parseFloat(editIncome.amount),
      description: editIncome.source,
      category: editIncome.category,
      is_passive: editIncome.income_type === "passive",
      date: dateStr,
      is_recurring: editIncome.is_recurring,
      investment_id: editIncome.investment_id === "none" ? null : editIncome.investment_id,
      patrimony_id: editIncome.patrimony_id === "none" ? null : editIncome.patrimony_id,
    }).eq("id", selectedIncome.id);

    if (!error) {
      setIsEditDialogOpen(false);
      setSelectedIncome(null);
      fetchIncomes(session.user.id);
    }
  };

  const handleDeleteIncome = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !selectedIncome) return;

    const { error } = await supabase.from("incomes").delete().eq("id", selectedIncome.id);

    if (!error) {
      setIsDeleteDialogOpen(false);
      setSelectedIncome(null);
      fetchIncomes(session.user.id);
    }
  };

  const openEditDialog = (income: any) => {
    setSelectedIncome(income);
    const incomeDate = safeDate(income.date);
    setEditIncome({
      id: income.id,
      source: income.description || "",
      amount: income.amount.toString(),
      is_recurring: income.is_recurring === true || income.is_recurring === 1 || income.is_recurring === "true",
      income_type: income.is_passive ? "passive" : "active",
      category: income.category,
      date: incomeDate,
      investment_id: income.investment_id || "none",
      patrimony_id: income.patrimony_id || "none",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (income: any) => {
    setSelectedIncome(income);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateInvestment = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !newInvestment.name || !newInvestment.initial_value) return;

    const { data, error } = await supabase.from("investments").insert({
      user_id: session.user.id,
      name: newInvestment.name,
      type: newInvestment.type,
      initial_value: parseFloat(newInvestment.initial_value),
      current_value: parseFloat(newInvestment.current_value) || parseFloat(newInvestment.initial_value),
    }).select().single();

    if (!error && data) {
      setInvestments([...investments, { id: data.id, name: data.name }]);
      setNewIncome({ ...newIncome, investment_id: data.id });
      setIsNewInvestmentOpen(false);
      setNewInvestment({ name: "", type: "stocks", initial_value: "", current_value: "" });
    }
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
      setNewIncome({ ...newIncome, patrimony_id: data.id });
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
      icon: iconData?.icon || Briefcase,
      color: newCustomCategory.color,
      textColor: newCustomCategory.textColor,
    };
    
    setCustomCategories([...customCategories, newCategory]);
    setNewIncome({ ...newIncome, category: categoryValue });
    setIsCreateCategoryDialogOpen(false);
    setNewCustomCategory({ name: "", icon: "Briefcase", color: "bg-blue-500/20", textColor: "text-blue-400" });
  };

  const filteredIncomes = incomes.filter((income) => {
    if (!income.date) return false;
    const incomeDate = new Date(income.date + 'T00:00:00');
    if (isNaN(incomeDate.getTime())) return false;
    const incomeYear = incomeDate.getFullYear().toString();
    const incomeMonth = (incomeDate.getMonth() + 1).toString().padStart(2, '0');
    
    if (filterYear !== "all" && incomeYear !== filterYear) return false;
    if (filterMonth !== "all" && incomeMonth !== filterMonth) return false;
    if (filterType === "active") return !income.is_passive;
    if (filterType === "passive") return income.is_passive;
    return true;
  });

  const totalIncome = filteredIncomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const activeIncome = filteredIncomes.filter(i => !i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const passiveIncome = filteredIncomes.filter(i => i.is_passive).reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const activePercentage = totalIncome > 0 ? (activeIncome / totalIncome) * 100 : 0;
  const passivePercentage = totalIncome > 0 ? (passiveIncome / totalIncome) * 100 : 0;

  const groupedIncomes = groupIncomesByDate(filteredIncomes);

  const incomeByCategory: Record<string, number> = {};
  filteredIncomes.forEach(income => {
    const cat = income.category || 'other';
    incomeByCategory[cat] = (incomeByCategory[cat] || 0) + parseFloat(income.amount);
  });

  const sortedCategories = Object.entries(incomeByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({ category, amount }));

  const top3 = sortedCategories.slice(0, 3);
  const others = sortedCategories.slice(3);
  const othersTotal = others.reduce((sum, cat) => sum + cat.amount, 0);

  const topCategories: TopCategory[] = [
    ...top3.map(cat => ({
      category: cat.category,
      amount: cat.amount,
      percentage: totalIncome > 0 ? (cat.amount / totalIncome) * 100 : 0
    })),
    ...(othersTotal > 0 ? [{
      category: 'others',
      amount: othersTotal,
      percentage: totalIncome > 0 ? (othersTotal / totalIncome) * 100 : 0
    }] : [])
  ];

  const allCategories = [...incomeCategories, ...customCategories];

  const getCategoryInfo = (categoryValue: string) => {
    return allCategories.find(c => c.value === categoryValue) || incomeCategories[0];
  };

  const getSelectedCategoryInfo = (categoryValue: string) => {
    return allCategories.find(c => c.value === categoryValue) || incomeCategories[0];
  };

  const getInvestmentLabel = () => {
    if (newIncome.investment_id === "none") return "Vincular a inversión";
    const inv = investments.find(i => i.id === newIncome.investment_id);
    return inv ? inv.name : "Vincular a inversión";
  };

  const getPatrimonyLabel = () => {
    if (newIncome.patrimony_id === "none") return "Vincular a patrimonio";
    const pat = patrimony.find(p => p.id === newIncome.patrimony_id);
    return pat ? pat.name : "Vincular a patrimonio";
  };

  const investmentTypes = [
    { value: "stocks", label: "Acciones" },
    { value: "etf", label: "ETF" },
    { value: "crypto", label: "Criptomonedas" },
    { value: "bonds", label: "Bonos" },
    { value: "real_estate", label: "Bienes Raíces" },
    { value: "other", label: "Otros" },
  ];

  const patrimonyCategories = [
    { value: "real_estate", label: "Bienes Raíces" },
    { value: "vehicle", label: "Vehículos" },
    { value: "investments", label: "Inversiones" },
    { value: "savings", label: "Ahorros" },
    { value: "business", label: "Negocios" },
    { value: "other", label: "Otros" },
  ];

  const renderIncomeItem = (income: any) => {
    const cat = getCategoryInfo(income.category);
    const Icon = cat.icon;
    const isPassive = income.is_passive;
    
    return (
      <div 
        key={income.id} 
        className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
            <Icon className={`w-5 h-5 ${cat.textColor}`} />
          </div>
          <div>
            <p className="font-medium text-white">{income.description || cat.label}</p>
            <p className="text-xs text-zinc-500">{formatDateSafe(income.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-green-500">+{formatCurrency(income.amount)}</p>
            <p className={`text-xs ${isPassive ? 'text-green-400' : 'text-blue-400'}`}>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${isPassive ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                {isPassive ? (
                  <>
                    <PiggyBank className="w-3 h-3 mr-1" />
                    Pasivo
                  </>
                ) : (
                  <>
                    <Briefcase className="w-3 h-3 mr-1" />
                    Activo
                  </>
                )}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <button onClick={() => openEditDialog(income)} className="p-2 rounded-lg hover:bg-zinc-700 transition-colors">
              <Pencil className="w-4 h-4 text-zinc-400" />
            </button>
            <button onClick={() => openDeleteDialog(income)} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors">
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black pb-28">
      <DashboardHeader 
        title="FinPro" 
        subtitle="Gestión de Ingresos"
      />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Selectores de año/mes - MOVIDOS AQUÍ (arriba del card Total Ingresos) */}
        <div className="grid grid-cols-2 gap-4">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-full p-4 h-auto bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center justify-between hover:border-zinc-600 transition-all group">
              <span className="text-zinc-400 text-sm group-hover:text-zinc-300">Año</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-lg">{filterYear}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all" className="text-white">Todos</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()} className="text-white">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-full p-4 h-auto bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center justify-between hover:border-zinc-600 transition-all group">
              <span className="text-zinc-400 text-sm group-hover:text-zinc-300">Mes</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-lg">
                  {months.find(m => m.value === filterMonth)?.label}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value} className="text-white">
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Card - Total Ingresos */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 text-center">
            <p className="text-zinc-400 text-sm mb-1">Total Ingresos</p>
            <p className="text-4xl font-bold text-green-500 mb-4">{formatCurrency(totalIncome)}</p>
            {totalIncome > 0 && (
              <div className="space-y-2">
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${activePercentage}%` }}
                  />
                  <div 
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${passivePercentage}%` }}
                  />
                </div>
                <div className="flex justify-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-blue-400">
                    <Briefcase className="w-3 h-3" />
                    {activePercentage.toFixed(0)}% activos
                  </span>
                  <span className="flex items-center gap-1 text-green-400">
                    <PiggyBank className="w-3 h-3" />
                    {passivePercentage.toFixed(0)}% pasivos
                  </span>
                </div>
              </div>
            )}
            {totalIncome > 0 ? (
              <div className="mt-4 pt-4 border-t border-zinc-700 space-y-2">
                <p className="text-xs text-zinc-500 mb-2">Distribución por categoría</p>
                {topCategories.map((cat) => {
                                  const catInfo = getCategoryInfo(cat.category);
                                  const Icon = catInfo.icon;
                                  return (
                                    <div key={cat.category} className="space-y-1.5 py-1">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Icon className={`w-4 h-4 ${catInfo.textColor}`} />
                                          <span className="text-sm text-zinc-300">{catInfo.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <span className="font-bold text-white">{formatCurrency(cat.amount)}</span>
                                          <span className="text-xs text-zinc-500">({cat.percentage.toFixed(0)}%)</span>
                                        </div>
                                      </div>
                                      <div className="h-1.5 bg-zinc-700/50 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all duration-500 ${catInfo.color.replace('/20', '')}`}
                                          style={{ width: `${cat.percentage}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-zinc-700 text-center">
                <p className="text-zinc-400 text-sm mb-3">Aún no has registrado ingresos este mes</p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-black text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir ingreso
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para nuevo ingreso */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-green-500 hover:bg-green-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo ingreso
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Nuevo Ingreso</DialogTitle>
            </DialogHeader>
            <button 
              onClick={() => setIsDialogOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <IncomeForm 
              income={newIncome} 
              setIncome={setNewIncome} 
              onSubmit={handleAddIncome}
              isSubmitting={false}
              isNew={true}
              investments={investments}
              patrimony={patrimony}
              isNewInvestmentOpen={isNewInvestmentOpen}
              setIsNewInvestmentOpen={setIsNewInvestmentOpen}
              isNewPatrimonyOpen={isNewPatrimonyOpen}
              setIsNewPatrimonyOpen={setIsNewPatrimonyOpen}
              newInvestment={newInvestment}
              setNewInvestment={setNewInvestment}
              newPatrimonyAsset={newPatrimonyAsset}
              setNewPatrimonyAsset={setNewPatrimonyAsset}
              handleCreateInvestment={handleCreateInvestment}
              handleCreatePatrimony={handleCreatePatrimony}
              investmentTypes={investmentTypes}
              patrimonyCategories={patrimonyCategories}
              isCategoryDialogOpen={isCategoryDialogOpen}
              setIsCategoryDialogOpen={setIsCategoryDialogOpen}
              isCreateCategoryDialogOpen={isCreateCategoryDialogOpen}
              setIsCreateCategoryDialogOpen={setIsCreateCategoryDialogOpen}
              isInvestmentDialogOpen={isInvestmentDialogOpen}
              setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
              isPatrimonyDialogOpen={isPatrimonyDialogOpen}
              setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
              getSelectedCategoryInfo={getSelectedCategoryInfo}
              customCategories={customCategories}
              availableIcons={availableIcons}
             El archivo es muy largo. Necesito actualizar los archivos restantes con la función de formato de moneda centralizada. Voy a actualizar ExpensesPage, LoansPage, InvestmentsPage, DebtsPage y PatrimonyPage:

<dyad-write path="src/pages/dashboard/ExpensesPage.tsx" description="Updated ExpensesPage to use centralized currency utility with proper decimals">
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Plus,
  TrendingDown,
  ShoppingCart,
  Car,
  Home,
  Zap,
  Film,
  TrendingUp,
  Building,
  Wifi,
  Smartphone,
  Heart,
  Shield,
  Flame,
  Sparkles,
  DollarSign,
  Briefcase,
  Megaphone,
  Train,
  UtensilsCrossed,
  Shirt,
  MoreHorizontal,
  X,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  RefreshCcw,
  Link2,
  Scissors,
  RotateCcw,
  Check,
  BadgeCheck,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TrimConfirmModal from "@/components/dashboard/TrimConfirmModal";
import CelebrateAnimation from "@/components/dashboard/CelebrateAnimation";
import { formatCurrency } from "@/utils/currency";
import { toast } from "sonner";

const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const safeDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr) return new Date();
  const date = new Date(dateStr + "T00:00:00");
  return isNaN(date.getTime()) ? new Date() : date;
};

const formatDateSafe = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr + "T00:00:00");
  return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("es-ES");
};

interface CategoryOption {
  value: string;
  label: string;
  icon: any;
  color: string;
  textColor: string;
}

function CreditCard({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function DropletsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

const expenseCategories: CategoryOption[] = [
  { value: "housing", label: "Casa", icon: Home, color: "bg-blue-500/20", textColor: "text-blue-400" },
  { value: "electricity", label: "Luz", icon: Zap, color: "bg-yellow-500/20", textColor: "text-yellow-400" },
  { value: "water", label: "Agua", icon: DropletsIcon, color: "bg-cyan-500/20", textColor: "text-cyan-400" },
  { value: "health", label: "Salud", icon: Heart, color: "bg-rose-500/20", textColor: "text-rose-400" },
  { value: "security", label: "Alarmas", icon: Shield, color: "bg-slate-500/20", textColor: "text-slate-400" },
  { value: "insurance", label: "Seguros", icon: Shield, color: "bg-indigo-500/20", textColor: "text-indigo-400" },
  { value: "internet", label: "Internet", icon: Wifi, color: "bg-violet-500/20", textColor: "text-violet-400" },
  { value: "subscriptions", label: "Suscripciones", icon: Smartphone, color: "bg-pink-500/20", textColor: "text-pink-400" },
  { value: "gas", label: "Gas", icon: Flame, color: "bg-orange-500/20", textColor: "text-orange-400" },
  { value: "cleaning", label: "Limpieza", icon: Sparkles, color: "bg-teal-500/20", textColor: "text-teal-400" },
  { value: "fuel", label: "Gasolina", icon: Car, color: "bg-red-500/20", textColor: "text-red-400" },
  { value: "groceries", label: "Supermercado", icon: ShoppingCart, color: "bg-green-500/20", textColor: "text-green-400" },
  { value: "entertainment", label: "Ocio", icon: Film, color: "bg-purple-500/20", textColor: "text-purple-400" },
  { value: "business_investment", label: "Inversión", icon: TrendingUp, color: "bg-emerald-500/20", textColor: "text-emerald-400" },
  { value: "advertising", label: "Publicidad", icon: Megaphone, color: "bg-rose-500/20", textColor: "text-rose-400" },
  { value: "transport", label: "Transporte", icon: Train, color: "bg-sky-500/20", textColor: "text-sky-400" },
  { value: "restaurants", label: "Restaurantes", icon: UtensilsCrossed, color: "bg-orange-500/20", textColor: "text-orange-400" },
  { value: "shopping", label: "Compras", icon: Shirt, color: "bg-pink-500/20", textColor: "text-pink-400" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

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

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [patrimony, setPatrimony] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isNewPatrimonyOpen, setIsNewPatrimonyOpen] = useState(false);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);

  const [isInvestmentDialogOpen, setIsInvestmentDialogOpen] = useState(false);
  const [isPatrimonyDialogOpen, setIsPatrimonyDialogOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>([]);

  const [showSubscriptions, setShowSubscriptions] = useState(true);

  // Trim subscription state
  const [isTrimModalOpen, setIsTrimModalOpen] = useState(false);
  const [isCelebrateModalOpen, setIsCelebrateModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [savedAmount, setSavedAmount] = useState(0);
  const [trimLoading, setTrimLoading] = useState(false);

  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const currentYearStr = new Date().getFullYear().toString();
  const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
  const [filterYear, setFilterYear] = useState<string>(currentYearStr);

  type ExpenseFilterType = "all" | "puntual" | "recurrente" | "prestamo";
  const [filterExpenseType, setFilterExpenseType] = useState<ExpenseFilterType>("all");

  const [newExpense, setNewExpense] = useState({
    source: "",
    amount: "",
    is_recurring: false,
    category: "groceries",
    date: new Date(),
    investment_id: "none",
    patrimony_id: "none",
    has_scheduled_change: false,
    scheduled_change_date: null as Date | null,
    scheduled_new_amount: "",
    scheduled_change_type: "increase" as "increase" | "decrease",
  });

  const [editExpense, setEditExpense] = useState({
    id: "",
    source: "",
    amount: "",
    is_recurring: false,
    category: "groceries",
    date: new Date(),
    investment_id: "none",
    patrimony_id: "none",
    has_scheduled_change: false,
    scheduled_change_date: null as Date | null,
    scheduled_new_amount: "",
    scheduled_change_type: "increase" as "increase" | "decrease",
  });

  const [newInvestment, setNewInvestment] = useState({
    name: "",
    type: "stocks",
    initial_value: "",
    current_value: "",
  });

  const [newPatrimonyAsset, setNewPatrimonyAsset] = useState({
    name: "",
    category: "real_estate",
    value: "",
  });

  const [newCustomCategory, setNewCustomCategory] = useState({
    name: "",
    icon: "ShoppingCart",
    color: "bg-green-500/20",
    textColor: "text-green-400",
  });

  const availableIcons = [
    { value: "Home", icon: Home },
    { value: "Zap", icon: Zap },
    { value: "Heart", icon: Heart },
    { value: "Shield", icon: Shield },
    { value: "Wifi", icon: Wifi },
    { value: "Smartphone", icon: Smartphone },
    { value: "Flame", icon: Flame },
    { value: "Sparkles", icon: Sparkles },
    { value: "Car", icon: Car },
    { value: "ShoppingCart", icon: ShoppingCart },
    { value: "Film", icon: Film },
    { value: "TrendingUp", icon: TrendingUp },
    { value: "Megaphone", icon: Megaphone },
    { value: "Train", icon: Train },
    { value: "UtensilsCrossed", icon: UtensilsCrossed },
    { value: "Shirt", icon: Shirt },
    { value: "Briefcase", icon: Briefcase },
    { value: "Wallet", icon: DollarSign },
    { value: "CreditCard", icon: CreditCard },
    { value: "Building", icon: Building },
    { value: "DollarSign", icon: DollarSign },
    { value: "MoreHorizontal", icon: MoreHorizontal },
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    } else {
      fetchExpenses(session.user.id);
      fetchLoans(session.user.id);
      fetchOptions(session.user.id);
      fetchIncomes(session.user.id);
    }
  };

  const fetchOptions = async (userId: string) => {
    const [invResult, patResult] = await Promise.all([
      supabase.from("investments").select("id, name").eq("user_id", userId),
      supabase.from("patrimony").select("id, name").eq("user_id", userId),
    ]);
    if (invResult.data) setInvestments(invResult.data);
    if (patResult.data) setPatrimony(patResult.data);
  };

  const fetchIncomes = async (userId: string) => {
    const { data } = await supabase.from("incomes").select("amount").eq("user_id", userId);
    if (data) setIncomes(data);
  };

  const fetchLoans = async (userId: string) => {
    const { data } = await supabase.from("loans").select("*").eq("user_id", userId).eq("status", "active");
    if (data) setLoans(data);
  };

  const fetchExpenses = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase.from("expenses").select("*").eq("user_id", userId).order("date", { ascending: false });
    if (data) setExpenses(data);
    setLoading(false);
  };

  const handleTrimSubscription = (subscription: any) => {
    setSelectedSubscription(subscription);
    setIsTrimModalOpen(true);
  };

  const confirmTrim = async () => {
    if (!selectedSubscription || trimLoading) return;
    
    setTrimLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("No has iniciado sesión");
        setTrimLoading(false);
        return;
      }

      const subscriptionAmount = parseFloat(selectedSubscription.amount) || 0;

      const { error } = await supabase
        .from("expenses")
        .update({ is_trimmed: true })
        .eq("id", selectedSubscription.id);

      if (error) {
        toast.error(`Error al recortar: ${error.message}`);
        setTrimLoading(false);
        return;
      }

      setExpenses((prev) =>
        prev.map((e) =>
          e.id === selectedSubscription.id ? { ...e, is_trimmed: true } : e
        )
      );
      
      setIsTrimModalOpen(false);
      setSavedAmount((prev) => prev + subscriptionAmount);
      setIsCelebrateModalOpen(true);
      
      toast.success(`¡Ahorrarás ${formatCurrency(subscriptionAmount)}/mes!`);
      
    } catch (err) {
      toast.error("Ha ocurrido un error inesperado");
    } finally {
      setTrimLoading(false);
    }
  };

  const handleRestoreSubscription = (subscription: any) => {
    setSelectedSubscription(subscription);
    setIsRestoreModalOpen(true);
  };

  const confirmRestore = async () => {
    if (!selectedSubscription || trimLoading) return;
    
    setTrimLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("No has iniciado sesión");
        setTrimLoading(false);
        return;
      }

      const subscriptionAmount = parseFloat(selectedSubscription.amount) || 0;

      const { error } = await supabase
        .from("expenses")
        .update({ is_trimmed: false })
        .eq("id", selectedSubscription.id);

      if (error) {
        toast.error(`Error al restaurar: ${error.message}`);
        setTrimLoading(false);
        return;
      }

      setExpenses((prev) =>
        prev.map((e) =>
          e.id === selectedSubscription.id ? { ...e, is_trimmed: false } : e
        )
      );
      
      setSavedAmount((prev) => Math.max(0, prev - subscriptionAmount));
      setIsRestoreModalOpen(false);
      setSelectedSubscription(null);
      toast.success("Suscripción restaurada correctamente");
      
    } catch (err) {
      toast.error("Ha ocurrido un error inesperado");
    } finally {
      setTrimLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (isSubmitting) return;
    if (!newExpense.amount || !newExpense.source) return;
    setIsSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsSubmitting(false);
      return;
    }
    const { error } = await supabase.from("expenses").insert({
      user_id: session.user.id,
      amount: parseFloat(newExpense.amount),
      description: newExpense.source,
      category: newExpense.category,
      date: formatDateToISO(newExpense.date),
      is_recurring: newExpense.is_recurring,
      investment_id: newExpense.investment_id === "none" ? null : newExpense.investment_id,
      patrimony_id: newExpense.patrimony_id === "none" ? null : newExpense.patrimony_id,
      has_scheduled_change: newExpense.has_scheduled_change,
      scheduled_change_date: newExpense.scheduled_change_date ? formatDateToISO(newExpense.scheduled_change_date) : null,
      scheduled_new_amount: newExpense.scheduled_new_amount ? parseFloat(newExpense.scheduled_new_amount) : null,
      scheduled_change_type: newExpense.scheduled_change_type,
    });
    if (!error) {
      setIsDialogOpen(false);
      setNewExpense({
        source: "",
        amount: "",
        is_recurring: false,
        category: "groceries",
        date: new Date(),
        investment_id: "none",
        patrimony_id: "none",
        has_scheduled_change: false,
        scheduled_change_date: null,
        scheduled_new_amount: "",
        scheduled_change_type: "increase",
      });
      fetchExpenses(session.user.id);
    }
    setIsSubmitting(false);
  };

  const handleEditExpense = async () => {
    if (isSubmitting || !selectedExpense) return;
    setIsSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsSubmitting(false);
      return;
    }
    const { error } = await supabase.from("expenses").update({
      amount: parseFloat(editExpense.amount),
      description: editExpense.source,
      category: editExpense.category,
      date: formatDateToISO(editExpense.date),
      is_recurring: editExpense.is_recurring,
      investment_id: editExpense.investment_id === "none" ? null : editExpense.investment_id,
      patrimony_id: editExpense.patrimony_id === "none" ? null : editExpense.patrimony_id,
      has_scheduled_change: editExpense.has_scheduled_change,
      scheduled_change_date: editExpense.scheduled_change_date ? formatDateToISO(editExpense.scheduled_change_date) : null,
      scheduled_new_amount: editExpense.scheduled_new_amount ? parseFloat(editExpense.scheduled_new_amount) : null,
      scheduled_change_type: editExpense.scheduled_change_type,
    }).eq("id", selectedExpense.id);
    if (!error) {
      setIsEditDialogOpen(false);
      setSelectedExpense(null);
      fetchExpenses(session.user.id);
    }
    setIsSubmitting(false);
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;
    const { error } = await supabase.from("expenses").delete().eq("id", selectedExpense.id);
    if (!error) {
      setIsDeleteDialogOpen(false);
      setSelectedExpense(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchExpenses(session.user.id);
    }
  };

  const openEditDialog = (expense: any) => {
    setSelectedExpense(expense);
    const expenseDate = safeDate(expense.date);
    setEditExpense({
      id: expense.id,
      source: expense.description || "",
      amount: expense.amount.toString(),
      is_recurring: expense.is_recurring === true || expense.is_recurring === 1 || expense.is_recurring === "true",
      category: expense.category,
      date: expenseDate,
      investment_id: expense.investment_id || "none",
      patrimony_id: expense.patrimony_id || "none",
      has_scheduled_change: expense.has_scheduled_change === true || expense.has_scheduled_change === 1 || expense.has_scheduled_change === "true",
      scheduled_change_date: expense.scheduled_change_date ? safeDate(expense.scheduled_change_date) : null,
      scheduled_new_amount: expense.scheduled_new_amount?.toString() || "",
      scheduled_change_type: expense.scheduled_change_type || "increase",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (expense: any) => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateCustomCategory = () => {
    if (!newCustomCategory.name) return;
    const categoryValue = `custom_${newCustomCategory.name.toLowerCase().replace(/\s+/g, "_")}`;
    const iconData = availableIcons.find((i) => i.value === newCustomCategory.icon);
    const newCategory: CategoryOption = {
      value: categoryValue,
      label: newCustomCategory.name,
      icon: iconData?.icon || ShoppingCart,
      color: newCustomCategory.color,
      textColor: newCustomCategory.textColor,
    };
    setCustomCategories([...customCategories, newCategory]);
    setNewExpense({ ...newExpense, category: categoryValue });
    setIsCreateCategoryDialogOpen(false);
    setNewCustomCategory({ name: "", icon: "ShoppingCart", color: "bg-green-500/20", textColor: "text-green-400" });
  };

  const filteredExpenses = expenses.filter((expense) => {
    if (!expense.date) return false;
    const expenseDate = new Date(expense.date + "T00:00:00");
    if (isNaN(expenseDate.getTime())) return false;
    const expenseYear = expenseDate.getFullYear().toString();
    const expenseMonth = (expenseDate.getMonth() + 1).toString().padStart(2, "0");
    if (filterYear !== "all" && expenseYear !== filterYear) return false;
    if (filterMonth !== "all" && expenseMonth !== filterMonth) return false;
    return true;
  });

  const allSubscriptions = filteredExpenses.filter((e) => e.category === "subscriptions");
  const activeSubscriptions = allSubscriptions.filter((e) => !e.is_trimmed);
  const trimmedSubscriptions = allSubscriptions.filter((e) => e.is_trimmed);
  
  const totalActiveSubscriptions = activeSubscriptions.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalTrimmedSavings = trimmedSubscriptions.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalSubscriptions = totalActiveSubscriptions + totalTrimmedSavings;

  const puntualExpenses = filteredExpenses
    .filter(e => !e.is_recurring && !e.is_trimmed)
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const recurrentExpenses = filteredExpenses
    .filter(e => e.is_recurring && !e.is_trimmed)
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const totalLoans = loans.reduce((sum, loan) => sum + parseFloat(loan.monthly_payment || 0), 0);

  const totalWithLoans = puntualExpenses + recurrentExpenses + totalLoans;

  const puntualPercentage = totalWithLoans > 0 ? (puntualExpenses / totalWithLoans) * 100 : 0;
  const recurrentPercentage = totalWithLoans > 0 ? (recurrentExpenses / totalWithLoans) * 100 : 0;
  const loansPercentage = totalWithLoans > 0 ? (totalLoans / totalWithLoans) * 100 : 0;

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

  const sortedActiveSubscriptions = [...activeSubscriptions].sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
  const sortedTrimmedSubscriptions = [...trimmedSubscriptions].sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

  const expensesByCategory = filteredExpenses.reduce((acc, e) => {
    if (e.is_trimmed) return acc;
    if (!acc[e.category]) acc[e.category] = 0;
    acc[e.category] += parseFloat(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories: { category: string; amount: number }[] = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([category, amount]) => ({ category, amount: amount as number }));

  const allCategories = [...expenseCategories, ...customCategories];

  const getCategoryInfo = (categoryValue: string) =>
    allCategories.find((c) => c.value === categoryValue) || expenseCategories[expenseCategories.length - 1];

  const getSelectedCategoryInfo = (categoryValue: string) =>
    allCategories.find((c) => c.value === categoryValue) || expenseCategories.find((c) => c.value === categoryValue) || expenseCategories[0];

  const handleCreateInvestment = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !newInvestment.name || !newInvestment.initial_value) return;

    const { data, error } = await supabase.from("investments").insert({
      user_id: session.user.id,
      name: newInvestment.name,
      type: newInvestment.type,
      initial_value: parseFloat(newInvestment.initial_value),
      current_value: parseFloat(newInvestment.current_value) || parseFloat(newInvestment.initial_value),
    }).select().single();

    if (!error && data) {
      setInvestments([...investments, { id: data.id, name: data.name }]);
      setNewExpense({ ...newExpense, investment_id: data.id });
      setIsNewInvestmentOpen(false);
      setNewInvestment({ name: "", type: "stocks", initial_value: "", current_value: "" });
    }
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
      setNewExpense({ ...newExpense, patrimony_id: data.id });
      setIsNewPatrimonyOpen(false);
      setNewPatrimonyAsset({ name: "", category: "real_estate", value: "" });
    }
  };

  const investmentTypes = [
    { value: "stocks", label: "Acciones" },
    { value: "etf", label: "ETF" },
    { value: "crypto", label: "Criptomonedas" },
    { value: "bonds", label: "Bonos" },
    { value: "real_estate", label: "Bienes Raíces" },
    { value: "other", label: "Otros" },
  ];

  const patrimonyCategories = [
    { value: "real_estate", label: "Bienes Raíces" },
    { value: "vehicle", label: "Vehículos" },
    { value: "investments", label: "Inversiones" },
    { value: "savings", label: "Ahorros" },
    { value: "business", label: "Negocios" },
    { value: "other", label: "Otros" },
  ];

  const getLoanTypeInfo = (type: string) => {
    const types: Record<string, { label: string; color: string; textColor: string }> = {
      mortgage: { label: "Hipoteca", color: "bg-blue-500/20", textColor: "text-blue-400" },
      car: { label: "Coche", color: "bg-purple-500/20", textColor: "text-purple-400" },
      personal: { label: "Personal", color: "bg-cyan-500/20", textColor: "text-cyan-400" },
      business: { label: "Negocio", color: "bg-amber-500/20", textColor: "text-amber-400" },
      other: { label: "Otro", color: "bg-slate-500/20", textColor: "text-slate-400" },
    };
    return types[type] || types.other;
  };

  const getCategoryPredominantType = (category: string) => {
    let puntual = 0;
    let recurrente = 0;
    filteredExpenses
      .filter((e) => e.category === category && !e.is_trimmed)
      .forEach((e) => {
        if (e.is_recurring) {
          recurrente += parseFloat(e.amount);
        } else {
          puntual += parseFloat(e.amount);
        }
      });
    if (recurrente > puntual) {
      return { type: "recurrente", color: "bg-purple-500/20 text-purple-400" };
    }
    return { type: "puntual", color: "bg-red-500/20 text-red-400" };
  };

  return (
    <div className="min-h-screen bg-black pb-28">
      <DashboardHeader 
        title="FinPro" 
        subtitle="Control de Gastos"
      />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Selectores de fecha */}
        <div className="grid grid-cols-2 gap-4">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-full p-4 h-auto bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center justify-between hover:border-zinc-600 transition-all group">
              <span className="text-zinc-400 text-sm group-hover:text-zinc-300">Año</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-lg">{filterYear}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all" className="text-white">Todos</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()} className="text-white">{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-full p-4 h-auto bg-zinc-800 border-2 border-zinc-700 rounded-xl flex items-center justify-between hover:border-zinc-600 transition-all group">
              <span className="text-zinc-400 text-sm group-hover:text-zinc-300">Mes</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-lg">
                  {months.find(m => m.value === filterMonth)?.label}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value} className="text-white">{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Total Gastos */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <p className="text-zinc-400 text-sm mb-1 text-center">Total de Gastos</p>
            <p className="text-4xl font-bold text-white mb-6 text-center">{formatCurrency(totalWithLoans)}</p>
            
            {totalWithLoans > 0 ? (
              <>
                <div className="space-y-4">
                  <div className="h-4 bg-zinc-800 rounded-full overflow-hidden flex">
                    {puntualPercentage > 0 && (
                      <div 
                        className="h-full bg-red-500 transition-all duration-500"
                        style={{ width: `${puntualPercentage}%` }}
                      />
                    )}
                    {recurrentPercentage > 0 && (
                      <div 
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${recurrentPercentage}%` }}
                      />
                    )}
                    {loansPercentage > 0 && (
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${loansPercentage}%` }}
                      />
                    )}
                  </div>

                  <div className="flex justify-between items-start text-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <span className="text-zinc-400 text-xs font-medium">Puntuales</span>
                      </div>
                      <p className="text-white font-bold text-sm">{formatCurrency(puntualExpenses)}</p>
                      <p className="text-zinc-500 text-xs">{puntualPercentage.toFixed(0)}%</p>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                        <span className="text-zinc-400 text-xs font-medium">Recurrentes</span>
                      </div>
                      <p className="text-white font-bold text-sm">{formatCurrency(recurrentExpenses)}</p>
                      <p className="text-zinc-500 text-xs">{recurrentPercentage.toFixed(0)}%</p>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        <span className="text-zinc-400 text-xs font-medium">Préstamos</span>
                      </div>
                      <p className="text-white font-bold text-sm">{formatCurrency(totalLoans)}</p>
                      <p className="text-zinc-500 text-xs">{loansPercentage.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                {/* Distribución por categoría */}
                {sortedCategories.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-zinc-700">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-zinc-500 font-medium">Distribución por categoría</p>
                      <p className="text-xs text-zinc-500">
                        {sortedCategories.length} {sortedCategories.length === 1 ? 'categoría' : 'categorías'}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {sortedCategories.map((cat) => {
                        const catInfo = getCategoryInfo(cat.category);
                        const Icon = catInfo.icon;
                        const percentage = totalWithLoans > 0 ? (cat.amount / totalWithLoans) * 100 : 0;
                        const categoryType = getCategoryPredominantType(cat.category);
                        
                        return (
                          <div 
                            key={cat.category} 
                            className="w-full p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-all"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${catInfo.color}`}>
                                  <Icon className={`w-5 h-5 ${catInfo.textColor}`} />
                                </div>
                                <span className="text-sm text-zinc-200 font-medium">{catInfo.label}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${categoryType.color}`}>
                                  {categoryType.type === "recurrente" ? "Recurrente" : "Puntual"}
                                </span>
                              </div>
                              
                              <div className="ml-auto flex items-center gap-3 flex-shrink-0">
                                <span className="font-bold text-white text-lg">{formatCurrency(cat.amount)}</span>
                                <span className="text-sm text-zinc-400 w-12 text-right">{percentage.toFixed(1)}%</span>
                              </div>
                            </div>
                            
                            <div className="h-2.5 bg-zinc-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${catInfo.color.replace('/20', '')}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {totalTrimmedSavings > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 rounded-lg">
                      <BadgeCheck className="w-5 h-5 text-green-400" />
                      <p className="text-green-400 text-sm">
                        <span className="font-medium">{formatCurrency(totalTrimmedSavings)}/mes</span> recortados de suscripciones
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-zinc-500 text-sm">No hay gastos registrados</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botón Nuevo Gasto */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-base font-semibold">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Agregar Gasto</DialogTitle>
            </DialogHeader>
            <button onClick={() => setIsDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white">
              <X className="w-4 h-4" />
            </button>
            <ExpenseForm
              expense={newExpense}
              setExpense={setNewExpense}
              onSubmit={handleAddExpense}
              isSubmitting={isSubmitting}
              isNew={true}
              investments={investments}
              patrimony={patrimony}
              isNewInvestmentOpen={isNewInvestmentOpen}
              setIsNewInvestmentOpen={setIsNewInvestmentOpen}
              isNewPatrimonyOpen={isNewPatrimonyOpen}
              setIsNewPatrimonyOpen={setIsNewPatrimonyOpen}
              newInvestment={newInvestment}
              setNewInvestment={setNewInvestment}
              newPatrimonyAsset={newPatrimonyAsset}
              setNewPatrimonyAsset={setNewPatrimonyAsset}
              handleCreateInvestment={handleCreateInvestment}
              handleCreatePatrimony={handleCreatePatrimony}
              investmentTypes={investmentTypes}
              patrimonyCategories={patrimonyCategories}
              isCategoryDialogOpen={isCategoryDialogOpen}
              setIsCategoryDialogOpen={setIsCategoryDialogOpen}
              isCreateCategoryDialogOpen={isCreateCategoryDialogOpen}
              setIsCreateCategoryDialogOpen={setIsCreateCategoryDialogOpen}
              isInvestmentDialogOpen={isInvestmentDialogOpen}
              setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
              isPatrimonyDialogOpen={isPatrimonyDialogOpen}
              setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
              getSelectedCategoryInfo={getSelectedCategoryInfo}
              customCategories={customCategories}
              availableIcons={availableIcons}
              categoryColors={categoryColors}
              newCustomCategory={newCustomCategory}
              setNewCustomCategory={setNewCustomCategory}
              handleCreateCustomCategory={handleCreateCustomCategory}
            />
          </DialogContent>
        </Dialog>

        {/* Suscripciones */}
        <Card className="bg-gradient-to-r from-pink-900 to-zinc-900 border-pink-800">
          <CardHeader className="pb-2">
            <button onClick={() => setShowSubscriptions(!showSubscriptions)} className="w-full text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-pink-400" />
                  <CardTitle className="text-white text-sm">Suscripciones</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-pink-400">{formatCurrency(totalActiveSubscriptions)}</span>
                  {showSubscriptions ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                </div>
              </div>
              {activeSubscriptions.length > 0 && (
                <p className="text-zinc-400 text-xs mt-1">
                  {activeSubscriptions.length} {activeSubscriptions.length === 1 ? 'suscripción' : 'suscripciones'} activas · {formatCurrency(totalActiveSubscriptions)}/mes
                </p>
              )}
              {trimmedSubscriptions.length > 0 && (
                <p className="text-green-400 text-xs mt-1">
                  Recortadas: {trimmedSubscriptions.length} · Ahorro: {formatCurrency(totalTrimmedSavings)}/mes
                </p>
              )}
              <p className="text-zinc-500 text-[10px]">Gastos recurrentes automáticos</p>
            </button>
          </CardHeader>
          {showSubscriptions && (
            <CardContent>
              {allSubscriptions.length === 0 ? (
                <div className="text-center py-6">
                  <Smartphone className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                  <p className="text-zinc-400 text-sm mb-1">No tienes suscripciones registradas</p>
                  <p className="text-zinc-500 text-xs">Añade gastos de tipo "Suscripciones" para empezar</p>
                </div>
              ) : (
                <>
                  {activeSubscriptions.length > 0 && (
                    <div className="flex items-center gap-2 p-2 mb-3 bg-pink-500/10 rounded-lg border border-pink-500/20">
                      <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0" />
                      <p className="text-pink-300 text-xs">Revisa qué suscripciones puedes cancelar para ahorrar</p>
                    </div>
                  )}

                  {sortedActiveSubscriptions.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {sortedActiveSubscriptions.map((sub) => (
                        <div 
                          key={sub.id} 
                          className="relative p-3 bg-zinc-800/50 rounded-xl border border-zinc-700 hover:border-pink-500/50 transition-all group"
                        >
                          {sub.is_trimmed && (
                            <div className="absolute -top-2 -right-2 bg-green-500 text-black text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3" />
                              Recortada
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-white text-sm truncate pr-2">{sub.description}</p>
                            <p className="font-bold text-pink-400 text-sm whitespace-nowrap">{formatCurrency(sub.amount)}</p>
                          </div>
                          
                          <button
                            onClick={() => handleTrimSubscription(sub)}
                            className="w-full py-1.5 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                          >
                            <Scissors className="w-3.5 h-3.5" />
                            Recortar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {sortedTrimmedSubscriptions.length > 0 && (
                    <div className="border-t border-zinc-700 pt-4 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Check className="w-4 h-4 text-green-400" />
                        <p className="text-green-400 text-xs font-medium">
                          {sortedTrimmedSubscriptions.length} recortada{sortedTrimmedSubscriptions.length > 1 ? 's' : ''} · Ahorro total: {formatCurrency(totalTrimmedSavings)}/mes
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {sortedTrimmedSubscriptions.map((sub) => (
                          <div 
                            key={sub.id} 
                            className="relative p-3 bg-green-500/10 rounded-xl border border-green-500/20 opacity-60"
                          >
                            <div className="absolute -top-2 -right-2 bg-green-500 text-black text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3" />
                              Recortada
                            </div>
                            
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-white text-sm truncate pr-2 line-through">{sub.description}</p>
                              <p className="font-bold text-green-400 text-sm whitespace-nowrap">{formatCurrency(sub.amount)}</p>
                            </div>
                            
                            <button
                              onClick={() => handleRestoreSubscription(sub)}
                              className="w-full py-1.5 px-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Restaurar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sortedTrimmedSubscriptions.length > 0 && sortedActiveSubscriptions.length === 0 && (
                    <div className="text-center py-6 border-t border-green-500/20 mt-4 pt-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check className="w-6 h-6 text-green-400" />
                      </div>
                      <p className="text-green-400 font-medium mb-1">¡Felicidades!</p>
                      <p className="text-zinc-400 text-sm">Has recortado todas tus suscripciones</p>
                      <p className="text-green-300 text-xs mt-2">Ahorro total: {formatCurrency(totalTrimmedSavings)}/mes</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          )}
        </Card>

        {/* Historial */}
        <div className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between w-full flex-wrap gap-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  Historial
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => setFilterExpenseType("all")}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${
                    filterExpenseType === "all"
                      ? "bg-zinc-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterExpenseType("puntual")}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${
                    filterExpenseType === "puntual"
                      ? "bg-red-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  Puntuales
                </button>
                <button
                  onClick={() => setFilterExpenseType("recurrente")}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${
                    filterExpenseType === "recurrente"
                      ? "bg-purple-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  Recurrentes
                </button>
                <button
                  onClick={() => setFilterExpenseType("prestamo")}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${
                    filterExpenseType === "prestamo"
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  Préstamos
                </button>
              </div>

              {loading ? (
                <p className="text-zinc-500 text-center text-xs">Cargando...</p>
              ) : filterExpenseType === "prestamo" ? (
                loans.length === 0 ? (
                  <p className="text-zinc-500 text-center text-xs">Sin préstamos activos</p>
                ) : (
                  <div className="space-y-4">
                    {loans.map((loan) => {
                      const loanInfo = getLoanTypeInfo(loan.type);
                      return (
                        <div
                          key={loan.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${loanInfo.color}`}>
                              <Building className={`w-5 h-5 ${loanInfo.textColor}`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-white">
                                {loan.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-400">
                                  Préstamo
                                </span>
                                <span className="text-xs text-zinc-500">
                                  {formatCurrency(loan.monthly_payment)}/mes
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-red-500">
                              -{formatCurrency(loan.monthly_payment)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : filteredExpenses.length === 0 ? (
                <p className="text-zinc-500 text-center text-xs">Sin gastos</p>
              ) : (
                <div className="space-y-4">
                  {filteredExpenses
                    .filter((expense) => {
                      if (filterExpenseType === "puntual") return !expense.is_recurring;
                      if (filterExpenseType === "recurrente") return expense.is_recurring;
                      return true;
                    })
                    .map((expense) => {
                      const cat = getCategoryInfo(expense.category);
                      const Icon = cat.icon;
                      const isTrimmed = expense.is_trimmed === true;
                      
                      return (
                        <div
                          key={expense.id}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                            isTrimmed
                              ? "bg-green-500/5 opacity-50"
                              : "bg-zinc-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                              <Icon className={`w-5 h-5 ${cat.textColor}`} />
                            </div>
                            <div>
                              <p className={`font-medium text-sm ${isTrimmed ? "line-through text-zinc-500" : "text-white"}`}>
                                {expense.description || cat.label}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-zinc-500">{formatDateSafe(expense.date)}</p>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  expense.is_recurring
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}>
                                  {expense.is_recurring ? "Recurrente" : "Puntual"}
                                </span>
                                {isTrimmed && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full">
                                    <BadgeCheck className="w-3 h-3" />
                                    Recortada
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`font-bold text-sm ${isTrimmed ? "text-green-500 line-through" : "text-red-500"}`}>
                                {isTrimmed ? "+" : "-"}{formatCurrency(expense.amount)}
                              </p>
                            </div>
                            {!isTrimmed && (
                              <div className="flex flex-col gap-1">
                                <button onClick={() => openEditDialog(expense)} className="p-1.5 rounded-lg hover:bg-zinc-700 transition-colors">
                                  <Pencil className="w-4 h-4 text-zinc-400" />
                                </button>
                                <button onClick={() => openDeleteDialog(expense)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors">
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            )}
                            {isTrimmed && (
                              <button onClick={() => handleRestoreSubscription(expense)} className="p-1.5 rounded-lg hover:bg-green-500/20 transition-colors">
                                <RotateCcw className="w-4 h-4 text-green-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <TrimConfirmModal
        isOpen={isTrimModalOpen}
        onOpenChange={setIsTrimModalOpen}
        subscription={selectedSubscription}
        onConfirm={confirmTrim}
        isLoading={trimLoading}
      />

      <CelebrateAnimation
        isOpen={isCelebrateModalOpen}
        onClose={() => setIsCelebrateModalOpen(false)}
        amount={selectedSubscription ? parseFloat(selectedSubscription.amount) : 0}
      />

      <AlertDialog open={isRestoreModalOpen} onOpenChange={setIsRestoreModalOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 max-w-sm">
          <AlertDialogHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <RotateCcw className="w-8 h-8 text-green-400" />
            </div>
            <AlertDialogTitle className="text-xl text-white">
              ¿Restaurar esta suscripción?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-center">
              La suscripción volverá a contar en tus gastos mensuales. Dejará de considerarse como recortada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 sm:gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setIsRestoreModalOpen(false);
                setSelectedSubscription(null);
              }}
              disabled={trimLoading}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmRestore}
              disabled={trimLoading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {trimLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : (
                "Sí, restaurar"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-white">Editar Gasto</DialogTitle></DialogHeader>
          <button onClick={() => setIsEditDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white">
            <X className="w-4 h-4" />
          </button>
          <ExpenseForm
            expense={editExpense}
            setExpense={setEditExpense}
            onSubmit={handleEditExpense}
            isSubmitting={isSubmitting}
            isNew={false}
            investments={investments}
            patrimony={patrimony}
            isNewInvestmentOpen={isNewInvestmentOpen}
            setIsNewInvestmentOpen={setIsNewInvestmentOpen}
            isNewPatrimonyOpen={isNewPatrimonyOpen}
            setIsNewPatrimonyOpen={setIsNewPatrimonyOpen}
            newInvestment={newInvestment}
            setNewInvestment={setNewInvestment}
            newPatrimonyAsset={newPatrimonyAsset}
            setNewPatrimonyAsset={setNewPatrimonyAsset}
            handleCreateInvestment={handleCreateInvestment}
            handleCreatePatrimony={handleCreatePatrimony}
            investmentTypes={investmentTypes}
            patrimonyCategories={patrimonyCategories}
            isCategoryDialogOpen={isCategoryDialogOpen}
            setIsCategoryDialogOpen={setIsCategoryDialogOpen}
            isCreateCategoryDialogOpen={isCreateCategoryDialogOpen}
            setIsCreateCategoryDialogOpen={setIsCreateCategoryDialogOpen}
            isInvestmentDialogOpen={isInvestmentDialogOpen}
            setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
            isPatrimonyDialogOpen={isPatrimonyDialogOpen}
            setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
            getSelectedCategoryInfo={getSelectedCategoryInfo}
            customCategories={customCategories}
            availableIcons={availableIcons}
            categoryColors={categoryColors}
            newCustomCategory={newCustomCategory}
            setNewCustomCategory={setNewCustomCategory}
            handleCreateCustomCategory={handleCreateCustomCategory}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Eliminar Gasto</DialogTitle></DialogHeader>
          <button onClick={() => setIsDeleteDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white">
            <X className="w-4 h-4" />
          </button>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300 text-sm">¿Eliminar este gasto?</p>
            {selectedExpense && (
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedExpense.description}</p>
                <p className="text-red-400 font-bold">{formatCurrency(selectedExpense.amount)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800 text-xs">Cancelar</Button>
              <Button onClick={handleDeleteExpense} className="flex-1 bg-red-500 hover:bg-red-600 text-xs">Eliminar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

const ExpenseForm = ({
  expense, setExpense, onSubmit, isSubmitting, isNew,
  investments, patrimony,
  isNewInvestmentOpen, setIsNewInvestmentOpen,
  isNewPatrimonyOpen, setIsNewPatrimonyOpen,
  newInvestment, setNewInvestment,
  newPatrimonyAsset, setNewPatrimonyAsset,
  handleCreateInvestment, handleCreatePatrimony,
  investmentTypes, patrimonyCategories,
  isCategoryDialogOpen, setIsCategoryDialogOpen,
  isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen,
  isInvestmentDialogOpen, setIsInvestmentDialogOpen,
  isPatrimonyDialogOpen, setIsPatrimonyDialogOpen,
  getSelectedCategoryInfo,
  customCategories, availableIcons, categoryColors,
  newCustomCategory, setNewCustomCategory, handleCreateCustomCategory,
}: any) => {
  
  const getInvestmentLabel = () =>
    expense.investment_id === "none" ? "Sin vincular" : investments.find((i: any) => i.id === expense.investment_id)?.name || "Sin vincular";
  
  const getPatrimonyLabel = () =>
    expense.patrimony_id === "none" ? "Sin vincular" : patrimony.find((p: any) => p.id === expense.patrimony_id)?.name || "Sin vincular";

  const handleDateChange = (date: Date | undefined) => {
    setExpense({ ...expense, date: date || new Date() });
  };

  return (
    <div className="space-y-3 mt-2">
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Concepto</label>
        <Input 
          placeholder="Ej: Supermercado..." 
          value={expense.source} 
          onChange={(e) => setExpense({ ...expense, source: e.target.value })} 
          className="bg-zinc-800 border-zinc-700 text-white text-sm" 
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Importe (€)</label>
        <Input 
          type="number" 
          step="0.01"
          placeholder="0.00" 
          value={expense.amount} 
          onChange={(e) => setExpense({ ...expense, amount: e.target.value })} 
          className="bg-zinc-800 border-zinc-700 text-white text-sm" 
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Categoría</label>
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <button type="button" className="w-full p-2 bg-zinc-800 border-2 border-zinc-700 rounded-lg flex items-center gap-2 hover:border-zinc-600 transition-all">
              {(() => { 
                const cat = getSelectedCategoryInfo(expense.category); 
                const Icon = cat.icon; 
                return (
                  <>
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${cat.color}`}>
                      <Icon className={`w-3 h-3 ${cat.textColor}`} />
                    </div>
                    <span className="text-white text-sm">{cat.label}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 ml-auto" />
                  </>
                ); 
              })()}
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[70vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-white text-sm">Categoría</DialogTitle></DialogHeader>
            <button onClick={() => setIsCategoryDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {expenseCategories.map((cat) => { 
                const Icon = cat.icon; 
                return (
                  <button 
                    key={cat.value} 
                    type="button" 
                    onClick={() => { 
                      setExpense({ ...expense, category: cat.value }); 
                      setIsCategoryDialogOpen(false); 
                    }} 
                    className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                      expense.category === cat.value ? "border-red-500 bg-red-500/20" : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${cat.color}`}>
                      <Icon className={`w-4 h-4 ${cat.textColor}`} />
                    </div>
                    <span className={`text-[10px] font-medium ${expense.category === cat.value ? "text-white" : "text-zinc-400"}`}>{cat.label}</span>
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
              className="w-full p-2 rounded-lg border-2 border-dashed border-zinc-600 bg-zinc-800/50 flex items-center justify-center gap-1 hover:border-red-500 hover:bg-red-500/10 transition-all mt-2"
            >
              <Plus className="w-4 h-4 text-red-400" /><span className="text-red-400 text-xs">Crear</span>
            </button>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Fecha</label>
        <DatePicker
          date={expense.date}
          onDateChange={handleDateChange}
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-2 block">Tipo de gasto</label>
        <div className="grid grid-cols-2 gap-2">
          <button 
            type="button" 
            onClick={() => setExpense({ ...expense, is_recurring: true })} 
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
              expense.is_recurring ? "border-purple-500 bg-purple-500/20" : "border-zinc-700 bg-zinc-800"
            }`}
          >
            <RefreshCcw className={`w-5 h-5 ${expense.is_recurring ? "text-purple-400" : "text-zinc-400"}`} />
            <span className={`font-medium text-xs ${expense.is_recurring ? "text-white" : "text-zinc-400"}`}>Recurrente</span>
          </button>
          <button 
            type="button" 
            onClick={() => setExpense({ ...expense, is_recurring: false })} 
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
              !expense.is_recurring ? "border-red-500 bg-red-500/20" : "border-zinc-700 bg-zinc-800"
            }`}
          >
            <DollarSign className={`w-5 h-5 ${!expense.is_recurring ? "text-red-400" : "text-zinc-400"}`} />
            <span className={`font-medium text-xs ${!expense.is_recurring ? "text-white" : "text-zinc-400"}`}>Puntual</span>
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Vincular a Inversión</label>
        <Dialog open={isInvestmentDialogOpen} onOpenChange={setIsInvestmentDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={`w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3 transition-all ${
                expense.investment_id !== "none" 
                  ? "border-emerald-500/50 bg-emerald-500/10" 
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                expense.investment_id !== "none" 
                  ? "bg-emerald-500/20" 
                  : "bg-zinc-700"
              }`}>
                <TrendingUp className={`w-4 h-4 ${expense.investment_id !== "none" ? "text-emerald-400" : "text-zinc-400"}`} />
              </div>
              <span className={`font-medium ${expense.investment_id !== "none" ? "text-emerald-400" : "text-zinc-400"}`}>
                {getInvestmentLabel()}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500 ml-auto" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Vincular a Inversión</DialogTitle>
            </DialogHeader>
            <button 
              onClick={() => setIsInvestmentDialogOpen(false)} 
              className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setExpense({ ...expense, investment_id: "none" });
                  setIsInvestmentDialogOpen(false);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  expense.investment_id === "none"
                    ? "border-zinc-500 bg-zinc-800"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-zinc-400" />
                </div>
                <span className="text-zinc-400 font-medium">Sin vincular</span>
              </button>

              {investments.map((inv: any) => (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => {
                    setExpense({ ...expense, investment_id: inv.id });
                    setIsInvestmentDialogOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    expense.investment_id === inv.id
                      ? "border-emerald-500 bg-emerald-500/20"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-white font-medium">{inv.name}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setIsInvestmentDialogOpen(false);
                  setTimeout(() => setIsNewInvestmentOpen(true), 100);
                }}
                className="w-full p-3 rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-800/50 flex items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Crear nueva inversión</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Vincular a Patrimonio</label>
        <Dialog open={isPatrimonyDialogOpen} onOpenChange={setIsPatrimonyDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={`w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3 transition-all ${
                expense.patrimony_id !== "none" 
                  ? "border-sky-500/50 bg-sky-500/10" 
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                expense.patrimony_id !== "none" 
                  ? "bg-sky-500/20" 
                  : "bg-zinc-700"
              }`}>
                <Building className={`w-4 h-4 ${expense.patrimony_id !== "none" ? "text-sky-400" : "text-zinc-400"}`} />
              </div>
              <span className={`font-medium ${expense.patrimony_id !== "none" ? "text-sky-400" : "text-zinc-400"}`}>
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
                  setExpense({ ...expense, patrimony_id: "none" });
                  setIsPatrimonyDialogOpen(false);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  expense.patrimony_id === "none"
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
                    setExpense({ ...expense, patrimony_id: pat.id });
                    setIsPatrimonyDialogOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    expense.patrimony_id === pat.id
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

      <Button 
        onClick={onSubmit} 
        className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-4" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Guardando..." : isNew ? "Guardar" : "Guardar cambios"}
      </Button>
    </div>
  );
};

export default ExpensesPage;