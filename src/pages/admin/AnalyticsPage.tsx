import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, MousePointer, DollarSign, Percent } from 'lucide-react';
import { 
  ConversionsByOfferChart, 
  ConversionsByCategoryChart,
  RevenueOverTimeChart,
  ConversionRateChart 
} from '@/components/admin/AnalyticsCharts';
import { supabase } from '@/integrations/supabase/client';

interface ConversionData {
  offer_title: string;
  category: string;
  total_clicks: number;
  total_purchases: number;
  total_conversions: number;
}

export function AnalyticsPage() {
  const [conversionsByOffer, setConversionsByOffer] = useState<ConversionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalPurchases: 0,
    conversionRate: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get conversions with offer details
      const { data: conversions } = await supabase
        .from('offer_conversions')
        .select('*, offer:offer_id(title, category)');

      // Get unique offers with conversion counts
      const offerMap = new Map();
      let totalClicks = 0;
      let totalPurchases = 0;
      let totalRevenue = 0;

      conversions?.forEach(conv => {
        const offerId = conv.offer_id;
        if (!offerMap.has(offerId)) {
          offerMap.set(offerId, {
            offer_title: conv.offer?.title || 'Unknown',
            category: conv.offer?.category || 'other',
            total_clicks: 0,
            total_purchases: 0,
            total_conversions: 0
          });
        }
        
        const offer = offerMap.get(offerId);
        if (conv.conversion_type === 'click') {
          offer.total_clicks++;
          totalClicks++;
        } else if (conv.conversion_type === 'purchase') {
          offer.total_purchases++;
          totalPurchases++;
        }
        offer.total_conversions++;
        
        totalRevenue += conv.commission_earned || 0;
      });

      const conversionsData = Array.from(offerMap.values());
      setConversionsByOffer(conversionsData);

      setStats({
        totalClicks,
        totalPurchases,
        conversionRate: totalClicks > 0 ? (totalPurchases / totalClicks) * 100 : 0,
        totalRevenue
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-800">Analíticas</h1>
          <p className="text-gray-500">Métricas y estadísticas del sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Clics</p>
                <p className="text-2xl font-bold">{stats.totalClicks}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <MousePointer className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Compras</p>
                <p className="text-2xl font-bold">{stats.totalPurchases}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tasa de Conversión</p>
                <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Percent className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ingresos Totales</p>
                <p className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionsByOfferChart conversionsByOffer={conversionsByOffer} />
        <ConversionsByCategoryChart conversionsByOffer={conversionsByOffer} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionRateChart conversionsByOffer={conversionsByOffer} />
        <RevenueOverTimeChart conversionsByPeriod={[]} />
      </div>
    </div>
  );
}