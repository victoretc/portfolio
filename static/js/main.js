// Богатов — reveal on scroll + active state in the bottom dock.
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- video: autoplay only if the user allows motion --------------------
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function syncVideoMotion() {
    var videos = document.querySelectorAll('video[autoplay]');
    for (var i = 0; i < videos.length; i++) {
      var v = videos[i];
      if (mqReduce.matches) {
        v.pause();
        v.removeAttribute('autoplay');
      } else if (!v.autoplay) {
        v.setAttribute('autoplay', '');
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      }
    }
  }
  syncVideoMotion();
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', syncVideoMotion);

  // --- reveal ------------------------------------------------------------
  // Первый экран живёт по отдельному правилу: он ждёт готовности страницы
  // (шрифты + снятие шторки-лоадера), поэтому скролл-ревил его не трогает.
  var hero = document.querySelector('[data-hero]');
  var heroTargets = hero
    ? Array.prototype.slice.call(hero.querySelectorAll('[data-reveal]'))
    : [];
  var isHeroTarget = function (el) { return heroTargets.indexOf(el) !== -1; };
  var dock = document.querySelector('.dock');

  var targets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (isHeroTarget(e.target)) return; // первый экран ждёт site:veil
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.12 });
    targets.forEach(function (t) { io.observe(t); });

    // safety: never leave content hidden if the observer misses something
    setTimeout(function () {
      targets.forEach(function (t) {
        if (isHeroTarget(t)) return;
        var r = t.getBoundingClientRect();
        if (r.top < window.innerHeight) t.classList.add('is-in');
      });
    }, 2500);
  } else {
    targets.forEach(function (t) { t.classList.add('is-in'); });
  }

  // --- первый экран: ждём шрифты и шторку --------------------------------
  // Пока висит белый лоадер, текст показывать бессмысленно — анимация проиграет
  // под шторкой. Ждём обоих событий и только потом поднимаем текст.
  function waitForFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var load = Promise.all([
      document.fonts.load('1rem "Handil Pro"'),
      document.fonts.load('500 1rem "Golos Text"')
    ]).catch(function () {});
    return Promise.race([
      load,
      new Promise(function (resolve) { setTimeout(resolve, 1500); })
    ]);
  }
  function waitForVeil() {
    return new Promise(function (resolve) {
      var loader = document.querySelector('[data-loader]');
      if (!loader || loader.classList.contains('is-done')) return resolve();
      document.addEventListener('site:veil', resolve, { once: true });
      setTimeout(resolve, 4000); // страховка: текст не должен остаться скрытым
    });
  }
  if (heroTargets.length && !reduced) {
    Promise.all([waitForFonts(), waitForVeil()]).then(function () {
      // маленькая пауза, чтобы текст начал подниматься из-под гаснущей шторки
      setTimeout(function () {
        heroTargets.forEach(function (el) { el.classList.add('is-in'); });
        if (dock) dock.classList.add('is-in');
      }, 60);
    });
  } else if (dock) {
    dock.classList.add('is-in');
  }

  // --- dock: highlight the section in view -------------------------------
  // Только внутренние якоря: внешняя ссылка (Telegram) не является секцией.
  var dockLinks = Array.prototype.slice.call(document.querySelectorAll('.dock a[href^="#"]'));
  var sections = dockLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var visible = [];
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var id = '#' + e.target.id;
        var i = visible.indexOf(id);
        if (e.isIntersecting && i === -1) visible.push(id);
        if (!e.isIntersecting && i !== -1) visible.splice(i, 1);
      });
      var current = visible[visible.length - 1] || null;
      dockLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === current);
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
