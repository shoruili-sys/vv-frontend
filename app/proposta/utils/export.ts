import type { AnalysisCriteria } from '@proposta/config/analysisCriteria';
import type {
  AnalysisResult,
  Discount,
  PaymentSeries,
  ProposalData,
  ProposalMetrics,
} from '@proposta/types/proposal';
import { getSeriesTotal } from '@proposta/utils/calculations';
import { describeDiscount } from '@proposta/utils/discount';
import { formatDate, formatMonth, formatNumber, parseNumericInput } from '@proposta/utils/format';

export interface ExportInput {
  proposal: ProposalData;
  series: PaymentSeries[];
  metrics: ProposalMetrics;
  result: AnalysisResult | null;
  criteria: AnalysisCriteria;
  discount: Discount | null;
  analyzedAt: Date | null;
}

const dateTime = (date: Date) => new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
}).format(date);

export function buildJsonExport(input: ExportInput): string {
  const now = new Date();
  return JSON.stringify({
    geradoEm: now.toISOString(),
    analisadoEm: input.analyzedAt?.toISOString() ?? null,
    validoAte: input.analyzedAt ? new Date(input.analyzedAt.getTime() + 24 * 60 * 60 * 1000).toISOString() : null,
    proposta: input.proposal,
    condicoesExibidas: input.series,
    desconto: input.discount,
    criterios: input.criteria,
    metricas: input.metrics,
    resultado: input.result,
  }, null, 2);
}

const escapeCell = (value: string | number): string => {
  const text = typeof value === 'number'
    ? String(value)
    : /^[=+\-@\t\r]/.test(value)
      ? `'${value}`
      : value;
  return `"${text.replace(/"/g, '""')}"`;
};

const line = (cells: (string | number)[]) => cells.map(escapeCell).join(';');
const money = (value: number) => formatNumber(value, 2);

export function buildCsvExport(input: ExportInput): string {
  const { proposal, series, metrics, result, criteria, discount, analyzedAt } = input;
  const rows: string[] = [
    line(['Proposta imobiliária — exportação para auditoria']),
    line(['Gerado em', dateTime(new Date())]),
    line(['Analisado em', analyzedAt ? dateTime(analyzedAt) : 'Não analisado']),
    line([]),
    line(['Unidade', proposal.unit]),
    line(['Data de entrega', formatDate(proposal.deliveryDate)]),
    line(['Área privativa (m²)', formatNumber(parseNumericInput(proposal.area))]),
    line(['Valor nominal de tabela', money(metrics.tableValue)]),
    line(['Total da proposta', money(metrics.totalValue)]),
    line(['Diferença nominal', money(metrics.nominalDifference)]),
    line(['Desconto', describeDiscount(discount)]),
    line([]),
    line(['Critério', 'Valor obtido', 'Limite', 'Situação']),
    line([
      'Prazo da proposta',
      `${metrics.proposalTermMonths} meses`,
      `${criteria.maxFinancingTermMonths} meses`,
      result?.criteria.find((item) => item.id === 'proposalTerm')?.passed ? 'Atendido' : 'Não atendido',
    ]),
    line([
      'Captação à vista',
      `${formatNumber(metrics.cashCapturePercentage, 4)}%`,
      `${formatNumber(criteria.minCashCapturePercentage)}%`,
      result?.criteria.find((item) => item.id === 'cashCapture')?.passed ? 'Atendido' : 'Não atendido',
    ]),
    line([
      'Captação até habite-se − 1',
      `${formatNumber(metrics.preDeliveryCapturePercentage, 4)}%`,
      `${formatNumber(criteria.minPreDeliveryCapturePercentage)}%`,
      result?.criteria.find((item) => item.id === 'preDeliveryCapture')?.passed ? 'Atendido' : 'Não atendido',
    ]),
    line([
      'Captação mensal',
      `${formatNumber(metrics.monthlyCapturePercentage, 4)}%`,
      `${formatNumber(criteria.minMonthlyCapturePercentage)}%`,
      result?.criteria.find((item) => item.id === 'monthlyCapture')?.passed ? 'Atendido' : 'Não atendido',
    ]),
    line([]),
    line(['Série', 'Início', 'Qtd.', 'Valor da parcela', 'Total']),
    ...series.map((item) => line([
      item.type,
      formatMonth(item.startDate),
      item.quantity,
      money(parseNumericInput(item.value)),
      money(getSeriesTotal(item)),
    ])),
    line([]),
    line(['Justificativas da reprovação']),
    ...(result && !result.approved ? result.reasons.map((reason) => line([reason])) : [line(['Nenhuma'])]),
  ];

  // BOM para o Excel reconhecer acentos; ; como separador e " como aspas.
  return `\uFEFF${rows.join('\r\n')}\r\n`;
}

export function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function safeFilename(label: string): string {
  return label.trim().replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'proposta';
}
