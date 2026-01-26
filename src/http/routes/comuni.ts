import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { dataset } from "../../data/indexes";
import { Comune, ComuneSchema } from "../../domain/types";
import { normalizeString } from "../../domain/normalization";
import { Static, Type } from "@sinclair/typebox";

// Define query string schema for validation and typing
import { CommonQuerySchema, applyPagination, applyProjection, applySorting } from "../query-utils";

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

const getComuniOpts: RouteShorthandOptions = {
  schema: {
    querystring: ComuniQuerySchema,
    response: {
      200: {
        type: "array",
        items: ComuneSchema,
      },
    },
  },
};

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
  // Filtro per CAP
  if (cap) {
    result = result.filter((c) => c.cap === cap);
  }
  // Filtro per nome
  if (q) {
    const normalizedQ = normalizeString(q);
    result = result.filter((c) => normalizeString(c.nome).includes(normalizedQ) || (c.nomeStraniero && normalizeString(c.nomeStraniero).includes(normalizedQ)));
  }

  return result;
};

const getComuni = (comuni: Comune[], query: ComuniQuery): Partial<Comune>[] => {
  // Filtering
  let result: Partial<Comune>[] = applyFilters(comuni, query);

  // Sorting
  result = applySorting(result, query.sort);

  // Pagination
  result = applyPagination(result, query.limit, query.offset);

  // Projection (field selection)
  result = applyProjection(result, query.fields);

  return result;
};

// Define route handlers
export function comuniRoutes(fastify: FastifyInstance) {
  // GET /comuni
  fastify.get<{ Querystring: ComuniQuery; Reply: Partial<Comune>[] }>("/comuni", getComuniOpts, (request, reply) => {
    const comuni: Comune[] = Array.from(dataset.comuniByCodice.values());
    reply.send(getComuni(comuni, request.query));
  });

  // GET /comuni/:regione
  const comuniByRegioneSchema = {
    schema: {
      params: Type.Object({
        regione: Type.String(),
      }),
      querystring: ComuniQuerySchema,
      response: getComuniOpts.schema?.response,
    },
  };
  fastify.get<{ Params: { regione: string }; Querystring: ComuniQuery; Reply: Partial<Comune>[] }>("/comuni/:regione", comuniByRegioneSchema, (request, reply) => {
    const comuni: Comune[] = dataset.comuni.filter(filterByRegione(request.params.regione));
    reply.send(getComuni(comuni, request.query));
  });

  // GET /comuni/provincia/:provincia
  const comuniByProvinciaSchema = {
    schema: {
      params: Type.Object({
        provincia: Type.String(),
      }),
      querystring: ComuniQuerySchema,
      response: getComuniOpts.schema?.response,
    },
  };
  fastify.get<{ Params: { provincia: string }; Querystring: ComuniQuery; Reply: Partial<Comune>[] }>("/comuni/provincia/:provincia", comuniByProvinciaSchema, (request, reply) => {
    const comuni: Comune[] = dataset.comuni.filter(filterByProvincia(request.params.provincia));
    reply.send(getComuni(comuni, request.query));
  });
}
