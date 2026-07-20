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

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const accept = context.request.headers.get('accept') || '';
  const wantsMarkdown = prefersMarkdown(accept);

  const response = await context.next();

  const wellKnownType = WELL_KNOWN_TYPES[pathname] || WELL_KNOWN_TYPES[url.pathname];
  if (wellKnownType) {
    return withContentType(response, wellKnownType);
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
  }

  return response;
}
