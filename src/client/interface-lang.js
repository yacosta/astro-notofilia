/**
 * ES/EN chrome toggle. Document language stays `es`; only [data-i18n] nodes swap.
 * Persists in localStorage so the choice follows the visitor across pages.
 */
(function () {
  var KEY = 'notofilia-interface-lang';
  var es = document.getElementById('lang-es');
  var en = document.getElementById('lang-en');
  var label = document.getElementById('interface-lang-label');
  if (!es || !en) return;

  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  nodes.forEach(function (n) {
    if (n.getAttribute('data-es')) return;
    var target = n.getAttribute('data-i18n-target');
    n.setAttribute('data-es', target ? n.getAttribute(target) || '' : n.innerHTML);
  });
  if (label && !label.getAttribute('data-es')) {
    label.setAttribute('data-es', 'Idioma de la interfaz');
    label.setAttribute('data-en', 'Interface language');
  }

  function paintButtons(lang) {
    var isEs = lang === 'es';
    es.setAttribute('aria-pressed', String(isEs));
    en.setAttribute('aria-pressed', String(!isEs));
    es.classList.toggle('is-active', isEs);
    en.classList.toggle('is-active', !isEs);
  }

  function setInterfaceLang(lang, persist) {
    lang = lang === 'en' ? 'en' : 'es';
    document.documentElement.lang = 'es';
    document.documentElement.setAttribute('data-interface-lang', lang);
    nodes.forEach(function (n) {
      var v = lang === 'en' ? n.getAttribute('data-en') : n.getAttribute('data-es');
      if (v == null) return;
      var target = n.getAttribute('data-i18n-target');
      if (target) n.setAttribute(target, v);
      else n.innerHTML = v;
      if (lang === 'en') n.setAttribute('lang', 'en');
      else n.removeAttribute('lang');
    });
    if (label) {
      label.textContent = lang === 'en' ? 'Interface language' : 'Idioma de la interfaz';
      label.setAttribute('lang', lang === 'en' ? 'en' : 'es');
    }
    paintButtons(lang);
    if (window.__notofiliaHeroMotion && window.__notofiliaHeroMotion.syncLabels) {
      window.__notofiliaHeroMotion.syncLabels();
    }
    if (persist !== false) {
      try {
        localStorage.setItem(KEY, lang);
      } catch (e) {}
    }
    document.dispatchEvent(new CustomEvent('notofilia:interface-lang', { detail: { lang: lang } }));
  }

  es.addEventListener('click', function () {
    setInterfaceLang('es');
  });
  en.addEventListener('click', function () {
    setInterfaceLang('en');
  });

  var stored = 'es';
  try {
    stored = localStorage.getItem(KEY) === 'en' ? 'en' : 'es';
  } catch (e) {}
  setInterfaceLang(stored, false);
})();
