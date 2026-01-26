// src/data/indexes.ts

import { Comune, Provincia } from "../domain/types";
import { normalizeString } from "../domain/normalization";
import * as comuniData from "../../data/comuni.json";
import * as provinceData from "../../data/province.json";
import * as regioniData from "../../data/regioni.json";

interface Dataset {
  comuni: Comune[];
  province: Provincia[];
  regioni: string[];
  // Indexes for efficient lookup
  comuniByCodice: Map<string, Comune>;
  comuniByProvincia: Map<string, Comune[]>;
  comuniByRegione: Map<string, Comune[]>;
  comuniByCap: Map<string, Comune[]>;
  comuniByNomeNormalized: Map<string, Comune[]>;

  provinceByCodice: Map<string, Provincia>;
  provinceBySigla: Map<string, Provincia>;
  provinceByRegione: Map<string, Provincia[]>;
}

export const dataset: Dataset = {
  comuni: [],
  province: [],
  regioni: [],
  comuniByCodice: new Map(),
  comuniByProvincia: new Map(),
  comuniByRegione: new Map(),
  comuniByCap: new Map(),
  comuniByNomeNormalized: new Map(),
  provinceByCodice: new Map(),
  provinceBySigla: new Map(),
  provinceByRegione: new Map(),
};

export function loadAndIndexData() {
  console.log("Loading and indexing data...");

  // Load regioni
  dataset.regioni = (regioniData as any).default as string[];

  // Load province
  dataset.province = (provinceData as any).default as Provincia[];
  dataset.province.forEach((provincia) => {
    dataset.provinceByCodice.set(provincia.codice, provincia);
    dataset.provinceBySigla.set(provincia.sigla, provincia);
    if (!dataset.provinceByRegione.has(provincia.regione)) {
      dataset.provinceByRegione.set(provincia.regione, []);
    }
    dataset.provinceByRegione.get(provincia.regione)?.push(provincia);
  });

  // Load comuni
  dataset.comuni = (comuniData as any).default as Comune[];
  dataset.comuni.forEach((comune) => {
    dataset.comuniByCodice.set(comune.codice, comune);

    if (!dataset.comuniByProvincia.has(comune.provincia)) {
      dataset.comuniByProvincia.set(comune.provincia, []);
    }
    dataset.comuniByProvincia.get(comune.provincia)?.push(comune);

    // Assuming we can derive region from province, or it's directly available
    const associatedProvincia = dataset.provinceByCodice.get(comune.provincia);
    if (associatedProvincia) {
      if (!dataset.comuniByRegione.has(associatedProvincia.regione)) {
        dataset.comuniByRegione.set(associatedProvincia.regione, []);
      }
      dataset.comuniByRegione.get(associatedProvincia.regione)?.push(comune);
    }

    const cap = comune.cap;
    if (!dataset.comuniByCap.has(cap)) {
      dataset.comuniByCap.set(cap, []);
    }
    dataset.comuniByCap.get(cap)?.push(comune);

    const normalizedNome = normalizeString(comune.nome);
    if (!dataset.comuniByNomeNormalized.has(normalizedNome)) {
      dataset.comuniByNomeNormalized.set(normalizedNome, []);
    }
    dataset.comuniByNomeNormalized.get(normalizedNome)?.push(comune);

    if (comune.nomeStraniero) {
      const normalizedNomeStraniero = normalizeString(comune.nomeStraniero);
      if (!dataset.comuniByNomeNormalized.has(normalizedNomeStraniero)) {
        dataset.comuniByNomeNormalized.set(normalizedNomeStraniero, []);
      }
      dataset.comuniByNomeNormalized.get(normalizedNomeStraniero)?.push(comune);
    }
  });

  console.log(`Data loaded: ${dataset.comuni.length} comuni, ${dataset.province.length} province, ${dataset.regioni.length} regioni`);
}
