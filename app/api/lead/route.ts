import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://strapi:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || '';
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL || '';

type LeadPayload = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  landingPageId: number;
  utm_campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  referrer?: string;
};

export async function POST(req: NextRequest) {
  let body: LeadPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Validação mínima
  if (!body.name || !body.email || !body.landingPageId) {
    return NextResponse.json(
      { error: 'missing_required_fields', required: ['name', 'email', 'landingPageId'] },
      { status: 400 },
    );
  }

  // 1) Grava no Strapi
  let strapiResponse: { id: number } | null = null;
  let strapiError: string | null = null;
  try {
    const res = await fetch(`${STRAPI_URL}/api/lead-captures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          name: body.name,
          email: body.email,
          phone: body.phone,
          message: body.message,
          source: 'landing-page',
          utm_campaign: body.utm_campaign,
          utm_source: body.utm_source,
          utm_medium: body.utm_medium,
          referrer: body.referrer,
          landing_page: body.landingPageId,
        },
      }),
    });
    if (!res.ok) {
      strapiError = `Strapi ${res.status}`;
    } else {
      strapiResponse = (await res.json()) as { id: number };
    }
  } catch (e) {
    strapiError = String(e);
  }

  // 2) Dispara webhook pro CRM (opcional, não bloqueia o lead)
  let crmSent = false;
  if (CRM_WEBHOOK_URL) {
    try {
      await fetch(CRM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: body.name,
          email: body.email,
          phone: body.phone,
          message: body.message,
          utm_campaign: body.utm_campaign,
          utm_source: body.utm_source,
          utm_medium: body.utm_medium,
          landing_page_id: body.landingPageId,
          created_at: new Date().toISOString(),
        }),
      });
      crmSent = true;
    } catch (e) {
      console.error('CRM webhook falhou:', e);
    }
  }

  // Se Strapi falhou, retorna erro
  if (!strapiResponse) {
    return NextResponse.json(
      { error: 'strapi_save_failed', detail: strapiError },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    id: strapiResponse.id,
    crm_sent: crmSent,
  });
}
