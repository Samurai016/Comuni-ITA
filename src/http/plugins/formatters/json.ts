import { FastifyReply, FastifyRequest } from "fastify";

/**
 * Format the response as JSON
 * @param request Fastify request
 * @param reply Fastify reply
 */
export const format = (request: FastifyRequest, reply: FastifyReply) => {
  reply.type("application/json");
  reply.serializer((payload: any) => {
    // The listing routes expose their items alone; the others, the root among
    // them, carry no `items` and are serialized as they are.
    return JSON.stringify(payload?.items ?? payload);
  });
};
