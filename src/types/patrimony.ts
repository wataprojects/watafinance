export type AssetType = 'negocio' | 'inmueble' | 'efectivo' | 'inversion' | 'vehiculo' | 'otros';
export type LiquidityLevel = 'alta' | 'media' | 'baja';
export type RiskLevel = 'bajo' | 'medio' | 'alto';

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  category: string;
  value: number;
  description?: string;
  purchase_value?: number;
  asset_type: AssetType;
  generates_income: boolean;
  liquidity: LiquidityLevel;
  risk_level: RiskLevel;
  linked_debt_id?: string;
  linked_investment_ids: string[];
  last_updated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PatrimonySnapshot {
  id: string;
  user_id: string;
  total_assets: number;
  total_debts: number;
  net_patrimony: number;
  distribution: Record<string, number>;
  snapshot_date: string;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  creditor?: string;
  initial_amount: number;
  current_amount: number;
  interest_rate?: number;
  monthly_payment?: number;
  category?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: string;
  initial_value: number;
  current_value: number;
  return_percentage?: number;
  monthly_contribution?: number;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  user_id: string;
  borrower_name: string;
  initial_amount: number;
  current_amount: number;
  interest_rate?: number;
  monthly_payment?: number;
  status?: string;
  bank?: string;
  loan_type?: string;
  created_at: string;
  updated_at: string;
}

export type InsightType = 
  | 'concentration'
  | 'diversification'
  | 'orphan_income'
  | 'low_liquidity'
  | 'debt_ratio'
  | 'high_risk'
  | 'positive_revaluation'
  | 'negative_revaluation';

export type InsightSeverity = 'info' | 'warning' | 'critical' | 'success';

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  message: string;
  severity: InsightSeverity;
  icon: string;
  action?: string;
}

export interface CategoryDistribution {
  category: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface PatrimonyOverview {
  totalAssets: number;
  totalDebts: number;
  netPatrimony: number;
  evolutionPercentage: number;
  evolutionAmount: number;
  previousNetPatrimony?: number;
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  negocio: 'Negocio',
  inmueble: 'Inmueble',
  efectivo: 'Efectivo',
  inversion: 'Inversión',
  vehiculo: 'Vehículo',
  otros: 'Otros',
};

export const LIQUIDITY_LABELS: Record<LiquidityLevel, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
};

export const CATEGORY_COLORS: Record<string, string> = {
  // Spanish keys
  negocio: '#8B5CF6',
  inmueble: '#3B82F6',
  efectivo: '#10B981',
  inversion: '#F59E0B',
  vehiculo: '#EC4899',
  otros: '#6B7280',
  // English keys (alternative)
  business: '#8B5CF6',
  real_estate: '#3B82F6',
  cash: '#10B981',
  investment: '#F59E0B',
  vehicle: '#EC4899',
  others: '#6B7280',
};

export const CATEGORY_LABELS: Record<string, string> = {
  // Spanish keys
  negocio: 'Negocios',
  inmueble: 'Bienes Raíces',
  efectivo: 'Efectivo',
  inversion: 'Inversiones',
  vehiculo: 'Vehículos',
  otros: 'Otros',
  // English keys (alternative)
  business: 'Negocios',
  real_estate: 'Bienes Raíces',
  cash: 'Efectivo',
  investment: 'Inversiones',
  vehicle: 'Vehículos',
  others: 'Otros',
};
