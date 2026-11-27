import { useEffect, useRef, useState } from 'react';
import { X, Tag } from 'lucide-react';
import { SERIES_TYPES, type Discount, type DiscountMode, type SeriesType } from '@proposta/types/proposal';
import { formatCurrency, parseNumericInput } from '@proposta/utils/format';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (discount: Discount) => void;
  series: Array<{ id: string; type: SeriesType; value: number; quantity: number }>;
}

const seriesLabels: Record<SeriesType, string> = {
  ATO: 'Ato',
  SINAL: 'Sinal',
  MENSAIS: 'Mensais',
  ANUAIS: 'Anuais',
  CHAVES: 'Chaves',
  FINANCIAMENTO: 'Financiamento',
};

export function DiscountModal({ isOpen, onClose, onApply, series }: DiscountModalProps) {
  const [mode, setMode] = useState<DiscountMode>('percent');
  const [percent, setPercent] = useState('');
  const [value, setValue] = useState('');
  const [target, setTarget] = useState<SeriesType | 'ALL'>('ALL');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const relevantSeries = series.filter((item) => target === 'ALL' || item.type === target);
  const targetTotal = relevantSeries.reduce((sum, item) => sum + item.quantity * item.value, 0);
  const targetLabel = target === 'ALL' ? 'todas as séries' : seriesLabels[target];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === 'percent') {
      const amount = parseNumericInput(percent);
      if (amount <= 0 || amount > 100) {
        setError('Informe um percentual entre 0 e 100%.');
        return;
      }
      onApply({ mode: 'percent', amount, target });
    } else {
      const amount = parseNumericInput(value);
      if (amount <= 0) {
        setError('Informe um valor em reais maior que zero.');
        return;
      }
      if (amount > targetTotal + 0.01) {
        setError(`O valor não pode exceder o total de ${targetLabel} (${formatCurrency(targetTotal)}).`);
        return;
      }
      onApply({ mode: 'value', amount, target });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="discount-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="discount-title" className="modal-title">Aplicar desconto</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <p className="modal-description">
            Utilize esta ferramenta para simular um desconto na condição de pagamento proposta pelo cliente.
            Os valores originais são preservados e podem ser restaurados.
          </p>

          <div className="modal-tabs" role="tablist" aria-label="Tipo de desconto">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'percent'}
              className={`modal-tab ${mode === 'percent' ? 'active' : ''}`}
              onClick={() => { setMode('percent'); setError(''); }}
            >
              Percentual
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'value'}
              className={`modal-tab ${mode === 'value' ? 'active' : ''}`}
              onClick={() => { setMode('value'); setError(''); }}
            >
              Valor em R$
            </button>
          </div>

          <div className="field-group">
            <label htmlFor="discount-amount" className="field-label">
              {mode === 'percent' ? 'Qual percentual deseja conceder?' : 'Qual valor em reais deseja conceder?'}
              <div className="input-with-icon">
                <input
                  id="discount-amount"
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
                  className="field-control"
                  value={mode === 'percent' ? percent : value}
                  onChange={(event) => {
                    if (mode === 'percent') setPercent(event.target.value);
                    else setValue(event.target.value);
                    setError('');
                  }}
                  placeholder={mode === 'percent' ? 'Ex.: 5,00' : 'Ex.: 1.000,00'}
                  aria-describedby="discount-help"
                />
                <span className="input-icon" aria-hidden="true">{mode === 'percent' ? '%' : 'R$'}</span>
              </div>
              <span id="discount-help" className="field-hint">
                {mode === 'percent'
                  ? 'Percentual de 0 a 100% aplicado às parcelas originais.'
                  : `Valor descontado do total de ${targetLabel}, distribuído entre as parcelas. Total: ${formatCurrency(targetTotal)}.`}
              </span>
            </label>
          </div>

          <div className="field-group">
            <label htmlFor="discount-series" className="field-label">
              Deseja aplicar o desconto em qual série?
              <select
                id="discount-series"
                className="field-control"
                value={target}
                onChange={(event) => { setTarget(event.target.value as SeriesType | 'ALL'); setError(''); }}
              >
                <option value="ALL">--Todas--</option>
                {SERIES_TYPES.map((type) => (
                  <option key={type} value={type}>{seriesLabels[type]}</option>
                ))}
              </select>
            </label>
          </div>

          {error && <div className="modal-error" role="alert">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="button-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="button-primary">
              <Tag aria-hidden="true" className="size-4" /> Aplicar desconto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
