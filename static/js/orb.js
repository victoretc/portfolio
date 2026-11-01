// LiveOrb — vanilla port of the 21st.dev React component.
// Evenly lit sphere with two capsule eyes that follow the pointer and
// glance around when it rests. Falls back to a CSS face without WebGL.
(function () {
  var ORB = { color: "#7C6AF7", eyeColor: "#0C0C10" }; // violet / foam / dust-rose wash base

  var VERT = [
    "attribute vec2 a_position;",
    "void main() {",
    "  gl_Position = vec4(a_position, 0.0, 1.0);",
    "}",
  ].join("\n");

  var FRAG = [
    "precision highp float;",
    "uniform vec2 u_resolution;",
    "uniform float u_time;",
    "uniform float u_speed;",
    "uniform vec2 u_look;",
    "uniform float u_blink;",
    "uniform vec3 u_body;",
    "uniform vec3 u_eye;",
    "float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }",
    "float noise(vec2 p) {",
    "  vec2 i = floor(p); vec2 f = fract(p);",
    "  float a = hash(i); float b = hash(i + vec2(1.0, 0.0));",
    "  float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;",
    "}",
    "float fbm(vec2 p) {",
    "  float v = 0.0; float a = 0.5;",
    "  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);",
    "  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }",
    "  return v;",
    "}",
    "vec3 orient(vec3 p, vec2 look) {",
    "  float yaw = look.x * 0.92; float pitch = -look.y * 0.78;",
    "  float cy = cos(yaw); float sy = sin(yaw);",
    "  float cp = cos(pitch); float sp = sin(pitch);",
    "  vec3 q = vec3(p.x, p.y * cp - p.z * sp, p.y * sp + p.z * cp);",
    "  return vec3(q.x * cy + q.z * sy, q.y, -q.x * sy + q.z * cy);",
    "}",
    "vec3 wash(vec3 n, float t) {",
    "  vec2 q = n.xy * 2.2 + n.z * 0.85;",
    "  vec2 w1 = vec2(fbm(q * 1.4 + vec2(t * 0.22, t * 0.18)), fbm(q * 1.4 + vec2(-t * 0.16, t * 0.24) + 4.1));",
    "  q += (w1 - 0.5) * 0.72;",
    "  float f = fbm(q * 2.1 + vec2(0.0, t * 0.12));",
    "  return mix(mix(u_body, vec3(0.49, 0.83, 0.78), smoothstep(0.28, 0.72, f)), vec3(0.91, 0.71, 0.83), pow(smoothstep(0.42, 0.9, fbm(q * 4.6 - vec2(t * 0.2, 0.0))), 1.4));",
    "}",
    "float eyeMask(vec3 n, vec3 e, vec3 right, vec3 up, float halfH, float rad) {",
    "  float facing = dot(n, e);",
    "  float x = dot(n, right) - dot(e, right);",
    "  float y = dot(n, up) - dot(e, up);",
    "  y -= clamp(y, -halfH, halfH);",
    "  float d = length(vec2(x, y)) - rad;",
    "  return (1.0 - smoothstep(-0.01, 0.01, d)) * smoothstep(0.12, 0.32, facing);",
    "}",
    "void main() {",
    "  vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;",
    "  float aspect = u_resolution.x / max(u_resolution.y, 1.0);",
    "  uv.x *= aspect;",
    "  float radius = 0.94;",
    "  vec2 p = uv / radius;",
    "  float r2 = dot(p, p);",
    "  float edge = 1.0 - smoothstep(0.985, 1.012, sqrt(max(r2, 0.0)));",
    "  if (edge <= 0.001) { gl_FragColor = vec4(0.0); return; }",
    "  float z = sqrt(max(1.0 - r2, 0.0));",
    "  vec3 n = normalize(vec3(p, z));",
    "  vec2 look = u_look;",
    "  float lm = length(look);",
    "  if (lm > 1.0) look /= lm;",
    "  vec3 right = orient(vec3(1.0, 0.0, 0.0), look);",
    "  vec3 up = orient(vec3(0.0, 1.0, 0.0), look);",
    "  vec3 eL = orient(normalize(vec3(-0.32, 0.08, 1.0)), look);",
    "  vec3 eR = orient(normalize(vec3(0.32, 0.08, 1.0)), look);",
    "  float halfH = mix(0.128, 0.012, u_blink);",
    "  float rad = mix(0.054, 0.062, u_blink);",
    "  float eyes = max(eyeMask(n, eL, right, up, halfH, rad), eyeMask(n, eR, right, up, halfH, rad));",
    "  vec3 body = wash(n, u_time * u_speed);",
    "  vec3 col = mix(body, u_eye, clamp(eyes, 0.0, 1.0));",
    "  gl_FragColor = vec4(clamp(col, 0.0, 1.0), edge);",
    "}",
  ].join("\n");

  function hexToRgb(hex) {
    var h = hex.replace("#", "").trim();
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return [0.96, 0.96, 0.96];
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function compile(gl, type, source) {
    var shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  var IDLE_MS = 3000;

  function createLiveOrb(root) {
    var canvas = root.querySelector("canvas");
    var fallback = root.querySelector(".orb-fallback");
    if (!canvas) return null;

    var gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) return null;

    var vs = null, fs = null, program = null, buf = null;
    var uResolution, uTime, uSpeed, uLook, uBlink, uBody, uEye;

    function initGl() {
      vs = compile(gl, gl.VERTEX_SHADER, VERT);
      fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      var prog = gl.createProgram();
      if (!prog) return false;
      program = prog;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, "a_position");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      uResolution = gl.getUniformLocation(prog, "u_resolution");
      uTime = gl.getUniformLocation(prog, "u_time");
      uSpeed = gl.getUniformLocation(prog, "u_speed");
      uLook = gl.getUniformLocation(prog, "u_look");
      uBlink = gl.getUniformLocation(prog, "u_blink");
      uBody = gl.getUniformLocation(prog, "u_body");
      uEye = gl.getUniformLocation(prog, "u_eye");
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.viewport(0, 0, canvas.width, canvas.height);
      return true;
    }

    if (!initGl()) return null;
    if (fallback) fallback.style.display = "none";

    var raf = 0, destroyed = false, lost = false, onScreen = true;
    var last = 0, clock = 0;
    var nextBlink = 1800 + Math.random() * 2400, blinkAt = -10000;
    var nextGlance = 600 + Math.random() * 900;
    var pointerAt = -Infinity;
    var look = { x: 0, y: 0.08 }, targetLook = { x: 0, y: 0.08 }, glance = { x: 0, y: 0.08 };
    var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = root.clientWidth, h = root.clientHeight;
      if (w <= 0 || h <= 0) return false;
      var width = Math.max(1, Math.floor(w * dpr));
      var height = Math.max(1, Math.floor(h * dpr));
      if (width === canvas.width && height === canvas.height) return false;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, canvas.width, canvas.height);
      return true;
    }

    function moving() {
      return onScreen && !mqReduce.matches && document.visibilityState !== "hidden";
    }

    function wake() {
      if (raf || destroyed || lost) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }

    function redraw() {
      if (destroyed || lost) return;
      cancelAnimationFrame(raf);
      raf = 0;
      last = performance.now();
      tick(last);
    }

    function tick(now) {
      raf = 0;
      if (lost) return;
      var dt = Math.min(50, Math.max(0, now - last));
      last = now;
      var live = moving();
      if (live) clock += dt;
      var reduce = mqReduce.matches;
      var time = clock / 1000;

      var steering = now - pointerAt < IDLE_MS;
      if (!steering && live && clock >= nextGlance) {
        var back = Math.random() < 0.3;
        glance.x = back ? 0 : (Math.random() * 2 - 1) * 0.8;
        glance.y = back ? 0.08 : (Math.random() * 2 - 1) * 0.5;
        nextGlance = clock + 900 + Math.random() * 2100;
      }
      var goal = steering ? targetLook : (reduce ? { x: 0, y: 0.08 } : glance);
      var ease = live ? (steering ? 0.16 : 0.1) : 1;
      look.x += (goal.x - look.x) * ease;
      look.y += (goal.y - look.y) * ease;

      if (!reduce && clock >= nextBlink) {
        blinkAt = clock;
        nextBlink = clock + 2200 + Math.random() * 3800;
      }
      var bt = (clock - blinkAt) / 1000;
      var b = 0;
      if (!reduce) {
        if (bt < 0.055) b = bt / 0.055;
        else if (bt < 0.1) b = 1;
        else if (bt < 0.18) b = 1 - (bt - 0.1) / 0.08;
      }

      var body = hexToRgb(ORB.color);
      var eye = hexToRgb(ORB.eyeColor);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduce ? 0 : time);
      gl.uniform1f(uSpeed, reduce ? 0 : 0.55);
      gl.uniform2f(uLook, look.x, look.y);
      gl.uniform1f(uBlink, b);
      gl.uniform3f(uBody, body[0], body[1], body[2]);
      gl.uniform3f(uEye, eye[0], eye[1], eye[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (live && !destroyed) raf = requestAnimationFrame(tick);
    }

    function onMove(e) {
      var rect = root.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      var dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      var dy = (rect.top + rect.height / 2 - e.clientY) / (rect.height / 2);
      targetLook.x = Math.min(1, Math.max(-1, dx));
      targetLook.y = Math.min(1, Math.max(-1, dy));
      pointerAt = performance.now();
      if (onScreen) wake();
    }
    window.addEventListener("pointermove", onMove, { passive: true });

    var ro = new ResizeObserver(function () { if (resize()) redraw(); });
    ro.observe(root);
    var io = new IntersectionObserver(function (entries) {
      onScreen = entries[0] ? entries[0].isIntersecting : true;
      wake();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", wake);
    mqReduce.addEventListener("change", wake);

    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      raf = 0;
      canvas.style.visibility = "hidden";
    });
    canvas.addEventListener("webglcontextrestored", function () {
      if (destroyed || !initGl()) return;
      lost = false;
      canvas.style.visibility = "";
      wake();
    });

    resize();
    wake();
    return { destroy: function () { destroyed = true; cancelAnimationFrame(raf); } };
  }

  function boot() {
    var roots = document.querySelectorAll("[data-orb]");
    for (var i = 0; i < roots.length; i++) createLiveOrb(roots[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
