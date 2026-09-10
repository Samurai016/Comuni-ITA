/**
 * Builds `data/comuni-cessati.json` from the ANPR historical archive of comuni.
 *
 * The archive is published by the Ministero dell'Interno at
 * https://www.anagrafenazionale.interno.it/area-tecnica/archivio-storico-dei-comuni/
 * as a single CSV holding one record per validity interval of every comune
 * since the unification: a comune that was renamed, moved to another province
 * or merged away leaves behind a record with `STATO=C` and the dates it was
 * known by that identity.
 *
 * Usage:
 *   npx ts-node scripts/build-comuni-cessati.ts            # scarica l'archivio
 *   npx ts-node scripts/build-comuni-cessati.ts <file.csv> # usa una copia locale
 */
import * as fs from "fs";
import * as path from "path";
import comuniData from "../data/comuni.json";
import provinceData from "../data/province.json";

const ANPR_CSV_URL = "https://www.anagrafenazionale.interno.it/wp-content/uploads/ANPR_archivio_comuni.csv";

/** ANPR marks a comune that never got a cadastral code with this placeholder. */
const CODICE_CATASTALE_ND = "ND";

const DATA_DIR = path.join(__dirname, "..", "data");
const OUTPUT_PATH = path.join(DATA_DIR, "comuni-cessati.json");

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

/**
 * Parses a CSV text into rows of fields.
 *
 * The archive quotes most of its fields and escapes a quote by doubling it, so
 * a hand-rolled reader is enough and keeps the project free of another
 * dependency.
 * @param text The CSV text.
 * @returns The rows, each one an array of fields.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      // A CRLF ends the row on the CR, so the LF that follows is skipped.
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Reads the archive as a list of records keyed by column name.
 * @param text The CSV text.
 * @returns One record per row, header excluded.
 */
function readRecords(text: string): Record<string, string>[] {
  const rows = parseCsv(text.replace(/^﻿/, ""));
  const header = rows[0];
  if (!header) throw new Error("L'archivio ANPR è vuoto.");

  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    header.forEach((column, index) => {
      record[column] = (row[index] ?? "").trim();
    });
    return record;
  });
}

// ---------------------------------------------------------------------------
// Denominazioni
// ---------------------------------------------------------------------------

/**
 * The words a comune name keeps lowercase, articles and prepositions for the
 * most part, including the elided forms the apostrophe splits (`dell'`, `ne'`).
 */
const PAROLE_MINUSCOLE = new Set([
  "a", "ad", "agli", "ai", "al", "all", "alla", "alle", "allo",
  "con", "d", "da", "dagli", "dai", "dal", "dall", "dalla", "dalle", "dallo",
  "de", "degli", "dei", "del", "dell", "della", "delle", "dello", "di",
  "e", "ed", "fra", "gli", "i", "il", "in", "l", "la", "le", "li", "lo",
  "ne", "negli", "nei", "nel", "nell", "nella", "nelle", "per", "presso",
  "su", "sugli", "sui", "sul", "sull", "sulla", "sulle", "sullo", "tra",
]);

/** Roman numerals stay uppercase: `SOTTO IL MONTE GIOVANNI XXIII`. */
const NUMERO_ROMANO = /^[ivxlcdm]+$/;

/**
 * Turns an ANPR denomination, always uppercase, into the casing the rest of the
 * API serves its comuni with.
 *
 * Validated against the 7.894 comuni still active, which the archive and
 * `data/comuni.json` describe both: it reproduces 7.872 of their names. The
 * ones left over are spellings the dataset itself is of two minds about
 * (`Bonate Sopra` against `Boffalora sopra Ticino`), so no rule can settle them.
 * @param denominazione The uppercase denomination.
 * @returns The denomination in mixed case.
 */
