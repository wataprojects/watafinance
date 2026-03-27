import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Zap
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { RuleBuilder } from '@/components/admin/RuleBuilder';
import { supabase } from '@/integrations/supabase/client';

interface Rule {
  id: string;
  name: string;
  description: string;
  condition_type: string;
  condition_value: any;
  action_offer_id: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  offer?: {
    title: string;
  };
}

export function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rulesRes, offersRes] = await Promise.all([
        supabase
          .from('monetization_rules')
          .select('*, offer:affiliate_offers(title)')
          .order('priority', { ascending: false }),
        supabase
          .from('affiliate_offers')
          .select('id, title')
          .eq('is_active', true)
      ]);

      setRules(rulesRes.data || []);
      setOffers(offersRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingRule) {
        const { error } = await supabase
          .from('monetization_rules')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRule.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('monetization_rules')
          .insert(data);

        if (error) throw error;
      }

      await loadData();
      setIsDialogOpen(false);
      setEditingRule(null);
    } catch (err) {
      console.error('Error saving rule:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta regla?')) return;

    try {
      const { error } = await supabase
        .from('monetization_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  };

  const handleToggleActive = async (rule: Rule) => {
    try {
      const { error } = await supabase
        .from('monetization_rules')
        .update({ is_active: !rule.is_active })
        .eq('id', rule.id);

      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error('Error toggling rule:', err);
    }
  };

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.condition_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const conditionTypeLabels: Record<string, string> = {
    expense_category: 'Gasto por Categoría',
    debt_level: 'Nivel de Deuda',
    user_profile: 'Perfil de Usuario',
    savings_ratio: 'Ratio de Ahorro',
    income_property: 'Ingresos y Propiedad',
    no_investments: 'Sin Inversiones',
    user_type: 'Tipo de Usuario'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Reglas</h1>
          <p className="text-gray-500">Configura las reglas de monetización</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setEditingRule(null)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Regla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Editar Regla' : 'Nueva Regla'}
              </DialogTitle>
            </DialogHeader>
            <RuleBuilder
              rule={editingRule}
              offers={offers}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar reglas..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo de Condición</TableHead>
                <TableHead>Oferta Asociada</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No se encontraron reglas
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map(rule => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {rule.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {conditionTypeLabels[rule.condition_type] || rule.condition_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rule.offer?.title || 'Sin oferta'}
                    </TableCell>
                    <TableCell>
                      {rule.priority}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => handleToggleActive(rule)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingRule(rule);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(rule.id)}
                          className="text-red-500 hover:text-red-700"
                        >
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
    </div>
  );
}