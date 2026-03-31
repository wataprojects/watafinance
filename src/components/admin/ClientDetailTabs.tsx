import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, DollarSign, CreditCard, Landmark, PiggyBank, TrendingUp, Home, User } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
}

interface Income {
  id: string;
  amount: number;
  description: string | null;
  category: string;
  date: string;
  is_recurring: boolean;
  is_passive: boolean;
}

interface Expense {
  id: string;
  amount: number;
  description: string | null;
  category: string;
  date: string;
  is_recurring: boolean;
}

interface Debt {
  id: string;
  name: string;
  creditor: string | null;
  initial_amount: number;
  current_amount: number;
  interest_rate: number | null;
  monthly_payment: number | null;
  status: string;
  category: string | null;
}

interface Loan {
  id: string;
  borrower_name: string;
  initial_amount: number;
  current_amount: number;
  interest_rate: number | null;
  monthly_payment: number | null;
  status: string;
  bank: string | null;
  loan_type: string | null;
}

interface Investment {
  id: string;
  name: string;
  type: string;
  initial_value: number;
  current_value: number;
  return_percentage: number | null;
  monthly_contribution: number | null;
}

interface Patrimony {
  id: string;
  name: string;
  category: string;
  value: number;
  description: string | null;
}

interface ClientDetailTabsProps {
  clientId: string;
  profile: Profile | null;
  incomes: Income[];
  expenses: Expense[];
  debts: Debt[];
  loans: Loan[];
  investments: Investment[];
  patrimony: Patrimony[];
  onRefresh: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function ClientDetailTabs({
  clientId,
  profile,
  incomes,
  expenses,
  debts,
  loans,
  investments,
  patrimony,
  onRefresh,
}: ClientDetailTabsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [itemType, setItemType] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});

  const openEditDialog = (item: any, type: string) => {
    setItemToEdit(item);
    setItemType(type);
    setFormData(item);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (item: any, type: string) => {
    setItemToDelete(item);
    setItemType(type);
    setDeleteDialogOpen(true);
  };

  const openCreateDialog = (type: string) => {
    setCreateType(type);
    setFormData({});
    setCreateDialogOpen(true);
  };

  const handleEdit = async () => {
    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/admin');
      
      const tableMap: Record<string, string> = {
        income: 'incomes',
        expense: 'expenses',
        debt: 'debts',
        loan: 'loans',
        investment: 'investments',
        patrimony: 'patrimony',
      };

      const table = tableMap[itemType];
      if (!table) return;

      const { error } = await supabaseAdmin
        .from(table)
        .update({
          ...formData,
          amount: formData.amount ? parseFloat(formData.amount) : undefined,
          current_amount: formData.current_amount ? parseFloat(formData.current_amount) : undefined,
          interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : undefined,
          monthly_payment: formData.monthly_payment ? parseFloat(formData.monthly_payment) : undefined,
          value: formData.value ? parseFloat(formData.value) : undefined,
          initial_value: formData.initial_value ? parseFloat(formData.initial_value) : undefined,
          current_value: formData.current_value ? parseFloat(formData.current_value) : undefined,
          return_percentage: formData.return_percentage ? parseFloat(formData.return_percentage) : undefined,
          monthly_contribution: formData.monthly_contribution ? parseFloat(formData.monthly_contribution) : undefined,
        })
        .eq('id', itemToEdit.id);

      if (error) throw error;

      toast({ title: 'Actualizado', description: 'Registro actualizado correctamente' });
      setEditDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/admin');
      
      const tableMap: Record<string, string> = {
        income: 'incomes',
        expense: 'expenses',
        debt: 'debts',
        loan: 'loans',
        investment: 'investments',
        patrimony: 'patrimony',
      };

      const table = tableMap[itemType];
      if (!table) return;

      const { error } = await supabaseAdmin.from(table).delete().eq('id', itemToDelete.id);

      if (error) throw error;

      toast({ title: 'Eliminado', description: 'Registro eliminado correctamente' });
      setDeleteDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
  };

  const handleCreate = async () => {
    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/admin');
      
      const tableMap: Record<string, string> = {
        income: 'incomes',
        expense: 'expenses',
        debt: 'debts',
        loan: 'loans',
        investment: 'investments',
        patrimony: 'patrimony',
      };

      const table = tableMap[createType];
      if (!table) return;

      const dataToInsert: Record<string, any> = {
        user_id: clientId,
        ...formData,
      };

      if (['incomes', 'expenses'].includes(table)) {
        dataToInsert.amount = parseFloat(formData.amount) || 0;
      } else if (table === 'debts') {
        dataToInsert.initial_amount = parseFloat(formData.initial_amount) || 0;
        dataToInsert.current_amount = parseFloat(formData.current_amount) || dataToInsert.initial_amount;
        dataToInsert.interest_rate = parseFloat(formData.interest_rate) || 0;
        dataToInsert.monthly_payment = parseFloat(formData.monthly_payment) || 0;
      } else if (table === 'loans') {
        dataToInsert.initial_amount = parseFloat(formData.initial_amount) || 0;
        dataToInsert.current_amount = parseFloat(formData.current_amount) || dataToInsert.initial_amount;
        dataToInsert.interest_rate = parseFloat(formData.interest_rate) || 0;
        dataToInsert.monthly_payment = parseFloat(formData.monthly_payment) || 0;
      } else if (table === 'investments') {
        dataToInsert.initial_value = parseFloat(formData.initial_value) || 0;
        dataToInsert.current_value = parseFloat(formData.current_value) || dataToInsert.initial_value;
        dataToInsert.return_percentage = parseFloat(formData.return_percentage) || 0;
        dataToInsert.monthly_contribution = parseFloat(formData.monthly_contribution) || 0;
      } else if (table === 'patrimony') {
        dataToInsert.value = parseFloat(formData.value) || 0;
      }

      const { error } = await supabaseAdmin.from(table).insert(dataToInsert);

      if (error) throw error;

      toast({ title: 'Creado', description: 'Registro creado correctamente' });
      setCreateDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo crear', variant: 'destructive' });
    }
  };

  const renderFormFields = (type: string, prefix: string = '') => {
    const fields: Record<string, { label: string; name: string; type: string; required?: boolean }[]> = {
      income: [
        { label: 'Monto', name: `${prefix}amount`, type: 'number', required: true },
        { label: 'Descripción', name: `${prefix}description`, type: 'text' },
        { label: 'Categoría', name: `${prefix}category`, type: 'text', required: true },
        { label: 'Fecha', name: `${prefix}date`, type: 'date', required: true },
      ],
      expense: [
        { label: 'Monto', name: `${prefix}amount`, type: 'number', required: true },
        { label: 'Descripción', name: `${prefix}description`, type: 'text' },
        { label: 'Categoría', name: `${prefix}category`, type: 'text', required: true },
        { label: 'Fecha', name: `${prefix}date`, type: 'date', required: true },
      ],
      debt: [
        { label: 'Nombre', name: `${prefix}name`, type: 'text', required: true },
        { label: 'Acreedor', name: `${prefix}creditor`, type: 'text' },
        { label: 'Monto Inicial', name: `${prefix}initial_amount`, type: 'number', required: true },
        { label: 'Monto Actual', name: `${prefix}current_amount`, type: 'number' },
        { label: 'Tasa de Interés (%)', name: `${prefix}interest_rate`, type: 'number' },
        { label: 'Pago Mensual', name: `${prefix}monthly_payment`, type: 'number' },
        { label: 'Categoría', name: `${prefix}category`, type: 'text' },
      ],
      loan: [
        { label: 'Nombre del Deudor', name: `${prefix}borrower_name`, type: 'text', required: true },
        { label: 'Monto Inicial', name: `${prefix}initial_amount`, type: 'number', required: true },
        { label: 'Monto Actual', name: `${prefix}current_amount`, type: 'number' },
        { label: 'Tasa de Interés (%)', name: `${prefix}interest_rate`, type: 'number' },
        { label: 'Pago Mensual', name: `${prefix}monthly_payment`, type: 'number' },
        { label: 'Banco', name: `${prefix}bank`, type: 'text' },
        { label: 'Tipo de Préstamo', name: `${prefix}loan_type`, type: 'text' },
      ],
      investment: [
        { label: 'Nombre', name: `${prefix}name`, type: 'text', required: true },
        { label: 'Tipo', name: `${prefix}type`, type: 'text', required: true },
        { label: 'Valor Inicial', name: `${prefix}initial_value`, type: 'number', required: true },
        { label: 'Valor Actual', name: `${prefix}current_value`, type: 'number' },
        { label: 'Retorno (%)', name: `${prefix}return_percentage`, type: 'number' },
        { label: 'Aportación Mensual', name: `${prefix}monthly_contribution`, type: 'number' },
      ],
      patrimony: [
        { label: 'Nombre', name: `${prefix}name`, type: 'text', required: true },
        { label: 'Categoría', name: `${prefix}category`, type: 'text', required: true },
        { label: 'Valor', name: `${prefix}value`, type: 'number', required: true },
        { label: 'Descripción', name: `${prefix}description`, type: 'text' },
      ],
    };

    return fields[type]?.map((field) => (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name} className="text-slate-300">
          {field.label}
        </Label>
        <Input
          id={field.name}
          type={field.type}
          value={formData[field.name] || ''}
          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          className="bg-slate-800 border-slate-700 text-white"
          required={field.required}
        />
      </div>
    ));
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="bg-slate-800 border-slate-700">
        <TabsTrigger value="profile" className="data-[state=active]:bg-emerald-500">
          <User className="h-4 w-4 mr-2" />
          Perfil
        </TabsTrigger>
        <TabsTrigger value="incomes" className="data-[state=active]:bg-emerald-500">
          <DollarSign className="h-4 w-4 mr-2" />
          Ingresos
        </TabsTrigger>
        <TabsTrigger value="expenses" className="data-[state=active]:bg-emerald-500">
          <CreditCard className="h-4 w-4 mr-2" />
          Gastos
        </TabsTrigger>
        <TabsTrigger value="debts" className="data-[state=active]:bg-emerald-500">
          <Landmark className="h-4 w-4 mr-2" />
          Deudas
        </TabsTrigger>
        <TabsTrigger value="loans" className="data-[state=active]:bg-emerald-500">
          <PiggyBank className="h-4 w-4 mr-2" />
          Préstamos
        </TabsTrigger>
        <TabsTrigger value="investments" className="data-[state=active]:bg-emerald-500">
          <TrendingUp className="h-4 w-4 mr-2" />
          Inversiones
        </TabsTrigger>
        <TabsTrigger value="patrimony" className="data-[state=active]:bg-emerald-500">
          <Home className="h-4 w-4 mr-2" />
          Patrimonio
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Información del Perfil</CardTitle>
            <CardDescription className="text-slate-400">
              Datos generales del cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Nombre</p>
                <p className="text-white font-medium">{profile?.first_name || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Apellido</p>
                <p className="text-white font-medium">{profile?.last_name || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="text-white font-medium">{profile?.email || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Fecha de Registro</p>
                <p className="text-white font-medium">
                  {profile?.created_at ? formatDate(profile.created_at) : 'No disponible'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="incomes" className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => openCreateDialog('income')} className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Ingreso
          </Button>
        </div>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Monto</TableHead>
                  <TableHead className="text-slate-400">Descripción</TableHead>
                  <TableHead className="text-slate-400">Categoría</TableHead>
                  <TableHead className="text-slate-400">Fecha</TableHead>
                  <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                      No hay ingresos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  incomes.map((income) => (
                    <TableRow key={income.id} className="border-slate-800">
                      <TableCell className="text-emerald-400 font-medium">
                        {formatCurrency(income.amount)}
                      </TableCell>
                      <TableCell className="text-slate-300">{income.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                          {income.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">{formatDate(income.date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(income, 'income')} className="text-slate-400 hover:text-blue-400">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(income, 'income')} className="text-slate-400 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="expenses" className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => openCreateDialog('expense')} className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Monto</TableHead>
                  <TableHead className="text-slate-400">Descripción</TableHead>
                  <TableHead className="text-slate-400">Categoría</TableHead>
                  <TableHead className="text-slate-400">Fecha</TableHead>
                  <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                      No hay gastos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id} className="border-slate-800">
                      <TableCell className="text-red-400 font-medium">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell className="text-slate-300">{expense.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">{formatDate(expense.date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(expense, 'expense')} className="text-slate-400 hover:text-blue-400">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(expense, 'expense')} className="text-slate-400 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="debts" className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => openCreateDialog('debt')} className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Deuda
          </Button>
        </div>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Nombre</TableHead>
                  <TableHead className="text-slate-400">Acreedor</TableHead>
                  <TableHead className="text-slate-400">Monto Actual</TableHead>
                  <TableHead className="text-slate-400">Tasa</TableHead>
                  <TableHead className="text-slate-400">Estado</TableHead>
                  <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      No hay deudas registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  debts.map((debt) => (
                    <TableRow key={debt.id} className="border-slate-800">
                      <TableCell className="text-white font-medium">{debt.name}</TableCell>
                      <TableCell className="text-slate-400">{debt.creditor || '-'}</TableCell>
                      <TableCell className="text-red-400 font-medium">
                        {formatCurrency(debt.current_amount)}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {debt.interest_rate ? `${debt.interest_rate}%` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            debt.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-orange-500/20 text-orange-400'
                          }
                        >
                          {debt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(debt, 'debt')} className="text-slate-400 hover:text-blue-400">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(debt, 'debt')} className="text-slate-400 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="loans" className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => openCreateDialog('loan')} className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Préstamo
          </Button>
        </div>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Deudor</TableHead>
                  <TableHead className="text-slate-400">Banco</TableHead>
                  <TableHead className="text-slate-400">Monto Actual</TableHead>
                  <TableHead className="text-slate-400">Tipo</TableHead>
                  <TableHead className="text-slate-400">Estado</TableHead>
                  <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      No hay préstamos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  loans.map((loan) => (
                    <TableRow key={loan.id} className="border-slate-800">
                      <TableCell className="text-white font-medium">{loan.borrower_name}</TableCell>
                      <TableCell className="text-slate-400">{loan.bank || '-'}</TableCell>
                      <TableCell className="text-orange-400 font-medium">
                        {formatCurrency(loan.current_amount)}
                      </TableCell>
                      <TableCell className="text-slate-400">{loan.loan_type || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            loan.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }
                        >
                          {loan.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(loan, 'loan')} className="text-slate-400 hover:text-blue-400">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(loan, 'loan')} className="text-slate-400 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="investments" className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => openCreateDialog('investment')} className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Inversión
          </Button>
        </div>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Nombre</TableHead>
                  <TableHead className="text-slate-400">Tipo</TableHead>
                  <TableHead className="text-slate-400">Valor Actual</TableHead>
                  <TableHead className="text-slate-400">Retorno</TableHead>
                  <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                      No hay inversiones registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  investments.map((investment) => (
                    <TableRow key={investment.id} className="border-slate-800">
                      <TableCell className="text-white font-medium">{investment.name}</TableCell>
                      <TableCell className="text-slate-400">{investment.type}</TableCell>
                      <TableCell className="text-emerald-400 font-medium">
                        {formatCurrency(investment.current_value)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            (investment.return_percentage || 0) >= 0
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }
                        >
                          {investment.return_percentage ? `${investment.return_percentage}%` : '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(investment, 'investment')} className="text-slate-400 hover:text-blue-400">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(investment, 'investment')} className="text-slate-400 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="patrimony" className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => openCreateDialog('patrimony')} className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Patrimonio
          </Button>
        </div>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Nombre</TableHead>
                  <TableHead className="text-slate-400">Categoría</TableHead>
                  <TableHead className="text-slate-400">Valor</TableHead>
                  <TableHead className="text-slate-400">Descripción</TableHead>
                  <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patrimony.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                      No hay patrimonio registrado
                    </TableCell>
                  </TableRow>
                ) : (
                  patrimony.map((item) => (
                    <TableRow key={item.id} className="border-slate-800">
                      <TableCell className="text-white font-medium">{item.name}</TableCell>
                      <TableCell className="text-slate-400">{item.category}</TableCell>
                      <TableCell className="text-purple-400 font-medium">
                        {formatCurrency(item.value)}
                      </TableCell>
                      <TableCell className="text-slate-400">{item.description || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(item, 'patrimony')} className="text-slate-400 hover:text-blue-400">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(item, 'patrimony')} className="text-slate-400 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Editar {itemType}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Modifica los campos del registro
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">{renderFormFields(itemType)}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="bg-slate-800 border-slate-700">
              Cancelar
            </Button>
            <Button onClick={handleEdit} className="bg-emerald-500 hover:bg-emerald-600">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">¿Eliminar {itemType}?</DialogTitle>
            <DialogDescription className="text-slate-400">
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="bg-slate-800 border-slate-700">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Nuevo {createType}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Completa los campos para crear un nuevo registro
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">{renderFormFields(createType)}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="bg-slate-800 border-slate-700">
              Cancelar
            </Button>
            <Button onClick={handleCreate} className="bg-emerald-500 hover:bg-emerald-600">
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
