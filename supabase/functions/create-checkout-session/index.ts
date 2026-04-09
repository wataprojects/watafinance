import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Stripe API key - should be set as a secret
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const STRIPE_PRICE_MONTHLY = Deno.env.get('STRIPE_PRICE_MONTHLY') || 'price_monthly';
const STRIPE_PRICE_YEARLY = Deno.env.get('STRIPE_PRICE_YEARLY') || 'price_yearly';
const BASE_URL = Deno.env.get('BASE_URL') || 'http://localhost:5173';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', {
        status: 401,
        headers: corsHeaders
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with service role to update profiles
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://eoupodozovwxbldzptlp.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response('Invalid token', {
        status: 401,
        headers: corsHeaders
      });
    }

    // Get the request body
    const { priceId, successUrl, cancelUrl } = await req.json();

    // Validate priceId
    const validPriceIds = [STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY];
    if (!validPriceIds.includes(priceId)) {
      return new Response('Invalid price ID', {
        status: 400,
        headers: corsHeaders
      });
    }

    // If no Stripe secret key, return a mock response for testing
    if (!STRIPE_SECRET_KEY) {
      console.log("[create-checkout-session] No Stripe key configured, returning test mode");
      return new Response(JSON.stringify({
        url: `${BASE_URL}/subscription-required?test=true&priceId=${priceId}`,
        testMode: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Import Stripe
    const Stripe = await import('https://esm.sh/stripe@14.14.0?target=deno');
    const stripe = new Stripe.default(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      });
      customerId = customer.id;

      // Update profile with Stripe customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        }
      ],
      mode: 'subscription',
      success_url: successUrl || `${BASE_URL}/dashboard?subscription=success`,
      cancel_url: cancelUrl || `${BASE_URL}/subscription-required`,
      metadata: {
        supabase_user_id: user.id
      }
    });

    console.log("[create-checkout-session] Created checkout session", { sessionId: session.id, userId: user.id });

    return new Response(JSON.stringify({
      url: session.url
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("[create-checkout-session] Error:", error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});