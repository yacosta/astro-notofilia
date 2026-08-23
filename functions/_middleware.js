import { estimateTokens, htmlToMarkdown, prefersMarkdown } from './_lib/markdown.js';

const WELL_KNOWN_TYPES = {
  '/.well-known/api-catalog': 'application/linkset+json; charset=utf-8',
  '/.well-known/oauth-authorization-server': 'application/json; charset=utf-8',
  '/.well-known/openid-configuration': 'application/json; charset=utf-8',
  '/.well-known/oauth-protected-resource': 'application/json; charset=utf-8',
  '/.well-known/http-message-signatures-directory':
    'application/http-message-signatures-directory+json; charset=utf-8',
  '/.well-known/jwks.json': 'application/jwk-set+json; charset=utf-8',
  '/.well-known/mcp/server-card.json': 'application/json; charset=utf-8',
  '/.well-known/mcp.json': 'application/json; charset=utf-8',
  '/.well-known/agent-index.json': 'application/json; charset=utf-8',
  '/auth.md': 'text/markdown; charset=utf-8',
  '/openapi.json': 'application/vnd.oai.openapi+json; charset=utf-8',
};

/** Baseline security headers. Prefer existing edge values when already set. */
const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy':
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
  'content-security-policy-report-only':
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self' https://api.web3forms.com; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com https://api.web3forms.com; frame-src 'self' https://challenges.cloudflare.com; worker-src 'self' blob:; report-uri /api/csp-report",
};

function withContentType(response, contentType) {
  if (!contentType || !response.ok) return response;
  const headers = new Headers(response.headers);
  headers.set('content-type', contentType);
  headers.set('access-control-allow-origin', '*');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isHtmlResponse(response) {
  const ctype = (response.headers.get('content-type') || '').toLowerCase();
  return ctype.includes('text/html');
}

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = (context.request.headers.get('host') || url.host || '').toLowerCase();
  // Prefer apex host for SEO (Cloudflare also redirects www → apex at the edge).
  if (host === 'www.notofilia.com') {
    const apex = new URL(url.toString());
    apex.protocol = 'https:';
    apex.host = 'notofilia.com';
    return new Response(null, {
      status: 301,
      headers: {
        location: apex.toString(),
        ...SECURITY_HEADERS,
      },
    });
  }

  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const accept = context.request.headers.get('accept') || '';
  const wantsMarkdown = prefersMarkdown(accept);

  const response = await context.next();

  const wellKnownType = WELL_KNOWN_TYPES[pathname] || WELL_KNOWN_TYPES[url.pathname];
  if (wellKnownType) {
    return withSecurityHeaders(withContentType(response, wellKnownType));
  }

  if (wantsMarkdown && response.ok && isHtmlResponse(response)) {
    const html = await response.text();
    const markdown = htmlToMarkdown(html);
    const headers = new Headers(response.headers);
    headers.set('content-type', 'text/markdown; charset=utf-8');
    headers.set('x-markdown-tokens', String(estimateTokens(markdown)));
    headers.set('vary', 'accept');
    headers.delete('content-length');
    headers.delete('content-encoding');
    headers.delete('etag');
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      if (!headers.has(name)) headers.set(name, value);
    }
    return new Response(markdown, {
      status: 200,
      headers,
    });
  }

  if (response.status === 404) {
    console.log(JSON.stringify({
      event: '404',
      path: url.pathname + url.search,
      referrer: context.request.headers.get('referer') || '',
      userAgent: context.request.headers.get('user-agent') || '',
      cfRay: context.request.headers.get('cf-ray') || '',
      timestamp: new Date().toISOString(),
    }));

    // English-tree misses: serve the prerendered /en/404/ document with
    // status 404. Pages still uses dist/404.html as the global fallback.
    // Do not negotiate language from Accept-Language or geo.
    const en404 = await englishNotFoundResponse(context, url, pathname, response);
    if (en404) return withSecurityHeaders(en404);
  }

  return withSecurityHeaders(response);
}

function isEnglishTree(pathname) {
  return pathname === '/en' || pathname.startsWith('/en/');
}

/**
 * Fetch the English 404 HTML for `/en/*` misses. Keep HTTP 404.
 * Prefer `env.ASSETS` so this does not re-enter middleware.
 */
async function englishNotFoundResponse(context, url, pathname, original) {
  if (!isEnglishTree(pathname) || pathname === '/en/404') return null;
  const notFoundUrl = new URL('/en/404/', url.origin);
  let assetResponse;
  try {
    const assets = context.env && context.env.ASSETS;
    if (assets && typeof assets.fetch === 'function') {
      assetResponse = await assets.fetch(new Request(notFoundUrl.toString(), { method: 'GET' }));
    }
  } catch {
    assetResponse = null;
  }
  if (!assetResponse || !assetResponse.ok) return null;
  const headers = new Headers(assetResponse.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.delete('etag');
  return new Response(assetResponse.body, {
    status: 404,
    statusText: original.statusText || 'Not Found',
    headers,
  });
}
