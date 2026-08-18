/**
 * Lightweight island for SiteHeader: drawer + lazy Pagefind search.
 * No duplicate document fetch; no dc-runtime dependency.
 */
(function () {
  var header = document.getElementById('site-header');
  if (!header) return;

  var menuBtn = document.getElementById('site-menu-toggle');
  var menuClose = document.getElementById('site-menu-close');
  var drawer = document.getElementById('site-menu-drawer');
  var backdrop = document.getElementById('site-menu-backdrop');
  var searchBtn = document.getElementById('site-search-toggle');
  var searchPanel = document.getElementById('site-search-panel');
  var searchInput = document.getElementById('site-search-input');
  var searchResults = document.getElementById('site-search-results');
  var pagefindPromise = null;
  var searchRequest = 0;
  var lastFocus = null;

  function isEn() {
    var root = document.documentElement;
    return root.getAttribute('data-page-locale') === 'en' || root.lang === 'en';
  }

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) el.setAttribute('hidden', '');
    else el.removeAttribute('hidden');
  }

  function openDrawer() {
    lastFocus = document.activeElement;
    setHidden(drawer, false);
    setHidden(backdrop, false);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    if (menuClose) menuClose.focus();
  }

  function closeDrawer() {
    setHidden(drawer, true);
    setHidden(backdrop, true);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    if (drawer) {
      drawer.querySelectorAll('details[open]').forEach(function (panel) {
        panel.removeAttribute('open');
      });
    }
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function openSearch() {
    setHidden(searchPanel, false);
    if (searchBtn) searchBtn.setAttribute('aria-expanded', 'true');
    if (searchInput) {
      searchInput.focus();
      if (searchInput.value.trim()) runSearch(searchInput.value);
    }
  }

  function closeSearch() {
    setHidden(searchPanel, true);
    setHidden(searchResults, true);
    if (searchBtn) searchBtn.setAttribute('aria-expanded', 'false');
  }

  function loadPagefind() {
    if (!pagefindPromise) {
      // Built as an absolute runtime URL so Vite/Rollup does not try to bundle Pagefind.
      var pagefindUrl = '/pagefind/' + 'pagefind.js';
      pagefindPromise = import(pagefindUrl).catch(function () {
        pagefindPromise = null;
        throw new Error('pagefind');
      });
    }
    return pagefindPromise;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function runSearch(query) {
    var term = String(query || '').trim();
    var request = ++searchRequest;
    if (!term) {
      setHidden(searchResults, true);
      if (searchResults) searchResults.innerHTML = '';
      return;
    }
    setHidden(searchResults, false);
    if (searchResults) {
      searchResults.innerHTML = isEn()
        ? '<span class="site-header__search-empty">Searching…</span>'
        : '<span class="site-header__search-empty">Buscando…</span>';
    }
    loadPagefind()
      .then(function (pagefind) {
        return pagefind.search(term);
      })
      .then(function (search) {
        return Promise.all(
          (search.results || []).slice(0, 8).map(function (result) {
            return result.data();
          }),
        );
      })
      .then(function (data) {
        if (request !== searchRequest || !searchResults) return;
        if (!data.length) {
          searchResults.innerHTML = isEn()
            ? '<span class="site-header__search-empty">No results for “' +
              escapeHtml(term) +
              '”. <a href="/buscar/?q=' +
              encodeURIComponent(term) +
              '">Open the search page</a></span>'
            : '<span class="site-header__search-empty">Sin resultados para “' +
              escapeHtml(term) +
              '”. <a href="/buscar/?q=' +
              encodeURIComponent(term) +
              '">Ver página de búsqueda</a></span>';
          return;
        }
        searchResults.innerHTML = data
          .map(function (item) {
            var href = item.url || '#';
            var title = item.meta && item.meta.title ? item.meta.title : item.url;
            return (
              '<a role="option" href="' +
              escapeHtml(href) +
              '">' +
              escapeHtml(title) +
              '</a>'
            );
          })
          .join('');
      })
      .catch(function () {
        if (request !== searchRequest || !searchResults) return;
        searchResults.innerHTML = isEn()
          ? '<span class="site-header__search-empty">Search could not be loaded. <a href="/buscar/?q=' +
            encodeURIComponent(term) +
            '">Go to /buscar/</a></span>'
          : '<span class="site-header__search-empty">No se pudo cargar la búsqueda. <a href="/buscar/?q=' +
            encodeURIComponent(term) +
            '">Ir a /buscar/</a></span>';
      });
  }

  if (menuBtn) menuBtn.addEventListener('click', openDrawer);
  if (menuClose) menuClose.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  if (drawer) {
    drawer.addEventListener('click', function (event) {
      var target = event.target;
      if (target && target.closest && target.closest('a')) closeDrawer();
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', function () {
      var open = searchBtn.getAttribute('aria-expanded') === 'true';
      if (open) closeSearch();
      else openSearch();
    });
  }

  if (searchInput) {
    var timer = null;
    searchInput.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        runSearch(searchInput.value);
      }, 180);
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      if (drawer && !drawer.hasAttribute('hidden')) closeDrawer();
      else if (searchPanel && !searchPanel.hasAttribute('hidden')) closeSearch();
    }
  });

  document.addEventListener('click', function (event) {
    if (!searchPanel || searchPanel.hasAttribute('hidden')) return;
    if (header.contains(event.target)) return;
    closeSearch();
  });

  if (header.getAttribute('data-overlay') === 'true') {
    var onScroll = function () {
      if (window.scrollY > 24) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
