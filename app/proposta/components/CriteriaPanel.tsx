import { RotateCcw } from 'lucide-react';
import { ANALYSIS_CRITERIA, type AnalysisCriteria } from '@proposta/config/analysisCriteria';

interface CriteriaPanelProps {
  criteria: AnalysisCriteria;
  onChange: (criteria: AnalysisCriteria) => void;
}

const fields: {
  key: keyof AnalysisCriteria;
  label: string;
  hint: string;
  min: number;
  step: string;
}[] = [
  {
    key: 'maxFinancingTermMonths',
    label: 'Prazo máximo da proposta (meses)',
    hint: 'Meses da primeira série até a entrega, contando os dois meses.',
    min: 1,
    step: '1',
  },
  {
    key: 'minCashCapturePercentage',
    label: 'Captação à vista mínima (%)',
    hint: 'Soma das séries de ato dividida pelo total da proposta.',
    min: 0,
    step: '0.01',
  },
  {
    key: 'minPreDeliveryCapturePercentage',
    label: 'Captação até habite-se − 1 mínima (%)',
    hint: 'Pagamentos antes da entrega, exceto financiamento.',
    min: 0,
    step: '0.01',
  },
  {
    key: 'minMonthlyCapturePercentage',
    label: 'Captação mensal mínima (%)',
    hint: 'Soma de uma parcela de cada série mensal ÷ total.',
    min: 0,
    step: '0.01',
  },
];

export function CriteriaPanel({ criteria, onChange }: CriteriaPanelProps) {
  const handleChange = (key: keyof AnalysisCriteria, value: number) => {
    if (!Number.isFinite(value) || value < 0) return;
    onChange({ ...criteria, [key]: value });
  };

  return (
    <section className="section-block criteria-form print-hidden" aria-labelledby="criteria-settings-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">04 · Configuração</p>
          <h2 id="criteria-settings-title" className="section-title">Critérios usados na análise</h2>
        </div>
        <button
          type="button"
          className="button-ghost"
          onClick={() => onChange({ ...ANALYSIS_CRITERIA })}
        >
          <RotateCcw aria-hidden="true" className="size-4" /> Restaurar padrão
        </button>
      </div>

      <p className="field-hint">
        São premissas definidas por você, não regras emitidas pelas construtoras. Os valores ficam salvos neste navegador e aparecem no relatório impresso.
      </p>

      <div className="criteria-grid">
        {fields.map((field) => (
          <label className="criteria-field" key={field.key}>
            <span>{field.label}</span>
            <input
              className="field-control"
              type="number"
              min={field.min}
              step={field.step}
              value={criteria[field.key]}
              onChange={(event) => handleChange(field.key, event.target.valueAsNumber)}
            />
            <small>{field.hint}</small>
          </label>
        ))}
      </div>
    </section>
  );
}
