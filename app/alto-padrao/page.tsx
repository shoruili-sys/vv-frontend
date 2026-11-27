import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import styles from '../page.module.css';

export const metadata = { title: 'Alto Padrão' };

export default function AltoPadraoPage() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.section} style={{ paddingTop: 60 }}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="eyebrow">Alto padrão</span>
              <h2>Empreendimentos de alto padrão</h2>
              <p>
                Uma seleção de projetos sofisticados, com acabamento premium,
                localização privilegiada e conceito arquitetônico diferenciado.
              </p>
            </div>
            <div style={{ color: 'var(--fg-soft)', lineHeight: 1.8, maxWidth: 760, margin: '0 auto' }}>
              <p>
                Esses imóveis são desenhados para clientes que buscam luxo discreto,
                privacidade e um estilo de vida elevado. Cada empreendimento expressa
                identidade, exclusividade e atenção aos detalhes.
              </p>
              <p>
                Caso queira uma apresentação personalizada de opções de alto padrão,
                estamos prontos para orientar sua escolha com foco em valor e qualidade.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
