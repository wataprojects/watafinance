import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Stats {
  activeUsers: number;
  totalOpportunities: number;
  totalConversions: number;
  estimatedRevenue: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    activeUsers: 0,
    totalOpportunities: 0,
    totalConversions: 0,
    estimatedRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get active users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total opportunities
      const { count: opportunitiesCount } = await supabase
        .from('detected_opportunities')
        .select('*', { count: 'exact', head: true });

      // Get total conversions
      const { count: conversionsCount } = await supabase
        .from('offer_conversions')
        .select('*', { count: 'exact', head: true });

      // Get estimated revenue
      const { data: conversions } = await supabase
        .from('offer_conversions')
        .select('commission_earned');

      const estimatedRevenue = conversions?.reduce(
        (sum, c) => sum + (c.commission_earned || 0), 0
      ) || 0;

      setStats({
        activeUsers: usersCount || 0,
        totalOpportunities: opportunitiesCount || 0,
        totalConversions: conversionsCount || 0,
        estimatedRevenue
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Usuarios Activos',
      value: stats.activeUsers,
      icon: Users,
      color: 'bg-blue-500',
      description: 'Usuarios registrados en la plataforma'
    },
    {
      title: 'Oportunidades Generadas',
      value: stats.totalOpportunities,
      icon: Target,
      color: 'bg-purple-500',
      description: 'Oportunidades detectadas para usuarios'
    },
    {
      title: 'Conversiones Totales',
      value: stats.totalConversions,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      description: 'Total de clics y compras registradas'
    },
    {
      title: 'Ingresos Estimados',
      value: `€${stats.estimatedRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-amber-500',
      description: 'Comisiones ganadas hasta la fecha'
    }
  ];

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
          <h1 className="text-2xl font-bold text-gray-800">Dashboard de Administración</h1>
          <p className="text-gray-500">Resumen del sistema de monetización</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Gestión de Ofertas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Administra las ofertas de afiliados disponibles en el sistema.
            </p>
            <Link to="/admin/offers">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Ir a Ofertas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Gestión de Reglas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Configura las reglas que determinan cuándo mostrar ofertas.
            </p>
            <Link to="/admin/rules">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Ir a Reglas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Analíticas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Consulta las métricas y estadísticas del sistema.
            </p>
            <Link to="/admin/analytics">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Ver Analíticas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}