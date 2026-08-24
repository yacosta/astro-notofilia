import { SITE } from './site';

export const PRIVACY_ES_PATH = '/politica-privacidad-cookies/';
export const PRIVACY_EN_PATH = '/en/privacy-cookies/';
export const PRIVACY_UPDATED = '2026-08-14';
export const PRIVACY_CONTACT = 'info@notofilia.com';

export function privacyJsonLd(lang: 'es' | 'en') {
  const path = lang === 'en' ? PRIVACY_EN_PATH : PRIVACY_ES_PATH;
  const url = `${SITE}${path}`;
  const name =
    lang === 'en' ? 'Privacy and Cookie Policy' : 'Política de Privacidad y Cookies';
  const description =
    lang === 'en'
      ? 'How Notofilia handles your data: Mailchimp newsletter, Cloudflare technical cookies, and your GDPR, LOPDGDD and Law 1581 rights.'
      : 'Cómo Notofilia trata sus datos: boletín Mailchimp, cookies técnicas de Cloudflare y sus derechos (RGPD, LOPDGDD, Ley 1581).';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'Notofilia',
        url: `${SITE}/`,
        logo: `${SITE}/favicon.png`,
        email: PRIVACY_CONTACT,
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name,
        description,
        inLanguage: lang,
        dateModified: PRIVACY_UPDATED,
        isPartOf: { '@type': 'WebSite', name: 'Notofilia', url: `${SITE}/` },
        publisher: { '@id': `${SITE}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Notofilia', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name, item: url },
        ],
      },
    ],
  };
}
