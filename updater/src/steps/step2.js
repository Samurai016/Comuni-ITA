import {
  sanitizeRegione,
  sanitizeProvincia,
} from "../utils/utils.js";

export default class Step2 {
  constructor(state, ui, argv) {
    this.state = state;
    this.ui = ui;
    this.argv = argv;
  }

  get name() {
    return "Estrazione dei dati ISTAT";
  }

  async run() {
    const comuni = [];
    const regioni = [];
    const province = new Map();
    const csv = this.state.csv;

    for (let i = 3; i < csv.length; i++) {
      const comune = csv[i].split(",");

      if (comune[5]) {
        const nome = comune[5]?.trim();
        comuni.push({
          nome: nome.indexOf("/") >= 0 ? nome.substring(0, nome.indexOf("/")) : nome,
          nomeStraniero: nome.indexOf("/") >= 0 ? nome.substring(nome.indexOf("/") + 1) : null,
          codice: comune[4]?.trim(),
          codiceCatastale: comune[19]?.trim(),
          regione: sanitizeRegione(comune[10]),
          provincia: sanitizeProvincia(comune[11]),
        });
      }

      // Province
      if (comune[2] && !province.has(comune[2]?.trim())) {
        province.set(comune[2]?.trim(), {
          nome: sanitizeProvincia(comune[11]),
          codice: comune[2]?.trim(),
          sigla: comune[14]?.trim().toUpperCase(),
          regione: sanitizeRegione(comune[10]),
        });
      }

      // Regioni
      if (comune[10] && !regioni.includes(sanitizeRegione(comune[10]))) {
        regioni.push(sanitizeRegione(comune[10]));
      }
    }

    this.state.comuni = comuni;
    this.state.regioni = regioni;
    this.state.province = province;
  }
}