import fs from 'node:fs/promises';

export default class Step7 {
    constructor(state, ui, argv) {
        this.state = state;
        this.ui = ui;
        this.argv = argv;
    }

    get name() {
        return "Applico correzioni al database";
    }

    async run() {
        const correzioniPath = this.argv.correzioni || 'correzioni.json';
        const correzioni = JSON.parse(await fs.readFile(correzioniPath, 'utf-8'));

        if (correzioni.comuni) {
            const correzioniComuni = correzioni.comuni;
            for (let i = 0; i < correzioniComuni.length; i++) {
                const indexComune = this.state.comuni.findIndex((c) => c.codice == correzioniComuni[i].codice);
                if (indexComune >= 0) {
                    this.state.comuni[indexComune] = {
                        ...this.state.comuni[indexComune],
                        ...correzioniComuni[i],
                    };
                } else {
                    console.log(`Comune non trovato: ${correzioniComuni[i].codice}`);   
                }
            }
        }

        if (correzioni.province) {
            const correzioniProvince = correzioni.province;
            for (let i = 0; i < correzioniProvince.length; i++) {
                const indexProvincia = this.state.province.findIndex((c) => c.codice == correzioniProvince[i].codice);
                if (indexProvincia >= 0) {
                    this.state.province[indexProvincia] = {
                        ...this.state.province[indexProvincia],
                        ...correzioniProvince[i],
                    };
                } else {
                    console.log(`Provincia non trovata: ${correzioniProvince[i].codice}`);   
                }
            }
        }
    }
}