# [Comuni ITA API](https://comuni-ita.readme.io/)

![Versione](https://img.shields.io/github/v/release/Samurai016/Comuni-ITA?style=flat-square&label=versione)
[![Leggi la documentazione](https://img.shields.io/badge/Leggi%20la%20documentazione-passing?style=flat-square&logo=Read%20the%20Docs&labelColor=8CA1AF&color=8CA1AF&logoColor=white)](https://comuni-ita.readme.io/)

## Indice

- [⚡Panoramica](#panoramica)
- [📚 Endpoint API](#endpoint-api)
  - [GET /comuni](#get-comuni)
  - [GET /comuni/:regione](#get-comuni-regione)
  - [GET /comuni/provincia/:provincia](#get-comuni-provincia-provincia)
  - [GET /province](#get-province)
  - [GET /province/:regione](#get-province-regione)
  - [GET /regioni](#get-regioni)
- [📊 Parametri di Query](#parametri-di-query)
- [🚀 Deploy](#deploy)
- [🛠️ Sviluppo](#sviluppo)

## ⚡ Panoramica

`comuni-ita` è un'API Node.js leggera e ad alte prestazioni costruita con [Fastify](https://www.fastify.io/). Fornisce accesso istantaneo a un dataset completo di comuni, province e regioni italiane.

I dati sono ottenuti e aggiornati da un sistema semiautomatico che preleva i dati direttamente dagli archivi ISTAT e integra le informazioni mancanti interrogando Wikidata.

## 📚 Endpoint API

### ![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/comuni`

Recupera informazioni dettagliate sui comuni italiani.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.
- `provincia`: Filtra per nome della provincia (corrispondenza esatta, case-insensitive).
- `regione`: Filtra per nome della regione (corrispondenza esatta, case-insensitive).
- `cap`: Filtra per codice postale (CAP).
- `q`: Ricerca parziale per nome (es. "milano").

#### Esempi

Query per ottenere i primi 10 comuni italiani, ordinati alfabeticamente per nome e mostrando solo il nome, il codice e il CAP.

```http
GET /comuni?regione=lombardia&sort=nome&fields=nome,codice,cap&limit=10
```

Query per ottenere tutti i comuni con CAP 20121.

```http
GET /comuni?cap=20121
```

Query per ottenere tutti i comuni che contengono "milano" nel nome.

```http
GET /comuni?q=milano
```

### ![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/comuni/:regione`

Recupera informazioni dettagliate sui comuni di una regione specifica.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.
- `provincia`: Filtra per nome della provincia (corrispondenza esatta, case-insensitive).
- `cap`: Filtra per codice postale (CAP).
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

### ![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/comuni/provincia/:provincia`

Recupera informazioni dettagliate sui comuni di una provincia specifica.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.
- `cap`: Filtra per codice postale (CAP).
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

### ![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/province`

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

### ![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/province/:regione`

Recupera informazioni dettagliate sulle province italiane di una regione specifica.

#### Filtri

- `codice`: Filtra per codice ISTAT esatto.

#### Esempi

Query per ottenere tutte le province italiane della regione di Lombardia.

```http
GET /province/lombardia
```

### ![GET](https://img.shields.io/static/v1?label=%20&message=GET&color=187bdf&style=flat-square) `/regioni`

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

- `limit`: Numero di elementi da restituire (predefinito: `100`).
- `offset`: Numero di elementi da saltare (predefinito: `0`).

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

1.  **Installa le dipendenze:**
    ```bash
    npm install
    ```
2.  **Avvia il Server:**
    ```bash
    npm start
    ```
    Questo comando usa `ts-node` per eseguire il server direttamente.

**Variabili d'Ambiente:**

- `PORT`: Porta di ascolto (predefinito: `8080`).

---

## 🤝 Sviluppo

Vuoi aggiungere funzionalità o contribuire? I contributi sono benvenuti!

1.  **Clona la Repo:**

    ```bash
    git clone https://github.com/tuo-username/comuni-ita.git
    cd comuni-ita
    ```

2.  **Installa le dipendenze:**

    ```bash
    npm install
    ```

3.  **Esegui in Locale:**

    ```bash
    npm start
    ```

4.  **Struttura del Progetto:**
    - `src/http/routes`: Definisce gli endpoint dell'API.
    - `src/data`: Gestisce il caricamento e l'indicizzazione dei dati.
    - `src/domain`: Tipi e logica di business.

5.  **Invia una PR:**
    Apporta le tue modifiche, testale localmente e apri una Pull Request!

---

_Realizzato con ❤️ per la community di sviluppatori italiani._
