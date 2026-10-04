// POST /api/lead
// Receives a lead from the Question Gallery, emails the people in NOTIFY_TO, and optionally
// forwards it to a HubSpot form. Nothing secret is stored in this repo: set everything as
// environment variables in the host (see README).

const ALLOWED = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
const TO = (process.env.NOTIFY_TO || '').split(',').map((s) => s.trim()).filter(Boolean);
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const hits = new Map();

const clip = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 8;
}

async function sendEmail(lead) {
  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM || TO.length === 0) return false;
  const lines = [
    `Event: ${lead.type === 'meeting' ? 'Clicked Find time with us' : 'Loaded a category'}`,
    `Email: ${lead.email || '(none given)'}`,
    `Brand: ${lead.brand || '(none given)'}`,
    `Category: ${lead.category || '(none given)'}`,
    lead.question ? `Question they asked about: ${lead.question}` : '',
    lead.opened.length ? `Questions they opened:\n- ${lead.opened.join('\n- ')}` : '',
    `Page: ${lead.page}`,
  ].filter(Boolean);
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: TO,
      reply_to: lead.email || undefined,
      subject: `Question Gallery: ${lead.brand || lead.email || 'a visitor'} on ${lead.category || 'a category'}`,
      text: lines.join('\n'),
    }),
  });
  return r.ok;
}

async function sendHubspot(lead) {
  const portal = process.env.HUBSPOT_PORTAL_ID;
  const form = process.env.HUBSPOT_FORM_GUID;
  if (!portal || !form || !lead.email) return false;
  const fields = [
    ['email', lead.email],
    ['company', lead.brand],
    ['gallery_category', lead.category],
    ['gallery_question', lead.question],
    ['gallery_opened', lead.opened.join(' | ')],
    ['gallery_event', lead.type],
  ].filter((f) => f[1]).map(([name, value]) => ({ name, value }));
  const r = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portal}/${form}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields, context: { pageUri: lead.page, pageName: 'Question Gallery' } }),
  });
  return r.ok;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  res.setHeader('Vary', 'Origin');
  if (ALLOWED.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (origin && ALLOWED.length && !ALLOWED.includes(origin)) return res.status(403).json({ ok: false });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ ok: false });

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};
  if (b.website) return res.status(200).json({ ok: true }); // honeypot

  const lead = {
    type: b.type === 'meeting' ? 'meeting' : 'load',
    email: clip(b.email, 200),
    brand: clip(b.brand, 80),
    category: clip(b.category, 80),
    question: clip(b.question, 300),
    opened: (Array.isArray(b.opened) ? b.opened : []).slice(0, 18).map((x) => clip(x, 80)),
    page: clip(b.page, 300),
  };
  if (lead.email && !EMAIL_RE.test(lead.email)) return res.status(400).json({ ok: false, error: 'email' });
  if (lead.type === 'meeting' && !lead.email) return res.status(400).json({ ok: false, error: 'email' });

  const [emailed, hubspot] = await Promise.all([sendEmail(lead).catch(() => false), sendHubspot(lead).catch(() => false)]);
  const ok = emailed || hubspot;
  return res.status(ok ? 200 : 502).json({ ok, emailed, hubspot });
}
