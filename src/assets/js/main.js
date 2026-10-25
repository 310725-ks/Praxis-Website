(function(){
  // Seitenfluss: Alle Abschnitte scrollen normal und durchgehend (Desktop, Tablet,
  // Mobil). Dieses Skript hält nur die Kopfzeilen-Maße als CSS-Variablen bereit,
  // lässt die Punkte rechts der Scroll-Position folgen (Klick = sanft zum
  // Abschnitt scrollen) und springt bei Sprungmarken (z.B. #faq) zum Abschnitt.
  var sections = Array.prototype.slice.call(document.querySelectorAll('.snap-section'));
  if(!sections.length) return;

  var header = document.querySelector('.header-sticky-group');
  var utilityBar = document.querySelector('.utility-bar');
  var siteHeader = document.querySelector('.site-header');
  var dots = Array.prototype.slice.call(document.querySelectorAll('#snapDots button'));
  var current = -1, ticking = false;

  function headerH(){ return header ? header.offsetHeight : 0; }
  function setHeaderH(){
    document.documentElement.style.setProperty('--header-h', headerH() + 'px');
    // Einzelhöhen der beiden Headerzeilen (1. Zeile: utility-bar, 2. Zeile: site-header)
    // für Farbverlaufs-Bänder und Legal-Strip.
    if(utilityBar) document.documentElement.style.setProperty('--header1-h', utilityBar.offsetHeight + 'px');
    if(siteHeader) document.documentElement.style.setProperty('--header2-h', siteHeader.offsetHeight + 'px');
  }
  function setActive(i){
    if(i === current) return;
    current = i;
    dots.forEach(function(d,idx){ d.classList.toggle('is-active', idx===i); });
    document.body.classList.toggle('on-contact', i===sections.length-1);
  }
  function update(){
    ticking = false;
    var h = headerH();
    var line = h + (window.innerHeight - h) * 0.4;
    var idx = 0;
    for(var i=0;i<sections.length;i++){
      if(sections[i].getBoundingClientRect().top <= line) idx = i;
    }
    // Ganz unten angekommen: letzter Abschnitt aktiv
    if(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) idx = sections.length-1;
    setActive(idx);
  }
  function requestUpdate(){
    if(ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }
  function scrollToSection(sec, instant){
    var top = sec.getBoundingClientRect().top + window.scrollY - headerH() + 1;
    window.scrollTo({top: Math.max(0, top), behavior: instant ? 'auto' : 'smooth'});
  }

  setHeaderH(); update();
  window.addEventListener('resize', function(){ setHeaderH(); requestUpdate(); });
  window.addEventListener('scroll', requestUpdate, {passive:true});
  window.addEventListener('load', function(){ setHeaderH(); update(); goToHash(true); });

  dots.forEach(function(d){
    d.addEventListener('click', function(){
      var sec = sections[parseInt(d.dataset.index,10)];
      if(sec) scrollToSection(sec, false);
    });
  });

  // Sprungmarken (z.B. /systemische-therapie/#faq): scrollt zum Abschnitt mit der passenden id.
  function goToHash(instant){
    var h = window.location.hash;
    if(!h || h.length < 2) return false;
    var target = document.getElementById(decodeURIComponent(h.slice(1)));
    if(!target || sections.indexOf(target) < 0) return false;
    scrollToSection(target, instant);
    return true;
  }
  goToHash(true);
  window.addEventListener('hashchange', function(){ goToHash(false); });
  document.addEventListener('click', function(e){
    var a = e.target.closest ? e.target.closest('a[href*="#"]') : null;
    if(!a || a.pathname !== window.location.pathname || !a.hash) return;
    var target = document.getElementById(a.hash.slice(1));
    if(!target || sections.indexOf(target) < 0) return;
    e.preventDefault();
    if(window.location.hash !== a.hash) history.pushState(null, '', a.hash);
    goToHash(false);
    var mnav = document.getElementById('mobileNav'), mbtn = document.getElementById('hamburgerBtn');
    if(mnav && mnav.classList.contains('is-open')){ mnav.classList.remove('is-open'); if(mbtn){ mbtn.classList.remove('is-open'); mbtn.setAttribute('aria-expanded','false'); } }
  });
})();

(function(){
  var btn = document.getElementById('hamburgerBtn');
  var nav = document.getElementById('mobileNav');
  if(btn && nav){
    btn.addEventListener('click', function(){
      var open = nav.classList.toggle('is-open');
      btn.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(open){
        var headerEl = document.querySelector('.header-sticky-group');
        if(headerEl){
          var rect = headerEl.getBoundingClientRect();
          nav.style.top = Math.round(rect.bottom) + 'px';
        }
      }
    });
  }
  document.querySelectorAll('.mobile-nav-toggle:not(.mobile-nav-link)').forEach(function(toggle){
    toggle.addEventListener('click', function(){
      var item = toggle.closest('.mobile-nav-item');
      var wasOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !wasOpen);
      toggle.setAttribute('aria-expanded', !wasOpen ? 'true' : 'false');
    });
  });
  document.querySelectorAll('.tile.card').forEach(function(card){
    card.addEventListener('click', function(e){
      // Mobil (Akkordeon-Ansicht): Klick klappt Beschreibung auf/zu statt zu navigieren.
      // Ausnahme: Klick auf den "Mehr erfahren"-Link am Ende des Beschreibungstexts
      // -- dort soll die normale Link-Navigation zur Angebots-Seite greifen.
      // Desktop/Tablet: normaler Link-Klick, führt zur Unterseite.
      if(window.innerWidth <= 640){
        if(e.target.closest('.tile-cta')) return;
        e.preventDefault();
        card.classList.toggle('is-open');
      }
    });
    card.addEventListener('keydown', function(e){
      if(e.key === ' ' && window.innerWidth <= 640){
        e.preventDefault();
        card.classList.toggle('is-open');
      }
    });
  });
})();

