<p align="center">
  <img src="./docs/logo.png" alt="Comuni ITA Logo" />
</p>

# [Comuni ITA API](https://comuni-ita.readme.io/)

![Versione](https://img.shields.io/github/v/release/Samurai016/Comuni-ITA?style=flat-square&label=versione)
![Licenza](https://img.shields.io/github/license/Samurai016/Comuni-ITA?style=flat-square&label=licenza)
[![Leggi la documentazione](https://img.shields.io/badge/Leggi%20la%20documentazione-passing?style=flat-square&logo=Read%20the%20Docs&labelColor=8CA1AF&color=8CA1AF&logoColor=white)](https://comuni-ita.readme.io/)

## ⚡TL;DR

* [https://comuni-ita.nicolorebaioli.dev/comuni](https://comuni-ita.nicolorebaioli.dev/comuni) - Lista dei comuni italiani.
* [https://comuni-ita.nicolorebaioli.dev/province](https://comuni-ita.nicolorebaioli.dev/province) - Lista delle province italiane.
* [https://comuni-ita.nicolorebaioli.dev/regioni](https://comuni-ita.nicolorebaioli.dev/regioni) - Lista delle regioni italiane.

Per ulteriori dettagli su filtri, sorting, paginazione e altri endpoint, prosegui la lettura.

## Indice

- [✨Panoramica](#-panoramica)
- [🔀 Versioni](#-versioni)
- [📚 Endpoint API](#-endpoint-api)
  - [GET /comuni](#-comuni)
  - [GET /comuni/:regione](#-comuniregione)
  - [GET /comuni/provincia/:provincia](#-comuniprovincaprovincia)
  - [GET /province](#-province)
  - [GET /province/:regione](#-provinceregione)
  - [GET /regioni](#-regioni)
- [📊 Parametri di Query](#-parametri-di-query)
- [🚀 Deploy](#-deploy)

## ✨ Panoramica

`comuni-ita` è un'API Node.js leggera e ad alte prestazioni costruita con [Fastify](https://www.fastify.io/). Fornisce accesso istantaneo a un dataset completo di comuni, province e regioni italiane.

I dati sono ottenuti e aggiornati da un sistema semiautomatico che preleva i dati direttamente dagli archivi ISTAT e integra le informazioni mancanti interrogando Wikidata.

L'API è disponibile gratuitamente e senza limitazioni all'indirizzo **[https://comuni-ita.nicolorebaioli.dev/](https://comuni-ita.nicolorebaioli.dev/)** oppure può essere facilmente eseguita in locale o distribuita su qualsiasi piattaforma Node.js o Docker.

La documentazione è disponibile anche all'indirizzo [https://comuni-ita.readme.io/](https://comuni-ita.readme.io/).


> **⚠️ Attenzione ⚠️**
> **Il vecchio link https://axqvoqvbfjpaamphztgd.functions.supabase.co e la vecchia versione v3 basata su Supabase sono temporaneamente disponibili ma d'ora in poi faranno redirect al nuovo dominio e alla nuova versione v4 basata su Fastify.**  
> **Le risposte e il funzionamento della versione v3 sono invariati** e non richiedono quindi modifiche ai software che utilizzano l'API, ma si consiglia di aggiornare al più presto alla nuova versione v4 per beneficiare di prestazioni migliorate.  
> La versione v3 hostata su Supabase è soggetta a limitazioni di utilizzo e prestazioni, e l'incremento della popolarità dell'API ha portato a superare di gran largo queste limitazioni, **mi aspetto una sospension del progetto v3 su Supabase**, motivo per il quale ho deciso di sviluppare una nuova versione v4 basata su Fastify e hostata su un'infrastruttura più performante e scalabile.

## 🔀 Versioni

Ogni endpoint è servito su tre percorsi, che restituiscono gli stessi comuni ma non sempre nella stessa forma:

| Percorso | Versione | Note |
| --- | --- | --- |
| `/comuni`, `/province`, `/regioni` | v1 | Le rotte storiche, invariate. Rispondono con l'header `Deprecation: true` e un `Link` alla rotta versionata corrispondente. |
| `/v1/comuni`, `/v1/province`, `/v1/regioni` | v1 | Identiche alle rotte storiche, ma esplicite. |
| `/v2/comuni`, `/v2/province`, `/v2/regioni` | v2 | `cap` è una lista. |

> Queste versioni riguardano **il formato della risposta**, non la versione dell'API: la v3 su Supabase e la v4 su Fastify di cui si parla sopra sono generazioni dell'infrastruttura, `/v1` e `/v2` sono forme del JSON.

Nessun software esistente va toccato: chi interroga `/comuni` continua a ricevere quello che ha sempre ricevuto. Le rotte senza prefisso restano supportate, l'header `Deprecation` segnala solo che la strada consigliata per il codice nuovo è quella versionata.

### CAP multipli

Un comune può avere più di un CAP: Milano ne ha 38, Napoli 25, Bologna 19, Trento 3, Castegnero Nanto 2. La v1 può esporne uno solo, e per ognuno di questi comuni espone quello della sede comunale; la v2 li espone tutti.

```jsonc
// GET /comuni?q=trento          →  "cap": "38121"
// GET /v2/comuni?q=trento       →  "cap": ["38121", "38122", "38123"]
```

Negli altri formati la lista segue la convenzione del formato: nel CSV i CAP stanno in una sola colonna separati da uno spazio (`38121 38122 38123`), nell'XML diventano un elemento `<cap>` ripetuto.

I CAP pubblicati arrivano solo da fonti istituzionali o da Wikidata; l'elenco dei comuni a CAP multipli è curato a mano, perché nessuna fonte aperta lo pubblica in modo affidabile. Il filtro `?cap=` invece funziona anche sui CAP che l'API non espone (quelli storici, o quelli dei comuni multi-CAP non ancora censiti): sono buoni per **trovare** un comune, non abbastanza per descriverlo.

## 📚 Endpoint API

### [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/comuni`](https://comuni-ita.nicolorebaioli.dev/comuni)

Recupera informazioni dettagliate sui comuni italiani.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.
- `provincia`: Filtra per nome della provincia (corrispondenza esatta, case-insensitive).
- `regione`: Filtra per nome della regione (corrispondenza esatta, case-insensitive).
- `cap`: Filtra per codice postale (CAP). Corrisponde un comune se il CAP è **fra i suoi**, anche quando non è quello esposto nella risposta.
- `q`: Ricerca parziale per nome (es. "milano").

#### Esempi

Query per ottenere i primi 10 comuni italiani, ordinati alfabeticamente per nome e mostrando solo il nome, il codice e il CAP.

```http
GET /comuni?regione=lombardia&sort=nome&fields=nome,codice,cap&pagesize=10
```

Query per ottenere tutti i comuni con CAP 20121 (restituisce Milano, di cui 20121 è uno dei 38 CAP).

```http
GET /comuni?cap=20121
```

Query per ottenere tutti i comuni che contengono "milano" nel nome.

```http
GET /comuni?q=milano
```

### [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/comuni/:regione`](https://comuni-ita.nicolorebaioli.dev/comuni/lombardia)

Recupera informazioni dettagliate sui comuni di una regione specifica.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.
- `provincia`: Filtra per nome della provincia (corrispondenza esatta, case-insensitive).
- `cap`: Filtra per codice postale (CAP). Corrisponde un comune se il CAP è **fra i suoi**, anche quando non è quello esposto nella risposta.
- `q`: Ricerca parziale per nome (es. "milano").

#### Esempi

Query per ottenere tutti i comuni lombardi che contengono "milano" nel nome.

```http
GET /comuni/lombardia?q=milano
```

Query per ottenere tutti i comuni della Valle d'Aosta.

```http
GET /comuni/valle d'aosta
GET /comuni/valle-d'aosta
GET /comuni/valle-d-aosta
```

### [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/comuni/provincia/:provincia`](https://comuni-ita.nicolorebaioli.dev/comuni/provincia/milano)

Recupera informazioni dettagliate sui comuni di una provincia specifica.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.
- `cap`: Filtra per codice postale (CAP). Corrisponde un comune se il CAP è **fra i suoi**, anche quando non è quello esposto nella risposta.
- `q`: Ricerca parziale per nome (es. "milano").

#### Esempi

Query per ottenere tutti i comuni della provincia di Milano.

```http
GET /comuni/provincia/milano
```

Query per ottenere tutti i comuni della provincia di Milano che contengono "milano" nel nome.

```http
GET /comuni/provincia/milano?q=milano
```

### [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/province`](https://comuni-ita.nicolorebaioli.dev/province)

Recupera informazioni dettagliate sulle province italiane.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.
- `regione`: Filtra per nome della regione (corrispondenza esatta, case-insensitive).

#### Esempi

Query per ottenere tutte le province italiane.

```http
GET /province
```

Query per ottenere tutte le province italiane che contengono "reggio" nel nome.

```http
GET /province?q=reggio
```

### [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/province/:regione`](https://comuni-ita.nicolorebaioli.dev/province/lombardia)

Recupera informazioni dettagliate sulle province italiane di una regione specifica.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.

#### Esempi

Query per ottenere tutte le province italiane della regione di Lombardia.

```http
GET /province/lombardia
```

### [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/regioni`](https://comuni-ita.nicolorebaioli.dev/regioni)

Recupera informazioni dettagliate sulle regioni italiane.

#### Esempi

Query per ottenere tutte le regioni italiane.

```http
GET /regioni
```

## 📊 Parametri di Query

### 🌪️ Ordinamento (Sorting)

Usa il parametro `sort` per ordinare i risultati.

- **Crescente:** `?sort=nome`
- **Decrescente:** `?sort=-nome` (aggiungi il prefisso `-`)

### ✂️ Proiezione (Selezione Campi)

Riduci la dimensione del payload selezionando solo i campi necessari usando `fields`.

- **Esempio:** `?fields=nome,codice,cap`

### 📄 Paginazione

Controlla la quantità di dati restituiti.

- `page`: Numero di pagina da restituire (predefinito: `1`).
- `pagesize`: Numero di elementi per pagina (predefinito: `INFINITE`: vengono restituiti tutti gli elementi).

## 🚀 Deploy

Puoi eseguire il deploy di `comuni-ita` utilizzando ambienti Node.js standard o Docker.

### 🐳 Usando Docker

Forniamo un setup pronto all'uso con **Dockerfile** e **docker-compose**.

1.  **Build ed Esecuzione:**
    ```bash
    docker-compose up --build -d
    ```
2.  **Accesso:**
    L'API sarà disponibile su `http://localhost:8080`.

### 🟢 Usando Node.js

```bash
git clone https://github.com/Samurai016/Comuni-ITA
cd Comuni-ITA

# Installa le dipendenze e avvia l'API
npm install
npm start
```

L'API sarà disponibile su `http://localhost:8080`.

---

Credits: Logo inpired by: [Castle by Jasfart from the Noun Project](https://thenounproject.com/creator/omataloon/)