function toTitleCase(denominazione: string): string {
  const tokens = denominazione.trim().toLowerCase().split(/([ \-'’/().])/);
  let isFirstWord = true;

  return tokens
    .map((token) => {
      if (token === "" || /^[ \-'’/().]$/.test(token)) return token;

      const capitalized = isFirstWord || !PAROLE_MINUSCOLE.has(token);
      isFirstWord = false;

      if (NUMERO_ROMANO.test(token) && token.length > 1) return token.toUpperCase();
      return capitalized ? token.charAt(0).toUpperCase() + token.slice(1) : token;
    })
    .join("");
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

interface Provincia {
  codice: string;
  nome: string;
  sigla: string;
  regione: string;
}

interface ComuneAttuale {
  codice: string;
  nome: string;
  codiceCatastale: string;
}

interface ComuneCessato {
  id: number;
  codice: string;
  nome: string;
  nomeStraniero: string | null;
  codiceCatastale: string | null;
  dataIstituzione: string;
  dataCessazione: string;
  provincia: {
    codice: string;
    nome: string | null;
    sigla: string;
    regione: string | null;
  };
  comuneAttuale: ComuneAttuale | null;
}

/**
 * Downloads the archive, or reads the copy the caller points at.
 * @param source A path to a local copy, when given.
 * @returns The CSV text.
 */
async function loadArchive(source?: string): Promise<string> {
  if (source) {
    console.log(`Lettura dell'archivio da ${source}...`);
    return fs.readFileSync(source, "utf-8");
  }

  console.log(`Download dell'archivio da ${ANPR_CSV_URL}...`);
  const response = await fetch(ANPR_CSV_URL);
  if (!response.ok) {
    throw new Error(`Download fallito: HTTP ${response.status} ${response.statusText}`);
  }
  return response.text();
}

/**
 * Maps every ISTAT region code the archive uses onto the region name the API
 * serves.
 *
 * The map is read off the comuni still active rather than hardcoded, so that it
 * keeps describing the regions the way `data/province.json` does.
 * @param records Every record of the archive.
 * @param provinceByCodice The province of the API, by ISTAT code.
 * @param provinceBySigla The province of the API, by sigla.
 * @returns The region name for each region code that could be resolved.
 */
function buildRegioniByCodice(
  records: Record<string, string>[],
  provinceByCodice: Map<string, Provincia>,
  provinceBySigla: Map<string, Provincia>,
): Map<string, string> {
  const conteggi = new Map<string, Map<string, number>>();

  for (const record of records) {
    if (record.STATO !== "A") continue;
    const provincia = provinceByCodice.get(record.IDPROVINCIAISTAT) ?? provinceBySigla.get(record.SIGLAPROVINCIA);
    if (!provincia) continue;

    const perRegione = conteggi.get(record.IDREGIONE) ?? new Map<string, number>();
    perRegione.set(provincia.regione, (perRegione.get(provincia.regione) ?? 0) + 1);
    conteggi.set(record.IDREGIONE, perRegione);
  }

  const regioni = new Map<string, string>();
  for (const [codiceRegione, perRegione] of conteggi) {
    const [nome] = [...perRegione.entries()].sort((a, b) => b[1] - a[1])[0];
    regioni.set(codiceRegione, nome);
  }
  return regioni;
}

async function build() {
  const records = readRecords(await loadArchive(process.argv[2]));
  console.log(`Archivio letto: ${records.length} record.`);

  const province = provinceData as Provincia[];
  const provinceByCodice = new Map(province.map((p) => [p.codice, p]));
  const provinceBySigla = new Map(province.map((p) => [p.sigla, p]));
  const regioniByCodice = buildRegioniByCodice(records, provinceByCodice, provinceBySigla);

  // A comune keeps its cadastral code across a rename or a change of province,
  // and no two comuni in force at the same time share one, so it is the only
  // field that ties a closed record to the comune it lives on as. The ISTAT
  // code does not do: it gets handed down to unrelated comuni, which would tie
  // `Arzene`, merged into Valvasone Arzene, to `Basiliano`.
  const attualiByCodiceCatastale = new Map<string, ComuneAttuale>();
  for (const comune of comuniData as { codice: string; nome: string; codiceCatastale: string }[]) {
    attualiByCodiceCatastale.set(comune.codiceCatastale, {
      codice: comune.codice,
      nome: comune.nome,
      codiceCatastale: comune.codiceCatastale,
    });
  }

  const cessati: ComuneCessato[] = [];
  for (const record of records) {
    if (record.STATO !== "C") continue;

    const codiceCatastale = record.CODCATASTALE === CODICE_CATASTALE_ND ? null : record.CODCATASTALE;
    const provincia = provinceByCodice.get(record.IDPROVINCIAISTAT) ?? provinceBySigla.get(record.SIGLAPROVINCIA);

    cessati.push({
      id: Number(record.ID),
      codice: record.CODISTAT,
      nome: toTitleCase(record.DENOMINAZIONE_IT),
      nomeStraniero: record.ALTRADENOMINAZIONE ? toTitleCase(record.ALTRADENOMINAZIONE) : null,
      codiceCatastale,
      dataIstituzione: record.DATAISTITUZIONE,
      dataCessazione: record.DATACESSAZIONE,
      provincia: {
        codice: record.IDPROVINCIAISTAT,
        // The province of a comune ceded after the war, Fiume or Pola among
        // them, is no longer one the API knows: only its sigla survives.
        nome: provincia?.nome ?? null,
        sigla: record.SIGLAPROVINCIA,
        regione: regioniByCodice.get(record.IDREGIONE) ?? null,
      },
      comuneAttuale: codiceCatastale ? (attualiByCodiceCatastale.get(codiceCatastale) ?? null) : null,
    });
  }

  // Alphabetical by name, then oldest identity first, so that the comuni that
  // carried the same name over the years read as the sequence they were.
  cessati.sort((a, b) => a.nome.localeCompare(b.nome, "it") || a.dataCessazione.localeCompare(b.dataCessazione));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(cessati, null, 0));

  const soppressi = cessati.filter((c) => !c.comuneAttuale).length;
  console.log(`Scritti ${cessati.length} comuni cessati in ${OUTPUT_PATH}`);
  console.log(`  ${cessati.length - soppressi} riconducibili a un comune ancora attivo, ${soppressi} senza`);
  console.log(`  ${cessati.filter((c) => !c.provincia.nome).length} senza provincia risolta`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
