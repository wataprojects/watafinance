"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, TrendingDown, Calendar, ChevronRight } from "lucide-react";
import { useTodayNotifications, NotificationItem } from "@/hooks/useTodayNotifications";
import { formatCurrency } from "@/utils/currency";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NotificationPanelProps {
  onNotificationsChange?: (count: number) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onNotificationsChange }) => {
  const navigate = useNavigate();
  const { 
    expensesToday, 
    expensesTomorrow, 
    loading, 
    totals 
  } = useTodayNotifications();
  const [open, setOpen] = useState(false);

  // Calculate total notifications (only expenses for today and tomorrow)
  const totalNotifications = expensesToday.length + expensesTomorrow.length;

  // Notify parent of count change
  useEffect(() => {
    onNotificationsChange?.(totalNotifications);
  }, [totalNotifications, onNotificationsChange]);

  const handleExpenseClick = () => {
    setOpen(false);
    navigate("/dashboard/expenses");
  };

  const getExpenseTypeColor = () => "bg-red-500/10 border-red-500/30";

  const renderExpenseItem = (item: NotificationItem) => (
    <button
      key={`expense-${item.id}`}
      onClick={handleExpenseClick}
      className={`w-full p-3 rounded-xl border ${getExpenseTypeColor()} hover:opacity-80 transition-opacity flex items-center gap-3 text-left`}
    >
      <div className="flex-shrink-0">
        <TrendingDown className="w-4 h-4 text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{item.title}</p>
        <p className="text-xs text-zinc-400 truncate">{item.description}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-sm text-red-400">
          -{formatCurrency(item.amount)}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
    </button>
  );

  const renderDaySection = (
    dayLabel: string,
    dayName: string,
    dayExpenses: NotificationItem[],
    dayTotal: number
  ) => {
    return (
      <div className="space-y-3">
        {/* Day Header */}
        <div className="flex items-center gap-2 px-1 py-2">
          <Calendar className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-400">{dayName}</span>
          {dayExpenses.length > 0 && (
            <span className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded-full">
              {dayExpenses.length}
            </span>
          )}
        </div>

        {/* Day Totals Summary */}
        {dayExpenses.length > 0 && dayTotal > 0 && (
          <div className="flex gap-2">
            <div className="flex-1 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-3 h-3 text-red-400" />
                <span className="text-xs text-zinc-400">Gastos</span>
              </div>
              <p className="text-sm font-bold text-red-400">
                -{formatCurrency(dayTotal)}
              </p>
            </div>
          </div>
        )}

        {/* Expenses List */}
        {dayExpenses.length > 0 && (
          <div className="space-y-2">
            {dayExpenses.map(renderExpenseItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <Bell className="w-5 h-5" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-black text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {totalNotifications > 9 ? "9+" : totalNotifications}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] max-w-md bg-zinc-900 border-zinc-800 p-0"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-400" />
            <h3 className="text-white font-semibold">Movimientos</h3>
            {totalNotifications > 0 && (
              <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
                {totalNotifications}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : totalNotifications === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-white font-medium mb-1">Sin gastos</p>
              <p className="text-zinc-500 text-sm">
                No hay gastos programados para hoy o mañana
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-5">
              {/* Today Section */}
              {renderDaySection(
                "today",
                "Hoy",
                expensesToday,
                totals.today.expense
              )}

              {/* Divider */}
              {expensesToday.length > 0 && expensesTomorrow.length > 0 && (
                <div className="border-t border-zinc-800" />
              )}

              {/* Tomorrow Section */}
              {renderDaySection(
                "tomorrow",
                "Mañana",
                expensesTomorrow,
                totals.tomorrow.expense
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPanel;