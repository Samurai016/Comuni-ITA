<p align="center">
  <img src="./docs/logo.png" alt="Comuni ITA Logo" />
</p>

# [Comuni ITA API](https://comuni-ita.readme.io/)

![Versione](https://img.shields.io/github/v/release/Samurai016/Comuni-ITA?style=flat-square&label=versione)
![Licenza](https://img.shields.io/github/license/Samurai016/Comuni-ITA?style=flat-square&label=licenza)
[![Leggi la documentazione](https://img.shields.io/badge/Leggi%20la%20documentazione-passing?style=flat-square&logo=Read%20the%20Docs&labelColor=8CA1AF&color=8CA1AF&logoColor=white)](https://comuni-ita.readme.io/)

## ⚡TL;DR

* [https://comuni-ita.nicolorebaioli.dev/v5/comuni](https://comuni-ita.nicolorebaioli.dev/v5/comuni) - Lista dei comuni italiani.
* [https://comuni-ita.nicolorebaioli.dev/v5/province](https://comuni-ita.nicolorebaioli.dev/v5/province) - Lista delle province italiane.
* [https://comuni-ita.nicolorebaioli.dev/v5/regioni](https://comuni-ita.nicolorebaioli.dev/v5/regioni) - Lista delle regioni italiane.
* [https://comuni-ita.nicolorebaioli.dev/v5/comuni/cessati](https://comuni-ita.nicolorebaioli.dev/v5/comuni/cessati) - Lista dei comuni italiani cessati.

Per ulteriori dettagli su filtri, sorting, paginazione e altri endpoint, prosegui la lettura.

## Indice

- [✨Panoramica](#-panoramica)
- [🔀 Versioni](#-versioni)
- [📚 Endpoint API](#-endpoint-api)
  - [GET /v5/comuni](#-v5comuni)
  - [GET /v5/comuni/:regione](#-v5comuniregione)
  - [GET /v5/comuni/provincia/:provincia](#-v5comuniprovinciaprovincia)
  - [GET /v5/comuni/cessati](#-v5comunicessati)
  - [GET /v5/province](#-v5province)
  - [GET /v5/province/:regione](#-v5provinceregione)
  - [GET /v5/regioni](#-v5regioni)
- [📊 Parametri di Query](#-parametri-di-query)
- [🚀 Deploy](#-deploy)

## ✨ Panoramica

`comuni-ita` è un'API Node.js leggera e ad alte prestazioni costruita con [Fastify](https://www.fastify.io/). Fornisce accesso istantaneo a un dataset completo di comuni, province e regioni italiane.

I dati sono ottenuti e aggiornati da un sistema semiautomatico che preleva i dati direttamente dagli archivi ISTAT e integra le informazioni mancanti interrogando Wikidata.

I comuni cessati arrivano invece dall'[archivio storico dei comuni di ANPR](https://www.anagrafenazionale.interno.it/area-tecnica/archivio-storico-dei-comuni/), pubblicato dal Ministero dell'Interno, che raccoglie tutte le variazioni registrate da ISTAT per ogni comune italiano dalla sua istituzione.

Come per gli altri dataset, il prelievo e l'elaborazione stanno in [Comuni-ITA-updater](https://github.com/Samurai016/Comuni-ITA-updater): questa repo si limita a servire i file in [`data/`](data).

L'API è disponibile gratuitamente e senza limitazioni all'indirizzo **[https://comuni-ita.nicolorebaioli.dev/](https://comuni-ita.nicolorebaioli.dev/)** oppure può essere facilmente eseguita in locale o distribuita su qualsiasi piattaforma Node.js o Docker.

La documentazione è disponibile anche all'indirizzo [https://comuni-ita.readme.io/](https://comuni-ita.readme.io/). La specifica OpenAPI da cui è generata sta in [`docs/comuni-ita.yaml`](docs/comuni-ita.yaml).


> **⚠️ Attenzione ⚠️**
> **Il vecchio link https://axqvoqvbfjpaamphztgd.functions.supabase.co e la vecchia versione v3 basata su Supabase sono temporaneamente disponibili ma d'ora in poi faranno redirect al nuovo dominio e alla nuova versione v4 basata su Fastify.**  
> **Le risposte e il funzionamento della versione v3 sono invariati** e non richiedono quindi modifiche ai software che utilizzano l'API, ma si consiglia di aggiornare al più presto alla nuova versione v4 per beneficiare di prestazioni migliorate.  
> La versione v3 hostata su Supabase è soggetta a limitazioni di utilizzo e prestazioni, e l'incremento della popolarità dell'API ha portato a superare di gran largo queste limitazioni, **mi aspetto una sospension del progetto v3 su Supabase**, motivo per il quale ho deciso di sviluppare una nuova versione v4 basata su Fastify e hostata su un'infrastruttura più performante e scalabile.

## 🔀 Versioni

A partire dalla versione v5.0.0 l'API è dotata di endpoint versionati.  
Ogni futura modifica non distruttiva alla struttura delle risposte verrà servita da un'endpoint versionati della stessa.  
**Gli endpoint storici non versionati continueranno a funzionare come di consueto**.  
Di seguito sono elencate le versioni attualmente disponibili:  

| Percorso | Versione | Note |
| --- | --- | --- |
| `/comuni`, `/province`, `/regioni` | v4 | Le rotte storiche, invariate. Rispondono con l'header `Deprecation: true` e un `Link` alla rotta versionata corrispondente. |
| `/v4/comuni`, `/v4/province`, `/v4/regioni` | v4 | Identiche alle rotte storiche. |
| `/v5/comuni`, `/v5/province`, `/v5/regioni` | v5 | Supporto multi-cap: il campo `cap` è una lista. |
| `/v5/comuni/cessati` | v5 | I comuni cessati. Dalla 5.1.0, e solo in v5. |

## 📚 Endpoint API

### [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/v5/comuni`](https://comuni-ita.nicolorebaioli.dev/v5/comuni)

Recupera informazioni dettagliate sui comuni italiani.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.
- `codiceCatastale`: Filtra per codice catastale esatto.
- `prefisso`: Filtra per prefisso telefonico esatto.
- `provincia`: Filtra per nome della provincia (corrispondenza esatta, case-insensitive).
- `regione`: Filtra per nome della regione (corrispondenza esatta, case-insensitive).
- `cap`: Filtra per codice postale (CAP). La ricerca viene fatta tra tutti i CAP presenti in un comune.
- `q`: Ricerca parziale per nome (es. "milano").

#### Esempi

Query per ottenere i primi 10 comuni italiani, ordinati alfabeticamente per nome e mostrando solo il nome, il codice e il CAP.

```http
GET /v5/comuni?regione=lombardia&sort=nome&fields=nome,codice,cap&pagesize=10
```

Query per ottenere tutti i comuni con CAP 20121 (restituisce Milano, di cui 20121 è uno dei 38 CAP).

```http
GET /v5/comuni?cap=20121
```

Query per ottenere tutti i comuni che contengono "milano" nel nome.

```http
GET /v5/comuni?q=milano
```

### [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/v5/comuni/:regione`](https://comuni-ita.nicolorebaioli.dev/v5/comuni/lombardia)

Recupera informazioni dettagliate sui comuni di una regione specifica.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.
- `codiceCatastale`: Filtra per codice catastale esatto.
- `prefisso`: Filtra per prefisso telefonico esatto.
- `provincia`: Filtra per nome della provincia (corrispondenza esatta, case-insensitive).
- `cap`: Filtra per codice postale (CAP). La ricerca viene fatta tra tutti i CAP presenti in un comune.
- `q`: Ricerca parziale per nome (es. "milano").

#### Esempi

Query per ottenere tutti i comuni lombardi che contengono "milano" nel nome.

```http
GET /v5/comuni/lombardia?q=milano
```

Query per ottenere tutti i comuni della Valle d'Aosta.

```http
GET /v5/comuni/valle d'aosta
GET /v5/comuni/valle-d'aosta
GET /v5/comuni/valle-d-aosta
```

### [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/v5/comuni/provincia/:provincia`](https://comuni-ita.nicolorebaioli.dev/v5/comuni/provincia/milano)

Recupera informazioni dettagliate sui comuni di una provincia specifica.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.
- `codiceCatastale`: Filtra per codice catastale esatto.
- `prefisso`: Filtra per prefisso telefonico esatto.
- `cap`: Filtra per codice postale (CAP). La ricerca viene fatta tra tutti i CAP presenti in un comune.
- `q`: Ricerca parziale per nome (es. "milano").

#### Esempi

Query per ottenere tutti i comuni della provincia di Milano.

```http
GET /v5/comuni/provincia/milano
```

Query per ottenere tutti i comuni della provincia di Milano che contengono "milano" nel nome.

```http
GET /v5/comuni/provincia/milano?q=milano
```

### [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/v5/comuni/cessati`](https://comuni-ita.nicolorebaioli.dev/v5/comuni/cessati)

Recupera i comuni che non esistono più con il nome, il codice o la provincia con cui sono descritti.

Uno stesso comune può comparire più volte nella lista in caso di modifiche successive.   
Il campo `comuneAttuale` riporta infine uno di questi 2 possibili valori:
- **valorizzato**: il comune esiste ancora, sotto altro nome o altra provincia (`Abano` → `Abano Terme`);
- **`null`**: il comune è stato soppresso e nessun comune di oggi ne porta il codice catastale (`Castegnero`, confluito in `Castegnero Nanto` nel 2026).

Il campo su cui appoggiarsi per il riconoscimento è il **codice catastale**: è lo stesso per tutte le identità di uno stesso comune, mentre il codice ISTAT viene riassegnato negli anni a comuni diversi.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.
- `codiceCatastale`: Filtra per codice catastale esatto.
- `provincia`: Filtra per nome **o sigla** della provincia di allora (corrispondenza esatta, case-insensitive). La sigla serve per le province che non esistono più, di cui l'API non conosce il nome.
- `regione`: Filtra per nome della regione (corrispondenza esatta, case-insensitive).
- `cessatoDal` / `cessatoAl`: Filtra per data di cessazione, estremi inclusi (`YYYY-MM-DD`).
- `soppresso`: `true` tiene solo i comuni soppressi, `false` solo quelli riconducibili a un comune attuale.
- `q`: Ricerca parziale per nome.

#### Esempi

Query per sapere che comune è oggi quello in cui una persona è nata, partendo dal codice catastale sul suo codice fiscale.

```http
GET /v5/comuni/cessati?codiceCatastale=C056
```

Query per ottenere i comuni cessati nel 2026.

```http
GET /v5/comuni/cessati?cessatoDal=2026-01-01&cessatoAl=2026-12-31
```

Query per ottenere i soli comuni veneti davvero soppressi, senza le rinomine.

```http
GET /v5/comuni/cessati?regione=veneto&soppresso=true
```

#### Limiti

- La fonte non dice **in quale comune** sia confluito un comune soppresso: `comuneAttuale` resta `null` anche quando il territorio è finito in un comune di oggi.
- I comuni dei territori ceduti dopo la guerra (Fiume, Pola, Zara, Venezia Giulia) non hanno né nome di provincia né regione: ne resta la sigla.
- Qualche comune cessato molto presto non ha mai avuto un codice catastale: per quelli `codiceCatastale` è `null`.

### [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/v5/province`](https://comuni-ita.nicolorebaioli.dev/v5/province)

Recupera informazioni dettagliate sulle province italiane.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.
- `regione`: Filtra per nome della regione (corrispondenza esatta, case-insensitive).

#### Esempi

Query per ottenere tutte le province italiane.

```http
GET /v5/province
```

Query per ottenere tutte le province italiane che contengono "reggio" nel nome.

```http
GET /v5/province?q=reggio
```

### [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/v5/province/:regione`](https://comuni-ita.nicolorebaioli.dev/v5/province/lombardia)

Recupera informazioni dettagliate sulle province italiane di una regione specifica.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.

#### Esempi

Query per ottenere tutte le province italiane della regione di Lombardia.

```http
GET /v5/province/lombardia
```

### [![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/v5/regioni`](https://comuni-ita.nicolorebaioli.dev/v5/regioni)

Recupera informazioni dettagliate sulle regioni italiane.

#### Esempi

Query per ottenere tutte le regioni italiane.

```http
GET /v5/regioni
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

### 📦 Formato

Usa `format` per scegliere il formato della risposta: `json` (predefinito), `xml` o `csv`. Va scritto in minuscolo.

- **Esempio:** `?format=csv`

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
