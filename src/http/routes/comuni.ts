import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { dataset } from "../../data/indexes";
import { ApiVersion, Comune, ComuneSchema, presentComune } from "../../domain/types";
import { normalizeString } from "../../domain/normalization";
import { Static, Type } from "@sinclair/typebox";

// Define query string schema for validation and typing
import { CommonQuerySchema, CommonResponseSchema, applyPagination, applyProjection, applySorting } from "../query-utils";

// Define query string schema for validation and typing
const ComuniQuerySchema = Type.Object({
  codice: Type.Optional(Type.String()),
  codiceCatastale: Type.Optional(Type.String()),
  prefisso: Type.Optional(Type.String()),
  provincia: Type.Optional(Type.String()),
  regione: Type.Optional(Type.String()),
  cap: Type.Optional(Type.String()),
  q: Type.Optional(Type.String()),
  ...CommonQuerySchema,
});
type ComuniQuery = Static<typeof ComuniQuerySchema>;

const ComuniResponseSchema = (version: ApiVersion) => CommonResponseSchema(ComuneSchema(version));
type ComuniResponse = Static<ReturnType<typeof ComuniResponseSchema>>;

const getComuniOpts = (version: ApiVersion): RouteShorthandOptions => ({
  schema: {
    querystring: ComuniQuerySchema,
    response: {
      200: {
        type: "array",
        items: ComuneSchema(version),
      },
    },
  },
});

// Define filter functions
const filterByRegione = (regione: string) => {
  const sanitizedRegione = normalizeString(regione);
  return (c: Comune) => {
    return normalizeString(c.provincia.regione) === sanitizedRegione;
  };
};

const filterByProvincia = (provincia: string) => {
  const sanitizedProvincia = normalizeString(provincia);
  return (c: Comune) => normalizeString(c.provincia.nome) === sanitizedProvincia;
};

const applyFilters = (result: Comune[], query: ComuniQuery) => {
  const { codice, codiceCatastale, prefisso, provincia, regione, cap, q } = query;

  // Filtro per codice
  if (codice) {
    result = result.filter((c) => c.codice === codice);
  }
  // Filtro per codice catastale
  if (codiceCatastale) {
    result = result.filter((c) => c.codiceCatastale === codiceCatastale);
  }
  // Filtro per prefisso telefonico
  if (prefisso) {
    result = result.filter((c) => c.prefisso === prefisso);
  }
  // Filtro per nome provincia
  if (provincia) {
    result = result.filter(filterByProvincia(provincia));
  }
  // Filtro per nome regione
  if (regione) {
    result = result.filter(filterByRegione(regione));
  }
  // Filtro per CAP: un comune corrisponde se il CAP è fra i suoi, anche quando
  // non è quello principale.
  if (cap) {
    const matching = new Set(dataset.comuniByCap.get(cap) ?? []);
    result = result.filter((c) => matching.has(c));
  }
  // Filtro per nome
  if (q) {
    const normalizedQ = normalizeString(q);
    result = result.filter((c) => normalizeString(c.nome).includes(normalizedQ) || (c.nomeStraniero && normalizeString(c.nomeStraniero).includes(normalizedQ)));
  }

  return result;
};

const getComuni = (comuni: Comune[], query: ComuniQuery, version: ApiVersion): ComuniResponse => {
  // Filtering
  const filtered = applyFilters(comuni, query);

  // Shaping: from here on the comune is the one the requested version exposes,
  // so that sorting and projection see the same fields the client does.
  let result: Partial<Comune>[] = filtered.map((c) => presentComune(c, version)) as Partial<Comune>[];

  // Sorting
  result = applySorting(result, query.sort);

  const total = result.length;

  // Pagination
  result = applyPagination(result, query.page, query.pagesize);

  // Projection (field selection)
  result = applyProjection(result, query.fields);

  return {
    items: result,
    page: query.page,
    pagesize: query.pagesize || total,
    total: total,
  };
};

/**
 * Registers the comuni routes on an instance.
 *
 * The same routes are served once per version: the shape of `cap` is the only
 * thing that changes, so the whole version lives in `presentComune`.
 * @param fastify The instance the routes are registered on.
 * @param options The version the instance serves, `v1` when unspecified.
 */
export function comuniRoutes(fastify: FastifyInstance, options: { version?: ApiVersion } = {}) {
  const version: ApiVersion = options.version ?? "v1";

  // GET /comuni
  fastify.get<{ Querystring: ComuniQuery; Reply: ComuniResponse }>("/comuni", getComuniOpts(version), (request, reply) => {
    const comuni: Comune[] = Array.from(dataset.comuniByCodice.values());
    reply.send(getComuni(comuni, request.query, version));
  });

  // GET /comuni/:regione
  const comuniByRegioneSchema = {
    schema: {
      params: Type.Object({
        regione: Type.String(),
      }),
      querystring: ComuniQuerySchema,
      response: getComuniOpts(version).schema?.response,
    },
  };
  fastify.get<{ Params: { regione: string }; Querystring: ComuniQuery; Reply: ComuniResponse }>("/comuni/:regione", comuniByRegioneSchema, (request, reply) => {
    const comuni: Comune[] = dataset.comuni.filter(filterByRegione(request.params.regione));
    reply.send(getComuni(comuni, request.query, version));
  });

  // GET /comuni/provincia/:provincia
  const comuniByProvinciaSchema = {
    schema: {
      params: Type.Object({
        provincia: Type.String(),
      }),
      querystring: ComuniQuerySchema,
      response: getComuniOpts(version).schema?.response,
    },
  };
  fastify.get<{ Params: { provincia: string }; Querystring: ComuniQuery; Reply: ComuniResponse }>("/comuni/provincia/:provincia", comuniByProvinciaSchema, (request, reply) => {
    const comuni: Comune[] = dataset.comuni.filter(filterByProvincia(request.params.provincia));
    reply.send(getComuni(comuni, request.query, version));
  });
}
