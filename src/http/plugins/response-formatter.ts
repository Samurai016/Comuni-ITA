import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { format as formatCSV } from "./formatters/csv";
import { format as formatXML } from "./formatters/xml";
import { format as formatJSON } from "./formatters/json";
import { CommonQuery } from "../query-utils";

export const responseFormatter = fp(async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", async (request: FastifyRequest<{ Querystring: CommonQuery }>, reply: FastifyReply) => {
    const format = request.query.format;

    if (format === "csv") {
      formatCSV(request, reply);
    } else if (format === "xml") {
      formatXML(request, reply);
    } else {
      formatJSON(request, reply);
    }
  });
});
