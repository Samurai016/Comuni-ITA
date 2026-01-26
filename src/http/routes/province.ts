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

const filterByRegione = (regione: string) => {
  const sanitizedRegione = normalizeString(regione);
  return (c: Provincia) => {
    return normalizeString(c.regione) === sanitizedRegione;
  };
};

const applyFilter = (result: Provincia[], query: ProvinceQuery) => {
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

export function provinceRoutes(fastify: FastifyInstance) {
  // GET /province
  fastify.get<{ Querystring: ProvinceQuery; Reply: Provincia[] }>("/province", getProvincesOpts, (request, reply) => {
    let result: Provincia[] = Array.from(dataset.provinceByCodice.values());

    // Filtering
    result = applyFilter(result, request.query);

    // Sorting
    result = applySorting(result, request.query.sort);

    // Pagination
    result = applyPagination(result, request.query.limit, request.query.offset);

    // Projection (field selection)
    const projectedResult = applyProjection(result, request.query.fields);

    reply.send(projectedResult as Provincia[]);
  });

  // GET /province/:regione
  fastify.get<{ Params: { regione: string }; Querystring: ProvinceQuery; Reply: Provincia[] }>(
    "/province/:regione",
    {
      schema: {
        params: Type.Object({
          regione: Type.String(),
        }),
        querystring: ProvinceQuerySchema,
        response: getProvincesOpts.schema?.response,
      },
    },
    (request, reply) => {
      const { regione } = request.params;

      let result: Provincia[] = dataset.province.filter(filterByRegione(regione));

      // Filtering
      result = applyFilter(result, request.query);

      // Sorting
      result = applySorting(result, request.query.sort);

      // Pagination
      result = applyPagination(result, request.query.limit, request.query.offset);

      // Projection (field selection)
      const projectedResult = applyProjection(result, request.query.fields);

      reply.send(projectedResult as Provincia[]);
    },
  );
}
