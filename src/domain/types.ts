import { Type } from "@sinclair/typebox";

export interface Provincia {
  codice: string;
  nome: string;
  sigla: string;
  regione: string;
}

export const ProvinceSchema = Type.Object({
  codice: Type.Optional(Type.String()),
  nome: Type.Optional(Type.String()),
  sigla: Type.Optional(Type.String()),
  regione: Type.Optional(Type.String()),
});

/**
 * A comune as the dataset stores it.
 *
 * `cap` always holds every CAP published for the comune, even when there is
 * only one, while `capAlternativi` holds further CAP the comune can be searched
 * by — historical ones for the most part. The latter are never served: they are
 * not reliable enough to describe a comune, but they are good enough to find
 * it.
 */
export interface Comune {
  codice: string;
  nome: string;
  nomeStraniero?: string;
  codiceCatastale: string;
  cap: string[];
  capAlternativi?: string[];
  prefisso: string;
  provincia: Provincia;
  email?: string;
  pec?: string;
  telefono?: string;
  fax?: string;
  popolazione: number;
  coordinate: {
    lat: number;
    lng: number;
  };
}

/**
 * The versions of the API. The unversioned routes serve v1.
 */
export type ApiVersion = "v1" | "v2";

const ComuneSchemaFields = {
  codice: Type.Optional(Type.String()),
  nome: Type.Optional(Type.String()),
  nomeStraniero: Type.Optional(Type.String()),
  codiceCatastale: Type.Optional(Type.String()),
  prefisso: Type.Optional(Type.String()),
  provincia: Type.Optional(ProvinceSchema),
  email: Type.Optional(Type.String()),
  pec: Type.Optional(Type.String()),
  telefono: Type.Optional(Type.String()),
  fax: Type.Optional(Type.String()),
  popolazione: Type.Optional(Type.Number()),
  coordinate: Type.Optional(
    Type.Object({
      lat: Type.Number(),
      lng: Type.Number(),
    }),
  ),
};

/** v1 exposes a single CAP, the one the comune has always been published with. */
export const ComuneSchemaV1 = Type.Object({
  ...ComuneSchemaFields,
  cap: Type.Optional(Type.String()),
});

/** v2 exposes every CAP of the comune, as an array even when there is one. */
export const ComuneSchemaV2 = Type.Object({
  ...ComuneSchemaFields,
  cap: Type.Optional(Type.Array(Type.String())),
});

export const ComuneSchema = (version: ApiVersion) => (version === "v2" ? ComuneSchemaV2 : ComuneSchemaV1);

/**
 * Shapes a comune for the requested version.
 *
 * v1 keeps the field a single string, so that the clients written against it go
 * on working; v2 hands over the whole list. Neither exposes `capAlternativi`,
 * which exists only to widen the search.
 * @param comune The stored comune.
 * @param version The version to serve.
 * @returns The comune as that version describes it.
 */
export function presentComune(comune: Comune, version: ApiVersion) {
  // The fields keep the order the dataset lists them in: `cap` changes shape,
  // not place, so that the CSV columns stay the ones they have always been.
  const presented: Record<string, unknown> = { ...comune };
  delete presented.capAlternativi;
  presented.cap = version === "v2" ? comune.cap : (comune.cap[0] ?? null);
  return presented;
}
