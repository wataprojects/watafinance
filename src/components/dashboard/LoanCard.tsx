"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency";
import { 
  Home, 
  Car, 
  Wallet, 
  Briefcase, 
  MoreHorizontal, 
  Flame, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard, 
  Zap, 
  Eye,
  Pencil,
  Trash2
} from "lucide-react";

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

interface LoanCardProps {
  loan: any;
  totalMonthlyLoans: number;
  onOpenActions: (loan: any, defaultTab?: LoanActionTab) => void;
  onEdit: (loan: any) => void;
  onDelete: (loan: any) => void;
}

type PriorityBadge = "high" | "attention" | "controlled";

const LoanCard: React.FC<LoanCardProps> = ({ loan, totalMonthlyLoans, onOpenActions, onEdit, onDelete }) => {
  const initialAmount = parseFloat(loan.initial_amount);
  const currentAmount = parseFloat(loan.current_amount);
  const monthlyPayment = parseFloat(loan.monthly_payment || 0);
  
  const progress = initialAmount > 0 ? ((initialAmount - currentAmount) / initialAmount) * 100 : 0;
  const remainingMonths = monthlyPayment > 0 ? Math.ceil(currentAmount / monthlyPayment) : 0;
  const impact = totalMonthlyLoans > 0 ? monthlyPayment / totalMonthlyLoans : 0;
  
  const priorityScore = (monthlyPayment * 0.4) + ((1 - progress / 100) * 0.4) + (impact * 0.2);
  
  const getPriorityBadge = (): PriorityBadge => {
    if (progress >= 70) return "controlled";
    if (progress >= 40 || priorityScore < 0.3) return "attention";
    return "high";
  };
  
  const priorityBadge = getPriorityBadge();
  
  const getLoanTypeInfo = (type: string) => loanTypes.find(t => t.value === type) || loanTypes[loanTypes.length - 1];
  const typeInfo = getLoanTypeInfo(loan.loan_type);
  const Icon = typeInfo.icon;
  
  const getBadgeInfo = () => {
    switch (priorityBadge) {
      case "high":
        return {
          label: "Prioridad alta",
          icon: <Flame className="w-3 h-3" />,
          color: "bg-red-500/20 text-red-400 border-red-500/30",
        };
      case "attention":
        return {
          label: "Atención",
          icon: <AlertCircle className="w-3 h-3" />,
          color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        };
      case "controlled":
        return {
          label: "Bajo control",
          icon: <CheckCircle2 className="w-3 h-3" />,
          color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        };
    }
  };
  
  const badgeInfo = getBadgeInfo();

  return (
    <Card 
      className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all group"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
              <Icon className={`w-6 h-6 ${typeInfo.textColor}`} />
            </div>
            <div>
              <p className="font-medium text-white">{loan.borrower_name}</p>
              <p className="text-xs text-zinc-500">{loan.bank} • {typeInfo.label}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] border ${badgeInfo.color}`}>
              {badgeInfo.icon}
              <span>{badgeInfo.label}</span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(loan); }}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="Editar préstamo"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(loan); }}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                title="Eliminar préstamo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-3" onClick={() => onOpenActions(loan, "payment")}>
          <p className="text-xs text-zinc-500">Te quedan por pagar</p>
          <p className="text-2xl font-bold text-cyan-400">{formatCurrency(currentAmount)}</p>
        </div>
        
        <div className="flex items-center justify-between mb-3" onClick={() => onOpenActions(loan, "payment")}>
          <div className="flex-1">
            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {progress.toFixed(0)}% pagado • {remainingMonths} meses restantes
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-3" onClick={() => onOpenActions(loan, "payment")}>
          <div>
            <p className="text-xs text-zinc-500">Cuota mensual</p>
            <p className="font-medium text-white">{formatCurrency(monthlyPayment)}/mes</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">de {formatCurrency(initialAmount)}</p>
            <p className="text-xs text-emerald-400">-{formatCurrency(initialAmount - currentAmount)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onOpenActions(loan, "payment");
            }}
          >
            <CreditCard className="w-3 h-3 mr-1" />
            Pagar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onOpenActions(loan, "extra");
            }}
          >
            <Zap className="w-3 h-3 mr-1" />
            Amortizar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onOpenActions(loan, "detail");
            }}
          >
            <Eye className="w-3 h-3 mr-1" />
            Detalle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanCard;