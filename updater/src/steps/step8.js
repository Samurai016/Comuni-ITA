import fs from 'node:fs/promises';
import knex from 'knex';

export default class Step8 {
    constructor(state, ui, argv) {
        this.state = state;
        this.ui = ui;
        this.argv = argv;
    }

    get name() {
        return "Aggiornamento del database";
    }

    async run() {
        const exportMode = this.argv.export || 'sql';
        if (exportMode == 'json') {
            await this._exportJSON();
            return;
        }

        const sql = await this._generateSQL();

        switch (exportMode) {
            case 'db':
                await this._executeSQL(sql);
                break;
            case 'sql':
                await this._exportSQL(sql);
                break;
        }
    }

    async _exportJSON() {
        const timestamp = new Date().getTime();
        await fs.writeFile(`backup-comuni-ita-${timestamp}.json`, JSON.stringify({
            comuni: this.state.comuni,
            province: Array.from(this.state.province.values()),
            regioni: Array.from(this.state.regioni.values())
        }, null, 2));
    }

    async _generateSQL() {
        const sql = [];
        const queryBuilder = knex({ client: 'pg' });

        // Regioni
        const regioni = this.state.regioni;
        const queryRegioni = queryBuilder.table('regioni').insert(regioni.map(r => ({ nome: r }))).toString();
        sql.push(queryRegioni);

        // Province
        const province = this.state.province;
        const queryProvince = queryBuilder.table('province').insert(province).toString();
        sql.push(queryProvince);

        // Comuni

        const provinceMap = new Map();
        for (const provincia of province) {
            provinceMap.set(provincia.nome, provincia);
        }

        const comuni = this.state.comuni.map(c => {
            c.provincia = provinceMap.get(c.provincia).codice;
            delete c.regione;
            return c;
        });
        const queryComuni = queryBuilder.table('comuni').insert(comuni).toString();
        sql.push(queryComuni);

        return sql.join(';\n');
    }

    async _exportSQL(sql) {
        const timestamp = new Date().getTime();
        await fs.writeFile(`query-comuni-ita-${timestamp}.sql`, sql);
    }

    async _executeSQL(sql) {
        const db = knex({
            client: 'pg',
            connection: {
                host: process.env.POSTGRES_HOST || "localhost",
                port: process.env.POSTGRES_PORT || 5432,
                database: process.env.POSTGRES_DATABASE || "comuni-ita",
                user: process.env.POSTGRES_USERNAME || "postgres",
                password: process.env.POSTGRES_PASSWORD || null,
                ssl: process.env.POSTGRES_SSL ? { rejectUnauthorized: false } : false,
            },
        });

        await db.raw('TRUNCATE TABLE comuni, province, regioni CASCADE');
        await db.raw(sql);
    }
}