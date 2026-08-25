export type FeaturedEntry = {
  href: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  /** Optional query applied when href is the hub browse section. */
  filter?: Record<string, string>;
};

export type RecentPiece = {
  href: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  imageBase: string;
  imageAlt: string;
};

/** Curated featured entry points for the global collection hub. */
export const FEATURED_ENTRIES: FeaturedEntry[] = [
  {
    href: '/coleccion/numismatica/',
    title: 'Numismática',
    titleEn: 'Numismatics',
    description: 'Catálogo de monedas: oro colonial, cobres de necesidad y piezas de comercio.',
    descriptionEn: 'Coin catalog: colonial gold, necessity copper, and trade pieces.',
  },
  {
    href: '/coleccion/colombia/',
    title: 'Colombia',
    titleEn: 'Colombia',
    description: 'Banca libre, Banco de la República, specimens y errores.',
    descriptionEn: 'Free banking, Banco de la República, specimens, and errors.',
  },
  {
    href: '/coleccion/estados-unidos/',
    title: 'Estados Unidos',
    titleEn: 'United States',
    description: 'Federal, colonial, MPC, obsoletos y emisiones promocionales.',
    descriptionEn: 'Federal, colonial, MPC, obsolete notes, and promotional issues.',
  },
  {
    href: '/coleccion/espana/',
    title: 'España',
    titleEn: 'Spain',
    description: 'Oro colonial de la ceca de Santa Fe de Bogotá.',
    descriptionEn: 'Colonial gold of the Santa Fe de Bogotá mint.',
  },
  {
    href: '/coleccion/puerto-rico/',
    title: 'Puerto Rico',
    titleEn: 'Puerto Rico',
    description: 'Emisiones coloniales y de transición del siglo XIX.',
    descriptionEn: 'Colonial and nineteenth-century transition issues.',
  },
  {
    href: '/coleccion/ecuador/',
    title: 'Ecuador',
    titleEn: 'Ecuador',
    description: 'Sucres documentados de la colección virtual.',
    descriptionEn: 'Documented sucres from the virtual collection.',
  },
  {
    href: '/coleccion/filipinas/',
    title: 'Filipinas',
    titleEn: 'Philippines',
    description: 'Certificados del Tesoro y Victory Series No. 66.',
    descriptionEn: 'Treasury Certificates and Victory Series No. 66.',
  },
  {
    href: '/coleccion/polimero-mundial/',
    title: 'Billetes de polímero',
    titleEn: 'Polymer banknotes',
    description: 'Catálogo mundial de sustratos Guardian, Safeguard e híbridos.',
    descriptionEn: 'World catalog of Guardian, Safeguard, and hybrid substrates.',
  },
  {
    href: '/coleccion/certificados-de-pago-militar/',
    title: 'Certificados de Pago Militar',
    titleEn: 'Military Payment Certificates',
    description: 'Series MPC usadas por las fuerzas armadas de EE. UU.',
    descriptionEn: 'MPC series used by the U.S. armed forces.',
  },
  {
    href: '/coleccion/billete-obsoleto-estados-unidos/',
    title: 'Billetes obsoletos de EE. UU.',
    titleEn: 'U.S. obsolete banknotes',
    description: 'Broken banknotes previos a la banca nacional (1782–1866).',
    descriptionEn: 'Broken banknotes from before national banking (1782–1866).',
  },
  {
    href: '/coleccion/pop-art/',
    title: 'Pop-art currency',
    titleEn: 'Pop-art currency',
    description: 'Piezas artísticas y reinterpretaciones contemporáneas.',
    descriptionEn: 'Art pieces and contemporary reinterpretations.',
  },
];

