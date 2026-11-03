Посмотреть как они себя позиционируют: 
1. https://bitre.by/ 
2. https://sakura-web.by/brest/


Чуть расскажу о себе. Что мы делаем в общем: 

1. Лендинг
2. Интернет магазин 
3. Telegram бот 
4. Сложное решение под ключ 

Экраны

Главный экран 
Заголовок - Сайт, который приводит клиентов, а не украшает интернет
Остальной текст Дизайн, код и запуск - 2 человека. Шесть лет разработки, фиксированная цена, работа напрямую без менеджеров.
Кейсы
Услуги
Услуги 
ЧТо входит в работу 
Структура страницы
Разбираемся, какие вопросы есть у ваших клиентов, и выстраиваем блоки в том порядке, в котором они их задают.
Дизайн под ваш бизнес
Типографика, цвет, изображения и акценты — из вашей сферы, а не из шаблона. Дизайном занимается дизайнер, а не разработчик между делом.
Мобильная версия
Проверяем на реальных телефонах: читаемость текста, размер кнопок, скорость загрузки.
Стоимость и сроки 
Базовое SEO
Заголовок и описание страницы, структура заголовков, технические файлы для поисковиков.
Разработка и вёрстка
Собираем страницу, подключаем аналитику, проверяем ссылки и отправку формы.
Запуск
Помогаем с доменом и хостингом, публикуем сайт и показываем, как им пользоваться.

Карточка
Лендинг
900 BYN
5 рабочих дней после согласования задачи и получения материалов.
Как работаем 

Делаем интернет-магазины, Telegram-ботов и сложные системы под задачу. Такие проекты считаем индивидуально: объём, срок и цена зависят от логики. Напишите, что нужно, — предложим решение и назовём вилку.
Обсудить задачу →
Футер



http://localhost:64733/

Задачи: 
1. Используй мои текущие шрифты с главной страницы для Расскажите о задаче — ответим в течение рабочего дня. Для кнопки написать добавь TG значок как на главной. Где нибудь так же добавь Говорят, что на большую кнопку хочется кликнуть.
2. You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
balloons.tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { balloons, textBalloons } from "balloons-js"

export interface BalloonsProps {
  type?: "default" | "text"
  text?: string
  fontSize?: number
  color?: string
  className?: string
  onLaunch?: () => void
}

const Balloons = React.forwardRef<HTMLDivElement, BalloonsProps>(
  ({ type = "default", text, fontSize = 120, color = "#000000", className, onLaunch }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null)
    
    const launchAnimation = React.useCallback(() => {
      if (type === "default") {
        balloons()
      } else if (type === "text" && text) {
        textBalloons([
          {
            text,
            fontSize,
            color,
          },
        ])
      }
      
      if (onLaunch) {
        onLaunch()
      }
    }, [type, text, fontSize, color, onLaunch])

    // Экспортируем метод запуска анимации
    React.useImperativeHandle(ref, () => ({
      launchAnimation,
      ...(containerRef.current || {})
    }), [launchAnimation])

    return <div ref={containerRef} className={cn("balloons-container", className)} />
  }
)
Balloons.displayName = "Balloons"

export { Balloons }

demo.tsx
import { Balloons } from "@/components/ui/balloons"
import { Button } from "@/components/ui/button"
import { useRef } from "react"

export function DefaultBalloonsDemo() {
  const balloonsRef = useRef<{ launchAnimation: () => void } | null>(null)

  const handleLaunch = () => {
    if (balloonsRef.current) {
      balloonsRef.current.launchAnimation()
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">      
      <Button 
        onClick={handleLaunch}
        className="bg-blue-500 hover:bg-blue-600"
      >
        Launch Balloons! 🎈
      </Button>

      <Balloons 
        ref={balloonsRef}
        type="default"
      />
    </div>
  )
}
```

Copy-paste these files for dependencies:
```tsx
originui/button
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm shadow-black/5 hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm shadow-black/5 hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm shadow-black/5 hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm shadow-black/5 hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

export default Button;

```
```tsx
shadcn/toggle
"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }

```

Install NPM dependencies:
```bash
balloons-js, @radix-ui/react-slot, class-variance-authority, @radix-ui/react-toggle
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them 

Добавь когда мы переходим на ккейсы, чтоб этот эффект автоматически появлялся
Пересмотри мой промпт и сделай то что написано 
3. @better-ui Полностью передезайни услуги в теукщем дизайн сайта

Услуги 
ЧТо входит в работу 
Структура страницы
Разбираемся, какие вопросы есть у ваших клиентов, и выстраиваем блоки в том порядке, в котором они их задают.
Дизайн под ваш бизнес
Типографика, цвет, изображения и акценты — из вашей сферы, а не из шаблона. Дизайном занимается дизайнер, а не разработчик между делом.
Мобильная версия
Проверяем на реальных телефонах: читаемость текста, размер кнопок, скорость загрузки.
Стоимость и сроки 
Базовое SEO
Заголовок и описание страницы, структура заголовков, технические файлы для поисковиков.
Разработка и вёрстка
Собираем страницу, подключаем аналитику, проверяем ссылки и отправку формы.
Запуск
Помогаем с доменом и хостингом, публикуем сайт и показываем, как им пользоваться.

Карточка
Лендинг
900 BYN
5 рабочих дней после согласования задачи и получения материалов.
Как работаем 

Делаем интернет-магазины, Telegram-ботов и сложные системы под задачу. Такие проекты считаем индивидуально: объём, срок и цена зависят от логики. Напишите, что нужно, — предложим решение и назовём вилку.
Обсудить задачу →
Футер 

Для текстов используй 

НЕ используй старые паттерны 
Используй современные паттерны дизайна. Не используй вообще старый дизайн, который будешь переделывать.  



ЦВЕТОК МОЖНО ЧУТЬ УМЕНЬШИЬ И ПОСТАВТЬ ПОСЛЕ Сайт, который приводит клиентов, а не украшает интернет, чтобы подчеркнуть идею про украшения 


Сайт, который приводит клиентов, а не украшает интернет.

Связаться
Дизайн и тексты пишем под ваш бизнес, а не переписываем из шаблона. Шесть лет в разработке.

Вы общаетесь напрямую с разработчиком и дизайнером — без менеджеров между вами и результатом.

Готовый сайт, который не стыдно отправить клиенту. Изучаем, кто ваш клиент и что мешает ему нажать «Купить».