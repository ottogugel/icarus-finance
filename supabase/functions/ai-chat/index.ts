import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    let financialContext = "";

    if (authHeader && SUPABASE_URL && SUPABASE_ANON_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } }
      });

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Get current month transactions
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

        // Get last month transactions
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

        const [currentMonthData, lastMonthData, banksData, goalsData] = await Promise.all([
          supabase
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .gte("date", startOfMonth)
            .lte("date", endOfMonth),
          supabase
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .gte("date", startOfLastMonth)
            .lte("date", endOfLastMonth),
          supabase
            .from("banks")
            .select("*")
            .eq("user_id", user.id),
          supabase
            .from("goals")
            .select("*")
            .eq("user_id", user.id)
        ]);

        const currentMonthTransactions = currentMonthData.data || [];
        const lastMonthTransactions = lastMonthData.data || [];
        const banks = banksData.data || [];
        const goals = goalsData.data || [];

        // Calculate current month expenses by category
        const currentExpenses = currentMonthTransactions.filter(t => t.type === "expense");
        const expensesByCategory: Record<string, number> = {};
        currentExpenses.forEach(t => {
          expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + Number(t.amount);
        });
        const totalCurrentExpenses = currentExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

        // Calculate current month income
        const currentIncome = currentMonthTransactions.filter(t => t.type === "income");
        const totalCurrentIncome = currentIncome.reduce((sum, t) => sum + Number(t.amount), 0);

        // Calculate last month totals
        const lastMonthExpenses = lastMonthTransactions.filter(t => t.type === "expense");
        const totalLastMonthExpenses = lastMonthExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
        const lastMonthIncome = lastMonthTransactions.filter(t => t.type === "income");
        const totalLastMonthIncome = lastMonthIncome.reduce((sum, t) => sum + Number(t.amount), 0);

        // Format expenses by category
        const expensesCategoryList = Object.entries(expensesByCategory)
          .map(([cat, amount]) => `- ${cat}: R$ ${amount.toFixed(2)}`)
          .join("\n");

        // Format banks
        const banksList = banks.map(b => `- ${b.name}: Saldo inicial R$ ${Number(b.initial_balance).toFixed(2)}`).join("\n");

        // Format goals
        const goalsList = goals.map(g => `- ${g.name}: R$ ${Number(g.current_amount).toFixed(2)} / R$ ${Number(g.target_amount).toFixed(2)} (${g.status})`).join("\n");

        financialContext = `
DADOS FINANCEIROS DO USUÁRIO (use essas informações para responder):

=== DESPESAS DO MÊS ATUAL ===
Total de despesas: R$ ${totalCurrentExpenses.toFixed(2)}
Por categoria:
${expensesCategoryList || "Nenhuma despesa registrada"}

=== RECEITAS DO MÊS ATUAL ===
Total de receitas: R$ ${totalCurrentIncome.toFixed(2)}

=== SALDO DO MÊS ATUAL ===
Saldo (receitas - despesas): R$ ${(totalCurrentIncome - totalCurrentExpenses).toFixed(2)}

=== MÊS PASSADO ===
Total de despesas: R$ ${totalLastMonthExpenses.toFixed(2)}
Total de receitas: R$ ${totalLastMonthIncome.toFixed(2)}

=== CONTAS/BANCOS ===
${banksList || "Nenhuma conta cadastrada"}

=== METAS ===
${goalsList || "Nenhuma meta cadastrada"}

Use esses dados reais para responder as perguntas do usuário sobre suas finanças.
`;
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `Você é um assistente financeiro inteligente e amigável. Você ajuda os usuários a:
- Entender suas finanças pessoais
- Dar dicas de economia e investimentos
- Explicar conceitos financeiros de forma simples
- Sugerir formas de organizar gastos por categoria
- Ajudar com planejamento de metas financeiras

${financialContext}

Seja sempre educado, conciso e útil. Responda em português brasileiro. Quando o usuário perguntar sobre suas despesas, receitas ou dados financeiros, use os dados reais fornecidos acima.` 
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao conectar com a IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
