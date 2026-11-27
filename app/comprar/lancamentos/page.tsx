import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import styles from '../../page.module.css';

export const metadata = { title: 'Lançamentos' };

export default function LancamentosPage() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.section} style={{ paddingTop: 60 }}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="eyebrow">Lançamentos</span>
              <h2>Os empreendimentos mais recentes</h2>
              <p>
                Explore lançamentos e lançamentos exclusivos selecionados para
                quem busca investimento e qualidade de vida.
              </p>
            </div>
            <div style={{ color: 'var(--fg-soft)', lineHeight: 1.8, maxWidth: 760, margin: '0 auto' }}>
              <p>
                Aqui reunimos os projetos novos com maior potencial de valorização e as
                melhores condições de compra. Cada lançamento tem um perfil selecionado,
                pensado para famílias, investidores ou quem busca morar com conforto.
              </p>
              <p>
                Se você deseja receber uma curadoria personalizada de lançamentos,
                entre em contato e vamos apresentar as opções mais alinhadas ao seu
                objetivo.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
