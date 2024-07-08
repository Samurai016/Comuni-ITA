#!/usr/bin/env node

import 'dotenv/config';
import steps from './steps.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Suppress warnings
process.emitWarning = () => { return; };

(async () => {
    const argv = yargs(hideBin(process.argv))
        .usage('Usage: npx comuni-ita-updater [options]')
        .option('u', {
            alias: 'ui',
            describe: `L'interfaccia utente da utilizzare`,
            choices: ['cli', 'telegram'],
            default: 'cli',
            global: true
        })
        .option('e', {
            alias: 'export',
            describe: `Modalità di esportazione`,
            choices: ['sql', 'db', 'json'],
            default: 'sql',
            global: true
        })
        .option('c', {
            alias: 'correzioni',
            describe: `Percorso del file JSON contenente le correzioni`,
            default: 'correzioni.json',
            global: true
        })
        .argv;

    // Get the UI requested by the user
    const requestedUi = argv.ui || 'cli';
    const UI = await import(`./ui/${requestedUi}/index.js`);

    // Start the UI
    const app = new UI.default(steps, argv);
    await app.run();
    process.exit();
})();