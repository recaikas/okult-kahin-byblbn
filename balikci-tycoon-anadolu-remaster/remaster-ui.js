(function () {
  'use strict';
  document.body.classList.add('anadolu-remaster');
  var labels = {
    area: 'BÖLGELER',
    level: 'GELİŞTİR',
    build: 'YAPILAR',
    proj: 'YATIRIM',
    serv: 'HİZMETLER'
  };
  function applyNavLabels() {
    document.querySelectorAll('.dtab').forEach(function (button) {
      var span = button.querySelector('span');
      if (span && labels[button.dataset.t]) span.textContent = labels[button.dataset.t];
      button.setAttribute('aria-label', labels[button.dataset.t] || button.textContent.trim());
    });
  }
  applyNavLabels();
  document.querySelectorAll('#langSeg button,#langSeg2 button').forEach(function (button) {
    button.addEventListener('click', function () { setTimeout(applyNavLabels, 0); });
  });
  var title = document.querySelector('#startScreen h1');
  if (title) title.setAttribute('aria-label', 'Balıkçı Tycoon Anadolu Limanı');
})();
