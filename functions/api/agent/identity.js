import { json, corsOptions } from '../../_lib/json.js';
import { signJwt } from '../../_lib/tokens.js';

export async function onRequestOptions() {
  return corsOptions();
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'invalid_request', error_description: 'JSON body required.' }, { status: 400 });
  }

  const type = body.type || 'anonymous';
  const clientName = String(body.client_name || body.clientName || 'agent').slice(0, 80);
  const sub = `agent:${crypto.randomUUID()}`;

  if (type === 'anonymous') {
    const identityAssertion = await signJwt(
      {
        sub,
        client_name: clientName,
        token_use: 'identity_assertion',
        identity_type: 'anonymous',
        scope: 'catalog:read comments:read mcp:tools',
      },
      context.env,
      600,
    );
    const claimToken = await signJwt(
      {
        sub,
        token_use: 'claim',
        claimed: false,
        client_name: clientName,
      },
      context.env,
      3600,
    );
    return json({
      identity_assertion: identityAssertion,
      claim_token: claimToken,
      identity_types_supported: ['anonymous', 'identity_assertion'],
      expires_in: 600,
      scopes: ['catalog:read', 'comments:read', 'mcp:tools'],
    });
  }

  if (type === 'identity_assertion' || type === 'service_auth') {
    const assertionType = body.assertion_type || body.assertionType || 'verified_email';
    const assertion = body.assertion || body.login_hint || body.email || '';
    if (!assertion) {
      return json({ error: 'invalid_request', error_description: 'assertion required.' }, { status: 400 });
    }

    const identityAssertion = await signJwt(
      {
        sub,
        client_name: clientName,
        token_use: 'identity_assertion',
        identity_type: type,
        assertion_type: assertionType,
        assertion_subject: String(assertion).slice(0, 320),
        scope: 'catalog:read comments:read comments:write mcp:tools',
      },
      context.env,
      600,
    );

    const userCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const claimToken = await signJwt(
      {
        sub,
        token_use: 'claim',
        claimed: false,
        user_code: userCode,
        email: String(assertion).includes('@') ? String(assertion) : undefined,
        client_name: clientName,
      },
      context.env,
      1800,
    );

    return json({
      identity_assertion: identityAssertion,
      claim_token: claimToken,
      claim: {
        user_code: userCode,
        verification_uri: 'https://www.notofilia.com/oauth/claim/',
        verification_uri_complete: `https://www.notofilia.com/oauth/claim/?user_code=${userCode}`,
        expires_in: 1800,
        interval: 5,
      },
      expires_in: 600,
    });
  }

  return json(
    {
      error: 'unsupported_identity_type',
      error_description: 'Supported identity types: anonymous, identity_assertion.',
    },
    { status: 400 },
  );
}
