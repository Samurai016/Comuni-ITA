import { FastifyReply, FastifyRequest } from "fastify";

/**
 * Format the response as JSON
 * @param request Fastify request
 * @param reply Fastify reply
 */
export const format = (request: FastifyRequest, reply: FastifyReply) => {
  reply.type("application/json");
  reply.serializer((payload: any) => {
    return JSON.stringify(payload.items);
  });
};
