'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { AnalysisPanel } from '@proposta/components/AnalysisPanel';
import { CriteriaPanel } from '@proposta/components/CriteriaPanel';
import { DiscountModal } from '@proposta/components/DiscountModal';
import { Header } from '@proposta/components/Header';
import { PaymentSeriesTable } from '@proposta/components/PaymentSeriesTable';
import { PrintReport } from '@proposta/components/PrintReport';
import { UnitDataForm } from '@proposta/components/UnitDataForm';
import { ANALYSIS_CRITERIA, type AnalysisCriteria } from '@proposta/config/analysisCriteria';
import unitsData from '@proposta/data/units.json';
import type { CatalogDevelopment } from '@proposta/types/catalog';
import type { AnalysisResult, Discount, PaymentSeries, ProposalData, UnitData } from '@proposta/types/proposal';
import { analyzeProposal, calculateMetrics, validateProposal } from '@proposta/utils/calculations';
import { applyDiscount, getDiscountValue } from '@proposta/utils/discount';
import { formatCurrency, parseNumericInput } from '@proposta/utils/format';
import {
  clearDraft,
  loadCriteria,
  loadDraft,
  saveCriteria,
  saveDraft,
} from '@proposta/utils/storage';

// Catálogo gerado uma única vez a partir dos PDFs em docs/ (scripts/gerar_catalogo.py).
const catalog = unitsData.developments as CatalogDevelopment[];

const emptyProposal: ProposalData = {
  unit: '',
  deliveryDate: '',
  area: '',
  pricePerM2: '',
  tableTotal: '',
  series: [],
};

