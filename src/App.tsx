import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { DateFilterProvider } from "@/contexts/DateFilterContext";
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
import SubscriptionRequired from "./pages/SubscriptionRequired";

const queryClient = new QueryClient();

// Protected route wrapper that checks subscription status
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [needsSubscription, setNeedsSubscription] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      // Check subscription status
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, trial_end_date, onboarding_completed')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        // Check if trial has expired
        const now = new Date();
        const trialEnd = profile.trial_end_date ? new Date(profile.trial_end_date) : null;
        
        const isTrialExpired = !trialEnd || trialEnd < now;
        const isNotActive = profile.subscription_status !== 'active';
        
        if (isTrialExpired && isNotActive) {
          setNeedsSubscription(true);
        }
      }

      setLoading(false);
    };

    checkSubscription();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-green-500">Cargando...</div>
      </div>
    );
  }

  if (needsSubscription) {
    return <Navigate to="/subscription-required" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminAuthProvider>
        <DateFilterProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/subscription-required" element={<SubscriptionRequired />} />
              
              {/* Protected routes - require active subscription */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/income" element={<ProtectedRoute><IncomePage /></ProtectedRoute>} />
              <Route path="/dashboard/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
              <Route path="/dashboard/debts" element={<ProtectedRoute><DebtsPage /></ProtectedRoute>} />
              <Route path="/dashboard/loans" element={<ProtectedRoute><LoansPage /></ProtectedRoute>} />
              <Route path="/dashboard/investments" element={<ProtectedRoute><InvestmentsPage /></ProtectedRoute>} />
              <Route path="/dashboard/patrimony" element={<ProtectedRoute><PatrimonyPage /></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/clients" element={<AdminClients />} />
              <Route path="/admin/clients/:id" element={<AdminClientDetail />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DateFilterProvider>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;