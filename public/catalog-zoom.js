/**
 * Shared catalog image zoom — vanilla JS replacement for per-page DCLogic zoom.
 * Binds to [data-zoom-trigger] / [data-zoom-dialog] markup in frozen templates
 * and to [data-catalog-media] Astro surfaces.
 */
(function () {
  function qs(root, sel) {
    return root.querySelector(sel);
  }

  /**
   * Fit the zoomed image to the viewport at native resolution.
   * Catalog templates historically used max-height:74vh + sizes=560px, which
   * made tall proofs smaller than the in-page image and loaded the 640w WebP.
   */
  function prepareFullSizeImage(dialog) {
    if (!dialog) return;
    dialog.querySelectorAll('source[sizes], img[sizes]').forEach(function (el) {
      el.setAttribute('sizes', 'min(96vw, 100vw)');
    });
    const img = qs(dialog, '[data-zoom-image]') || qs(dialog, 'img');
    if (!img) return;
    img.style.maxWidth = 'calc(100vw - 16px)';
    img.style.maxHeight = 'calc(100vh - 16px)';
    img.style.width = 'auto';
    img.style.height = 'auto';
    const wrap = img.closest('div');
    if (wrap && wrap !== dialog) {
      wrap.style.maxWidth = 'calc(100vw - 16px)';
      wrap.style.maxHeight = 'calc(100vh - 16px)';
      wrap.style.overflow = 'hidden';
    }
    // Nudge the browser to re-pick srcset after sizes change (full-res candidate).
    const picture = img.closest('picture');
    if (picture) {
      const source = picture.querySelector('source[srcset]');
      if (source) {
        const srcset = source.getAttribute('srcset');
        source.setAttribute('srcset', srcset);
      }
    } else if (img.getAttribute('srcset')) {
      img.setAttribute('srcset', img.getAttribute('srcset'));
    }
  }

  function openDialog(dialog, trigger) {
    if (!dialog) return;
    prepareFullSizeImage(dialog);
    dialog.hidden = false;
    dialog.style.display = 'flex';
    dialog.dataset.open = 'true';
    const closeBtn = qs(dialog, '[data-zoom-close]');
    requestAnimationFrame(function () {
      if (closeBtn) closeBtn.focus();
    });
    dialog._zoomTrigger = trigger;
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    dialog.hidden = true;
    dialog.style.display = 'none';
    dialog.dataset.open = 'false';
    const img = qs(dialog, '[data-zoom-image], img');
    if (img) {
      img.style.transform = '';
      img.style.cursor = 'zoom-in';
    }
    const trigger = dialog._zoomTrigger;
    if (trigger && typeof trigger.focus === 'function') trigger.focus();
  }

  function bindDialogInteractions(dialog) {
    if (!dialog || dialog.dataset.zoomBound === 'true') return;
    dialog.dataset.zoomBound = 'true';

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startOffsetX = 0;
    let startOffsetY = 0;

    const img = qs(dialog, '[data-zoom-image]') || qs(dialog, 'img');
    const percentEl = qs(dialog, '[data-zoom-percent]');
    const outBtn = qs(dialog, '[data-zoom-out]');
    const inBtn = qs(dialog, '[data-zoom-in]');

    function apply() {
      if (!img) return;
      img.style.transform = 'translate(' + offsetX + 'px,' + offsetY + 'px) scale(' + scale + ')';
      img.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
      if (percentEl) percentEl.textContent = Math.round(scale * 100) + '%';
      if (outBtn) outBtn.disabled = scale <= 1;
      if (inBtn) inBtn.disabled = scale >= 4;
    }

    function reset() {
      scale = 1;
      offsetX = 0;
      offsetY = 0;
      apply();
    }

    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) {
        closeDialog(dialog);
        reset();
      }
    });

    const closeBtn = qs(dialog, '[data-zoom-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closeDialog(dialog);
        reset();
      });
    }
    if (outBtn) {
      outBtn.addEventListener('click', function () {
        scale = Math.max(1, +(scale - 0.25).toFixed(2));
        if (scale === 1) {
          offsetX = 0;
          offsetY = 0;
        }
        apply();
      });
    }
    if (inBtn) {
      inBtn.addEventListener('click', function () {
        scale = Math.min(4, +(scale + 0.25).toFixed(2));
        apply();
      });
    }

    if (img) {
      img.addEventListener(
        'wheel',
        function (event) {
          event.preventDefault();
          const delta = event.deltaY > 0 ? -0.15 : 0.15;
          scale = Math.min(4, Math.max(1, +(scale + delta).toFixed(2)));
          if (scale === 1) {
            offsetX = 0;
            offsetY = 0;
          }
          apply();
        },
        { passive: false },
      );

      img.addEventListener('pointerdown', function (event) {
        if (scale <= 1) return;
        dragging = true;
        startX = event.clientX;
        startY = event.clientY;
        startOffsetX = offsetX;
        startOffsetY = offsetY;
        img.setPointerCapture(event.pointerId);
        img.style.cursor = 'grabbing';
      });
      img.addEventListener('pointermove', function (event) {
        if (!dragging) return;
        offsetX = startOffsetX + (event.clientX - startX);
        offsetY = startOffsetY + (event.clientY - startY);
        apply();
      });
      function endDrag(event) {
        if (!dragging) return;
        dragging = false;
        try {
          img.releasePointerCapture(event.pointerId);
        } catch (e) {}
        apply();
      }
      img.addEventListener('pointerup', endDrag);
      img.addEventListener('pointercancel', endDrag);
    }

    dialog._zoomReset = reset;
    apply();
  }

  document.addEventListener('click', function (event) {
    const trigger = event.target.closest && event.target.closest('[data-zoom-trigger]');
    if (!trigger) return;
    event.preventDefault();
    const id = trigger.getAttribute('data-zoom-trigger');
    const dialog = document.querySelector('[data-zoom-dialog="' + id + '"]');
    bindDialogInteractions(dialog);
    if (dialog && dialog._zoomReset) dialog._zoomReset();
    openDialog(dialog, trigger);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('[data-zoom-dialog][data-open="true"]').forEach(function (dialog) {
      closeDialog(dialog);
      if (dialog._zoomReset) dialog._zoomReset();
    });
  });
})();
