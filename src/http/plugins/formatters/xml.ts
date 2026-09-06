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
        const value = data[key];
        // A multi-valued field, the CAP of v2, becomes a repeated element,
        // <cap>20121</cap><cap>20122</cap>, rather than an anonymous wrapper.
        xml += Array.isArray(value) ? value.map((item) => toXML(item, tagName)).join("") : toXML(value, tagName);
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

const VERSION_SEGMENT = /^v\d+$/;

function getRootName(request: FastifyRequest<{ Querystring: CommonQuery }>): string {
  // /comuni -> comuni, /province -> province, /regioni -> regioni,
  // e lo stesso sulle rotte versionate: /v2/comuni -> comuni.
  const segments = (request.routeOptions.url ?? "").split("/").filter(Boolean);
  const first = segments[0];
  return (VERSION_SEGMENT.test(first ?? "") ? segments[1] : first) ?? "root";
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
