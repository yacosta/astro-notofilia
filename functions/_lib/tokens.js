const encoder = new TextEncoder();

const b64url = (bytes) => {
  let bin = '';
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const b64urlJson = (value) => b64url(encoder.encode(JSON.stringify(value)));

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export function tokenSecret(env) {
  return env?.AGENT_TOKEN_SECRET || env?.OAUTH_TOKEN_SECRET || 'notofilia-dev-agent-token-secret';
}

export async function signJwt(payload, env, expiresInSec = 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    iss: 'https://notofilia.com',
    aud: 'https://notofilia.com/',
    iat: now,
    exp: now + expiresInSec,
    ...payload,
  };
  const unsigned = `${b64urlJson(header)}.${b64urlJson(body)}`;
  const key = await importHmacKey(tokenSecret(env));
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(unsigned));
  return `${unsigned}.${b64url(sig)}`;
}

export async function verifyJwt(token, env) {
  if (!token || typeof token !== 'string' || token.split('.').length !== 3) return null;
  const [h, p, s] = token.split('.');
  const key = await importHmacKey(tokenSecret(env));
  const ok = await crypto.subtle.verify(
    'HMAC',
    key,
    Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)),
    encoder.encode(`${h}.${p}`),
  );
  if (!ok) return null;
  try {
    const payload = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseScopes(scope) {
  if (!scope) return ['catalog:read', 'comments:read', 'mcp:tools'];
  return String(scope)
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
