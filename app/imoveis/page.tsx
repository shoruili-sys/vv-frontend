import Link from 'next/link';
import Image from 'next/image';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { getLandingPages, mediaUrl } from '@/lib/strapi';
import styles from '../page.module.css';

export const metadata = { title: 'Empreendimentos' };

export default async function ImoveisPage() {
  let pages: Awaited<ReturnType<typeof getLandingPages>> = [];
  try {
    pages = await getLandingPages();
  } catch (e) {
    console.error('Strapi indisponível:', e);
  }

  return (
    <>
      <Header />
      <main>
        <section className={styles.section} style={{ paddingTop: 60 }}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="eyebrow">Portfólio completo</span>
              <h2>Todos os empreendimentos</h2>
              <p>Explore as opções disponíveis e clique em qualquer uma para receber atendimento personalizado.</p>
            </div>
            {pages.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--fg-soft)' }}>
                Nenhum empreendimento disponível no momento. Volte em breve!
              </p>
            ) : (
              <div className={styles.grid}>
                {pages.map((p) => {
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
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
