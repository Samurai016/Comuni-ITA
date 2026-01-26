// src/http/routes/regioni.ts

import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { dataset } from '../../data/indexes';
import { Regione } from '../../domain/types';

interface RegioniResponse {
  regioni: Regione[];
  count: number;
}

const getRegioniOpts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          regioni: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nome: { type: 'string' },
              },
            },
          },
          count: { type: 'number' },
        },
      },
    },
  },
};

export async function regioniRoutes(fastify: FastifyInstance) {
  fastify.get<{ Reply: RegioniResponse }>('/regioni', getRegioniOpts, async (request, reply) => {
    // For now, no filtering, sorting, or pagination for regioni as per spec
    // All regions are returned.
    const regioni = Array.from(dataset.regioniByNome.values());
    reply.send({ regioni, count: regioni.length });
  });
}
