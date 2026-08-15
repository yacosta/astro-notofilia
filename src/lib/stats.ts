import fs from 'node:fs';

export type CollectionStats = {
  banknotes: number;
  coins: number;
  countries: number;
  pages: number;
};

const FALLBACK: CollectionStats = {
  banknotes: 125,
  coins: 7,
  countries: 34,
  pages: 155,
};

/**
 * Build-time stats from public/sitemap.xml (mirrors the legacy homepage runtime).
 * Falls back to last-known counts if the sitemap is missing or unreadable.
 */
export function computeCollectionStats(
  sitemapPath = 'public/sitemap.xml',
): CollectionStats {
  try {
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    const paths = [...xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/g)].map((m) => {
      const p = m[1].replace(/^https?:\/\/[^/]+/, '').replace(/\/+$/, '');
      return p === '' ? '/' : `${p}/`;
    });

    const ROOTS = new Set([
      '/',
      '/coleccion/',
      '/coleccion/billete-obsoleto-estados-unidos/',
      '/coleccion/reserva-federal/',
      '/coleccion/departamento-del-tesoro-de-ee-uu/',
      '/coleccion/moneda-colonial/',
      '/coleccion/colombia/',
      '/coleccion/colombia/banca-libre/',
      '/coleccion/colombia/emisiones-en-el-extranjero/',
      '/coleccion/puerto-rico/',
      '/coleccion/ecuador/',
      '/coleccion/moneda-colonial-espanola/',
      '/coleccion/numismatica/',
      '/coleccion/polimero-mundial/',
      '/coleccion/pop-art/',
      '/coleccion/certificados-de-pago-militar/',
      '/coleccion/emisiones-promocionales/',
      '/coleccion/food-coupons-usda/',
    ]);
    const CF: Record<string, boolean> = {
      colombia: true,
      'puerto-rico': true,
      ecuador: true,
    };

    const total = paths.length;
    const profile = paths.filter((p) => p.includes('/perfil-')).length;
    const rootc = paths.filter((p) => ROOTS.has(p)).length;
    const coins = paths.filter(
      (p) => p.startsWith('/coleccion/moneda-colonial-espanola/') && !ROOTS.has(p),
    ).length;
    const banknotes = Math.max(0, total - profile - rootc - coins);

    let hasUS = false;
    const cs = new Set<string>();
    for (const p of paths) {
      if (ROOTS.has(p)) continue;
      const segs = p.split('/').filter(Boolean);
      if (segs[0] !== 'coleccion') continue;
      const second = segs[1];
      if (second === 'polimero-mundial') {
        if (segs.length > 2) {
          const mm = segs[2].match(/^([a-z-]+?)-\d/);
          cs.add(mm ? mm[1] : segs[2]);
        }
        continue;
      }
      if (CF[second]) cs.add(second);
      else hasUS = true;
    }

    return {
      banknotes,
      coins,
      countries: cs.size + (hasUS ? 1 : 0) || 1,
      pages: total,
    };
  } catch {
    return { ...FALLBACK };
  }
}

export function formatStatsEs(s: CollectionStats): string {
  return `${s.banknotes} billetes · ${s.coins} monedas · ${s.countries} países · ${s.pages} páginas`;
}

export function formatStatsEn(s: CollectionStats): string {
  return `${s.banknotes} banknotes · ${s.coins} coins · ${s.countries} countries · ${s.pages} pages`;
}
