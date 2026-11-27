import { ANALYSIS_CRITERIA, type AnalysisCriteria } from '@proposta/config/analysisCriteria';
import { SERIES_TYPES, type Discount, type PaymentSeries, type ProposalData } from '@proposta/types/proposal';

export interface SavedProposal {
  id: string;
  savedAt: string;
  label: string;
  proposal: ProposalData;
  discount: Discount | null;
  criteria: AnalysisCriteria;
}

type SnapshotInput = Omit<SavedProposal, 'id' | 'label' | 'savedAt'> & {
  id?: string;
  label?: string;
  savedAt?: string;
};

const DRAFT_KEY = 'simulador-proposta:rascunho:v1';
const HISTORY_KEY = 'simulador-proposta:historico:v1';
const CRITERIA_KEY = 'simulador-proposta:criterios:v1';
export const HISTORY_LIMIT = 20;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown) => (typeof value === 'string' ? value : '');

const makeId = () =>
  typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function readJson(key: string): unknown {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as unknown : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Modo privado ou cota excedida: a ferramenta continua funcionando na aba.
  }
}

function removeKey(key: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignora falha de armazenamento.
  }
}

function normalizeSeries(value: unknown): PaymentSeries | null {
  if (!isRecord(value)) return null;
  const type = asString(value.type);
  if (!(SERIES_TYPES as readonly string[]).includes(type)) return null;

  return {
    id: asString(value.id) || makeId(),
    type: type as PaymentSeries['type'],
    startDate: asString(value.startDate),
    quantity: asString(value.quantity),
    value: asString(value.value),
  };
}

function normalizeProposal(value: unknown): ProposalData | null {
  if (!isRecord(value) || !Array.isArray(value.series)) return null;
  const series = value.series.map(normalizeSeries).filter((item): item is PaymentSeries => item !== null);

  return {
    unit: asString(value.unit),
    deliveryDate: asString(value.deliveryDate),
    area: asString(value.area),
    pricePerM2: asString(value.pricePerM2),
    tableTotal: asString(value.tableTotal),
    series,
  };
}

function normalizeCriteria(value: unknown): AnalysisCriteria {
  const pick = (key: keyof AnalysisCriteria, minimum: number) => {
    const raw = isRecord(value) ? value[key] : undefined;
    const number = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(number) && number >= minimum ? number : ANALYSIS_CRITERIA[key];
  };

  return {
    maxFinancingTermMonths: pick('maxFinancingTermMonths', 1),
    minCashCapturePercentage: pick('minCashCapturePercentage', 0),
    minPreDeliveryCapturePercentage: pick('minPreDeliveryCapturePercentage', 0),
    minMonthlyCapturePercentage: pick('minMonthlyCapturePercentage', 0),
  };
}

function normalizeDiscount(value: unknown): Discount | null {
  if (!isRecord(value)) return null;
  const mode = value.mode === 'percent' || value.mode === 'value' ? value.mode : null;
  const amount = Number(value.amount);
  if (!mode || !Number.isFinite(amount) || amount <= 0) return null;

  const target = value.target === 'ALL' || (SERIES_TYPES as readonly string[]).includes(asString(value.target))
    ? value.target as Discount['target']
    : 'ALL';

  return { mode, amount, target };
}

function normalizeSnapshot(value: unknown): SavedProposal | null {
  const proposal = isRecord(value) ? normalizeProposal(value.proposal) : null;
  if (!proposal) return null;

  return {
    id: isRecord(value) ? asString(value.id) || makeId() : makeId(),
    savedAt: isRecord(value) ? asString(value.savedAt) || new Date().toISOString() : new Date().toISOString(),
    label: isRecord(value) ? asString(value.label).trim() || proposal.unit.trim() || 'Simulação sem unidade' : proposal.unit,
    proposal,
    discount: isRecord(value) ? normalizeDiscount(value.discount) : null,
    criteria: isRecord(value) ? normalizeCriteria(value.criteria) : { ...ANALYSIS_CRITERIA },
  };
}

export function createSnapshot(input: SnapshotInput): SavedProposal {
  return {
    id: input.id ?? makeId(),
    savedAt: input.savedAt ?? new Date().toISOString(),
    label: input.label?.trim() || input.proposal.unit.trim() || 'Simulação sem unidade',
    proposal: input.proposal,
    discount: input.discount ?? null,
    criteria: input.criteria,
  };
}

export function loadDraft(): SavedProposal | null {
  return normalizeSnapshot(readJson(DRAFT_KEY));
}

export function saveDraft(input: SnapshotInput): SavedProposal {
  const snapshot = createSnapshot(input);
  writeJson(DRAFT_KEY, snapshot);
  return snapshot;
}

export function clearDraft(): void {
  removeKey(DRAFT_KEY);
}

export function loadHistory(): SavedProposal[] {
  const value = readJson(HISTORY_KEY);
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeSnapshot)
    .filter((item): item is SavedProposal => item !== null)
    .slice(0, HISTORY_LIMIT);
}

export function saveToHistory(snapshot: SavedProposal): SavedProposal[] {
  const next = [snapshot, ...loadHistory().filter((item) => item.id !== snapshot.id)].slice(0, HISTORY_LIMIT);
  writeJson(HISTORY_KEY, next);
  return next;
}

export function removeFromHistory(id: string): SavedProposal[] {
  const next = loadHistory().filter((item) => item.id !== id);
  writeJson(HISTORY_KEY, next);
  return next;
}

export function loadCriteria(): AnalysisCriteria | null {
  const value = readJson(CRITERIA_KEY);
  return value ? normalizeCriteria(value) : null;
}

export function saveCriteria(criteria: AnalysisCriteria): void {
  writeJson(CRITERIA_KEY, criteria);
}
