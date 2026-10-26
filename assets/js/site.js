// cv.daniel.tools - small progressive enhancements. The page works without this file.
(function () {
  'use strict';

  // Nav background once the page scrolls.
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mark the section in view in the desktop nav. Sections without a link (hero, news) clear the mark.
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  if ('IntersectionObserver' in window && links.length) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        if (byId[e.target.id]) byId[e.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (el) { io.observe(el); });
  }

  // Mobile menu: close after picking a section, on Escape, and when focus leaves it.
  var menu = document.querySelector('.nav-menu');
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) menu.removeAttribute('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open) {
        menu.removeAttribute('open');
        menu.querySelector('summary').focus();
      }
    });
    document.addEventListener('focusin', function (e) {
      if (menu.open && !menu.contains(e.target)) menu.removeAttribute('open');
    });
    document.addEventListener('click', function (e) {
      if (menu.open && !menu.contains(e.target)) menu.removeAttribute('open');
    });
  }

  // Tools: show the screenshot of the selected tool on the laptop.
  var tools = Array.prototype.slice.call(document.querySelectorAll('.tool'));
  var shots = Array.prototype.slice.call(document.querySelectorAll('[data-tool-shot]'));
  var label = document.querySelector('[data-preview-name]');
  function selectTool(name) {
    tools.forEach(function (t) {
      var on = t.getAttribute('data-tool') === name;
      t.classList.toggle('is-active', on);
      t.querySelector('.tool-pick').setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on && label) label.textContent = t.querySelector('.tool-pick').textContent;
    });
    shots.forEach(function (img) { img.hidden = img.getAttribute('data-tool-shot') !== name; });
  }
  var device = document.querySelector('.device');
  document.querySelectorAll('.tool-pick').forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectTool(btn.getAttribute('data-tool-target'));
      // Stacked layout: the preview is above the list, bring it into view.
      if (device && getComputedStyle(device).position !== 'sticky') {
        var r = device.getBoundingClientRect();
        if (r.top < 0 || r.top > window.innerHeight) device.scrollIntoView({ block: 'start' });
      }
    });
  });

  // Screenshots are lazy; load both once the tools section gets close, so switching is instant.
  if (device && 'IntersectionObserver' in window) {
    var shotIo = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      shots.forEach(function (img) { img.loading = 'eager'; });
      shotIo.disconnect();
    }, { rootMargin: '800px 0px' });
    shotIo.observe(device);
  }

  // Durations ("2 yrs 5 mos"), counted like LinkedIn: both end months included.
  function months(ym) {
    var p = ym.split('-');
    return parseInt(p[0], 10) * 12 + parseInt(p[1], 10) - 1;
  }
  var now = new Date();
  var nowM = now.getFullYear() * 12 + now.getMonth();
  document.querySelectorAll('[data-start]').forEach(function (el) {
    var end = el.getAttribute('data-end');
    var n = (end ? months(end) : nowM) - months(el.getAttribute('data-start')) + 1;
    if (n < 1) return;
    var y = Math.floor(n / 12), m = n % 12, out = [];
    if (y) out.push(y + (y === 1 ? ' yr' : ' yrs'));
    if (m) out.push(m + (m === 1 ? ' mo' : ' mos'));
    el.textContent = out.join(' ');
  });

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(now.getFullYear());
})();
