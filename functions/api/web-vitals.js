/**
 * Accept Web Vitals RUM beacons (consent-gated on the client).
 * Logs a compact summary for Cloudflare Pages observability; always 204.
 */
export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': 'https://www.notofilia.com',
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  }

  if (context.request.method !== 'POST') {
    return new Response(null, {
      status: 405,
      headers: { allow: 'POST, OPTIONS' },
    });
  }

  let body = '';
  try {
    body = await context.request.text();
  } catch {
    body = '';
  }

  try {
    const parsed = JSON.parse(body || '{}');
    console.log(
      JSON.stringify({
        event: 'web-vitals',
        name: parsed.name,
        value: parsed.value,
        rating: parsed.rating,
        path: parsed.path,
        id: parsed.id,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch {
    console.log(JSON.stringify({ event: 'web-vitals', rawBytes: body.length }));
  }

  return new Response(null, {
    status: 204,
    headers: { 'cache-control': 'no-store' },
  });
}
