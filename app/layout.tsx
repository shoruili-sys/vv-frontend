import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vivaverissimo.com.br'),
  title: {
    default: 'VivaVeríssimo | Imóveis',
    template: '%s | VivaVeríssimo',
  },
  description: 'Encontre seu próximo lar com quem entende do mercado. Empreendimentos selecionados e atendimento personalizado.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'VivaVeríssimo',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || '';
  const msg = encodeURIComponent('Olá! Vi o site e gostaria de mais informações.');
  
  return (
    <html lang="pt-BR">
      <body>
        {children}
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${msg}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 100,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: '#25D366',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
            aria-label="Falar no WhatsApp"
          >
            💬
          </a>
        )}
      </body>
    </html>
  );
}
