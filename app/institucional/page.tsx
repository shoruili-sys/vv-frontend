import { Header, Footer } from '../components/Header';
import styles from '../page.module.css';

export const metadata = { title: 'Institucional' };

export default function InstitucionalPage() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.section} style={{ paddingTop: 60 }}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="eyebrow">Institucional</span>
              <h2>Conheça a Viva Veríssimo</h2>
              <p>
                A Viva Veríssimo é uma consultoria imobiliária dedicada a apresentar
                empreendimentos exclusivos e oferecer atendimento completo em cada etapa
                da negociação.
              </p>
            </div>
            <div style={{ color: 'var(--fg-soft)', lineHeight: 1.8, maxWidth: 760, margin: '0 auto' }}>
              <p>
                Trabalhamos com foco em imóveis de alto padrão e em uma experiência
                transparente para nossos clientes. Nosso time combina conhecimento de
                mercado com atendimento personalizado para entregar resultados confiáveis.
              </p>
              <p>
                Nossa missão é conectar pessoas a imóveis que valorizam o estilo de vida,
                priorizando localização, qualidade e solidez em cada escolha.
              </p>
              <p>
                Se você busca um parceiro de confiança para encontrar seu próximo imóvel,
                conte com a Viva Veríssimo para trazer opções alinhadas ao seu perfil.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
