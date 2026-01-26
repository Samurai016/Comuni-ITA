import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { dataset } from "../../data/indexes";

const getRegioniOpts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
  },
};

export async function regioniRoutes(fastify: FastifyInstance) {
  // GET /regioni
  fastify.get<{ Reply: string[] }>("/regioni", getRegioniOpts, async (request, reply) => {
    const regioni = Array.from(dataset.regioni);
    reply.send(regioni);
  });
}
