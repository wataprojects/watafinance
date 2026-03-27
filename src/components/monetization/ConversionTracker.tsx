import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConversionTrackerProps {
  offerId: string;
  opportunityId?: string;
  conversionType?: 'click' | 'view' | 'purchase';
  conversionValue?: number;
}

export function ConversionTracker({
  offerId,
  opportunityId,
  conversionType = 'click',
  conversionValue
}: ConversionTrackerProps) {
  const trackConversion = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await supabase.functions.invoke('track-conversion', {
        body: {
          offer_id: offerId,
          opportunity_id: opportunityId,
          conversion_type: conversionType,
          conversion_value: conversionValue
        }
      });
    } catch (err) {
      console.error('Error tracking conversion:', err);
    }
  };

  useEffect(() => {
    trackConversion();
  }, [offerId, opportunityId, conversionType, conversionValue]);

  return null;
}

export function useConversionTracking() {
  const trackClick = async (offerId: string, opportunityId?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await supabase.functions.invoke('track-conversion', {
        body: {
          offer_id: offerId,
          opportunity_id: opportunityId,
          conversion_type: 'click'
        }
      });
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  };

  const trackPurchase = async (
    offerId: string, 
    opportunityId: string, 
    value: number
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await supabase.functions.invoke('track-conversion', {
        body: {
          offer_id: offerId,
          opportunity_id: opportunityId,
          conversion_type: 'purchase',
          conversion_value: value
        }
      });
    } catch (err) {
      console.error('Error tracking purchase:', err);
    }
  };

  return { trackClick, trackPurchase };
}