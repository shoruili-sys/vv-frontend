export const SERIES_TYPES = [
  'ATO',
  'SINAL',
  'MENSAIS',
  'ANUAIS',
  'CHAVES',
  'FINANCIAMENTO',
] as const;

export type SeriesType = (typeof SERIES_TYPES)[number];

export interface PaymentSeries {
  id: string;
  type: SeriesType;
  startDate: string;
  quantity: string;
  value: string;
}

export interface UnitData {
  unit: string;
  deliveryDate: string;
  area: string;
  pricePerM2: string;
  /** Valor total da tabela da unidade. Quando informado, prevalece sobre área × valor/m². */
  tableTotal: string;
}

export interface ProposalData extends UnitData {
  series: PaymentSeries[];
}

export type DiscountMode = 'percent' | 'value';

export interface Discount {
  mode: DiscountMode;
  /** Percentual (0–100) ou valor em reais por série, conforme mode. */
  amount: number;
  target: SeriesType | 'ALL';
}

export interface ProposalMetrics {
  totalValue: number;
  tableValue: number;
  nominalDifference: number;
  nominalDifferencePercentage: number;
  proposalValuePerM2: number;
  cashCapturePercentage: number;
  entryPercentage: number;
  preDeliveryCapturePercentage: number;
  captureUntilDeliveryPercentage: number;
  captureAfterDeliveryPercentage: number;
  monthlyCapturePercentage: number;
  /** Meses entre o início da primeira série e a entrega (ambos inclusivos). */
  proposalTermMonths: number;
}

export interface CriterionResult {
  id: 'proposalTerm' | 'cashCapture' | 'preDeliveryCapture' | 'monthlyCapture';
  label: string;
  proposal: number;
  limit: number;
  unit: 'months' | 'percentage';
  comparison: 'max' | 'min';
  passed: boolean;
  explanation: string;
}

export interface AnalysisResult {
  approved: boolean;
  reasons: string[];
  criteria: CriterionResult[];
  metrics: ProposalMetrics;
}
