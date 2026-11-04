import { cn } from "@/lib/utils";

interface HighlightTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: "lime" | "yellow" | "blue" | "pink" | "cyan" | "orange";
  /** Лёгкий наклон самого слова, в градусах. */
  rotate?: number;
}

const highlightVariants: Record<NonNullable<HighlightTextProps["variant"]>, string> = {
  lime: "bg-accent-green",
  yellow: "bg-yellow-300",
  blue: "bg-blue-300",
  pink: "bg-pink-300",
  cyan: "bg-cyan-300",
  orange: "bg-orange-300",
};

export function HighlightText({
  children,
  className,
  variant = "lime",
  rotate = 0,
}: HighlightTextProps) {
  return (
    <span
      className="relative inline-block px-[0.12em]"
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <span
        className={cn(
          "absolute inset-0 scale-x-110 scale-y-90 -skew-y-1 rounded-[0.16em]",
          highlightVariants[variant],
          className
        )}
        aria-hidden="true"
      />
      <span className="relative">{children}</span>
    </span>
  );
}

export default HighlightText;
