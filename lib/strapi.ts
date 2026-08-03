// Tipos para as respostas do Strapi
export type Media = {
  data: {
    id: number;
    attributes: {
      url: string;
      alternativeText?: string;
      width?: number;
      height?: number;
    };
  } | null;
};

export type LandingPage = {
  id: number;
  attributes: {
    title: string;
    slug: string;
    subtitle?: string;
    description?: string;
    hero_image?: Media;
    features?: Array<{ icon?: string; title: string; description: string }>;
    price_from?: number;
    location?: string;
    bedrooms?: number;
    area?: string;
    cta_text?: string;
    whatsapp_number?: string;
    social_proof?: { units_sold?: number; testimonial?: string };
    published: boolean;
  };
};

type StrapiList<T extends { attributes: unknown }> = {
  data: Array<{ id: number; attributes: T['attributes'] }>;
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
};

const STRAPI_URL = process.env.STRAPI_URL || 'http://strapi:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || '';

async function strapiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${STRAPI_URL}/api${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      ...(init?.headers || {}),
    },
    // revalidação ISR - atualiza a cada 60s no servidor
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Strapi ${path} -> ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getLandingPages(): Promise<LandingPage[]> {
  const json = await strapiFetch<StrapiList<LandingPage>>(
    '/landing-pages?filters[published][$eq]=true&sort=createdAt:desc&populate=*',
  );
  return json.data.map((d) => ({ id: d.id, attributes: d.attributes }));
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  const json = await strapiFetch<StrapiList<LandingPage>>(
    `/landing-pages?filters[slug][$eq]=${encodeURIComponent(slug)}&filters[published][$eq]=true&populate=*`,
  );
  if (!json.data.length) return null;
  const d = json.data[0];
  return { id: d.id, attributes: d.attributes };
}

export function mediaUrl(m: Media | undefined, base = process.env.NEXT_PUBLIC_STRAPI_URL): string | null {
  if (!m?.data) return null;
  const url = m.data.attributes.url;
  if (url.startsWith('http')) return url;
  return `${base}${url}`;
}
