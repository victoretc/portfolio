// Lanyard badge — vanilla port of the 21st.dev React component.
// Verlet rope strap drawn on canvas + HTML card that hangs and swings.
// Drag to swing; the card keeps a flat face, so the video inside it stays clipped.
(function () {
  var host = document.querySelector('[data-lanyard]');
  if (!host) return;
  var canvas = host.querySelector('[data-lanyard-canvas]');
  var card = host.querySelector('[data-lanyard-card]');
  var inner = host.querySelector('[data-lanyard-inner]');
  var ctx = canvas && canvas.getContext('2d');
  if (!canvas || !card || !inner || !ctx) return;

  var DISPLAY = '"Onest", "Helvetica Neue", Arial, sans-serif';
  var SCRIPT = '"Segoe Script", "Brush Script MT", "Snell Roundhand", cursive';

  var reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = reducedMq.matches;
  if (reducedMq.addEventListener) reducedMq.addEventListener('change', function (e) { reduced = e.matches; });

  // ---- rope maths --------------------------------------------------------
  function integrate(pts, dt, gravity, damping) {
    for (var k = 0; k < pts.length; k++) {
      var p = pts[k];
      if (!p.w) continue;
      var vx = (p.x - p.px) * damping;
      var vy = (p.y - p.py) * damping;
      p.px = p.x;
      p.py = p.y;
      p.x += vx;
      p.y += vy + gravity * dt * dt;
    }
  }

  function solve(pts, links, iterations) {
    for (var k = 0; k < iterations; k++) {
      for (var n = 0; n < links.length; n++) {
        var l = links[n];
        var a = pts[l[0]];
        var b = pts[l[1]];
        var ws = a.w + b.w;
        if (!ws) continue;
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        var d = Math.hypot(dx, dy) || 1e-6;
        var f = (d - l[2]) / (d * ws);
        a.x += dx * f * a.w;
        a.y += dy * f * a.w;
        b.x -= dx * f * b.w;
        b.y -= dy * f * b.w;
      }
    }
  }

  function swingAngle(top, bottom) {
    return Math.atan2(bottom.x - top.x, bottom.y - top.y);
  }

  // ---- strap artwork -----------------------------------------------------
  function drawMandala(c, cx, cy, r) {
    c.save();
    c.translate(cx, cy);
    c.lineWidth = Math.max(0.8, r * 0.018);
    var rings = [1, 0.9, 0.62, 0.26];
    for (var i = 0; i < rings.length; i++) {
      c.beginPath();
      c.arc(0, 0, r * rings[i], 0, Math.PI * 2);
      c.stroke();
    }
    for (var j = 0; j < 16; j++) {
      c.save();
      c.rotate((j / 16) * Math.PI * 2);
      c.beginPath();
      c.ellipse(0, -r * 0.76, r * 0.07, r * 0.13, 0, 0, Math.PI * 2);
      c.stroke();
      c.rotate(Math.PI / 16);
      c.beginPath();
      c.arc(0, -r * 0.95, r * 0.018, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
    for (var m = 0; m < 8; m++) {
      c.save();
      c.rotate((m / 8) * Math.PI * 2);
      c.beginPath();
      c.moveTo(0, -r * 0.26);
      c.bezierCurveTo(r * 0.12, -r * 0.4, r * 0.1, -r * 0.52, 0, -r * 0.6);
      c.bezierCurveTo(-r * 0.1, -r * 0.52, -r * 0.12, -r * 0.4, 0, -r * 0.26);
      c.stroke();
      c.restore();
    }
    c.beginPath();
    c.arc(0, 0, r * 0.07, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  function makeStrap(length, width, dpr, opts) {
    var c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(width * dpr));
    c.height = Math.max(1, Math.round(length * dpr));
    var g = c.getContext("2d");
    g.setTransform(0, dpr, -dpr, 0, c.width, 0);
    g.fillStyle = opts.color;
    g.fillRect(0, 0, length, width);
    g.fillStyle = opts.plain ? opts.color : opts.ink;
    g.strokeStyle = opts.plain ? opts.color : opts.ink;

    if (!opts.plain) {
      g.save();
      g.beginPath();
      g.rect(0, 0, length, width);
      g.clip();
      g.textBaseline = "middle";
      var scriptFont = "400 " + Math.round(width * 0.5) + "px " + SCRIPT;
      var labelFont = "700 " + Math.round(width * 0.36) + "px " + DISPLAY;
      g.font = scriptFont;
      var scriptW = g.measureText(opts.text).width;
      g.font = labelFont;
      var labelW = g.measureText(opts.label).width;
      var gap = width * 0.6;
      var x = width * 0.4;
      var flip = 1;
      while (x < length) {
        g.globalAlpha = 0.55;
        drawMandala(g, x + width * 1.3, width * (0.5 + flip * 0.28), width * 1.35);
        x += width * 2.8;
        g.globalAlpha = 0.95;
        g.font = scriptFont;
        g.fillText(opts.text, x, width * 0.52);
        x += scriptW + gap;
        if (opts.label) {
          g.font = labelFont;
          g.fillText("-  " + opts.label + "  -", x, width * 0.53);
          x += labelW + g.measureText("-    -").width + gap;
        }
        flip = -flip;
      }
      g.restore();
    }

    g.globalAlpha = 0.35;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(0, 1.5);
    g.lineTo(length, 1.5);
    g.moveTo(0, width - 1.5);
    g.lineTo(length, width - 1.5);
    g.stroke();
    return c;
  }

  // ---- state -------------------------------------------------------------
  var pts = [], links = [], left = [], right = [], low = [];
  var iB = 0, iT = 0, iC = 0;
  var strandRest = 1;
  var dpr = 1, W = 1, H = 1;
  var cw = 240, ch = 360, ringR = 8, clipH = 24, sw = 24, lowLen = 52, arm = 200;
  var strapTex = null, plainTex = null;
  var STEP = 1 / 120, GRAVITY = 2400, ITER = 18;
  var t = 0;
  var look = {
    text: host.getAttribute("data-strap-text") || "",
    label: host.getAttribute("data-strap-label") || "",
    color: host.getAttribute("data-strap-color") || "#141312",
    ink: host.getAttribute("data-ink-color") || "#e8dfcc",
  };

  function add(x, y, w) {
    pts.push({ x: x, y: y, px: x, py: y, w: w });
    return pts.length - 1;
  }

  function strand(from, to, n, slack) {
    var a = pts[from], b = pts[to];
    var rest = (Math.hypot(b.x - a.x, b.y - a.y) * slack) / n;
    var ids = [from];
    for (var i = 1; i < n; i++) ids.push(add(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n, 1));
    ids.push(to);
    for (var j = 0; j < n; j++) links.push([ids[j], ids[j + 1], rest]);
    return { ids: ids, rest: rest };
  }

  function readWidth() {
    var v = parseFloat(getComputedStyle(host).getPropertyValue("--ly-card-w"));
    return isFinite(v) && v > 80 ? v : 232;
  }

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, host.clientWidth);
    H = Math.max(1, host.clientHeight);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    cw = Math.round(readWidth());
    ch = Math.round(cw * 1.5);
    ringR = Math.max(7, Math.round(cw * 0.036));
    clipH = Math.round(cw * 0.1);
    sw = Math.max(14, Math.round(cw * 0.1));
    lowLen = sw * 2.2;
    arm = ringR * 2 + clipH + ch * 0.55;

    host.style.setProperty("--ly-s", (cw / 240).toFixed(4));
    host.style.setProperty("--ly-ring", ringR + "px");
    host.style.setProperty("--ly-clip", clipH + "px");
    /* Отступ лицевой стороны от верхнего края карточки: зажим цепляется
       ровно на столько выше, насколько карточка опущена под кольцом */
    host.style.setProperty("--ly-face-top", (ringR + clipH * 0.6).toFixed(1) + "px");
    card.style.width = cw + "px";
    card.style.height = ch + "px";
    inner.style.height = ch + "px";

    pts = [];
    links = [];
    var cx = W / 2;
    var spread = Math.min(cw * 0.62, W * 0.2);
    var top = -sw * 2;
    var cardTop = parseFloat(getComputedStyle(host).getPropertyValue("--ly-card-top")) || 148;
    var bY = Math.max(sw * 1.2, cardTop - lowLen - ringR);

    var aL = add(cx - spread, top, 0);
    iB = add(cx, bY, 1.4);
    var l = strand(aL, iB, 14, 1.03);
    var aR = add(cx + spread, top, 0);
    var r = strand(aR, iB, 14, 1.03);
    iT = add(cx, bY + lowLen, 0.8);
    var lo = strand(iB, iT, 3, 1);
    iC = add(cx, bY + lowLen + arm, 0.25);
    links.push([iT, iC, arm]);
    left = l.ids;
    right = r.ids;
    low = lo.ids;
    strandRest = l.rest;

    // Лента однотонная: без надписей и орнамента.
    var opts = { color: look.color, ink: look.ink, text: "", label: "", plain: true };
    strapTex = makeStrap(strandRest * 14 + 4, sw, dpr, opts);
    plainTex = makeStrap(lowLen + 4, sw * 0.8, dpr, { color: opts.color, ink: opts.ink, text: "", label: "", plain: true });

    if (reduced) {
      for (var i = 0; i < 900; i++) {
        integrate(pts, STEP, GRAVITY, 0.98);
        solve(pts, links, ITER);
      }
    } else {
      // Лёгкий толчок ремешка — бейдж слегка покачивается при загрузке
      pts[iC].x += cw * 0.55;
      pts[iC].px = pts[iC].x - 2;
    }
  }

  // ---- drawing -----------------------------------------------------------
  function ribbon(ids, tex, rest, light) {
    var Wt = tex.width;
    for (var i = 0; i < ids.length - 1; i++) {
      var a = pts[ids[i]];
      var b = pts[ids[i + 1]];
      var dx = (b.x - a.x) * dpr;
      var dy = (b.y - a.y) * dpr;
      var len = Math.hypot(dx, dy) || 1e-6;
      var tx = dx / len;
      var ty = dy / len;
      var nx = ty;
      var ny = -tx;
      var v0 = i * rest * dpr;
      var dv = rest * dpr;
      var k = len / dv;
      ctx.setTransform(nx, ny, tx * k, ty * k, a.x * dpr - (nx * Wt) / 2 - tx * k * v0, a.y * dpr - (ny * Wt) / 2 - ty * k * v0);
      var src = Math.min(dv + 1.5, tex.height - v0);
      if (src > 0) ctx.drawImage(tex, 0, v0, Wt, src, 0, v0, Wt, src);
      var shade = 0.22 * (1 - Math.max(0, nx * light));
      ctx.fillStyle = "rgba(0,0,0," + shade.toFixed(3) + ")";
      ctx.fillRect(0, v0, Wt, dv + 1);
    }
  }

  function metal(x0, y0, x1, y1) {
    var g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, "#f4efe4");
    g.addColorStop(0.45, "#b9b0a0");
    g.addColorStop(0.55, "#8f8778");
    g.addColorStop(1, "#ece6da");
    return g;
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!strapTex || !plainTex) return;
    ctx.imageSmoothingEnabled = true;
    ribbon(left, strapTex, strandRest, -1);
    ribbon(right, strapTex, strandRest, 1);
    ribbon(low, plainTex, lowLen / 3, 0);

    var B = pts[iB], T = pts[iT];
    var ang = Math.atan2(T.x - B.x, T.y - B.y);
    var u = sw / 20;
    ctx.setTransform(dpr, 0, 0, dpr, B.x * dpr, B.y * dpr);
    ctx.rotate(-ang);
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 6 * dpr;
    ctx.shadowOffsetY = 2 * dpr;
    ctx.fillStyle = metal(-16 * u, 0, 16 * u, 0);
    ctx.beginPath();
    ctx.roundRect(-15 * u, -14 * u, 30 * u, 17 * u, 3 * u);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-11 * u, 1 * u, 22 * u, 15 * u, [2 * u, 2 * u, 6 * u, 6 * u]);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "rgba(40,36,30,0.55)";
    ctx.fillRect(-10 * u, -9 * u, 20 * u, 2.2 * u);
    ctx.fillRect(-5 * u, 6 * u, 10 * u, 3 * u);
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 0.8 * u;
    ctx.beginPath();
    ctx.moveTo(-13 * u, -12.5 * u);
    ctx.lineTo(13 * u, -12.5 * u);
    ctx.stroke();

    ctx.setTransform(dpr, 0, 0, dpr, T.x * dpr, (T.y + ringR * 0.8) * dpr);
    ctx.lineWidth = Math.max(2.5, ringR * 0.38);
    ctx.strokeStyle = metal(-ringR, -ringR, ringR, ringR);
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.stroke();
  }

  function place() {
    var T = pts[iT], C = pts[iC];
    var swing = swingAngle(T, C);
    card.style.transform =
      "translate3d(" + (T.x - cw / 2).toFixed(2) + "px," + (T.y + ringR).toFixed(2) + "px,0) rotate(" + (-swing).toFixed(4) + "rad)";
  }

  // ---- interaction -------------------------------------------------------
  var drag = null;

  function local(e) {
    var r = host.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  function onDown(e) {
    if (e.button > 0) return;
    var xy = local(e);
    var T = pts[iT];
    drag = { id: e.pointerId, ox: T.x - xy[0], oy: T.y - xy[1], tx: T.x, ty: T.y, sx: xy[0], sy: xy[1], moved: false };
    pts[iT].w = 0;
    card.setPointerCapture(e.pointerId);
    card.style.cursor = "grabbing";
  }

  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var xy = local(e);
    drag.tx = xy[0] + drag.ox;
    drag.ty = xy[1] + drag.oy;
    if (Math.hypot(xy[0] - drag.sx, xy[1] - drag.sy) > 5) drag.moved = true;
  }

  function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    pts[iT].w = 0.8;
    card.style.cursor = "grab";
  }

  card.addEventListener("pointerdown", onDown);
  card.addEventListener("pointermove", onMove);
  card.addEventListener("pointerup", onUp);
  card.addEventListener("pointercancel", onUp);

  // ---- loop --------------------------------------------------------------
  var last = performance.now();
  var acc = 0;

  function tick(now) {
    acc += Math.min(0.05, (now - last) / 1000);
    last = now;
    var steps = 0;
    while (acc >= STEP && steps < 8) {
      acc -= STEP;
      steps++;
      t += STEP;
      if (drag) {
        var T = pts[iT];
        T.px = T.x;
        T.py = T.y;
        T.x += (drag.tx - T.x) * 0.35;
        T.y += (drag.ty - T.y) * 0.35;
      }
      var C = pts[iC];
      if (!reduced && !drag) {
        C.x += (22 * Math.sin(t * 0.7) + 12 * Math.sin(t * 1.9)) * STEP * STEP;
      }
      integrate(pts, STEP, GRAVITY, 0.992);
      solve(pts, links, ITER);
    }
    draw();
    place();
    requestAnimationFrame(tick);
  }

  build();
  draw();
  place();
  requestAnimationFrame(tick);

  // Видео в окне бейджа: сначала тянется, потом — с паузой — играет.
  // Пока грузится, на странице висит чёрный круг-лоадер.
  var photo = card.querySelector('.ly-photo__media');
  var loader = document.querySelector('[data-loader]');

  function hideLoader() {
    if (!loader || loader.classList.contains('is-done')) return;
    loader.classList.add('is-done');
    window.setTimeout(function () {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 300);
  }

  if (photo) {
    photo.load();
    var onReady = function () {
      hideLoader();
      if (reduced) return;
      window.setTimeout(function () {
        var p = photo.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      }, 2600);
    };
    if (photo.readyState >= 3) onReady();
    else photo.addEventListener('canplay', onReady, { once: true });
    photo.addEventListener('error', function () { hideLoader(); }, { once: true });
  } else {
    hideLoader();
  }
  // Страховка: лоадер не должен залипать ни при каких обстоятельствах
  window.setTimeout(hideLoader, 6000);

  var observer = new ResizeObserver(function () {
    if (Math.abs(host.clientWidth - W) < 1 && Math.abs(host.clientHeight - H) < 1) return;
    build();
    draw();
    place();
  });
  observer.observe(host);
})();
