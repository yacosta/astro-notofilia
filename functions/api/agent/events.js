import { json, corsOptions } from '../../_lib/json.js';

export async function onRequestOptions() {
  return corsOptions();
}

export async function onRequestPost() {
  // Accept SET push delivery (RFC 8417 / RFC 8935) for agent auth revocation events.
  return json({ received: true });
}
