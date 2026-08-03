import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Header, Footer } from '../../components/Header';
import { getLandingPageBySlug, getLandingPages, mediaUrl } from '@/lib/strapi';
import { LeadForm } from './LeadForm';
import styles from './page.module.css';

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const pages = await getLandingPages();
    return pages.map((p) => ({ slug: p.attributes.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await getLandingPageBySlug(params.slug).catch(() => null);
  if (!page) return { title: 'Empreendimento' };
  return {
    title: page.attributes.title,
    description: page.attributes.subtitle || page.attributes.description?.slice(0, 160),
  };
}

function renderRichText(rt: any): string {
  // Strapi rich-text vem como array de blocos; simplificação para plain text
  if (!rt) return '';
  if (typeof rt === 'string') return rt;
  if (Array.isArray(rt)) {
    return rt.map((b: any) => b?.children?.map((c: any) => c.text).join('') || '').join('\n\n');
  }
  return '';
}

export default async function LPPage({ params }: { params: { slug: string } }) {
  const page = await getLandingPageBySlug(params.slug).catch(() => null);
  if (!page) notFound();

  const { attributes: a, id } = page;
  const heroImg = mediaUrl(a.hero_image);
  const features = Array.isArray(a.features) ? a.features : [];
  const unitsSold = a.social_proof?.units_sold;
  const ctaText = a.cta_text || 'Quero saber mais';

  return (
    <>
      <Header />
      <main className={styles.lp}>
        {/* HERO - sem menu, sem distrações, foco no CTA */}
        <section className={styles.hero}>
          {heroImg && (
            <div className={styles.heroImage}>
              <Image src={heroImg} alt={a.title} fill priority />
            </div>
          )}
          <div className="container">
            <div className={styles.heroContent}>
              <span className="eyebrow">{a.location || 'Empreendimento'}</span>
              <h1>{a.title}</h1>
              {a.subtitle && <p>{a.subtitle}</p>}
              <a href="#contato" className="btn">{ctaText}</a>
            </div>
          </div>
        </section>

        {/* FEATURES - o que o imóvel tem */}
        {(features.length > 0 || a.bedrooms || a.area) && (
          <section className={styles.features}>
            <div className="container">
              <div style={{ textAlign: 'center' }}>
                <span className="eyebrow">Diferenciais</span>
                <h2>O que esse empreendimento oferece</h2>
              </div>
              <div className={styles.featuresGrid}>
                {a.bedrooms && (
                  <div className={styles.feature}>
                    <h3>🛏 {a.bedrooms} dormitórios</h3>
                    <p>Conforto e funcionalidade para toda a família.</p>
                  </div>
                )}
                {a.area && (
                  <div className={styles.feature}>
                    <h3>📐 {a.area}</h3>
                    <p>Metragem generosa, ambientes integrados.</p>
                  </div>
                )}
                {a.location && (
                  <div className={styles.feature}>
                    <h3>📍 Localização</h3>
                    <p>{a.location}</p>
                  </div>
                )}
                {features.map((f, i) => (
                  <div key={i} className={styles.feature}>
                    {f.icon && <h3>{f.icon}</h3>}
                    <h3>{f.title}</h3>
                    <p>{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* DESCRIÇÃO */}
        {a.description && (
          <section className={styles.features}>
            <div className="container" style={{ maxWidth: 800 }}>
              <span className="eyebrow">Sobre o empreendimento</span>
              <h2>Detalhes</h2>
              <p style={{ color: 'var(--fg-soft)', whiteSpace: 'pre-line', marginTop: 24 }}>
                {renderRichText(a.description)}
              </p>
            </div>
          </section>
        )}

        {/* PROVA SOCIAL */}
        {unitsSold && (
          <section className={styles.proof}>
            <div className="container">
              <span className={styles.proofNumber}>{unitsSold}+</span>
              <p>unidades já comercializadas</p>
            </div>
          </section>
        )}

        {/* FORMULÁRIO - conversão pura */}
        <section className={styles.formSection} id="contato">
          <div className="container">
            <LeadForm landingPageId={id} ctaText={ctaText} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
