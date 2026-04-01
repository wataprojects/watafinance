"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Home, 
  Car, 
  Wallet, 
  Briefcase, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Calendar,
  TrendingDown,
  ArrowUpRight,
  Info
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";

const loanTypes = {
  mortgage: { label: "Hipoteca", color: "bg-blue-500/20", textColor: "text-blue-400", icon: Home },
  car: { label: "Coche", color: "bg-purple-500/20", textColor: "text-purple-400", icon: Car },
  personal: { label: "Personal", color: "bg-cyan-500/20", textColor: "text-cyan-400", icon: Wallet },
  business: { label: "Negocio", color: "bg-amber-500/20", textColor: "text-amber-400", icon: Briefcase },
  other: { label: "Otro", color: "bg-slate-500/20", textColor: "text-slate-400", icon: MoreHorizontal },
};

interface LoanCardProps {
  loan: any;
  totalMonthlyLoans: number;
  onOpenActions: (loan: any, tab: "payment" | "extra" | "detail") => void;
  onEdit: (loan: any) => void;
  onDelete: (loan: any) => void;
}

const LoanCard = ({ loan, totalMonthlyLoans, onOpenActions, onEdit, onDelete }: LoanCardProps) => {
  const type = (loan.loan_type as keyof typeof loanTypes) || "other";
  const config = loanTypes[type];
  const Icon = config.icon;

  const initialAmount = parseFloat(loan.initial_amount);
  const currentAmount = parseFloat(loan.current_amount);
  const progress = initialAmount > 0 ? ((initialAmount - currentAmount) / initialAmount) * 100 : 0;
  
  const monthlyPayment = parseFloat(loan.monthly_payment || 0);
  const impact = totalMonthlyLoans > 0 ? (monthlyPayment / totalMonthlyLoans) * 100 : 0;

  return (
    <Card className="bg-zinc-800/50 border-zinc-700 overflow-hidden group">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
              <Icon className={`w-5 h-5 ${config.textColor}`} />
            </div>
            <div>
              <h3 className="text-white font-medium leading-tight">{loan.borrower_name}</h3>
              <p className="text-zinc-500 text-xs">{loan.bank}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-700"
              onClick={() => onEdit(loan)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
              onClick={() => onDelete(loan)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Progreso del pago</span>
            <span className="text-cyan-400 font-medium">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-zinc-700" />
          <div className="flex justify-between text-sm">
            <span className="text-white font-bold">{formatCurrency(currentAmount)}</span>
            <span className="text-zinc-500">de {formatCurrency(initialAmount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-700/50">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Cuota Mensual</p>
            <p className="text-white font-semibold">{formatCurrency(monthlyPayment)}</p>
          </div>
          <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-700/50">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Día de Cobro</p>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <p className="text-white font-semibold">Día {loan.collection_day}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black font-bold h-9 text-xs"
            onClick={() => onOpenActions(loan, "payment")}
          >
            <TrendingDown className="w-3.5 h-3.5 mr-1.5" />
            Pagar
          </Button>
          <Button 
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-9 text-xs"
            onClick={() => onOpenActions(loan, "extra")}
          >
            <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" />
            Amortizar
          </Button>
          <Button 
            variant="secondary"
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold h-9 text-xs"
            onClick={() => onOpenActions(loan, "detail")}
          >
            <Info className="w-3.5 h-3.5 mr-1.5" />
            Detalle
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LoanCard;