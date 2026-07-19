const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

const json = (body, init = {}) => new Response(JSON.stringify(body), {
  ...init,
  headers: { ...JSON_HEADERS, ...init.headers },
});

const normalizeSlug = (value) => {
  const slug = String(value || '').trim().toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : null;
};

const normalizeText = (value) => String(value || '')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

export async function onRequestGet(context) {
  const slug = normalizeSlug(context.params.slug);
  if (!slug) return json({ error: 'Artículo no válido.' }, { status: 400 });

  const { results } = await context.env.COMMENTS_DB.prepare(`
    SELECT id, author_name AS authorName, body, created_at AS createdAt
    FROM comments
    WHERE article_slug = ? AND status = 'approved'
    ORDER BY created_at ASC, id ASC
  `).bind(slug).all();

  return json({ comments: results });
}

export async function onRequestPost(context) {
  const slug = normalizeSlug(context.params.slug);
  if (!slug) return json({ error: 'Artículo no válido.' }, { status: 400 });

  if (!context.env.TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY is not configured');
    return json({ error: 'Los comentarios no están disponibles temporalmente.' }, { status: 503 });
  }

  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return json({ error: 'Solicitud no válida.' }, { status: 400 });
  }

  const authorName = normalizeText(payload.name);
  const body = normalizeText(payload.comment);
  const token = String(payload.turnstileToken || '').trim();

  if (authorName.length < 2 || authorName.length > 60) {
    return json({ error: 'El nombre debe tener entre 2 y 60 caracteres.' }, { status: 400 });
  }
  if (body.length < 3 || body.length > 1500) {
    return json({ error: 'El comentario debe tener entre 3 y 1.500 caracteres.' }, { status: 400 });
  }
  if (!token || token.length > 2048) {
    return json({ error: 'Completa la verificación de seguridad.' }, { status: 400 });
  }

  const remoteIp = context.request.headers.get('CF-Connecting-IP') || undefined;
  let verification;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        secret: context.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: remoteIp,
      }),
    });
    verification = await response.json();
  } catch (error) {
    console.error('Turnstile validation failed', error);
    return json({ error: 'No se pudo completar la verificación. Inténtalo de nuevo.' }, { status: 502 });
  }

  const requestHostname = new URL(context.request.url).hostname;
  if (
    !verification.success
    || verification.hostname !== requestHostname
    || verification.action !== 'comment'
  ) {
    console.warn('Rejected Turnstile verification', {
      hostname: verification.hostname,
      action: verification.action,
      errors: verification['error-codes'],
    });
    return json({ error: 'La verificación de seguridad falló. Inténtalo de nuevo.' }, { status: 403 });
  }

  await context.env.COMMENTS_DB.prepare(`
    INSERT INTO comments (article_slug, author_name, body, status)
    VALUES (?, ?, ?, 'pending')
  `).bind(slug, authorName, body).run();

  return json({
    message: 'Gracias. Tu comentario quedó pendiente de aprobación.',
  }, { status: 202 });
}
