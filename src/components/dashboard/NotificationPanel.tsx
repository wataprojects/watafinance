"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  TrendingDown, 
  TrendingUp, 
  CreditCard, 
  HandCoins,
  Calendar, 
  ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const getTypeConfig = (type: NotificationItem["type"]) => {
  switch (type) {
    case "expense":
      return {
        icon: TrendingDown,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        amountPrefix: "-",
      };
    case "income":
      return {
        icon: TrendingUp,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        amountPrefix: "+",
      };
    case "debt":
      return {
        icon: CreditCard,
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
        amountPrefix: "-",
      };
    case "loan":
      return {
        icon: HandCoins,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        amountPrefix: "+",
      };
    default:
      return {
        icon: TrendingDown,
        color: "text-zinc-400",
        bgColor: "bg-zinc-500/10",
        borderColor: "border-zinc-500/30",
        amountPrefix: "",
      };
  }
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onNotificationsChange }) => {
  const navigate = useNavigate();
  const { 
    movementsToday, 
    movementsTomorrow, 
    loading,
    totals 
  } = useTodayNotifications();
  const [open, setOpen] = useState(false);

  // Calculate total notifications
  const totalNotifications = movementsToday.length + movementsTomorrow.length;

  // Notify parent of count change
  useEffect(() => {
    onNotificationsChange?.(totalNotifications);
  }, [totalNotifications, onNotificationsChange]);

  const handleItemClick = (type: NotificationItem["type"]) => {
    setOpen(false);
    switch (type) {
      case "expense":
        navigate("/dashboard/expenses");
        break;
      case "income":
        navigate("/dashboard/incomes");
        break;
      case "debt":
        navigate("/dashboard/debts");
        break;
      case "loan":
        navigate("/dashboard/loans");
        break;
    }
  };

  const renderMovementItem = (item: NotificationItem) => {
    const config = getTypeConfig(item.type);
    const Icon = config.icon;

    return (
      <button
        key={`${item.type}-${item.id}`}
        onClick={() => handleItemClick(item.type)}
        className={`w-full p-3 rounded-xl border ${config.bgColor} ${config.borderColor} hover:opacity-80 transition-opacity flex items-center gap-3 text-left`}
      >
        <div className="flex-shrink-0">
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{item.title}</p>
          <p className="text-xs text-zinc-400 truncate">{item.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`font-bold text-sm ${config.color}`}>
            {config.amountPrefix}{formatCurrency(item.amount)}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
      </button>
    );
  };

  const renderDaySection = (
    dayLabel: "today" | "tomorrow",
    dayName: string,
    movements: NotificationItem[]
  ) => {
    if (movements.length === 0) return null;

    return (
      <div className="space-y-3">
        {/* Day Header */}
        <div className="flex items-center gap-2 px-1 py-2">
          <Calendar className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-400">{dayName}</span>
          <span className="bg-orange-500/20 text-orange-400 text-xs px-1.5 py-0.5 rounded-full">
            {movements.length}
          </span>
        </div>

        {/* Movements List */}
        <div className="space-y-2">
          {movements.map(renderMovementItem)}
        </div>
      </div>
    );
  };

  const hasTodayMovements = movementsToday.length > 0;
  const hasTomorrowMovements = movementsTomorrow.length > 0;
  const hasAnyMovements = hasTodayMovements || hasTomorrowMovements;

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
          ) : !hasAnyMovements ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-white font-medium mb-1">Sin movimientos</p>
              <p className="text-zinc-500 text-sm">
                No hay movimientos programados para hoy o mañana
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-5">
              {/* Today Section - Only show if there are movements */}
              {hasTodayMovements && renderDaySection("today", "Hoy", movementsToday)}

              {/* Divider - Only show if both sections exist */}
              {hasTodayMovements && hasTomorrowMovements && (
                <div className="border-t border-zinc-800" />
              )}

              {/* Tomorrow Section - Only show if there are movements */}
              {hasTomorrowMovements && renderDaySection("tomorrow", "Mañana", movementsTomorrow)}
            </div>
          )}
        </div>

        {/* Footer */}
        {hasAnyMovements && (
          <div className="p-3 border-t border-zinc-800">
            <Button
              variant="ghost"
              className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm justify-center"
              onClick={() => {
                setOpen(false);
                navigate("/dashboard/expenses");
              }}
            >
              Ver todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPanel;