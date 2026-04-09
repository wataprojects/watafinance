import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const BASE_URL = Deno.env.get('BASE_URL') || 'http://localhost:5173';

interface EmailTemplate {
  subject: string;
  daysRemaining: number;
}

const EMAIL_TEMPLATES: Record<number, EmailTemplate> = {
  7: {
    subject: '⏰ Tu prueba gratuita de Monyro termina en 7 días',
    daysRemaining: 7
  },
  3: {
    subject: '⚠️ Tu prueba gratuita de Monyro termina en 3 días',
    daysRemaining: 3
  },
  1: {
    subject: '🚨 Último día: Tu prueba gratuita de Monyro termina hoy',
    daysRemaining: 1
  }
};

const getEmailContent = (daysRemaining: number, firstName: string) => {
  const isLastDay = daysRemaining === 1;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monyro - Recordatorio de Prueba</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000; color: #fff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #22c55e; margin: 0; font-size: 32px;">Monyro</h1>
    </div>

    <!-- Main Card -->
    <div style="background: linear-gradient(180deg, #18181b 0%, #09090b 100%); border: 1px solid #27272a; border-radius: 24px; padding: 40px; margin-bottom: 24px;">
      ${isLastDay ? `
      <div style="background: #dc2626; color: white; padding: 12px 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <strong>⚠️ ÚLTIMO DÍA</strong>
      </div>
      ` : ''}
      
      <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #fff;">
        Hola${firstName ? `, ${firstName}` : ''} 👋
      </h2>
      
      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        ${isLastDay 
          ? 'Tu período de prueba gratuita de <strong>Monyro</strong> termina <strong>HOY</strong>. No pierdas el acceso a todas las funcionalidades premium.'
          : `Tu período de prueba gratuita de <strong>Monyro</strong> termina en <strong style="color: #22c55e; font-size: 24px;">${daysRemaining} día${daysRemaining > 1 ? 's' : ''}</strong>.`
        }
      </p>

      <!-- Days Remaining Badge -->
      <div style="background: #22c55e/10; border: 1px solid #22c55e/20; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <div style="font-size: 48px; font-weight: bold; color: #22c55e;">${daysRemaining}</div>
        <div style="color: #22c55e; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">días restantes</div>
      </div>

      <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
        Después de hoy, necesitarás una suscripción activa para seguir usando Monyro:
      </p>

      <!-- Pricing Options -->
      <div style="display: flex; gap: 12px; margin-bottom: 24px;">
        <div style="flex: 1; background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 20px; text-align: center;">
          <div style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">Mensual</div>
          <div style="font-size: 28px; font-weight: bold; color: #fff;">2,8€</div>
          <div style="color: #71717a; font-size: 12px;">/mes</div>
        </div>
        <div style="flex: 1; background: #22c55e/10; border: 1px solid #22c55e/30; border-radius: 16px; padding: 20px; text-align: center;">
          <div style="color: #22c55e; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">⭐ Mejor valor</div>
          <div style="font-size: 28px; font-weight: bold; color: #fff;">25€</div>
          <div style="color: #22c55e; font-size: 12px;">/año (10% dto.)</div>
        </div>
      </div>

      <!-- CTA Button -->
      <a href="${BASE_URL}/subscription-required" style="display: block; background: #22c55e; color: #000; text-decoration: none; padding: 16px 32px; border-radius: 12px; text-align: center; font-weight: 600; font-size: 16px;">
        Activar mi suscripción →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #52525b; font-size: 12px;">
      <p style="margin: 0 0 8px 0;">¿Tienes preguntas? Contáctanos en soporte@monyro.app</p>
      <p style="margin: 0;">© 2024 Monyro. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // This function should be called by a cron job, so we don't require auth
  // But we do verify with a secret token for security
  const cronSecret = req.headers.get('x-cron-secret');
  const expectedSecret = Deno.env.get('CRON_SECRET') || 'development-secret';
  
  if (cronSecret !== expectedSecret && Deno.env.get('DENO_ENV') !== 'development') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://eoupodozovwxbldzptlp.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("[send-trial-reminders] Starting reminder job");

    const now = new Date();
    const reminderDays = [7, 3, 1];
    const results: { day: number; sent: number; failed: number }[] = [];

    for (const days of reminderDays) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Find users whose trial ends on this day and haven't subscribed
      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          trial_end_date,
          subscription_status,
          user:auth!inner(email)
        `)
        .eq('subscription_status', 'trial')
        .gte('trial_end_date', startOfDay.toISOString())
        .lte('trial_end_date', endOfDay.toISOString());

      if (error) {
        console.error("[send-trial-reminders] Error fetching users:", error);
        continue;
      }

      if (!users || users.length === 0) {
        console.log(`[send-trial-reminders] No users found for ${days} day reminder`);
        results.push({ day: days, sent: 0, failed: 0 });
        continue;
      }

      console.log(`[send-trial-reminders] Found ${users.length} users for ${days} day reminder`);

      let sent = 0;
      let failed = 0;

      for (const user of users as any[]) {
        try {
          const email = user.user?.email;
          if (!email) {
            console.log("[send-trial-reminders] No email found for user:", user.id);
            failed++;
            continue;
          }

          // If no Resend API key, just log
          if (!RESEND_API_KEY) {
            console.log(`[send-trial-reminders] Would send email to ${email} (${days} days)`);
            sent++;
            continue;
          }

          // Send email via Resend
          const template = EMAIL_TEMPLATES[days];
          const emailHtml = getEmailContent(days, user.first_name || '');

          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: 'Monyro <soporte@monyro.app>',
              to: email,
              subject: template.subject,
              html: emailHtml
            })
          });

          if (response.ok) {
            sent++;
            console.log(`[send-trial-reminders] Email sent to ${email}`);
          } else {
            failed++;
            console.error(`[send-trial-reminders] Failed to send to ${email}:`, await response.text());
          }

        } catch (err) {
          failed++;
          console.error("[send-trial-reminders] Error sending to user:", user.id, err);
        }
      }

      results.push({ day: days, sent, failed });
    }

    console.log("[send-trial-reminders] Job completed:", results);

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("[send-trial-reminders] Error:", error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});