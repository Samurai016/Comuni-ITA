import { TSchema, Type } from "@sinclair/typebox";

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
 * The versions of the API. The unversioned routes serve v4, the version the
 * API has been serving all along.
 */
export type ApiVersion = "v4" | "v5";

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

/** v4 exposes a single CAP, the one the comune has always been published with. */
export const ComuneSchemaV4 = Type.Object({
  ...ComuneSchemaFields,
  cap: Type.Optional(Type.String()),
});

/** v5 exposes every CAP of the comune, as an array even when there is one. */
export const ComuneSchemaV5 = Type.Object({
  ...ComuneSchemaFields,
  cap: Type.Optional(Type.Array(Type.String())),
});

export const ComuneSchema = (version: ApiVersion) => (version === "v5" ? ComuneSchemaV5 : ComuneSchemaV4);

/**
 * Shapes a comune for the requested version.
 *
 * v4 keeps the field a single string, so that the clients written against it go
 * on working; v5 hands over the whole list. Neither exposes `capAlternativi`,
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
  presented.cap = version === "v5" ? comune.cap : (comune.cap[0] ?? null);
  return presented;
}

/**
 * A comune as it was known during one stretch of its history, closed by the
 * date it stopped being known that way.
 *
 * The archive records an identity, not a place: a comune that was renamed, that
 * moved to another province or that merged into a new one leaves a record
 * behind, and the same comune can therefore appear more than once. `id` is the
 * ANPR identifier of the record and the only field unique to it — `codice` is
 * handed down to unrelated comuni over the years, and `codiceCatastale` is
 * shared by every identity of the same comune.
 *
 * `comuneAttuale` says which of the two happened: when it is set the comune is
 * still there under another name or another province, and when it is `null` the
 * comune was suppressed and nothing carries its cadastral code today.
 */
export interface ComuneCessato {
  /** Identificativo ANPR del record, stabile fra un aggiornamento e l'altro. */
  id: number;
  codice: string;
  nome: string;
  nomeStraniero: string | null;
  /** `null` for the comuni, all of them long gone, that never got one. */
  codiceCatastale: string | null;
  dataIstituzione: string;
  dataCessazione: string;
  provincia: {
    codice: string;
    /** `null` when the province is no longer one the API describes. */
    nome: string | null;
    sigla: string;
    /** `null` for the territories ceded after the war. */
    regione: string | null;
  };
  /** The comune this one lives on as, or `null` when it was suppressed. */
  comuneAttuale: {
    codice: string;
    nome: string;
    codiceCatastale: string;
  } | null;
}

const Nullable = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);

export const ComuneCessatoSchema = Type.Object({
  id: Type.Optional(Type.Integer()),
  codice: Type.Optional(Type.String()),
  nome: Type.Optional(Type.String()),
  nomeStraniero: Type.Optional(Nullable(Type.String())),
  codiceCatastale: Type.Optional(Nullable(Type.String())),
  dataIstituzione: Type.Optional(Type.String({ format: "date" })),
  dataCessazione: Type.Optional(Type.String({ format: "date" })),
  provincia: Type.Optional(
    Type.Object({
      codice: Type.String(),
      nome: Nullable(Type.String()),
      sigla: Type.String(),
      regione: Nullable(Type.String()),
    }),
  ),
  comuneAttuale: Type.Optional(
    Nullable(
      Type.Object({
        codice: Type.String(),
        nome: Type.String(),
        codiceCatastale: Type.String(),
      }),
    ),
  ),
});
