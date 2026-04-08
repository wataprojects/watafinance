import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Asset, AssetType, LiquidityLevel, RiskLevel, ASSET_TYPE_LABELS, LIQUIDITY_LABELS, RISK_LABELS } from '@/types/patrimony';

interface PatrimonyAssetFormProps {
  asset?: Asset | null;
  onSubmit: (data: Partial<Asset>) => Promise<void>;
  onClose: () => void;
  debts: Array<{ id: string; name: string }>;
}

const assetTypes: AssetType[] = ['negocio', 'inmueble', 'efectivo', 'inversion', 'vehiculo', 'otros'];
const liquidityLevels: LiquidityLevel[] = ['alta', 'media', 'baja'];
const riskLevels: RiskLevel[] = ['bajo', 'medio', 'alto'];

export const PatrimonyAssetForm: React.FC<PatrimonyAssetFormProps> = ({
  asset,
  onSubmit,
  onClose,
  debts,
}) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    asset_type: 'otros' as AssetType,
    value: '',
    purchase_value: '',
    generates_income: false,
    liquidity: 'media' as LiquidityLevel,
    risk_level: 'medio' as RiskLevel,
    linked_debt_id: '',
    description: '',
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        asset_type: asset.asset_type || 'otros',
        value: asset.value?.toString() || '',
        purchase_value: asset.purchase_value?.toString() || '',
        generates_income: asset.generates_income || false,
        liquidity: asset.liquidity || 'media',
        risk_level: asset.risk_level || 'medio',
        linked_debt_id: asset.linked_debt_id || '',
        description: asset.description || '',
      });
    }
  }, [asset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.value) return;

    setSaving(true);
    await onSubmit({
      name: formData.name,
      asset_type: formData.asset_type,
      value: parseFloat(formData.value),
      purchase_value: formData.purchase_value ? parseFloat(formData.purchase_value) : undefined,
      generates_income: formData.generates_income,
      liquidity: formData.liquidity,
      risk_level: formData.risk_level,
      linked_debt_id: formData.linked_debt_id || undefined,
      description: formData.description || undefined,
      linked_investment_ids: [],
    });
    setSaving(false);
  };

  const revaluation = formData.purchase_value && parseFloat(formData.purchase_value) > 0
    ? ((parseFloat(formData.value) - parseFloat(formData.purchase_value)) / parseFloat(formData.purchase_value)) * 100
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-2xl border border-zinc-800">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
          <h2 className="text-lg font-semibold text-white">
            {asset ? 'Editar Activo' : 'Nuevo Activo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Nombre *</Label>
            <Input
              placeholder="Nombre del activo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-11"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Tipo de Activo *</Label>
            <div className="grid grid-cols-3 gap-2">
              {assetTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, asset_type: type })}
                  className={`p-2.5 rounded-xl text-sm font-medium transition-all ${
                    formData.asset_type === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {ASSET_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-sm">Valor Compra (€)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.purchase_value}
                onChange={(e) => setFormData({ ...formData, purchase_value: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-sm">Valor Actual (€) *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-11"
                required
              />
            </div>
          </div>

          {revaluation !== null && formData.purchase_value && (
            <div className={`p-3 rounded-xl ${
              revaluation >= 0 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'
            }`}>
              <p className={`text-sm font-medium ${
                revaluation >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                Revalorización: {revaluation >= 0 ? '+' : ''}{revaluation.toFixed(1)}%
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">¿Genera ingresos?</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, generates_income: true })}
                className={`p-2.5 rounded-xl text-sm font-medium transition-all ${
                  formData.generates_income
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, generates_income: false })}
                className={`p-2.5 rounded-xl text-sm font-medium transition-all ${
                  !formData.generates_income
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Liquidez</Label>
            <div className="grid grid-cols-3 gap-2">
              {liquidityLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, liquidity: level })}
                  className={`p-2.5 rounded-xl text-sm font-medium transition-all ${
                    formData.liquidity === level
                      ? level === 'alta'
                        ? 'bg-emerald-500 text-white'
                        : level === 'media'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-red-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {LIQUIDITY_LABELS[level]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Nivel de Riesgo</Label>
            <div className="grid grid-cols-3 gap-2">
              {riskLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, risk_level: level })}
                  className={`p-2.5 rounded-xl text-sm font-medium transition-all ${
                    formData.risk_level === level
                      ? level === 'bajo'
                        ? 'bg-emerald-500 text-white'
                        : level === 'medio'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-red-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {RISK_LABELS[level]}
                </button>
              ))}
            </div>
          </div>

          {debts.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-sm">Deuda Vinculada (Opcional)</Label>
              <select
                value={formData.linked_debt_id}
                onChange={(e) => setFormData({ ...formData, linked_debt_id: e.target.value })}
                className="w-full h-11 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm"
              >
                <option value="">Ninguna</option>
                {debts.map((debt) => (
                  <option key={debt.id} value={debt.id}>
                    {debt.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Descripción</Label>
            <textarea
              placeholder="Notas adicionales..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-24 px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 text-sm resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={saving || !formData.name || !formData.value}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl"
          >
            {saving ? 'Guardando...' : asset ? 'Guardar Cambios' : 'Agregar Activo'}
          </Button>
        </form>
      </div>
    </div>
  );
};
