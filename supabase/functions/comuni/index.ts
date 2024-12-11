// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import requestHandler from "../requestHandler.ts";

serve(async (req) => {
  return await requestHandler(req, "comune", "comuni", async () => {
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");

    // Ottengo query params
    const url = new URL(req.url);
    const params = url.searchParams;

    // Match regione
    const regioniPattern = new URLPattern({ pathname: "/comuni/:regione" });
    const regioniMatch = regioniPattern.exec(req.url);
    const regione = regioniMatch ? regioniMatch.pathname.groups.regione : null;

    // Match provincia
    const provincePattern = new URLPattern({ pathname: "/comuni/provincia/:provincia" });
    const provinceMatch = provincePattern.exec(req.url);
    const provincia = provinceMatch ? provinceMatch.pathname.groups.provincia : null;

    // Creo query
    let query = supabaseClient.from("comuni").select("*, provincia!inner(*, regione!inner(nome))");

    // Filtri
    if (regione) {
      query = query.ilike("provincia.regione.nome", decodeURI(regione.toLowerCase()));
    } else if (provincia) {
      query = query.ilike("provincia.nome", decodeURI(provincia.toLowerCase()));
    }

    if (params.has("nome")) {
      query = query.ilike("nome", `%${params.get("nome")}%`);
    }
    if (params.has("codice")) {
      query = query.eq("codice", `${params.get("codice")}`);
    }
    if (params.has("codiceCatastale")) {
      query = query.ilike("codiceCatastale", `${params.get("codiceCatastale")}`);
    }
    if (params.has("cap")) {
      query = query.eq("cap", `${params.get("cap")}`);
    }

    // Sort by nome
    query = query.order("nome", { ascending: true });

    // Parametri mapping
    const isOnlyNome = params.has("onlyname");
    const isOnlyNomeStraniero = params.has("onlyforeignname");

    const response = await query;
    if (response.error) throw response.error;

    const comuni = response.data.map((comune: any) => {
      if (isOnlyNome) return comune.nome;
      if (isOnlyNomeStraniero) return comune.nomeStraniero || comune.nome;

      comune.coordinate = {
        lat: comune.lat,
        lng: comune.lng,
      };
      delete comune.lat;
      delete comune.lng;

      comune.provincia.regione = comune.provincia.regione.nome;
      
      return comune;
    });

    return comuni;
  });
});
