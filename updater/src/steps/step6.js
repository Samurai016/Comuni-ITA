export default class Step6 {
    constructor(state, ui, argv) {
        this.state = state;
        this.ui = ui;
        this.argv = argv;
    }

    get name() {
        return "Ordinando i dati";
    }

    async run() {
        this.state.comuni = this.state.comuni.sort((a, b) => a.nome.localeCompare(b.nome));
        this.state.province = Array.from(this.state.province.values()).sort((a, b) => Number.parseInt(a.codice) - Number.parseInt(b.codice));
        this.state.regioni = this.state.regioni.sort((a, b) => a.localeCompare(b));
    }
}