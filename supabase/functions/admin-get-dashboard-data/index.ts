import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[admin-get-dashboard-data] Iniciando petición...");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const [
      incomesResult,
      expensesResult,
      debtsResult,
      investmentsResult,
      patrimonyResult,
      authData,
      profilesResult,
    ] = await Promise.all([
      supabaseAdmin.from("incomes").select("amount"),
      supabaseAdmin.from("expenses").select("amount"),
      supabaseAdmin.from("debts").select("current_amount"),
      supabaseAdmin.from("investments").select("current_value"),
      supabaseAdmin.from("patrimony").select("value"),
      supabaseAdmin.auth.admin.listUsers(),
      supabaseAdmin.from("profiles").select("id, first_name, last_name"),
    ]);

    if (incomesResult.error) throw incomesResult.error;
    if (expensesResult.error) throw expensesResult.error;
    if (debtsResult.error) throw debtsResult.error;
    if (investmentsResult.error) throw investmentsResult.error;
    if (patrimonyResult.error) throw patrimonyResult.error;
    if (authData.error) throw authData.error;
    if (profilesResult.error) throw profilesResult.error;

    const sumField = (data: any[] | null, field: string) =>
      (data || []).reduce((acc, item) => acc + (parseFloat(item[field]) || 0), 0);

    const authUsers = authData.data.users || [];
    const profiles = profilesResult.data || [];

    const recentClients = authUsers
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((user) => {
        const profile = profiles.find((p) => p.id === user.id);

        return {
          id: user.id,
          email: user.email || "Sin email",
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          created_at: user.created_at,
        };
      });

    const responseData = {
      metrics: {
        totalUsers: authUsers.length,
        totalIncomes: sumField(incomesResult.data, "amount"),
        totalExpenses: sumField(expensesResult.data, "amount"),
        totalDebts: sumField(debtsResult.data, "current_amount"),
        totalInvestments: sumField(investmentsResult.data, "current_value"),
        totalPatrimony: sumField(patrimonyResult.data, "value"),
      },
      recentClients,
    };

    console.log("[admin-get-dashboard-data] Datos cargados correctamente", {
      users: responseData.metrics.totalUsers,
      recentClients: recentClients.length,
    });

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[admin-get-dashboard-data] Error crítico:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});