import { useCallback, useEffect, useRef } from "react"

import { Balloons, type BalloonsHandle } from "@/components/ui/balloons"
import { Button } from "@/components/ui/button"

export function DefaultBalloonsDemo() {
  const balloonsRef = useRef<BalloonsHandle | null>(null)
  const ctaRef = useRef<HTMLElement | null>(null)
  const firedRef = useRef(false)

  const handleLaunch = useCallback(() => {
    balloonsRef.current?.launchAnimation()
  }, [])

  // Шарики поднимаются сами, когда пользователь доходит до «Расскажите о задаче».
  useEffect(() => {
    const el = ctaRef.current
    if (!el) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return

    if (!("IntersectionObserver" in window)) {
      handleLaunch()
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !firedRef.current) {
            firedRef.current = true
            io.unobserve(entry.target)
            handleLaunch()
          }
        })
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [handleLaunch])

  return (
    <div className="flex min-h-screen flex-col">
      <section className="flex min-h-[80vh] flex-col items-center justify-center gap-4 p-4">
        <Button onClick={handleLaunch} className="bg-blue-500 hover:bg-blue-600">
          Launch Balloons! 🎈
        </Button>

        <Balloons ref={balloonsRef} type="default" />
      </section>

      <section
        ref={ctaRef}
        id="cta"
        className="flex min-h-[80vh] flex-col items-center justify-center gap-4 bg-white p-4"
      >
        <p className="max-w-[22ch] text-3xl font-medium tracking-tight">
          Расскажите о задаче — ответим в течение рабочего дня
        </p>
      </section>
    </div>
  )
}