(function(){
  // FAQ-Akkordeon (Unterseite Paartherapie): das angeklickte Feld wird aus
  // seiner Spalte in den ".faq-spotlight"-Bereich verschoben, wo es -- ohne
  // die Breitenbeschränkung der Spalte -- auf seine volle Höhe wachsen kann
  // (kein internes Scrollen mehr nötig). Die übrigen Felder blenden dabei
  // per CSS ab (".faq-columns.has-open"). An der ursprünglichen Stelle
  // bleibt bis zur Rückkehr ein unsichtbarer, gleich hoher Platzhalter
  // stehen, damit die Nachbarfelder nicht verrutschen.
  var faqColumns = document.querySelector('.faq-columns');
  var spotlight = document.querySelector('.faq-spotlight');
  var sectionInner = document.querySelector('.ph-faq .s-offers-inner');
  var items = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  if(!items.length || !faqColumns || !spotlight) return;

  var RESTORE_DELAY = 320; // muss zur CSS-Transitionsdauer von .is-spotlight passen

  var current = null; // { item, placeholder }

  function restore(entry){
    var btn = entry.item.querySelector('.faq-summary');
    entry.item.classList.remove('is-open', 'is-spotlight-visible', 'has-scroll-cap');
    entry.item.style.maxHeight = '';
    btn.setAttribute('aria-expanded', 'false');
    setTimeout(function(){
      if(entry.placeholder.parentNode){
        entry.placeholder.parentNode.replaceChild(entry.item, entry.placeholder);
      }
      entry.item.classList.remove('is-spotlight');
    }, RESTORE_DELAY);
  }

  function openInSpotlight(item, btn){
    var placeholder = document.createElement('div');
    placeholder.className = 'faq-item-placeholder';
    placeholder.style.height = item.getBoundingClientRect().height + 'px';
    item.parentNode.replaceChild(placeholder, item);

    spotlight.appendChild(item);
    item.classList.add('is-spotlight', 'is-open');
    btn.setAttribute('aria-expanded', 'true');

    // Sicherheitsnetz für sehr schmale/niedrige Desktop-Fenster: reicht der
    // verfügbare Platz im Abschnitt trotz natürlicher (voller) Höhe des
    // geöffneten Feldes nicht aus, würde der Abschnitt über seine feste
    // Höhe hinauswachsen -- dort nicht erreichbar, weil der Viewport dieses
    // Overflow versteckt (kein echtes Seiten-Scrollen im Desktop-Modus).
    // Der exakt fehlende Betrag wird gemessen und nur dann als
    // Scroll-Grenze auf das Feld selbst gesetzt (statt pauschal per CSS),
    // damit der häufige Fall (genug Platz) seine volle, natürliche Höhe
    // behält.
    if(sectionInner && window.innerWidth > 1024){
      var shortfall = sectionInner.scrollHeight - sectionInner.clientHeight;
      if(shortfall > 0){
        var cap = item.offsetHeight - shortfall - 16;
        if(cap > 120){
          item.style.maxHeight = cap + 'px';
          item.classList.add('has-scroll-cap');
        }
      }
    }

    // Sichtbarkeits-Klasse erst im übernächsten Frame setzen, damit der
    // Browser die Ausgangsposition (eingefügt, aber noch unsichtbar) zuerst
    // rendert -- sonst gäbe es keinen Übergang zu animieren.
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        item.classList.add('is-spotlight-visible');
        // Nur außerhalb des Desktop-Vollbild-Modus nötig: dort liegt der
        // gesamte Abschnitt ohnehin schon sichtbar im festen 100vh-Rahmen
        // (echtes Scrollen findet dort gar nicht statt, der Wechsel läuft
        // über die eigene Transform-Mechanik weiter oben in dieser Datei).
        // Im normalen Seitenfluss (Mobile/Tablet) sorgt dies dafür, dass
        // das aufklappende Feld ins Blickfeld rückt, statt am oberen Rand
        // der Liste zu erscheinen, während man weiter unten liest.
        if(window.innerWidth <= 1024){
          item.scrollIntoView({behavior: 'smooth', block: 'nearest'});
        }
      });
    });

    return {item: item, placeholder: placeholder};
  }

  items.forEach(function(item){
    var btn = item.querySelector('.faq-summary');
    btn.addEventListener('click', function(){
      if(current && current.item === item){
        restore(current);
        current = null;
        faqColumns.classList.remove('has-open');
        return;
      }
      var previous = current;
      current = openInSpotlight(item, btn);
      faqColumns.classList.add('has-open');
      if(previous) restore(previous);
    });
  });
})();

