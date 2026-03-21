"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const LoansSummary = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("loans")
      .select("current_amount, monthly_payment, status")
      .eq("user_id", session.user.id)
      .eq("status", "active");

    if (data) setLoans(data);
    setLoading(false);
  };

  const totalDebt = loans.reduce((sum, l) => sum + parseFloat(l.current_amount || 0), 0);
  const totalMonthly = loans.reduce((sum, l) => sum + parseFloat(l.monthly_payment || 0), 0);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-4 text-center">
          <Landmark className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
          <p className="text-xl font-bold text-white">{formatCurrency(totalDebt)}</p>
          <p className="text-xs text-slate-400">Deuda total</p>
        </CardContent>
      </Card>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-4 text-center">
          <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
          <p className="text-xl font-bold text-white">{formatCurrency(totalMonthly)}</p>
          <p className="text-xs text-slate-400">Cuotas/mes</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoansSummary;