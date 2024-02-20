// deno-lint-ignore-file no-explicit-any
import { stringify as stringifyXML } from "https://deno.land/x/xml@2.1.3/mod.ts";
import { udocument } from "https://deno.land/x/xml@2.1.3/utils/types.ts";

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

    switch (format) {
      case Format.XML: {
        const page = parseInt(params.get("page") ?? "1");
        const pageSize = parseInt(params.get("pagesize") ?? "500");
        response = this.formatXml(data, page, pageSize);
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

  protected formatXml(data: Array<any>, page: number, pageSize: number): string {
    // Configurazione
    const minPage = 1;
    const maxPageSize = 500;

    // A causa delle risorse limitate, implemento un sistema di paging per le richieste XML
    const sanitizedPage = Math.max(page, minPage);
    const sanitizedPageSize = Math.min(pageSize, maxPageSize);
    const start = Math.max((sanitizedPage - 1) * sanitizedPageSize, 0);
    const end = Math.min(start + sanitizedPageSize, data.length);
    const pageData = data.slice(start, end);

    // Creo XML come richiesto dalla libreria
    // https://github.com/lowlighter/xml?tab=readme-ov-file#features
    const xmlData: unknown = {
      [this.pluralName as string]: {
        "@page": sanitizedPage.toString(),
        "@pagesize": sanitizedPageSize.toString(),
        "@total": data.length.toString(),
        [this.name as string]: pageData,
      },
    };

    return stringifyXML(xmlData as udocument);
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
