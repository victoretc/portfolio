// Богатов Dev — entrances, accordion, shutter, mailto form
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

  // --- accordion: one panel open at a time (desktop horizontal) ---
  var acc = document.querySelector('[data-accordion]');
  if (acc) {
    var panels = acc.querySelectorAll('details');
    panels.forEach(function (p) {
      p.addEventListener('toggle', function () {
        if (p.open) {
          panels.forEach(function (o) { if (o !== p) o.open = false; });
        }
      });
      // open with keyboard/click on summary already native; ensure at least one open
    });
  }

  // --- manifesto: svg stroke draws along the section scroll (ref: skiperui) ---
  var strokeSection = document.querySelector('[data-stroke]');
  if (strokeSection) {
    var strokePath = strokeSection.querySelector('.manifesto-stroke path');
    if (strokePath) {
      var len = strokePath.getTotalLength();
      var drawStroke = function () {
        var rect = strokeSection.getBoundingClientRect();
        var vh = window.innerHeight;
        // progress of the section through the viewport: 0 = entering, 1 = left
        var p = (vh - rect.top) / (vh + rect.height);
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        // same mapping as the reference: pathLength 0.5 -> 1
        var shown = (0.5 + 0.5 * p) * len;
        strokePath.style.strokeDasharray = len;
        strokePath.style.strokeDashoffset = len - shown;
      };
      if (reduced) {
        strokePath.style.strokeDasharray = 'none';
      } else {
        var strokeTick = false;
        var onStrokeScroll = function () {
          if (strokeTick) return;
          strokeTick = true;
          requestAnimationFrame(function () { drawStroke(); strokeTick = false; });
        };
        drawStroke();
        window.addEventListener('scroll', onStrokeScroll, { passive: true });
        window.addEventListener('resize', onStrokeScroll);
      }
    }
  }

  // --- contact form: compose a real mailto with the visitor's words ---
  var form = document.getElementById('brief');
  if (form) {
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
  }
})();
