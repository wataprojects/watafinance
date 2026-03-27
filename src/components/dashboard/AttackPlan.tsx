"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency";
import { Zap, Calendar, PiggyBank, Clock, TrendingDown } from "lucide-react";

interface Loan {
  id: string;
  borrower_name: string;
  initial_amount: number;
  current_amount: number;
  monthly_payment: number;
  interest_rate: number | null;
}

interface AttackPlanProps {
  loans: Loan[];
}

const AttackPlan: React.FC<AttackPlanProps> = ({ loans }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  
  const activeLoans = loans.filter(l => l.status === "active" && parseFloat(l.monthly_payment) > 0);
  
  const totalMonthlyPayment = activeLoans.reduce((sum, l) => sum + parseFloat(l.monthly_payment || 0), 0);
  const totalCurrentAmount = activeLoans.reduce((sum, l) => sum + parseFloat(l.current_amount), 0);

  const extraAmounts = [50, 100, 150, 200];

  // Calculate impact for each loan if we apply extra payment
  const calculateImpact = (extraPayment: number) => {
    let totalMonthsSaved = 0;
    let totalInterestSaved = 0;
    let newTotalMonths = 0;
    
    // Sort loans by priority (highest payment first)
    const sortedLoans = [...activeLoans].sort((a, b) => 
      parseFloat(b.monthly_payment) - parseFloat(a.monthly_payment)
    );

    let remainingExtra = extraPayment;

    for (const loan of sortedLoans) {
      if (remainingExtra <= 0) break;
      
      const currentAmount = parseFloat(loan.current_amount);
      const monthlyPayment = parseFloat(loan.monthly_payment);
      const interestRate = parseFloat(loan.interest_rate || 0) / 100 / 12; // Monthly rate
      
      // Original months
      const originalMonths = Math.ceil(currentAmount / monthlyPayment);
      
      // Apply extra payment
      const newAmount = Math.max(0, currentAmount - remainingExtra);
      const newMonths = monthlyPayment > 0 ? Math.ceil(newAmount / monthlyPayment) : 0;
      
      const monthsSaved = Math.max(0, originalMonths - newMonths);
      totalMonthsSaved += monthsSaved;
      
      // Estimate interest saved (simplified calculation)
      if (interestRate > 0 && monthsSaved > 0) {
        // Average remaining balance * months saved * monthly rate
        const avgBalance = (currentAmount + newAmount) / 2;
        totalInterestSaved += avgBalance * monthsSaved * interestRate;
      }
      
      newTotalMonths += newMonths;
      remainingExtra -= Math.min(remainingExtra, currentAmount);
    }

    return {
      monthsSaved: totalMonthsSaved,
      interestSaved: totalInterestSaved,
      newTotalMonths,
      finishDate: new Date(Date.now() + newTotalMonths * 30 * 24 * 60 * 60 * 1000)
    };
  };

  const impact = useMemo(() => {
    if (!selectedAmount) return null;
    return calculateImpact(selectedAmount);
  }, [selectedAmount, activeLoans]);

  const formatFinishDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      month: "short",
      year: "numeric"
    });
  };

  if (activeLoans.length === 0) {
    return null;
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-purple-400" />
          Plan de Ataque
        </CardTitle>
        <p className="text-zinc-400 text-sm">
          Simula cómo afectarían pagos extra a tus préstamos
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount selection */}
        <div>
          <label className="text-sm text-zinc-400 mb-2 block">
            ¿Cuánto podrías pagar de más al mes?
          </label>
          <div className="grid grid-cols-4 gap-2">
            {extraAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                  selectedAmount === amount
                    ? 'bg-purple-500 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                +{amount}€
              </button>
            ))}
          </div>
        </div>

        {/* Impact results */}
        {impact && selectedAmount && (
          <div className="space-y-3">
            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-zinc-400">Meses restantes</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-medium">
                    {impact.newTotalMonths} meses
                  </span>
                  {impact.monthsSaved > 0 && (
                    <span className="text-emerald-400 text-sm ml-2">
                      (-{impact.monthsSaved})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-zinc-400">Fecha de finalización</span>
                </div>
                <span className="text-white font-medium">
                  {formatFinishDate(impact.finishDate)}
                </span>
              </div>

              {impact.interestSaved > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-zinc-400">Ahorro en intereses</span>
                  </div>
                  <span className="text-emerald-400 font-medium">
                    {formatCurrency(impact.interestSaved)}
                  </span>
                </div>
              )}
            </div>

            {impact.monthsSaved > 0 ? (
              <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <p className="text-sm text-emerald-400">
                  🎉 ¡Añadiendo {formatCurrency(selectedAmount)}/mes podrías terminar de pagar 
                  {impact.monthsSaved} meses antes y ahorrar {formatCurrency(impact.interestSaved)} en intereses!
                </p>
              </div>
            ) : (
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-sm text-zinc-400">
                  Con esta cantidad extra, tus préstamos se terminarían antes.
                </p>
              </div>
            )}
          </div>
        )}

        {!selectedAmount && (
          <div className="p-4 bg-zinc-800/30 rounded-xl">
            <p className="text-sm text-zinc-500 text-center">
              Selecciona una cantidad para ver el impacto
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttackPlan;