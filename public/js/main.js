// Богатов Dev — entrances, header scroll state
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- reveal on scroll: heading, text, picture staggered via --i ---
  var targets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
    targets.forEach(function (t) { io.observe(t); });
    // safety: never leave content hidden if the observer misses something
    setTimeout(function () {
      targets.forEach(function (t) {
        var r = t.getBoundingClientRect();
        if (r.top < window.innerHeight) t.classList.add('is-in');
      });
    }, 2500);
  } else {
    targets.forEach(function (t) { t.classList.add('is-in'); });
  }

  // --- header: scroll state, active-section spy, mobile menu ---
  var head = document.querySelector('[data-head]');
  if (head) {
    var navLinks = Array.prototype.slice.call(head.querySelectorAll('[data-navlink]'));

    var onScroll = function () {
      head.classList.toggle('is-scrolled', window.scrollY > 8);
      // вверх страницы — активного раздела нет
      if (window.scrollY < 120) {
        navLinks.forEach(function (a) { a.classList.remove('is-active'); });
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var navSections = navLinks
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);
    if ('IntersectionObserver' in window && navSections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          navLinks.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);
          });
        });
      }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
      navSections.forEach(function (s) { spy.observe(s); });
    }

    var burger = head.querySelector('[data-burger]');
    if (burger) {
      var setMenu = function (open) {
        head.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Скрыть меню' : 'Показать меню');
      };
      burger.addEventListener('click', function () {
        setMenu(!head.classList.contains('is-open'));
      });
      navLinks.forEach(function (a) {
        a.addEventListener('click', function () { setMenu(false); });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && head.classList.contains('is-open')) {
          setMenu(false);
          burger.focus();
        }
      });
    }
  }

  // --- forms: заявки уходят в Telegram, форм сбора данных на сайте нет ---
})();
