import { Type, Static } from "@sinclair/typebox";

export const CommonQuerySchema = {
  sort: Type.Optional(Type.String()),
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  pagesize: Type.Optional(Type.Integer({ minimum: 1 })),
  fields: Type.Optional(Type.String()),
  format: Type.Optional(Type.Union([Type.Literal("json"), Type.Literal("csv"), Type.Literal("xml")])),
};

const CommonQuerySchemaType = Type.Object(CommonQuerySchema);
export type CommonQuery = Static<typeof CommonQuerySchemaType>;

export const CommonResponseSchema = (itemSchema: any) =>
  Type.Object({
    items: Type.Array(itemSchema),
    page: Type.Optional(Type.Integer()),
    pagesize: Type.Optional(Type.Integer()),
    total: Type.Integer(),
  });
const CommonResponseSchemaType = CommonResponseSchema(Type.Any());
export type CommonResponse = Static<typeof CommonResponseSchemaType>;

export function applySorting<T>(data: T[], sort: string | undefined): T[] {
  if (!sort) return data;

  const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
  const isDescending = sort.startsWith("-");

  return [...data].sort((a, b) => {
    const aValue = (a as any)[sortField];
    const bValue = (b as any)[sortField];
    if (aValue < bValue) return isDescending ? 1 : -1;
    if (aValue > bValue) return isDescending ? -1 : 1;
    return 0;
  });
}

export function applyPagination<T>(data: T[], page: number = 1, pagesize?: number): T[] {
  if (pagesize === null || pagesize === undefined) return data;
  const offset = (page - 1) * pagesize;
  return data.slice(offset, offset + pagesize);
}

export function applyProjection<T extends object>(data: T[], fields: string | undefined): Partial<T>[] {
  if (!fields) return data;

  const selectedFields = fields.split(",").map((f) => f.trim());

  return data.map((item) => {
    const newItem: Partial<T> = {};
    for (const field of selectedFields) {
      if (Object.prototype.hasOwnProperty.call(item, field)) {
        (newItem as any)[field] = (item as any)[field];
      }
    }
    return newItem;
  });
}
