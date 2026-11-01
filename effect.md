# Эффект появления карточек при скролле (cosinuslena.ru)

Источник: https://cosinuslena.ru/ (сайт собран на Framer). Разобрано вживую — запись смены inline-стилей покадрово во время скролла.

## Как это выглядит

При скролле вниз карточки не просто проявляются — они выезжают снизу, как будто выныривают из-за нижней кромки своего блока (из экрана/паза), и одновременно набирают непрозрачность. Входы идут каскадом: каждая следующая карточка стартует чуть позже предыдущей.

## Техническая разборка (два слоя)

### 1. Появление — «slide up + fade»

Исходное состояние элемента (ждёт входа во вьюпорт):

```
will-change: transform; opacity: 0; transform: translateY(50px);
```

Когда карточка попадает в зону видимости, анимация доводит до `opacity: 1; translateY(0)`.

- смещение: 50px вверх
- кривая: затухающая (ease-out / пружина), не равномерная — за первые ~300 мс проходит около 40% пути, дальше «доезжает» длинным хвостом
- суммарная длительность: ~1–1.5 с
- у всех карточек параметры одинаковые, запуск каскадом (stagger)

Покадровые данные (opacity / translateY):

```
t=266   0.005  49.79px
t=309   0.094  45.32px
t=408   0.292  35.42px
t=541   0.494  25.31px
t=709   0.668  16.59px
t=908   0.800  10.01px
t=974   0.831   8.47px
```

### 2. Ощущение «выезжает из экрана» — clip-mask + perspective

- У обёртки карточки стоит `overflow: clip` и `border-radius: 8px`. Контейнер обрезает содержимое, поэтому карточка не едет по фону, а выныривает из-за нижней кромки своего блока.
- На самих карточках — `perspective(800px)` с лёгким `translateY`, привязанным к скроллу: параллакс-«дыхание», из-за которого плоскость кажется объёмной. Финальные состояния пишутся как
  `transform: perspective(800px) translateX(0px) translateY(...) rotateX(0deg) rotateZ(0deg)`.

## Названия эффекта

- общий термин: **scroll reveal**, вариант **fade in up / slide up**
- в Framer: **Appear on Scroll, direction: from bottom**
- ключевые ингредиенты ощущения: **clip-mask контейнер** + **perspective-параллакс** + **stagger-каскад**

## Реализация на CSS

```css
.card {
  overflow: clip;
  border-radius: 8px;
}
.card__inner {
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 1.2s cubic-bezier(.16, 1, .3, 1),
              transform 1.2s cubic-bezier(.16, 1, .3, 1);
}
.card.is-visible .card__inner {
  opacity: 1;
  transform: none;
}
```

`cubic-bezier(.16,1,.3,1)` (expo-out) даёт тот же характер: резкий старт, длинный затухающий хвост.

## JS-триггер (IntersectionObserver)

```js
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('is-visible'), i * 80);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.card').forEach((card) => io.observe(card));
```

## Параллакс с perspective (второй слой)

```css
.card {
  transform: perspective(800px) translateY(calc(var(--scroll-shift, 0) * 1px));
}
```

Значение `--scroll-shift` обновляется на скролле: карточка чуть «дышит», смещаясь на несколько пикселей относительно страницы.

## В других инструментах

- **Framer**: включить Appear on Scroll на компонент, direction — снизу; stagger задаётся на контейнере
- **React + Framer Motion**: `whileInView` со `staggerChildren`
- **AOS / GSAP ScrollTrigger**: `data-aos="fade-up"` / `gsap.from(el, { y: 50, opacity: 0 })`
- **Vanilla**: IntersectionObserver + CSS-переход (код выше)

## Чек-лист повторения

1. Обёртка карточки: `overflow: clip; border-radius: 8px`
2. Внутренний слой: `opacity: 0; transform: translateY(50px)`
3. Переход: expo-out, ~1.2 с, opacity + transform
4. Триггер: IntersectionObserver, threshold ~0.2
5. Каскад: задержка 60–100 мс на карточку
6. Опционально: `perspective(800px)` + мелкий параллакс-сдвиг на скролле
7. Уважать `prefers-reduced-motion: reduce` — отключать сдвиги, оставлять только opacity
