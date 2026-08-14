/**
 * Validate that public/_headers and functions/_middleware.js declare the
 * required production security baseline (and optionally probe a live URL).
 *
 * Usage:
 *   node scripts/check-security-headers.mjs
 *   CHECK_HEADERS_URL=https://notofilia.com/ node scripts/check-security-headers.mjs
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const REQUIRED = [
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
  'strict-transport-security',
];

const headersFile = await readFile(path.join(root, 'public/_headers'), 'utf8');
const middlewareFile = await readFile(path.join(root, 'functions/_middleware.js'), 'utf8');
const errors = [];

for (const name of REQUIRED) {
  if (!new RegExp(name, 'i').test(headersFile)) {
    errors.push(`public/_headers missing ${name}`);
  }
  if (!new RegExp(name.replace(/-/g, '[-_]'), 'i').test(middlewareFile)) {
    errors.push(`functions/_middleware.js missing ${name}`);
  }
}

if (!/content-security-policy/i.test(headersFile)) {
  errors.push('public/_headers missing Content-Security-Policy (enforced or Report-Only)');
}
if (!/content-security-policy/i.test(middlewareFile)) {
  errors.push('functions/_middleware.js missing Content-Security-Policy (enforced or Report-Only)');
}

const liveUrl = process.env.CHECK_HEADERS_URL;
if (liveUrl) {
  try {
    const res = await fetch(liveUrl, {
      redirect: 'manual',
      headers: { 'user-agent': 'NotofiliaHeaderCheck/1.0' },
    });
    for (const name of REQUIRED) {
      if (!res.headers.get(name)) {
        errors.push(`Live ${liveUrl} missing response header ${name} (status ${res.status})`);
      }
    }
    const csp =
      res.headers.get('content-security-policy') ||
      res.headers.get('content-security-policy-report-only');
    if (!csp) {
      errors.push(`Live ${liveUrl} missing CSP / CSP-Report-Only`);
    }
  } catch (error) {
    errors.push(`Live header probe failed for ${liveUrl}: ${error.message}`);
  }
}

if (errors.length) {
  console.error('Security header validation failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  liveUrl
    ? `Security header validation passed (repo + live ${liveUrl}).`
    : 'Security header validation passed (repo baseline).',
);
