// Image-upgrade before/after harness.
// Builds nothing itself — run `npx astro build` first, then:
//   node scripts/measure-image-baseline.mjs dist
// Serves dist/ locally and renders 3 representative pages in headless Chromium under
// Pixel-5 mobile emulation + Slow-4G + 4x CPU throttle, reporting per-page image
// transfer bytes, LCP (localhost lab estimate only), and CLS. Re-run after each phase
// for a like-for-like comparison. Requires global playwright + /opt/pw-browsers chromium.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium, devices } = require('playwright');

const ROOT = process.argv[2] || 'dist';
const PORT = 8099;

const MIME = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.mjs':'text/javascript',
  '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp',
  '.gif':'image/gif', '.avif':'image/avif', '.ico':'image/x-icon',
  '.woff':'font/woff', '.woff2':'font/woff2', '.ttf':'font/ttf', '.xml':'application/xml',
  '.txt':'text/plain', '.pdf':'application/pdf',
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    let fp = join(ROOT, p);
    let s;
    try { s = await stat(fp); } catch { // try .html or dir index
      try { s = await stat(fp + '.html'); fp += '.html'; }
      catch { try { s = await stat(join(fp,'index.html')); fp = join(fp,'index.html'); } catch { res.writeHead(404); return res.end('nf'); } }
    }
    if (s.isDirectory()) { fp = join(fp,'index.html'); s = await stat(fp); }
    const buf = await readFile(fp);
    res.writeHead(200, { 'content-type': MIME[extname(fp).toLowerCase()] || 'application/octet-stream', 'content-length': buf.length });
    res.end(buf);
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
await new Promise(r => server.listen(PORT, r));

const PAGES = [
  { label: 'Homepage',       url: `http://localhost:${PORT}/` },
  { label: 'Catalogue page', url: `http://localhost:${PORT}/billete-usda-food-coupon-1-dolar-1980.dc.html` },
  { label: 'Blog post',      url: `http://localhost:${PORT}/blog/diferencia-numismatica-notafilia/` },
];

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const results = [];
for (const pg of PAGES) {
  const ctx = await browser.newContext({ ...devices['Pixel 5'] });
  const page = await ctx.newPage();
  // Slow-4G-ish throttle (Lighthouse mobile ~ 1.6Mbps down, 150ms RTT)
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline:false, latency:150, downloadThroughput: 1.6*1024*1024/8, uploadThroughput: 750*1024/8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  const imgs = new Map(); // url -> bytes (encoded)
  cdp.on('Network.responseReceived', ev => {
    const ct = (ev.response.mimeType||'');
    const u = ev.response.url;
    if (ct.startsWith('image/') || /\/uploads\/.*\.(jpe?g|png|webp|gif|avif)/i.test(u)) imgs.set(ev.requestId, { u, bytes:0, ct });
  });
  cdp.on('Network.loadingFinished', ev => { if (imgs.has(ev.requestId)) imgs.get(ev.requestId).bytes = ev.encodedDataLength; });

  // Track CLS/LCP continuously so we can snapshot at load and after scroll.
  await page.addInitScript(() => {
    window.__cls = 0; window.__lcp = 0;
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type:'layout-shift', buffered:true }); } catch {}
    try { new PerformanceObserver(l => { const es=l.getEntries(); const last=es[es.length-1]; window.__lcp = last.renderTime || last.loadTime || window.__lcp; }).observe({ type:'largest-contentful-paint', buffered:true }); } catch {}
  });

  await page.goto(pg.url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2000); // settle above-the-fold
  // Snapshot at load (no scroll) — this is the Lighthouse-comparable CLS.
  const atLoad = await page.evaluate(() => ({ cls: +window.__cls.toFixed(4), lcp: Math.round(window.__lcp) }));
  const loadImgBytes = [...imgs.values()].reduce((s,i)=>s+i.bytes,0);
  const loadImgCount = imgs.size;

  // Now scroll to force lazy images + capture any scroll-induced shift separately.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2500);
  const afterScroll = await page.evaluate(() => ({ cls: +window.__cls.toFixed(4) }));

  const imgList = [...imgs.values()];
  const totalImg = imgList.reduce((s,i)=>s+i.bytes,0);
  const byFmt = {};
  for (const i of imgList){ const f=(i.ct.split('/')[1]||'?'); byFmt[f]=(byFmt[f]||{n:0,b:0}); byFmt[f].n++; byFmt[f].b+=i.bytes; }
  results.push({ label: pg.label, url: pg.url,
    loadImgCount, loadImgBytes, imgCount: imgList.length, imgBytes: totalImg, byFmt,
    clsLoad: atLoad.cls, clsAfterScroll: afterScroll.cls, lcp: atLoad.lcp });
  await ctx.close();
}
await browser.close();
server.close();

// report
const kb = b => (b/1024).toFixed(0)+' KB';
console.log('\n============ MEASURED BASELINE (mobile emulation, Slow-4G, localhost dist) ============');
for (const r of results) {
  console.log(`\n■ ${r.label}  (${r.url.replace('http://localhost:'+PORT,'')})`);
  console.log(`   Images @load: ${r.loadImgCount} / ${kb(r.loadImgBytes)}    after full scroll: ${r.imgCount} / ${kb(r.imgBytes)}`);
  const fmts = Object.entries(r.byFmt).map(([f,v])=>`${f} ${v.n}×/${kb(v.b)}`).join('   ');
  console.log(`   By format (total): ${fmts}`);
  console.log(`   LCP (lab est): ${(r.lcp/1000).toFixed(2)} s     CLS @load: ${r.clsLoad}    CLS after scroll: ${r.clsAfterScroll}`);
}
console.log('\nJSON:');
console.log(JSON.stringify(results.map(r=>({label:r.label, loadKB:+(r.loadImgBytes/1024).toFixed(0), totalKB:+(r.imgBytes/1024).toFixed(0), lcp_s:+(r.lcp/1000).toFixed(2), clsLoad:r.clsLoad, clsScroll:r.clsAfterScroll})), null, 0));
