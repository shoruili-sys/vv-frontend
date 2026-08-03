'use client';

import { useState } from 'react';
import styles from './page.module.css';

type Props = {
  landingPageId: number;
  ctaText: string;
};

export function LeadForm({ landingPageId, ctaText }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  function getUtm(name: string): string {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: data.get('name'),
      email: data.get('email'),
      phone: data.get('phone'),
      message: data.get('message'),
      landingPageId,
      utm_campaign: getUtm('utm_campaign'),
      utm_source: getUtm('utm_source'),
      utm_medium: getUtm('utm_medium'),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    };

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Falha ao enviar');
      setStatus('success');
      setMessage('Recebemos seu contato! Em até 5 minutos te chamamos no WhatsApp.');
      form.reset();
    } catch (err) {
      setStatus('error');
      setMessage('Algo deu errado. Tente novamente ou nos chame no WhatsApp.');
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.formWrap}>
        <div className={`${styles.formStatus} ${styles.success}`}>{message}</div>
        <h2>Obrigado!</h2>
        <p style={{ color: 'var(--fg-soft)' }}>
          Vamos te chamar em instantes. Fique de olho no WhatsApp e no telefone.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.formWrap} onSubmit={onSubmit}>
      <h2>{ctaText || 'Quero saber mais'}</h2>
      <p>Preencha e entraremos em contato em até 5 minutos.</p>

      {status === 'error' && <div className={`${styles.formStatus} ${styles.error}`}>{message}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="name">Nome completo</label>
        <input id="name" name="name" type="text" required placeholder="Seu nome" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" required placeholder="seu@email.com" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="phone">WhatsApp (com DDD)</label>
        <input id="phone" name="phone" type="tel" required placeholder="(11) 99999-9999" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="message">Mensagem (opcional)</label>
        <textarea id="message" name="message" placeholder="Conte o que você procura..." />
      </div>

      <button type="submit" className="btn" style={{ width: '100%' }} disabled={status === 'loading'}>
        {status === 'loading' ? 'Enviando...' : ctaText || 'Quero saber mais'}
      </button>

      <div className={styles.urgency}>
        ⚡ Respondemos em até 5 minutos em horário comercial.
      </div>
    </form>
  );
}
