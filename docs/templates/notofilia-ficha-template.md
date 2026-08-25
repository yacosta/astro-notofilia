---
# ============================================================
# NOTOFILIA — Plantilla de ficha de colección
# Usar este archivo como base para todas las piezas
# (billetes, monedas, pruebas, specimens, errores, etc.)
# ============================================================

# Identificador permanente (único, URL-friendly, nunca cambia)
id: "NF.ejemplo-pais-denominacion-ano-variedad"

# Tipo de pieza
tipo: "billete"                    # billete | moneda | prueba | specimen | error | medalla | otro
subtipo: "circulacion"             # circulacion | prueba_prensa | specimen | ensayo | cancelado | etc.

# Datos principales (aparecen en el hero)
titulo: "Denominación o nombre corto de la pieza"
subtitulo: "Detalle distintivo · variedad · código de catálogo"
pais: "Colombia"
entidad_emisora: "Banco de la República"
denominacion: "2.000 pesos"
moneda: "peso colombiano"
fecha_emision: "2016-08-02"        # ISO o "c. 1970s" / "sin fecha"
serie: "AA"
numero_serie: "AA12345678"         # o "ninguno visible"
impresor: "Imprenta de Billetes – Banco de la República"
numero_catalogo: "P-458b"          # Pick, Friedberg, KM, Restrepo, etc.
codigo_interno: ""                 # Rothberg, archivo propio, etc.

# Material y medidas
material: "papel de algodón"       # papel | polímero | híbrido | plata | oro | cobre | etc.
sustrato_detalle: ""               # Guardian, Safeguard, etc. (opcional)
dimensiones: "140 × 70 mm"         # o "no confirmado"
peso: ""                           # solo monedas
grosor: ""                         # solo monedas
canto: ""                          # solo monedas

# Estado y rareza
condicion: "UNC"                   # UNC | AU | XF | VF | etc. o "Prueba" / "Sin encapsular"
encapsulado: false
grado: ""                          # PMG 65 EPQ, NGC MS63, etc.
tirada: "no confirmado"
base_rareza: "Emisión de circulación ordinaria"
estado_ejemplar: "Sin encapsular. Anverso y reverso completos."

# Fechas de control
fecha_ultima_revision: "2026-08-25"
fecha_incorporacion: "2026-08-20"

# SEO / metadatos
descripcion_corta: "Descripción de 1-2 frases para listados y Open Graph."
palabras_clave:
  - "Colombia"
  - "Banco de la República"
  - "2000 pesos"
  - "Débora Arango"

# Relacionados (lista de IDs de otras fichas)
piezas_relacionadas:
  - "NF.colombia-2000-pesos-debora-arango-prueba-anverso"
  - "NF.colombia-2000-pesos-debora-arango"

# Imágenes (rutas relativas o URLs)
imagenes:
  anverso: "/images/coleccion/ejemplo-anverso.jpg"
  reverso: "/images/coleccion/ejemplo-reverso.jpg"
  detalle_1: ""
  detalle_2: ""
  uniface: false                   # true si solo tiene una cara impresa

# Banderas de presentación
mostrar_anverso_reverso: true
mostrar_ficha_tecnica: true
---

<!-- ============================================================
     CUERPO DE LA FICHA
     Escribir el contenido narrativo debajo.
     El frontmatter de arriba alimenta la ficha técnica automática.
     ============================================================ -->

## Contexto histórico y de emisión

**Identificación:** [País] — [tipo de pieza] — [denominación] — [serie/fecha] — [número de catálogo].

Breve párrafo sobre el contexto histórico, la entidad emisora, el motivo de la emisión y cualquier dato relevante de tirada o circulación.

> **Nota importante:** Si se trata de una prueba, specimen o pieza no emitida, dejar claro desde el principio que **no es dinero de curso legal**.

### No confundir con
- [Enlace a pieza similar]
- [Otra variedad cercana]

## Diseño y detalles visibles

Descripción del anverso y reverso:

- **Anverso:** Retrato / motivo principal, leyendas, firmas, elementos de seguridad visibles.
- **Reverso:** Motivo secundario, valor, elementos de seguridad.
- Marca de agua, hilo de seguridad, tintas ópticamente variables, etc. (si aplica y es visible en la foto).

## Variedades conocidas

Listar las variedades principales de esta familia de piezas (firmas, series, sobresellos, errores de impresión, diferencias de color, etc.). Indicar claramente en qué se diferencia **este ejemplar**.

## Estado del ejemplar mostrado

Descripción concreta de la pieza fotografiada: estado de conservación, si está encapsulada, cualquier defecto o particularidad visible.

## Fuentes

1. Examen directo del ejemplar de la colección Notofilia ([descripción breve de lo observado]).
2. [Catálogo de referencia] — Pick / Friedberg / KM / Restrepo / etc.
3. [Fuente histórica o artículo] — enlace si está disponible.
4. [Sitio oficial del emisor] — si aporta contexto.

## Cómo citar esta ficha

> Notofilia. «[Título de la pieza]». Colección Virtual ([id]). https://notofilia.com/coleccion/[slug]/ (acceso [AAAA-MM-DD]).

## Reportar un error o aportar información

Si detecta un dato incorrecto o puede documentar una variedad, tirada, fuente adicional o corrección, escríbanos. Las correcciones verificadas se incorporan a esta ficha.
