// src/http/routes/comuni.ts

import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { dataset } from "../../data/indexes";
import { Comune } from "../../domain/types";
import { normalizeString } from "../../domain/normalization";
import { Static, Type } from "@sinclair/typebox";

// Define query string schema for validation and typing
const ComuniQuerySchema = Type.Object({
  codice: Type.Optional(Type.String()),
  provincia: Type.Optional(Type.String()),
  regione: Type.Optional(Type.String()),
  cap: Type.Optional(Type.String()),
  q: Type.Optional(Type.String()),
  sort: Type.Optional(Type.String()),
  limit: Type.Optional(Type.Integer({ minimum: 1, default: 100 })),
  offset: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
  fields: Type.Optional(Type.String()),
});

type ComuniQuery = Static<typeof ComuniQuerySchema>;

const getComuniOpts: RouteShorthandOptions = {
  schema: {
    querystring: ComuniQuerySchema,
    response: {
      200: {
        type: "array",
        items: {
          type: "object",
          properties: {
            codice: { type: "string" },
            nome: { type: "string" },
            nomeStraniero: { type: "string" },
            codiceCatastale: { type: "string" },
            cap: { type: "string" },
            prefisso: { type: "string" },
            lat: { type: "number" },
            lng: { type: "number" },
            provincia: { type: "string" },
            email: { type: "string" },
            pec: { type: "string" },
            telefono: { type: "string" },
            fax: { type: "string" },
            popolazione: { type: "number" },
          },
        },
      },
    },
  },
};

export async function comuniRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: ComuniQuery; Reply: Comune[] }>("/comuni", getComuniOpts, async (request, reply) => {
    let result: Comune[] = Array.from(dataset.comuniByCodice.values());

    // Filtering
    const { codice, provincia, regione, cap, q, sort, limit = Number.MAX_SAFE_INTEGER, offset = 0, fields } = request.query;

    if (codice) {
      result = result.filter((c) => c.codice === codice);
    }
    if (provincia) {
      result = result.filter((c) => c.provincia === provincia);
    }
    if (regione) {
      result = result.filter((c) => {
        const associatedProvincia = dataset.provinceByCodice.get(c.provincia);
        return associatedProvincia && associatedProvincia.regione === regione;
      });
    }
    if (cap) {
      result = result.filter((c) => c.cap === cap);
    }
    if (q) {
      const normalizedQ = normalizeString(q);
      result = result.filter((c) => normalizeString(c.nome).includes(normalizedQ) || (c.nomeStraniero && normalizeString(c.nomeStraniero).includes(normalizedQ)));
    }

    // Sorting
    if (sort) {
      const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
      const isDescending = sort.startsWith("-");
      result.sort((a, b) => {
        const aValue = (a as any)[sortField];
        const bValue = (b as any)[sortField];
        if (aValue < bValue) return isDescending ? 1 : -1;
        if (aValue > bValue) return isDescending ? -1 : 1;
        return 0;
      });
    }

    const totalCount = result.length;
    // Pagination
    const paginatedResult = result.slice(offset, offset + limit);

    // Projection (field selection)
    const projectedResult = paginatedResult.map((comune) => {
      if (!fields) return comune;
      const selectedFields = fields.split(",").map((f) => f.trim());
      const newComune: Partial<Comune> = {};
      for (const field of selectedFields) {
        if (comune.hasOwnProperty(field)) {
          (newComune as any)[field] = (comune as any)[field];
        }
      }
      return newComune as Comune;
    });

    reply.send(projectedResult);
  });

  // GET /comuni/:regione
  fastify.get<{ Params: { regione: string }; Querystring: ComuniQuery; Reply: Comune[] }>(
    "/comuni/:regione",
    {
      schema: {
        params: Type.Object({
          regione: Type.String(),
        }),
        querystring: ComuniQuerySchema,
        response: getComuniOpts.schema?.response,
      },
    },
    async (request, reply) => {
      const { regione } = request.params;
      const { sort, limit = 100, offset = 0, fields } = request.query;

      let result: Comune[] = dataset.comuni.filter((c) => {
        const associatedProvincia = dataset.provinceByCodice.get(c.provincia);
        return associatedProvincia && associatedProvincia.regione === regione;
      });

      // Sorting
      if (sort) {
        const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
        const isDescending = sort.startsWith("-");
        result.sort((a, b) => {
          const aValue = (a as any)[sortField];
          const bValue = (b as any)[sortField];
          if (aValue < bValue) return isDescending ? 1 : -1;
          if (aValue > bValue) return isDescending ? -1 : 1;
          return 0;
        });
      }

      const totalCount = result.length;
      const paginatedResult = result.slice(offset, offset + limit);

      const projectedResult = paginatedResult.map((comune) => {
        if (!fields) return comune;
        const selectedFields = fields.split(",").map((f) => f.trim());
        const newComune: Partial<Comune> = {};
        for (const field of selectedFields) {
          if (comune.hasOwnProperty(field)) {
            (newComune as any)[field] = (comune as any)[field];
          }
        }
        return newComune as Comune;
      });

      reply.send(projectedResult);
    },
  );

  // GET /comuni/provincia/:provincia
  fastify.get<{ Params: { provincia: string }; Querystring: ComuniQuery; Reply: Comune[] }>(
    "/comuni/provincia/:provincia",
    {
      schema: {
        params: Type.Object({
          provincia: Type.String(),
        }),
        querystring: ComuniQuerySchema,
        response: getComuniOpts.schema?.response,
      },
    },
    async (request, reply) => {
      const { provincia } = request.params;
      const { sort, limit = 100, offset = 0, fields } = request.query;

      let result: Comune[] = dataset.comuni.filter((c) => c.provincia === provincia);

      // Sorting
      if (sort) {
        const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
        const isDescending = sort.startsWith("-");
        result.sort((a, b) => {
          const aValue = (a as any)[sortField];
          const bValue = (b as any)[sortField];
          if (aValue < bValue) return isDescending ? 1 : -1;
          if (aValue > bValue) return isDescending ? -1 : 1;
          return 0;
        });
      }

      const totalCount = result.length;
      const paginatedResult = result.slice(offset, offset + limit);

      const projectedResult = paginatedResult.map((comune) => {
        if (!fields) return comune;
        const selectedFields = fields.split(",").map((f) => f.trim());
        const newComune: Partial<Comune> = {};
        for (const field of selectedFields) {
          if (comune.hasOwnProperty(field)) {
            (newComune as any)[field] = (comune as any)[field];
          }
        }
        return newComune as Comune;
      });

      reply.send(projectedResult);
    },
  );
}
