"use client";

import { useState, useEffect, useCallback } from "react";
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
  Search,
  CalendarOff,
  Ban,
  CreditCard,
  Droplets,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";

const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};
import BottomNav from "@/components/dashboard/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TrimConfirmModal from "@/components/dashboard/TrimConfirmModal";
import CelebrateAnimation from "@/components/dashboard/CelebrateAnimation";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currency";
import { getVisualBarWidth } from "@/utils/helpers";

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

const expenseCategories: CategoryOption[] = [
  { value: "housing", label: "Casa", icon: Home, color: "bg-blue-500/20", textColor: "text-blue-400" },
  { value: "electricity", label: "Luz", icon: Zap, color: "bg-yellow-500/20", textColor: "text-yellow-400" },
  { value: "water", label: "Agua", icon: Droplets, color: "bg-cyan-500/20", textColor: "text-cyan-400" },
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

  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<any>(null);
  
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
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      setSelectedIndex(carouselApi.selectedScrollSnap());
    };
    carouselApi.on("select", onSelect);
    onSelect();
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

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
      start_date: newExpense.is_recurring ? formatDateToISO(newExpense.date) : null,
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
      toast.success("Gasto añadido correctamente");
    } else {
      toast.error("Error al añadir gasto");
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
      toast.success("Gasto actualizado");
    } else {
      toast.error("Error al actualizar gasto");
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
      toast.success("Gasto eliminado");
    } else {
      toast.error("Error al eliminar gasto");
    }
  };

  const handleSkipMonth = async () => {
    if (!selectedExpense) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from("expenses")
      .update({ is_skipped: true })
      .eq("id", selectedExpense.id);
    if (!error) {
      setIsDeleteDialogOpen(false);
      setSelectedExpense(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchExpenses(session.user.id);
      toast.success("Gasto omitido para este mes");
    } else {
      toast.error("Error al omitir gasto");
    }
    setIsSubmitting(false);
  };

  const handleStopRecurrence = async () => {
    if (!selectedExpense) return;
    setIsSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error: deleteError } = await supabase
      .from("expenses")
      .delete()
      .eq("id", selectedExpense.id);
    if (deleteError) {
      toast.error("Error al detener recurrencia");
      setIsSubmitting(false);
      return;
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const endDate = formatDateToISO(yesterday);
    const { error: updateError } = await supabase
      .from("expenses")
      .update({ end_date: endDate })
      .eq("user_id", session.user.id)
      .eq("description", selectedExpense.description)
      .eq("category", selectedExpense.category)
      .eq("is_recurring", true);
    if (!updateError) {
      setIsDeleteDialogOpen(false);
      setSelectedExpense(null);
      fetchExpenses(session.user.id);
      toast.success("Recurrencia detenida");
    } else {
      toast.error("Error al actualizar serie recurrente");
    }
    setIsSubmitting(false);
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
    if (isEditDialogOpen) {
      setEditExpense({ ...editExpense, category: categoryValue });
    } else {
      setNewExpense({ ...newExpense, category: categoryValue });
    }
    setIsCreateCategoryDialogOpen(false);
    setNewCustomCategory({ name: "", icon: "ShoppingCart", color: "bg-green-500/20", textColor: "text-green-400" });
  };

  const allCategories = [...expenseCategories, ...customCategories];

  const filteredExpenses = expenses.filter((expense) => {
    if (expense.is_skipped) return false;
    if (!expense.date) return false;
    const expenseDate = new Date(expense.date + "T00:00:00");
    if (isNaN(expenseDate.getTime())) return false;
    const expenseYear = expenseDate.getFullYear().toString();
    const incomeMonth = (expenseDate.getMonth() + 1).toString().padStart(2, "0");
    if (filterYear !== "all" && expenseYear !== filterYear) return false;
    if (filterMonth !== "all" && incomeMonth !== filterMonth) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesDescription = expense.description?.toLowerCase().includes(query);
      const categoryInfo = allCategories.find((c) => c.value === expense.category);
      const matchesCategory = categoryInfo?.label?.toLowerCase().includes(query);
      if (!matchesDescription && !matchesCategory) return false;
    }
    return true;
  });

  const allSubscriptions = filteredExpenses.filter((e) => e.category === "subscriptions");
  const activeSubscriptions = allSubscriptions.filter((e) => !e.is_trimmed);
  const trimmedSubscriptions = allSubscriptions.filter((e) => e.is_trimmed);
  const totalActiveSubscriptions = activeSubscriptions.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalTrimmedSavings = trimmedSubscriptions.reduce((sum, e) => sum + parseFloat(e.amount), 0);

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

  const expenseTypesSorted = [
    { type: "puntual", amount: puntualExpenses, percentage: puntualPercentage, color: "bg-red-500", label: "Puntuales" },
    { type: "recurrente", amount: recurrentExpenses, percentage: recurrentPercentage, color: "bg-purple-500", label: "Recurrentes" },
    { type: "prestamo", amount: totalLoans, percentage: loansPercentage, color: "bg-blue-500", label: "Préstamos" },
  ].filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount);

  const expensesByCategory = filteredExpenses.reduce((acc, e) => {
    if (e.is_trimmed) return acc;
    if (!acc[e.category]) acc[e.category] = 0;
    acc[e.category] += parseFloat(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories: { category: string; amount: number }[] = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([category, amount]) => ({ category, amount: amount as number }));

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
      if (isEditDialogOpen) {
        setEditExpense({ ...editExpense, investment_id: data.id });
      } else {
        setNewExpense({ ...newExpense, investment_id: data.id });
      }
      setIsNewInvestmentOpen(false);
      setNewInvestment({ name: "", type: "stocks", initial_value: "", current_value: "" });
      toast.success("Inversión creada");
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
      if (isEditDialogOpen) {
        setEditExpense({ ...editExpense, patrimony_id: data.id });
      } else {
        setNewExpense({ ...newExpense, patrimony_id: data.id });
      }
      setIsNewPatrimonyOpen(false);
      setNewPatrimonyAsset({ name: "", category: "real_estate", value: "" });
      toast.success("Patrimonio creado");
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

  const getCategoryPredominatedType = (category: string) => {
    let puntual = 0;
    let recurrente = 0;
    filteredExpenses
      .filter((e) => e.category === category && !e.is_trimmed)
      .forEach((e) => {
        if (e.is_recurring) recurrente += parseFloat(e.amount);
        else puntual += parseFloat(e.amount);
      });
    if (recurrente > puntual) return { type: "recurrente", color: "bg-purple-500/20 text-purple-400" };
    return { type: "puntual", color: "bg-red-500/20 text-red-400" };
  };

  return (
    <div className="min-h-screen bg-black pb-28">
      <DashboardHeader title="Monyro" subtitle="Control de Gastos" />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
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

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <p className="text-zinc-400 text-sm mb-1 text-center">Total de Gastos</p>
            <p className="text-4xl font-bold text-white mb-6 text-center">{formatCurrency(totalWithLoans)}</p>
            
            {totalWithLoans > 0 ? (
              <>
                <div className="space-y-4">
                  <div className="h-4 bg-zinc-800 rounded-full overflow-hidden flex">
                    {expenseTypesSorted.map((item) => (
                      <div
                        key={item.type}
                        className={`h-full ${item.color} transition-all duration-500`}
                        style={{ width: `${getVisualBarWidth(item.percentage, 5)}%` }}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between items-start text-center flex-wrap gap-2">
                    {expenseTypesSorted.map((item) => (
                      <div key={item.type} className="flex-1 min-w-[80px]">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                          <span className="text-zinc-400 text-xs font-medium">{item.label}</span>
                        </div>
                        <p className="text-white font-bold text-sm">{formatCurrency(item.amount)}</p>
                        <p className="text-zinc-500 text-xs">{item.percentage.toFixed(0)}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                {sortedCategories.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-zinc-700">
                    <div className="mb-4">
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-red-500 hover:bg-red-600 text-white py-4 text-sm font-semibold">
                            <Plus className="w-4 h-4 mr-2" />
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
                            setIsNewInvestmentOpen={setIsNewInvestmentOpen}
                            setIsNewPatrimonyOpen={setIsNewPatrimonyOpen}
                            isCategoryDialogOpen={isCategoryDialogOpen}
                            setIsCategoryDialogOpen={setIsCategoryDialogOpen}
                            isCreateCategoryDialogOpen={isCreateCategoryDialogOpen}
                            setIsCreateCategoryDialogOpen={setIsCreateCategoryDialogOpen}
                            isInvestmentDialogOpen={isInvestmentDialogOpen}
                            setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
                            isPatrimonyDialogOpen={isPatrimonyDialogOpen}
                            setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
                            getSelectedCategoryInfo={getSelectedCategoryInfo}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-zinc-500 font-medium">Distribución por categoría</p>
                      <p className="text-xs text-zinc-500">
                        {sortedCategories.length} {sortedCategories.length === 1 ? 'categoría' : 'categorías'}
                      </p>
                    </div>
                    
                    <Carousel className="w-full" opts={{ align: "start", loop: false }} setApi={setCarouselApi}>
                      <CarouselContent className="gap-3">
                        {chunkArray(sortedCategories, 3).map((chunk, chunkIndex) => (
                          <CarouselItem key={chunkIndex} className="basis-full">
                            <div className="space-y-3">
                              {chunk.map((cat) => {
                                const catInfo = getCategoryInfo(cat.category);
                                const Icon = catInfo.icon;
                                const percentage = totalWithLoans > 0 ? (cat.amount / totalWithLoans) * 100 : 0;
                                const categoryType = getCategoryPredominatedType(cat.category);
                                return (
                                  <div key={cat.category} className="w-full p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-all min-w-0 overflow-hidden">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${catInfo.color}`}>
                                        <Icon className={`w-4 h-4 ${catInfo.textColor}`} />
                                      </div>
                                      <div className="relative flex-1 h-3 bg-zinc-700 rounded-full overflow-hidden">
                                        <div
                                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${catInfo.color.replace('/20', '')}`}
                                          style={{ width: `${getVisualBarWidth(percentage, 5)}%` }}
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white drop-shadow-sm">
                                          {percentage.toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0 flex-shrink">
                                        <span className="text-xs text-zinc-200 font-medium truncate">{catInfo.label}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium flex-shrink-0 ${categoryType.color}`}>
                                          {categoryType.type === "recurrente" ? "Recurrente" : "Puntual"}
                                        </span>
                                      </div>
                                      <span className="font-bold text-white text-sm flex-shrink-0 truncate">{formatCurrency(cat.amount)}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                    
                    {chunkArray(sortedCategories, 3).length > 1 && (
                      <div className="flex justify-center gap-1.5 mt-3">
                        {chunkArray(sortedCategories, 3).map((_, index) => (
                          <div
                            key={index}
                            className={`rounded-full transition-all ${
                              index === selectedIndex ? "w-2 h-2 bg-green-500" : "w-1.5 h-1.5 bg-zinc-600"
                            }`}
                          />
                        ))}
                      </div>
                    )}
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
                <div className="mt-4">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-500 hover:bg-red-600 text-white py-3 text-sm font-semibold">
                        <Plus className="w-4 h-4 mr-2" />
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
                        setIsNewInvestmentOpen={setIsNewInvestmentOpen}
                        setIsNewPatrimonyOpen={setIsNewPatrimonyOpen}
                        isCategoryDialogOpen={isCategoryDialogOpen}
                        setIsCategoryDialogOpen={setIsCategoryDialogOpen}
                        isCreateCategoryDialogOpen={isCreateCategoryDialogOpen}
                        setIsCreateCategoryDialogOpen={setIsCreateCategoryDialogOpen}
                        isInvestmentDialogOpen={isInvestmentDialogOpen}
                        setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
                        isPatrimonyDialogOpen={isPatrimonyDialogOpen}
                        setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
                        getSelectedCategoryInfo={getSelectedCategoryInfo}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
            </button>
          </CardHeader>
          {showSubscriptions && (
            <CardContent>
              {allSubscriptions.length === 0 ? (
                <div className="text-center py-6">
                  <Smartphone className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                  <p className="text-zinc-400 text-sm mb-1">No tienes suscripciones registrada</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {activeSubscriptions.map((sub) => (
                    <div key={sub.id} className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700">
                      <p className="font-medium text-white text-sm truncate">{sub.description}</p>
                      <p className="font-bold text-pink-400 text-sm">{formatCurrency(sub.amount)}</p>
                      <button onClick={() => handleTrimSubscription(sub)} className="w-full mt-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg">Recortar</button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between w-full flex-wrap gap-2">
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-500" />
                Historial
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  placeholder="Buscar gasto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-40 bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4 flex-wrap">
              <button onClick={() => setFilterExpenseType("all")} className={`flex-1 py-2 px-3 rounded-lg text-xs ${filterExpenseType === "all" ? "bg-zinc-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>Todos</button>
              <button onClick={() => setFilterExpenseType("puntual")} className={`flex-1 py-2 px-3 rounded-lg text-xs ${filterExpenseType === "puntual" ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>Puntuales</button>
              <button onClick={() => setFilterExpenseType("recurrente")} className={`flex-1 py-2 px-3 rounded-lg text-xs ${filterExpenseType === "recurrente" ? "bg-purple-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>Recurrentes</button>
            </div>
            <div className="space-y-4">
              {filteredExpenses.map((expense) => {
                const cat = getCategoryInfo(expense.category);
                const Icon = cat.icon;
                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}><Icon className={`w-5 h-5 ${cat.textColor}`} /></div>
                      <div>
                        <p className="font-medium text-sm text-white">{expense.description || cat.label}</p>
                        <p className="text-xs text-zinc-500">{formatDateSafe(expense.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-sm text-red-500">-{formatCurrency(expense.amount)}</p>
                      <button onClick={() => openEditDialog(expense)} className="p-1.5 rounded-lg hover:bg-zinc-700"><Pencil className="w-4 h-4 text-zinc-400" /></button>
                      <button onClick={() => openDeleteDialog(expense)} className="p-1.5 rounded-lg hover:bg-red-500/20"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modales de Nueva Inversión y Patrimonio (Movidos fuera para evitar anidamiento) */}
      <Dialog open={isNewInvestmentOpen} onOpenChange={setIsNewInvestmentOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Nueva Inversion</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Nombre</label>
              <Input
                value={newInvestment.name}
                onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Tipo</label>
              <Select value={newInvestment.type} onValueChange={(v) => setNewInvestment({ ...newInvestment, type: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {investmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white">{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Valor inicial</label>
                <Input
                  type="number"
                  value={newInvestment.initial_value}
                  onChange={(e) => setNewInvestment({ ...newInvestment, initial_value: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Valor actual</label>
                <Input
                  type="number"
                  value={newInvestment.current_value}
                  onChange={(e) => setNewInvestment({ ...newInvestment, current_value: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
            </div>
            <Button onClick={handleCreateInvestment} className="w-full bg-emerald-500 hover:bg-emerald-600 text-black">
              Crear
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewPatrimonyOpen} onOpenChange={setIsNewPatrimonyOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Nuevo Patrimonio</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Nombre</label>
              <Input
                value={newPatrimonyAsset.name}
                onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, name: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Categoria</label>
              <Select value={newPatrimonyAsset.category} onValueChange={(v) => setNewPatrimonyAsset({ ...newPatrimonyAsset, category: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {patrimonyCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white">{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Valor</label>
              <Input
                type="number"
                value={newPatrimonyAsset.value}
                onChange={(e) => setNewPatrimonyAsset({ ...newPatrimonyAsset, value: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white text-sm"
              />
            </div>
            <Button onClick={handleCreatePatrimony} className="w-full bg-sky-500 hover:bg-sky-600 text-white">
              Crear
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-white">Editar Gasto</DialogTitle></DialogHeader>
          <button onClick={() => setIsEditDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <ExpenseForm
            expense={editExpense}
            setExpense={setEditExpense}
            onSubmit={handleEditExpense}
            isSubmitting={isSubmitting}
            isNew={false}
            investments={investments}
            patrimony={patrimony}
            setIsNewInvestmentOpen={setIsNewInvestmentOpen}
            setIsNewPatrimonyOpen={setIsNewPatrimonyOpen}
            isCategoryDialogOpen={isCategoryDialogOpen}
            setIsCategoryDialogOpen={setIsCategoryDialogOpen}
            isCreateCategoryDialogOpen={isCreateCategoryDialogOpen}
            setIsCreateCategoryDialogOpen={setIsCreateCategoryDialogOpen}
            isInvestmentDialogOpen={isInvestmentDialogOpen}
            setIsInvestmentDialogOpen={setIsInvestmentDialogOpen}
            isPatrimonyDialogOpen={isPatrimonyDialogOpen}
            setIsPatrimonyDialogOpen={setIsPatrimonyDialogOpen}
            getSelectedCategoryInfo={getSelectedCategoryInfo}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Eliminar Gasto</DialogTitle></DialogHeader>
          <button onClick={() => setIsDeleteDialogOpen(false)} className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
          <div className="space-y-4 mt-4">
            <p className="text-zinc-300 text-sm">{selectedExpense?.is_recurring ? "Este es un gasto recurrente. ¿Qué deseas hacer?" : "¿Eliminar este gasto?"}</p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 bg-zinc-800 text-zinc-100">Cancelar</Button>
              <Button onClick={handleDeleteExpense} className="flex-1 bg-red-500">Eliminar</Button>
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
  setIsNewInvestmentOpen, setIsNewPatrimonyOpen,
  isCategoryDialogOpen, setIsCategoryDialogOpen,
  isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen,
  isInvestmentDialogOpen, setIsInvestmentDialogOpen,
  isPatrimonyDialogOpen, setIsPatrimonyDialogOpen,
  getSelectedCategoryInfo,
}: any) => {
  const getInvestmentLabel = () =>
    expense.investment_id === "none" ? "Sin vincular" : investments.find((i: any) => i.id === expense.investment_id)?.name || "Sin vincular";
  const getPatrimonyLabel = () =>
    expense.patrimony_id === "none" ? "Sin vincular" : patrimony.find((p: any) => p.id === expense.patrimony_id)?.name || "Sin vincular";

  return (
    <div className="space-y-3 mt-2">
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Concepto</label>
        <Input placeholder="Ej: Supermercado..." value={expense.source} onChange={(e) => setExpense({ ...expense, source: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" />
      </div>
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Importe (€)</label>
        <Input type="number" placeholder="0.00" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white text-sm" />
      </div>
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Categoría</label>
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <button type="button" className="w-full p-2 bg-zinc-800 border-2 border-zinc-700 rounded-lg flex items-center gap-2">
              {(() => { 
                const cat = getSelectedCategoryInfo(expense.category); 
                const Icon = cat.icon; 
                return (
                  <>
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${cat.color}`}><Icon className={`w-3 h-3 ${cat.textColor}`} /></div>
                    <span className="text-white text-sm">{cat.label}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 ml-auto" />
                  </>
                ); 
              })()}
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-3 gap-2 mt-2">
              {expenseCategories.map((cat) => { 
                const Icon = cat.icon; 
                return (
                  <button key={cat.value} type="button" onClick={() => { setExpense({ ...expense, category: cat.value }); setIsCategoryDialogOpen(false); }} className={`p-2 rounded-lg border-2 ${expense.category === cat.value ? "border-red-500 bg-red-500/20" : "border-zinc-700 bg-zinc-800"}`}>
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${cat.color}`}><Icon className={`w-4 h-4 ${cat.textColor}`} /></div>
                    <span className="text-[10px] text-zinc-400">{cat.label}</span>
                  </button>
                ); 
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Fecha</label>
        <DatePicker date={expense.date} onDateChange={(d) => setExpense({ ...expense, date: d || new Date() })} />
      </div>
      <div>
        <label className="text-xs text-zinc-400 mb-2 block">Tipo de gasto</label>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setExpense({ ...expense, is_recurring: true })} className={`p-3 rounded-xl border-2 ${expense.is_recurring ? "border-purple-500 bg-purple-500/20" : "border-zinc-700 bg-zinc-800"}`}>Recurrente</button>
          <button type="button" onClick={() => setExpense({ ...expense, is_recurring: false })} className={`p-3 rounded-xl border-2 ${!expense.is_recurring ? "border-red-500 bg-red-500/20" : "border-zinc-700 bg-zinc-800"}`}>Puntual</button>
        </div>
      </div>
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Vincular a Inversión</label>
        <Dialog open={isInvestmentDialogOpen} onOpenChange={setIsInvestmentDialogOpen}>
          <DialogTrigger asChild>
            <button type="button" className="w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3">
              <span className="text-white text-sm">{getInvestmentLabel()}</span>
              <ChevronRight className="w-4 h-4 text-zinc-400 ml-auto" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <div className="space-y-3 mt-4">
              <button type="button" onClick={() => { setExpense({ ...expense, investment_id: "none" }); setIsInvestmentDialogOpen(false); }} className="w-full p-3 rounded-xl border-2 border-zinc-700 bg-zinc-800/50">Sin vincular</button>
              {investments.map((inv: any) => (
                <button key={inv.id} type="button" onClick={() => { setExpense({ ...expense, investment_id: inv.id }); setIsInvestmentDialogOpen(false); }} className="w-full p-3 rounded-xl border-2 border-zinc-700 bg-zinc-800/50">{inv.name}</button>
              ))}
              <button type="button" onClick={() => { setIsInvestmentDialogOpen(false); setIsNewInvestmentOpen(true); }} className="w-full p-3 rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-800/50 text-emerald-400">Crear nueva inversión</button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Vincular a Patrimonio</label>
        <Dialog open={isPatrimonyDialogOpen} onOpenChange={setIsPatrimonyDialogOpen}>
          <DialogTrigger asChild>
            <button type="button" className="w-full p-3 bg-zinc-800 border-2 rounded-xl flex items-center gap-3">
              <span className="text-white text-sm">{getPatrimonyLabel()}</span>
              <ChevronRight className="w-4 h-4 text-zinc-400 ml-auto" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <div className="space-y-3 mt-4">
              <button type="button" onClick={() => { setExpense({ ...expense, patrimony_id: "none" }); setIsPatrimonyDialogOpen(false); }} className="w-full p-3 rounded-xl border-2 border-zinc-700 bg-zinc-800/50">Sin vincular</button>
              {patrimony.map((pat: any) => (
                <button key={pat.id} type="button" onClick={() => { setExpense({ ...expense, patrimony_id: pat.id }); setIsPatrimonyDialogOpen(false); }} className="w-full p-3 rounded-xl border-2 border-zinc-700 bg-zinc-800/50">{pat.name}</button>
              ))}
              <button type="button" onClick={() => { setIsPatrimonyDialogOpen(false); setIsNewPatrimonyOpen(true); }} className="w-full p-3 rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-800/50 text-sky-400">Crear nuevo patrimonio</button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Button onClick={onSubmit} className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-4" disabled={isSubmitting}>Guardar</Button>
    </div>
  );
};

export default ExpensesPage;