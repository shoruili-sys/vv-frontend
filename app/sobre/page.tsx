import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
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
              <h2>Carlos Veríssimo Jr. — consultor imobiliário</h2>
              <p>
                Sou Carlos Veríssimo Jr., atuando com foco em imóveis de alto padrão,
                investimento inteligente e atendimento personalizado para cada cliente.
              </p>
            </div>
            <div style={{ color: 'var(--fg-soft)', lineHeight: 1.8, maxWidth: 760, margin: '0 auto' }}>
              <p>
                Minha trajetória começou com a paixão por conectar pessoas a imóveis que
                combinam com seu estilo de vida e objetivos financeiros. Hoje, trabalho
                com um portfólio selecionado de empreendimentos e faço a mediação de cada
                negociação com critérios de segurança, transparência e eficiência.
              </p>
              <p>
                Acredito que o cliente precisa de orientação clara em todas as etapas:
                desde a seleção das melhores opções até a análise de valor e o acompanhamento
                do processo até a entrega das chaves.
              </p>
              <p>
                Meu compromisso é oferecer um atendimento próximo, baseado em dados reais do
                mercado e no entendimento das suas prioridades. Se você busca um parceiro
                confiável para encontrar ou vender um imóvel, vamos conversar.
              </p>
              <p>
                Para propostas e agendamentos, basta entrar em contato e receber um apoio
                dedicado em cada detalhe do seu negócio imobiliário.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section} style={{ paddingTop: 0 }}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="eyebrow">Valores</span>
              <h2>O que norteia o meu trabalho</h2>
              <p>Compromisso com o cliente, transparência e foco em soluções que tragam segurança e resultado.</p>
            </div>
            <div className={styles.grid}>
              <div className={styles.card}>
                <div className={styles.cardBody}>
                  <h3>Transparência</h3>
                  <p>Informações claras e orientação honesta durante todo o processo de compra ou venda.</p>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardBody}>
                  <h3>Relacionamento</h3>
                  <p>Atendimento próximo e personalizado, com foco no entendimento das suas necessidades.</p>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardBody}>
                  <h3>Excelência</h3>
                  <p>Busca pelas melhores opções de mercado, sempre com atenção aos detalhes e à qualidade.</p>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardBody}>
                  <h3>Segurança</h3>
                  <p>Planejamento e análise cuidadosa para que cada negociação seja feita com confiança.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
