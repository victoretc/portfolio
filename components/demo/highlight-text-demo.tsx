import { HighlightText } from "@/components/ui/highlight-text";

export default function HighlightTextDemo() {
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center p-8">
      <p className="max-w-md text-center text-2xl font-semibold leading-relaxed text-foreground">
        <HighlightText rotate={-2.5}>Богатов</HighlightText>, студия разработки из{" "}
        <HighlightText variant="yellow" rotate={2.5}>
          Бреста
        </HighlightText>
      </p>
    </div>
  );
}
