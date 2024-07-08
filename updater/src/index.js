import steps from './steps.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

(async () => {
    const argv = yargs(hideBin(process.argv))
        .usage('Usage: $0 [options]')
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
            choices: ['sql', 'db'],
            default: 'sql',
            global: true
        })
        .argv;

    // Get the UI requested by the user
    const requestedUi = argv.ui || 'cli';
    const UI = await import(`./ui/${requestedUi}/index.js`);

    // Start the UI
    const app = new UI.default(steps, argv);
    app.run();
})();