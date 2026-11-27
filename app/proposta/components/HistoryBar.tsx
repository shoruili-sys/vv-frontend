import type { SavedProposal } from '@proposta/utils/storage';

interface HistoryBarProps {
  history: SavedProposal[];
  selectedId: string;
  status: string;
  onSelect: (id: string) => void;
  onSave: () => void;
  onLoad: () => void;
  onDelete: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
}

const formatTimestamp = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
};

const buttonClass = 'disabled:cursor-not-allowed disabled:opacity-50';

export function HistoryBar({
  history,
  selectedId,
  status,
  onSelect,
  onSave,
  onLoad,
  onDelete,
  onExportJson,
  onExportCsv,
}: HistoryBarProps) {
  return (
    <section className="history-bar print-hidden" aria-label="Rascunho e histórico local">
      <div>
        <h2 className="history-title">Rascunho e histórico</h2>
        <p className="history-hint">Salvo automaticamente neste navegador. Guarde versões para comparar depois.</p>
      </div>

      <select
        aria-label="Versões salvas"
        value={selectedId}
        onChange={(event) => onSelect(event.target.value)}
      >
        <option value="">{history.length ? 'Selecione uma versão salva' : 'Nenhuma versão salva'}</option>
        {history.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label} · {formatTimestamp(item.savedAt)}
          </option>
        ))}
      </select>

      <div className="history-actions">
        <button type="button" className={buttonClass} onClick={onSave}>Salvar versão</button>
        <button type="button" className={buttonClass} onClick={onLoad} disabled={!selectedId}>Carregar</button>
        <button type="button" className={buttonClass} onClick={onDelete} disabled={!selectedId}>Excluir</button>
        <button type="button" className={buttonClass} onClick={onExportJson}>Exportar JSON</button>
        <button type="button" className={buttonClass} onClick={onExportCsv}>Exportar CSV</button>
      </div>

      {status && <p className="history-hint" role="status">{status}</p>}
    </section>
  );
}
