import { useLayoutEffect, useRef, useState } from 'react';
import type { CatalogDevelopment } from '@proposta/types/catalog';
import type { UnitData } from '@proposta/types/proposal';
import { formatCurrency, formatDate, formatDecimalInput, parseNumericInput } from '@proposta/utils/format';

interface UnitDataFormProps {
  data: UnitData;
  onChange: (field: keyof UnitData, value: string) => void;
  developments: CatalogDevelopment[];
}

const inputClass = 'field-control';

const toBrazilianNumber = (value: number, digits = 2) =>
  value.toFixed(digits).replace('.', ',');

export function UnitDataForm({ data, onChange, developments }: UnitDataFormProps) {
  // Restaura os selects quando um rascunho/histórico é carregado.
  const initialDevelopment = developments.find((item) => data.unit.startsWith(item.name));
  const initialUnit = initialDevelopment?.units.find((item) => data.unit.endsWith(`U-${item.unit}`));
  const [selectedDevelopmentId, setSelectedDevelopmentId] = useState(initialDevelopment?.id ?? '');
  const [selectedUnitId, setSelectedUnitId] = useState(initialUnit?.id ?? '');
  const totalInputRef = useRef<HTMLInputElement>(null);
  const caretDigitsRef = useRef<number | null>(null);

  // Reposiciona o cursor após a máscara inserir/remover pontos de milhar.
  useLayoutEffect(() => {
    if (caretDigitsRef.current === null) return;
    const input = totalInputRef.current;
    if (!input) return;
    let seen = 0;
    let position = 0;
    while (position < input.value.length && seen < caretDigitsRef.current) {
      if (/\d/.test(input.value[position])) seen += 1;
      position += 1;
    }
    input.setSelectionRange(position, position);
    caretDigitsRef.current = null;
  }, [data.tableTotal]);

  const selectedDevelopment = developments.find((item) => item.id === selectedDevelopmentId);
  const units = selectedDevelopment?.units ?? [];

  const area = parseNumericInput(data.area);
  const tableTotal = parseNumericInput(data.tableTotal);
  const pricePerM2 = parseNumericInput(data.pricePerM2);
  const computedTotal = area > 0 && pricePerM2 > 0 ? area * pricePerM2 : 0;

  const handleDevelopmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDevelopmentId(event.target.value);
    setSelectedUnitId('');
  };

  // Preenchimento acontece no evento do usuário — sem useEffect dependente de
  // callbacks instáveis (isso causava loop de renders na versão anterior).
  const handleUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const unitId = event.target.value;
    setSelectedUnitId(unitId);

    const development = developments.find((item) => item.id === selectedDevelopmentId);
    const unit = development?.units.find((item) => item.id === unitId);
    if (!development || !unit) return;

    onChange('unit', `${development.name} - Bloco ${unit.block} - U-${unit.unit}`);
    // Os PDFs de referência não trazem entrega: só preenche se o catálogo informar.
    if (development.deliveryDate) onChange('deliveryDate', development.deliveryDate);
    onChange('area', toBrazilianNumber(unit.area));
    onChange('pricePerM2', toBrazilianNumber(unit.totalPrice / unit.area, 4));
    onChange('tableTotal', formatDecimalInput(toBrazilianNumber(unit.totalPrice), true));
  };

  const handleTableTotalChange = (value: string) => {
    onChange('tableTotal', value);
    const total = parseNumericInput(value);
    const currentArea = parseNumericInput(data.area);
    onChange('pricePerM2', currentArea > 0 && total > 0
      ? toBrazilianNumber(total / currentArea, 4)
      : '');
  };

  const handleTableTotalInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const cursor = input.selectionStart ?? input.value.length;
    caretDigitsRef.current = input.value.slice(0, cursor).replace(/\D/g, '').length;
    handleTableTotalChange(formatDecimalInput(input.value));
  };

  const handleTableTotalBlur = () => {
    if (!data.tableTotal) return;
    const formatted = formatDecimalInput(data.tableTotal, true);
    if (formatted !== data.tableTotal) onChange('tableTotal', formatted);
  };

  const handleAreaChange = (value: string) => {
    onChange('area', value);
    const newArea = parseNumericInput(value);
    const total = parseNumericInput(data.tableTotal);
    if (newArea > 0 && total > 0) {
      onChange('pricePerM2', toBrazilianNumber(total / newArea, 4));
    }
  };

  return (
    <section aria-labelledby="unit-title" className="section-block">
      <div className="section-heading">
        <div>
          <p className="section-kicker">01 · Unidade</p>
          <h2 id="unit-title" className="section-title">Dados para comparação</h2>
        </div>
        <span className="section-note">Todos os campos são obrigatórios</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <label className="field-label sm:col-span-2 lg:col-span-2">
          Empreendimento
          <select className={inputClass} value={selectedDevelopmentId} onChange={handleDevelopmentChange}>
            <option value="">Selecione um empreendimento</option>
            {developments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}{item.city ? ` (${item.city}${item.state ? `/${item.state}` : ''})` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label sm:col-span-2 lg:col-span-2">
          Unidade do catálogo
          <select className={inputClass} value={selectedUnitId} onChange={handleUnitChange} disabled={!selectedDevelopmentId}>
            <option value="">Selecione uma unidade</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                Bloco {unit.block} · U-{unit.unit} · {toBrazilianNumber(unit.area)} m² · {formatCurrency(unit.totalPrice)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedDevelopment && (
        <div className="field-hint mb-4">
          {selectedDevelopment.deliveryDate
            ? `Entrega cadastrada: ${formatDate(selectedDevelopment.deliveryDate)}.`
            : 'Este empreendimento não informa data de entrega: preencha o campo abaixo.'}
          {selectedDevelopment.financingForecast
            ? ` Financiamento previsto no PDF: ${formatDate(selectedDevelopment.financingForecast)} (não é a entrega).`
            : ''}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="field-label sm:col-span-2">
          Identificação da unidade
          <input
            className={inputClass}
            value={data.unit}
            onChange={(event) => onChange('unit', event.target.value)}
            placeholder="Ex.: Vitta Ferraz - Bloco 01 - U-102"
            autoComplete="off"
          />
        </label>
        <label className="field-label">
          Data de entrega
          <input
            className={inputClass}
            type="date"
            value={data.deliveryDate}
            onChange={(event) => onChange('deliveryDate', event.target.value)}
          />
        </label>
        <label className="field-label">
          Área privativa (m²)
          <input
            className={inputClass}
            inputMode="decimal"
            value={data.area}
            onChange={(event) => handleAreaChange(event.target.value)}
            placeholder="Ex.: 37,52"
          />
        </label>
        <label className="field-label sm:col-span-2 lg:col-span-2">
          Valor total da tabela
          <div className="currency-field">
            <span aria-hidden="true">R$</span>
            <input
              ref={totalInputRef}
              className={inputClass}
              inputMode="decimal"
              value={data.tableTotal}
              onChange={handleTableTotalInput}
              onBlur={handleTableTotalBlur}
              placeholder="Ex.: 258.867,27"
            />
          </div>
          {(computedTotal > 0 || tableTotal > 0) && (
            <span className="field-hint">
              Valor/m² informado: {formatCurrency(pricePerM2)}
              {tableTotal > 0 && Math.abs(computedTotal - tableTotal) > 0.01
                ? ` · Total da tabela: ${formatCurrency(tableTotal)} (prevalece na análise)`
                : ''}
            </span>
          )}
        </label>
      </div>
    </section>
  );
}
