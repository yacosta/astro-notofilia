import { SITE } from './site';

/** Named editorial identity for bylines and Person schema. */
export const EDITORIAL_TEAM = {
  name: 'Equipo editorial de Notofilia',
  url: `${SITE}/editorial/#equipo-editorial`,
  jobTitle: 'Equipo editorial',
} as const;

export const EDITORIAL_POLICY_PATH = '/editorial/';
export const EDITORIAL_POLICY_URL = `${SITE}${EDITORIAL_POLICY_PATH}`;

export function personJsonLd(name = EDITORIAL_TEAM.name, url = EDITORIAL_TEAM.url) {
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
