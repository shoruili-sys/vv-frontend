export function parseNumericInput(input: string): number {
  let normalized = input.trim().replace(/[R$\s%]/g, '');
  if (!normalized) return 0;

  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');

  if (hasComma && hasDot) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    normalized = normalized.replace(',', '.');
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(normalized)) {
    normalized = normalized.replace(/\./g, '');
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export const formatNumber = (value: number, digits = 2) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);

export const formatPercentage = (value: number, digits = 2) =>
  `${formatNumber(value, digits)}%`;

/**
 * Máscara de valor em pt-BR: agrupa os milhares com ponto e mantém a vírgula
 * decimal. Com `fixedDecimals`, completa/arredonda para duas casas (uso no blur).
 */
export function formatDecimalInput(value: string, fixedDecimals = false): string {
  // Aceita também "123456.78" (ponto decimal vindo de toFixed/número) sem
  // transformar as casas decimais em milhares.
  const normalized = !value.includes(',') && /^\d+\.\d{1,2}$/.test(value.trim())
    ? value.trim().replace('.', ',')
    : value;
  const raw = normalized.replace(/[^\d,]/g, '');
  if (!raw) return '';

  const commaIndex = raw.indexOf(',');
  const digits = commaIndex >= 0 ? raw.slice(0, commaIndex) : raw;
  const decimals = commaIndex >= 0 ? raw.slice(commaIndex + 1).replace(/\D/g, '').slice(0, 2) : '';
  const integer = digits.replace(/\D/g, '') || (decimals ? '0' : '');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (fixedDecimals) return `${grouped},${decimals.padEnd(2, '0')}`;
  if (commaIndex >= 0) return `${grouped},${decimals}`;
  return grouped;
}

export function formatMonth(month: string): string {
  if (!/^\d{4}-\d{2}$/.test(month)) return '—';
  const [year, monthNumber] = month.split('-');
  return `${monthNumber}/${year}`;
}

export function formatDate(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return '—';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

export function toMonth(date: string): string {
  return date.slice(0, 7);
}

export function monthsInclusive(startMonth: string, endMonth: string): number {
  if (!/^\d{4}-\d{2}$/.test(startMonth) || !/^\d{4}-\d{2}$/.test(endMonth)) return 0;
  const [startYear, start] = startMonth.split('-').map(Number);
  const [endYear, end] = endMonth.split('-').map(Number);
  return (endYear - startYear) * 12 + end - start + 1;
}
