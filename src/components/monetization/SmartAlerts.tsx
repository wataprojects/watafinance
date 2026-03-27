import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  PiggyBank, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Bell
} from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  category: string;
  potential_savings: number;
}

export function SmartAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [hasShownAlerts, setHasShownAlerts] = useState(false);

  const loadAlerts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const { data } = await supabase
        .from('detected_opportunities')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_dismissed', false)
        .order('detected_at', { ascending: false })
        .limit(3);

      if (data && data.length > 0 && !hasShownAlerts) {
        setHasShownAlerts(true);
        
        // Show alerts as toasts
        data.forEach((alert, index) => {
          setTimeout(() => {
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-emerald-600" />
                  {alert.title}
                </div>
              ),
              description: alert.description,
              duration: 8000,
              variant: alert.potential_savings > 100 ? 'default' : 'default',
              className: 'border-l-4 border-l-emerald-500'
            });
          }, index * 1500);
        });

        setAlerts(data);
      }
    } catch (err) {
      console.error('Error loading alerts:', err);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  return null;
}