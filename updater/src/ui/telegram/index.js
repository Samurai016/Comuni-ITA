import chalk from 'chalk';
import ora from 'ora';
import TelegramBot from './bot.js';
import {
	header,
	sanitizeForTelegram,
	sanitizeCap,
	sanitizePrefisso,
	sanitizeEmail,
	sanitizeTelefono,
	sanitizeCoordinata
} from '../../utils/utils.js';
import {
	validateCAP,
	validatePrefisso,
	validateLatitudine,
	validateLongitudine,
	validateEmail,
	validatePEC,
	validateFax,
	validateCodiceISTAT,
	validateTelefono,
} from '../../utils/validation.js';

export default class Telegram {
	constructor(steps, argv) {
		this.steps = steps;
		this.argv = argv;
	}

	async run() {
		// Print header
		console.log(chalk.green(header));

		this.spinner = ora(`Aggiornamento avviato tramite Telegram`);
		this.spinner.start();

		try {
			this.bot = new TelegramBot(async (ctx) => {
				if (new Date(ctx.update.message.date * 1000) >= startDate) {
					await this.bot.sendText("‼ *Aggiornamento annullato*");
					process.exit();
				}
			});
			let textMessage = "🚀 *Aggiornamento Comuni ITA iniziato*";
			const message = await this.bot.sendText(textMessage);

			const state = {};
			for (let i = 0; i < this.steps.length; i++) {
				const step = this.steps[i];
				const instance = new step(state, this, this.argv);

				textMessage += `\n\n🔄 [STEP ${i + 1}/${this.steps.length}]: _${instance.name}_`
				await this.bot.editMessage(message, textMessage);

				await instance.run();
			}

			textMessage += "\n\n✅ *Aggiornamento completato*";
			await this.bot.editMessage(message, textMessage);
			await this.bot.sendText("✅ *Aggiornamento completato*");

			this.bot.stop();
			this.spinner.succeed();
		} catch (error) {
			this.spinner.fail();
			console.log(chalk.red("❌ Errore durante l'aggiornamento:"));
			console.error(error);

			if (this.bot) {
				await this.bot.sendText("❌ *Errore durante l'aggiornamento:* " + error.message);
				this.bot.stop();
			}
		}
	}

	async risolviConflitto(comune) {
		const reply = await this.bot.waitForReply(
			sanitizeForTelegram("❗ *Conflitto!*\n\n" + `Comune: _${comune.nome}_\n` + `Regione: _${comune.regione}_\n` + `Provincia: _${comune.provincia}_\n` + `Codice ISTAT: _${comune.codice}_\n` + `Codice catasto: _${comune.codiceCatastale}_\n\n` + "Rispondi a questo messaggio inviando *CAP* e *coordinate* in questo modo:\n" + "`cap, prefisso, lat, lon`"),
			async (rep) => {
				const chunks = rep.update.message.text.split(",").map((c) => c.trim());
				const validations = [
					!chunks[0] || validateCAP(chunks[0]),			// CAP non inserito oppure valido
					!chunks[1] || validatePrefisso(chunks[1]),		// Prefisso non inserito oppure valido
					!chunks[2] || validateLatitudine(chunks[2]),	// Latitudine non inserita oppure valida
					!chunks[3] || validateLongitudine(chunks[3]),	// Longitudine non inserita oppure valida
				];
				const isOk = validations.every((v) => v === true);
				if (!isOk) {
					const errorMessage = validations.filter((v) => v !== true).join(", ") || 'Errore sconosciuto';
					await this.bot.sendText(`🚨 Dato non valido: _${errorMessage}_`, null, rep.update.message.message_id);
				}
				return isOk;
			}
		);

		const chunks = reply.update.message.text.split(",").map((c) => c.trim());
		return {
			cap: chunks[0] === "null" ? null : sanitizeCap(chunks[0]),
			prefisso: chunks[1] === "null" ? null : sanitizePrefisso(chunks[1]),
			lat: chunks[2] === "null" ? null : sanitizeCoordinata(chunks[2]),
			lng: chunks[3] === "null" ? null : sanitizeCoordinata(chunks[3])
		};
	}

	async risolviEmailNonTrovata(comune) {
		const reply = await this.bot.waitForReply(
			sanitizeForTelegram("❗ *Email del comune errate!*\n\n" + `Comune: _${comune.nome}_\n` + `Provincia: _${comune.provincia}_\n` + `Email trovata: \`${comune.rawEmail}\`\n` + `Pec trovata: \`${comune.rawPec}\`\n\n` + "Rispondi a questo messaggio inviando *email* e *pec* in questo modo:\n" + "`email, pec`"),
			async (rep) => {
				const chunks = rep.update.message.text.split(",").map((c) => c.trim());
				const validations = [
					!chunks[0] || validateEmail(chunks[0]),	// Email non inserita oppure valida
					!chunks[1] || validatePEC(chunks[1]),	// PEC non inserita oppure valida
				];
				const isOk = validations.every((v) => v === true);
				if (!isOk) {
					const errorMessage = validations.filter((v) => v !== true).join(", ") || 'Errore sconosciuto';
					await this.bot.sendText(`🚨 Dato non valido: _${errorMessage}_`, null, rep.update.message.message_id);
				}
				return isOk;
			}
		);

		const chunks = reply.update.message.text.split(",").map((c) => c.trim());
		return {
			email: chunks[0] === "null" ? null : sanitizeEmail(chunks[0]),
			pec: chunks[1] === "null" ? null : sanitizeEmail(chunks[1])
		};
	}

	async risolviContattiNonTrovati(comune) {
		const reply = await this.bot.waitForReply(
			sanitizeForTelegram("❗ *Contatti del comune non trovati!*\n\n" + `Comune: _${comune.nome}_\n` + `Provincia: _${comune.provincia}_\n\n` + "Rispondi a questo messaggio inviando *codice ISTAT*, *email*, *pec*, *telefono* e *fax* in questo modo:\n" + "`codice ISTAT, email, pec, telefono, fax`"),
			async (rep) => {
				const chunks = rep.update.message.text.split(",").map((c) => c.trim());
				const validations = [
					validateCodiceISTAT(chunks[0]),				// Codice ISTAT valido (obbligatorio)
					!chunks[1] || validateEmail(chunks[1]),		// Email non inserita oppure valida
					!chunks[2] || validatePEC(chunks[2]),		// PEC non inserita oppure valida
					!chunks[3] || validateTelefono(chunks[3]),	// Telefono non inserito oppure valido
					!chunks[4] || validateFax(chunks[4])		// Fax non inserito oppure valido
				];
				const isOk = validations.every((v) => v === true) && chunks[0];
				if (!isOk) {
					const errorMessage = !chunks[0] ? 'Il codice ISTAT è obbligatorio' : validations.filter((v) => v !== true).join(", ");
					await this.bot.sendText(`🚨 Dato non valido: _${errorMessage || 'Errore sconosciuto'}_`, null, rep.update.message.message_id);
				}
				return isOk;
			}
		);

		const chunks = reply.update.message.text.split(",").map((c) => c.trim());
		return {
			codiceISTAT: chunks[0] === "null" ? null : chunks[0],
			email: chunks[1] === "null" ? null : sanitizeEmail(chunks[1]),
			pec: chunks[2] === "null" ? null : sanitizeEmail(chunks[2]),
			telefono: chunks[3] === "null" ? null : sanitizeTelefono(chunks[3]),
			fax: chunks[4] === "null" ? null : sanitizeTelefono(chunks[4])
		};
	}
}