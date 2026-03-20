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

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-50">
      {/* Botones de scroll */}
      <button
        onClick={() => handleScroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-white dark:bg-slate-800 flex items-center justify-center shadow-md"
      >
        <ChevronLeft className="w-4 h-4 text-slate-600" />
      </button>
      <button
        onClick={() => handleScroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-white dark:bg-slate-800 flex items-center justify-center shadow-md"
      >
        <ChevronRight className="w-4 h-4 text-slate-600" />
      </button>

      {/* Navegación */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide px-8 py-2 gap-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[70px] transition-all
                ${isActive 
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" 
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                }
              `}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
              <span className={`text-xs font-medium ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Iconos de flecha
const ChevronLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default BottomNav;