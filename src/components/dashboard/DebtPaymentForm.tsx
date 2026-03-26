"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL } from "@/lib/supabase-env";
import { formatCurrency } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Plus, CheckCircle } from "lucide-react";

interface DebtPaymentFormProps {
  debtId: string;
  currentAmount: number;
  paidAmount: number;
  onPaymentRegistered: (newPaidAmount: number, newStatus: string) => void;
}

const DebtPaymentForm: React.FC<DebtPaymentFormProps> = ({
  debtId,
  currentAmount,
  paidAmount,
  onPaymentRegistered
}) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const remainingAmount = currentAmount - paidAmount;
  const progressPercentage = currentAmount > 0 ? Math.round((paidAmount / currentAmount) * 100) : 0;

  const handleSubmit = async () => {
    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0 || paymentAmount > remainingAmount) {
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Call the edge function
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/register-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            debtId,
            amount: paymentAmount,
            note: note || undefined
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        onPaymentRegistered(result.newPaidAmount, result.newStatus);
        setAmount("");
        setNote("");
        setShowForm(false);
      } else {
        console.error('Payment error:', result.error);
      }
    } catch (error) {
      console.error('Payment error:', error);
    }

    setLoading(false);
  };

  const quickAmounts = [10, 25, 50, 100];

  if (!showForm) {
    return (
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Progreso</span>
            <span className="text-white font-medium">{progressPercentage}%</span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercentage >= 100 ? 'bg-green-500' : 'bg-purple-500'
              }`}
              style={{ width: `${Math.max(progressPercentage, 5)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Pagado: {formatCurrency(paidAmount)}</span>
            <span>Restante: {formatCurrency(remainingAmount)}</span>
          </div>
        </div>

        <Button
          onClick={() => setShowForm(true)}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar pago
        </Button>

        {progressPercentage >= 100 && (
          <div className="flex items-center justify-center gap-2 p-3 bg-green-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 text-sm font-medium">¡Deuda pagada!</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-purple-400" />
          Registrar pago
        </h4>
        <button
          onClick={() => setShowForm(false)}
          className="text-zinc-400 hover:text-white text-sm"
        >
          Cancelar
        </button>
      </div>

      {/* Quick amount buttons */}
      <div className="grid grid-cols-4 gap-2">
        {quickAmounts.map((quickAmount) => (
          <button
            key={quickAmount}
            onClick={() => setAmount(quickAmount.toString())}
            disabled={quickAmount > remainingAmount}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              parseFloat(amount) === quickAmount
                ? 'bg-purple-500 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-50'
            }`}
          >
            {quickAmount}€
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Cantidad (máx. {formatCurrency(remainingAmount)})</label>
        <Input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="bg-zinc-700 border-zinc-600 text-white"
          max={remainingAmount}
        />
      </div>

      {/* Note */}
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Nota (opcional)</label>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej: Transferencia bancaria..."
          className="bg-zinc-700 border-zinc-600 text-white text-sm"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > remainingAmount}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Guardando...
          </span>
        ) : (
          <>Registrar pago de {amount ? formatCurrency(parseFloat(amount)) : "0€"}</>
        )}
      </Button>
    </div>
  );
};

export default DebtPaymentForm;