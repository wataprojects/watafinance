"use client";

import { Clock, CheckCircle, MessageCircle, CreditCard, Banknote, XCircle } from "lucide-react";

interface DebtStatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<string, { 
  color: string; 
  bgColor: string; 
  icon: any;
  label: string;
}> = {
  pending: {
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    icon: Clock,
    label: "Pendiente"
  },
  accepted: {
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    icon: CheckCircle,
    label: "Aceptada"
  },
  negotiating: {
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    icon: MessageCircle,
    label: "En negociación"
  },
  partially_paid: {
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    icon: CreditCard,
    label: "Parcialmente pagada"
  },
  paid: {
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    icon: Banknote,
    label: "Pagada"
  },
  rejected: {
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    icon: XCircle,
    label: "Rechazada"
  }
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm"
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4"
};

const DebtStatusBadge: React.FC<DebtStatusBadgeProps> = ({ status, size = "md" }) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${config.bgColor} ${config.color}`}>
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
};

export default DebtStatusBadge;