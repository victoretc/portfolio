// Богатов Dev — entrances, mailto form
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

  // --- forms: compose a real mailto with the visitor's words ---
  var forms = document.querySelectorAll('[data-brief]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.querySelector('[name="имя"]') || {}).value || '';
      var contact = (form.querySelector('[name="контакт"]') || {}).value || '';
      var task = (form.querySelector('[name="задача"]') || {}).value || '';
      var subject = 'Заявка с сайта — ' + (name.trim() || 'новый проект');
      var body = 'Имя: ' + name + '\nКонтакт: ' + contact + '\n\nЗадача:\n' + task + '\n';
      window.location.href = 'mailto:hello@example.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  });
})();
