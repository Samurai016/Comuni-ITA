// src/domain/types.ts

export interface Comune {
  codice: string;
  nome: string;
  nomeStraniero?: string;
  codiceCatastale: string;
  cap: string;
  prefisso: string;
  lat: number;
  lng: number;
  provincia: string; // FK -> provincia.codice
  email?: string;
  pec?: string;
  telefono?: string;
  fax?: string;
  popolazione?: number;
}

export interface Provincia {
  codice: string;
  nome: string;
  sigla: string;
  regione: string; // FK -> regione.nome
}
