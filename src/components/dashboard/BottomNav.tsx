"use client";

import { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, DollarSign, CreditCard, Banknote, Landmark, TrendingUp, Briefcase } from "lucide-react";

const navItems = [
  { id: "home", label: "Inicio", icon: Home, path: "/dashboard" },
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50">
      <div
        className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1"
        style={{ 
          scrollbarWidth: "none", 
          msOverflowStyle: "none", 
          paddingLeft: "0.5rem",
          paddingRight: "0.5rem"
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-[70px] transition-all duration-200
                ${isActive 
                  ? "bg-green-500 text-black" 
                  : "text-zinc-500 hover:bg-zinc-800 hover:text-green-400"
                }
              `}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-black" : ""}`} />
              <span className={`text-[10px] font-medium ${isActive ? "text-black" : ""}`}>
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