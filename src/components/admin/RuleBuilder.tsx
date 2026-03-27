import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ruleSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  condition_type: z.string().min(1, 'El tipo de condición es requerido'),
  condition_value: z.any(),
  action_offer_id: z.string().optional(),
  priority: z.number().min(0),
  is_active: z.boolean()
});

type RuleFormValues = z.infer<typeof ruleSchema>;

interface RuleBuilderProps {
  rule?: any;
  offers: any[];
  onSubmit: (data: RuleFormValues) => void;
  isLoading?: boolean;
}

const conditionTypes = [
  { value: 'expense_category', label: 'Gasto por Categoría' },
  { value: 'debt_level', label: 'Nivel de Deuda' },
  { value: 'user_profile', label: 'Perfil de Usuario' },
  { value: 'savings_ratio', label: 'Ratio de Ahorro' },
  { value: 'income_property', label: 'Ingresos y Propiedad' },
  { value: 'no_investments', label: 'Sin Inversiones' },
  { value: 'user_type', label: 'Tipo de Usuario' }
];

export function RuleBuilder({ rule, offers, onSubmit, isLoading }: RuleBuilderProps) {
  const [conditionType, setConditionType] = useState(rule?.condition_type || '');
  const [conditionValue, setConditionValue] = useState<any>(
    rule?.condition_value || {}
  );

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: rule?.name || '',
      description: rule?.description || '',
      condition_type: rule?.condition_type || '',
      condition_value: rule?.condition_value || {},
      action_offer_id: rule?.action_offer_id || '',
      priority: rule?.priority || 0,
      is_active: rule?.is_active ?? true
    }
  });

  const handleConditionTypeChange = (value: string) => {
    setConditionType(value);
    form.setValue('condition_type', value);
    
    // Set default condition value based on type
    const defaults: Record<string, any> = {
      expense_category: { category: 'móvil', min_amount: 30 },
      debt_level: { min_debt: 5000 },
      user_profile: { risk_level: 'conservative', min_savings_ratio: 20 },
      savings_ratio: { min_ratio: 10 },
      income_property: { min_income: 2000 },
      no_investments: { min_income: 3000 },
      user_type: { user_type: 'debtor' }
    };
    
    setConditionValue(defaults[value] || {});
    form.setValue('condition_value', defaults[value] || {});
  };

  const handleSubmit = (data: RuleFormValues) => {
    onSubmit({
      ...data,
      condition_value: conditionValue
    });
  };

  const updateConditionField = (key: string, value: any) => {
    const newValue = { ...conditionValue, [key]: value };
    setConditionValue(newValue);
    form.setValue('condition_value', newValue);
  };

  const renderConditionFields = () => {
    switch (conditionType) {
      case 'expense_category':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría de Gasto</label>
              <Input 
                value={conditionValue.category || ''}
                onChange={e => updateConditionField('category', e.target.value)}
                placeholder="móvil, seguros, etc."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Monto Mínimo (€)</label>
              <Input 
                type="number"
                value={conditionValue.min_amount || 0}
                onChange={e => updateConditionField('min_amount', parseFloat(e.target.value))}
              />
            </div>
          </>
        );
      case 'debt_level':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Deuda Mínima (€)</label>
            <Input 
              type="number"
              value={conditionValue.min_debt || 0}
              onChange={e => updateConditionField('min_debt', parseFloat(e.target.value))}
            />
          </div>
        );
      case 'user_profile':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nivel de Riesgo</label>
              <Select 
                value={conditionValue.risk_level || ''}
                onValueChange={v => updateConditionField('risk_level', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservador</SelectItem>
                  <SelectItem value="moderate">Moderado</SelectItem>
                  <SelectItem value="aggressive">Agresivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ratio de Ahorro Mínimo (%)</label>
              <Input 
                type="number"
                value={conditionValue.min_savings_ratio || 0}
                onChange={e => updateConditionField('min_savings_ratio', parseFloat(e.target.value))}
              />
            </div>
          </>
        );
      case 'savings_ratio':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Ratio de Ahorro Máximo (%)</label>
            <Input 
              type="number"
              value={conditionValue.min_ratio || 0}
              onChange={e => updateConditionField('min_ratio', parseFloat(e.target.value))}
            />
          </div>
        );
      case 'income_property':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Ingreso Mínimo (€)</label>
            <Input 
              type="number"
              value={conditionValue.min_income || 0}
              onChange={e => updateConditionField('min_income', parseFloat(e.target.value))}
            />
          </div>
        );
      case 'no_investments':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Ingreso Mínimo (€)</label>
            <Input 
              type="number"
              value={conditionValue.min_income || 0}
              onChange={e => updateConditionField('min_income', parseFloat(e.target.value))}
            />
          </div>
        );
      case 'user_type':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Usuario</label>
            <Select 
              value={conditionValue.user_type || ''}
              onValueChange={v => updateConditionField('user_type', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saver">Ahorrador</SelectItem>
                <SelectItem value="spender">Gastador</SelectItem>
                <SelectItem value="debtor">Endeudado</SelectItem>
                <SelectItem value="investor">Inversor</SelectItem>
                <SelectItem value="balanced">Equilibrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{rule ? 'Editar Regla' : 'Nueva Regla'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Regla</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Gasto alto en móvil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción de la regla..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="condition_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Condición</FormLabel>
                  <Select 
                    onValueChange={handleConditionTypeChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo de condición" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {conditionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {conditionType && (
              <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                <label className="text-sm font-medium">Parámetros de Condición</label>
                {renderConditionFields()}
              </div>
            )}
            
            <FormField
              control={form.control}
              name="action_offer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Oferta Asociada</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una oferta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {offers.map(offer => (
                        <SelectItem key={offer.id} value={offer.id}>
                          {offer.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridad</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Activa</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Regla
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}