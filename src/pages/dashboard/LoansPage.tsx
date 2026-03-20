"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Landmark, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/dashboard/BottomNav";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const LoansPage = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLoan, setNewLoan] = useState({
    borrower_name: "",
    initial_amount: "",
    current_amount: "",
    interest_rate: "",
    monthly_payment: "",
    status: "active",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    } else {
      fetchLoans(session.user.id);
    }
  };

  const fetchLoans = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setLoans(data);
    setLoading(false);
  };

  const handleAddLoan = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("loans").insert({
      user_id: session.user.id,
      borrower_name: newLoan.borrower_name,
      initial_amount: parseFloat(newLoan.initial_amount),
      current_amount: parseFloat(newLoan.current_amount),
      interest_rate: newLoan.interest_rate ? parseFloat(newLoan.interest_rate) : null,
      monthly_payment: newLoan.monthly_payment ? parseFloat(newLoan.monthly_payment) : null,
      status: newLoan.status,
    });

    if (!error) {
      setIsDialogOpen(false);
      setNewLoan({
        borrower_name: "",
        initial_amount: "",
        current_amount: "",
        interest_rate: "",
        monthly_payment: "",
        status: "active",
      });
      fetchLoans(session.user.id);
    }
  };

  const totalLoans = loans.reduce((sum, l) => sum + parseFloat(l.current_amount), 0);
  const activeLoans = loans.filter(l => l.status === "active").length;
  const recoveredLoans = loans.filter(l => l.status === "paid").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Préstamos</h1>
            <p className="text-slate-400">Dinero prestado a otros</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-500 hover:bg-cyan-600">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Préstamo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Registrar Préstamo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-slate-300">Nombre del Deudor</label>
                  <Input
                    placeholder="Nombre de la persona"
                    value={newLoan.borrower_name}
                    onChange={(e) => setNewLoan({ ...newLoan, borrower_name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-300">Monto Inicial</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newLoan.initial_amount}
                      onChange={(e) => setNewLoan({ ...newLoan, initial_amount: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">Monto Actual</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newLoan.current_amount}
                      onChange={(e) => setNewLoan({ ...newLoan, current_amount: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-300">Tasa de Interés (%)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newLoan.interest_rate}
                      onChange={(e) => setNewLoan({ ...newLoan, interest_rate: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">Cobro Mensual</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newLoan.monthly_payment}
                      onChange={(e) => setNewLoan({ ...newLoan, monthly_payment: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <Button onClick={handleAddLoan} className="w-full bg-cyan-500 hover:bg-cyan-600">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Landmark className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
              <p className="text-2xl font-bold text-white">{formatCurrency(totalLoans)}</p>
              <p className="text-xs text-slate-400">Total Prestado</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold text-white">{activeLoans}</p>
              <p className="text-xs text-slate-400">Activos</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
              <p className="text-2xl font-bold text-white">{recoveredLoans}</p>
              <p className="text-xs text-slate-400">Recuperados</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de préstamos */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-cyan-400" />
              Préstamos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400 text-center">Cargando...</p>
            ) : loans.length === 0 ? (
              <p className="text-slate-400 text-center">No hay préstamos registrados</p>
            ) : (
              <div className="space-y-3">
                {loans.map((loan) => {
                  const progress = ((parseFloat(loan.initial_amount) - parseFloat(loan.current_amount)) / parseFloat(loan.initial_amount)) * 100;
                  return (
                    <div key={loan.id} className="p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-white">{loan.borrower_name}</p>
                          <p className="text-xs text-slate-400">
                            {loan.status === "active" ? "Activo" : "Pagado"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-cyan-400">{formatCurrency(loan.current_amount)}</p>
                          <p className="text-xs text-slate-400">de {formatCurrency(loan.initial_amount)}</p>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{progress.toFixed(1)}% recuperado</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default LoansPage;
