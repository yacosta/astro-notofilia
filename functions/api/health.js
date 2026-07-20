import { json, corsOptions } from '../_lib/json.js';

export async function onRequestOptions() {
  return corsOptions();
}

export async function onRequestGet() {
  return json({
    status: 'ok',
    service: 'notofilia',
    time: new Date().toISOString(),
  });
}
