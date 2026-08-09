/* config.js — wersja CAE (C1 Advanced)
 *
 * Model karty:
 *   id      cae_0001
 *   t       typ: cloze | wordform | transform | coll | prep | phrase | def
 *   q       treść pytania (zdanie z ___, słowo bazowe, definicja, zwrot po polsku)
 *   q2      druga linia (dla transformacji: zdanie docelowe z luką)
 *   a       odpowiedź
 *   accept  [] dopuszczalne warianty
 *   hint    podpowiedź (część mowy, KEY WORD)
 *   pl      tłumaczenie
 *   ipa     wymowa
 *   coll    [] kolokacje
 *   ex      [] przykłady użycia
 *   reg     rejestr
 *   note    uwaga, pułapka, synonim
 *   tags    []
 */
window.APP_CONFIG = (function () {
  'use strict';

  var TYPES = {
    cloze:     { badge: 'Luka w zdaniu',   long: true  },
    wordform:  { badge: 'Słowotwórstwo',   long: false },
    transform: { badge: 'Transformacja',   long: true  },
    coll:      { badge: 'Kolokacja',       long: false },
    prep:      { badge: 'Przyimek',        long: false },
    phrase:    { badge: 'Zwrot',           long: false },
    def:       { badge: 'Definicja',       long: true  }
  };

  var TYPE_NAMES = {
    cloze: 'Luka w zdaniu (Use of English 1–2)',
    wordform: 'Słowotwórstwo (Use of English 3)',
    transform: 'Transformacja (Use of English 4)',
    coll: 'Kolokacja',
    prep: 'Przyimek zależny',
    phrase: 'Zwrot polski → angielski',
    def: 'Definicja → słowo'
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Zamienia ___ na wyróżnioną lukę */
  function gaps(text) {
    return esc(text).replace(/_{2,}/g, '<span class="gap">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>');
  }

  function filled(card) {
    var base = card.t === 'transform' ? (card.q2 || '') : (card.q || '');
    if (!/_{2,}/.test(base)) return card.a || '';
    return base.replace(/_{2,}/, card.a || '');
  }

  return {
    ns: 'cae',
    title: 'CAE — fiszki',
    wordmark: 'CAE',
    idPrefix: 'cae_',
    ttsLang: 'en-GB',
    addTabLabel: 'Dodaj',

    defaults: {
      newPerDay: 12,
      typing: true,
      maximumInterval: 365,
      requestRetention: 0.9
    },

    answerOf: function (c) { return c.a || ''; },

    renderFront: function (c) {
      var meta = TYPES[c.t] || TYPES.cloze;
      var out = { badge: meta.badge, long: meta.long, typable: true };

      if (c.t === 'transform') {
        out.main = esc(c.q);
        out.sub = '<div style="margin-top:12px">' + gaps(c.q2 || '') + '</div>';
        out.keyword = c.hint || '';
      } else if (c.t === 'wordform') {
        out.main = esc(String(c.q).toUpperCase());
        out.sub = c.hint ? 'Utwórz: ' + esc(c.hint) : 'Utwórz formę pochodną';
      } else if (c.t === 'phrase') {
        out.main = esc(c.q);
        out.sub = c.hint ? esc(c.hint) : '';
      } else {
        out.main = gaps(c.q);
        out.sub = c.hint ? esc(c.hint) : '';
      }
      return out;
    },

    renderBack: function (c) {
      var blocks = [];

      if (c.t === 'cloze' || c.t === 'transform') {
        blocks.push({ title: 'Pełne zdanie', items: [filled(c)], italic: true });
      }
      if (c.coll && c.coll.length) blocks.push({ title: 'Kolokacje', items: c.coll });
      if (c.ex && c.ex.length) blocks.push({ title: 'Użycie', items: c.ex, italic: c.ex.length === 1 });
      if (c.reg) blocks.push({ title: 'Rejestr', items: [c.reg] });
      if (c.note) blocks.push({ title: 'Uwaga', items: [c.note] });

      return {
        answer: c.a,
        ipa: c.ipa || '',
        gloss: c.t === 'phrase' ? '' : (c.pl || ''),
        blocks: blocks,
        speak: (c.t === 'cloze' || c.t === 'transform') ? filled(c) : (c.ex && c.ex[0] ? c.ex[0] : c.a),
        speakLang: 'en-GB'
      };
    },

    searchText: function (c) {
      return [c.a, c.q, c.pl, c.note, (c.tags || []).join(' '), (c.coll || []).join(' ')].join(' ');
    },

    browseRow: function (c) {
      return {
        main: c.a,
        sub: (c.pl ? c.pl + ' · ' : '') + (TYPES[c.t] ? TYPES[c.t].badge : c.t)
      };
    },

    addFormHtml: function () {
      var opts = Object.keys(TYPE_NAMES).map(function (k) {
        return '<option value="' + k + '">' + TYPE_NAMES[k] + '</option>';
      }).join('');

      return '' +
        '<div class="section"><h2>Nowa karta</h2>' +
        '<div class="field"><label>Typ</label><select id="f-type">' + opts + '</select></div>' +
        '<div class="field"><label>Pytanie</label><textarea id="f-q" placeholder="Zdanie z ___ w miejscu luki, słowo bazowe albo definicja"></textarea>' +
        '<div class="help">Luka to trzy podkreślenia: <code>___</code></div></div>' +
        '<div class="field"><label>Zdanie docelowe (tylko transformacja)</label><textarea id="f-q2" placeholder="I ___ for that job."></textarea></div>' +
        '<div class="field"><label>Odpowiedź</label><input id="f-a" autocapitalize="off"></div>' +
        '<div class="field"><label>Warianty dopuszczalne</label><input id="f-accept" placeholder="oddzielone średnikiem" autocapitalize="off"></div>' +
        '<div class="field"><label>Podpowiedź / KEY WORD</label><input id="f-hint" placeholder="rzeczownik, WISH, …"></div>' +
        '<div class="field"><label>Tłumaczenie</label><input id="f-pl"></div>' +
        '<div class="field"><label>Wymowa</label><input id="f-ipa" placeholder="/kʌm ˈʌndə faɪə/" autocapitalize="off"></div>' +
        '<div class="field"><label>Kolokacje</label><textarea id="f-coll" placeholder="jedna w linii"></textarea></div>' +
        '<div class="field"><label>Przykłady</label><textarea id="f-ex" placeholder="jeden w linii"></textarea></div>' +
        '<div class="field"><label>Rejestr</label><input id="f-reg" placeholder="formalny / neutralny / prasowy"></div>' +
        '<div class="field"><label>Uwaga</label><textarea id="f-note" placeholder="pułapka, synonim, kontrast"></textarea></div>' +
        '<div class="field"><label>Tagi</label><input id="f-tags" placeholder="oddzielone przecinkiem"></div>' +
        '<button class="btn primary" id="btn-add-save">Dodaj kartę</button></div>' +

        '<div class="section"><h2>Import zbiorczy</h2>' +
        '<div class="field"><textarea id="f-bulk" style="min-height:130px" placeholder="typ | pytanie | odpowiedź | podpowiedź | tłumaczenie | kolokacje;… | przykłady;… | uwaga"></textarea>' +
        '<div class="help">Jedna karta w linii, pola rozdzielone pionową kreską. Wystarczą trzy pierwsze. Format pasuje do arkusza kalkulacyjnego — wyeksportuj kolumny i wklej.</div></div>' +
        '<button class="btn" id="btn-bulk">Wczytaj wszystkie linie</button></div>';
    },

    addFormRead: function () {
      var v = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; };
      var lines = function (id) {
        return v(id).split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      };
      var q = v('f-q'), a = v('f-a');
      if (!q || !a) { alert('Pytanie i odpowiedź są wymagane.'); return null; }

      var card = { t: v('f-type') || 'cloze', q: q, a: a };
      if (v('f-q2')) card.q2 = v('f-q2');
      if (v('f-accept')) card.accept = v('f-accept').split(';').map(function (s) { return s.trim(); }).filter(Boolean);
      if (v('f-hint')) card.hint = v('f-hint');
      if (v('f-pl')) card.pl = v('f-pl');
      if (v('f-ipa')) card.ipa = v('f-ipa');
      if (lines('f-coll').length) card.coll = lines('f-coll');
      if (lines('f-ex').length) card.ex = lines('f-ex');
      if (v('f-reg')) card.reg = v('f-reg');
      if (v('f-note')) card.note = v('f-note');
      if (v('f-tags')) card.tags = v('f-tags').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      return card;
    },

    bulkParse: function (text) {
      return text.split('\n').map(function (line) {
        var p = line.split('|').map(function (s) { return s.trim(); });
        if (p.length < 3 || !p[1] || !p[2]) return null;
        var c = { t: TYPES[p[0]] ? p[0] : 'cloze', q: p[1], a: p[2] };
        if (p[3]) c.hint = p[3];
        if (p[4]) c.pl = p[4];
        if (p[5]) c.coll = p[5].split(';').map(function (s) { return s.trim(); }).filter(Boolean);
        if (p[6]) c.ex = p[6].split(';').map(function (s) { return s.trim(); }).filter(Boolean);
        if (p[7]) c.note = p[7];
        return c;
      }).filter(Boolean);
    }
  };
})();
