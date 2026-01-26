// src/http/routes/province.ts

import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { dataset } from '../../data/indexes';
import { Provincia } from '../../domain/types';
import { Static, Type } from '@sinclair/typebox';

// Define query string schema for validation and typing
const ProvinceQuerySchema = Type.Object({
  codice: Type.Optional(Type.String()),
  sigla: Type.Optional(Type.String()),
  regione: Type.Optional(Type.String()),
  sort: Type.Optional(Type.String()),
  limit: Type.Optional(Type.Integer({ minimum: 1, default: 100 })),
  offset: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
  fields: Type.Optional(Type.String()),
});

type ProvinceQuery = Static<typeof ProvinceQuerySchema>;

interface ProvinceResponse {
  province: Provincia[];
  count: number;
  limit: number;
  offset: number;
}

const getProvincesOpts: RouteShorthandOptions = {
  schema: {
    querystring: ProvinceQuerySchema,
    response: {
      200: {
        type: 'object',
        properties: {
          province: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                codice: { type: 'string' },
                nome: { type: 'string' },
                sigla: { type: 'string' },
                regione: { type: 'string' },
              },
            },
          },
          count: { type: 'number' },
          limit: { type: 'number' },
          offset: { type: 'number' },
        },
      },
    },
  },
};

export async function provinceRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: ProvinceQuery; Reply: ProvinceResponse }>(
    '/province',
    getProvincesOpts,
    async (request, reply) => {
      let result: Provincia[] = Array.from(dataset.provinceByCodice.values());

      // Filtering
      const { codice, sigla, regione, sort, limit = 100, offset = 0, fields } = request.query;

      if (codice) {
        result = result.filter((p) => p.codice === codice);
      }
      if (sigla) {
        result = result.filter((p) => p.sigla === sigla);
      }
      if (regione) {
        result = result.filter((p) => p.regione === regione);
      }

      // Sorting
      if (sort) {
        const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
        const isDescending = sort.startsWith('-');
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
      const projectedResult = paginatedResult.map((provincia) => {
        if (!fields) return provincia;
        const selectedFields = fields.split(',').map((f) => f.trim());
        const newProvincia: Partial<Provincia> = {};
        for (const field of selectedFields) {
          if (provincia.hasOwnProperty(field)) {
            (newProvincia as any)[field] = (provincia as any)[field];
          }
        }
        return newProvincia as Provincia;
      });

      reply.send({
        province: projectedResult,
        count: totalCount,
        limit,
        offset,
      });
    }
  );
}
