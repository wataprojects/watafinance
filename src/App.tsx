import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
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
import ProfilePage from "./pages/dashboard/ProfilePage";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminClientDetail from "./pages/admin/AdminClientDetail";
import AdminSetup from "./pages/admin/AdminSetup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminAuthProvider>
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
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/clients" element={<AdminClients />} />
            <Route path="/admin/clients/:id" element={<AdminClientDetail />} />
            <Route path="/admin-setup" element={<AdminSetup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;