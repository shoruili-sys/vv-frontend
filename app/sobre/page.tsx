import { Header, Footer } from '../components/Header';
import styles from '../page.module.css';

export const metadata = { title: 'Sobre' };

export default function SobrePage() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.section} style={{ paddingTop: 60 }}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="eyebrow">Sobre mim</span>
              <h2>Minha trajetória no mercado imobiliário</h2>
              <p>
                Sou especialista em imóveis de alto padrão e atuo para oferecer atendimento
                próximo, transparente e orientado às necessidades de cada cliente.
              </p>
            </div>
            <div style={{ color: 'var(--fg-soft)', lineHeight: 1.8, maxWidth: 760, margin: '0 auto' }}>
              <p>
                Com anos de experiência em intermediação de imóveis residenciais e comerciais,
                construí uma abordagem baseada em escuta ativa, análise de mercado e
                apresentação de opções reais.
              </p>
              <p>
                Acredito que a compra ou venda de um imóvel deve ser feita com clareza,
                honestidade e atenção aos detalhes. Por isso, busco sempre orientar meus
                clientes com dados atualizados e recomendações práticas.
              </p>
              <p>
                Se você quer um atendimento dedicado para encontrar o imóvel ideal ou
                avaliar oportunidades de investimento, estou pronto para ajudar.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
