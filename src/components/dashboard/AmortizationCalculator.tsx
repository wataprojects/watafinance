"use client";

import { useState, useMemo } from "react";
import { formatCurrency } from "@/utils/currency";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Calculator, 
  TrendingDown, 
  Calendar,
  DollarSign,
  ArrowRight,
  Info
} from "lucide-react";

interface AmortizationCalculatorProps {
  loan: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AmortizationCalculator: React.FC<AmortizationCalculatorProps> = ({
  loan,
  isOpen,
  onOpenChange
}) => {
  const [amortizationAmount, setAmortizationAmount] = useState("");

  if (!loan) return null;

  const currentAmount = parseFloat(loan.current_amount);
  const monthlyPayment = parseFloat(loan.monthly_payment || 0);
  const interestRate = parseFloat(loan.interest_rate || 0);
  
  // Calcular tasa de interés mensual
  const monthlyInterestRate = interestRate / 100 / 12;
  
  // Calcular meses restantes usando la fórmula de amortización francesa correcta
  // Despejamos n de: cuota = capital * (i * (1+i)^n) / ((1+i)^n - 1)
  const remainingMonths = useMemo(() => {
    if (monthlyPayment <= 0 || currentAmount <= 0) return 0;
    
    if (monthlyInterestRate > 0) {
      // Fórmula: n = -ln(1 - (C * i / cuota)) / ln(1 + i)
      const ratio = (currentAmount * monthlyInterestRate) / monthlyPayment;
      if (ratio >= 1) return 0; // La cuota no cubre los intereses
      const months = -Math.log(1 - ratio) / Math.log(1 + monthlyInterestRate);
      return Math.ceil(months);
    } else {
      // Sin interés: meses = capital / cuota
      return Math.ceil(currentAmount / monthlyPayment);
    }
  }, [currentAmount, monthlyPayment, monthlyInterestRate]);

  // Calcular la nueva cuota usando la fórmula de amortización francesa
  const calculationResult = useMemo(() => {
    const amortization = parseFloat(amortizationAmount) || 0;
    
    if (amortization <= 0 || amortization > currentAmount) {
      return null;
    }

    const newCapital = currentAmount - amortization;
    // Mantenemos el mismo plazo restante y calculamos la nueva cuota
    const monthsForCalculation = remainingMonths;
    
    // Calcular nueva cuota usando fórmula de amortización francesa
    // Cuota = Capital * (i * (1+i)^n) / ((1+i)^n - 1)
    let newMonthlyPayment = monthlyPayment;
    
    if (monthlyInterestRate > 0 && monthsForCalculation > 0) {
      const factor = Math.pow(1 + monthlyInterestRate, monthsForCalculation);
      newMonthlyPayment = newCapital * (monthlyInterestRate * factor) / (factor - 1);
    } else if (monthsForCalculation > 0) {
      // Si no hay interés, simplemente dividir el capital entre los meses
      newMonthlyPayment = newCapital / monthsForCalculation;
    }

    const paymentReduction = monthlyPayment - newMonthlyPayment;

    return {
      newCapital,
      newMonthlyPayment,
      newRemainingMonths: monthsForCalculation,
      monthsSaved: 0,
      paymentReduction
    };
  }, [amortizationAmount, currentAmount, monthlyPayment, monthlyInterestRate, remainingMonths]);

  const quickAmounts = [50, 100, 200, 500];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20">
              <Calculator className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-bold">Calculadora de Amortización</p>
              <p className="text-xs text-zinc-400 font-normal">Simula tu ahorro</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Info box */}
        <div className="flex items-start gap-2 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
          <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-cyan-300">
            Esta calculadora es informativa. No se guardará ningún dato en la base de datos.
          </p>
        </div>

        {/* Current loan info */}
        <div className="p-4 bg-zinc-800/50 rounded-xl space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Capital pendiente</span>
            <span className="text-white font-medium">{formatCurrency(currentAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Cuota actual</span>
            <span className="text-white font-medium">{formatCurrency(monthlyPayment)}/mes</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Meses restantes</span>
            <span className="text-white font-medium">{remainingMonths} meses</span>
          </div>
        </div>

        {/* Input section */}
        <div>
          <label className="text-sm text-zinc-400 mb-2 block">Cantidad a amortizar</label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setAmortizationAmount(amount.toString())}
                disabled={amount > currentAmount}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  parseFloat(amortizationAmount) === amount
                    ? 'bg-purple-500 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50'
                }`}
              >
                {amount}€
              </button>
            ))}
          </div>
          <Input
            type="number"
            step="0.01"
            value={amortizationAmount}
            onChange={(e) => setAmortizationAmount(e.target.value)}
            placeholder="Otra cantidad..."
            className="bg-zinc-800 border-zinc-700 text-white"
            max={currentAmount}
          />
          <p className="text-xs text-zinc-500 mt-1">
            Máximo: {formatCurrency(currentAmount)}
          </p>
        </div>

        {/* Results */}
        {calculationResult && (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl border border-purple-500/30">
              <p className="text-sm text-purple-300 mb-3 font-medium">Resultados de la simulación</p>
              
              <div className="space-y-3">
                {/* New capital */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Nuevo capital pendiente</span>
                  </div>
                  <span className="text-white font-bold">
                    {formatCurrency(calculationResult.newCapital)}
                  </span>
                </div>

                {/* New monthly payment */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm">Nueva cuota</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold">
                      {formatCurrency(calculationResult.newMonthlyPayment)}/mes
                    </span>
                    {calculationResult.paymentReduction > 0 && (
                      <span className="block text-xs text-emerald-400">
                        -{formatCurrency(calculationResult.paymentReduction)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Months saved */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Meses restantes</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold">
                      {calculationResult.newRemainingMonths} meses
                    </span>
                    {calculationResult.monthsSaved > 0 && (
                      <span className="block text-xs text-emerald-400">
                        -{calculationResult.monthsSaved} meses
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison highlight */}
            {calculationResult.monthsSaved > 0 && (
              <div className="flex items-center justify-center gap-2 p-3 bg-emerald-500/20 rounded-lg">
                <ArrowRight className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-300 text-sm font-medium">
                  ¡Ahorrarías {calculationResult.monthsSaved} meses de cuotas!
                </span>
              </div>
            )}
          </div>
        )}

        {/* No results message */}
        {amortizationAmount && !calculationResult && (
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
            <p className="text-sm text-red-400">
              La cantidad debe ser mayor a 0 y menor o igual al capital pendiente ({formatCurrency(currentAmount)})
            </p>
          </div>
        )}

        <Button
          onClick={() => onOpenChange(false)}
          className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
        >
          Cerrar calculadora
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AmortizationCalculator;