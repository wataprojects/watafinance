"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, TrendingDown, TrendingUp, Landmark, Calendar, ChevronRight, X } from "lucide-react";
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

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onNotificationsChange }) => {
  const navigate = useNavigate();
  const { today, tomorrow, loading, totalToday, totalTomorrow } = useTodayNotifications();
  const [open, setOpen] = useState(false);

  // Calculate total notifications
  const totalNotifications = today.length + tomorrow.length;

  // Notify parent of count change
  useEffect(() => {
    onNotificationsChange?.(totalNotifications);
  }, [totalNotifications, onNotificationsChange]);

  const handleItemClick = (item: NotificationItem) => {
    setOpen(false);
    // Navigate to appropriate page based on type
    switch (item.type) {
      case "expense":
        navigate("/dashboard/expenses");
        break;
      case "income":
        navigate("/dashboard/income");
        break;
      case "loan":
        navigate("/dashboard/loans");
        break;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "expense":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case "income":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "loan":
        return <Landmark className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "expense":
        return "bg-red-500/10 border-red-500/30";
      case "income":
        return "bg-green-500/10 border-green-500/30";
      case "loan":
        return "bg-cyan-500/10 border-cyan-500/30";
      default:
        return "bg-zinc-800 border-zinc-700";
    }
  };

  const renderNotificationSection = (title: string, items: NotificationItem[], isToday: boolean) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1 py-2">
          <Calendar className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-400">{title}</span>
          <span className="ml-auto text-xs text-zinc-500">
            {formatCurrency(items.reduce((sum, i) => sum + i.amount, 0))}
          </span>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => handleItemClick(item)}
              className={`w-full p-3 rounded-xl border ${getTypeColor(item.type)} hover:opacity-80 transition-opacity flex items-center gap-3 text-left`}
            >
              <div className="flex-shrink-0">
                {getTypeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{item.title}</p>
                <p className="text-xs text-zinc-400 truncate">{item.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-bold text-sm ${
                  item.type === "income" ? "text-green-400" : 
                  item.type === "loan" ? "text-cyan-400" : "text-red-400"
                }`}>
                  {item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            </button>
          ))}
        </div>
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
            <h3 className="text-white font-semibold">Notificaciones</h3>
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
              <p className="text-white font-medium mb-1">¡Sin notificaciones!</p>
              <p className="text-zinc-500 text-sm">
                No hay cobros ni ingresos programados para hoy ni mañana
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Resumen */}
              {(totalToday > 0 || totalTomorrow > 0) && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-800/50 rounded-xl">
                  <div className="text-center">
                    <p className="text-xs text-zinc-400 mb-1">Hoy</p>
                    <p className={`font-bold ${totalToday > 0 ? "text-red-400" : "text-zinc-500"}`}>
                      {totalToday > 0 ? `-${formatCurrency(totalToday)}` : "Sin cobros"}
                    </p>
                  </div>
                  <div className="text-center border-l border-zinc-700">
                    <p className="text-xs text-zinc-400 mb-1">Mañana</p>
                    <p className={`font-bold ${totalTomorrow > 0 ? "text-orange-400" : "text-zinc-500"}`}>
                      {totalTomorrow > 0 ? `-${formatCurrency(totalTomorrow)}` : "Sin cobros"}
                    </p>
                  </div>
                </div>
              )}

              {/* Today */}
              {renderNotificationSection("Hoy", today, true)}

              {/* Tomorrow */}
              {renderNotificationSection("Mañana", tomorrow, false)}
            </div>
          )}
        </div>

        {/* Footer */}
        {totalNotifications > 0 && (
          <div className="p-3 border-t border-zinc-800">
            <Button
              variant="ghost"
              className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm"
              onClick={() => {
                setOpen(false);
                navigate("/dashboard");
              }}
            >
              Ver resumen completo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPanel;