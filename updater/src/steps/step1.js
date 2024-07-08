import fetch from 'node-fetch';
import * as xlsx from 'xlsx';
import https from 'https';
import crypto from 'crypto';

export default class Step1 {
    constructor(state, ui, argv) {
        this.state = state;
        this.ui = ui;
        this.argv = argv;
    }

    get name() {
        return "Scaricando l'elenco dei comuni dal sito ISTAT";
    }

    async run() {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        const agent = new https.Agent({
            rejectUnauthorized: false,
            secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
        });
        const response = await fetch("https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.xls", { agent });
        const buffer = await response.arrayBuffer();
        const workbook = xlsx.read(buffer);
        const csv = xlsx.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]).split("\n");

        this.state.agent = agent;
        this.state.csv = csv;
    }
}