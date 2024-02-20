// deno-lint-ignore-file no-explicit-any
import { Formatter, Format } from "./formatters.ts";

export default async function (req: Request, name: string, pluralName: string, handler: () => Promise<Array<any>>) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  };

  const { method } = req;
  if (method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Eseguo handler
    const data = await handler();

    // Creo formatter
    const formatter = new Formatter(name, pluralName);
    formatter.headers = corsHeaders;

    // Ottengo query params
    const url = new URL(req.url);
    const params = url.searchParams;

    // Ottengo formato
    const format = (params.get("format") ?? "json").trim().toLowerCase();

    // Ritorno risposta
    return formatter.format(req, data, format as Format);
  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
}
