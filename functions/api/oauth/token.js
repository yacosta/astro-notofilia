import { json, corsOptions } from '../../_lib/json.js';
import { parseScopes, signJwt, verifyJwt } from '../../_lib/tokens.js';

export async function onRequestOptions() {
  return corsOptions();
}

async function readParams(request) {
  const ctype = request.headers.get('content-type') || '';
  if (ctype.includes('application/json')) {
    return await request.json();
  }
  const text = await request.text();
  const params = new URLSearchParams(text);
  return Object.fromEntries(params.entries());
}

export async function onRequestPost(context) {
  let params;
  try {
    params = await readParams(context.request);
  } catch {
    return json({ error: 'invalid_request', error_description: 'Could not parse body.' }, { status: 400 });
  }

  const grantType = params.grant_type || params.grantType;
  const scopes = parseScopes(params.scope);

  if (grantType === 'client_credentials') {
    const accessToken = await signJwt(
      {
        sub: params.client_id || 'anonymous-agent',
        scope: scopes.filter((s) => s !== 'comments:write').join(' '),
        token_use: 'access',
      },
      context.env,
      3600,
    );
    return json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: scopes.filter((s) => s !== 'comments:write').join(' '),
    });
  }

  if (grantType === 'urn:ietf:params:oauth:grant-type:jwt-bearer') {
    const assertion = params.assertion || params.client_assertion;
    const payload = await verifyJwt(assertion, context.env);
    if (!payload || payload.token_use !== 'identity_assertion') {
      return json({ error: 'invalid_grant', error_description: 'Invalid identity assertion.' }, { status: 400 });
    }
    const accessToken = await signJwt(
      {
        sub: payload.sub,
        scope: (params.scope || payload.scope || scopes.join(' ')),
        token_use: 'access',
        client_name: payload.client_name,
      },
      context.env,
      3600,
    );
    return json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: params.scope || payload.scope || scopes.join(' '),
    });
  }

  if (grantType === 'urn:workos:agent-auth:grant-type:claim') {
    const claimToken = params.claim_token;
    const payload = await verifyJwt(claimToken, context.env);
    if (!payload || payload.token_use !== 'claim') {
      return json({ error: 'invalid_grant', error_description: 'Invalid claim token.' }, { status: 400 });
    }
    if (!payload.claimed) {
      return json({ error: 'authorization_pending', error_description: 'User has not completed claim yet.' }, { status: 400 });
    }
    const accessToken = await signJwt(
      {
        sub: payload.sub,
        scope: 'catalog:read comments:read comments:write mcp:tools',
        token_use: 'access',
      },
      context.env,
      3600,
    );
    return json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'catalog:read comments:read comments:write mcp:tools',
    });
  }

  return json(
    {
      error: 'unsupported_grant_type',
      error_description: 'Supported: client_credentials, jwt-bearer, claim.',
    },
    { status: 400 },
  );
}
