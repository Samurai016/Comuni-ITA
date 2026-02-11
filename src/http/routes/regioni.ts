import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { dataset } from "../../data/indexes";
import { Static, Type } from "@sinclair/typebox";
import { applyPagination, CommonQuery, CommonResponseSchema } from "../query-utils";

const RegioniResponseSchema = CommonResponseSchema(Type.String());
type RegioniResponse = Static<typeof RegioniResponseSchema>;

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

const getRegioni = (province: string[], query: CommonQuery): RegioniResponse => {
  // Sorting
  let result: string[] = province;

  const isDescending = query.sort?.startsWith("-");
  if (isDescending) {
    result.reverse();
  }

  const total = result.length;

  // Pagination
  result = applyPagination(result, query.page, query.pagesize);

  return {
    items: result,
    page: query.page || 1,
    pagesize: query.pagesize || total,
    total: total,
  };
};

export function regioniRoutes(fastify: FastifyInstance) {
  // GET /regioni
  fastify.get<{ Querystring: CommonQuery; Reply: RegioniResponse }>("/regioni", getRegioniOpts, (request, reply) => {
    const regioni: string[] = Array.from(dataset.regioni);
    reply.send(getRegioni(regioni, request.query));
  });
}
