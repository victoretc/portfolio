// Фон первого экрана: небо с облаками (WebGL-шейдер из components/ui/cloud-shader).
// Сборка Vite кладёт бандл в static/app — Hugo копирует его в public/app,
// вёрстка подключает app/hero-clouds.js относительным путём (сайт живёт в подпапке).
import { createRoot } from "react-dom/client"

import { CloudShader } from "@/components/ui/cloud-shader"

import "./hero-clouds.css"

// Палитра под чёрный текст сайта: небо светло-голубое, облака белые.
// Тёмный фон съел бы контраст заголовка (#0a0a0a).
const host = document.getElementById("hero-clouds")

if (host) {
  createRoot(host).render(
    <CloudShader
      className="h-full w-full"
      speed={0.9}
      count={5}
      dpr={1.25}
      cloudColor="#ffffff"
      skyTopColor="#9dc2e8"
      skyBottomColor="#eaf3fc"
    />,
  )
}
