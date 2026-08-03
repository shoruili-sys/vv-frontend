import Link from 'next/link';
import { Header, Footer } from './components/Header';

export default function NotFound() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px' }}>
        <div>
          <span className="eyebrow">404 not not</span>
          <h1>Página não encontrada</h1>
          <p style={{ color: 'var(--fg-soft)', marginBottom: 24 }}>
            O empreendimento que você procura pode ter saído do portfólio.
          </p>
          <Link href="/imoveis" className="btn">Ver empreendimentos disponíveis</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
