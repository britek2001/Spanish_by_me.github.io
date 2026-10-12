/* Clases de Español : programme, calendrier et envoi du formulaire par e-mail */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     RÉGLAGES À MODIFIER
     ------------------------------------------------------------------ */
  // Après la première inscription test et l'activation chez FormSubmit,
  // vous pouvez remplacer l'adresse par l'alias aléatoire reçu par e-mail
  // (ex. https://formsubmit.co/ajax/a1b2c3d4...) pour ne plus exposer votre e-mail.
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/britelyassine47@gmail.com';
  var FALLBACK_EMAIL = 'britelyassine47@gmail.com';

  var DAY = 86400000;
  var START = Date.UTC(2026, 9, 26);            // lundi 26 octobre 2026
  var HOLIDAYS = [Date.UTC(2026, 10, 11)];      // mercredi 11 novembre 2026 (férié)
  var NWEEKS = 8;
  var END = START + (NWEEKS - 1) * 7 * DAY + 3 * DAY; // dernier jeudi

  var WD = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
  var FULL_WD = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var MO = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var FULL_MO = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  /* Contenu des séances (semaines 2 à 8) */
  var JOINT = ['Bienvenidos', 'Hablamos juntos'];
  var BEG = [
    ['Hola, me llamo…', 'Números y nacionalidades'],
    ['La familia', 'En clase y en casa'],
    ['Mi día a día', 'Preguntas y respuestas'],
    ['La hora y los días', 'En el restaurante'],
    ['De compras y la ropa', 'La ciudad y las direcciones'],
    ['Mi rutina y mis planes', 'Fechas e invitaciones'],
    ['De viaje', 'Evaluación final']
  ];
  var INT = [
    ['Punto de partida', 'Pasado reciente y lejano'],
    ['Un fin de semana de película', 'Cuando era pequeño…'],
    ['Contar una historia', 'Biografías'],
    ['El futuro', 'Consejos y cortesía'],
    ['Instrucciones y recetas', 'Lo, la, le, se lo'],
    ['Deseos y recomendaciones', 'Emociones y dudas'],
    ['Debate y diferencias', 'Evaluación final']
  ];
  var CHECKS = { 4: 'Mini-contrôle 1', 7: 'Mini-contrôle 2', 8: 'Évaluation finale' };

  /* ------------------------------------------------------------------
     Calcul des dates (source unique pour le tableau et le calendrier)
     ------------------------------------------------------------------ */
  function d(ms) { return new Date(ms); }
  function shortDate(ms) { var x = d(ms); return WD[x.getUTCDay()] + ' ' + x.getUTCDate() + ' ' + MO[x.getUTCMonth()]; }
  function isoDate(ms) { return d(ms).toISOString().slice(0, 10); }
  function isHoliday(ms) { return HOLIDAYS.indexOf(ms) !== -1; }

  var weeks = [];
  var events = {};   // ms -> { kind, moved }
  for (var n = 1; n <= NWEEKS; n++) {
    var mon = START + (n - 1) * 7 * DAY;
    var w = { n: n, joint: n === 1, moved: false };
    if (n === 1) {
      w.beg = w.int = [mon, mon + 2 * DAY];
      events[w.beg[0]] = { kind: 'com' };
      events[w.beg[1]] = { kind: 'com' };
    } else {
      w.beg = [mon, mon + 2 * DAY];
      w.int = [mon + DAY, mon + 3 * DAY];
      if (isHoliday(w.beg[1])) { w.beg[1] += 2 * DAY; w.moved = true; }   // reporté au vendredi
      events[w.beg[0]] = { kind: 'deb' };
      events[w.beg[1]] = { kind: 'deb', moved: w.moved };
      events[w.int[0]] = { kind: 'int' };
      events[w.int[1]] = { kind: 'int' };
    }
    weeks.push(w);
  }
  HOLIDAYS.forEach(function (h) { if (!events[h]) events[h] = { kind: 'fer' }; });

  /* ------------------------------------------------------------------
     Tableau du programme
     ------------------------------------------------------------------ */
  function sessionLi(ms, title, extra) {
    return '<li><time datetime="' + isoDate(ms) + '">' + shortDate(ms) + '</time>' +
      '<span class="s-title">' + title + '</span>' + (extra || '') + '</li>';
  }

  function buildProgramme() {
    var body = document.querySelector('#programme-table tbody');
    if (!body) return;
    var html = '';
    weeks.forEach(function (w) {
      if (w.joint) {
        html += '<tr class="joint"><th scope="row">1<span>Semaine</span></th>' +
          '<td colspan="2" data-label="Cours commun"><ul class="sessions">' +
          sessionLi(w.beg[0], JOINT[0], '<span class="tag">Cours commun</span>') +
          sessionLi(w.beg[1], JOINT[1], '<span class="tag">Test de niveau</span>') +
          '</ul></td></tr>';
        return;
      }
      var i = w.n - 2;
      var chk = CHECKS[w.n];
      var chkTag = chk && w.n !== 8 ? '<span class="tag">' + chk + '</span>' : '';
      var movedNote = w.moved ? '<span class="note">Reportée : le mer. 11 nov. est férié</span>' : '';
      html += '<tr><th scope="row">' + w.n + '<span>Semaine</span></th>' +
        '<td data-label="Débutants"><ul class="sessions">' +
        sessionLi(w.beg[0], BEG[i][0]) +
        sessionLi(w.beg[1], BEG[i][1], chkTag + movedNote) +
        '</ul></td>' +
        '<td data-label="Intermédiaires"><ul class="sessions">' +
        sessionLi(w.int[0], INT[i][0]) +
        sessionLi(w.int[1], INT[i][1], chkTag) +
        '</ul></td></tr>';
    });
    body.innerHTML = html;
  }

  /* ------------------------------------------------------------------
     Calendrier mensuel
     ------------------------------------------------------------------ */
  var LABELS = {
    com: ['C', 'cours commun, 18h30'],
    deb: ['D', 'Débutants, 18h30'],
    int: ['I', 'Intermédiaires, 18h30'],
    fer: ['F', 'jour férié']
  };

  function buildCalendar() {
    var host = document.getElementById('months');
    if (!host) return;
    var months = [];
    for (var ms = START; ms <= END; ms += DAY) {
      var m = d(ms).getUTCMonth();
      if (months.indexOf(m) === -1) months.push(m);
    }
    var html = '';
    months.forEach(function (m) {
      var year = d(START).getUTCFullYear();
      html += '<div class="month"><h3>' + FULL_MO[m].charAt(0).toUpperCase() + FULL_MO[m].slice(1) + ' ' + year + '</h3>' +
        '<div class="cal" role="grid" aria-label="' + FULL_MO[m] + ' ' + year + '">';
      ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].forEach(function (x) {
        html += '<div class="dow" role="columnheader">' + x + '</div>';
      });
      for (var ws = START; ws <= END; ws += 7 * DAY) {
        var days = [];
        for (var k = 0; k < 7; k++) days.push(ws + k * DAY);
        var inMonth = days.some(function (x) { return d(x).getUTCMonth() === m; });
        if (!inMonth) continue;
        days.forEach(function (x) {
          var dx = d(x);
          if (dx.getUTCMonth() !== m) { html += '<div class="day empty" aria-hidden="true"></div>'; return; }
          var ev = events[x];
          var label = FULL_WD[dx.getUTCDay()] + ' ' + dx.getUTCDate() + ' ' + FULL_MO[m];
          if (ev) {
            var info = LABELS[ev.kind];
            var text = info[1] + (ev.moved ? ', séance reportée' : '');
            html += '<div class="day ' + ev.kind + '" role="gridcell" title="' + label + ' : ' + text + '" aria-label="' + label + ' : ' + text + '">' +
              '<span>' + dx.getUTCDate() + '</span><span class="t" aria-hidden="true">' + info[0] + '</span></div>';
          } else {
            html += '<div class="day" role="gridcell" aria-label="' + label + '"><span>' + dx.getUTCDate() + '</span></div>';
          }
        });
      }
      html += '</div></div>';
    });
    host.innerHTML = html;
  }

  buildProgramme();
  buildCalendar();

  /* ------------------------------------------------------------------
     Formulaire : envoi par e-mail via FormSubmit (AJAX)
     ------------------------------------------------------------------ */
  var form = document.getElementById('signup');
  if (!form) return;
  var status = document.getElementById('form-status');
  var button = document.getElementById('submit-btn');

  function collect() {
    var data = {};
    var fd = new FormData(form);
    fd.forEach(function (value, key) {
      if (key === '_honey') return;
      data[key] = data[key] ? data[key] + ', ' + value : value;
    });
    return data;
  }

  function show(type, html) {
    status.innerHTML = '<div class="msg ' + type + '">' + html + '</div>';
    status.focus();
  }

  function mailtoLink(data) {
    var lines = Object.keys(data)
      .filter(function (k) { return k.charAt(0) !== '_'; })
      .map(function (k) { return k + ' : ' + data[k]; });
    return 'mailto:' + FALLBACK_EMAIL +
      '?subject=' + encodeURIComponent('Inscription au cours d\'espagnol') +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var honey = form.querySelector('[name="_honey"]');
    if (honey && honey.value) { show('ok', '<p>Merci, votre inscription est envoyée.</p>'); return; } // robot

    var data = collect();
    button.disabled = true;
    var original = button.textContent;
    button.textContent = 'Envoi en cours';
    status.innerHTML = '';

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) {
        return r.json().then(function (j) { return { ok: r.ok, json: j }; });
      })
      .then(function (res) {
        var success = res.ok && (res.json.success === true || res.json.success === 'true');
        if (!success) throw new Error(res.json && res.json.message ? res.json.message : 'Réponse inattendue');
        form.reset();
        show('ok', '<p><strong>Merci, votre inscription est envoyée.</strong></p>' +
          '<p>Vous recevrez une réponse par e-mail pour confirmer votre groupe et votre place.</p>');
      })
      .catch(function () {
        show('err', '<p><strong>L\'envoi a échoué.</strong></p>' +
          '<p>Vérifiez votre connexion et réessayez. Vous pouvez aussi <a href="' + mailtoLink(data) +
          '">envoyer vos réponses depuis votre messagerie</a>.</p>');
      })
      .then(function () {
        button.disabled = false;
        button.textContent = original;
      });
  });
})();
