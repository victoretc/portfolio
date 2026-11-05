// Топографические линии (WebGL/канвас из components/ui/backgrounds-topography).
// Сборка Vite кладёт бандл в static/app, вёрстка подключает app/hero-topography.js.
//
// Хостов может быть несколько: первый экран и карточка услуги. Конфиг читаем
// из data-атрибутов, чтобы каждая зона настраивалась из разметки:
//   data-line-color="#eaeae5"  цвет линий
//   data-levels="11"           число уровней рельефа
//   data-scale="1.9"           масштаб рельефа
//   data-speed="0.8"           скорость течения
//   data-interactive="false"   отключить реакцию на курсор
import { createRoot } from "react-dom/client"

import { TopographyBackground } from "@/components/ui/backgrounds-topography"

function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return value !== undefined && Number.isFinite(parsed) ? parsed : fallback
}

const hosts = Array.from(document.querySelectorAll<HTMLElement>("[data-topography]"))

for (const host of hosts) {
  createRoot(host).render(
    <TopographyBackground
      className="h-full w-full"
      lineColor={host.dataset.lineColor || "#c9c6be"}
      levels={Math.round(readNumber(host.dataset.levels, 11))}
      speed={readNumber(host.dataset.speed, 0.8)}
      peak={readNumber(host.dataset.peak, 1)}
      scale={readNumber(host.dataset.scale, 1.9)}
      interactive={host.dataset.interactive !== "false"}
    />,
  )
}
