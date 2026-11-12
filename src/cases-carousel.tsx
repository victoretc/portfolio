// Блок «Сделали» — кольцо карточек проектов (WebGL, components/ui/warp-carousel).
//
// Данные приходят из data/projects.yaml: страница отдаёт их рядом с разметкой
// в JSON, поэтому React и вёрстка читают один источник. Без JS остаётся
// статичная сетка карточек — она заменяется кольцом, когда скрипт загрузился.
//
// Сборка Vite кладёт бандл в static/app, вёрстка подключает app/cases-carousel.js.
import * as React from "react"
import { createRoot } from "react-dom/client"

import { WarpCarousel } from "@/components/ui/warp-carousel"

interface ProjectMedia {
  type: "video" | "image"
  src: string
  poster?: string
  alt?: string
}

interface Project {
  title: string
  url: string
  description: string
  stack: string
  media: ProjectMedia
}

/** Сцена кольца: узкая на телефоне (карточка крупнее, соседи уходят за край), широкая на десктопе. */
const STAGE_WIDE = 720
const STAGE_NARROW = 360

function Cases({ projects }: { projects: Project[] }) {
  const [index, setIndex] = React.useState(0)
  const [stageWidth, setStageWidth] = React.useState(STAGE_WIDE)

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)")
    const apply = () => setStageWidth(mq.matches ? STAGE_NARROW : STAGE_WIDE)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  // Статичная сетка — запасной вариант без JS. Как только кольцо собрано,
  // сетка убирается: кадры в ней крутили бы тот же ролик второй раз.
  React.useLayoutEffect(() => {
    document.querySelector("[data-cases-grid]")?.remove()
  }, [])

  const cards = React.useMemo(
    () =>
      projects.map((p) => ({
        title: p.title,
        value: "",
        description: p.description,
        stack: p.stack,
        media: p.media,
      })),
    [projects],
  )

  return (
    <WarpCarousel
      className="cases-ring"
      cards={cards}
      index={index}
      onIndexChange={setIndex}
      onFrontCardClick={(i) => {
        const p = projects[i]
        if (p) window.open(p.url, "_blank", "noopener")
      }}
      autoplay
      interval={5.2}
      step={1}
      warp={0.14}
      background="#ffffff"
      glow="#ffffff"
      font='"Onest", "Helvetica Neue", Arial, sans-serif'
      stageWidth={stageWidth}
      layout="arc"
      // корневой элемент компонента задаёт себе min-height 420px: на телефоне
      // он вылезал за свою рамку и накрывал строку под кольцом
      style={{ minHeight: 0 }}
      ariaLabel="Проекты студии"
    />
  )
}

const dataEl = document.getElementById("cases-data")
const host = document.querySelector<HTMLElement>("[data-cases-carousel]")

if (host && dataEl) {
  try {
    const projects = JSON.parse(dataEl.textContent || "[]") as Project[]
    if (projects.length) createRoot(host).render(<Cases projects={projects} />)
  } catch (err) {
    console.warn("Не удалось прочитать данные блока «Сделали»", err)
  }
}
