import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import IncomePage from "./pages/dashboard/IncomePage";
import ExpensesPage from "./pages/dashboard/ExpensesPage";
import DebtsPage from "./pages/dashboard/DebtsPage";
import LoansPage from "./pages/dashboard/LoansPage";
import InvestmentsPage from "./pages/dashboard/InvestmentsPage";
import PatrimonyPage from "./pages/dashboard/PatrimonyPage";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import { AdminDashboard, OffersPage, RulesPage, UsersPage, AnalyticsPage } from "./pages/admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/income" element={<IncomePage />} />
          <Route path="/dashboard/expenses" element={<ExpensesPage />} />
          <Route path="/dashboard/debts" element={<DebtsPage />} />
          <Route path="/dashboard/loans" element={<LoansPage />} />
          <Route path="/dashboard/investments" element={<InvestmentsPage />} />
          <Route path="/dashboard/patrimony" element={<PatrimonyPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/offers" element={<OffersPage />} />
          <Route path="/admin/rules" element={<RulesPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;