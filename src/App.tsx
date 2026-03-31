import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import MiCuenta from "@/pages/MiCuenta";
import Suscripcion from "@/pages/Suscripcion";
import Income from "@/pages/Income";
import Expenses from "@/pages/Expenses";
import Debts from "@/pages/Debts";
import Investments from "@/pages/Investments";
import Patrimony from "@/pages/Patrimony";
import Offers from "@/pages/Offers";
import Notifications from "@/pages/Notifications";
import NewDebt from "@/pages/NewDebt";
import EditDebt from "@/pages/EditDebt";
import NewIncome from "@/pages/NewIncome";
import EditIncome from "@/pages/EditIncome";
import NewExpense from "@/pages/NewExpense";
import EditExpense from "@/pages/EditExpense";
import NewInvestment from "@/pages/NewInvestment";
import EditInvestment from "@/pages/EditInvestment";
import NewPatrimony from "@/pages/NewPatrimony";
import EditPatrimony from "@/pages/EditPatrimony";
import Onboarding from "@/pages/Onboarding";

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Index />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/onboarding" element={isAuthenticated ? <Onboarding /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/dashboard/mi-cuenta" element={isAuthenticated ? <MiCuenta /> : <Navigate to="/login" />} />
        <Route path="/dashboard/suscripcion" element={isAuthenticated ? <Suscripcion /> : <Navigate to="/login" />} />
        <Route path="/dashboard/income" element={isAuthenticated ? <Income /> : <Navigate to="/login" />} />
        <Route path="/dashboard/expenses" element={isAuthenticated ? <Expenses /> : <Navigate to="/login" />} />
        <Route path="/dashboard/debts" element={isAuthenticated ? <Debts /> : <Navigate to="/login" />} />
        <Route path="/dashboard/investments" element={isAuthenticated ? <Investments /> : <Navigate to="/login" />} />
        <Route path="/dashboard/patrimony" element={isAuthenticated ? <Patrimony /> : <Navigate to="/login" />} />
        <Route path="/dashboard/offers" element={isAuthenticated ? <Offers /> : <Navigate to="/login" />} />
        <Route path="/dashboard/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />} />
        <Route path="/dashboard/debts/new" element={isAuthenticated ? <NewDebt /> : <Navigate to="/login" />} />
        <Route path="/dashboard/debts/:id/edit" element={isAuthenticated ? <EditDebt /> : <Navigate to="/login" />} />
        <Route path="/dashboard/income/new" element={isAuthenticated ? <NewIncome /> : <Navigate to="/login" />} />
        <Route path="/dashboard/income/:id/edit" element={isAuthenticated ? <EditIncome /> : <Navigate to="/login" />} />
        <Route path="/dashboard/expenses/new" element={isAuthenticated ? <NewExpense /> : <Navigate to="/login" />} />
        <Route path="/dashboard/expenses/:id/edit" element={isAuthenticated ? <EditExpense /> : <Navigate to="/login" />} />
        <Route path="/dashboard/investments/new" element={isAuthenticated ? <NewInvestment /> : <Navigate to="/login" />} />
        <Route path="/dashboard/investments/:id/edit" element={isAuthenticated ? <EditInvestment /> : <Navigate to="/login" />} />
        <Route path="/dashboard/patrimony/new" element={isAuthenticated ? <NewPatrimony /> : <Navigate to="/login" />} />
        <Route path="/dashboard/patrimony/:id/edit" element={isAuthenticated ? <EditPatrimony /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;