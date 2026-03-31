"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { Home, DollarSign, CreditCard, Banknote, Landmark, TrendingUp, Briefcase, User } from "lucide-react";

const navItems = [
  { id: "home", label: "Inicio", icon: Home, path: "/dashboard" },
  { id: "income", label: "Ingresos", icon: DollarSign, path: "/dashboard/income" },
  { id: "expenses", label: "Gastos", icon: CreditCard, path: "/dashboard/expenses" },
  { id: "debts", label: "Deudas", icon: Banknote, path: "/dashboard/debts" },
  { id: "loans", label: "Préstamos", icon: Landmark, path: "/dashboard/loans" },
  { id: "investments", label: "Inversiones", icon: TrendingUp, path: "/dashboard/investments" },
  { id: "patrimony", label: "Patrimonio", icon: Briefcase, path: "/dashboard/patrimony" },
  { id: "profile", label: "Perfil", icon: User, path: "/dashboard/profile" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-900">
      <div
        className="flex gap-1 overflow-x-auto px-2 py-2 scrollbar-hide md:justify-center"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex min-w-[70px] flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-all duration-200 ${
                isActive
                  ? "bg-green-500 text-black"
                  : "text-zinc-500 hover:bg-zinc-800 hover:text-green-400"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-black" : ""}`} />
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