import type { Discount, PaymentSeries, SeriesType } from '@proposta/types/proposal';
import { getSeriesTotal } from '@proposta/utils/calculations';
import { parseNumericInput } from '@proposta/utils/format';

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const toBrazilianNumber = (value: number) => round2(value).toFixed(2).replace('.', ',');

/**
 * Aplica o desconto SEM alterar as séries originais. Sempre que `originalSeries`
 * é informado, o cálculo parte do valor original — evita descontos compostos.
 *
 * - Percentual: reduz cada parcela do montante selecionado.
 * - Valor em R$: reduz o TOTAL do montante selecionado e distribui a redução
 *   proporcionalmente entre as parcelas (não desconta o valor de cada parcela).
 */
export function applyDiscount(
  series: PaymentSeries[],
  discount: Discount | null,
  originalSeries?: PaymentSeries[],
): PaymentSeries[] {
  if (!discount || discount.amount <= 0) return series;

  const originalOf = (item: PaymentSeries) =>
    originalSeries?.find((candidate) => candidate.id === item.id) ?? item;
  const appliesTo = (item: PaymentSeries) =>
    discount.target === 'ALL' || item.type === discount.target;
  const quantityOf = (item: PaymentSeries) => Math.max(1, parseNumericInput(originalOf(item).quantity));

  if (discount.mode === 'percent') {
    const factor = 1 - discount.amount / 100;
    return series.map((item) => appliesTo(item)
      ? { ...item, value: toBrazilianNumber(parseNumericInput(originalOf(item).value) * factor) }
      : item);
  }

  // Modo "valor": o desconto incide sobre o total das séries escolhidas.
  const targets = series.filter(appliesTo);
  if (targets.length === 0) return series;

  const totals = targets.map((item) => {
    const original = originalOf(item);
    return quantityOf(item) * parseNumericInput(original.value);
  });
  const totalSelected = totals.reduce((sum, value) => sum + value, 0);
  if (totalSelected <= 0) return series;

  const applied = Math.min(discount.amount, totalSelected);
  const desiredTotal = totalSelected - applied;
  const desiredBySeries = totals.map((value) => (desiredTotal * value) / totalSelected);
  const values = desiredBySeries.map((value, index) => round2(value / quantityOf(targets[index])));

  // Ajusta a última parcela para absorver centavos de arredondamento.
  const actualTotal = values.reduce((sum, value, index) => sum + value * quantityOf(targets[index]), 0);
  const difference = desiredTotal - actualTotal;
  if (targets.length > 0 && Math.abs(difference) >= 0.005) {
    const last = targets.length - 1;
    values[last] = round2(values[last] + difference / quantityOf(targets[last]));
  }

  const discountedById = new Map(targets.map((item, index) => [item.id, toBrazilianNumber(values[index])]));
  return series.map((item) => {
    const value = discountedById.get(item.id);
    return value === undefined ? item : { ...item, value };
  });
}

export function getTotal(series: PaymentSeries[]): number {
  return series.reduce((sum, item) => sum + getSeriesTotal(item), 0);
}

/** Diferença em reais entre a proposta original e a proposta com desconto. */
export function getDiscountValue(series: PaymentSeries[], discount: Discount | null): number {
  if (!discount || discount.amount <= 0) return 0;
  const originalTotal = getTotal(series);
  const discountedTotal = getTotal(applyDiscount(series, discount, series));
  return Math.max(0, originalTotal - discountedTotal);
}

export function getTargetTotal(series: PaymentSeries[], target: SeriesType | 'ALL'): number {
  return getTotal(series.filter((item) => target === 'ALL' || item.type === target));
}

export function describeDiscount(discount: Discount | null): string {
  if (!discount || discount.amount <= 0) return 'sem desconto';
  const target = discount.target === 'ALL' ? 'todas as séries' : discount.target;
  const amount = discount.amount.toFixed(2).replace('.', ',');
  return discount.mode === 'percent'
    ? `${amount}% em ${target}`
    : `R$ ${amount} no total de ${target}`;
}
