# Prompt: Build a Numismatic/Notaphilic Glossary from Notofilia.com

Copy everything below the line into a new Claude conversation (works best with web search/fetch enabled). If you'd rather feed it unpublished page drafts, paste them where indicated in Step 1.

---

You are a bilingual (Spanish/English) numismatics and notaphily editor building a glossary for Notofilia.com, a Spanish-first, bilingual website about banknote and coin collecting.

## Step 1 — Gather source vocabulary
Fetch and read the content of https://notofilia.com and any linked internal pages you can reach (e.g., /en, article pages, category pages). If I paste additional page content or drafts below, treat that as source material too.

[OPTIONAL: paste page drafts or additional content here]

## Step 2 — Extract terms
From the source material, extract every term that belongs to the numismatic/notaphilic domain. Include:
- Core discipline terms (numismática, notafilia, exonumia, etc.)
- Banknote anatomy and design (viñeta, grabado, marca de agua, hilo de seguridad, orla, guilloché, retrato, anverso, reverso, etc.)
- Production and printing (acuñación, calcografía, offset, tipografía, plancha, serie, numeración, firma, etc.)
- Issuance and monetary history (emisión, banco emisor, curso legal, desmonetización, sobresello, resello, billete provisional, etc.)
- Grading and condition (UNC, EBC, conservación, dobleces, planchado, etc.)
- Collecting practice (catálogo, Pick number, variante, error, remplazo/estrella, lote, etc.)
- Currency names appearing on the site (quetzal, rial, peso, real, etc.) — group these in their own section

Do NOT invent terms and claim they came from the site. Tag each entry with its source:
- **[sitio]** — found on Notofilia.com
- **[sugerido]** — standard notaphilic term NOT yet on the site, proposed as an addition

## Step 3 — Build glossary entries
For each term produce:
1. **Término (ES)** — Spanish headword, in natural dictionary form
2. **Term (EN)** — standard English equivalent used by collectors (e.g., "watermark," not a literal translation)
3. **Definición (ES)** — 1–3 sentences, precise but accessible to a beginner collector
4. **Definition (EN)** — same content in English, not a machine-translation of the Spanish
5. **Categoría** — one of: Disciplina / Diseño / Producción / Emisión / Conservación / Coleccionismo / Monedas y divisas
6. **Ver también** — cross-references to related glossary terms, if any

## Step 4 — Output format
Produce THREE outputs:
1. **Human-readable glossary** — alphabetized by Spanish term, grouped by category is NOT needed; a single A–Z list with category labels is fine.
2. **JSON array** — one object per term with keys: `term_es`, `term_en`, `definition_es`, `definition_en`, `category`, `see_also`, `source` ("site" or "suggested"). This will be used to render the glossary page programmatically.
3. **SEO block** — a suggested page title, meta description (ES and EN, ≤155 characters each), and a one-paragraph intro for a /glosario page, plus JSON-LD `DefinedTermSet` schema markup covering the first 10 terms as an example.

## Style rules
- Spanish definitions use neutral Latin American Spanish.
- English terms follow usage in standard references (IBNS conventions, Standard Catalog of World Paper Money terminology) without quoting from them.
- Keep definitions original — do not copy definitions from other websites or catalogs.
- If a term is ambiguous (e.g., "serie" as print run vs. serial prefix), give the notaphilic sense and note the ambiguity briefly.
- Aim for at least 40 total entries; if the site yields fewer than 40, fill the gap with [sugerido] terms a beginner-to-intermediate banknote collector would search for.

Before writing the glossary, list which pages you were able to fetch and roughly how many candidate terms each contributed, so I can verify coverage.
