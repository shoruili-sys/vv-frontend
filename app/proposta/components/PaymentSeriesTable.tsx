import { useState } from 'react';
import { Plus, Trash2, GripVertical, Tag, X, ArrowRight } from 'lucide-react';
import { SERIES_TYPES, type Discount, type PaymentSeries, type SeriesType } from '@proposta/types/proposal';
import { getSeriesTotal } from '@proposta/utils/calculations';
import { formatCurrency, formatMonth, formatPercentage, parseNumericInput } from '@proposta/utils/format';

interface PaymentSeriesTableProps {
  /** Séries já exibidas (com desconto aplicado, quando houver). */
  series: PaymentSeries[];
  /** Snapshot das séries antes do desconto. */
  originalSeries: PaymentSeries[];
  /** Total da proposta original, sem desconto. */
  originalTotalValue: number;
  discount: Discount | null;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof PaymentSeries, value: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onCancelDiscount: () => void;
  onAnalyzeDiscount: () => void;
}

const typeLabels: Record<SeriesType, string> = {
  ATO: 'Ato',
  SINAL: 'Sinal',
  MENSAIS: 'Mensais',
  ANUAIS: 'Anuais',
  CHAVES: 'Chaves',
  FINANCIAMENTO: 'Financiamento',
};

export function PaymentSeriesTable({
  series,
  originalSeries,
  originalTotalValue,
  discount,
  onAdd,
  onRemove,
  onChange,
  onReorder,
  onCancelDiscount,
  onAnalyzeDiscount,
}: PaymentSeriesTableProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const discountActive = discount !== null;
  const displayTotal = series.reduce((sum, item) => sum + getSeriesTotal(item), 0);
  const difference = Math.max(0, originalTotalValue - displayTotal);
  const differencePercentage = originalTotalValue > 0 ? (difference / originalTotalValue) * 100 : 0;

  const handleDragStart = (event: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    event.dataTransfer.effectAllowed = 'move';
    event.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = (event: React.DragEvent) => {
    event.currentTarget.classList.remove('dragging');
    setDraggedIndex(null);
  };

  const handleDrop = (event: React.DragEvent, targetIndex: number) => {
    event.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) onReorder(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  const handleDivideTotal = (item: PaymentSeries) => {
    const quantity = parseNumericInput(item.quantity);
    const total = parseNumericInput(item.value);
    if (quantity > 0 && total > 0) {
      onChange(item.id, 'value', (total / quantity).toFixed(2).replace('.', ','));
    }
  };

  const hasDiscount = (item: PaymentSeries) =>
    discount !== null && discount.amount > 0 && (discount.target === 'ALL' || item.type === discount.target);

  const getOriginalTotal = (item: PaymentSeries) => {
    const original = originalSeries.find((candidate) => candidate.id === item.id);
    return original ? getSeriesTotal(original) : getSeriesTotal(item);
  };

  return (
    <section aria-labelledby="series-title" className="section-block pb-0">
      <div className="section-heading">
        <div>
          <p className="section-kicker">02 · Proposta do cliente</p>
          <h2 id="series-title" className="section-title">Séries de pagamento</h2>
        </div>
        <button type="button" className="button-secondary" onClick={onAdd} disabled={discountActive}>
          <Plus aria-hidden="true" className="size-4" /> Adicionar série
        </button>
      </div>

      {series.length === 0 ? (
        <div className="empty-series">
          <p>Nenhuma parcela adicionada.</p>
          <span>Comece pelo ato e inclua as demais condições da proposta.</span>
          <button type="button" className="text-button" onClick={onAdd}>Adicionar primeira série</button>
        </div>
      ) : (
        <>
          <div className="series-desktop" role="table" aria-label="Séries da proposta">
            <div className="series-grid series-header" role="row">
              <span role="columnheader">Ordem</span>
              <span role="columnheader">Série</span>
              <span role="columnheader">Início</span>
              <span role="columnheader">Qtd.</span>
              <span role="columnheader">Valor da parcela</span>
              <span role="columnheader">Total</span>
              <span role="columnheader">%</span>
              <span aria-label="Ações" />
            </div>
            {series.map((item, index) => {
              const total = getSeriesTotal(item);
              const originalTotal = getOriginalTotal(item);
              const discounted = hasDiscount(item);

              return (
                <div
                  className={`series-grid series-row ${discounted ? 'has-discount' : ''}`}
                  role="row"
                  key={item.id}
                  draggable={!discountActive}
                  onDragStart={(event) => handleDragStart(event, index)}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDrop={(event) => handleDrop(event, index)}
                >
                  <button type="button" className="drag-handle" aria-label={`Mover série ${index + 1}`} tabIndex={-1} disabled={discountActive}>
                    <GripVertical aria-hidden="true" className="size-4" />
                  </button>
                  <select
                    aria-label={`Tipo da série ${index + 1}`}
                    className="table-control"
                    value={item.type}
                    onChange={(event) => onChange(item.id, 'type', event.target.value)}
                    disabled={discountActive}
                  >
                    {SERIES_TYPES.map((type) => <option value={type} key={type}>{typeLabels[type]}</option>)}
                  </select>
                  <input
                    aria-label={`Início da série ${index + 1}`}
                    className="table-control"
                    type="month"
                    value={item.startDate}
                    onChange={(event) => onChange(item.id, 'startDate', event.target.value)}
                    disabled={discountActive}
                  />
                  <input
                    aria-label={`Quantidade da série ${index + 1}`}
                    className="table-control text-right"
                    inputMode="numeric"
                    value={item.quantity}
                    onChange={(event) => onChange(item.id, 'quantity', event.target.value)}
                    disabled={discountActive}
                  />
                  <div className="flex items-center gap-1">
                    <input
                      aria-label={`Valor da parcela da série ${index + 1}`}
                      className="table-control text-right flex-1"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={item.value}
                      onChange={(event) => onChange(item.id, 'value', event.target.value)}
                      disabled={discountActive}
                    />
                    {!discountActive && (
                      <button
                        type="button"
                        className="icon-button text-xs font-semibold px-2 py-1 min-h-[36px]"
                        onClick={() => handleDivideTotal(item)}
                        aria-label="Dividir o valor informado pela quantidade para obter a parcela"
                        title="Dividir valor total informado pela quantidade"
                      >
                        D
                      </button>
                    )}
                    {discounted && <span className="discount-badge" title="Valor com desconto aplicado"><Tag className="size-3" /></span>}
                  </div>
                  <output className="table-number" aria-label={`Total da série ${index + 1}`}>
                    {formatCurrency(total)}
                    {discounted && <span className="original-value"> ({formatCurrency(originalTotal)})</span>}
                  </output>
                  <output className="table-number text-secondary">{formatPercentage(displayTotal > 0 ? total / displayTotal * 100 : 0)}</output>
                  <button type="button" className="icon-button" onClick={() => onRemove(item.id)} aria-label={`Remover série ${index + 1}`} disabled={discountActive}>
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                </div>
              );
            })}

            {discountActive && (
              <div className="series-grid series-row difference-row" role="row">
                <span />
                <span className="font-semibold text-ink">Desconto aplicado</span>
                <span />
                <span />
                <span />
                <output className="table-number font-semibold text-ink">− {formatCurrency(difference)}</output>
                <output className="table-number text-secondary">{formatPercentage(differencePercentage)}</output>
                <span />
              </div>
            )}
          </div>

          <div className="series-mobile">
            {series.map((item, index) => {
              const total = getSeriesTotal(item);
              const originalTotal = getOriginalTotal(item);
              const discounted = hasDiscount(item);
              return (
                <article className={`mobile-series ${discounted ? 'has-discount' : ''}`} key={item.id} aria-label={`Série ${index + 1}`}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="mobile-series-index">Série {String(index + 1).padStart(2, '0')}</span>
                    <button type="button" className="icon-button" onClick={() => onRemove(item.id)} aria-label={`Remover série ${index + 1}`} disabled={discountActive}>
                      <Trash2 aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="field-label col-span-2">Tipo
                      <select className="field-control" value={item.type} onChange={(event) => onChange(item.id, 'type', event.target.value)} disabled={discountActive}>
                        {SERIES_TYPES.map((type) => <option value={type} key={type}>{typeLabels[type]}</option>)}
                      </select>
                    </label>
                    <label className="field-label">Início
                      <input className="field-control" type="month" value={item.startDate} onChange={(event) => onChange(item.id, 'startDate', event.target.value)} disabled={discountActive} />
                    </label>
                    <label className="field-label">Quantidade
                      <input className="field-control" inputMode="numeric" value={item.quantity} onChange={(event) => onChange(item.id, 'quantity', event.target.value)} disabled={discountActive} />
                    </label>
                    <label className="field-label col-span-2">Valor da parcela
                      <div className="flex items-center gap-2">
                        <input className="field-control flex-1" inputMode="decimal" placeholder="0,00" value={item.value} onChange={(event) => onChange(item.id, 'value', event.target.value)} disabled={discountActive} />
                        {!discountActive && (
                          <button
                            type="button"
                            className="icon-button text-xs font-semibold px-3 min-h-[44px]"
                            onClick={() => handleDivideTotal(item)}
                            aria-label="Dividir o valor informado pela quantidade"
                            title="Dividir valor total informado pela quantidade"
                          >
                            D
                          </button>
                        )}
                        {discounted && <span className="discount-badge"><Tag className="size-3" /></span>}
                      </div>
                      {discounted && <span className="text-xs text-secondary">Original: {formatCurrency(originalTotal / (parseNumericInput(item.quantity) || 1))}</span>}
                    </label>
                  </div>
                  <div className="mobile-series-total">
                    <span>{formatMonth(item.startDate)}</span>
                    <strong>{formatCurrency(total)}{discounted && ` (era ${formatCurrency(originalTotal)})`}</strong>
                    <span>{formatPercentage(displayTotal > 0 ? total / displayTotal * 100 : 0)}</span>
                  </div>
                </article>
              );
            })}

            {discountActive && (
              <div className="mobile-series difference-row">
                <div className="mobile-series-total">
                  <span>Desconto aplicado</span>
                  <strong className="text-ink">− {formatCurrency(difference)}</strong>
                  <span>{formatPercentage(differencePercentage)}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="series-footer">
        <span>{series.length} {series.length === 1 ? 'série' : 'séries'}</span>
        <div className="text-right">
          {discountActive && (
            <div className="mb-2 text-sm text-secondary">
              Desconto: <strong className="text-ink">− {formatCurrency(difference)}</strong>
            </div>
          )}
          <span className="mr-3 text-xs uppercase tracking-wider text-secondary">Total</span>
          <strong className="font-display text-xl text-ink">{formatCurrency(displayTotal)}</strong>
        </div>
      </div>

      {discountActive && (
        <div className="discount-actions print-hidden">
          <button type="button" className="button-ghost" onClick={onCancelDiscount}>
            <X className="size-4" /> Cancelar simulação
          </button>
          <button type="button" className="button-primary" onClick={onAnalyzeDiscount}>
            Analisar <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      )}
    </section>
  );
}
