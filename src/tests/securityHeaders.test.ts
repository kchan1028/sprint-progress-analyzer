// @vitest-environment node
/// <reference types="node" />
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../../', import.meta.url);
const vercel = JSON.parse(readFileSync(new URL('vercel.json', root), 'utf8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[];
};
const headers = Object.fromEntries(vercel.headers[0].headers.map(({ key, value }) => [key, value]));
const csp = headers['Content-Security-Policy'];

describe('host security headers', () => {
  it('apply to every path', () => {
    expect(vercel.headers[0].source).toBe('/(.*)');
  });

  it('allow exactly the inline scripts in index.html by hash', () => {
    const html = readFileSync(new URL('index.html', root), 'utf8');
    // JSON-LD is data, not script, so CSP doesn't apply to it.
    const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    expect(inline.length).toBeGreaterThan(0);
    const hashes = inline.map((body) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`);
    const allowed = csp.match(/'sha256-[^']+'/g) ?? [];
    expect(allowed.sort()).toEqual(hashes.sort());
  });

  it('never allow unsafe-inline or unsafe-eval, and lock down framing and plugins', () => {
    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval/);
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
  });
});
