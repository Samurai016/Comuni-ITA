import { FastifyReply, FastifyRequest } from "fastify";
import { CommonQuery } from "../../query-utils";

function toXML(data: any, rootName = "root", childName = "item", rootAttributes?: Record<string, string>): string {
  let xml = "";

  // Stringify attributes
  let attributes = "";
  if (rootAttributes) {
    attributes =
      " " +
      Object.entries(rootAttributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ");
  }

  // Array
  if (Array.isArray(data)) {
    xml += `<${rootName}${attributes}>`;
    xml += data.map((item) => toXML(item, childName)).join("");
    xml += `</${rootName}>`;
    return xml;
  }

  if (typeof data === "object" && data !== null) {
    xml += `<${rootName}${attributes}>`;
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const tagName = key.replace(/[^a-zA-Z0-9_\-]/g, "_");
        xml += toXML(data[key], tagName);
      }
    }
    xml += `</${rootName}>`;
    return xml;
  }

  // Primitive value
  const content = String(data).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

  return `<${rootName}>${content}</${rootName}>`;
}

const ITEM_NAMES: Record<string, string> = {
  comuni: "comune",
  province: "provincia",
  regioni: "regione",
};

function getRootName(request: FastifyRequest<{ Querystring: CommonQuery }>): string {
  return request.routeOptions.url?.split("/")[1] ?? "root"; // /comuni -> comuni, /province -> province, /regioni -> regioni
}

function getItemName(request: FastifyRequest<{ Querystring: CommonQuery }>): string {
  const rootName = getRootName(request);
  return ITEM_NAMES[rootName] ?? "item";
}

function getRootAttributes(request: FastifyRequest<{ Querystring: CommonQuery }>, payload: any): Record<string, string> {
  return {
    total: payload.total.toString(),
    page: payload.page?.toString(),
    pagesize: payload.pagesize?.toString(),
  };
}

/**
 * Format the response as XML
 * @param request Fastify request
 * @param reply Fastify reply
 */
export const format = (request: FastifyRequest<{ Querystring: CommonQuery }>, reply: FastifyReply) => {
  reply.type("application/xml");
  reply.serializer((payload: any) => {
    const rootName = getRootName(request);
    const itemName = getItemName(request);
    const rootAttributes = getRootAttributes(request, payload);
    return `<?xml version="1.0" encoding="UTF-8"?>${toXML(payload.items, rootName, itemName, rootAttributes)}`;
  });
};