export default function App() {
  const [proposal, setProposal] = useState<ProposalData>(emptyProposal);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [criteria, setCriteria] = useState<AnalysisCriteria>({ ...ANALYSIS_CRITERIA });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [analyzedAt, setAnalyzedAt] = useState<Date | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // O Next.js pré-renderiza no servidor: o localStorage só pode ser lido depois
  // da hidratação, para não divergir do HTML e não apagar o rascunho salvo.
  useEffect(() => {
    const snapshot = loadDraft();
    if (snapshot) {
      setProposal(snapshot.proposal);
      setDiscount(snapshot.discount);
      setCriteria({ ...ANALYSIS_CRITERIA, ...snapshot.criteria });
      setFormKey((key) => key + 1);
    } else {
      const savedCriteria = loadCriteria();
      if (savedCriteria) setCriteria(savedCriteria);
    }
    setHydrated(true);
  }, []);

  // Rascunho e critérios persistem localmente, sem servidor nem login.
  useEffect(() => {
    if (!hydrated) return;
    saveDraft({ proposal, discount, criteria });
  }, [proposal, discount, criteria, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveCriteria(criteria);
  }, [criteria, hydrated]);

  const selectedDevelopment = catalog.find((item) => proposal.unit.startsWith(item.name));
  const catalogTermLimit = selectedDevelopment?.maxFinancingTermMonths;
  const effectiveCriteria = useMemo<AnalysisCriteria>(
    () => catalogTermLimit ? { ...criteria, maxFinancingTermMonths: catalogTermLimit } : criteria,
    [criteria, catalogTermLimit],
  );

  // A proposta original nunca é alterada pelo desconto: a simulação é derivada.
  const series = useMemo(() => applyDiscount(proposal.series, discount), [proposal.series, discount]);
  const displayProposal = useMemo<ProposalData>(() => ({ ...proposal, series }), [proposal, series]);
  const metrics = useMemo(() => calculateMetrics(displayProposal), [displayProposal]);
  const originalTotal = useMemo(() => calculateMetrics(proposal).totalValue, [proposal]);
  const discountValue = useMemo(() => getDiscountValue(proposal.series, discount), [proposal.series, discount]);

  const clearResult = useCallback(() => {
    setResult(null);
    setErrors([]);
    setAnalyzedAt(null);
  }, []);

  const updateUnit = useCallback((field: keyof UnitData, value: string) => {
    setProposal((current) => ({ ...current, [field]: value }));
    clearResult();
  }, [clearResult]);

  const updateSeries = useCallback((id: string, field: keyof PaymentSeries, value: string) => {
    setProposal((current) => ({
      ...current,
      series: current.series.map((item) => item.id === id ? { ...item, [field]: value } : item),
    }));
    clearResult();
  }, [clearResult]);

  const addSeries = useCallback(() => {
    const newSeries: PaymentSeries = {
      id: crypto.randomUUID(),
      type: 'ATO',
      startDate: '',
      quantity: '1',
      value: '',
    };
    setProposal((current) => ({ ...current, series: [...current.series, newSeries] }));
    clearResult();
  }, [clearResult]);

  const removeSeries = useCallback((id: string) => {
    setProposal((current) => ({ ...current, series: current.series.filter((item) => item.id !== id) }));
    clearResult();
  }, [clearResult]);

  const reorderSeries = useCallback((fromIndex: number, toIndex: number) => {
    setProposal((current) => {
      const next = [...current.series];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return { ...current, series: next };
    });
    clearResult();
  }, [clearResult]);

  const handleAnalyze = useCallback(() => {
    const validationErrors = validateProposal(displayProposal);
    setErrors(validationErrors);
    if (validationErrors.length > 0) {
      setResult(null);
      setAnalyzedAt(null);
      return;
    }
    setResult(analyzeProposal(displayProposal, effectiveCriteria));
    setAnalyzedAt(new Date());
  }, [displayProposal, effectiveCriteria]);

  const handleCriteriaChange = useCallback((next: AnalysisCriteria) => {
    setCriteria(next);
    clearResult();
  }, [clearResult]);

  const handleApplyDiscount = useCallback((nextDiscount: Discount) => {
    setDiscount(nextDiscount);
    clearResult();
  }, [clearResult]);

  const handleCancelDiscount = useCallback(() => {
    setDiscount(null);
    clearResult();
  }, [clearResult]);

  const resetProposal = useCallback(() => {
    if (!window.confirm('Limpar todos os dados desta simulação?')) return;
    clearDraft();
    setProposal(emptyProposal);
    setDiscount(null);
    setShowDiscountModal(false);
    setFormKey((key) => key + 1);
    clearResult();
  }, [clearResult]);

  return (
    <>
      <div className="app-shell">
        <Header />
        <main className="mx-auto max-w-[1480px] px-5 pb-10 pt-8 lg:px-8 lg:pt-10">
          <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="page-kicker">Workspace de simulação</p>
              <h1 className="page-title">Analise a estrutura.<br />Decida com clareza.</h1>
              <p className="page-description">Compare condições de pagamento e valide a proposta contra critérios que você ajusta. O rascunho fica salvo apenas neste navegador.</p>
            </div>
            <button type="button" className="button-ghost self-start lg:self-auto print-hidden" onClick={resetProposal}>
              <RotateCcw aria-hidden="true" className="size-4" /> Limpar simulação
            </button>
          </section>

          <section aria-label="Resumo rápido" className="quick-stats">
            <div><span>Proposta</span><strong>{metrics.totalValue > 0 ? formatCurrency(metrics.totalValue) : '—'}</strong></div>
            <div><span>Tabela nominal</span><strong>{metrics.tableValue > 0 ? formatCurrency(metrics.tableValue) : '—'}</strong></div>
            <div><span>Diferença</span><strong className={metrics.nominalDifference < 0 ? 'text-warning' : ''}>{metrics.totalValue > 0 && metrics.tableValue > 0 ? formatCurrency(metrics.nominalDifference) : '—'}</strong></div>
            <div><span>Séries</span><strong>{String(series.length).padStart(2, '0')}</strong></div>
          </section>

          <div className="workspace-grid">
            <div className="workspace-main">
              <UnitDataForm key={formKey} data={proposal} onChange={updateUnit} developments={catalog} />
              <PaymentSeriesTable
                series={series}
                originalSeries={proposal.series}
                originalTotalValue={originalTotal}
                discount={discount}
                onAdd={addSeries}
                onRemove={removeSeries}
                onChange={updateSeries}
                onReorder={reorderSeries}
                onCancelDiscount={handleCancelDiscount}
                onAnalyzeDiscount={handleAnalyze}
              />

              {errors.length > 0 && (
                <div className="validation-box" role="alert" tabIndex={-1}>
                  <div className="flex items-center gap-2 font-semibold text-ink"><AlertTriangle aria-hidden="true" className="size-5 text-warning" /> Revise os dados antes de analisar</div>
                  <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
                </div>
              )}

              <div className="action-bar print-hidden">
                <p>Os dados ficam neste navegador. Revise os critérios antes de analisar.</p>
                <button type="button" className="button-primary" onClick={handleAnalyze}>
                  Analisar proposta <ArrowRight aria-hidden="true" className="size-4" />
                </button>
              </div>

              <CriteriaPanel criteria={criteria} onChange={handleCriteriaChange} />
            </div>

            <AnalysisPanel
              metrics={metrics}
              result={result}
              originalTotal={originalTotal}
              discount={discount}
              discountValue={discountValue}
              criteria={effectiveCriteria}
              onPrint={() => window.print()}
              onDiscountClick={() => setShowDiscountModal(true)}
              onCancelDiscount={handleCancelDiscount}
              onAnalyzeDiscount={handleAnalyze}
            />
          </div>
        </main>
        <footer className="mx-auto flex max-w-[1480px] flex-col gap-2 px-5 pb-8 text-xs leading-relaxed text-secondary sm:flex-row sm:justify-between lg:px-8">
          <span>Uso pessoal · rascunho salvo apenas neste navegador</span>
          <span>Critérios configuráveis na tela</span>
        </footer>

        {showDiscountModal && (
          <DiscountModal
            isOpen
            onClose={() => setShowDiscountModal(false)}
            onApply={handleApplyDiscount}
            series={proposal.series.map((item) => ({
              id: item.id,
              type: item.type,
              value: parseNumericInput(item.value),
              quantity: parseNumericInput(item.quantity),
            }))}
          />
        )}
      </div>

      <PrintReport
        proposal={displayProposal}
        series={series}
        metrics={metrics}
        discount={discount}
        discountValue={discountValue}
        analyzedAt={analyzedAt}
        criteria={effectiveCriteria}
      />
    </>
  );
}
