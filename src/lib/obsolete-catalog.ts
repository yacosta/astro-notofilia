import type { CatalogCard } from './catalog-record';

export type ObsoleteBankCopy = {
  description: string;
  descriptionEn: string;
};

/** Location / issuer blurbs from the obsolete-U.S. hub, keyed by catalog slug. */
export const OBSOLETE_BANKS: Record<string, ObsoleteBankCopy> = {
  'state-bank-new-brunswick': {
    description:
      'Nueva Brunswick, Nueva Jersey · emisor privado de la época previa a la banca nacional.',
    descriptionEn: 'New Brunswick, New Jersey · private issuer of the era before national banking.',
  },
  'citizens-bank-of-louisiana': {
    description:
      'Shreveport, Luisiana · célebre por sus billetes bilingües con reverso en tinta roja, los llamados “Redbacks”.',
    descriptionEn:
      'Shreveport, Louisiana · known for its bilingual notes with red-ink backs, the so-called “Redbacks.”',
  },
  'hagerstown-bank-maryland': {
    description:
      'Hagerstown, Maryland · fundado en 1807, uno de los bancos más longevos del oeste de Maryland.',
    descriptionEn:
      'Hagerstown, Maryland · founded in 1807, one of the longest-lived banks in western Maryland.',
  },
  'city-bank-new-haven': {
    description:
      'New Haven, Connecticut · billete con viñeta portuaria que homenajea la tradición naviera de “la Ciudad de los Olmos”.',
    descriptionEn:
      'New Haven, Connecticut · a note with a harbor vignette honoring the maritime tradition of “the City of Elms.”',
  },
  'adrian-insurance-michigan': {
    description:
      'Adrian, Míchigan · billete de una compañía de seguros emisora de moneda durante la era de la “banca salvaje” del estado.',
    descriptionEn:
      'Adrian, Michigan · a note of an insurance company that issued currency during the state’s “wildcat banking” era.',
  },
};

const PLACEHOLDER_SECTION_RE = new RegExp(
  `<section id="(?:${Object.keys(OBSOLETE_BANKS).join('|')})"[\\s\\S]*?<\\/section>`,
  'g',
);

/** Bank slug from a Spanish catalog href (`/coleccion/{bank}/…`). */
export function obsoleteBankId(href: string): string | undefined {
  const path = href.split('#')[0].replace(/\/+$/, '');
  const parts = path.split('/').filter(Boolean);
  const index = parts.indexOf('coleccion');
  if (index === -1) return undefined;
  return parts[index + 1];
}

/** Caption each note with its issuing bank; hide denomination / year kickers. */
export function withObsoleteCaption(card: CatalogCard): CatalogCard {
  const groupId = obsoleteBankId(card.href);
  const bank = groupId ? OBSOLETE_BANKS[groupId] : undefined;
  return {
    ...card,
    denomination: undefined,
    year: undefined,
    description: bank?.description,
    descriptionEn: bank?.descriptionEn,
    group: card.group || card.title,
    groupEn: card.groupEn || card.titleEn || card.title,
    groupId: card.groupId || groupId,
  };
}

/** Drop the empty per-bank shells left after Phase 3 moved cards into CatalogHubGrid. */
export function stripObsoletePlaceholderSections(html: string): string {
  return html.replace(PLACEHOLDER_SECTION_RE, '');
}
