import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Search,
  Loader2,
  Wallet,
  TrendingDown,
  PiggyBank,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  risk_level: string;
  user_type: string;
  financial_health: number;
  savings_potential: number;
  total_expenses: number;
  total_income: number;
  total_debt: number;
  savings_ratio: number;
  calculated_at: string;
  user?: {
    email: string;
  };
}

export function UsersPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_financial_profiles')
        .select('*, user:user_id(email)')
        .order('calculated_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error loading profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchTerm || 
      profile.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.user_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || profile.user_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'saver': return <PiggyBank className="h-4 w-4" />;
      case 'debtor': return <AlertTriangle className="h-4 w-4" />;
      case 'spender': return <TrendingDown className="h-4 w-4" />;
      case 'investor': return <Wallet className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'saver': return 'bg-emerald-100 text-emerald-700';
      case 'debtor': return 'bg-red-100 text-red-700';
      case 'spender': return 'bg-orange-100 text-orange-700';
      case 'investor': return 'bg-purple-100 text-purple-700';
      case 'balanced': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'conservative': return 'text-amber-600';
      case 'moderate': return 'text-blue-600';
      case 'aggressive': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const userTypes = ['all', 'saver', 'spender', 'debtor', 'investor', 'balanced'];
  const userTypeLabels: Record<string, string> = {
    all: 'Todos',
    saver: 'Ahorrador',
    spender: 'Gastador',
    debtor: 'Endeudado',
    investor: 'Inversor',
    balanced: 'Equilibrado'
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
          <h1 className="text-2xl font-bold text-gray-800">Usuarios Segmentados</h1>
          <p className="text-gray-500">Perfiles financieros de los usuarios</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por email o tipo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              {userTypes.map(type => (
                <Badge
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  className={`cursor-pointer ${filterType === type ? 'bg-emerald-600' : ''}`}
                  onClick={() => setFilterType(type)}
                >
                  {userTypeLabels[type]}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nivel de Riesgo</TableHead>
                <TableHead>Salud Financiera</TableHead>
                <TableHead>Ingresos</TableHead>
                <TableHead>Gastos</TableHead>
                <TableHead>Deuda</TableHead>
                <TableHead>Ahorro Potencial</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No se encontraron perfiles
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map(profile => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {profile.user?.email || profile.user_id.slice(0, 8) + '...'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(profile.calculated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getUserTypeColor(profile.user_type)}>
                        <span className="mr-1">
                          {getUserTypeIcon(profile.user_type)}
                        </span>
                        {userTypeLabels[profile.user_type] || profile.user_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getRiskLevelColor(profile.risk_level)}`}>
                        {profile.risk_level}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${profile.financial_health >= 70 ? 'bg-emerald-500' : profile.financial_health >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${profile.financial_health}%` }}
                          />
                        </div>
                        <span className="text-sm">{profile.financial_health}/100</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      €{profile.total_income?.toFixed(0) || 0}
                    </TableCell>
                    <TableCell>
                      €{profile.total_expenses?.toFixed(0) || 0}
                    </TableCell>
                    <TableCell>
                      <span className={profile.total_debt > 0 ? 'text-red-600' : ''}>
                        €{profile.total_debt?.toFixed(0) || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-emerald-600 font-medium">
                        €{profile.savings_potential?.toFixed(0) || 0}/año
                      </span>
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