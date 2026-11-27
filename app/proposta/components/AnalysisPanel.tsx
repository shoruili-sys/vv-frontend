import { Check, CheckCircle2, CircleDashed, Printer, Tag, X, XCircle } from 'lucide-react';
import { COMPARISON_EPSILON, type AnalysisCriteria } from '@proposta/config/analysisCriteria';
import type { AnalysisResult, CriterionResult, Discount, ProposalMetrics } from '@proposta/types/proposal';
import { describeDiscount } from '@proposta/utils/discount';
import { formatCurrency, formatNumber, formatPercentage } from '@proposta/utils/format';

interface AnalysisPanelProps {
  metrics: ProposalMetrics;
  result: AnalysisResult | null;
  originalTotal: number;
  discount: Discount | null;
  discountValue: number;
  criteria: AnalysisCriteria;
  onPrint: () => void;
  onDiscountClick: () => void;
  onCancelDiscount: () => void;
  onAnalyzeDiscount: () => void;
}

type CriterionRow = {
  id: CriterionResult['id'];
  label: string;
  proposal: number;
  limit: number;
  comparison: CriterionResult['comparison'];
  unit: CriterionResult['unit'];
  explanation: string;
  passed: boolean;
};

function MetricRow({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="metric-row">
      <dt>{label}</dt>
      <dd className={emphasis ? 'text-ink font-semibold' : ''}>{value}</dd>
    </div>
  );
}

