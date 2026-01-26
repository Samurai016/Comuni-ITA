import { Type, Static } from "@sinclair/typebox";

export const CommonQuerySchema = {
  sort: Type.Optional(Type.String()),
  limit: Type.Optional(Type.Integer({ minimum: 1, default: 100 })),
  offset: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
  fields: Type.Optional(Type.String()),
};

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

export function applyPagination<T>(data: T[], limit: number = 100, offset: number = 0): T[] {
  return data.slice(offset, offset + limit);
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
