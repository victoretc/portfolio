// DoodleCallout — vanilla port of the 21st.dev React component.
// Hand-drawn stroke draws itself, then the script label fades in letter
// by letter; the sequence replays every `data-loop` ms (0 = once).
(function () {
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function splitLabel(label) {
    var words = label.textContent.trim().split(/\s+/);
    label.textContent = "";
    var idx = 0;
    for (var w = 0; w < words.length; w++) {
      if (w > 0) {
        label.appendChild(document.createTextNode(" "));
        idx++;
      }
      var wordEl = document.createElement("span");
      wordEl.className = "callout-word";
      var chars = Array.from(words[w]);
      for (var i = 0; i < chars.length; i++) {
        var s = document.createElement("span");
        s.className = "callout-char";
        s.textContent = chars[i];
        s.style.setProperty("--i", idx++);
        wordEl.appendChild(s);
      }
      label.appendChild(wordEl);
    }
  }

  function run(el) {
    el.classList.remove("is-in");
    // Force reflow so the animation restarts on the next frame.
    void el.offsetWidth;
    el.classList.add("is-in");
  }

  function boot() {
    var callouts = document.querySelectorAll("[data-callout]");
    for (var c = 0; c < callouts.length; c++) {
      (function (el) {
        var label = el.querySelector(".callout-label");
        if (label) splitLabel(label);

        if (REDUCED) {
          el.classList.add("is-in");
          return;
        }

        run(el);
        var loop = parseInt(el.getAttribute("data-loop"), 10) || 0;
        if (loop > 0) {
          // Replay once the previous cycle has fully settled.
          setInterval(function () {
            if (document.hidden) return;
            var rect = el.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;
            run(el);
          }, loop + 2400);
        }
      })(callouts[c]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
