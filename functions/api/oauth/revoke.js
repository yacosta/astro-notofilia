import { json, corsOptions } from '../../_lib/json.js';

export async function onRequestOptions() {
  return corsOptions();
}

export async function onRequestPost() {
  // Stateless HS256 tokens: accept revocation requests and return success.
  return json({ revoked: true });
}
