/**
 * Shared ES/EN chrome copy. Page bodies use [data-i18n] plus this map for
 * components that cannot take a literal English attribute inline.
 */
export const UI = {
  skip: { es: 'Saltar al contenido', en: 'Skip to content' },
  skipMain: { es: 'Saltar al contenido principal', en: 'Skip to main content' },
  crumbs: { es: 'Migas de pan', en: 'Breadcrumb' },
  home: { es: 'Inicio', en: 'Home' },
  collection: { es: 'Colección', en: 'Collection' },
  newWindow: { es: 'se abre en una pestaña nueva', en: 'opens in a new tab' },
  newWindowShort: { es: 'nueva ventana', en: 'new window' },
  permanentId: { es: 'Identificador permanente:', en: 'Permanent identifier:' },
  catalogMeta: { es: 'Datos de la ficha', en: 'Record details' },
  catalogSupport: { es: 'Información de apoyo', en: 'Supporting information' },
  historical: { es: 'Contexto histórico', en: 'Historical context' },
  design: { es: 'Diseño y retrato', en: 'Design and portrait' },
  varieties: { es: 'Variedades conocidas', en: 'Known varieties' },
  population: { es: 'Tirada o población', en: 'Print run or population' },
  sources: { es: 'Fuentes', en: 'Sources' },
  citeHeading: { es: 'Cómo citar esta ficha', en: 'How to cite this record' },
  copyCite: { es: 'Copiar cita', en: 'Copy citation' },
  copied: { es: 'Cita copiada al portapapeles.', en: 'Citation copied to the clipboard.' },
  copyFail: {
    es: 'No se pudo copiar automáticamente. Seleccione el texto de la cita.',
    en: 'Could not copy automatically. Select the citation text.',
  },
  related: { es: 'Piezas relacionadas', en: 'Related pieces' },
  recordNav: { es: 'Navegación entre fichas', en: 'Record navigation' },
  prevNext: { es: 'Ficha anterior y siguiente', en: 'Previous and next record' },
  feedbackHeading: { es: 'Reportar un error o aportar información', en: 'Report an error or add information' },
  feedbackBody: {
    es: 'Si detecta un dato incorrecto o puede documentar una variedad, tirada o fuente adicional, escríbanos. Las correcciones verificadas se incorporan a esta ficha.',
    en: 'If you spot an incorrect fact or can document a variety, print run, or extra source, write to us. Verified corrections are added to this record.',
  },
  writeEmail: { es: 'Escribir a info@notofilia.com', en: 'Email info@notofilia.com' },
  contactForm: { es: 'Formulario de contacto', en: 'Contact form' },
  editorialPolicy: { es: 'Política editorial', en: 'Editorial policy' },
  images: { es: 'Imágenes', en: 'Images' },
  viewFace: { es: 'Vista de la pieza', en: 'Piece view' },
  obverse: { es: 'Ver anverso', en: 'View obverse' },
  reverse: { es: 'Ver reverso', en: 'View reverse' },
  stacked: { es: 'Vista apilada', en: 'Stacked view' },
  enlarge: { es: 'Ampliar', en: 'Enlarge' },
  enlargeAria: { es: 'Ampliar imagen de la pieza', en: 'Enlarge the image of this piece' },
  close: { es: 'Cerrar', en: 'Close' },
  growing: { es: 'Catálogo en crecimiento', en: 'Growing catalog' },
  catalogStatus: { es: 'Estado del catálogo', en: 'Catalog status' },
  hubCards: { es: 'Fichas del catálogo', en: 'Catalog records' },
  otherPieces: { es: 'Otras piezas', en: 'Other pieces' },
  onePiece: { es: '1 pieza documentada', en: '1 documented piece' },
  pieces: { es: 'piezas documentadas', en: 'documented pieces' },
  thinNote: {
    es: 'Esta sección muestra únicamente fichas con imágenes y datos verificados. Se ampliará a medida que se documenten nuevas piezas.',
    en: 'This section only lists records with verified images and data. It will grow as new pieces are documented.',
  },
  unconfirmed: { es: 'no confirmado', en: 'unconfirmed' },
  cookiesAria: { es: 'Aviso de cookies', en: 'Cookie notice' },
  cookiesBody:
    'Usamos cookies técnicas necesarias para el funcionamiento del Sitio y, solo con su permiso, cookies analíticas (Google Analytics 4) para entender cómo se usa el contenido. Puede aceptar todas, rechazar las no esenciales, o leer más en nuestra',
  cookiesBodyEn:
    'We use necessary technical cookies to run the Site and, only with your permission, analytics cookies (Google Analytics 4) to understand how the content is used. You can accept all, reject non-essential cookies, or read more in our',
  cookiesPolicy: { es: 'Política de Privacidad y Cookies', en: 'Privacy and Cookie Policy' },
  cookiesReject: { es: 'Rechazar no esenciales', en: 'Reject non-essential' },
  cookiesAccept: { es: 'Aceptar todas', en: 'Accept all' },
  notFound: { es: 'Página no encontrada', en: 'Page not found' },
  notFoundLead: {
    es: 'La página que buscas no existe o fue movida. Explora la colección de billetes y monedas históricas.',
    en: 'The page you are looking for does not exist or was moved. Explore the collection of historical banknotes and coins.',
  },
  goHome: { es: 'Ir al inicio', en: 'Go to the homepage' },
  viewCollection: { es: 'Ver la colección', en: 'View the collection' },
  search: { es: 'Buscar', en: 'Search' },
  readMore: { es: 'Leer más →', en: 'Read more →' },
  fuente: { es: 'Fuente:', en: 'Source:' },
  publishedOn: { es: 'Publicado el', en: 'Published' },
  reviewedBy: { es: 'Revisado por', en: 'Reviewed by' },
  lastUpdated: { es: 'Última actualización', en: 'Last updated' },
  seeAlso: { es: 'Ver también:', en: 'See also:' },
  encyclopedia: { es: 'Enciclopedia:', en: 'Encyclopedia:' },
  backGlossary: { es: '← Volver al glosario', en: '← Back to the glossary' },
  glossaryKicker: { es: 'Recurso para coleccionistas', en: 'A resource for collectors' },
  glossarySearch: { es: 'Buscar en el glosario', en: 'Search the glossary' },
  glossaryAll: { es: 'Todas', en: 'All' },
  glossaryFilter: { es: 'Filtrar por categoría', en: 'Filter by category' },
  glossaryReset: { es: 'Ver todo el glosario', en: 'View the whole glossary' },
  glossaryClear: { es: 'Borrar búsqueda', en: 'Clear search' },
  claimHeading: { es: 'Sobre este valor', en: 'About this figure' },
} as const;

