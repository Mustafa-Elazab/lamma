/*
 * Lamma site: light / dark theme toggle. Plain JS, no build.
 *
 * The inline script in each page's <head> already applied the theme before
 * first paint: ?theme=dark|light (testing override, not saved), then
 * localStorage "lamma-theme", otherwise no data-theme at all so the CSS
 * follows prefers-color-scheme. This file wires the sun/moon button.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'lamma-theme';
  var COLORS = { light: '#fff7f4', dark: '#15131b' };
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function explicitTheme() {
    var value = root.getAttribute('data-theme');
    return value === 'dark' || value === 'light' ? value : null;
  }

  function effectiveTheme() {
    return explicitTheme() || (media && media.matches ? 'dark' : 'light');
  }

  function syncChrome() {
    var theme = effectiveTheme();
    var explicit = explicitTheme();
    // With an explicit choice, both media-scoped theme-color tags follow it.
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      var own = /dark/.test(metas[i].getAttribute('media') || '') ? 'dark' : 'light';
      metas[i].setAttribute('content', COLORS[explicit || own]);
    }
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var b = 0; b < buttons.length; b++) {
      buttons[b].setAttribute('aria-pressed', String(theme === 'dark'));
    }
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { window.localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* private mode */ }
    try {
      var url = new URL(window.location.href);
      if (url.searchParams.has('theme')) {
        url.searchParams.set('theme', theme);
        window.history.replaceState(null, '', url.toString());
      }
    } catch (e2) { /* old browser */ }
    syncChrome();
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    var button = target && target.closest ? target.closest('[data-theme-toggle]') : null;
    if (!button) return;
    event.preventDefault();
    setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark');
  });

  if (media) {
    var onChange = function () { if (!explicitTheme()) syncChrome(); };
    if (media.addEventListener) media.addEventListener('change', onChange);
    else if (media.addListener) media.addListener(onChange);
  }

  syncChrome();
})();
