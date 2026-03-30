"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currency";

export interface NotificationItem {
  id: string;
  type: "expense" | "income" | "loan";
  title: string;
  description: string;
  amount: number;
  date: string;
  dayOfMonth: number;
}

export interface TodayNotifications {
  today: NotificationItem[];
  tomorrow: NotificationItem[];
  loading: boolean;
  totalToday: number;
  totalTomorrow: number;
}

export const useTodayNotifications = (): TodayNotifications => {
  const [notifications, setNotifications] = useState<TodayNotifications>({
    today: [],
    tomorrow: [],
    loading: true,
    totalToday: 0,
    totalTomorrow: 0,
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setNotifications(prev => ({ ...prev, loading: true }));

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setNotifications(prev => ({ ...prev, loading: false }));
      return;
    }

    // Get today's date and tomorrow's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDay = today.getDate();
    const tomorrowDay = tomorrow.getDate();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    try {
      // Fetch recurring expenses that match today or tomorrow
      const expensesResult = await supabase
        .from("expenses")
        .select("id, description, amount, date, category, is_recurring, is_trimmed, collection_day")
        .eq("user_id", session.user.id)
        .eq("is_recurring", true)
        .eq("is_trimmed", false);

      // Fetch recurring incomes that match today or tomorrow
      const incomesResult = await supabase
        .from("incomes")
        .select("id, description, amount, date, category, is_recurring, is_passive")
        .eq("user_id", session.user.id)
        .eq("is_recurring", true);

      // Fetch active loans with collection_day matching today or tomorrow
      const loansResult = await supabase
        .from("loans")
        .select("id, borrower_name, monthly_payment, collection_day, bank, status")
        .eq("user_id", session.user.id)
        .eq("status", "active");

      const todayNotifications: NotificationItem[] = [];
      const tomorrowNotifications: NotificationItem[] = [];

      // Process recurring expenses
      if (expensesResult.data) {
        for (const expense of expensesResult.data) {
          // Use collection_day if available, otherwise extract from date
          const expenseDay = expense.collection_day 
            ? parseInt(expense.collection_day) 
            : expense.date 
              ? new Date(expense.date + "T00:00:00").getDate() 
              : 0;

          // Check if the expense is valid for the current month
          const expenseDate = expense.date ? new Date(expense.date + "T00:00:00") : null;
          const isValidForMonth = expenseDate && 
            expenseDate.getMonth() === currentMonth - 1 && 
            expenseDate.getFullYear() === currentYear;

          if (!isValidForMonth && expenseDay !== todayDay && expenseDay !== tomorrowDay) {
            // If not valid for this month, check if it should apply
            // For recurring, we just use the day of month
            if (expenseDay !== todayDay && expenseDay !== tomorrowDay) {
              continue;
            }
          }

          const notification: NotificationItem = {
            id: expense.id,
            type: "expense",
            title: expense.description || "Gasto recurrente",
            description: getExpenseCategoryLabel(expense.category),
            amount: parseFloat(expense.amount),
            date: expense.date,
            dayOfMonth: expenseDay,
          };

          if (expenseDay === todayDay) {
            todayNotifications.push(notification);
          } else if (expenseDay === tomorrowDay) {
            tomorrowNotifications.push(notification);
          }
        }
      }

      // Process recurring incomes
      if (incomesResult.data) {
        for (const income of incomesResult.data) {
          const incomeDay = income.date 
            ? new Date(income.date + "T00:00:00").getDate() 
            : 0;

          const notification: NotificationItem = {
            id: income.id,
            type: "income",
            title: income.description || "Ingreso recurrente",
            description: income.is_passive ? "Ingreso pasivo" : "Ingreso activo",
            amount: parseFloat(income.amount),
            date: income.date,
            dayOfMonth: incomeDay,
          };

          if (incomeDay === todayDay) {
            todayNotifications.push(notification);
          } else if (incomeDay === tomorrowDay) {
            tomorrowNotifications.push(notification);
          }
        }
      }

      // Process loans
      if (loansResult.data) {
        for (const loan of loansResult.data) {
          const collectionDay = loan.collection_day || 1;
          
          const notification: NotificationItem = {
            id: loan.id,
            type: "loan",
            title: loan.borrower_name,
            description: loan.bank || "Préstamo",
            amount: parseFloat(loan.monthly_payment),
            date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${collectionDay.toString().padStart(2, '0')}`,
            dayOfMonth: collectionDay,
          };

          if (collectionDay === todayDay) {
            todayNotifications.push(notification);
          } else if (collectionDay === tomorrowDay) {
            tomorrowNotifications.push(notification);
          }
        }
      }

      // Calculate totals
      const totalToday = todayNotifications.reduce((sum, n) => sum + n.amount, 0);
      const totalTomorrow = tomorrowNotifications.reduce((sum, n) => sum + n.amount, 0);

      setNotifications({
        today: todayNotifications,
        tomorrow: tomorrowNotifications,
        loading: false,
        totalToday,
        totalTomorrow,
      });

    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications(prev => ({ ...prev, loading: false }));
    }
  };

  return notifications;
};

// Helper function to get expense category labels
const getExpenseCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    housing: "Casa",
    electricity: "Luz",
    water: "Agua",
    health: "Salud",
    security: "Alarmas",
    insurance: "Seguros",
    internet: "Internet",
    subscriptions: "Suscripciones",
    gas: "Gas",
    cleaning: "Limpieza",
    fuel: "Gasolina",
    groceries: "Supermercado",
    entertainment: "Ocio",
    business_investment: "Inversión",
    advertising: "Publicidad",
    transport: "Transporte",
    restaurants: "Restaurantes",
    shopping: "Compras",
    loans: "Préstamos",
    other: "Otros",
  };
  return labels[category] || category;
};

export default useTodayNotifications;