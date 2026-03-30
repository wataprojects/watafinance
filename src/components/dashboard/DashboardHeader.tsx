"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import NotificationPanel from "./NotificationPanel";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SUPABASE_URL } from "@/lib/supabase-env";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

interface PendingDebt {
  id: string;
  name: string;
  creditor: string;
  current_amount: number;
  initial_amount: number;
  category: string;
  status: string;
  created_at: string;
  original_creator_id: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title = "FinPro",
  subtitle = "Tu gestión financiera",
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [pendingDebts, setPendingDebts] = useState<PendingDebt[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    // Load pending notifications on mount
    fetchPendingDebts();
  }, []);

  const fetchPendingDebts = async () => {
    setLoadingNotifications(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setLoadingNotifications(false);
      return;
    }

    // Fetch debts where user is the associated user and status is pending
    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("associated_user_id", session.user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPendingDebts(data);
    }
    setLoadingNotifications(false);
  };

  const handleAcceptDebt = async (debtId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch(`${SUPABASE_URL}/functions/v1/confirm-debt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        debtId,
        action: "accept",
      }),
    });

    fetchPendingDebts();
  };

  const handleRejectDebt = async (debtId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch(`${SUPABASE_URL}/functions/v1/confirm-debt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        debtId,
        action: "reject",
      }),
    });

    fetchPendingDebts();
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    navigate("/");
    setLoading(false);
  };

  const pendingDebtCount = pendingDebts.length;

  // Combined notification count
  const totalNotificationCount = pendingDebtCount + notificationCount;

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <span className="text-black font-bold">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              <p className="text-xs text-green-400">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Panel - Financial notifications */}
            <NotificationPanel 
              onNotificationsChange={setNotificationCount} 
            />

            {/* Debts Notifications Popover - Existing functionality */}
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  {/* Icon changes based on if there are debt notifications */}
                  {pendingDebtCount > 0 ? (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="w-5 h-5 text-orange-400"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                  {pendingDebtCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                      {pendingDebtCount > 9 ? "9+" : pendingDebtCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[calc(100vw-2rem)] max-w-md bg-zinc-900 border-zinc-800 p-0"
                align="end"
                sideOffset={8}
              >
                <div className="p-4 border-b border-zinc-800">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    Deudas pendientes
                    {pendingDebtCount > 0 && (
                      <span className="ml-auto bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
                        {pendingDebtCount} pendiente{pendingDebtCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </h3>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="p-8 flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                  ) : pendingDebts.length === 0 ? (
                    <div className="p-8 text-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="w-10 h-10 mx-auto mb-2 text-zinc-600"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <p className="text-zinc-500 text-sm">
                        No hay deudas pendientes
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {pendingDebts.map((debt) => (
                        <div
                          key={debt.id}
                          className="p-3 bg-zinc-800/50 rounded-xl border border-orange-500/30"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-white text-sm truncate">
                                {debt.name}
                              </p>
                              <p className="text-xs text-zinc-500 truncate">
                                {debt.creditor || "Sin motivo"}
                              </p>
                            </div>
                            <div className="text-right ml-2">
                              <p className="font-bold text-orange-400 text-sm">
                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
                                  debt.current_amount || debt.initial_amount
                                )}
                              </p>
                              <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">Pendiente</span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <Button
                              onClick={() => handleAcceptDebt(debt.id)}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-black text-xs py-1.5 h-auto"
                              size="sm"
                            >
                              Aceptar
                            </Button>
                            <Button
                              onClick={() => handleRejectDebt(debt.id)}
                              variant="outline"
                              className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20 text-xs py-1.5 h-auto"
                              size="sm"
                            >
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {pendingDebts.length > 0 && (
                  <div className="p-3 border-t border-zinc-800">
                    <Button
                      variant="ghost"
                      className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate("/dashboard/debts");
                      }}
                    >
                      Ver todas las deudas
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={loading}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;