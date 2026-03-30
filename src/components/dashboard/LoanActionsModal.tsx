"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currency";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  CreditCard,
  Zap,
  Eye,
  Calendar,
  Banknote,
  TrendingDown,
  CheckCircle,
  Home,
  Car,
  Wallet,
  Briefcase,
  MoreHorizontal,
  Calculator
} from "lucide-react";
import AmortizationCalculator from "./AmortizationCalculator";

type LoanType = "mortgage" | "car" | "personal" | "business" | "other";
type LoanActionTab = "payment" | "extra" | "detail";

interface LoanTypeOption {
  value: LoanType;
  label: string;
  color: string;
  textColor: string;
  bgColor: string;
  icon: React.ComponentType<any>;
}

const loanTypes: LoanTypeOption[] = [
  { value: "mortgage", label: "Hipoteca", color: "bg-blue-500/20", textColor: "text-blue-400", bgColor: "border-blue-500", icon: Home },
  { value: "car", label: "Coche", color: "bg-purple-500/20", textColor: "text-purple-400", bgColor: "border-purple-500", icon: Car },
  { value: "personal", label: "Personal", color: "bg-cyan-500/20", textColor: "text-cyan-400", bgColor: "border-cyan-500", icon: Wallet },
  { value: "business", label: "Negocio", color: "bg-amber-500/20", textColor: "text-amber-400", bgColor: "border-amber-500", icon: Briefcase },
  { value: "other", label: "Otro", color: "bg-slate-500/20", textColor: "text-slate-400", bgColor: "border-slate-500", icon: MoreHorizontal },
];

interface LoanActionsModalProps {
  loan: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  defaultTab?: LoanActionTab;
}

