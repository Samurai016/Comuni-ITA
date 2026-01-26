import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { dataset } from "../../data/indexes";
import { Provincia, ProvinceSchema } from "../../domain/types";
import { Static, Type } from "@sinclair/typebox";
import { CommonQuerySchema, applyPagination, applyProjection, applySorting } from "../query-utils";
import { normalizeString } from "../../domain/normalization";

// Define query string schema for validation and typing
const ProvinceQuerySchema = Type.Object({
  codice: Type.Optional(Type.String()),
  sigla: Type.Optional(Type.String()),
  regione: Type.Optional(Type.String()),
  ...CommonQuerySchema,
});

type ProvinceQuery = Static<typeof ProvinceQuerySchema>;

const getProvincesOpts: RouteShorthandOptions = {
  schema: {
    querystring: ProvinceQuerySchema,
    response: {
      200: {
        type: "array",
        items: ProvinceSchema,
      },
    },
  },
};

// Filter functions
const filterByRegione = (regione: string) => {
  const sanitizedRegione = normalizeString(regione);
  return (c: Provincia) => {
    return normalizeString(c.regione) === sanitizedRegione;
  };
};

const applyFilters = (result: Provincia[], query: ProvinceQuery) => {
  const { codice, sigla, regione } = query;

  if (codice) {
    result = result.filter((p) => p.codice === codice);
  }
  if (sigla) {
    result = result.filter((p) => p.sigla === sigla);
  }
  if (regione) {
    result = result.filter(filterByRegione(regione));
  }

  return result;
};

const getProvince = (province: Provincia[], query: ProvinceQuery): Partial<Provincia>[] => {
  // Filtering
  let result: Partial<Provincia>[] = applyFilters(province, query);

  // Sorting
  result = applySorting(result, query.sort);

  // Pagination
  result = applyPagination(result, query.limit, query.offset);

  // Projection (field selection)
  result = applyProjection(result, query.fields);

  return result;
};

export function provinceRoutes(fastify: FastifyInstance) {
  // GET /province
  fastify.get<{ Querystring: ProvinceQuery; Reply: Partial<Provincia>[] }>("/province", getProvincesOpts, (request, reply) => {
    const province: Provincia[] = Array.from(dataset.provinceByCodice.values());
    reply.send(getProvince(province, request.query));
  });

  // GET /province/:regione
  const provinceByRegioneSchema = {
    schema: {
      params: Type.Object({
        regione: Type.String(),
      }),
      querystring: ProvinceQuerySchema,
      response: getProvincesOpts.schema?.response,
    },
  };
  fastify.get<{ Params: { regione: string }; Querystring: ProvinceQuery; Reply: Partial<Provincia>[] }>("/province/:regione", provinceByRegioneSchema, (request, reply) => {
    const province: Provincia[] = dataset.province.filter(filterByRegione(request.params.regione));
    reply.send(getProvince(province, request.query));
  });
}
