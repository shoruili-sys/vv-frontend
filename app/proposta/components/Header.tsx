import { Building2, ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-line bg-canvas/95">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <Building2 aria-hidden="true" className="size-6 text-mint" strokeWidth={1.8} />
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-ink">Proposta</p>
            <p className="text-xs text-secondary">Análise imobiliária</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary">
          <ShieldCheck aria-hidden="true" className="size-4 text-mint" />
          <span>Sem login, banco de dados ou envio de informações</span>
        </div>
      </div>
    </header>
  );
}
