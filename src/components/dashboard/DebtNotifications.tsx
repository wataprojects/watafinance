"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL } from "@/lib/supabase-env";
import { formatCurrency } from "@/utils/currency";
import DebtStatusBadge from "./DebtStatusBadge";
import { Bell, CheckCircle, XCircle, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface DebtNotificationsProps {
  onDebtClick: (debtId: string) => void;
}

const DebtNotifications: React.FC<DebtNotificationsProps> = ({ onDebtClick }) => {
  const [pendingDebts, setPendingDebts] = useState<PendingDebt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingDebts();
  }, []);

  const fetchPendingDebts = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    // Fetch debts where user is the associated user and status is pending
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('associated_user_id', session.user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPendingDebts(data);
    }
    setLoading(false);
  };

  const handleAccept = async (debtId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch(
      `${SUPABASE_URL}/functions/v1/confirm-debt`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          debtId,
          action: 'accept'
        })
      }
    );

    fetchPendingDebts();
  };

  const handleReject = async (debtId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch(
      `${SUPABASE_URL}/functions/v1/confirm-debt`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          debtId,
          action: 'reject'
        })
      }
    );

    fetchPendingDebts();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 bg-zinc-800/50 rounded-xl animate-pulse">
            <div className="h-4 w-24 bg-zinc-700 rounded mb-2" />
            <div className="h-6 w-20 bg-zinc-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (pendingDebts.length === 0) {
    return (
      <div className="text-center py-6">
        <Bell className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
        <p className="text-zinc-500 text-sm">No hay deudas pendientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingDebts.map((debt) => (
        <div
          key={debt.id}
          className="p-4 bg-zinc-800/50 rounded-xl border border-orange-500/30"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-medium text-white">{debt.name}</p>
              <p className="text-xs text-zinc-500">{debt.creditor || "Sin motivo"}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-orange-400">{formatCurrency(debt.current_amount || debt.initial_amount)}</p>
              <DebtStatusBadge status={debt.status} size="sm" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleAccept(debt.id)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black text-xs py-2"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Aceptar
            </Button>
            <Button
              onClick={() => handleReject(debt.id)}
              variant="outline"
              className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20 text-xs py-2"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Rechazar
            </Button>
            <Button
              onClick={() => onDebtClick(debt.id)}
              variant="outline"
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-xs py-2 px-3"
            >
              <MessageCircle className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DebtNotifications;