export function AnalysisPanel({
  metrics,
  result,
  originalTotal,
  discount,
  discountValue,
  criteria,
  onPrint,
  onDiscountClick,
  onCancelDiscount,
  onAnalyzeDiscount,
}: AnalysisPanelProps) {
  const beforeWidth = Math.max(0, Math.min(100, metrics.captureUntilDeliveryPercentage));
  const afterWidth = Math.max(0, Math.min(100 - beforeWidth, metrics.captureAfterDeliveryPercentage));

  const baseCriteria: Omit<CriterionRow, 'passed'>[] = [
    { id: 'proposalTerm', label: 'Prazo da proposta', proposal: metrics.proposalTermMonths, limit: criteria.maxFinancingTermMonths, comparison: 'max', unit: 'months', explanation: 'Meses entre o início da primeira série (de qualquer tipo) e a entrega, incluindo os dois meses.' },
    { id: 'cashCapture', label: 'Captação à vista', proposal: metrics.cashCapturePercentage, limit: criteria.minCashCapturePercentage, comparison: 'min', unit: 'percentage', explanation: 'Soma das séries de ato dividida pelo valor total da proposta.' },
    { id: 'preDeliveryCapture', label: 'Captação até habite-se − 1', proposal: metrics.preDeliveryCapturePercentage, limit: criteria.minPreDeliveryCapturePercentage, comparison: 'min', unit: 'percentage', explanation: 'Pagamentos anteriores ao mês da entrega, exceto financiamento.' },
    { id: 'monthlyCapture', label: 'Captação mensal', proposal: metrics.monthlyCapturePercentage, limit: criteria.minMonthlyCapturePercentage, comparison: 'min', unit: 'percentage', explanation: 'Soma das parcelas mensais, sem multiplicar pela quantidade, sobre o total.' },
  ];

  const criterionRows: CriterionRow[] = baseCriteria.map((criterion) => {
    const analyzed = result?.criteria.find((item) => item.id === criterion.id);
    const passed = analyzed?.passed ?? (
      criterion.comparison === 'max'
        ? criterion.proposal <= criterion.limit + COMPARISON_EPSILON
        : criterion.proposal + COMPARISON_EPSILON >= criterion.limit
    );
    return { ...criterion, passed };
  });

  return (
    <aside id="analysis" className="analysis-panel" aria-label="Resultado e comparativo">
      <div className="analysis-heading">
        <div>
          <p className="section-kicker">03 · Diagnóstico</p>
          <h2 className="section-title">Análise da proposta</h2>
        </div>
        <div className="flex items-center gap-2 print-hidden">
          {(result || discount) && (
            <button type="button" className="icon-button" onClick={onPrint} aria-label="Imprimir resultado" title="Imprimir resultado">
              <Printer aria-hidden="true" className="size-4" />
            </button>
          )}
          {result && !discount && (
            <button type="button" className="icon-button" onClick={onDiscountClick} aria-label="Aplicar desconto" title="Aplicar desconto">
              <Tag aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>
      </div>

      {result ? (
        <div className={`decision-banner ${result.approved ? 'decision-approved' : 'decision-rejected'}`} role="status">
          {result.approved ? <CheckCircle2 aria-hidden="true" className="size-6" /> : <XCircle aria-hidden="true" className="size-6" />}
          <div>
            <strong>{result.approved ? 'Proposta aprovada' : 'Proposta reprovada'}</strong>
            <p>{result.approved ? 'Todos os quatro critérios foram atendidos.' : `${result.reasons.length} ${result.reasons.length === 1 ? 'critério não atendido' : 'critérios não atendidos'}.`}</p>
          </div>
        </div>
      ) : discount ? (
        <div className="pending-banner discount-banner print-hidden">
          <Tag aria-hidden="true" className="size-5" />
          <p>
            <strong>Simulação de desconto ativa:</strong> {describeDiscount(discount)}.
            Use <strong>Analisar</strong> para validar ou <strong>Cancelar simulação</strong> para restaurar os valores.
          </p>
        </div>
      ) : (
        <div className="pending-banner">
          <CircleDashed aria-hidden="true" className="size-5" />
          <p>Preencha os dados e selecione <strong>Analisar proposta</strong> para verificar os critérios.</p>
        </div>
      )}

      <section className="analysis-section" aria-labelledby="criteria-title">
        <h3 id="criteria-title" className="analysis-subtitle">Critérios de aprovação</h3>
        <div className="criteria-list">
          {criterionRows.map((criterion) => (
            <div className="criterion" key={criterion.id}>
              <span className={`criterion-icon ${result ? (criterion.passed ? 'passed' : 'failed') : ''}`}>
                {result ? (criterion.passed ? <Check aria-hidden="true" className="size-4" /> : <X aria-hidden="true" className="size-4" />) : <span className="status-dot" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-ink">{criterion.label}</p>
                  <p className="criterion-value">
                    {criterion.unit === 'months'
                      ? `${formatNumber(criterion.proposal, 0)} / ${criterion.limit} meses`
                      : `${formatPercentage(criterion.proposal, criterion.id === 'monthlyCapture' ? 4 : 2)} / ${criterion.comparison === 'max' ? 'máx. ' : 'mín. '}${formatPercentage(criterion.limit)}`}
                  </p>
                </div>
                {result && <p className="mt-1 text-xs leading-relaxed text-secondary">{criterion.explanation}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {result && !result.approved && (
        <section className="reason-box" aria-label="Justificativas da reprovação">
          <h3>Por que foi reprovada?</h3>
          <ul>{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </section>
      )}

      {(result || discount) && (
        <section className="analysis-section" aria-labelledby="comparison-title">
          <h3 id="comparison-title" className="analysis-subtitle">Tabela comparativa</h3>
          <dl>
            <MetricRow label="Valor nominal de tabela" value={metrics.tableValue > 0 ? formatCurrency(metrics.tableValue) : '—'} />
            <MetricRow label="Proposta original" value={originalTotal > 0 ? formatCurrency(originalTotal) : '—'} />
            <MetricRow label="Total da proposta" value={metrics.totalValue > 0 ? formatCurrency(metrics.totalValue) : '—'} emphasis />
            <MetricRow label="Diferença nominal" value={metrics.tableValue > 0 && metrics.totalValue > 0 ? `${formatCurrency(metrics.nominalDifference)} (${formatPercentage(metrics.nominalDifferencePercentage)})` : '—'} />
            <MetricRow label="Valor da proposta por m²" value={metrics.proposalValuePerM2 > 0 ? formatCurrency(metrics.proposalValuePerM2) : '—'} />
            <MetricRow label="Entrada · ato + sinal" value={formatPercentage(metrics.entryPercentage)} />
            <MetricRow label="Captação até a entrega" value={formatPercentage(metrics.captureUntilDeliveryPercentage)} />
            <MetricRow label="Captação após a entrega" value={formatPercentage(metrics.captureAfterDeliveryPercentage)} />
            <MetricRow label="Prazo da proposta" value={`${metrics.proposalTermMonths} meses`} />
          </dl>
          <div className="capture-bar" role="img" aria-label={`Captação: ${formatNumber(metrics.captureUntilDeliveryPercentage)}% até a entrega e ${formatNumber(metrics.captureAfterDeliveryPercentage)}% depois`}>
            <span className="capture-before" style={{ width: `${beforeWidth}%` }} />
            <span className="capture-after" style={{ width: `${afterWidth}%` }} />
          </div>
          <div className="capture-legend"><span>Até a entrega</span><span>Após a entrega</span></div>
        </section>
      )}

      {discount && (
        <section className="analysis-section" aria-labelledby="indicators-title">
          <h3 id="indicators-title" className="analysis-subtitle">Indicadores da simulação</h3>
          <dl>
            <MetricRow label="Desconto aplicado" value={`− ${formatCurrency(discountValue)}`} emphasis />
            <MetricRow label="Desconto nominal (proposta - tabela)" value={metrics.tableValue > 0 && metrics.totalValue > 0 ? `${formatCurrency(metrics.nominalDifference)} (${formatPercentage(metrics.nominalDifferencePercentage)})` : '—'} />
            <MetricRow label="Taxa de atratividade" value="—" />
          </dl>
          <div className="discount-actions print-hidden">
            <button type="button" className="button-ghost" onClick={onCancelDiscount}>
              <X className="size-4" /> Cancelar simulação
            </button>
            <button type="button" className="button-primary" onClick={onAnalyzeDiscount}>
              Analisar proposta com desconto
            </button>
          </div>
        </section>
      )}

      <p className="analysis-disclaimer">Análise nominal. Esta versão não calcula valor presente, atratividade ou GRL.</p>
    </aside>
  );
}
