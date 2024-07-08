import fetch from "node-fetch";
import { parse } from 'node-html-parser';
import { sanitizeEmail, sanitizeName, sanitizeTelefono } from "../utils/utils.js";

export default class Step4 {
    constructor(state, ui, argv) {
        this.state = state;
        this.ui = ui;
        this.argv = argv;
    }

    get name() {
        return "Aggiornamento dei contatti dal Ministero dell'Interno";
    }

    async run() {
        const comuni = this.state.comuni;
        const url = "https://dait.interno.gov.it/territorio-e-autonomie-locali/sut/elenco_contatti_comuni_italiani.php";
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36 OPR/89.0.4447.48",
            },
            agent: this.state.agent,
        });
        const htmlString = await response.text();

        const comuniNotFound = [];
        const html = parse(htmlString);
        const rows = html.querySelectorAll("table tbody tr");

        // Binding data
        const provinceValues = Array.from(this.state.province.values());
        const comuniSanitized = comuni.map(function (c) {
            return {
                nome: sanitizeName(c.nome.trim().toLowerCase()),
                provincia: provinceValues.find((p) => p.nome === c.provincia)?.sigla.toLowerCase(),
            };
        });

        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll("td");
            const bindings = {
                numero: cells[0].textContent.trim(),
                nome: cells[1].textContent.trim(),
                indirizzo: cells[2].textContent.trim(),
                provincia: cells[3].textContent.trim(),
                email: cells[4].textContent.trim(),
                pec: cells[5].textContent.trim(),
                telefono: cells[6].textContent.trim(),
                fax: cells[7].textContent.trim(),
            };
            const provincia = bindings.provincia.toLowerCase();

            let nome = bindings.nome.toLowerCase();
            if (nome.includes("/")) nome = nome.split("/")[0];
            nome = sanitizeName(nome);

            let indexOfComune = comuniSanitized.findIndex((c) => c.nome === nome && c.provincia === provincia);
            if (indexOfComune < 0) {
                indexOfComune = comuniSanitized.findIndex((c) => new RegExp(`^${nome}`).exec(c.nome) && c.provincia === provincia);
            }

            if (indexOfComune >= 0) {
                const comune = this.state.comuni[indexOfComune];
                comune.email = sanitizeEmail(bindings.email.split(" ")[0]);
                comune.pec = sanitizeEmail(bindings.pec);
                comune.telefono = sanitizeTelefono(bindings.telefono);
                comune.fax = sanitizeTelefono(bindings.fax);

                if ((comune.email && !comune.email.includes("@")) || (comune.pec && !comune.pec.includes("@"))) {
                    comuniNotFound.push({
                        index: indexOfComune,
                        nome: bindings.nome,
                        indirizzo: bindings.indirizzo,
                        provincia: bindings.provincia,
                        rawEmail: bindings.email,
                        rawPec: bindings.pec,
                        onlyEmails: true,
                    });
                }
            } else {
                comuniNotFound.push({
                    nome: bindings.nome,
                    indirizzo: bindings.indirizzo,
                    provincia: bindings.provincia,
                    onlyEmails: false,
                });
            }

            this.state.comuniNotFound = comuniNotFound;
        }
    }
}