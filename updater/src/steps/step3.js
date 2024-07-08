import fetch from 'node-fetch';
import { sanitizeCap, sanitizePrefisso, getCoords } from '../utils/utils.js';

// https://query.wikidata.org/#SELECT%20%3Fistat%20%3Fcap%20%3Fprefisso%20%3Fcoordinate%0AWHERE%20%7B%0A%20%20%3Fitem%20p%3AP31%2Fps%3AP31%2Fwdt%3AP279%2a%20wd%3AQ747074.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP635%20%3Fistat.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP281%20%3Fcap.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP473%20%3Fprefisso.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP625%20%3Fcoordinate.%20%7D%0A%20%20%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20%0A%20%20%20%20bd%3AserviceParam%20wikibase%3Alanguage%20"it".%20%0A%20%20%20%20%23%20%3Fitem%20rdfs%3Alabel%20%3FitemLabel.%0A%20%20%7D%0A%7D
export default class Step3 {
    constructor(state, ui, argv) {
        this.state = state;
        this.ui = ui;
        this.argv = argv;
    }

    get name() {
        return "Estrazione dati da Wikidata";
    }

    async run() {
        const url = 'https://query.wikidata.org/sparql?query=SELECT%20%3Fistat%20%3Fcap%20%3Fprefisso%20%3Fcoordinate%0AWHERE%20%7B%0A%20%20%3Fitem%20p%3AP31%2Fps%3AP31%2Fwdt%3AP279%2a%20wd%3AQ747074.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP635%20%3Fistat.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP281%20%3Fcap.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP473%20%3Fprefisso.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP625%20%3Fcoordinate.%20%7D%0A%20%20%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20%0A%20%20%20%20bd%3AserviceParam%20wikibase%3Alanguage%20"it".%20%0A%20%20%20%20%23%20%3Fitem%20rdfs%3Alabel%20%3FitemLabel.%0A%20%20%7D%0A%7D';
        const response = await fetch(url, { headers: { Accept: "text/csv" }, agent: this.state.agent });
        const csv = await response.text();
        const comuniWithProblems = new Map();

        // Create binding map
        const map = new Map();
        const wikiLines = csv.split("\r\n");
        for (let i = 1; i < wikiLines.length; i++) {
            const wikiLine = wikiLines[i].split(",");
            if (!map.has(wikiLine[0])) {
                map.set(wikiLine[0], wikiLine);
            } else {
                // Integrate the information
                const currentData = map.get(wikiLine[0]);
                for (let j = 1; j < currentData.length; j++) {
                    if (currentData[j] === "" && wikiLine[j]) {
                        currentData[j] = wikiLine[j];
                        map.set(currentData[0], currentData);
                    }
                }
            }
        }

        // Binding data
        const comuni = this.state.comuni;
        for (let i = 0; i < comuni.length; i++) {
            const comune = map.get(comuni[i].codice);
            if (comune) {
                comuni[i].cap = sanitizeCap(comune.slice(1, comune.length - 2).join(","));
                comuni[i].prefisso = sanitizePrefisso(comune[comune.length - 2]);
                const coordinate = getCoords(comune[comune.length - 1]);
                comuni[i].lat = coordinate.lat;
                comuni[i].lng = coordinate.lng;
            } else {
                comuniWithProblems.set(i, comuni[i]);
            }
        }
        
        this.state.comuni = comuni;
        this.state.comuniWithProblems = comuniWithProblems;
    }
}