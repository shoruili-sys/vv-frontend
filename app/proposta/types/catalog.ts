export interface CatalogUnit {
  id: string;
  block: string;
  unit: string;
  area: number;
  totalPrice: number;
}

export interface CatalogDevelopment {
  id: string;
  name: string;
  city: string;
  state: string;
  /** ISO yyyy-mm-dd. Vazio quando o PDF não informa a data. */
  deliveryDate: string;
  /** Quando informado no catálogo, substitui o limite padrão de prazo. */
  maxFinancingTermMonths?: number;
  /** "Financiamento previsto" lido do PDF; apenas informativo. */
  financingForecast?: string;
  units: CatalogUnit[];
}

export interface CatalogImportResult {
  developments: CatalogDevelopment[];
  skippedRows: number;
  warnings: string[];
}
