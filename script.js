(function () {
  'use strict';
  var cur = null, busy = false, started = false;
  var bgm = document.getElementById('bgm');
  var cover = document.getElementById('cover');

  /* ---------- scale every scene to the screen ---------- */
  function fit() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var scenes = document.querySelectorAll('.scene');
    for (var i = 0; i < scenes.length; i++) {
      var sc = scenes[i], w = sc.offsetWidth, h = sc.offsetHeight;
      if (!w || !h) continue;
      var s = Math.min(vw * 0.97 / w, vh * 0.93 / h, 1.9);
      sc.style.setProperty('--s', s.toFixed(4));
    }
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', function () { setTimeout(fit, 120); });

  /* ---------- background song: one audio element, never restarted ---------- */
  function tryPlay() {
    if (started || !bgm) return;
    var p;
    try { p = bgm.play(); } catch (e) { return; }
    if (p && p.then) { p.then(function () { started = true; unbind(); }).catch(function () {}); }
    else { started = true; unbind(); }
  }
  var evs = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'];
  function unbind() { evs.forEach(function (e) { document.removeEventListener(e, tryPlay, true); }); }
  evs.forEach(function (e) { document.addEventListener(e, tryPlay, true); });
  if (bgm) {
    bgm.volume = 1;
    bgm.addEventListener('canplay', tryPlay);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { bgm.pause(); }
      else if (started) { var p = bgm.play(); if (p && p.catch) p.catch(function () {}); }
    });
  }
  tryPlay();

  /* ---------- screens ---------- */
  function swap(id, instant) {
    var next = document.getElementById(id);
    if (!next || next === cur) return;
    var prev = cur; cur = next;
    if (prev) {
      prev.classList.remove('active');
      if (instant) prev.style.display = 'none';
      else setTimeout(function () { if (prev !== cur) prev.style.display = 'none'; }, 460);
    }
    setTimeout(function () {
      next.style.display = 'block';
      fit();
      void next.offsetWidth;
      next.classList.add('active');
    }, prev && !instant ? 460 : 0);
  }

  function flowers(id) {
    cover.className = 'in';
    setTimeout(function () {
      swap(id, true);
      setTimeout(function () { cover.className = 'out'; }, 650);
      setTimeout(function () { cover.className = ''; }, 2200);
    }, 900);
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-go]') : null;
    if (!t || busy) return;
    busy = true;
    var id = t.getAttribute('data-go');
    if (t.hasAttribute('data-flowers')) { flowers(id); setTimeout(function () { busy = false; }, 2300); }
    else { swap(id); setTimeout(function () { busy = false; }, 800); }
  });

  document.addEventListener('contextmenu', function (e) { if (e.target.tagName === 'IMG') e.preventDefault(); });

  fit();
  swap('s1');
})();