/** Recently highlighted pieces (shared with homepage Logros strip). */
export const RECENT_PIECES: RecentPiece[] = [
  {
    href: '/coleccion/colombia/banco-de-la-republica-2000-pesos-debora-arango/',
    title: 'Banco de la República — 2.000 pesos Débora Arango, prueba P-458b',
    titleEn: 'Banco de la República — 2,000-peso Débora Arango P-458b proof',
    description:
      'Prueba de impresión progresiva o parcial del 2.000 pesos (2.08.2016): anverso incompleto, reverso en blanco, series tapadas.',
    descriptionEn:
      'Progressive or partial printing proof of the 2,000-peso note (2.08.2016): incomplete face, blank reverse, blocked serials.',
    imageBase: 'colombia-banco-de-la-republica-2000-pesos-debora-arango',
    imageAlt:
      'Prueba de impresión progresiva del 2.000 pesos del Banco de la República con Débora Arango (P-458b): anverso parcial y reverso en blanco',
  },
  {
    href: '/coleccion/colombia/banco-de-la-republica-10-pesos-oro-1943/',
    title: 'Banco de la República — 10 pesos oro, 1943',
    titleEn: 'Banco de la República — 10 pesos oro, 1943',
    description:
      'Pick 389b del 20 de julio de 1943, PMG 50 EPQ, Serie N 6813011. Retrato de Antonio Nariño.',
    descriptionEn:
      'Pick 389b dated 20 July 1943, PMG 50 EPQ, Series N 6813011. Portrait of Antonio Nariño.',
    imageBase: 'colombia-banco-de-la-republica-10-pesos-oro-1943',
    imageAlt:
      'Billete encapsulado PMG de 10 pesos oro del Banco de la República, 20 de julio de 1943, Pick 389b, anverso y reverso con retrato de Antonio Nariño',
  },
  {
    href: '/coleccion/filipinas/2-pesos-victory-series-66/',
    title: 'Filipinas — 2 pesos Victory Series 66',
    titleEn: 'Philippines — 2 pesos Victory Series 66',
    description: 'Certificado del Tesoro, Pick 95a, serial F13317943. Rizal y sobresello VICTORY.',
    descriptionEn: 'Treasury Certificate, Pick 95a, serial F13317943. Rizal and VICTORY overprint.',
    imageBase: 'philippines-treasury-certificate-2-pesos-victory-series-66-cc5b2834',
    imageAlt: 'Certificado del Tesoro de Filipinas de 2 pesos, Victory Series No. 66, anverso y reverso',
  },
  {
    href: '/coleccion/filipinas/1-peso-victory-series-66/',
    title: 'Filipinas — 1 peso Victory Series 66',
    titleEn: 'Philippines — 1 peso Victory Series 66',
    description: 'Certificado del Tesoro, Pick 94a, serial F70618009. Mabini y sobresello VICTORY.',
    descriptionEn: 'Treasury Certificate, Pick 94a, serial F70618009. Mabini and VICTORY overprint.',
    imageBase: 'philippines-treasury-certificate-1-peso-victory-series-66-5c220d39',
    imageAlt: 'Certificado del Tesoro de Filipinas de 1 peso, Victory Series No. 66, anverso y reverso',
  },
  {
    href: '/coleccion/colombia/banco-de-rio-hacha-5-pesos-1883/',
    title: 'Banco de Rio Hacha — 5 pesos, 1883',
    titleEn: 'Banco de Rio Hacha — 5 pesos, 1883',
    description: 'Pruebas PMG 64 EPQ / 62 del 5 pesos de Riohacha (Pick S819p1 / S819p2), American Bank Note Company.',
    descriptionEn: 'PMG 64 EPQ / 62 proofs of the Riohacha 5 pesos (Pick S819p1 / S819p2), American Bank Note Company.',
    imageBase: 'colombia-banco-de-rio-hacha-5-pesos-1883',
    imageAlt: 'Pruebas PMG del 5 pesos del Banco de Rio Hacha, 1883, anverso y reverso encapsulados',
  },
  {
    href: '/coleccion/colombia/banco-hipotecario-5-pesos-1881/',
    title: 'Banco Hipotecario — 5 pesos, 1881',
    titleEn: 'Banco Hipotecario — 5 pesos, 1881',
    description: 'Pruebas PMG 61 del 5 pesos de Bogotá (Pick S511p1 / S511p2), American Bank Note Company.',
    descriptionEn: 'PMG 61 proofs of the Bogotá 5 pesos (Pick S511p1 / S511p2), American Bank Note Company.',
    imageBase: 'colombia-banco-hipotecario-5-pesos-1881-38a93057',
    imageAlt: 'Pruebas PMG del 5 pesos del Banco Hipotecario de Bogotá, 1881, anverso y reverso encapsulados',
  },
  {
    href: '/coleccion/ducado-oro-utrecht-1761/',
    title: 'Ducado de oro — Utrecht, 1761',
    titleEn: '1761 Utrecht Gold Ducat',
    description: 'NGC AU Details (Edge Filing), cert. 4685927-012, ceca de Utrecht.',
    descriptionEn: 'NGC AU Details (Edge Filing), cert. 4685927-012, Utrecht mint.',
    imageBase: '1761-netherland-ducat-utrecht',
    imageAlt: 'Ducado de oro de Utrecht de 1761 en cápsula NGC, anverso y reverso',
  },
  {
    href: '/coleccion/certificados-de-pago-militar/1-dolar-serie-681/',
    title: 'MPC Serie 681 — Un Dólar',
    titleEn: 'MPC Series 681 — One Dollar',
    description: 'Vietnam (1969–1970), Fr. M915 / Schwan S915-1, piloto USAF y F-100 Super Sabre.',
    descriptionEn: 'Vietnam (1969–1970), Fr. M915 / Schwan S915-1, USAF pilot and F-100 Super Sabre.',
    imageBase: 'mpc-series-681-1-dollar-c10102847',
    imageAlt:
      'Anverso y reverso del MPC Serie 681 de un dólar con piloto USAF y F-100 Super Sabre',
  },
  {
    href: '/coleccion/diez-dolares-1934-distritos/',
    title: '$10 Reserva Federal — Chicago 1934',
    titleEn: '$10 Federal Reserve — Chicago 1934',
    description: 'Serie de 1934, distrito G (Chicago). Friedberg FR-2004G.',
    descriptionEn: 'Series 1934, district G (Chicago). Friedberg FR-2004G.',
    imageBase: 'us-federal-reserve-note-10-dollars-1934-chicago',
    imageAlt:
      'Anverso del billete de diez dólares de la Reserva Federal de Chicago, serie 1934',
  },
  {
    href: '/coleccion/ringling-bros-50-aniversario-baraboo/#1-dolar',
    title: 'Ringling Bros. — Un Dólar (Baraboo)',
    titleEn: 'Ringling Bros. — One Dollar (Baraboo)',
    description: 'Scrip del 50º aniversario (1933), Shafer WI-100-1a.',
    descriptionEn: '50th-anniversary scrip (1933), Shafer WI-100-1a.',
    imageBase: 'ringling-bros-50th-anniversary-baraboo-1-dollar',
    imageAlt: 'Anverso y reverso del scrip de un dólar Ringling Bros. Baraboo 1933',
  },
  {
    href: '/coleccion/certificados-de-pago-militar/20-dolares-serie-692/',
    title: 'MPC Serie 692 — Veinte Dólares',
    titleEn: 'MPC Series 692 — Twenty Dollars',
    description: 'Última serie oficial de MPC (1970–1973), jefe Ouray.',
    descriptionEn: 'Last official MPC series (1970–1973), Chief Ouray.',
    imageBase: 'mpc-series-692-20-dollars-3f285359',
    imageAlt: 'Anverso y reverso del MPC Serie 692 de veinte dólares con el jefe Ouray',
  },
];
