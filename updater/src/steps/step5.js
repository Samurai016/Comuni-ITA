import { sanitizeCap, sanitizePrefisso, sanitizeEmail, sanitizeTelefono } from "../utils/utils.js";

export default class Step5 {
    constructor(state, ui, argv) {
        this.state = state;
        this.ui = ui;
        this.argv = argv;
    }

    get name() {
        return "Risoluzione dei conflitti";
    }

    async run() {
        const comuniWithProblems = this.state.comuniWithProblems;
        const comuniNotFound = this.state.comuniNotFound;

        // Nessun comune con problemi
        if (comuniWithProblems.size < 1 && comuniNotFound.length < 1) {
            return;
        }

        // Comuni con problemi
        const comuniWithProblemsKeys = Array.from(comuniWithProblems.keys());
        for (let i = 0; i < comuniWithProblemsKeys.length; i++) {
            const comune = comuniWithProblems.get(comuniWithProblemsKeys[i]);

            const resolved = await this.ui.risolviConflitto(comune);

            this.state.comuni[comuniWithProblemsKeys[i]].cap = sanitizeCap(resolved.cap);
            this.state.comuni[comuniWithProblemsKeys[i]].prefisso = sanitizePrefisso(resolved.prefisso);
            this.state.comuni[comuniWithProblemsKeys[i]].lat = resolved.lat;
            this.state.comuni[comuniWithProblemsKeys[i]].lng = resolved.lng;
        }

        // Comune non trovato
        for (let i = 0; i < comuniNotFound.length; i++) {
            if (comuniNotFound[i].onlyEmails) {
                const resolved = await this.ui.risolviEmailNonTrovata(comuniNotFound[i]);

                const indexComune = comuniNotFound[i].index;
                if (indexComune >= 0) {
                    this.state.comuni[indexComune].email = sanitizeEmail(resolved.email);
                    this.state.comuni[indexComune].pec = sanitizeEmail(resolved.pec);
                } else {
                    console.log(`Comune non trovato (46): ${comuniNotFound[i].nome}`);
                }
            } else {
                const resolved = await this.ui.risolviContattiNonTrovati(comuniNotFound[i]);

                const indexComune = this.state.comuni.findIndex((c) => c.codice.trim().toLowerCase() == resolved.codiceISTAT);
                if (indexComune >= 0) {
                    this.state.comuni[indexComune].email = sanitizeEmail(resolved.email);
                    this.state.comuni[indexComune].pec = sanitizeEmail(resolved.pec);
                    this.state.comuni[indexComune].telefono = sanitizeTelefono(resolved.telefono);
                    this.state.comuni[indexComune].fax = sanitizeTelefono(resolved.fax);
                } else {
                    console.log(`Comune non trovato (58): ${comuniNotFound[i].nome}`);
                }
            }
        }

    }
}