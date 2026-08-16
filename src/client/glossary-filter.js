/**
 * Progressive enhancement for /glosario/: filter already-rendered terms.
 * Without JS, every term stays visible in the initial HTML.
 */
(function () {
  var root = document.getElementById('glossary-index');
  if (!root) return;

  var search = document.getElementById('glossary-search');
  var clearBtn = document.getElementById('glossary-clear');
  var status = document.getElementById('glossary-search-status');
  var empty = document.getElementById('glossary-empty');
  var emptyQuery = document.getElementById('glossary-empty-query');
  var cards = Array.prototype.slice.call(root.querySelectorAll('[data-glossary-term]'));
  var chips = Array.prototype.slice.call(root.querySelectorAll('[data-glossary-category]'));
  var activeCategory = '';

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) el.setAttribute('hidden', '');
    else el.removeAttribute('hidden');
  }

  function applyFilter() {
    var query = search ? search.value : '';
    var needle = normalize(query.trim());
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-glossary-search') || '';
      var category = card.getAttribute('data-glossary-cat') || '';
      var matchesQuery = !needle || haystack.indexOf(needle) !== -1;
      var matchesCategory = !activeCategory || category === activeCategory;
      var show = matchesQuery && matchesCategory;
      card.hidden = !show;
      if (show) visible += 1;
    });

    setHidden(clearBtn, needle.length === 0);
    setHidden(empty, visible !== 0);
    if (emptyQuery) emptyQuery.textContent = query.trim();

    if (!status) return;
    if (needle || activeCategory) {
      if (visible === 1) {
        status.textContent = '1 resultado' + (needle ? ' para «' + query.trim() + '».' : '.');
      } else {
        status.textContent =
          visible + ' resultados' + (needle ? ' para «' + query.trim() + '».' : '.');
      }
    } else {
      status.textContent = 'Mostrando los ' + cards.length + ' términos del glosario.';
    }
  }

  if (search) {
    search.addEventListener('input', applyFilter);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (search) {
        search.value = '';
        search.focus();
      }
      applyFilter();
    });
  }

  var resetBtn = document.getElementById('glossary-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (search) search.value = '';
      activeCategory = '';
      chips.forEach(function (chip) {
        var isAll = (chip.getAttribute('data-glossary-category') || '') === '';
        chip.setAttribute('aria-pressed', isAll ? 'true' : 'false');
      });
      applyFilter();
      if (search) search.focus();
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeCategory = chip.getAttribute('data-glossary-category') || '';
      chips.forEach(function (other) {
        other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
      });
      applyFilter();
    });
  });
})();
