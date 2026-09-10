import { Comune, ComuneCessato, Provincia } from "../domain/types";
import * as comuniData from "../../data/comuni.json";
import * as comuniCessatiData from "../../data/comuni-cessati.json";
import * as provinceData from "../../data/province.json";
import * as regioniData from "../../data/regioni.json";

interface Dataset {
  comuni: Comune[];
  comuniCessati: ComuneCessato[];
  province: Provincia[];
  regioni: string[];
  // Indexes for efficient lookup
  comuniByCodice: Map<string, Comune>;
  comuniByProvincia: Map<string, Comune[]>;
  comuniByRegione: Map<string, Comune[]>;
  /** Every CAP a comune can be found by, its `capAlternativi` included. */
  comuniByCap: Map<string, Comune[]>;

  // A cessato is an identity, not a comune: the same code, cadastral or ISTAT,
  // can name several of them over the years, so both indexes hold a list.
  comuniCessatiByCodice: Map<string, ComuneCessato[]>;
  comuniCessatiByCodiceCatastale: Map<string, ComuneCessato[]>;

  provinceByCodice: Map<string, Provincia>;
  provinceBySigla: Map<string, Provincia>;
  provinceByRegione: Map<string, Provincia[]>;
}

export const dataset: Dataset = {
  comuni: [],
  comuniCessati: [],
  province: [],
  regioni: [],
  comuniByCodice: new Map(),
  comuniByProvincia: new Map(),
  comuniByRegione: new Map(),
  comuniByCap: new Map(),
  comuniCessatiByCodice: new Map(),
  comuniCessatiByCodiceCatastale: new Map(),
  provinceByCodice: new Map(),
  provinceBySigla: new Map(),
  provinceByRegione: new Map(),
};

/**
 * Appends a value to the list an index keeps for a key, starting the list when
 * the key is a new one.
 * @param index The index to append to.
 * @param key The key the value is indexed by.
 * @param value The value to append.
 */
function push<T>(index: Map<string, T[]>, key: string, value: T) {
  const values = index.get(key);
  if (values) {
    values.push(value);
  } else {
    index.set(key, [value]);
  }
}

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

    // A comune is searchable by any of its CAP, and by the alternative ones too:
    // those are not good enough to be served, but they are good enough to find it.
    for (const cap of new Set([...comune.cap, ...(comune.capAlternativi ?? [])])) {
      if (!dataset.comuniByCap.has(cap)) {
        dataset.comuniByCap.set(cap, []);
      }
      dataset.comuniByCap.get(cap)?.push(comune);
    }

    if (!dataset.comuniByProvincia.has(comune.provincia.codice)) {
      dataset.comuniByProvincia.set(comune.provincia.codice, []);
    }
    dataset.comuniByProvincia.get(comune.provincia.codice)?.push(comune);

    // Assuming we can derive region from province, or it's directly available
    const associatedProvincia = dataset.provinceByCodice.get(comune.provincia.codice);
    if (associatedProvincia) {
      if (!dataset.comuniByRegione.has(associatedProvincia.regione)) {
        dataset.comuniByRegione.set(associatedProvincia.regione, []);
      }
      dataset.comuniByRegione.get(associatedProvincia.regione)?.push(comune);
    }
  });

  // Load comuni cessati
  dataset.comuniCessati = (comuniCessatiData as any).default as ComuneCessato[];
  dataset.comuniCessati.forEach((cessato) => {
    push(dataset.comuniCessatiByCodice, cessato.codice, cessato);
    if (cessato.codiceCatastale) {
      push(dataset.comuniCessatiByCodiceCatastale, cessato.codiceCatastale, cessato);
    }
  });

  console.log(
    `Data loaded: ${dataset.comuni.length} comuni, ${dataset.comuniCessati.length} comuni cessati, ${dataset.province.length} province, ${dataset.regioni.length} regioni`,
  );
}