export const GLOSSARY_CATEGORY_EN: Record<string, string> = {
  Coleccionismo: 'Collecting',
  Conservación: 'Conservation',
  Disciplina: 'Discipline',
  Diseño: 'Design',
  Emisión: 'Issuing',
  'Monedas y divisas': 'Coins and currencies',
  Producción: 'Production',
};

export const METADATA_LABEL_EN: Record<string, string> = {
  País: 'Country',
  'Entidad emisora': 'Issuing authority',
  Denominación: 'Denomination',
  Moneda: 'Currency',
  'Fecha de emisión': 'Issue date',
  Serie: 'Series',
  'Número de serie': 'Serial number',
  Impresor: 'Printer',
  'Ceca / ensayador': 'Mint / assayer',
  'Número de catálogo': 'Catalog number',
  Material: 'Material',
  Composición: 'Composition',
  Dimensiones: 'Dimensions',
  Diámetro: 'Diameter',
  Peso: 'Weight',
  Canto: 'Edge',
  'Marca de agua': 'Watermark',
  'Elementos de seguridad': 'Security features',
  Condición: 'Condition',
  'Servicio de grading': 'Grading service',
  'Estado de la pieza': 'Piece status',
  Adquisición: 'Acquisition',
  Procedencia: 'Provenance',
  Tirada: 'Print run',
  'Variedades conocidas': 'Known varieties',
  'Fechas de circulación': 'Circulation dates',
  'Base de la rareza': 'Basis of rarity',
  'Estado del ejemplar mostrado': 'State of the specimen shown',
  'Fecha de última revisión factual': 'Date of last factual review',
  'Identificador permanente': 'Permanent identifier',
};

export const STATUS_LABEL_EN: Record<string, string> = {
  Specimen: 'Specimen',
  Circulado: 'Circulated',
  'Sin circular': 'Uncirculated',
  'Error de imprenta / acuñación': 'Printing / minting error',
  Proof: 'Proof',
  Otro: 'Other',
};

export const CLAIM_LABELS_EN: Record<string, string> = {
  seller_asking: 'Asking price (listing)',
  dealer_retail: 'Dealer estimate',
  catalog_valuation: 'Catalog valuation',
  melt_value: 'Melt value',
  auction_result: 'Documented auction result',
  auction_record: 'Auction record',
  media_claim: 'Figure reported in the press',
};

export const CLAIM_NOTES_EN: Record<string, string> = {
  seller_asking:
    'The amount cited is a third-party asking price, not a verified sale. Real value depends on authenticity, variety, grade, and demand.',
  dealer_retail:
    'The figure is a dealer estimate or quote, not necessarily a closed transaction. Authenticity, variety, grade, and demand can change the outcome.',
  catalog_valuation:
    'This is a catalog or price-guide valuation. It is not a bid or a hammer price; the market may sit above or below it.',
  melt_value:
    'The amount reflects intrinsic metal value (melt), not the collectible value of the piece. Authenticity, rarity, and grade usually outweigh metal alone.',
  auction_result:
    'The figure is a documented auction result for a specific specimen (grade, certification, and date). Similar pieces can hammer for different amounts.',
  auction_record:
    'This cites a reported auction record or ceiling for a variety or grade. It does not mean an ordinary example will reach that figure.',
  media_claim:
    'The figure comes from a secondary outlet or spokesperson and has not been verified by Notofilia as a closed sale. Real value depends on authenticity, variety, grade, and demand.',
};
