// deno-lint-ignore-file no-explicit-any
import { stringify as stringifyXML } from "https://deno.land/x/xml@7.0.0/mod.ts";

export enum Format {
  JSON = "json",
  XML = "xml",
  CSV = "csv",
}

export class Formatter {
  name: string;
  pluralName: string;
  headers: any;

  constructor(name: string, pluralName: string) {
    this.name = name;
    this.pluralName = pluralName;
  }

  format(request: Request, data: Array<any>, format: Format = Format.JSON): Response {
    let response: string;
    let mimeType: string;

    // Ottengo query params
    const url = new URL(request.url);
    const params = url.searchParams;

    // Gestisco paging
    const total = data.length;
    let page = null, pageSize = null;
    if (params.has("page") || params.has("pagesize") || format === Format.XML) {
      page = Math.max(parseInt(params.get("page") ?? "1"), 1);
      pageSize = Math.min(parseInt(params.get("pagesize") ?? "500"), 500);
      data = data.slice((page - 1) * pageSize, page * pageSize);
    }

    switch (format) {
      case Format.XML: {
        response = this.formatXml(data, total, page!, pageSize!);
        mimeType = "application/xml";
        break;
      }
      case Format.CSV: {
        response = this.formatCsv(data);
        mimeType = "text/csv";
        break;
      }
      default: {
        response = this.formatJson(data);
        mimeType = "application/json";
        break;
      }
    }

    return new Response(response, {
      headers: { ...this.headers, "Content-Type": mimeType },
      status: 200,
    });
  }

  protected formatJson(data: Array<any>): string {
    return JSON.stringify(data);
  }

  protected formatXml(data: Array<any>, total: number, page: number, pageSize: number): string {
    // Creo XML come richiesto dalla libreria
    // https://github.com/lowlighter/xml?tab=readme-ov-file#features
    const xmlData = {
      "@version": "1.0",
      "@encoding": "UTF-8",
      [this.pluralName as string]: {
        "@page": page.toString(),
        "@pagesize": pageSize.toString(),
        "@total": total.toString(),
        [this.name as string]: data,
      },
    };

    return stringifyXML(xmlData);
  }

  protected formatCsv(data: Array<any>): string {
    // Configurazione
    const separator = ";";

    // Se l'array è composto da oggetti complessi, estraggo i dati
    // altrimenti ritorno un CSV con una sola colonna
    if (data[0] && typeof data[0] !== "string") {
        // Get headers
        const firstItem = data[0] ? this.flattenObject(data[0]) : {};
        const headers = Object.keys(firstItem);

        // Get values
        const values = data.map((row) => Object.values(this.flattenObject(row)));
    
        // Create CSV
        return [headers.join(separator), ...values.map((row) => row.join(separator))].join("\n");
    } else {
        return ["nome", ...data].join("\n");
    }

  }

  protected flattenObject(obj: any): any {
    const flattened: any = {};

    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        const flatObject = this.flattenObject(obj[key]);
        Object.keys(flatObject).forEach((subKey) => {
          flattened[`${key}_${subKey}`] = flatObject[subKey];
        });
      } else {
        flattened[key] = obj[key];
      }
    });

    return flattened;
  }
}
