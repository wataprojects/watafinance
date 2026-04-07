import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { 
  Plus, Edit, Trash2, DollarSign, CreditCard, Landmark, 
  PiggyBank, TrendingUp, Home, User, Heart, Settings, 
  Shield, Zap, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface ClientDetailTabsProps {
  clientId: string;
  profile: any;
  stats: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    savingsRatio: number;
  };
  incomes: any[];
  expenses: any[];
  debts: any[];
  loans: any[];
  investments: any[];
  patrimony: any[];
  onRefresh: () => void;
}

export default function ClientDetailTabs({
  clientId,
  profile,
  stats,
  incomes,
  expenses,
  debts,
  loans,
  investments,
  patrimony,
  onRefresh,
}: ClientDetailTabsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('health');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [itemType, setItemType] = useState<string>('');
  const [createType, setCreateType] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

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
    setFormData({ date: new Date().toISOString().split('T')[0] });
    setCreateDialogOpen(true);
  };

  const handleAction = async (action: 'edit' | 'delete' | 'create') => {
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

      const type = action === 'create' ? createType : itemType;
      const table = tableMap[type];
      if (!table) return;

      let result;
      if (action === 'edit') {
        result = await supabaseAdmin.from(table).update(formData).eq('id', itemToEdit.id);
      } else if (action === 'delete') {
        result = await supabaseAdmin.from(table).delete().eq('id', itemToDelete.id);
      } else {
        result = await supabaseAdmin.from(table).insert({ ...formData, user_id: clientId });
      }

      if (result.error) throw result.error;

      toast({ title: 'Éxito', description: `Operación realizada correctamente` });
      setEditDialogOpen(false);
      setDeleteDialogOpen(false);
      setCreateDialogOpen(false);
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const renderFormFields = (type: string) => {
    const commonFields = [
      { label: 'Monto', name: 'amount', type: 'number' },
      { label: 'Descripción', name: 'description', type: 'text' },
      { label: 'Categoría', name: 'category', type: 'text' },
      { label: 'Fecha', name: 'date', type: 'date' },
    ];

    const fieldsMap: Record<string, any[]> = {
      income: [...commonFields, { label: 'Pasivo', name: 'is_passive', type: 'checkbox' }, { label: 'Recurrente', name: 'is_recurring', type: 'checkbox' }],
      expense: [...commonFields, { label: 'Recurrente', name: 'is_recurring', type: 'checkbox' }, { label: 'Recortado', name: 'is_trimmed', type: 'checkbox' }],
      debt: [
        { label: 'Nombre', name: 'name', type: 'text' },
        { label: 'Acreedor', name: 'creditor', type: 'text' },
        { label: 'Monto Inicial', name: 'initial_amount', type: 'number' },
        { label: 'Monto Actual', name: 'current_amount', type: 'number' },
        { label: 'Tasa Interés (%)', name: 'interest_rate', type: 'number' },
        { label: 'Pago Mensual', name: 'monthly_payment', type: 'number' },
        { label: 'Estado', name: 'status', type: 'text' },
      ],
      loan: [
        { label: 'Deudor', name: 'borrower_name', type: 'text' },
        { label: 'Banco', name: 'bank', type: 'text' },
        { label: 'Monto Inicial', name: 'initial_amount', type: 'number' },
        { label: 'Monto Actual', name: 'current_amount', type: 'number' },
        { label: 'Pago Mensual', name: 'monthly_payment', type: 'number' },
        { label: 'Estado', name: 'status', type: 'text' },
      ],
      investment: [
        { label: 'Nombre', name: 'name', type: 'text' },
        { label: 'Tipo', name: 'type', type: 'text' },
        { label: 'Valor Inicial', name: 'initial_value', type: 'number' },
        { label: 'Valor Actual', name: 'current_value', type: 'number' },
        { label: 'Aportación Mensual', name: 'monthly_contribution', type: 'number' },
      ],
      patrimony: [
        { label: 'Nombre', name: 'name', type: 'text' },
        { label: 'Categoría', name: 'category', type: 'text' },
        { label: 'Valor', name: 'value', type: 'number' },
      ],
    };

    return fieldsMap[type]?.map((field) => (
      <div key={field.name} className="space-y-2">
        <Label className="text-slate-300">{field.label}</Label>
        {field.type === 'checkbox' ? (
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData[field.name] || false}
              onCheckedChange={(checked) => setFormData({ ...formData, [field.name]: checked })}
            />
          </div>
        ) : (
          <Input
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="bg-slate-800 border-slate-700 text-white"
          />
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 p-1 h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="health" className="data-[state=active]:bg-emerald-500 gap-2 py-2">
            <Heart className="h-4 w-4" /> Salud
          </TabsTrigger>
          <TabsTrigger value="incomes" className="data-[state=active]:bg-emerald-500 gap-2 py-2">
            <DollarSign className="h-4 w-4" /> Ingresos
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-emerald-500 gap-2 py-2">
            <CreditCard className="h-4 w-4" /> Gastos
          </TabsTrigger>
          <TabsTrigger value="debts" className="data-[state=active]:bg-emerald-500 gap-2 py-2">
            <Landmark className="h-4 w-4" /> Deudas
          </TabsTrigger>
          <TabsTrigger value="loans" className="data-[state=active]:bg-emerald-500 gap-2 py-2">
            <PiggyBank className="h-4 w-4" /> Préstamos
          </TabsTrigger>
          <TabsTrigger value="investments" className="data-[state=active]:bg-emerald-500 gap-2 py-2">
            <TrendingUp className="h-4 w-4" /> Inversiones
          </TabsTrigger>
          <TabsTrigger value="patrimony" className="data-[state=active]:bg-emerald-500 gap-2 py-2">
            <Home className="h-4 w-4" /> Patrimonio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" /> Balance Mensual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(stats.balance)}
                </div>
                <p className="text-xs text-slate-500 mt-1">Ingresos - Gastos (Periodo)</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-blue-400" /> Ratio de Ahorro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.savingsRatio.toFixed(1)}%</div>
                <p className="text-xs text-slate-500 mt-1">Porcentaje de ingresos ahorrados</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" /> Patrimonio Neto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(
                    investments.reduce((sum, i) => sum + (parseFloat(i.current_value) || 0), 0) +
                    patrimony.reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0) -
                    debts.reduce((sum, d) => sum + (parseFloat(d.current_amount) || 0), 0)
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">Activos - Deudas totales</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Resumen del Periodo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-400">Ingresos Totales</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(stats.totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-400">Gastos Totales (inc. préstamos)</span>
                  <span className="text-red-400 font-bold">{formatCurrency(stats.totalExpenses)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incomes" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Historial de Ingresos</h3>
            <Button onClick={() => openCreateDialog('income')} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 mr-2" /> Nuevo Ingreso
            </Button>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Concepto</TableHead>
                  <TableHead className="text-slate-400">Monto</TableHead>
                  <TableHead className="text-slate-400">Tipo</TableHead>
                  <TableHead className="text-slate-400">Fecha</TableHead>
                  <TableHead className="text-right text-slate-400">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((item) => (
                  <TableRow key={item.id} className="border-slate-800">
                    <TableCell className="text-white font-medium">{item.description || item.category}</TableCell>
                    <TableCell className="text-emerald-400 font-bold">{formatCurrency(item.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={item.is_passive ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-400"}>
                        {item.is_passive ? 'Pasivo' : 'Activo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400">{formatDate(item.date)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item, 'income')} className="text-slate-400 hover:text-blue-400"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(item, 'income')} className="text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Historial de Gastos</h3>
            <Button onClick={() => openCreateDialog('expense')} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 mr-2" /> Nuevo Gasto
            </Button>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Concepto</TableHead>
                  <TableHead className="text-slate-400">Monto</TableHead>
                  <TableHead className="text-slate-400">Categoría</TableHead>
                  <TableHead className="text-slate-400">Fecha</TableHead>
                  <TableHead className="text-right text-slate-400">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((item) => (
                  <TableRow key={item.id} className="border-slate-800">
                    <TableCell className="text-white font-medium">{item.description || item.category}</TableCell>
                    <TableCell className="text-red-400 font-bold">{formatCurrency(item.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-800 text-slate-400">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-400">{formatDate(item.date)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item, 'expense')} className="text-slate-400 hover:text-blue-400"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(item, 'expense')} className="text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="debts" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Deudas Registradas</h3>
            <Button onClick={() => openCreateDialog('debt')} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 mr-2" /> Nueva Deuda
            </Button>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Nombre</TableHead>
                  <TableHead className="text-slate-400">Acreedor</TableHead>
                  <TableHead className="text-slate-400">Pendiente</TableHead>
                  <TableHead className="text-slate-400">Estado</TableHead>
                  <TableHead className="text-right text-slate-400">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debts.map((item) => (
                  <TableRow key={item.id} className="border-slate-800">
                    <TableCell className="text-white font-medium">{item.name}</TableCell>
                    <TableCell className="text-slate-400">{item.creditor || '-'}</TableCell>
                    <TableCell className="text-orange-400 font-bold">{formatCurrency(item.current_amount)}</TableCell>
                    <TableCell>
                      <Badge className={item.status === 'paid' ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"}>
                        {item.status?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item, 'debt')} className="text-slate-400 hover:text-blue-400"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(item, 'debt')} className="text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="loans" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Préstamos Activos</h3>
            <Button onClick={() => openCreateDialog('loan')} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 mr-2" /> Nuevo Préstamo
            </Button>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Deudor</TableHead>
                  <TableHead className="text-slate-400">Banco</TableHead>
                  <TableHead className="text-slate-400">Pendiente</TableHead>
                  <TableHead className="text-slate-400">Cuota</TableHead>
                  <TableHead className="text-right text-slate-400">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((item) => (
                  <TableRow key={item.id} className="border-slate-800">
                    <TableCell className="text-white font-medium">{item.borrower_name}</TableCell>
                    <TableCell className="text-slate-400">{item.bank || '-'}</TableCell>
                    <TableCell className="text-orange-400 font-bold">{formatCurrency(item.current_amount)}</TableCell>
                    <TableCell className="text-white">{formatCurrency(item.monthly_payment)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item, 'loan')} className="text-slate-400 hover:text-blue-400"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(item, 'loan')} className="text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="investments" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Portafolio de Inversiones</h3>
            <Button onClick={() => openCreateDialog('investment')} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 mr-2" /> Nueva Inversión
            </Button>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Nombre</TableHead>
                  <TableHead className="text-slate-400">Tipo</TableHead>
                  <TableHead className="text-slate-400">Valor Actual</TableHead>
                  <TableHead className="text-slate-400">Retorno</TableHead>
                  <TableHead className="text-right text-slate-400">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((item) => (
                  <TableRow key={item.id} className="border-slate-800">
                    <TableCell className="text-white font-medium">{item.name}</TableCell>
                    <TableCell className="text-slate-400">{item.type}</TableCell>
                    <TableCell className="text-emerald-400 font-bold">{formatCurrency(item.current_value)}</TableCell>
                    <TableCell>
                      <Badge className={(item.return_percentage || 0) >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                        {item.return_percentage || 0}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item, 'investment')} className="text-slate-400 hover:text-blue-400"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(item, 'investment')} className="text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="patrimony" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Activos de Patrimonio</h3>
            <Button onClick={() => openCreateDialog('patrimony')} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 mr-2" /> Nuevo Activo
            </Button>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Nombre</TableHead>
                  <TableHead className="text-slate-400">Categoría</TableHead>
                  <TableHead className="text-slate-400">Valor</TableHead>
                  <TableHead className="text-right text-slate-400">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patrimony.map((item) => (
                  <TableRow key={item.id} className="border-slate-800">
                    <TableCell className="text-white font-medium">{item.name}</TableCell>
                    <TableCell className="text-slate-400">{item.category}</TableCell>
                    <TableCell className="text-blue-400 font-bold">{formatCurrency(item.value)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item, 'patrimony')} className="text-slate-400 hover:text-blue-400"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(item, 'patrimony')} className="text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modales de Acción */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Editar {itemType}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">{renderFormFields(itemType)}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="bg-slate-800 border-slate-700">Cancelar</Button>
            <Button onClick={() => handleAction('edit')} className="bg-emerald-500 hover:bg-emerald-600">Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">¿Confirmar eliminación?</DialogTitle>
            <DialogDescription className="text-slate-400">Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="bg-slate-800 border-slate-700">Cancelar</Button>
            <Button variant="destructive" onClick={() => handleAction('delete')}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Nuevo {createType}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">{renderFormFields(createType)}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="bg-slate-800 border-slate-700">Cancelar</Button>
            <Button onClick={() => handleAction('create')} className="bg-emerald-500 hover:bg-emerald-600">Crear Registro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}