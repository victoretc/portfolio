import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// @ — корень проекта (совпадает с paths в tsconfig.json и aliases в components.json)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  // Фоновые WebGL-эффекты собираются отдельными бандлами прямо в static/app:
  // Hugo копирует папку в public/app, вёрстка подключает файл по имени.
  // publicDir отключён: иначе Vite копирует весь public/ внутрь outDir,
  // и статика сайта размножается в static/app/app, static/app/css и т.д.
  publicDir: false,
  build: {
    outDir: "static/app",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        "hero-topography": fileURLToPath(
          new URL("./src/hero-topography.tsx", import.meta.url),
        ),
        "cases-carousel": fileURLToPath(
          new URL("./src/cases-carousel.tsx", import.meta.url),
        ),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
})
