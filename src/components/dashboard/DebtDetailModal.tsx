"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL } from "@/lib/supabase-env";
import { formatCurrency } from "@/utils/currency";
import DebtStatusBadge from "./DebtStatusBadge";
import DebtTimeline from "./DebtTimeline";
import DebtChat from "./DebtChat";
import DebtPaymentForm from "./DebtPaymentForm";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  Send,
  Bell,
  CreditCard,
  DollarSign,
  User,
  Calendar,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface DebtDetailModalProps {
  debtId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DebtDetail {
  id: string;
  name: string;
  creditor: string;
  initial_amount: number;
  current_amount: number;
  paid_amount: number;
  category: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
  paid_at: string | null;
  rejected_at: string | null;
  user_id: string;
  associated_user_id: string | null;
  original_creator_id: string;
}

const DebtDetailModal: React.FC<DebtDetailModalProps> = ({
  debtId,
  isOpen,
  onOpenChange
}) => {
  const [debt, setDebt] = useState<DebtDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [negotiateAmount, setNegotiateAmount] = useState("");
  const [negotiateMessage, setNegotiateMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && debtId) {
      fetchDebtDetail();
    }
  }, [isOpen, debtId]);

  const fetchDebtDetail = async () => {
    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUserId(session.user.id);
    }

    if (debtId) {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('id', debtId)
        .single();

      if (!error && data) {
        setDebt(data);
        setNegotiateAmount(data.current_amount?.toString() || data.initial_amount?.toString() || "");
      }
    }

    setLoading(false);
  };

  const handleAction = async (action: 'accept' | 'reject' | 'negotiate' | 'mark_paid') => {
    if (!debt || !currentUserId) return;

    setActionLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setActionLoading(false);
        return;
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/confirm-debt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            debtId: debt.id,
            action,
            message: action === 'negotiate' ? negotiateMessage : undefined,
            negotiateAmount: action === 'negotiate' ? parseFloat(negotiateAmount) : undefined
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        fetchDebtDetail();
      }
    } catch (error) {
      console.error('Action error:', error);
    }

    setActionLoading(false);
  };

  const handlePaymentRegistered = (newPaidAmount: number, newStatus: string) => {
    if (debt) {
      setDebt({
        ...debt,
        paid_amount: newPaidAmount,
        status: newStatus
      });
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const isTheyOwe = debt?.category === "they_owe";
  const isCreator = debt?.original_creator_id === currentUserId;
  const canModify = debt?.status !== 'paid' && debt?.status !== 'rejected';

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isTheyOwe ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {isTheyOwe ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div>
              <p className="text-lg font-bold">{debt?.name || "Deuda"}</p>
              <p className="text-xs text-zinc-400 font-normal">
                {isTheyOwe ? "Te deben" : "Debes"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
          </div>
        ) : debt ? (
          <div className="space-y-4">
            {/* Amount and Status */}
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
              <div>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(debt.current_amount || debt.initial_amount)}
                </p>
                {debt.paid_amount > 0 && (
                  <p className="text-sm text-purple-400">
                    Pagado: {formatCurrency(debt.paid_amount)}
                  </p>
                )}
              </div>
              <DebtStatusBadge status={debt.status} size="lg" />
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <User className="w-3 h-3" />
                  <span>Motivo</span>
                </div>
                <p className="text-white">{debt.creditor || "Sin motivo"}</p>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>Creada</span>
                </div>
                <p className="text-white">{formatDate(debt.created_at)}</p>
              </div>
            </div>

            {/* Action Buttons (only for non-creator on pending debts) */}
            {!isCreator && debt.status === 'pending' && canModify && (
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => handleAction('accept')}
                  disabled={actionLoading}
                  className="bg-green-500 hover:bg-green-600 text-black text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Aceptar
                </Button>
                <Button
                  onClick={() => handleAction('reject')}
                  disabled={actionLoading}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20 text-xs"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Rechazar
                </Button>
                <Button
                  onClick={() => handleAction('negotiate')}
                  disabled={actionLoading}
                  variant="outline"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 text-xs"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Negociar
                </Button>
              </div>
            )}

            {/* Negotiate form */}
            {debt.status === 'negotiating' && canModify && (
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30 space-y-3">
                <p className="text-sm text-blue-400 font-medium">Propón un nuevo monto</p>
                <Input
                  type="number"
                  value={negotiateAmount}
                  onChange={(e) => setNegotiateAmount(e.target.value)}
                  placeholder="Nuevo monto..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <Input
                  value={negotiateMessage}
                  onChange={(e) => setNegotiateMessage(e.target.value)}
                  placeholder="Mensaje (opcional)..."
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
                <Button
                  onClick={() => handleAction('negotiate')}
                  disabled={actionLoading || !negotiateAmount}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Enviar propuesta
                </Button>
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="w-full bg-zinc-800">
                <TabsTrigger value="timeline" className="flex-1 text-xs">Timeline</TabsTrigger>
                <TabsTrigger value="chat" className="flex-1 text-xs">Chat</TabsTrigger>
                <TabsTrigger value="payments" className="flex-1 text-xs">Pagos</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-4">
                <DebtTimeline debtId={debt.id} />
              </TabsContent>

              <TabsContent value="chat" className="mt-4">
                <DebtChat debtId={debt.id} currentUserId={currentUserId} />
              </TabsContent>

              <TabsContent value="payments" className="mt-4">
                <DebtPaymentForm
                  debtId={debt.id}
                  currentAmount={parseFloat(debt.current_amount || debt.initial_amount)}
                  paidAmount={parseFloat(debt.paid_amount || 0)}
                  onPaymentRegistered={handlePaymentRegistered}
                />
              </TabsContent>
            </Tabs>

            {/* Mark as paid button */}
            {canModify && (debt.status === 'accepted' || debt.status === 'partially_paid') && (
              <Button
                onClick={() => handleAction('mark_paid')}
                disabled={actionLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Marcar como pagada
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-zinc-500">No se encontró la deuda</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DebtDetailModal;