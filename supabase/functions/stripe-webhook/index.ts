import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://eoupodozovwxbldzptlp.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    // If no webhook secret, log the event but don't process
    if (!STRIPE_WEBHOOK_SECRET) {
      console.log("[stripe-webhook] No webhook secret configured, skipping verification");
      console.log("[stripe-webhook] Event received:", body.substring(0, 200));
      return new Response(JSON.stringify({ received: true, testMode: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify webhook signature
    const Stripe = await import('https://esm.sh/stripe@14.14.0?target=deno');
    const stripe = new Stripe.default(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(body, signature || '', STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("[stripe-webhook] Webhook signature verification failed:", err.message);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    console.log("[stripe-webhook] Processing event:", event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id;
        
        if (userId && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          
          // Determine tier based on price
          const priceId = subscription.items.data[0]?.price.id;
          const tier = priceId === (Deno.env.get('STRIPE_PRICE_YEARLY') || 'price_yearly') ? 'yearly' : 'monthly';

          // Update profile
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_tier: tier,
              subscription_id: subscription.id,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('id', userId);

          // Add to history
          await supabase
            .from('subscription_history')
            .insert({
              user_id: userId,
              event_type: 'subscription_started',
              amount: subscription.items.data[0]?.price.unit_amount || 0,
              currency: subscription.items.data[0]?.price.currency || 'eur',
              stripe_subscription_id: subscription.id,
              stripe_customer_id: session.customer
            });

          console.log("[stripe-webhook] Subscription activated for user:", userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user by stripe_customer_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          const status = subscription.status === 'active' ? 'active' : 
                        subscription.status === 'canceled' ? 'cancelled' : 
                        subscription.status === 'past_due' ? 'past_due' : 'trial';

          const priceId = subscription.items.data[0]?.price.id;
          const tier = priceId === (Deno.env.get('STRIPE_PRICE_YEARLY') || 'price_yearly') ? 'yearly' : 'monthly';

          await supabase
            .from('profiles')
            .update({
              subscription_status: status,
              subscription_tier: tier,
              subscription_id: subscription.id,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('id', profile.id);

          console.log("[stripe-webhook] Subscription updated for user:", profile.id, { status, tier });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'cancelled',
              subscription_tier: 'none',
              subscription_id: null
            })
            .eq('id', profile.id);

          // Add to history
          await supabase
            .from('subscription_history')
            .insert({
              user_id: profile.id,
              event_type: 'subscription_cancelled',
              stripe_subscription_id: subscription.id,
              stripe_customer_id: customerId
            });

          console.log("[stripe-webhook] Subscription cancelled for user:", profile.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'past_due'
            })
            .eq('id', profile.id);

          console.log("[stripe-webhook] Payment failed for user:", profile.id);
        }
        break;
      }

      default:
        console.log("[stripe-webhook] Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("[stripe-webhook] Error:", error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});