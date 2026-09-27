(function () {
  'use strict';
  document.body.classList.add('anadolu-remaster');
  var labels = {
    tr: { area: 'BÖLGELER', level: 'GELİŞTİR', build: 'YAPILAR', proj: 'YATIRIM', serv: 'HİZMETLER' },
    en: { area: 'AREAS', level: 'UPGRADES', build: 'BUILD', proj: 'PROJECTS', serv: 'SERVICES' }
  };
  function applyNavLabels() {
    var active = document.querySelector('#langSeg button.on,#langSeg2 button.on');
    var lang = active && active.dataset.l === 'en' ? 'en' : 'tr';
    document.querySelectorAll('.dtab').forEach(function (button) {
      var span = button.querySelector('span');
      var label = labels[lang][button.dataset.t];
      if (span && label) span.textContent = label;
      button.setAttribute('aria-label', label || button.textContent.trim());
      button.title = label || '';
    });
  }
  applyNavLabels();
  document.querySelectorAll('#langSeg button,#langSeg2 button').forEach(function (button) {
    button.addEventListener('click', function () { setTimeout(applyNavLabels, 0); });
  });
  var title = document.querySelector('#startScreen h1');
  if (title) title.setAttribute('aria-label', 'Balıkçı Tycoon Anadolu Limanı');
})();
