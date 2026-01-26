# Comuni-ITA API

This is a high-performance HTTP API that serves Italian municipalities (comuni), provinces, and regions. The dataset is small, mostly static, and loaded entirely in memory for fast, cacheable responses.

## Core Goals

-   **Very high performance**: Minimal per-request CPU and allocations, predictable latency.
-   **TypeScript stack**: Node.js LTS with a Fastify-based HTTP server.
-   **Cache-first design**: Strong HTTP caching (ETag, Cache-Control) and deterministic responses.
-   **Simple Docker deployment**: Single container, served behind Nginx reverse proxy.

## Setup and Running

### Prerequisites

-   Node.js (LTS recommended)
-   npm (or yarn/pnpm)
-   Docker (for containerized deployment)

### Local Development

1.  **Clone the repository (if not already done):**
    ```bash
    git clone <your-repo-url>
    cd comuni-ita
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Prepare data:**
    Place your `comuni.json`, `province.json`, and `regioni.json` files into the `data/` directory. Empty placeholder files are provided.

4.  **Run the API in development mode:**
    ```bash
    npm start
    ```
    The API will start on `http://localhost:8080`. Logging will be pretty-printed to the console.

### Docker Deployment

1.  **Build the Docker image:**
    ```bash
    docker build -t comuni-ita-api .
    ```

2.  **Run the Docker container:**
    ```bash
    docker run -p 8080:8080 comuni-ita-api
    ```
    The API will be accessible on `http://localhost:8080`.

## API Endpoints

All responses include `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` and an `ETag` header.

### 1. Regioni

**`GET /regioni`**

Returns a list of all Italian regions.

**Example:**
```
GET /regioni
```

### 2. Province

**`GET /province`**

Returns a list of all Italian provinces.

**`GET /province/:regione`**

Returns provinces belonging to a specific region.

**Query Parameters:**

-   `codice`: Filter by province code.
-   `sigla`: Filter by province abbreviation.
-   `regione`: Filter by region name.
-   `sort`: Sort results by field (e.g., `nome`, `codice`). Use `-` prefix for descending (e.g., `-nome`).
-   `limit`: Maximum number of results (default: 100, max: 1000).
-   `offset`: Number of results to skip.
-   `fields`: Comma-separated list of fields to include in the response (e.g., `codice,nome,sigla`).

**Example:**
```
GET /province?regione=Lombardia&sort=nome&limit=5&fields=nome,sigla
```

### 3. Comuni

**`GET /comuni`**

Returns a list of all Italian municipalities.

**`GET /comuni/:regione`**

Returns municipalities belonging to a specific region.

**`GET /comuni/provincia/:provincia`**

Returns municipalities belonging to a specific province.

**Query Parameters:**

-   `codice`: Filter by municipality code.
-   `provincia`: Filter by province code.
-   `regione`: Filter by region name.
-   `cap`: Filter by CAP (postal code).
-   `q`: Case- and accent-insensitive search by municipality name (`nome` or `nomeStraniero`).
-   `sort`: Sort results by field (e.g., `nome`, `codice`, `popolazione`). Use `-` prefix for descending (e.g., `-nome`).
-   `limit`: Maximum number of results (default: 100, max: 1000).
-   `offset`: Number of results to skip.
-   `fields`: Comma-separated list of fields to include in the response (e.g., `codice,nome,provincia`).

**Example:**
```
GET /comuni?q=milano&provincia=MI&limit=10&fields=nome,cap,popolazione
```

## Data Model

The API uses an in-memory data model based on the following structures:

```typescript
// Comune
interface Comune {
  codice: string;
  nome: string;
  nomeStraniero?: string;
  codiceCatastale: string;
  cap: string[];
  prefisso: string;
  lat: number;
  lng: number;
  provincia: string; // FK -> provincia.codice
  email?: string;
  pec?: string;
  telefono?: string;
  fax?: string;
  popolazione?: number;
}

// Provincia
interface Provincia {
  codice: string;
  nome: string;
  sigla: string;
  regione: string; // FK -> regione.nome
}

// Regione
interface Regione {
  nome: string;
}
```

## Observability

The API uses Pino for structured logging. In production, logs are minimal.

## Performance Constraints

The API is designed for high performance:

-   No ORMs or runtime reflection.
-   Precomputed indexes for fast lookups.
-   Fast JSON serialization via TypeBox schemas.

## Project Structure

```
src/
  data/
    comuni.ts (generated)
    province.ts (generated)
    regioni.ts (generated)
    indexes.ts        # Data loading and in-memory indexes
  http/
    server.ts         # Fastify server setup
    routes/
      comuni.ts       # Comuni routes
      province.ts     # Province routes
      regioni.ts      # Regioni routes
  domain/
    types.ts          # TypeScript interfaces for data models
    normalization.ts  # String normalization utilities
  config/             # Configuration (e.g., environment variables)
data/
  comuni.json         # Raw comuni data (placeholder)
  province.json       # Raw province data (placeholder)
  regioni.json        # Raw regioni data (placeholder)
```
