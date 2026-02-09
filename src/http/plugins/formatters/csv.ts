import { FastifyReply, FastifyRequest } from "fastify";

function flattenObject(obj: any, prefix = "", result: any = {}) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
  }
  return result;
}

function toCSV(data: any): string {
  if (!Array.isArray(data)) {
    data = [data];
  }

  if (data.length === 0) {
    return "";
  }

  // Flatten all items
  const flattenedData = data.map((item: any) => flattenObject(item));

  // Get all unique headers
  const headers: string[] = Array.from(new Set(flattenedData.flatMap((item: any) => Object.keys(item))));

  // Build CSV
  const csvRows = [headers.join(",")];

  for (const item of flattenedData) {
    const row = headers.map((header) => {
      const val = item[header];
      if (val === undefined || val === null) return "";
      const stringVal = String(val);
      // Escape quotes and wrap in quotes if contains comma or newline
      if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n")) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    });
    csvRows.push(row.join(","));
  }

  return csvRows.join("\n");
}

/**
 * Format the response as CSV
 * @param request Fastify request
 * @param reply Fastify reply
 */
export const format = (request: FastifyRequest, reply: FastifyReply) => {
  reply.type("text/csv");
  reply.serializer((payload: any) => {
    return toCSV(payload.items);
  });
  return;
};
