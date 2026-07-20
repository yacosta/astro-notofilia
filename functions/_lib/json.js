export const json = (body, init = {}) => {
  const headers = new Headers(init.headers || {});
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json; charset=utf-8');
  }
  if (!headers.has('cache-control')) {
    headers.set('cache-control', 'no-store');
  }
  headers.set('access-control-allow-origin', '*');
  return new Response(JSON.stringify(body), { ...init, headers });
};

export const corsOptions = () =>
  new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type, authorization, accept',
      'access-control-max-age': '86400',
    },
  });
