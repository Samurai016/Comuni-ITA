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

        for (let i = 0; i < correzioni.length; i++) {
            const indexComune = this.state.comuni.findIndex((c) => c.codice == correzioni[i].codice);
            if (indexComune >= 0) {
                this.state.comuni[indexComune] = {
                    ...this.state.comuni[indexComune],
                    ...correzioni[i],
                };
            } else {
                console.log(`Comune non trovato: ${correzioni[i].codice}`);   
            }
        }
    }
}