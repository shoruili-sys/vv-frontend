import type { AnalysisCriteria } from '@proposta/config/analysisCriteria';
import { CONTACT } from '@proposta/config/contact';
import type { Discount, PaymentSeries, ProposalData, ProposalMetrics } from '@proposta/types/proposal';
import { describeDiscount } from '@proposta/utils/discount';
import { getSeriesTotal } from '@proposta/utils/calculations';
import { formatCurrency, formatDate, formatMonth, formatNumber, formatPercentage, parseNumericInput } from '@proposta/utils/format';

interface PrintReportProps {
  proposal: ProposalData;
  series: PaymentSeries[];
  metrics: ProposalMetrics;
  discount: Discount | null;
  discountValue: number;
  analyzedAt: Date | null;
  criteria: AnalysisCriteria;
}

const typeLabels: Record<PaymentSeries['type'], string> = {
  ATO: 'Ato',
  SINAL: 'Sinal',
  MENSAIS: 'Mensais',
  ANUAIS: 'Anuais',
  CHAVES: 'Chaves',
  FINANCIAMENTO: 'Financiamento',
};

const dateTime = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);

export function PrintReport({
  proposal,
  series,
  metrics,
  discount,
  discountValue,
  analyzedAt,
  criteria,
}: PrintReportProps) {
  const issuedAt = analyzedAt ?? new Date();
  const validUntil = new Date(issuedAt.getTime() + 24 * 60 * 60 * 1000);
  const displayTotal = series.reduce((sum, item) => sum + getSeriesTotal(item), 0);

  return (
    <div className="print-report">
      <header className="print-header">
        <div>
          <div className="print-brand">Simulador de proposta imobiliária</div>
          <h1 className="print-title">Relatório de análise de proposta</h1>
          <p className="print-subtitle">Comparação nominal entre a condição proposta e a tabela de venda da unidade.</p>
        </div>
        <div className="print-contact">
          <strong>{CONTACT.name}</strong>
          <span>{CONTACT.phone}</span>
          <span>{CONTACT.instagram}</span>
        </div>
      </header>

      <div className="print-validity">
        <strong>Valor válido por 24 horas</strong>
        <span>
          Emitido em {dateTime(issuedAt)} · Válido até {dateTime(validUntil)}
        </span>
      </div>

      <section className="print-section">
        <h2 className="print-section-title">01 · Unidade</h2>
        <div className="print-meta">
          <div className="print-meta-item">
            <span className="print-meta-label">Unidade</span>
            <span className="print-meta-value">{proposal.unit || '—'}</span>
          </div>
          <div className="print-meta-item">
            <span className="print-meta-label">Data de entrega</span>
            <span className="print-meta-value">{formatDate(proposal.deliveryDate)}</span>
          </div>
          <div className="print-meta-item">
            <span className="print-meta-label">Área privativa</span>
            <span className="print-meta-value">{formatNumber(parseNumericInput(proposal.area))} m²</span>
          </div>
          <div className="print-meta-item">
            <span className="print-meta-label">Valor da tabela</span>
            <span className="print-meta-value">{formatCurrency(metrics.tableValue)}</span>
          </div>
        </div>
      </section>

      <section className="print-section">
        <h2 className="print-section-title">02 · Condições de pagamento</h2>
        <table className="print-table">
          <thead>
            <tr>
              <th>Série</th>
              <th>Início</th>
              <th className="num">Qtd.</th>
              <th className="num">Valor da parcela</th>
              <th className="num">Total</th>
              <th className="num">%</th>
            </tr>
          </thead>
          <tbody>
            {series.map((item) => {
              const total = getSeriesTotal(item);
              return (
                <tr key={item.id}>
                  <td>{typeLabels[item.type]}</td>
                  <td>{formatMonth(item.startDate)}</td>
                  <td className="num">{item.quantity}</td>
                  <td className="num">{formatCurrency(parseNumericInput(item.value))}</td>
                  <td className="num">{formatCurrency(total)}</td>
                  <td className="num">{formatPercentage(displayTotal > 0 ? (total / displayTotal) * 100 : 0)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            {discount && (
              <tr>
                <td colSpan={4}>Desconto aplicado ({describeDiscount(discount)})</td>
                <td className="num">− {formatCurrency(discountValue)}</td>
                <td className="num">{formatPercentage(0)}</td>
              </tr>
            )}
            <tr>
              <td colSpan={4}>Total da proposta</td>
              <td className="num">{formatCurrency(displayTotal)}</td>
              <td className="num">100,00%</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="print-section">
        <h2 className="print-section-title">03 · Comparativo financeiro</h2>
        <dl className="print-summary">
          <div><dt>Valor nominal de tabela</dt><dd>{formatCurrency(metrics.tableValue)}</dd></div>
          <div><dt>Total da proposta</dt><dd>{formatCurrency(displayTotal)}</dd></div>
          <div><dt>Diferença nominal</dt><dd>{formatCurrency(metrics.nominalDifference)} ({formatPercentage(metrics.nominalDifferencePercentage)})</dd></div>
          <div><dt>Valor da proposta por m²</dt><dd>{formatCurrency(metrics.proposalValuePerM2)}</dd></div>
          <div><dt>Entrada (ato + sinal)</dt><dd>{formatPercentage(metrics.entryPercentage)}</dd></div>
          <div><dt>Captação até a entrega</dt><dd>{formatPercentage(metrics.captureUntilDeliveryPercentage)}</dd></div>
          <div><dt>Captação após a entrega</dt><dd>{formatPercentage(metrics.captureAfterDeliveryPercentage)}</dd></div>
          <div><dt>Prazo da proposta</dt><dd>{metrics.proposalTermMonths} meses</dd></div>
        </dl>
      </section>

      <footer className="print-footer">
        <span><strong>Validade: 24 horas</strong> a partir de {dateTime(issuedAt)} — até {dateTime(validUntil)}.</span>
        <span>Análise nominal. Não inclui valor presente, equivalência de fluxo, atratividade ou GRL. Uso pessoal.</span>
        <p className="print-disclaimer">
          Proposta sujeita a aprovação da construtora. Valores nominais; diferenças de centavos podem ocorrer no arredondamento das parcelas e são toleradas nas comparações. Critérios considerados: prazo da proposta até {formatNumber(criteria.maxFinancingTermMonths, 0)} meses; captação à vista mínima de {formatNumber(criteria.minCashCapturePercentage)}%; captação até habite-se − 1 mínima de {formatNumber(criteria.minPreDeliveryCapturePercentage)}%; captação mensal mínima de {formatNumber(criteria.minMonthlyCapturePercentage, 4)}%. O diagnóstico detalhado permanece apenas na tela.
        </p>
      </footer>
    </div>
  );
}
