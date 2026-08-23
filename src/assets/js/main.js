(function(){
  // Wechsel-Mechanik der Startseite: 4 Vollbild-Abschnitte auf Desktop-Breite
  // (>1024px), normaler durchgehender Scroll auf Tablet/Mobile darunter.
  // Auf Seiten ohne diese Struktur (Unterseiten) bricht die Funktion früh ab.
  var track = document.getElementById('snapTrack');
  var sections = Array.prototype.slice.call(document.querySelectorAll('.snap-section'));
  if(!track || !sections.length) return;

  var SNAP_BP = 1024; // oberhalb dieser Breite bleibt der Bildschirmseiten-Wechsel aktiv;
                       // darunter (Mobile + Tablet) wird normal durchgescrollt.
  function isDesktopMode(){ return window.innerWidth > SNAP_BP; }

  var header = document.querySelector('.header-sticky-group');
  var utilityBar = document.querySelector('.utility-bar');
  var siteHeader = document.querySelector('.site-header');
  var dots = Array.prototype.slice.call(document.querySelectorAll('#snapDots button'));
  var index = 0, animating = false, sectionH = 0;

  function setHeaderH(){
    var h = header.offsetHeight;
    document.documentElement.style.setProperty('--header-h', h + 'px');
    // Einzelhöhen der beiden Headerzeilen (1. Zeile: utility-bar, 2. Zeile: site-header)
    // werden separat als CSS-Variablen bereitgestellt, damit Abschnitte ihre
    // Farbverlaufs-Bänder/Legal-Strip exakt an diesen Maßen ausrichten können.
    if(utilityBar) document.documentElement.style.setProperty('--header1-h', utilityBar.offsetHeight + 'px');
    if(siteHeader) document.documentElement.style.setProperty('--header2-h', siteHeader.offsetHeight + 'px');
    sectionH = window.innerHeight - h;
    if(isDesktopMode()) goTo(index, true);
  }
  function setActive(i){
    dots.forEach(function(d,idx){ d.classList.toggle('is-active', idx===i); });
    document.body.classList.toggle('on-contact', i===sections.length-1);
  }
  function goTo(i, instant){
    if(!isDesktopMode()) return;
    i = Math.max(0, Math.min(sections.length-1, i));
    index = i;
    track.style.transition = instant ? 'none' : '';
    track.style.transform = 'translateY(-' + (i*sectionH) + 'px)';
    setActive(i);
  }
  setHeaderH();
  window.addEventListener('resize', setHeaderH);

  function isPassthroughScroll(e){
    // Erlaubt normales Scrollen innerhalb der FAQ-Liste (Unterseite
    // Paartherapie), falls deren Inhalt trotz vertikaler Zentrierung/
    // Sicherheitsnetz höher als der verfügbare Platz im Abschnitt ist –
    // sonst würde das Mausrad sofort den Abschnittswechsel auslösen.
    var el = e.target.closest ? e.target.closest('.faq-list') : null;
    if(!el || el.scrollHeight <= el.clientHeight) return false;
    var atTop = el.scrollTop <= 0;
    var atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;
    if(e.deltaY < 0 && !atTop) return true;
    if(e.deltaY > 0 && !atBottom) return true;
    return false;
  }

  window.addEventListener('wheel', function(e){
    if(!isDesktopMode()) return;
    if(isPassthroughScroll(e)) return;
    e.preventDefault();
    if(animating) return;
    if(Math.abs(e.deltaY) < 8) return;
    animating = true;
    goTo(index + (e.deltaY > 0 ? 1 : -1));
    setTimeout(function(){ animating = false; }, 700);
  }, {passive:false});

  window.addEventListener('keydown', function(e){
    if(!isDesktopMode()) return;
    if(e.key==='ArrowDown'||e.key==='PageDown'){ e.preventDefault(); if(!animating){animating=true; goTo(index+1); setTimeout(function(){animating=false;},700);} }
    if(e.key==='ArrowUp'||e.key==='PageUp'){ e.preventDefault(); if(!animating){animating=true; goTo(index-1); setTimeout(function(){animating=false;},700);} }
  });

  // Touch-Wischgesten für den Abschnittswechsel: Tablets (v.a. im Querformat, wo die
  // Bildschirmbreite die Desktop-Grenze überschreitet) feuern beim Wischen keine
  // "wheel"-Events, sondern nur Touch-Events. Ohne diese Handler ließ sich der
  // Abschnitt nur über die Punkte, nicht aber per Wischen wechseln.
  var touchStartX = null, touchStartY = null;
  window.addEventListener('touchstart', function(e){
    if(!isDesktopMode()) return;
    if(e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, {passive:true});

  window.addEventListener('touchmove', function(e){
    if(!isDesktopMode()) return;
    if(touchStartY === null) return;
    e.preventDefault();
  }, {passive:false});

  window.addEventListener('touchend', function(e){
    if(!isDesktopMode()) return;
    if(touchStartY === null) return;
    var touch = e.changedTouches[0];
    var deltaY = touchStartY - touch.clientY;
    var deltaX = touchStartX - touch.clientX;
    touchStartX = null; touchStartY = null;
    if(Math.abs(deltaY) < 40 || Math.abs(deltaY) < Math.abs(deltaX)) return;
    if(animating) return;
    animating = true;
    goTo(index + (deltaY > 0 ? 1 : -1));
    setTimeout(function(){ animating = false; }, 700);
  }, {passive:true});

  dots.forEach(function(d){
    d.addEventListener('click', function(){
      if(!isDesktopMode()) return;
      if(animating) return;
      animating = true;
      goTo(parseInt(d.dataset.index,10));
      setTimeout(function(){ animating=false; }, 700);
    });
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
      // Desktop/Tablet: normaler Link-Klick, führt zur Unterseite.
      if(window.innerWidth <= 640){
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
  // FAQ-Akkordeon (Unterseite Paartherapie): immer nur eine Antwort
  // gleichzeitig geöffnet -- spaltenübergreifend, da beide FAQ-Spalten
  // (.faq-list) gemeinsam über alle .faq-item hinweg gesteuert werden. Die
  // Klasse "is-open" schaltet nur den Zustand um; das eigentliche sanfte
  // Auf-/Zuklappen (Höhe + Fade/Slide) übernimmt CSS.
  var items = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  if(!items.length) return;

  items.forEach(function(item){
    var btn = item.querySelector('.faq-summary');
    btn.addEventListener('click', function(){
      var willOpen = !item.classList.contains('is-open');
      items.forEach(function(other){
        other.classList.remove('is-open');
        other.querySelector('.faq-summary').setAttribute('aria-expanded','false');
      });
      if(willOpen){
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded','true');
      }
    });
  });
})();