(function(){
  // Neugestaltung: FAQ als Auswahlliste mit Antwortfläche (Desktop) bzw.
  // Akkordeon (Tablet/Mobil, <=1024px) sowie Umschalter Beruflich/Persönlich
  // (Coaching). Auf Seiten ohne diese Bausteine passiert nichts.
  document.querySelectorAll('.rd-faq').forEach(function(sec){
    var items = Array.prototype.slice.call(sec.querySelectorAll('.rd-faq-item'));
    var body = sec.querySelector('.rd-faq-detail-body');
    function show(item){
      items.forEach(function(it){
        var on = it === item;
        it.classList.toggle('is-active', on);
        it.querySelector('.rd-faq-q').setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      if(body && item){
        body.innerHTML = '<div class="rd-num">' + item.querySelector('.rd-num').textContent + '</div><h3>' + item.querySelector('.rd-q').innerHTML + '</h3>' + item.querySelector('.rd-faq-a-inner').innerHTML;
        body.classList.remove('is-in'); void body.offsetWidth; body.classList.add('is-in');
      }
    }
    items.forEach(function(it){
      var btn = it.querySelector('.rd-faq-q');
      btn.addEventListener('click', function(){
        if(window.innerWidth <= 1024 && it.classList.contains('is-active')){
          it.classList.remove('is-active');
          btn.setAttribute('aria-expanded', 'false');
          return;
        }
        show(it);
      });
    });
    show(sec.querySelector('.rd-faq-item.is-active') || items[0]);
  });
  document.querySelectorAll('.rd-tabs').forEach(function(sec){
    var tabs = Array.prototype.slice.call(sec.querySelectorAll('.rd-tab'));
    var panels = Array.prototype.slice.call(sec.querySelectorAll('.rd-tabpanel'));
    tabs.forEach(function(t){
      t.addEventListener('click', function(){
        var k = t.getAttribute('data-tab');
        tabs.forEach(function(x){ var on = x === t; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); });
        panels.forEach(function(p){ p.classList.toggle('is-active', p.getAttribute('data-panel') === k); });
      });
    });
  });
})();
