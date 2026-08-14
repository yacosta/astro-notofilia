/**
 * Accept CSP violation reports (Report-Only or enforced).
 * Logs a compact summary for Cloudflare Pages observability; always 204.
 */
export async function onRequest(context) {
  if (context.request.method !== 'POST' && context.request.method !== 'PUT') {
    return new Response(null, {
      status: 405,
      headers: { allow: 'POST, PUT' },
    });
  }

  let body = '';
  try {
    body = await context.request.text();
  } catch {
    body = '';
  }

  let summary = { event: 'csp-report' };
  try {
    const parsed = JSON.parse(body || '{}');
    const report = parsed['csp-report'] || parsed;
    summary = {
      event: 'csp-report',
      documentUri: report['document-uri'] || report.documentURI || '',
      violatedDirective: report['violated-directive'] || report.violatedDirective || '',
      effectiveDirective: report['effective-directive'] || report.effectiveDirective || '',
      blockedUri: report['blocked-uri'] || report.blockedURI || '',
      disposition: report.disposition || 'report',
      timestamp: new Date().toISOString(),
    };
  } catch {
    summary = {
      event: 'csp-report',
      rawBytes: body.length,
      timestamp: new Date().toISOString(),
    };
  }

  console.log(JSON.stringify(summary));
  return new Response(null, { status: 204 });
}