const LoanActionsModal: React.FC<LoanActionsModalProps> = ({
  loan,
  isOpen,
  onOpenChange,
  onUpdate,
  defaultTab = "payment"
}) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [extraAmount, setExtraAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeTab, setActiveTab] = useState<LoanActionTab>(defaultTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  if (!loan) return null;

  const initialAmount = parseFloat(loan.initial_amount);
  const currentAmount = parseFloat(loan.current_amount);
  const monthlyPayment = parseFloat(loan.monthly_payment || 0);
  const interestRate = parseFloat(loan.interest_rate || 0);
  
  const progress = initialAmount > 0 ? ((initialAmount - currentAmount) / initialAmount) * 100 : 0;
  const remainingMonths = monthlyPayment > 0 ? Math.ceil(currentAmount / monthlyPayment) : 0;
  const paidAmount = initialAmount - currentAmount;
  
  const typeInfo = loanTypes.find(t => t.value === loan.loan_type) || loanTypes[loanTypes.length - 1];
  const Icon = typeInfo.icon;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const handleRegisterPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || amount > currentAmount) return;

    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const newCurrentAmount = currentAmount - amount;
    const newStatus = newCurrentAmount <= 0 ? "paid" : "active";

    await supabase.from("loans").update({
      current_amount: Math.max(0, newCurrentAmount),
      status: newStatus,
      updated_at: new Date().toISOString()
    }).eq("id", loan.id);

    setSuccessMessage(`¡Pago de ${formatCurrency(amount)} registrado!`);
    setPaymentAmount("");
    setPaymentNote("");
    setLoading(false);
    
    setTimeout(() => {
      setSuccessMessage("");
      onUpdate();
    }, 2000);
  };

  const handleExtraAmortization = async () => {
    const amount = parseFloat(extraAmount);
    if (!amount || amount <= 0 || amount > currentAmount) return;

    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const newCurrentAmount = currentAmount - amount;
    const newStatus = newCurrentAmount <= 0 ? "paid" : "active";

    await supabase.from("loans").update({
      current_amount: Math.max(0, newCurrentAmount),
      updated_at: new Date().toISOString()
    }).eq("id", loan.id);

    setSuccessMessage(`¡Amortización extra de ${formatCurrency(amount)} registrada!`);
    setExtraAmount("");
    setLoading(false);
    
    setTimeout(() => {
      setSuccessMessage("");
      onUpdate();
    }, 2000);
  };

  const quickPaymentAmounts = [50, 100, 200, monthlyPayment];
  const quickExtraAmounts = [50, 100, 150, 200];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
              <Icon className={`w-5 h-5 ${typeInfo.textColor}`} />
            </div>
            <div>
              <p className="text-lg font-bold">{loan.borrower_name}</p>
              <p className="text-xs text-zinc-400 font-normal">{loan.bank} • {typeInfo.label}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {successMessage && (
          <div className="flex items-center justify-center gap-2 p-3 bg-emerald-500/20 rounded-lg mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">{successMessage}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LoanActionTab)} className="w-full">
          <TabsList className="w-full bg-zinc-800">
            <TabsTrigger value="payment" className="flex-1 text-xs">
              <CreditCard className="w-3 h-3 mr-1" />
              Pagar
            </TabsTrigger>
            <TabsTrigger value="extra" className="flex-1 text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Amortizar
            </TabsTrigger>
            <TabsTrigger value="simulate" className="flex-1 text-xs">
              <Calculator className="w-3 h-3 mr-1" />
              Simular
            </TabsTrigger>
            <TabsTrigger value="detail" className="flex-1 text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Detalle
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payment" className="mt-4 space-y-4">
            <div className="p-4 bg-zinc-800/50 rounded-xl">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Pendiente</span>
                <span className="text-white font-medium">{formatCurrency(currentAmount)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Progreso</span>
                <span className="text-cyan-400 font-medium">{progress.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Cantidad a pagar</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {quickPaymentAmounts.filter((_, i) => i === 3 ? monthlyPayment > 0 : true).map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setPaymentAmount(amount.toString())}
                    disabled={amount > currentAmount}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      parseFloat(paymentAmount) === amount
                        ? 'bg-cyan-500 text-black'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50'
                    }`}
                  >
                    {amount === monthlyPayment ? `${formatCurrency(amount)}` : `${amount}€`}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Otra cantidad..."
                className="bg-zinc-800 border-zinc-700 text-white"
                max={currentAmount}
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Nota (opcional)</label>
              <Input
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Ej: Transferencia del día 5..."
                className="bg-zinc-800 border-zinc-700 text-white text-sm"
              />
            </div>

            <Button
              onClick={handleRegisterPayment}
              disabled={loading || !paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > currentAmount}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black"
            >
              {loading ? "Guardando..." : `Registrar pago de ${paymentAmount ? formatCurrency(parseFloat(paymentAmount)) : "0€"}`}
            </Button>
          </TabsContent>

          <TabsContent value="extra" className="mt-4 space-y-4">
            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
              <p className="text-sm text-purple-400 font-medium mb-1">Amortización anticipada</p>
              <p className="text-xs text-zinc-400">
                Pagar más de lo habitual para reducir capital y ahorrar en intereses.
              </p>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Cantidad extra</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {quickExtraAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setExtraAmount(amount.toString())}
                    disabled={amount > currentAmount}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      parseFloat(extraAmount) === amount
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
                value={extraAmount}
                onChange={(e) => setExtraAmount(e.target.value)}
                placeholder="Otra cantidad..."
                className="bg-zinc-800 border-zinc-700 text-white"
                max={currentAmount}
              />
            </div>

            {extraAmount && parseFloat(extraAmount) > 0 && (
              <div className="p-4 bg-zinc-800/50 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Nuevo pendiente</span>
                  <span className="text-white font-medium">
                    {formatCurrency(Math.max(0, currentAmount - parseFloat(extraAmount)))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Meses restantes (antes)</span>
                  <span className="text-white">{remainingMonths} meses</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Meses restantes (ahora)</span>
                  <span className="text-purple-400 font-medium">
                    {Math.ceil((currentAmount - parseFloat(extraAmount)) / monthlyPayment)} meses
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleExtraAmortization}
              disabled={loading || !extraAmount || parseFloat(extraAmount) <= 0 || parseFloat(extraAmount) > currentAmount}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
            >
              {loading ? "Guardando..." : `Amortizar ${extraAmount ? formatCurrency(parseFloat(extraAmount)) : "0€"}`}
            </Button>
          </TabsContent>

          <TabsContent value="simulate" className="mt-4 space-y-4">
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/30">
              <p className="text-sm text-purple-400 font-medium mb-1">Calculadora de Amortización</p>
              <p className="text-xs text-zinc-400">
                Simula cómo afectaría una amortización extra a tu préstamo.
                Los cálculos son informativos y no se guardan en la base de datos.
              </p>
            </div>

            <Button
              onClick={() => setShowCalculator(true)}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Abrir calculadora
            </Button>
          </TabsContent>

          <TabsContent value="detail" className="mt-4 space-y-4">
            <div className="text-center p-6">
              <p className="text-4xl font-bold text-cyan-400 mb-1">{formatCurrency(currentAmount)}</p>
              <p className="text-zinc-500 text-sm">pendiente de {formatCurrency(initialAmount)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Banknote className="w-3 h-3" />
                  <span className="text-xs">Cuota mensual</span>
                </div>
                <p className="text-white font-medium">{formatCurrency(monthlyPayment)}</p>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <TrendingDown className="w-3 h-3" />
                  <span className="text-xs">TIN</span>
                </div>
                <p className="text-white font-medium">{interestRate > 0 ? `${interestRate}%` : "-"}</p>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">Inicio</span>
                </div>
                <p className="text-white font-medium">{formatDate(loan.start_date)}</p>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">Día de cobro</span>
                </div>
                <p className="text-white font-medium">{loan.collection_day || "-"}</p>
              </div>
            </div>

            {loan.notes && (
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Notas</p>
                <p className="text-white text-sm">{loan.notes}</p>
              </div>
            )}

            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Pagado</span>
                <span className="text-emerald-400 font-medium">{formatCurrency(paidAmount)}</span>
              </div>
              <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {progress.toFixed(1)}% completado • {remainingMonths} meses restantes
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

    {loan && (
      <AmortizationCalculator
        loan={loan}
        isOpen={showCalculator}
        onOpenChange={setShowCalculator}
      />
    )}
    </>
  );
};

export default LoanActionsModal;