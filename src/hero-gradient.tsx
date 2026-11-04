// Фон первого экрана: живые градиентные волны (WebGL из components/ui/gradient-wave).
// Сборка Vite кладёт бандл в static/app — Hugo копирует его в public/app,
// вёрстка подключает app/hero-gradient.js относительным путём (сайт живёт в подпапке).
import { createRoot } from "react-dom/client"

import { GradientWave } from "@/components/ui/gradient-wave"

// Палитра взята из сайта: бумажный фон, лаванда (--field-1), акцентный розовый
// (--accent) и жёлтый (--field-3). Цвета сильно разбелены: под чёрным текстом
// и цветными маркерами заголовка нужна спокойная подложка, а не постер.
const FALLBACK_COLORS = ["#f7f7f5", "#fceef4", "#f6dae8"]

const host = document.getElementById("hero-gradient")

// Палитру можно переопределить из вёрстки: data-colors="#f7f7f5,#dcdcd8,#c9cad3"
const COLORS = host?.dataset.colors
  ? host.dataset.colors.split(",").map((c) => c.trim()).filter(Boolean)
  : FALLBACK_COLORS

if (host) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  createRoot(host).render(
    <GradientWave
      className="h-full w-full"
      colors={COLORS}
      isPlaying={!reduceMotion}
      noiseSpeed={0.000012}
      noiseFrequency={[0.000085, 0.00034]}
      deform={{ incline: 0.42, noiseAmp: 280, noiseFlow: 4, noiseSpeed: 9 }}
    />,
  )
}
