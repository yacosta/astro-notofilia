#!/usr/bin/env python3
"""Emit src/content/catalog/filipinas.json — Victory Series catalog at the country hub URL."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://notofilia.com"
ES_PATH = "/coleccion/filipinas/"
EN_PATH = "/en/collection/philippines/"
OUT = ROOT / "src/content/catalog/filipinas.json"
IMG1 = "/uploads/philippines-treasury-certificate-1-peso-victory-series-66-5c220d39"
IMG2 = "/uploads/philippines-treasury-certificate-2-pesos-victory-series-66-cc5b2834"
IMG5 = "/uploads/philippines-treasury-certificate-5-pesos-victory-series-66-ce93f0dc"


def dims(rel: str) -> tuple[int, int]:
    jpg = ROOT / f"public{rel}.jpg"
    if not jpg.exists():
        return (1024, 1284)
    script = (
        "import sharp from 'sharp'; "
        f"const m=await sharp({json.dumps(str(jpg))}).metadata(); "
        "console.log(`${m.width},${m.height}`);"
    )
    out = subprocess.check_output(["node", "--input-type=module", "-e", script], cwd=ROOT)
    w, h = out.decode().strip().split(",")
    return int(w), int(h)


def tab(es: bool) -> str:
    if es:
        return '<span aria-hidden="true">↗</span><span style="font-style:italic; font-weight:400;"> (se abre en una pestaña nueva)</span>'
    return '<span aria-hidden="true">↗</span><span style="font-style:italic; font-weight:400;"> (opens in a new tab)</span>'


def ext(href: str, label: str, es: bool) -> str:
    return f'<a href="{href}" target="_blank" rel="noopener noreferrer" style="color:#e7ddc4;">{label} {tab(es)}</a>'


def diamond(text: str, last: bool = False) -> str:
    mb = "" if last else " margin-bottom:8px;"
    return (
        f'<li style="display:flex; gap:12px; align-items:baseline;{mb}">'
        '<span style="width:6px; height:6px; min-width:6px; background:#5c4e33; transform:rotate(45deg); position:relative; top:-3px;"></span>'
        f'<span style="font-size:19px; line-height:1.6; color:#d8d2cd;">{text}</span></li>'
    )


def card(*, href: str, src: str, alt: str, w: int, h: int, kicker: str, title: str, detail: str, eager: bool) -> str:
    loading = 'loading="eager" fetchpriority="high"' if eager else 'loading="lazy"'
    # Shared 4:5 well so 1p/2p/5p cards stay the same outer size despite scan aspect.
    return (
        f'<a href="{href}" style="display:block; text-decoration:none; background:#141412; border:1px solid rgba(231,222,201,0.18); border-radius:2px; overflow:hidden;">'
        '<div class="catalog-hub-specimen-well" style="background:#0a0a09; position:relative; aspect-ratio:4/5; width:100%; box-sizing:border-box;">'
        '<picture style="position:absolute; inset:16px 12px; display:flex; align-items:center; justify-content:center;">'
        f'<source srcset="{src}-640.webp 640w, {src}.webp {w}w" sizes="(max-width: 640px) 100vw, 450px" type="image/webp" />'
        f'<img src="{src}.jpg" alt="{alt}" width="{w}" height="{h}" {loading} decoding="async" style="max-width:100%; max-height:100%; width:auto; height:auto; object-fit:contain; display:block;" />'
        "</picture></div>"
        '<div style="padding:14px 20px 22px;">'
        f'<span style="display:block; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#b7ab8a; margin-bottom:6px;">{kicker}</span>'
        f'<span style="display:block; font-family:\'Montenegrin Gothic One\', serif; font-size:22px; color:#d8d2cd; line-height:1.2; margin-bottom:4px;">{title}</span>'
        f'<span style="display:block; font-size:15px; color:#b7ab8a; line-height:1.4;">{detail}</span>'
        "</div></a>"
    )


def para(text: str, last: bool = False) -> str:
    m = "0" if last else "0 0 14px"
    return f'<p style="font-size:19px; line-height:1.75; color:#d8d2cd; margin:{m};">{text}</p>'


def kicker(text: str) -> str:
    return (
        f'<span style="display:block; font-size:14px; letter-spacing:0.22em; text-transform:uppercase; color:#b7ab8a; margin-bottom:14px;">{text}</span>'
    )


def h2(text: str, hid: str | None = None) -> str:
    id_attr = f' id="{hid}"' if hid else ""
    return (
        f'<h2{id_attr} style="font-family:\'Montenegrin Gothic One\', serif; font-weight:400; font-size:clamp(24px,3vw,32px); line-height:1.15; color:#d8d2cd; margin:0 0 20px;">{text}</h2>'
    )


def section_open() -> str:
    return '<section style="margin:0 0 72px; padding-top:48px; border-top:1px solid rgba(231,222,201,0.18);">'


def th(es: bool) -> list[str]:
    if es:
        return ["Valor", "Retrato / motivo", "Pick (sin CBP)", "Color principal"]
    return ["Value", "Portrait / motif", "Pick (no CBP)", "Main color"]


def rows(es: bool) -> list[tuple[str, str, str, str]]:
    if es:
        return [
            ("1 peso", "Apolinario Mabini", "94", "Naranja (reverso)"),
            ("2 pesos", "José Rizal", "95", "Azul"),
            ("5 pesos", "William McKinley y George Dewey", "96", "Amarillo"),
            ("10 pesos", "George Washington", "97", "Marrón"),
            ("20 pesos", "Volcán Mayón", "98", "Naranja / tostado"),
            ("50 pesos", "Henry Ware Lawton", "99", "Rosa"),
            ("100 pesos", "Ferdinand Magellan", "100", "Beige / oro claro"),
            ("500 pesos", "Miguel López de Legazpi", "101", "Violeta"),
        ]
    return [
        ("1 peso", "Apolinario Mabini", "94", "Orange (reverse)"),
        ("2 pesos", "José Rizal", "95", "Blue"),
        ("5 pesos", "William McKinley and George Dewey", "96", "Yellow"),
        ("10 pesos", "George Washington", "97", "Brown"),
        ("20 pesos", "Mayon Volcano", "98", "Orange / tan"),
        ("50 pesos", "Henry Ware Lawton", "99", "Pink"),
        ("100 pesos", "Ferdinand Magellan", "100", "Beige / light gold"),
        ("500 pesos", "Miguel López de Legazpi", "101", "Violet"),
    ]


def table(es: bool) -> str:
    headers = th(es)
    body = []
    data = rows(es)
    for i, (a, b, c, d) in enumerate(data):
        border = ' border-bottom:1px solid rgba(231,222,201,0.08);' if i < len(data) - 1 else ""
        body.append(
            f'<tr style="{border}"><td style="padding:10px 12px 10px 0;">{a}</td>'
            f'<td style="padding:10px 12px;">{b}</td><td style="padding:10px 12px;">{c}</td>'
            f'<td style="padding:10px 0 10px 12px;">{d}</td></tr>'
        )
    th_html = "".join(
        f'<th scope="col" style="text-align:left; padding:{pad}; font-weight:600; color:#b7ab8a; letter-spacing:0.06em;">{label}</th>'
        for pad, label in (
            ("10px 12px 10px 0", headers[0]),
            ("10px 12px", headers[1]),
            ("10px 12px", headers[2]),
            ("10px 0 10px 12px", headers[3]),
        )
    )
    return (
        '<div style="overflow-x:auto;">'
        '<table style="width:100%; border-collapse:collapse; font-size:16px; color:#d8d2cd;" aria-labelledby="victory-series-denoms">'
        f'<thead><tr style="border-bottom:1px solid rgba(231,222,201,0.25);">{th_html}</tr></thead>'
        f'<tbody>{"".join(body)}</tbody></table></div>'
    )


def build(lang: str, d1: tuple[int, int], d2: tuple[int, int], d5: tuple[int, int]) -> str:
    es = lang == "es"
    page = ES_PATH if es else EN_PATH
    h1 = "Serie Victory No. 66" if es else "Victory Series No. 66"
    href1 = "/coleccion/filipinas/1-peso-victory-series-66/" if es else "/en/collection/philippines/1-peso-victory-series-66/"
    href2 = "/coleccion/filipinas/2-pesos-victory-series-66/" if es else "/en/collection/philippines/2-pesos-victory-series-66/"
    href5 = "/coleccion/filipinas/5-pesos-victory-series-66/" if es else "/en/collection/philippines/5-pesos-victory-series-66/"
    alt1 = (
        "1 Peso Victory Series No. 66: anverso con Apolinario Mabini (arriba) y reverso naranja con sobresello VICTORY (abajo)"
        if es
        else "1 Peso Victory Series No. 66: obverse with Apolinario Mabini (top) and orange reverse with VICTORY overprint (bottom)"
    )
    alt2 = (
        "2 Pesos Victory Series No. 66: anverso con José Rizal (arriba) y reverso azul con sobresello VICTORY (abajo)"
        if es
        else "2 Pesos Victory Series No. 66: obverse with José Rizal (top) and blue reverse with VICTORY overprint (bottom)"
    )
    alt5 = (
        "5 Pesos Victory Series No. 66: anverso con McKinley y Dewey (arriba) y reverso amarillo con sobresello VICTORY (abajo)"
        if es
        else "5 Pesos Victory Series No. 66: obverse with McKinley and Dewey (top) and yellow reverse with VICTORY overprint (bottom)"
    )
    screen = "Serie Victory No. 66 — Filipinas" if es else "Victory Series No. 66 — Philippines"
    eyebrow = "Filipinas · Commonwealth" if es else "Philippines · Commonwealth"
    lead = (
        "Certificados del Tesoro de Filipinas (Treasury Certificates) impresos por el U.S. Bureau of Engraving and Printing en 1944 —la serie conocida como <strong>Victory Series No. 66</strong>— para acompañar el regreso de las fuerzas de liberación. Última emisión de papel moneda filipino bajo administración estadounidense."
        if es
        else "Philippine Treasury Certificates printed by the U.S. Bureau of Engraving and Printing in 1944 —the issue known as <strong>Victory Series No. 66</strong>— to accompany the return of liberation forces. Last Philippine paper-money issue under United States administration."
    )
    parts: list[str] = [
        f'<div lang="{lang}" style="width:100%; min-height:100vh; background:#0a0a09; font-family:\'Cormorant Garamond\', serif; box-sizing:border-box;">',
        "",
        f'  <main data-pagefind-meta="url:{page}" id="main-content" tabindex="-1" data-screen-label="{screen}" style="max-width:1180px; margin:0 auto; padding:64px 24px 96px; outline:none;">',
        "",
        f"    {kicker(eyebrow)}",
        "",
        f'    <h1 style="font-family:\'Montenegrin Gothic One\', serif; font-weight:400; font-size:clamp(34px,5vw,58px); line-height:1.05; color:#d8d2cd; margin:0 0 24px;">{h1}</h1>',
        "",
        f'    <p style="font-size:clamp(18px,1.8vw,21px); line-height:1.7; color:#d8d2cd; max-width:720px; margin:0 0 56px;">{lead}</p>',
        "",
        f"    {section_open()}",
        f"      {kicker('Contexto Histórico' if es else 'Historical context')}",
        f"      {h2('De los certificados del Tesoro al desembarco en Leyte' if es else 'From Treasury Certificates to the Leyte landing')}",
        para(
            "Durante el período americano (1903–1941), el gobierno insular emitió primero <em>Silver Certificates</em> (1903) respaldados por pesos plata o dólares estadounidenses a la par fija de ₱2 = $1, y a partir de 1918 los <em>Treasury Certificates</em> respaldados por bonos del Gobierno de Estados Unidos. Estas emisiones, impresas por el U.S. Bureau of Engraving and Printing (BEP), mantuvieron el formato de 160 × 66 mm que más tarde influiría incluso en el tamaño de los billetes estadounidenses."
            if es
            else "During the American period (1903–1941), the Insular Government first issued <em>Silver Certificates</em> (1903) backed by silver pesos or U.S. dollars at the fixed rate of ₱2 = $1, and from 1918 <em>Treasury Certificates</em> backed by United States Government bonds. Those issues, printed by the U.S. Bureau of Engraving and Printing (BEP), kept the 160 × 66 mm format that later influenced even the size of United States notes."
        ),
        para(
            "La ocupación japonesa (1942–1945) invalidó el papel prebélico y saturó la economía con «Japanese Invasion Money». El gobierno del Commonwealth en el exilio y las autoridades estadounidenses prepararon una emisión de emergencia para el momento de la liberación: los <strong>Treasury Certificates Victory Series No. 66</strong>."
            if es
            else "The Japanese occupation (1942–1945) voided pre-war paper and flooded the economy with “Japanese Invasion Money.” The Commonwealth government in exile and United States authorities prepared an emergency issue for liberation: the <strong>Treasury Certificates Victory Series No. 66</strong>."
        ),
        para(
            "El número «66» se atribuye tradicionalmente a la edad de Manuel L. Quezon al morir (1 de agosto de 1944). Quezon nació el 19 de agosto de 1878 y tenía 65 años cumplidos; la cifra 66 aparece en fuentes numismáticas y en referencias al BEP, aunque el informe original no se cita aquí de primera mano. La serie lleva impresa dos veces la leyenda «VICTORY SERIES NO. 66» en lugar de fecha."
            if es
            else "The figure “66” is traditionally attributed to Manuel L. Quezon’s age at death (1 August 1944). Quezon was born on 19 August 1878 and had turned 65; the figure 66 appears in numismatic sources and in references to the BEP, though the original report is not cited here at first hand. The series prints the legend “VICTORY SERIES NO. 66” twice in place of a date."
        ),
        para(
            "El 20 de octubre de 1944, con el desembarco de las fuerzas de MacArthur en Leyte, se pusieron en circulación los primeros ejemplares. Fuentes secundarias calculan un total facial emitido de ₱1.019.544.000. Fueron las últimas notas filipinas impresas por el BEP."
            if es
            else "On 20 October 1944, with MacArthur’s landing at Leyte, the first notes entered circulation. Secondary sources put the issued face total at ₱1,019,544,000. They were the last Philippine notes printed by the BEP.",
            last=True,
        ),
        "    </section>",
        "",
        f"    {section_open()}",
        f"      {kicker('Características de la serie' if es else 'Series characteristics')}",
        f"      {h2('Diseño, firmas y sobresellos' if es else 'Design, signatures, and overprints')}",
        para(
            "Los billetes conservan el diseño general de los Treasury Certificates prebélicos: retratos de héroes o figuras históricas en el anverso, sello azul del Commonwealth, texto en inglés que certifica el depósito en el Tesoro de Filipinas y la promesa de pago «in silver pesos or in legal tender currency of the United States of equivalent value». En el reverso aparece el sobresello negro grande <strong>VICTORY</strong>."
            if es
            else "The notes keep the general design of pre-war Treasury Certificates: portraits of heroes or historical figures on the face, the blue Commonwealth seal, English text certifying a deposit in the Treasury of the Philippines, and the promise of payment “in silver pesos or in legal tender currency of the United States of equivalent value.” The reverse carries the large black <strong>VICTORY</strong> overprint."
        ),
        para(
            "Denominaciones emitidas: 1, 2, 5, 10, 20, 50, 100 y 500 pesos. Combinaciones de firmas principales:"
            if es
            else "Denominations issued: 1, 2, 5, 10, 20, 50, 100, and 500 pesos. Main signature combinations:"
        ),
        '<ul style="margin:0 0 14px; padding:0 0 0 4px; list-style:none;">',
        diamond(
            "S. Osmeña (President) + J. Hernandez (Auditor General) — la más común en 1 y 2 pesos."
            if es
            else "S. Osmeña (President) + J. Hernandez (Auditor General) — the most common on 1 and 2 pesos."
        ),
        diamond(
            "S. Osmeña + M. Guevara (Treasurer) — presente en algunas denominaciones altas."
            if es
            else "S. Osmeña + M. Guevara (Treasurer) — found on some higher denominations."
        ),
        diamond(
            "M. Roxas (President) + M. Guevara (Treasurer) — menos frecuente."
            if es
            else "M. Roxas (President) + M. Guevara (Treasurer) — less frequent.",
            last=True,
        ),
        "</ul>",
        para(
            "En 1949, con la creación del Banco Central de Filipinas (Central Bank of the Philippines), existencias restantes recibieron un sobresello rojo adicional «CENTRAL BANK OF THE PHILIPPINES» (tipos Pick 117 y siguientes). Estos billetes «Victory-CBP» permanecieron de curso legal hasta el 30 de julio de 1964 y pudieron canjearse hasta el 30 de julio de 1967."
            if es
            else "In 1949, with the creation of the Central Bank of the Philippines, remaining stock received an additional red “CENTRAL BANK OF THE PHILIPPINES” overprint (Pick 117 and following). Those “Victory-CBP” notes remained legal tender until 30 July 1964 and could be redeemed until 30 July 1967."
        ),
        para(
            "El 500 pesos fue demonetizado antes (1955–1957). La serie completa constituye el puente entre el papel del Commonwealth y la English Series (1951) del nuevo banco central."
            if es
            else "The 500-peso note was demonetized earlier (1955–1957). The full series is the bridge between Commonwealth paper and the new central bank’s English Series (1951).",
            last=True,
        ),
        "    </section>",
        "",
        f"    {section_open()}",
        f"      {kicker('En la colección' if es else 'In the collection')}",
        f"      {h2('Ejemplares documentados' if es else 'Documented specimens')}",
        para(
            "Piezas de la Serie Victory No. 66 sin sobresello rojo del Banco Central, fotografiadas y descritas en las fichas de Notofilia."
            if es
            else "Victory Series No. 66 notes without the red Central Bank overprint, photographed and described in the Notofilia records.",
            last=True,
        ).replace('margin:0;', "margin:0 0 28px;"),
        '      <div class="catalog-hub-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:32px;">',
        "        "
        + card(
            href=href1,
            src=IMG1,
            alt=alt1,
            w=d1[0],
            h=d1[1],
            kicker="Pick 94a · 1944",
            title="1 Peso",
            detail="Apolinario Mabini · Osmeña / Hernandez · serial F70618009",
            eager=True,
        ),
        "        "
        + card(
            href=href2,
            src=IMG2,
            alt=alt2,
            w=d2[0],
            h=d2[1],
            kicker="Pick 95a · 1944",
            title="2 Pesos",
            detail="José Rizal · Osmeña / Hernandez (Auditor General) · serial F13317943",
            eager=False,
        ),
        "        "
        + card(
            href=href5,
            src=IMG5,
            alt=alt5,
            w=d5[0],
            h=d5[1],
            kicker="Pick 96a · 1944",
            title="5 Pesos",
            detail="McKinley / Dewey · Osmeña / Hernandez · serial F00618071",
            eager=False,
        ),
        "      </div>",
        "    </section>",
        "",
        f"    {section_open()}",
        f"      {kicker('Referencia rápida' if es else 'Quick reference')}",
        f"      {h2('Denominaciones de la serie (sin sobresello CBP)' if es else 'Series denominations (without CBP overprint)', 'victory-series-denoms')}",
        f"      {table(es)}",
        (
            '<p style="font-size:15px; line-height:1.6; color:#b7ab8a; margin:16px 0 0; font-style:italic;">Los tipos con sobresello rojo CBP corresponden a Pick 117–124 aproximadamente. Dimensiones habituales ~161,9 × 67,4 mm (Numista).</p>'
            if es
            else '<p style="font-size:15px; line-height:1.6; color:#b7ab8a; margin:16px 0 0; font-style:italic;">Types with the red CBP overprint correspond roughly to Pick 117–124. Usual dimensions ~161.9 × 67.4 mm (Numista).</p>'
        ),
        "    </section>",
        "",
        '    <section style="padding-top:48px; border-top:1px solid rgba(231,222,201,0.18);">',
        '      <h2 style="font-size:15px; letter-spacing:0.2em; text-transform:uppercase; color:#b7ab8a; font-weight:600; margin:0 0 16px; font-style:normal;">'
        + ("Fuentes" if es else "Sources")
        + "</h2>",
        '      <ul style="margin:0; padding:0 0 0 20px; font-size:16px; line-height:1.75; color:#b7ab8a; font-style:italic;">',
        (
            f"<li>Bangko Sentral ng Pilipinas — {ext('https://www.bsp.gov.ph/SitePages/CoinsAndNotes/EnglishSeries.aspx', 'English Series / demonetized notes', es)} (Victory Series No. 66 llegada en 1944; sobresello CBP; curso legal hasta 30 julio 1964)</li>"
            if es
            else f"<li>Bangko Sentral ng Pilipinas — {ext('https://www.bsp.gov.ph/SitePages/CoinsAndNotes/EnglishSeries.aspx', 'English Series / demonetized notes', es)} (Victory Series No. 66 arrived in 1944; CBP overprint; legal tender until 30 July 1964)</li>"
        ),
        f"<li>Bangko Sentral ng Pilipinas — {ext('https://www.bsp.gov.ph/Pages/CoinsAndNotes/HistoryOfPhilippineMoney/HistoryOfPhilippineMoney.aspx', 'History of Philippine Money', es)}</li>",
        (
            f"<li>Wikipedia — {ext('https://en.wikipedia.org/wiki/Banknotes_of_the_Philippine_peso', 'Banknotes of the Philippine peso', es)} (sección American Period y VICTORY-CBP)</li>"
            if es
            else f"<li>Wikipedia — {ext('https://en.wikipedia.org/wiki/Banknotes_of_the_Philippine_peso', 'Banknotes of the Philippine peso', es)} (American Period and VICTORY-CBP sections)</li>"
        ),
        f"<li>numismatics.ph — {ext('https://www.numismatics.ph/banknotes/victory-series/', 'Victory Series No. 66 Treasury Certificate Catalog', es)}</li>",
        (
            "<li>Bank Note Museum / Standard Catalog of World Paper Money — tipos Pick 94–101 y 117+</li>"
            if es
            else "<li>Bank Note Museum / Standard Catalog of World Paper Money — Pick 94–101 and 117+</li>"
        ),
        (
            "<li>Numista — fichas 1 Peso (Victory) y 2 Pesos (Victory)</li>"
            if es
            else "<li>Numista — 1 Peso (Victory) and 2 Pesos (Victory) records</li>"
        ),
        (
            "<li>Executive Order No. 25, s. 1944 (18 noviembre 1944) — reconocimiento de los Victory Pesos como moneda de curso legal</li>"
            if es
            else "<li>Executive Order No. 25, s. 1944 (18 November 1944) — recognition of Victory Pesos as legal tender</li>"
        ),
        "      </ul>",
        "    </section>",
        "",
        "  </main>",
        "</div>",
    ]
    return "\n".join(parts)


def main() -> None:
    d1 = dims(IMG1)
    d2 = dims(IMG2)
    d5 = dims(IMG5)
    es_html = build("es", d1, d2, d5)
    en_html = build("en", d1, d2, d5)
    payload = {
        "path": ES_PATH,
        "title": "Serie Victory No. 66 Filipinas (1944) | Notofilia",
        "description": "Catálogo Victory Series No. 66 de Filipinas (1944): certificados del Tesoro, Pick 94–101, liberación de Leyte y ejemplares de la colección Notofilia.",
        "keywords": [
            "billetes de filipinas",
            "philippines banknotes",
            "filipinas",
            "philippines",
            "victory series 66",
            "victory note",
            "tesorería de filipinas",
            "treasury certificate",
            "leyte",
            "pick 94",
            "pick 95",
        ],
        "robots": "index, follow, max-image-preview:large",
        "ogType": "website",
        "ogTitle": "Serie Victory No. 66 — Filipinas (1944)",
        "ogDescription": "Certificados del Tesoro Victory Series No. 66: Pick 94–101, Leyte 1944 y ejemplares de 1, 2 y 5 pesos.",
        "ogImage": f"{IMG1}.jpg",
        "jsonLd": {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Notofilia", "item": f"{SITE}/"},
                        {"@type": "ListItem", "position": 2, "name": "Filipinas", "item": f"{SITE}{ES_PATH}"},
                    ],
                },
                {
                    "@type": "CollectionPage",
                    "@id": f"{SITE}{ES_PATH}#page",
                    "name": "Serie Victory No. 66",
                    "url": f"{SITE}{ES_PATH}",
                    "description": "Certificados del Tesoro de Filipinas Victory Series No. 66 (1944) de la colección Notofilia.",
                    "inLanguage": "es",
                    "hasPart": [
                        {
                            "@type": "CreativeWork",
                            "name": "1 Peso — Victory Series No. 66 (Pick 94a)",
                            "url": f"{SITE}/coleccion/filipinas/1-peso-victory-series-66/",
                        },
                        {
                            "@type": "CreativeWork",
                            "name": "2 Pesos — Victory Series No. 66 (Pick 95a)",
                            "url": f"{SITE}/coleccion/filipinas/2-pesos-victory-series-66/",
                        },
                        {
                            "@type": "CreativeWork",
                            "name": "5 Pesos — Victory Series No. 66 (Pick 96)",
                            "url": f"{SITE}/coleccion/filipinas/5-pesos-victory-series-66/",
                        },
                    ],
                },
            ],
        },
        "styles": "body { margin: 0; }\n    a { color: #6b521f; text-decoration: underline; text-decoration-color: rgba(138,109,59,0.35); }\n    a:hover { color: #5c4826; }\n    a:focus-visible { outline: 2px solid #e7ddc4; outline-offset: 3px; }\n    ::selection { background: rgba(138,109,59,0.25); }\n    html, body { background:#0a0a09; margin:0; }",
        "template": es_html,
        "logic": "",
        "record": {
            "id": "NF.filipinas",
            "kind": "other",
            "title": "Serie Victory No. 66",
            "subtitle": "Certificados del Tesoro · 1944 · Pick 94–101",
            "dateOrSeries": "Victory Series No. 66, 1944",
            "country": "Filipinas",
            "issuer": "Tesorería de Filipinas (Treasury of the Philippines)",
            "breadcrumb": [
                {"name": "Notofilia", "href": "/"},
                {"name": "Filipinas"},
            ],
            "metadata": {
                "denomination": "1, 2, 5, 10, 20, 50, 100 y 500 pesos",
                "currency": "Peso filipino (Commonwealth)",
                "issuer": "Tesorería de Filipinas (Treasury of the Philippines)",
                "printer": "U.S. Bureau of Engraving and Printing",
                "issueDate": "ND (1944); Victory Series No. 66",
                "series": "Victory Series No. 66",
                "catalogNumber": "Pick 94–101 (sin CBP); Pick 117–124 aprox. (con CBP)",
                "material": "Papel",
                "dimensions": "Numista: ~161,9 × 67,4 mm. Medición propia: no confirmado",
                "printRun": "Fuentes secundarias: total facial ₱1.019.544.000. Informe BEP original: no confirmado",
                "knownVarieties": "Sin sobresello CBP (esta página) y con sobresello rojo CENTRAL BANK OF THE PHILIPPINES (1949). Firmas Osmeña–Hernandez, Osmeña–Guevara, Roxas–Guevara.",
                "circulationDates": "Leyte, 20 octubre 1944. Tipo sin CBP: 1944–1949. Con sobresello CBP de curso legal hasta 30 julio 1964 (BSP).",
                "rarityBasis": "Serie de liberación; 1 y 2 pesos son los tipos más comunes. Población PMG: no confirmado",
                "shownSpecimenState": "En la colección: 1 peso Pick 94a serial F70618009, 2 pesos Pick 95a serial F13317943 y 5 pesos Pick 96a serial F00618071, todos sin sobresello rojo CBP. Grado numérico: no confirmado",
                "factualReviewDate": "2026-08-25",
            },
            "render": "astro-static",
            "eyebrow": "Filipinas · Commonwealth",
            "related": [
                {"href": "/coleccion/filipinas/1-peso-victory-series-66/", "title": "1 Peso Victory Series No. 66"},
                {"href": "/coleccion/filipinas/2-pesos-victory-series-66/", "title": "2 Pesos Victory Series No. 66"},
                {"href": "/coleccion/filipinas/5-pesos-victory-series-66/", "title": "5 Pesos Victory Series No. 66"},
                {"href": "/coleccion/veinte-dolares-hawaii-1934/", "title": "$20 Hawaii, 1934"},
                {"href": "/glosario/sobresello/", "title": "Sobresello"},
            ],
        },
        "legacyFile": "catalogo-filipinas.dc.html",
        "sourceHash": hashlib.sha256(es_html.encode()).hexdigest()[:16],
        "i18n": {
            "en": {
                "path": EN_PATH,
                "title": "Victory Series No. 66 Philippines (1944) | Notofilia",
                "description": "Philippines Victory Series No. 66 catalog (1944): Treasury Certificates, Pick 94–101, Leyte landing, and Notofilia specimens.",
                "ogTitle": "Victory Series No. 66 — Philippines (1944)",
                "ogDescription": "Victory Series No. 66 Treasury Certificates: Pick 94–101, Leyte 1944, and 1-, 2-, and 5-peso specimens.",
                "recordTitle": "Victory Series No. 66",
                "eyebrow": "Philippines · Commonwealth",
                "template": en_html,
            }
        },
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)} 1p={d1} 2p={d2} 5p={d5}")


if __name__ == "__main__":
    main()
