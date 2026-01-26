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

export interface Comune {
  codice: string;
  nome: string;
  nomeStraniero?: string;
  codiceCatastale: string;
  cap: string;
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

export const ComuneSchema = Type.Object({
  codice: Type.Optional(Type.String()),
  nome: Type.Optional(Type.String()),
  nomeStraniero: Type.Optional(Type.String()),
  codiceCatastale: Type.Optional(Type.String()),
  cap: Type.Optional(Type.String()),
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
});
