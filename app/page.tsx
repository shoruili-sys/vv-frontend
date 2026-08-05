import Link from 'next/link';
import Image from 'next/image';
import { Header, Footer } from './components/Header';
import { getLandingPages, mediaUrl } from '@/lib/strapi';
import styles from './page.module.css';

export default async function HomePage() {
  let pages: Awaited<ReturnType<typeof getLandingPages>> = [];
  try {
    pages = await getLandingPages();
  } catch (e) {
    // Falha silenciosa na home - Strapi pode estar fora durante build
    console.error('Strapi indisponível:', e);
  }
  const destaques = pages.slice(0, 3);

  return (
    <>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroInner}>
              <span className="eyebrow">Imóveis selecionados · Atendimento pessoal</span>
              <h1>Encontre o lar que combina com a sua história.</h1>
              <p>
                Empreendimentos de alto padrão, com curadoria pessoal e acompanhamento
                do primeiro contato até a entrega das chaves.
              </p>
              <Link href="/imoveis" className="btn">Ver empreendimentos</Link>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="eyebrow">Sobre nós</span>
              <h2>Mais sobre a Viva Veríssimo</h2>
              <p>Conheça nossa história e veja como atuamos com transparência e atendimento personalizado.</p>
            </div>
            <div className={styles.grid}>
              <Link href="/institucional" className={styles.card}>
                <div className={styles.cardBody}>
                  <h3>Institucional</h3>
                  <p>Descubra nossa missão, valores e o compromisso com clientes que buscam imóveis de qualidade.</p>
                </div>
              </Link>
              <Link href="/sobre" className={styles.card}>
                <div className={styles.cardBody}>
                  <h3>Sobre mim</h3>
                  <p>Saiba mais sobre a experiência e a abordagem pessoal que garantem atendimento diferenciado.</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {destaques.length > 0 && (
          <section className={styles.section}>
            <div className="container">
              <div className={styles.sectionHeader}>
                <span className="eyebrow">Destaques</span>
                <h2>Empreendimentos em destaque</h2>
                <p>Selecionamos opções que unem localização, qualidade construtiva e potencial de valorização.</p>
              </div>
              <div className={styles.grid}>
                {destaques.map((p) => {
                  const img = mediaUrl(p.attributes.hero_image);
                  return (
                    <Link key={p.id} href={`/imovel/${p.attributes.slug}`} className={styles.card}>
                      <div className={styles.cardImg}>
                        {img ? <Image src={img} alt={p.attributes.title} width={640} height={400} /> : null}
                      </div>
                      <div className={styles.cardBody}>
                        <h3>{p.attributes.title}</h3>
                        {p.attributes.subtitle && <p>{p.attributes.subtitle}</p>}
                        <div className={styles.cardMeta}>
                          {p.attributes.location && <span>📍 {p.attributes.location}</span>}
                          {p.attributes.bedrooms && <span>🛏 {p.attributes.bedrooms} dorm.</span>}
                          {p.attributes.area && <span>📐 {p.attributes.area}</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className={styles.cta} id="contato">
          <div className="container">
            <span className="eyebrow">Atendimento personalizado</span>
            <h2>Vamos conversar sobre o seu próximo imóvel?</h2>
            <p>Conte o que você procura e entraremos em contato em até 5 minutos com opções selecionadas para o seu perfil.</p>
            <Link href="/imoveis" className="btn">Quero ser atendido</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
