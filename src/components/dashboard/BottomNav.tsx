"use client";

import { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, DollarSign, CreditCard, Banknote, Landmark, TrendingUp, Briefcase } from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/dashboard" },
  { id: "income", label: "Ingresos", icon: DollarSign, path: "/dashboard/income" },
  { id: "expenses", label: "Gastos", icon: CreditCard, path: "/dashboard/expenses" },
  { id: "debts", label: "Deudas", icon: Banknote, path: "/dashboard/debts" },
  { id: "loans", label: "Préstamos", icon: Landmark, path: "/dashboard/loans" },
  { id: "investments", label: "Inversiones", icon: TrendingUp, path: "/dashboard/investments" },
  { id: "patrimony", label: "Patrimonio", icon: Briefcase, path: "/dashboard/patrimony" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 shadow-2xl z-50">
      {/* Navegación con scroll horizontal */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center gap-1.5 px-5 py-2.5 rounded-2xl min-w-[80px] transition-all duration-300
                ${isActive 
                  ? "bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25 scale-105" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                }
              `}
            >
              <item.icon className={`w-6 h-6 ${isActive ? "text-white" : ""}`} />
              <span className={`text-xs font-semibold ${isActive ? "text-white" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;