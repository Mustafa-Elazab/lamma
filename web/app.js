/*
 * Lamma link landing page. Plain JS, no dependencies, no secrets.
 * Visible strings live in i18n.js (EN/AR); this file only picks the keys.
 *
 * STORE LINKS: Lamma is not published yet, so both are empty and their
 * buttons stay hidden. Paste the real listing URLs here when available:
 *   ANDROID_STORE_URL = 'https://play.google.com/store/apps/details?id=com.getlamma.app'
 *   IOS_STORE_URL     = 'https://apps.apple.com/app/idXXXXXXXXXX'
 */
(function () {
  'use strict';

  var ANDROID_STORE_URL = '';
  var IOS_STORE_URL = '';
  var CUSTOM_SCHEME = 'lamma://';

  var EVENT_ID = /^[A-Za-z0-9_-]{1,128}$/;
  var ROOM_CODE = /^[A-Z0-9]{4,12}$/;

  function byId(id) {
    return document.getElementById(id);
  }

  function safeDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch (e) {
      return null;
    }
  }

  // Point an element at an i18n.js key; LammaI18n.apply() fills in the text
  // for the current language (and again whenever the user switches).
  function setKey(el, key) {
    if (el) el.setAttribute('data-i18n', key);
  }

  function translate() {
    if (window.LammaI18n) window.LammaI18n.apply();
  }

  function showStore(id, url) {
    var el = byId(id);
    if (!el) return;
    if (/^https:\/\//.test(url)) {
      el.href = url;
      el.rel = 'noopener';
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  }

  showStore('android-store', ANDROID_STORE_URL);
  showStore('ios-store', IOS_STORE_URL);

  var openBtn = byId('open-app');
  if (!openBtn) return; // index.html

  // /e/{eventId} or /g/{roomCode}
  var parts = window.location.pathname.split('/').filter(Boolean);
  var kind = parts[0];
  var raw = parts.length === 2 ? safeDecode(parts[1]) : null;
  var value = null;

  if (kind === 'e' && raw && EVENT_ID.test(raw)) {
    value = raw;
  } else if (kind === 'g' && raw && ROOM_CODE.test(raw.toUpperCase())) {
    value = raw.toUpperCase();
  }

  if (kind === 'g') {
    setKey(byId('title'), 'game.title');
    setKey(byId('subtitle'), 'game.subtitle');
    setKey(byId('id-label'), 'game.idLabel');
    setKey(document.querySelector('title'), 'game.docTitle');
  }

  if (!value) {
    openBtn.setAttribute('aria-disabled', 'true');
    openBtn.removeAttribute('href');
    byId('invalid').hidden = false;
    byId('id-value').textContent = '—';
    translate();
    return;
  }

  // textContent only: the URL value is never injected as HTML.
  byId('id-value').textContent = value;
  // Custom scheme is only the manual fallback; the shared link stays HTTPS.
  openBtn.href = CUSTOM_SCHEME + kind + '/' + encodeURIComponent(value);
  translate();
})();
