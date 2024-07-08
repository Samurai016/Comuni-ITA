# Comuni ITA Updater

Questo tool permette di aggiornare i comuni italiani dell'API Comuni-ITA.  
Il tool processa tutte le informazioni in automatico.  
Potrebbe venir chiesto all'utente di inserire dei dati mancanti/errati.  

Il tool è fruibile mediante:
* Interfaccia a riga di comando
* Bot Telegram

Il tool è in grado di esportare i dati:
* In formato JSON
* In formato SQL
* Aggiornando automaticamente il database Supabase (PostgreSQL)

## Installazione
* Installare [Node.js](https://nodejs.org/en/download/package-manager)
* Clonare il repository
* Eseguire `npm install` per installare le dipendenze
* Creare il file `.env` sulla base del file `.env.example`
* Eseguire il comando `npx comuni-ita-updater`

### File di configurazione `.env`
| Nome Variabile | Descrizione |
| --- | --- |
| `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DATABASE`, `POSTGRES_USERNAME`, `POSTGRES_PASSWORD` | Configurazione del database PostgreSQL. Per quanto riguarda Supabase, è possibile trovare queste informazioni nella [sezione "Settings" del progetto](https://supabase.com/dashboard/project/_/settings/database). |
| `TELEGRAM_BOT_KEY` | Chiave del bot Telegram. Per creare un bot Telegram, seguire [questa guida](https://core.telegram.org/bots#how-do-i-create-a-bot). | 
| `TELEGRAM_CHAT_ID` | ID della chat Telegram. Per ottenere l'ID della chat è posssibile utilizzare il bot [@myidbot](https://t.me/myidbot) |
| `NODE_TLS_REJECT_UNAUTHORIZED=0` | Disabilita la verifica dei certificati SSL. Questo è necessario per il fetch dei dati. |

## Utilizzo
Attraverso il comando
```
npx comuni-ita-updater --help
```
è possibile visualizzare l'elenco dei comandi disponibili.

Le opzioni disponibili sono:
| Opzione | Descrizione | Valori ammessi | Default |
| --- | --- | --- | --- |
| `--export` | Formato di esportazione dei dati.<br/><br/>In caso si impostasse `db`, il tool procederà a svuotare le tabelle `comuni`, `province` e `regioni` del database indicato nel file `.env` e inserirà automaticamente i nuovi dati aggiornati  | `json`, `sql`, `db` | `json` |
| `--ui` | Interfaccia utente.<br/><br/>L'opzione `cli` avvia il tool in una console, le eventuali informazioni da inserire vengono richieste all'utente.<br/><br/>L'opzione `telegram` avvia il tool tramite il bot indicato da `TELEGRAM_BOT_KEY` e invierà i messaggi all'utente configurato dal parametro `TELEGRAM_CHAT_ID`. Le informazioni da inserire verranno ottenute dalle risposte ai messaggi (**Si intendono le risposte ai messaggi inviati dal bot. Un messaggio di testo che non sia una risposta non viene considerato dal bot**). | `cli`, `telegram` | `cli` |
| `--correzioni` | Path del file .json contenente le correzioni | | `correzioni.json` |

## Correzioni
Il file contenenente le correzioni deve avere la seguente struttura:
```json
{
  "comuni": [
    {
        "codice": "A001", // Codice ISTAT del comune che si vuole correggere
        ... // Campi che vengono sovrascritti
    }
  ],
    "province": [
        {
            "codice": "01", // Codice ISTAT della provincia che si vuole correggere
            ... // Campi che vengono sovrascritti
        }
    ],
}
```