// Cloudflare Image Transformations helper.
//
// In production (served through the Cloudflare zone) this emits
//   /cdn-cgi/image/width=W,format=auto,quality=Q/uploads/<file>
// URLs, which negotiate AVIF/WebP by the browser's Accept header and resize on
// the fly at the edge (Cloudflare never upscales past the source with the
// default fit=scale-down, so requesting width=1024 from a 530px master safely
// returns 530px).
//
// In dev/preview there is no edge to do the transform, so we pass the origin
// /uploads/<file> path through unchanged and local rendering still works.
//
// IMPORTANT: /cdn-cgi/image only resolves when the request goes through the
// Cloudflare zone (the notofilia.com custom domain). It does NOT work on a bare
// *.pages.dev preview URL — QA the transformed output on a custom-domain
// deploy, not the raw pages.dev link.

export interface ImgOpts {
  /** Target width in px. Omit for the largest (source-capped) rendition. */
  width?: number;
  /** JPEG/WebP/AVIF quality 1–100. Default 82 (catalogue scans). */
  quality?: number;
}

/** Transform a single origin `/uploads/...` path into a Cloudflare image URL. */
export function cdnImg(path: string, { width, quality = 82 }: ImgOpts = {}): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (!import.meta.env.PROD) return clean; // dev/preview passthrough
  const params = [`format=auto`, `quality=${quality}`];
  if (width) params.unshift(`width=${width}`);
  return `/cdn-cgi/image/${params.join(',')}${clean}`;
}

/** Build a `srcset` string across the given widths for one source path. */
export function cdnSrcset(path: string, widths: number[], quality = 82): string {
  return widths.map((w) => `${cdnImg(path, { width: w, quality })} ${w}w`).join(', ');
}
