/* test yardımcısı: Dipteki Söz mini oyunlarını "iyi oyuncu" gibi oynar (yalnız testlerde yüklenir) */
window.__storyBot = function () {
  var last = 0, ev = function (el, t, x, y) { el.dispatchEvent(new PointerEvent(t, { bubbles: true, clientX: x || 0, clientY: y || 0, pointerId: 1 })); };
  var sweep = 0;
  function step(now) {
    if (!HK_STORY.isOpen()) return;
    requestAnimationFrame(step);
    var cfg = HK_STORY._cfg(), M = document.querySelector('#hkStory [data-k="mini"]');
    if (!cfg || !M || !HK_STORY._mini()) return;
    var q = function (k) { return M.querySelector('[data-k2="' + k + '"]'); }, pct = function (s) { return parseFloat(String(s).replace('calc(', '')); };
    if (cfg.type === 'choice') { var o = M.querySelector('.opt'); if (o && now - last > 300) { last = now; o.click(); } }
    else if (cfg.type === 'bar') {
      var c = pct(q('c').style.left) + 0.4, zl = pct(q('z').style.left), zw = pct(q('z').style.width);
      if (now - last > 750 && c > zl + zw * 0.25 && c < zl + zw * 0.75) { last = now; q('b').click(); }
    }
    else if (cfg.type === 'balance') {
      var x = (pct(q('n').style.left) + 0.7) / 50 - 1, btn = M.querySelectorAll('.btns button');
      if (now - last > 220 && Math.abs(x) > 0.1) { last = now; btn[x > 0 ? 0 : 1].click(); }
    }
    else if (cfg.type === 'order') {
      var slots = M.querySelector('.slots').children; if (slots[0].className === 'f' && !M.querySelector('.it:disabled')) return;    /* ezber anı */
      if (now - last < 250) return; last = now;
      var done = M.querySelectorAll('.it:disabled').length, want = cfg.items.filter(function (i) { return i.id === cfg.answer[done]; })[0];
      if (!want) return; var tt = document.documentElement.lang === 'en' ? want.t.en : want.t.tr;
      [].forEach.call(M.querySelectorAll('.it:not(:disabled)'), function (b) { if (b.textContent.trim() === (want.t.tr) || b.textContent.trim() === want.t.en) { b.click(); } });
    }
    else if (cfg.type === 'scrub') {
      var cv = q('c'), r = cv.getBoundingClientRect(); sweep++;
      var row = (sweep * 3) % 22, y = r.top + (row / 20) * r.height;
      ev(cv, 'pointerdown', r.left + 2, y); for (var k = 0; k <= 24; k++) ev(cv, 'pointermove', r.left + r.width * k / 24, y); ev(cv, 'pointerup');
    }
    else if (cfg.type === 'talk') {
      if (now - last < 300) return; last = now;
      var txt = M.querySelector('.note').textContent, qq = cfg.qs.filter(function (z) { return z.q.tr === txt || z.q.en === txt; })[0]; if (!qq) return;
      var bi = 0; qq.o.forEach(function (op, i) { if ((op.v || 0) > (qq.o[bi].v || 0)) bi = i; }); M.querySelectorAll('.opt')[bi].click();
    }
    else if (cfg.type === 'lantern') {
      var gust = /💨/.test(q('w').textContent), b = q('b'), on = b.style.background !== '';
      if (gust && !on) ev(b, 'pointerdown'); if (!gust && on) ev(b, 'pointerup');
    }
    else if (cfg.type === 'rhythm') {
      var g = q('c').getContext('2d'), d = g.getImageData(38, 30, 8, 1).data, hit = false;
      for (var i = 0; i < d.length; i += 4) if (d[i] === 0xe4 && d[i + 1] === 0xb9) hit = true;
      if (hit && now - last > 200) { last = now; ev(M.querySelector('[data-k2="b"]'), 'pointerdown'); }
    }
  }
  requestAnimationFrame(step);
};
