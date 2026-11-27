import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import styles from './page.module.css';

export const metadata = {
  title: 'Taj Ibirapuera',
  description: 'Microsite de storytelling para o empreendimento Taj Ibirapuera.',
};

export default function TajIbirapueraPage() {
  return (
    <>
      <Header />
      <main className={styles.microsite}>
        <section className={styles.hero}>
          <div className={styles.heroMedia}>
            <div className={styles.videoPlaceholder}>
              <span>Vídeo de abertura (100vh)</span>
            </div>
          </div>
          <div className={styles.heroOverlay}>
            <span className={styles.eyebrow}>Ato I — O Convite</span>
            <h1>Existem endereços na cidade. E existe o verde que nunca termina.</h1>
            <p>TAJ IBIRAPUERA — Uma nova perspectiva sobre o seu tempo.</p>
            <div className={styles.scrollHint}>
              <span>role para descobrir</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Ato II — A Descoberta</span>
            <h2>Como a arquitetura traduz a sofisticação?</h2>
            <p>
              Um roteiro visual que revela o projeto sem cair em jargões: arquitetura,
              materialidade e paisagismo se apresentam como emoções.
            </p>
          </div>

          <div className={styles.grid}>
            <article className={styles.featureCard}>
              <div className={styles.imagePlaceholder}>Imagem vertical</div>
              <h3>A Escultura</h3>
              <p>
                A verdadeira exclusividade não pede atenção. Ela apenas existe.
                Um marco residencial desenhado não para ocupar um espaço, mas para
                contemplar o horizonte.
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.imagePlaceholder}>Fotos de acabamento</div>
              <h3>A Materialidade</h3>
              <p>
                Materiais que o tempo não apaga. Design que a moda não alcança.
                Reflexo de metal escovado, pedra natural e madeira com luz natural.
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.imagePlaceholder}>Vídeo do paisagismo</div>
              <h3>O Oásis</h3>
              <p>
                O Parque Ibirapuera não é o seu vizinho. É a extensão da sua sala.
                Portas de vidro que se abrem para um deck integrado ao verde.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.splitGrid}>
            <div className={styles.contentBlock}>
              <span className={styles.eyebrow}>Ato III — A Vida</span>
              <h2>Como é a rotina de quem tem o Ibirapuera como quintal?</h2>
              <p>
                Vender rotina, bairro e estilo de vida. Não vendemos localização.
                Vendemos tempo, lazer e presença em um dos endereços mais emblemáticos
                da cidade.
              </p>
              <ul>
                <li>Manhãs de caminhada entre árvores e lago.</li>
                <li>Almoços em restaurantes premiados a poucos minutos.</li>
                <li>Noites discretas com vista para o parque e privacidade total.</li>
              </ul>
            </div>
            <div className={styles.mediaPlaceholderLarge}>
              <span>Placeholder para imagem/vídeo de lifestyle</span>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaInner}>
            <span className={styles.eyebrow}>Agendamento Privativo</span>
            <h2>Gostaria de conhecer esse projeto pessoalmente?</h2>
            <p>
              Agenda rápida para receber atendimento exclusivo e conhecer o Taj
              Ibirapuera em primeira mão.
            </p>
            <button className="btn">Agendar visita privativa</button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
