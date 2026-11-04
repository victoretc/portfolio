// Фон первого экрана: топографические линии (WebGL/канвас из
// components/ui/backgrounds-topography). Сборка Vite кладёт бандл в static/app,
// вёрстка подключает app/hero-topography.js относительным путём.
import { createRoot } from "react-dom/client"

import { TopographyBackground } from "@/components/ui/backgrounds-topography"

const host = document.getElementById("hero-topography")

// Цвет линий можно переопределить из вёрстки: data-line-color="#c9c6be".
// По умолчанию — тёплый графит: тонкая карта рельефа под чёрным текстом.
const lineColor = host?.dataset.lineColor || "#c9c6be"

if (host) {
  createRoot(host).render(
    <TopographyBackground
      className="h-full w-full"
      lineColor={lineColor}
      levels={11}
      speed={0.8}
      peak={1}
      scale={1.9}
      interactive
    />,
  )
}
