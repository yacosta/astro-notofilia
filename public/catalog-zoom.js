/**
 * Shared catalog image zoom — vanilla JS replacement for per-page DCLogic zoom.
 * Binds to [data-zoom-trigger] / [data-zoom-dialog] markup in frozen templates
 * and to [data-catalog-media] Astro surfaces.
 */
(function () {
  var htmlOverflow = '';
  var bodyOverflow = '';

  function qs(root, sel) {
    return root.querySelector(sel);
  }

  function lockScroll() {
    htmlOverflow = document.documentElement.style.overflow;
    bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    document.documentElement.style.overflow = htmlOverflow;
    document.body.style.overflow = bodyOverflow;
  }

  /**
   * Fit the photo in the viewport (object-fit: contain) at the largest
   * srcset candidate. The <img> box follows the bitmap — not 100vw×100vh —
   * so letterbox clicks reach the dialog and Close stays tappable after zoom.
   */
  function prepareFullSizeImage(dialog) {
    if (!dialog) return;
    dialog.style.touchAction = 'none';
    dialog.style.overscrollBehavior = 'contain';
    dialog.querySelectorAll('source[sizes], img[sizes]').forEach(function (el) {
      el.setAttribute('sizes', '100vw');
    });
    const img = qs(dialog, '[data-zoom-image]') || qs(dialog, 'img');
    if (!img) return;
    img.style.maxWidth = '100vw';
    img.style.maxHeight = '100vh';
    img.style.width = 'auto';
    img.style.height = 'auto';
    img.style.objectFit = 'contain';
    img.style.pointerEvents = 'auto';
    img.style.position = 'relative';
    img.style.zIndex = '0';
    const wrap = img.closest('div');
    if (wrap && wrap !== dialog) {
      wrap.style.maxWidth = '100vw';
      wrap.style.maxHeight = '100vh';
      wrap.style.width = '100vw';
      wrap.style.height = '100vh';
      wrap.style.overflow = 'hidden';
      wrap.style.display = 'flex';
      wrap.style.alignItems = 'center';
      wrap.style.justifyContent = 'center';
      wrap.style.isolation = 'isolate';
      wrap.style.zIndex = '0';
      wrap.style.pointerEvents = 'none';
      wrap.style.touchAction = 'none';
    }
    const closeBtn = qs(dialog, '[data-zoom-close]');
    if (closeBtn) {
      closeBtn.style.zIndex = '4';
      closeBtn.style.pointerEvents = 'auto';
    }
    const inBtn = qs(dialog, '[data-zoom-in]');
    if (inBtn && inBtn.parentElement && inBtn.parentElement !== dialog) {
      inBtn.parentElement.style.zIndex = '4';
      inBtn.parentElement.style.pointerEvents = 'auto';
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
    lockScroll();
    const closeBtn = qs(dialog, '[data-zoom-close]');
    requestAnimationFrame(function () {
      if (closeBtn) closeBtn.focus();
    });
    dialog._zoomTrigger = trigger;
  }

  function closeDialog(dialog) {
    if (!dialog || dialog.dataset.open !== 'true') return;
    dialog.hidden = true;
    dialog.style.display = 'none';
    dialog.dataset.open = 'false';
    unlockScroll();
    const img = qs(dialog, '[data-zoom-image], img');
    if (img) {
      img.style.transform = '';
      img.style.cursor = 'zoom-out';
    }
    const trigger = dialog._zoomTrigger;
    if (trigger && typeof trigger.focus === 'function') trigger.focus();
  }

  function closeOpenDialogs() {
    document.querySelectorAll('[data-zoom-dialog][data-open="true"]').forEach(function (dialog) {
      closeDialog(dialog);
      if (dialog._zoomReset) dialog._zoomReset();
    });
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
    let dragDistance = 0;

    const img = qs(dialog, '[data-zoom-image]') || qs(dialog, 'img');
    const percentEl = qs(dialog, '[data-zoom-percent]');
    const outBtn = qs(dialog, '[data-zoom-out]');
    const inBtn = qs(dialog, '[data-zoom-in]');

    function apply() {
      if (!img) return;
      img.style.transform = 'translate(' + offsetX + 'px,' + offsetY + 'px) scale(' + scale + ')';
      img.style.cursor = scale > 1 ? 'grab' : 'zoom-out';
      if (percentEl) percentEl.textContent = Math.round(scale * 100) + '%';
      if (outBtn) outBtn.disabled = scale <= 1;
      if (inBtn) inBtn.disabled = scale >= 4;
    }

    function reset() {
      scale = 1;
      offsetX = 0;
      offsetY = 0;
      dragDistance = 0;
      apply();
    }

    function dismiss() {
      closeDialog(dialog);
      reset();
    }

    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dismiss();
    });

    const closeBtn = qs(dialog, '[data-zoom-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        dismiss();
      });
    }
    if (outBtn) {
      outBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        scale = Math.max(1, +(scale - 0.25).toFixed(2));
        if (scale === 1) {
          offsetX = 0;
          offsetY = 0;
        }
        apply();
      });
    }
    if (inBtn) {
      inBtn.addEventListener('click', function (event) {
        event.stopPropagation();
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

      img.addEventListener('click', function (event) {
        event.stopPropagation();
        if (dragDistance < 8) dismiss();
      });

      img.addEventListener('pointerdown', function (event) {
        dragDistance = 0;
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
        var dx = event.clientX - startX;
        var dy = event.clientY - startY;
        dragDistance = Math.max(dragDistance, Math.hypot(dx, dy));
        offsetX = startOffsetX + dx;
        offsetY = startOffsetY + dy;
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
    closeOpenDialogs();
  });
})();
