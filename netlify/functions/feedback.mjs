import { getStore } from '@netlify/blobs';

const FEEDBACK_RATE_LIMIT = 10;
const MAX_FIELD_LENGTH = 2;
const MAX_REASON_LENGTH = 20;

function isAllowedOrigin(req) {
  const raw = req.headers.get('origin') || req.headers.get('referer');
  if (!raw) return false;
  let hostname;
  try {
    hostname = new URL(raw).hostname;
  } catch {
    return false;
  }
  if (hostname === 'visainfo.ai' || hostname === 'www.visainfo.ai') return true;
  if (hostname.endsWith('.netlify.app')) return true;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  return false;
}

function getClientIp(req, context) {
  return context?.ip || req.headers.get('x-nf-client-connection-ip') || 'unknown';
}

async function checkRateLimit(ip, limit) {
  try {
    const store = getStore('rate-limits');
    const hourBucket = new Date().toISOString().slice(0, 13);
    const key = `${ip}:feedback:${hourBucket}`;
    const count = (await store.get(key, { type: 'json' })) || 0;
    if (count >= limit) return false;
    await store.setJSON(key, count + 1);
    return true;
  } catch {
    // Blobs unavailable (e.g. local dev) — fail open
    return true;
  }
}

export default async (req, context) => {
  if (!isAllowedOrigin(req)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip = getClientIp(req, context);
  const withinLimit = await checkRateLimit(ip, FEEDBACK_RATE_LIMIT);
  if (!withinLimit) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { nationality, destination, reason, verdict } = body;

  const valid =
    typeof nationality === 'string' && nationality.length > 0 && nationality.length <= MAX_FIELD_LENGTH &&
    typeof destination === 'string' && destination.length > 0 && destination.length <= MAX_FIELD_LENGTH &&
    typeof reason === 'string' && reason.length > 0 && reason.length <= MAX_REASON_LENGTH &&
    (verdict === 'up' || verdict === 'down');

  if (!valid) {
    return new Response(JSON.stringify({ error: 'Invalid feedback payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const store = getStore('feedback');
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await store.setJSON(key, {
      nationality,
      destination,
      reason,
      verdict,
      at: new Date().toISOString(),
    });
  } catch {
    // Blobs unavailable — feedback is fire-and-forget telemetry, don't fail the request
  }

  return new Response(null, { status: 204 });
};
