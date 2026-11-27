import { ANALYSIS_CRITERIA, COMPARISON_EPSILON, type AnalysisCriteria } from '@proposta/config/analysisCriteria';
import type {
  AnalysisResult,
  CriterionResult,
  PaymentSeries,
  ProposalData,
  ProposalMetrics,
} from '@proposta/types/proposal';
import { monthsInclusive, parseNumericInput, toMonth } from '@proposta/utils/format';

export const getSeriesQuantity = (series: PaymentSeries) => parseNumericInput(series.quantity);
export const getSeriesInstallmentValue = (series: PaymentSeries) => parseNumericInput(series.value);
export const getSeriesTotal = (series: PaymentSeries) =>
  getSeriesQuantity(series) * getSeriesInstallmentValue(series);

const percentageOf = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);

export function calculateMetrics(data: ProposalData): ProposalMetrics {
  const totalValue = data.series.reduce((sum, series) => sum + getSeriesTotal(series), 0);
  const area = parseNumericInput(data.area);
  const tableTotal = parseNumericInput(data.tableTotal);
  const tableValue = tableTotal > 0 ? tableTotal : area * parseNumericInput(data.pricePerM2);
  const deliveryMonth = toMonth(data.deliveryDate);
  const startMonths = data.series.map((series) => series.startDate).filter(Boolean).sort();
  // "Prazo da proposta": começa na primeira série de qualquer tipo, não apenas
  // na série de financiamento. O nome antigo era enganoso.
  const proposalTermMonths = startMonths.length
    ? Math.max(0, monthsInclusive(startMonths[0], deliveryMonth))
    : 0;

  const sumMatching = (predicate: (series: PaymentSeries) => boolean) =>
    data.series.filter(predicate).reduce((sum, series) => sum + getSeriesTotal(series), 0);

  const cashValue = sumMatching((series) => series.type === 'ATO');
  const entryValue = cashValue + sumMatching((series) => series.type === 'SINAL');
  const preDeliveryValue = sumMatching(
    (series) => series.type !== 'FINANCIAMENTO' && series.startDate < deliveryMonth,
  );
  const untilDeliveryValue = sumMatching(
    (series) => series.type !== 'FINANCIAMENTO' && series.startDate <= deliveryMonth,
  );
  const monthlyInstallments = data.series
    .filter((series) => series.type === 'MENSAIS')
    .reduce((sum, series) => sum + getSeriesInstallmentValue(series), 0);

  const nominalDifference = totalValue - tableValue;

  return {
    totalValue,
    tableValue,
    nominalDifference,
    nominalDifferencePercentage: percentageOf(nominalDifference, tableValue),
    proposalValuePerM2: area > 0 ? totalValue / area : 0,
    cashCapturePercentage: percentageOf(cashValue, totalValue),
    entryPercentage: percentageOf(entryValue, totalValue),
    preDeliveryCapturePercentage: percentageOf(preDeliveryValue, totalValue),
    captureUntilDeliveryPercentage: percentageOf(untilDeliveryValue, totalValue),
    captureAfterDeliveryPercentage: percentageOf(totalValue - untilDeliveryValue, totalValue),
    monthlyCapturePercentage: percentageOf(monthlyInstallments, totalValue),
    proposalTermMonths,
  };
}

export function validateProposal(data: ProposalData): string[] {
  const errors: string[] = [];
  if (!data.unit.trim()) errors.push('Informe o identificador da unidade.');
  if (!data.deliveryDate) errors.push('Informe a data de entrega.');
  if (parseNumericInput(data.area) <= 0) errors.push('A área privativa deve ser maior que zero.');
  if (parseNumericInput(data.tableTotal) <= 0 && parseNumericInput(data.pricePerM2) <= 0) {
    errors.push('O valor de tabela por m² deve ser maior que zero.');
  }
  if (data.series.length === 0) errors.push('Adicione pelo menos uma série de pagamento.');

  data.series.forEach((series, index) => {
    const label = `Série ${index + 1}`;
    if (!series.startDate) errors.push(`${label}: informe o mês de início.`);
    const quantity = getSeriesQuantity(series);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      errors.push(`${label}: a quantidade deve ser um número inteiro maior que zero.`);
    }
    if (getSeriesInstallmentValue(series) <= 0) {
      errors.push(`${label}: o valor da parcela deve ser maior que zero.`);
    }
  });

  if (data.deliveryDate) {
    const deliveryMonth = toMonth(data.deliveryDate);
    if (data.series.some((series) => series.startDate && series.startDate > deliveryMonth && series.type !== 'FINANCIAMENTO')) {
      errors.push('Somente o financiamento pode começar após o mês de entrega.');
    }
  }

  return errors;
}

export function analyzeProposal(
  data: ProposalData,
  criteriaLimits: AnalysisCriteria = ANALYSIS_CRITERIA,
): AnalysisResult {
  const metrics = calculateMetrics(data);
  const criteria: CriterionResult[] = [
    {
      id: 'proposalTerm',
      label: 'Prazo da proposta',
      proposal: metrics.proposalTermMonths,
      limit: criteriaLimits.maxFinancingTermMonths,
      unit: 'months',
      comparison: 'max',
      passed: metrics.proposalTermMonths <= criteriaLimits.maxFinancingTermMonths + COMPARISON_EPSILON,
      explanation: 'Meses entre o início da primeira série (de qualquer tipo) e a entrega, incluindo os dois meses.',
    },
    {
      id: 'cashCapture',
      label: 'Captação à vista',
      proposal: metrics.cashCapturePercentage,
      limit: criteriaLimits.minCashCapturePercentage,
      unit: 'percentage',
      comparison: 'min',
      passed: metrics.cashCapturePercentage + COMPARISON_EPSILON >= criteriaLimits.minCashCapturePercentage,
      explanation: 'Soma das séries de ato dividida pelo valor total da proposta.',
    },
    {
      id: 'preDeliveryCapture',
      label: 'Captação até habite-se − 1',
      proposal: metrics.preDeliveryCapturePercentage,
      limit: criteriaLimits.minPreDeliveryCapturePercentage,
      unit: 'percentage',
      comparison: 'min',
      passed:
        metrics.preDeliveryCapturePercentage + COMPARISON_EPSILON >=
        criteriaLimits.minPreDeliveryCapturePercentage,
      explanation: 'Pagamentos anteriores ao mês da entrega, exceto financiamento.',
    },
    {
      id: 'monthlyCapture',
      label: 'Captação mensal',
      proposal: metrics.monthlyCapturePercentage,
      limit: criteriaLimits.minMonthlyCapturePercentage,
      unit: 'percentage',
      comparison: 'min',
      passed:
        metrics.monthlyCapturePercentage + COMPARISON_EPSILON >=
        criteriaLimits.minMonthlyCapturePercentage,
      explanation: 'Soma das parcelas mensais, sem multiplicar pela quantidade, sobre o total.',
    },
  ];

  const failed = criteria.filter((criterion) => !criterion.passed);
  const reasons = failed.map((criterion) => {
    const proposal = criterion.unit === 'months'
      ? `${criterion.proposal} meses`
      : `${criterion.proposal.toFixed(4).replace('.', ',')}%`;
    const limit = criterion.unit === 'months'
      ? `${criterion.limit} meses`
      : `${criterion.limit.toFixed(2).replace('.', ',')}%`;
    return `${criterion.label}: ${proposal}; ${criterion.comparison === 'max' ? 'máximo permitido' : 'mínimo exigido'} de ${limit}.`;
  });

  return { approved: failed.length === 0, reasons, criteria, metrics };
}
