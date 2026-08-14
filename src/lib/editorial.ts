import { SITE } from './site';

/** Named editorial identity for bylines and Person schema. */
export const EDITORIAL_TEAM = {
  name: 'Equipo editorial de Notofilia',
  /** Dedicated author profile (also linked from bylines). */
  url: `${SITE}/editorial/equipo/`,
  jobTitle: 'Equipo editorial',
  path: '/editorial/equipo/',
} as const;

export const EDITORIAL_POLICY_PATH = '/editorial/';
export const EDITORIAL_POLICY_URL = `${SITE}${EDITORIAL_POLICY_PATH}`;
export const CORRECTION_POLICY_PATH = '/editorial/#correcciones';
export const CORRECTION_POLICY_URL = `${SITE}${CORRECTION_POLICY_PATH}`;

export function personJsonLd(name: string = EDITORIAL_TEAM.name, url: string = EDITORIAL_TEAM.url) {
  return {
    '@type': 'Person' as const,
    name,
    url,
    jobTitle: EDITORIAL_TEAM.jobTitle,
    worksFor: {
      '@type': 'Organization' as const,
      name: 'Notofilia',
      url: SITE,
    },
  };
}
