// Звуки интерфейса: один делегированный обработчик на документ.
// Синтез живёт в ui-sounds.js; здесь только выбор пресета под действие.
import { playUISound } from './ui-sounds.js';

// Заметные действия — связаться, обсудить проект, открыть сайт.
var primary = '.footer-key, .cta-link, .offer-link, .how-text .text-link';

function controlFor(target) {
  if (!target || !target.closest) return null;
  var el = target.closest('a, button');
  if (!el) return null;
  if (el.disabled || el.getAttribute('aria-disabled') === 'true') return null;
  return el;
}

document.addEventListener('click', function (e) {
  var el = controlFor(e.target);
  if (!el) return;

  if (el.matches(primary)) {
    playUISound('tap');
  } else if (el.closest('.dock')) {
    playUISound('select');
  } else {
    playUISound('click');
  }
});

