import { SITE } from './site';

/** Named editorial identity for bylines and Person schema. */
export const EDITORIAL_TEAM = {
  name: 'Yezid Acosta',
  givenName: 'Yezid',
  familyName: 'Acosta',
  /** Dedicated author profile (also linked from bylines). */
  url: `${SITE}/editorial/equipo/`,
  jobTitle: 'Editor',
  path: '/editorial/equipo/',
} as const;

export const EDITORIAL_POLICY_PATH = '/editorial/';
export const EDITORIAL_POLICY_URL = `${SITE}${EDITORIAL_POLICY_PATH}`;
export const CORRECTION_POLICY_PATH = '/editorial/#correcciones';
export const CORRECTION_POLICY_URL = `${SITE}${CORRECTION_POLICY_PATH}`;

/** Spanish Wikipedia article on the discipline — not a company page. */
export const WIKIPEDIA_NOTAFILIA_URL = 'https://es.wikipedia.org/wiki/Notafilia';

/**
 * External-links listing for Notofilia.com on that article.
 * Live as of 2026-08-16; MediaWiki marks it `rel="nofollow"` and the href is
 * a May 2013 Wayback snapshot of http://www.notofilia.com/, not the live apex.
 */
export const WIKIPEDIA_NOTOFILIA_ARCHIVE_URL =
  'https://web.archive.org/web/20130502020922/http://www.notofilia.com/';

export function personJsonLd(name: string = EDITORIAL_TEAM.name, url: string = EDITORIAL_TEAM.url) {
  const isNamedEditor = name === EDITORIAL_TEAM.name;
  return {
    '@type': 'Person' as const,
    '@id': `${EDITORIAL_TEAM.url}#person`,
    name,
    url: isNamedEditor ? EDITORIAL_TEAM.url : url,
    ...(isNamedEditor
      ? {
          jobTitle: EDITORIAL_TEAM.jobTitle,
          givenName: EDITORIAL_TEAM.givenName,
          familyName: EDITORIAL_TEAM.familyName,
        }
      : {}),
    worksFor: {
      '@type': 'Organization' as const,
      '@id': `${SITE}/#organization`,
      name: 'Notofilia',
      url: SITE,
    },
  };
}

/** Compact Person node for Organization.founder / graph cross-refs. */
export function founderJsonLd() {
  return {
    '@type': 'Person' as const,
    '@id': `${EDITORIAL_TEAM.url}#person`,
    name: EDITORIAL_TEAM.name,
    url: EDITORIAL_TEAM.url,
    jobTitle: EDITORIAL_TEAM.jobTitle,
  };
}
