// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import requestHandler from "../requestHandler.ts";

serve(async (req) => {
  return await requestHandler(req, "provincia", "province", async () => {
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");

    // Ottengo query params
    const url = new URL(req.url);
    const params = url.searchParams;

    // Match regione
    const regioniPattern = new URLPattern({ pathname: "/province/:regione" });
    const regioniMatch = regioniPattern.exec(req.url);
    const regione = regioniMatch ? regioniMatch.pathname.groups.regione : null;

    // Creo query
    let query = supabaseClient.from("province").select("*, regione!inner(nome)");

    // Filtri
    if (regione) {
      query = query.ilike("regione.nome", decodeURI(regione.toLowerCase()));
    }

    if (params.has("nome")) {
      query = query.ilike("nome", `%${params.get("nome")}%`);
    }
    if (params.has("codice")) {
      query = query.eq("codice", `${params.get("codice")}`);
    }
    if (params.has("sigla")) {
      query = query.ilike("sigla", `${params.get("sigla")}`);
    }

    // Sort by nome
    query = query.order("nome", { ascending: true });

    // Parametri mapping
    const isOnlyNome = params.has("onlyname");

    const response = await query;
    if (response.error) throw response.error;

    const province = response.data.map((provincia: any) => {
      if (isOnlyNome) return provincia.nome;

      provincia.regione = provincia.regione.nome;
      
      return provincia;
    });

    return province;
  });
});
