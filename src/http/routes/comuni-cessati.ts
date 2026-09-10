import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { dataset } from "../../data/indexes";
import { ComuneCessato, ComuneCessatoSchema } from "../../domain/types";
import { normalizeString } from "../../domain/normalization";
import { Static, Type } from "@sinclair/typebox";
import { CommonQuerySchema, CommonResponseSchema, applyPagination, applyProjection, applySorting } from "../query-utils";

// Define query string schema for validation and typing
const ComuniCessatiQuerySchema = Type.Object({
  codice: Type.Optional(Type.String()),
  codiceCatastale: Type.Optional(Type.String()),
  provincia: Type.Optional(Type.String()),
  regione: Type.Optional(Type.String()),
  cessatoDal: Type.Optional(Type.String()),
  cessatoAl: Type.Optional(Type.String()),
  soppresso: Type.Optional(Type.Boolean()),
  q: Type.Optional(Type.String()),
  ...CommonQuerySchema,
});
type ComuniCessatiQuery = Static<typeof ComuniCessatiQuerySchema>;

const ComuniCessatiResponseSchema = CommonResponseSchema(ComuneCessatoSchema);
type ComuniCessatiResponse = Static<typeof ComuniCessatiResponseSchema>;

const getComuniCessatiOpts: RouteShorthandOptions = {
  schema: {
    querystring: ComuniCessatiQuerySchema,
    response: {
      200: {
        type: "array",
        items: ComuneCessatoSchema,
      },
    },
  },
};

// Define filter functions

/**
 * Matches a province by name or by sigla.
 *
 * The name of a province that no longer exists is not one the API can hand
 * back, so for a good part of the archive the sigla is all there is to ask by.
 * @param provincia The name or the sigla to match.
 * @returns The predicate.
 */
const filterByProvincia = (provincia: string) => {
  const sanitizedProvincia = normalizeString(provincia);
  return (c: ComuneCessato) =>
    normalizeString(c.provincia.sigla) === sanitizedProvincia || (!!c.provincia.nome && normalizeString(c.provincia.nome) === sanitizedProvincia);
};

const filterByRegione = (regione: string) => {
  const sanitizedRegione = normalizeString(regione);
  return (c: ComuneCessato) => !!c.provincia.regione && normalizeString(c.provincia.regione) === sanitizedRegione;
};

const applyFilters = (result: ComuneCessato[], query: ComuniCessatiQuery) => {
  const { codice, codiceCatastale, provincia, regione, cessatoDal, cessatoAl, soppresso, q } = query;

  // Filtro per codice ISTAT
  if (codice) {
    const matching = new Set(dataset.comuniCessatiByCodice.get(codice) ?? []);
    result = result.filter((c) => matching.has(c));
  }
  // Filtro per codice catastale
  if (codiceCatastale) {
    const matching = new Set(dataset.comuniCessatiByCodiceCatastale.get(codiceCatastale.toUpperCase()) ?? []);
    result = result.filter((c) => matching.has(c));
  }
  // Filtro per nome o sigla della provincia
  if (provincia) {
    result = result.filter(filterByProvincia(provincia));
  }
  // Filtro per nome regione
  if (regione) {
    result = result.filter(filterByRegione(regione));
  }
  // Filtro per data di cessazione: le date sono ISO, quindi si confrontano come
  // stringhe.
  if (cessatoDal) {
    result = result.filter((c) => c.dataCessazione >= cessatoDal);
  }
  if (cessatoAl) {
    result = result.filter((c) => c.dataCessazione <= cessatoAl);
  }
  // Filtro per soppressione: `soppresso=true` tiene solo i comuni che non
  // sopravvivono in nessun comune attuale.
  if (soppresso !== undefined) {
    result = result.filter((c) => (c.comuneAttuale === null) === soppresso);
  }
  // Filtro per nome
  if (q) {
    const normalizedQ = normalizeString(q);
    result = result.filter((c) => normalizeString(c.nome).includes(normalizedQ) || (!!c.nomeStraniero && normalizeString(c.nomeStraniero).includes(normalizedQ)));
  }

  return result;
};

const getComuniCessati = (comuniCessati: ComuneCessato[], query: ComuniCessatiQuery): ComuniCessatiResponse => {
  // Filtering
  let result: Partial<ComuneCessato>[] = applyFilters(comuniCessati, query);

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
 * Registers the comuni cessati route on an instance.
 *
 * The route is served by v5 alone: v4 is the API as it has always been, and
 * nothing new is added to it.
 * @param fastify The instance the route is registered on.
 */
export function comuniCessatiRoutes(fastify: FastifyInstance) {
  // GET /comuni/cessati
  // Il segmento statico ha la precedenza su /comuni/:regione, che resta la
  // rotta di ogni altro valore.
  fastify.get<{ Querystring: ComuniCessatiQuery; Reply: ComuniCessatiResponse }>("/comuni/cessati", getComuniCessatiOpts, (request, reply) => {
    reply.send(getComuniCessati(dataset.comuniCessati, request.query));
  });
}
