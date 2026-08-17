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
  var dots = Array.prototype.slice.call(document.querySelectorAll('#snapDots button'));
  var index = 0, animating = false, sectionH = 0;
  // "released": true, sobald auf Desktop-Breite über den letzten Abschnitt hinaus in den
  // Footer (inkl. Mitgliedschaften-Logos) gescrollt wurde. In diesem Zustand läuft der
  // normale Seiten-Scroll; erst beim Zurückscrollen an den oberen Rand wird wieder in die
  // Abschnitts-Wechsel-Mechanik eingerastet.
  var released = false;

  function setHeaderH(){
    var h = header.offsetHeight;
    document.documentElement.style.setProperty('--header-h', h + 'px');
    sectionH = window.innerHeight - h;
    if(isDesktopMode() && !released) goTo(index, true);
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

  window.addEventListener('wheel', function(e){
    if(!isDesktopMode()) return;

    if(released){
      // Im Footer-Bereich: normaler Scroll. Nur am oberen Rand + weiterem Hochscrollen
      // wieder in die Abschnitts-Mechanik einrasten.
      if(window.scrollY <= 0 && e.deltaY < 0){
        e.preventDefault();
        released = false;
        goTo(sections.length - 1, true);
      }
      return;
    }

    if(index === sections.length - 1 && e.deltaY > 0){
      // Letzter Abschnitt erreicht, weiter nach unten: Footer freigeben, dieser
      // Wheel-Tick scrollt die Seite bereits ganz normal weiter.
      released = true;
      return;
    }

    e.preventDefault();
    if(animating) return;
    if(Math.abs(e.deltaY) < 8) return;
    animating = true;
    goTo(index + (e.deltaY > 0 ? 1 : -1));
    setTimeout(function(){ animating = false; }, 700);
  }, {passive:false});

  window.addEventListener('keydown', function(e){
    if(!isDesktopMode()) return;

    if(released){
      if((e.key==='ArrowUp'||e.key==='PageUp') && window.scrollY <= 0){
        e.preventDefault();
        released = false;
        goTo(sections.length - 1, true);
      }
      return;
    }

    if(e.key==='ArrowDown'||e.key==='PageDown'){
      if(index === sections.length - 1){ released = true; return; }
      e.preventDefault();
      if(!animating){animating=true; goTo(index+1); setTimeout(function(){animating=false;},700);}
    }
    if(e.key==='ArrowUp'||e.key==='PageUp'){ e.preventDefault(); if(!animating){animating=true; goTo(index-1); setTimeout(function(){animating=false;},700);} }
  });

  window.addEventListener('scroll', function(){
    if(!isDesktopMode()) return;
    if(window.scrollY > 0) released = true;
  });

  dots.forEach(function(d){
    d.addEventListener('click', function(){
      if(!isDesktopMode()) return;
      if(animating) return;
      if(released){ released = false; window.scrollTo(0,0); }
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
