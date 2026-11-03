# Шарики (balloons-js) — как устроено и как настроить

Эффект шариков подключён в двух местах:

| Слой | Файл | Что делает |
| --- | --- | --- |
| Живой сайт (Hugo) | `static/js/balloons.js` + `static/js/vendor/balloons-js.esm.js` | Шарики поднимаются сами, когда пользователь доходит до «Расскажите о задаче» в футере |
| React-компонент (shadcn) | `components/ui/balloons.tsx`, `components/ui/button.tsx`, `components/ui/toggle.tsx` | То же самое как React-компонент |

---

## 1. Живой сайт (Hugo)

Ничего настраивать не нужно: файл `static/js/balloons.js` подключён в
`layouts/baseof.html`, триггер — лид футера в `layouts/home.html`:

```html
<p class="footer-lead" data-balloons="default">
  <span class="footer-lead__mark">Расскажите</span> о задаче — ответим в течение рабочего дня
</p>
```

### Как это работает

1. `IntersectionObserver` следит за каждым элементом с `data-balloons` с полосой
   `-45% 0px -45% 0px` — срабатывает, когда элемент пересекает середину экрана,
   то есть ровно в момент, когда пользователь до него доходит (а не когда он
   просто мелькнул на краю).
2. У каждого триггера своё состояние: сработал один раз — и больше не стреляет.
   Триггеров может быть сколько угодно, на каждом месте шарики свои.
3. Библиотека `balloons-js` (53 КБ) подгружается лениво — `import()` только в
   момент запуска, до этого её нет в сетевых запросах.
4. При `prefers-reduced-motion: reduce` эффект не запускается вовсе.

### Настройки через data-атрибуты

```html
<!-- обычные шарики (по умолчанию) -->
<p data-balloons="default">

<!-- шарики с текстом -->
<p data-balloons="text"
   data-balloons-text="Богатов"
   data-balloons-font-size="120"
   data-balloons-color="#d0106f">

<!-- выключить эффект -->
<p data-balloons="off">
```

Чтобы вернуть эффект на кейсы, добавь атрибут секции в `layouts/home.html`:

```html
<section class="chapter cases" id="cases" data-balloons="default">
```

Ручной запуск из консоли:

```js
Balloons.launch()                                  // обычные шарики
Balloons.launch({ type: 'text', text: 'Богатов', color: '#d0106f' })
Balloons.reset()                                   // разрешить автозапуск снова
```

`Balloons.launch()` возвращает промис, который резолвится в конце анимации
(шары висят на экране ~25–30 секунд — длительность задана внутри
`balloons-js`, параметров у неё нет). Ждать его обычно не нужно.

### Почему библиотека лежит в `static/js/vendor/`

Workflow деплоя (`.github/workflows/deploy.yml`) запускает только `hugo` —
`npm install` на сервере не выполняется. Поэтому `balloons-js` пришлось
закоммитить в `static/`, иначе на GitHub Pages эффект не работал бы.

---

## 2. React-часть (shadcn / Tailwind / TypeScript)

Репозиторий — Hugo-сайт, React-стека в нём изначально не было. React-часть
добавлена как отдельный мини-проект в корне, чтобы компонент из промпта
лежал ровно там, где его ждёт shadcn.

### Что уже есть

```
components.json          конфиг shadcn CLI (style: new-york, aliases @/*)
tsconfig.json            TypeScript, paths: { "@/*": ["./*"] }
vite.config.ts           алиас @ → корень проекта
package.json             зависимости и скрипты
lib/utils.ts             cn() — clsx + tailwind-merge
components/ui/           balloons.tsx, button.tsx, toggle.tsx
components/demo/         default-balloons-demo.tsx
src/                     точка входа Vite + Tailwind v4 (tokens shadcn)
```

### Запуск

```bash
npm install
npm run dev        # Vite, http://localhost:5173 — демо с кнопкой и автозапуском
npm run build      # tsc --noEmit && vite build
npm run typecheck
npm run hugo       # сайт на http://localhost:1414
```

### Если бы проект разворачивался с нуля

```bash
# 1. Next.js / Vite + TypeScript
npx create-next-app@latest . --ts --tailwind --app   # или create-vite (react-ts)
npx create-vite@latest . --template react-ts

# 2. Tailwind (v4 — ставится вместе с create-*; вручную: npm i -D tailwindcss @tailwindcss/vite)
npm install -D tailwindcss @tailwindcss/vite
#    и плагин в vite.config.ts: tailwindcss() из "@tailwindcss/vite"

# 3. shadcn CLI
npx shadcn@latest init
npx shadcn@latest add button toggle

# 4. зависимости компонента
npm install balloons-js @radix-ui/react-slot @radix-ui/react-toggle class-variance-authority
```

`shadcn init` спрашивает стиль (new-york), базовый цвет и css-переменные —
ответы записываются в `components.json`, а сами компоненты кладёт в
`components/ui/`. То, что уже лежит в этом репозитории, повторяет эту
структуру.

### Почему папка `components/ui` — это важно

* **Это то, что ищет shadcn CLI.** `components.json` указывает
  `aliases.ui: "@/components/ui"`. Команда `npx shadcn@latest add button`
  положит файл именно туда. Если папки нет или она называется иначе —
  CLI либо переспросит путь, либо положит файл в другое место, и все
  импорты `@/components/ui/...` разъедутся.
* **Компоненты — копируемый код, а не пакет.** shadcn не ставит библиотеку
  в `node_modules`: CLI копирует исходник в проект. Значит, путь
  `components/ui/xxx.tsx` — это и есть «адрес» компонента в коде. Переносить
  компонент между проектами — значит копировать этот файл.
* **Один стиль на всю библиотеку.** В `components/ui/` живут только
  примитивы (кнопка, тумблер, инпут), а в `components/` — блоки, собранные
  из них. Иначе через полгода в проекте будет два `Button` из двух папок.
* **Алиас `@/` работает одинаково.** С `@/components/ui/balloons` в любом
  файле проекта — TypeScript, Vite и shadcn CLI резолвят один и тот же путь.

### API компонента

```tsx
<Balloons
  ref={ref}              // ref даёт метод launchAnimation()
  type="default"         // "default" — обычные шарики, "text" — шарики с текстом
  text="Богатов"         // для type="text"
  fontSize={120}         // размер шрифта для type="text"
  color="#d0106f"        // цвет текста для type="text"
  className="..."        // класс на корневом div
  onLaunch={() => {}}    // колбэк после запуска
/>
```

Тип рефа — `BalloonsHandle` (`{ launchAnimation: () => void }`), а не
`HTMLDivElement`: в исходном промпте реф был типизирован как `HTMLDivElement`,
хотя наружу отдаётся метод `launchAnimation` — это не свойство DOM-узла и
не проходило проверку типов. Сам `useImperativeHandle` тоже не должен
спредить `containerRef.current` в объект хендла.
