// Блок «Сделали» — карточки проектов.
//
// Данные приходят из data/projects.yaml: страница отдаёт их рядом с разметкой
// в JSON, поэтому React и вёрстка читают один источник. Без JS остаётся
// статичная сетка карточек — она заменяется содержимым, когда скрипт загрузился.
//
// Два вида одной и той же карточки:
//   • на десктопе — кольцо (WebGL, components/ui/warp-carousel): карточки
//     уходят в перспективу и обрезаются краем экрана;
//   • на телефоне — нативная горизонтальная лента со снапом: свайп, одна
//     карточка в фокусе, без 3D-сцены. Кольцо на узком экране показывало
//     обрезанных соседей и цветные каёмки от линзы — на тач-экране это
//     читалось как артефакт, а свайп понятнее и дешевле по батарее.
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
  media: ProjectMedia
}

/** Ширина сцены кольца на десктопе. */
const STAGE_WIDE = 720
/** До этой ширины кольцо заменяется лентой. */
const STRIP_QUERY = "(max-width: 760px)"

/** Круглая стрелка «открыть сайт»; символ объявлен в partials/svg-symbols.html. */
function Arrow() {
  return (
    <span className="project-card__arrow" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <use href="#ext-link" />
      </svg>
    </span>
  )
}

/** Кадр проекта в ленте: постер сразу, ролик — только когда карточка на экране. */
function StripMedia({ media }: { media: ProjectMedia }) {
  const videoRef = React.useRef<HTMLVideoElement>(null)

  React.useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (!("IntersectionObserver" in window)) {
      v.src = media.src
      v.play().catch(() => {})
      return
    }
    // ролик не грузим, пока карточка не показалась: в ленте их несколько
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!(entry.target instanceof HTMLVideoElement)) return
          if (entry.isIntersecting) {
            if (!entry.target.getAttribute("src")) {
              entry.target.src = media.src
              entry.target.load()
            }
            entry.target.play().catch(() => {})
          } else {
            entry.target.pause()
          }
        })
      },
      { threshold: 0.5 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [media.src])

  if (media.type === "video") {
    return (
      <video
        ref={videoRef}
        className="project-card__media"
        poster={media.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={media.alt}
      />
    )
  }
  return (
    <img
      className="project-card__media"
      src={media.src}
      alt={media.alt || ""}
      loading="lazy"
      decoding="async"
    />
  )
}

/** Горизонтальная лента карточек для телефона: свайп и снап, без 3D-сцены. */
function CasesStrip({ projects }: { projects: Project[] }) {
  return (
    <div className="cases-strip" aria-label="Проекты студии">
      {projects.map((p) => (
        <a
          key={p.url}
          className="project-card project-card--strip"
          href={p.url}
          target="_blank"
          rel="noopener"
          aria-label={`${p.title} — ${p.description} Открыть сайт`}
        >
          <span className="project-card__visual">
            <StripMedia media={p.media} />
          </span>
          <span className="project-card__text">
            <span className="project-card__head">
              <span className="project-card__title">{p.title}</span>
              <Arrow />
            </span>
            <span className="project-card__description">{p.description}</span>
          </span>
        </a>
      ))}
    </div>
  )
}

function Cases({ projects }: { projects: Project[] }) {
  const [index, setIndex] = React.useState(0)
  // На телефоне кольцо не монтируем вовсе: решение принимается до первого
  // рендера, иначе WebGL-сцена успевает подняться и сразу заменяется лентой.
  const [strip, setStrip] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia(STRIP_QUERY).matches,
  )

  React.useEffect(() => {
    const mq = window.matchMedia(STRIP_QUERY)
    const apply = () => setStrip(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  // Лента выше сцены кольца: её высоту задаёт содержимое, а не clamp.
  React.useLayoutEffect(() => {
    const host = document.querySelector("[data-cases-carousel]")
    host?.classList.toggle("cases-carousel--strip", strip)
  }, [strip])

  // Статичная сетка — запасной вариант без JS. Как только содержимое собрано,
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
        media: p.media,
      })),
    [projects],
  )

  if (strip) return <CasesStrip projects={projects} />

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
      stageWidth={STAGE_WIDE}
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
