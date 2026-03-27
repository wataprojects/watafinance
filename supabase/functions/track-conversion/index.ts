import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response('Invalid token', { status: 401, headers: corsHeaders });
    }

    const { opportunity_id, offer_id, conversion_type, conversion_value } = await req.json();

    if (!offer_id) {
      return new Response('Missing offer_id', { status: 400, headers: corsHeaders });
    }

    // Get offer details for commission calculation
    const { data: offer } = await supabase
      .from('affiliate_offers')
      .select('expected_commission, commission_type')
      .eq('id', offer_id)
      .single();

    // Calculate commission
    let commissionEarned = 0;
    if (offer) {
      if (offer.commission_type === 'percentage') {
        commissionEarned = (conversion_value || 0) * (offer.expected_commission / 100);
      } else {
        commissionEarned = offer.expected_commission;
      }
    }

    // Record conversion
    const { data: conversion } = await supabase
      .from('offer_conversions')
      .insert({
        user_id: user.id,
        offer_id,
        opportunity_id,
        conversion_type: conversion_type || 'click',
        conversion_value: conversion_value || 0,
        commission_earned: commissionEarned
      })
      .select()
      .single();

    // Update opportunity if exists
    if (opportunity_id) {
      await supabase
        .from('detected_opportunities')
        .update({
          clicked_at: new Date().toISOString(),
          is_converted: conversion_type === 'purchase'
        })
        .eq('id', opportunity_id);
    }

    console.log('[track-conversion] Conversion tracked for user:', user.id, 'offer:', offer_id);

    return new Response(JSON.stringify({
      success: true,
      conversion_id: conversion?.id,
      commission_earned: commissionEarned
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[track-conversion] Error:', error);
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
  }
});