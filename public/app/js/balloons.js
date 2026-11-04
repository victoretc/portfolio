// Богатов — эффект шариков (balloons-js).
// Шарики поднимаются сами, когда страница долистывается до точки-триггера.
// Триггеров может быть сколько угодно: каждый помечен data-balloons и срабатывает один раз.
// Библиотека грузится лениво: до первого срабатывания 53 КБ не качаются.
(function () {
  // Путь к библиотеке считаем от адреса этого скрипта, а не от адреса страницы:
  // сайт живёт в подпапке (victoretc.github.io/portfolio/), а document-relative
  // «./vendor/...» указал бы на корень домена.
  var scriptEl = document.currentScript;
  var base = scriptEl ? new URL('.', scriptEl.src) : new URL('js/', document.baseURI);

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var libPromise = null;
  var triggers = [];

  function loadLib() {
    if (!libPromise) {
      libPromise = import(new URL('vendor/balloons-js.esm.js', base).href);
    }
    return libPromise;
  }

  // Запуск по API компонента: type "default" — обычные шарики,
  // type "text" — шарики с текстом (text, fontSize, color).
  function launch(options) {
    var opts = options || {};

    if (mqReduce.matches) return Promise.resolve();

    return loadLib().then(function (lib) {
      if (opts.type === 'text' && opts.text) {
        lib.textBalloons([
          {
            text: opts.text,
            fontSize: opts.fontSize || 120,
            color: opts.color || '#000000',
          },
        ]);
        return;
      }
      return lib.balloons();
    });
  }

  // Настройки берём с элемента-триггера: data-balloons="default|text|off",
  // data-balloons-text, data-balloons-font-size, data-balloons-color.
  function readOptions(el) {
    return {
      type: el.getAttribute('data-balloons') || 'default',
      text: el.getAttribute('data-balloons-text') || '',
      fontSize: parseInt(el.getAttribute('data-balloons-font-size'), 10) || 120,
      color: el.getAttribute('data-balloons-color') || '#000000',
    };
  }

  function watch(el) {
    var opts = readOptions(el);

    if (opts.type === 'off') return;

    // У каждого триггера своё состояние: сработал — и больше не стреляет.
    var state = { el: el, fired: false, observer: null };

    var fire = function () {
      if (state.fired) return;
      state.fired = true;
      if (state.observer) state.observer.unobserve(el);
      launch(opts);
    };

    if ('IntersectionObserver' in window) {
      // Срабатывает, когда элемент пересекает середину экрана — ровно в момент,
      // когда пользователь до него доходит. Узкая полоса посередине нужна, чтобы
      // шарики не выстрелили, пока элемент просто мелькнул на нижнем краю.
      state.observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) fire();
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      state.observer.observe(el);
    } else {
      // Без IntersectionObserver — когда элемент дошёл до середины экрана.
      window.addEventListener(
        'scroll',
        function () {
          if (el.getBoundingClientRect().top < window.innerHeight * 0.5) fire();
        },
        { passive: true },
      );
    }

    triggers.push(state);
  }

  function init() {
    var els = document.querySelectorAll('[data-balloons]');
    for (var i = 0; i < els.length; i++) watch(els[i]);
  }

  // Ручной запуск из консоли или из другого скрипта: Balloons.launch({ type: 'text', text: 'Богатов' }).
  // reset() снимает флаги «уже стреляли» и снова подписывает все триггеры.
  window.Balloons = {
    launch: launch,
    reset: function () {
      triggers.forEach(function (t) {
        t.fired = false;
        if (t.observer) t.observer.observe(t.el);
      });
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
