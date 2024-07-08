import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { header } from '../../utils/utils.js';
import fs from 'node:fs/promises';
import {
	validateCAP,
	validatePrefisso,
	validateLatitudine,
	validateLongitudine,
	validateEmail,
	validatePEC,
	validateTelefono,
	validateFax,
	validateCodiceISTAT
} from '../../utils/validation.js';

export default class CLI {
	constructor(steps, argv) {
		this.steps = steps;
		this.argv = argv;
	}

	async run() {
		// Print header
		console.log(chalk.green(header));

		try {
			const state = {};
			for (let i = 0; i < this.steps.length; i++) {
				const step = this.steps[i];
				const instance = new step(state, this, this.argv);
				this.spinner = ora(`[STEP ${i + 1}/${this.steps.length}]: ${instance.name}`);
				this.spinner.start();
				await instance.run();
				this.spinner.succeed();
			}

			console.log(); // Add a newline
			console.log(chalk.green("✅ Aggiornamento completato!"));
		} catch (error) {
			this.spinner.fail();
			console.log(chalk.red("❌ Errore durante l'aggiornamento:"));
			console.error(error);

			await fs.writeFile(`error-${new Date().getTime()}.json`, JSON.stringify(error, null, 2));
		}
	}

	async risolviConflitto(comune) {
		this.spinner.stop();

		console.log(); // Add a newline
		console.log(
			`❗ Conflitto!\n` +
			`\tComune: ${chalk.yellow(comune.nome)}\n` +
			`\tRegione: ${chalk.yellow(comune.regione)}\n` +
			`\tProvincia: ${chalk.yellow(comune.provincia)}\n` +
			`\tCodice ISTAT: ${chalk.yellow(comune.codice)}\n` +
			`\tCodice catasto: ${chalk.yellow(comune.codiceCatastale)}`
		);

		const { cap, prefisso, lat, lng } = await inquirer.prompt([
			{
				type: 'input',
				name: 'cap',
				message: 'CAP:',
				validate: validateCAP
			},
			{
				type: 'input',
				name: 'prefisso',
				message: 'Prefisso telefonico:',
				validate: validatePrefisso
			},
			{
				type: 'input',
				name: 'lat',
				message: 'Latitudine:',
				validate: validateLatitudine
			},
			{
				type: 'input',
				name: 'lng',
				message: 'Longitudine:',
				validate: validateLongitudine
			}
		]);

		return { cap, prefisso, lat, lng };
	}

	async risolviEmailNonTrovata(comune) {
		this.spinner.stop();

		console.log(); // Add a newline
		console.log(
			`❗ Email del comune errate!\n` +
			`\tComune: ${chalk.yellow(comune.nome)}\n` +
			`\tIndirizzp: ${chalk.yellow(comune.indirizzo)}\n` +
			`\tEmail trovata: ${chalk.yellow(comune.rawEmail)}\n` +
			`\tPec trovata: ${chalk.yellow(comune.rawPec)}`
		);

		const { email, pec } = await inquirer.prompt([
			{
				type: 'input',
				name: 'email',
				message: 'Email:',
				default: comune.rawEmail,
				validate: validateEmail
			},
			{
				type: 'input',
				name: 'pec',
				message: 'PEC:',
				default: comune.rawPec,
				validate: validatePEC
			}
		]);

		return { email, pec };
	}

	async risolviContattiNonTrovati(comune) {
		this.spinner.stop();

		console.log(); // Add a newline
		console.log(
			`❗ Contatti del comune non trovati!\n` +
			`\tComune: ${chalk.yellow(comune.nome)}\n` +
			`\tProvincia: ${chalk.yellow(comune.provincia)}`
		);

		const { codiceISTAT, email, pec, telefono, fax } = await inquirer.prompt([
			{
				type: 'input',
				name: 'codiceISTAT',
				message: 'Codice ISTAT (obbbligatorio):',
				required: true,
				validate: validateCodiceISTAT
			},
			{
				type: 'input',
				name: 'email',
				message: 'Email:',
				validate: validateEmail
			},
			{
				type: 'input',
				name: 'pec',
				message: 'PEC:',
				validate: validatePEC
			},
			{
				type: 'input',
				name: 'telefono',
				message: 'Telefono:',
				validate: validateTelefono
			},
			{
				type: 'input',
				name: 'fax',
				message: 'Fax:',
				validate: validateFax
			}
		]);

		return { codiceISTAT, email, pec, telefono, fax };
	}

	async _askForConfirm(prompt) {
		const { update } = await inquirer.prompt([
			{
				type: "confirm",
				name: "update",
				message: prompt,
			},
		]);
		return update;
	}
}
