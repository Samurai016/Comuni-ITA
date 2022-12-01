import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import requestHandler from "../requestHandler.ts";

serve(async (req) => {
  return await requestHandler(req, async () => {
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");

    // Ottengo query params
    const url = new URL(req.url);
    const params = url.searchParams;

    // Creo query
    let query = supabaseClient.from("regioni").select("*");

    // Filtri
    if (params.has("nome")) {
      query = query.ilike("nome", `%${params.get("nome")}%`);
    }

    // Sort by nome
    query = query.order("nome", { ascending: true });

    // Parametri mapping
    const response = await query;
    if (response.error) throw response.error;

    const regioni = response.data.map((regione) => {
      return regione.nome;
    });

    return regioni;
  });
});
