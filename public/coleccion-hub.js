/**
 * Client-side catalog browser for /coleccion/.
 * Filters, sorts, and toggles grid/list views against /data/catalog-index.json.
 */
(function () {
  var root = document.getElementById('catalog-browser');
  if (!root) return;

  var searchInput = document.getElementById('catalog-search');
  var resultsEl = document.getElementById('catalog-results');
  var countEl = document.getElementById('catalog-result-count');
  var emptyEl = document.getElementById('catalog-empty');
  var form = document.getElementById('catalog-filters');
  var viewButtons = root.querySelectorAll('button[data-view]');
  var clearBtn = document.getElementById('catalog-clear-filters');

  var state = {
    items: [],
    view: 'grid',
    q: '',
    pais: '',
    emisor: '',
    tipo: '',
    material: '',
    condicion: '',
    catalogo: '',
    yearFrom: '',
    yearTo: '',
    denom: '',
    sort: 'newest',
  };

  function param(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || '';
    } catch (_) {
      return '';
    }
  }

  function syncFromUrl() {
    state.q = param('q');
    state.pais = param('pais');
    state.emisor = param('emisor');
    state.tipo = param('tipo');
    state.material = param('material');
    state.condicion = param('condicion');
    state.catalogo = param('catalogo');
    state.yearFrom = param('desde');
    state.yearTo = param('hasta');
    state.denom = param('denom');
    state.sort = param('orden') || 'newest';
    state.view = param('vista') === 'lista' ? 'list' : 'grid';
  }

  function writeUrl() {
    var params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.pais) params.set('pais', state.pais);
    if (state.emisor) params.set('emisor', state.emisor);
    if (state.tipo) params.set('tipo', state.tipo);
    if (state.material) params.set('material', state.material);
    if (state.condicion) params.set('condicion', state.condicion);
    if (state.catalogo) params.set('catalogo', state.catalogo);
    if (state.yearFrom) params.set('desde', state.yearFrom);
    if (state.yearTo) params.set('hasta', state.yearTo);
    if (state.denom) params.set('denom', state.denom);
    if (state.sort && state.sort !== 'newest') params.set('orden', state.sort);
    if (state.view === 'list') params.set('vista', 'lista');
    var qs = params.toString();
    var next = window.location.pathname + (qs ? '?' + qs : '') + '#explorar';
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', next);
    }
  }

  function fillSelect(id, values, selected) {
    var el = document.getElementById(id);
    if (!el) return;
    var current = selected || '';
    var opts = ['<option value="">' + (isEn() ? 'All' : 'Todos') + '</option>'];
    values.forEach(function (value) {
      var sel = value === current ? ' selected' : '';
      opts.push(
        '<option value="' +
          escapeAttr(value) +
          '"' +
          sel +
          '>' +
          escapeHtml(value) +
          '</option>',
      );
    });
    el.innerHTML = opts.join('');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, '&#39;');
  }

  function uniqueSorted(values) {
    var map = {};
    values.forEach(function (v) {
      if (v) map[v] = true;
    });
    return Object.keys(map).sort(function (a, b) {
      return a.localeCompare(b, 'es', { sensitivity: 'base' });
    });
  }

  function isEn() {
    var root = document.documentElement;
    return root.getAttribute('data-page-locale') === 'en' || root.lang === 'en';
  }

  function kindLabel(kind) {
    if (isEn()) {
      if (kind === 'coin') return 'Coin';
      if (kind === 'specimen') return 'Specimen';
      if (kind === 'error') return 'Error';
      return 'Banknote';
    }
    if (kind === 'coin') return 'Moneda';
    if (kind === 'specimen') return 'Specimen';
    if (kind === 'error') return 'Error';
    return 'Billete';
  }

  function materialLabel(material) {
    if (isEn()) {
      if (material === 'polímero') return 'Polymer';
      if (material === 'híbrido') return 'Hybrid';
      if (material === 'metal') return 'Metal';
      if (material === 'papel') return 'Paper';
      return material || '';
    }
    if (material === 'polímero') return 'Polímero';
    if (material === 'híbrido') return 'Híbrido';
    if (material === 'metal') return 'Metal';
    if (material === 'papel') return 'Papel';
    return material || '';
  }

  function matches(item) {
    if (item.role !== 'piece') return false;
    if (state.q) {
      var q = state.q.toLowerCase().trim();
      if (!(item.searchText || '').includes(q)) return false;
    }
    if (state.pais && item.country !== state.pais) return false;
    if (state.emisor && item.issuer !== state.emisor) return false;
    if (state.tipo && item.kind !== state.tipo) return false;
    if (state.material && item.material !== state.material) return false;
    if (state.condicion) {
      var cond = (item.condition || '').toLowerCase();
      if (!cond.includes(state.condicion.toLowerCase())) return false;
    }
    if (state.catalogo) {
      var ref = (item.catalogRef || '').toLowerCase();
      if (!ref.includes(state.catalogo.toLowerCase())) return false;
    }
    if (state.denom) {
      var denom = (item.denomination || '').toLowerCase();
      if (!denom.includes(state.denom.toLowerCase())) return false;
    }
    if (state.yearFrom) {
      var from = Number(state.yearFrom);
      if (!item.year || item.year < from) return false;
    }
    if (state.yearTo) {
      var to = Number(state.yearTo);
      if (!item.year || item.year > to) return false;
    }
    return true;
  }

  function sortItems(list) {
    var copy = list.slice();
    if (state.sort === 'country') {
      copy.sort(function (a, b) {
        return (a.title || '').localeCompare(b.title || '', 'es');
      });
    } else if (state.sort === 'year') {
      copy.sort(function (a, b) {
        return (a.year || 0) - (b.year || 0) || a.title.localeCompare(b.title, 'es');
      });
    } else if (state.sort === 'denom') {
      copy.sort(function (a, b) {
        return (a.denomination || '').localeCompare(b.denomination || '', 'es') ||
          a.title.localeCompare(b.title, 'es');
      });
    } else {
      // newest: prefer higher years, then title
      copy.sort(function (a, b) {
        return (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title, 'es');
      });
    }
    return copy;
  }

  function countrySlug(name) {
    var slug = String(name || 'otros').toLowerCase();
    try {
      slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    } catch (_) {}
    return (
      'catalog-country-' +
      slug.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    );
  }

  function groupByCountry(list) {
    var buckets = {};
    var names = [];
    list.forEach(function (item) {
      var name = item.country || (isEn() ? 'Other' : 'Otros');
      if (!buckets[name]) {
        buckets[name] = [];
        names.push(name);
      }
      buckets[name].push(item);
    });
    names.sort(function (a, b) {
      return a.localeCompare(b, 'es', { sensitivity: 'base' });
    });
    return names.map(function (name) {
      return { name: name, items: buckets[name] };
    });
  }

  function imageFor(item) {
    if (!item.image) return '';
    var src = item.image;
    var webp = src.replace(/\.(jpe?g|png)$/i, '.webp');
    return (
      '<picture>' +
      '<source type="image/webp" srcset="' +
      escapeAttr(webp) +
      '" />' +
      '<img src="' +
      escapeAttr(src) +
      '" alt="" width="400" height="300" loading="lazy" decoding="async" />' +
      '</picture>'
    );
  }

  function cardHtml(item) {
    var meta = [
      kindLabel(item.kind),
      item.year || item.dateLabel || '',
      materialLabel(item.material),
    ]
      .filter(Boolean)
      .join(' · ');
    var sub = [item.denomination, item.issuer].filter(Boolean).join(' — ');
    return (
      '<li class="catalog-result">' +
      '<a class="catalog-result-link" href="' +
      escapeAttr(item.path) +
      '">' +
      '<span class="catalog-result-media" aria-hidden="true">' +
      imageFor(item) +
      '</span>' +
      '<span class="catalog-result-body">' +
      '<span class="catalog-result-meta">' +
      escapeHtml(meta) +
      '</span>' +
      '<span class="catalog-result-title">' +
      escapeHtml(item.title) +
      '</span>' +
      (sub
        ? '<span class="catalog-result-sub">' + escapeHtml(sub) + '</span>'
        : '') +
      (item.catalogRef
        ? '<span class="catalog-result-ref">' +
          escapeHtml(item.catalogRef) +
          '</span>'
        : '') +
      '</span></a></li>'
    );
  }

  function render() {
    var filtered = sortItems(state.items.filter(matches));
    if (countEl) {
      countEl.textContent = isEn()
        ? filtered.length === 1
          ? '1 piece'
          : filtered.length + ' pieces'
        : filtered.length === 1
          ? '1 pieza'
          : filtered.length + ' piezas';
    }
    if (emptyEl) emptyEl.hidden = filtered.length > 0;
    if (!resultsEl) return;

    resultsEl.setAttribute('data-view', state.view);
    var groups = groupByCountry(filtered);
    resultsEl.innerHTML = groups
      .map(function (group) {
        var headingId = countrySlug(group.name);
        var countLabel = isEn()
          ? group.items.length === 1
            ? '1 record'
            : group.items.length + ' records'
          : group.items.length === 1
            ? '1 ficha'
            : group.items.length + ' fichas';
        return (
          '<section class="catalog-country-group" aria-labelledby="' +
          escapeAttr(headingId) +
          '" data-country="' +
          escapeAttr(group.name) +
          '">' +
          '<span class="catalog-country-kicker">' +
          escapeHtml(countLabel) +
          '</span>' +
          '<h3 class="catalog-country-title" id="' +
          escapeAttr(headingId) +
          '">' +
          escapeHtml(group.name) +
          '</h3>' +
          '<ul class="catalog-result-list">' +
          group.items.map(cardHtml).join('') +
          '</ul></section>'
        );
      })
      .join('');

    viewButtons.forEach(function (btn) {
      var active = btn.getAttribute('data-view') === state.view;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function readForm() {
    if (!form) return;
    var fd = new FormData(form);
    state.q = String(fd.get('q') || '').trim();
    state.pais = String(fd.get('pais') || '');
    state.emisor = String(fd.get('emisor') || '');
    state.tipo = String(fd.get('tipo') || '');
    state.material = String(fd.get('material') || '');
    state.condicion = String(fd.get('condicion') || '').trim();
    state.catalogo = String(fd.get('catalogo') || '').trim();
    state.yearFrom = String(fd.get('desde') || '').trim();
    state.yearTo = String(fd.get('hasta') || '').trim();
    state.denom = String(fd.get('denom') || '').trim();
    state.sort = String(fd.get('orden') || 'newest');
  }

  function applyFormToInputs() {
    if (!form) return;
    var map = {
      q: state.q,
      pais: state.pais,
      emisor: state.emisor,
      tipo: state.tipo,
      material: state.material,
      condicion: state.condicion,
      catalogo: state.catalogo,
      desde: state.yearFrom,
      hasta: state.yearTo,
      denom: state.denom,
      orden: state.sort,
    };
    Object.keys(map).forEach(function (name) {
      var el = form.elements.namedItem(name);
      if (el && 'value' in el) el.value = map[name];
    });
  }

  function onChange() {
    readForm();
    writeUrl();
    render();
  }

  syncFromUrl();

  fetch('/data/catalog-index.json')
    .then(function (res) {
      if (!res.ok) throw new Error('index');
      return res.json();
    })
    .then(function (data) {
      state.items = (data.items || []).filter(function (item) {
        return item.role === 'piece';
      });

      fillSelect(
        'filter-pais',
        uniqueSorted(state.items.map(function (i) { return i.country; })),
        state.pais,
      );
      fillSelect(
        'filter-emisor',
        uniqueSorted(state.items.map(function (i) { return i.issuer; })),
        state.emisor,
      );
      fillSelect(
        'filter-material',
        uniqueSorted(state.items.map(function (i) { return i.material; })).map(materialLabel).filter(Boolean),
        materialLabel(state.material) || state.material,
      );

      // material select stores canonical keys
      var matEl = document.getElementById('filter-material');
      if (matEl) {
        var mats = uniqueSorted(state.items.map(function (i) { return i.material; }));
        matEl.innerHTML =
          '<option value="">' +
          (isEn() ? 'All' : 'Todos') +
          '</option>' +
          mats
            .map(function (m) {
              return (
                '<option value="' +
                escapeAttr(m) +
                '"' +
                (m === state.material ? ' selected' : '') +
                '>' +
                escapeHtml(materialLabel(m)) +
                '</option>'
              );
            })
            .join('');
      }

      applyFormToInputs();
      var hero = document.getElementById('catalog-search-hero');
      if (hero && state.q) hero.value = state.q;
      render();
      root.removeAttribute('data-loading');
      if (window.location.search && document.getElementById('explorar')) {
        document.getElementById('explorar').scrollIntoView({ block: 'start' });
      }
    })
    .catch(function () {
      if (countEl) countEl.textContent = isEn() ? 'Could not load the index' : 'No se pudo cargar el índice';
      root.removeAttribute('data-loading');
    });

  if (form) {
    form.addEventListener('input', onChange);
    form.addEventListener('change', onChange);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      onChange();
    });
  }

  viewButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.view = btn.getAttribute('data-view') === 'list' ? 'list' : 'grid';
      writeUrl();
      render();
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      state.q = '';
      state.pais = '';
      state.emisor = '';
      state.tipo = '';
      state.material = '';
      state.condicion = '';
      state.catalogo = '';
      state.yearFrom = '';
      state.yearTo = '';
      state.denom = '';
      state.sort = 'newest';
      applyFormToInputs();
      writeUrl();
      render();
      if (searchInput) searchInput.focus();
    });
  }

  document.querySelectorAll('[data-filter-pais]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var pais = link.getAttribute('data-filter-pais');
      if (!pais) return;
      event.preventDefault();
      state.pais = pais;
      applyFormToInputs();
      writeUrl();
      render();
      var target = document.getElementById('explorar');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
