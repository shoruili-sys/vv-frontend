import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import styles from '../page.module.css';

export const metadata = { title: 'Minha Casa Minha Vida' };

export default function MinhaCasaMinhaVidaPage() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.section} style={{ paddingTop: 60 }}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="eyebrow">Minha Casa Minha Vida</span>
              <h2>Projetos acessíveis e planejados</h2>
              <p>
                Seleção de imóveis com foco em moradia acessível, qualidade de construção
                e localização estratégica para famílias que querem começar ou crescer.
              </p>
            </div>
            <div style={{ color: 'var(--fg-soft)', lineHeight: 1.8, maxWidth: 760, margin: '0 auto' }}>
              <p>
                Nessa linha, priorizamos o equilíbrio entre custo e experiência de morar,
                com soluções que entregam conforto, segurança e potencial de valorização.
              </p>
              <p>
                Caso queira entender as melhores condições para aquisição e financiamento,
                nossos consultores apresentam as alternativas mais adequadas ao seu caso.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
