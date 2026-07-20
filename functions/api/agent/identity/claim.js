import { json, corsOptions } from '../../../_lib/json.js';
import { signJwt, verifyJwt } from '../../../_lib/tokens.js';

export async function onRequestOptions() {
  return corsOptions();
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'invalid_request' }, { status: 400 });
  }

  const claimToken = body.claim_token || body.claimToken;
  const payload = await verifyJwt(claimToken, context.env);
  if (!payload || payload.token_use !== 'claim') {
    return json({ error: 'invalid_grant', error_description: 'Invalid claim token.' }, { status: 400 });
  }

  // Public claim ceremony completion for agents: accepting email marks claim intent.
  // Human confirmation UI lives at /oauth/claim; agents poll the token endpoint.
  const email = String(body.email || payload.email || '').trim();
  const userCode = String(body.user_code || payload.user_code || '').trim().toUpperCase();

  const nextClaim = await signJwt(
    {
      sub: payload.sub,
      token_use: 'claim',
      claimed: Boolean(body.complete || body.claimed),
      email: email || undefined,
      user_code: userCode || undefined,
      client_name: payload.client_name,
    },
    context.env,
    1800,
  );

  if (body.complete || body.claimed) {
    return json({
      status: 'claimed',
      claim_token: nextClaim,
      identity_assertion: await signJwt(
        {
          sub: payload.sub,
          token_use: 'identity_assertion',
          identity_type: 'identity_assertion',
          assertion_type: 'verified_email',
          assertion_subject: email,
          scope: 'catalog:read comments:read comments:write mcp:tools',
          client_name: payload.client_name,
        },
        context.env,
        600,
      ),
    });
  }

  return json({
    status: 'pending',
    claim_token: nextClaim,
    claim_attempt: {
      user_code: userCode || Math.random().toString(36).slice(2, 8).toUpperCase(),
      verification_uri: 'https://www.notofilia.com/oauth/claim',
      expires_in: 1800,
      interval: 5,
    },
  });
}
