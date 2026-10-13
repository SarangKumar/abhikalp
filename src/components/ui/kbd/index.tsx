import React from "react";

import { cn } from "@/lib/utils";

export type KbdProps = React.ComponentProps<"kbd">;

// Modifier and navigation glyphs (arrows U+2190–21FF, ⌘ ⌥ ⌃ ⏎ ⌫ … in
// U+2300–23FF). Fonts draw them at very different sizes, so common keys are
// drawn as SVGs whose strokes span the letters' cap height (the paths fill
// ~75% of their box, so the box is 0.9em); any other symbol falls back
// to a larger font size.
const symbolChar = /[\u2190-\u21ff\u2300-\u23ff]/u;
const symbolKey = /^[\u2190-\u21ff\u2300-\u23ff]+$/u;

// 24×24 stroke paths (lucide geometry).
const glyphPaths: Record<string, readonly string[]> = {
  "\u2318": [
    "M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3",
  ], // ⌘
  "\u21e7": ["M9 18v-6H5l7-7 7 7h-4v6H9z"], // ⇧
  "\u2325": ["M3 3h6l6 18h6", "M14 3h7"], // ⌥
  "\u2303": ["m18 15-6-6-6 6"], // ⌃
  "\u21b5": ["M20 4v7a4 4 0 0 1-4 4H4", "m9 10-5 5 5 5"], // ↵
  "\u23ce": ["M20 4v7a4 4 0 0 1-4 4H4", "m9 10-5 5 5 5"], // ⏎
  "\u232b": [
    "M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z",
    "m12 9 6 6",
    "m18 9-6 6",
  ], // ⌫
  "\u21e5": ["M17 12H3", "m11 18 6-6-6-6", "M21 5v14"], // ⇥
  "\u2190": ["m12 19-7-7 7-7", "M19 12H5"], // ←
  "\u2191": ["m5 12 7-7 7 7", "M12 19V5"], // ↑
  "\u2192": ["M5 12h14", "m12 5 7 7-7 7"], // →
  "\u2193": ["M12 5v14", "m19 12-7 7-7-7"], // ↓
};

function renderSymbol(char: string, key: number) {
  const paths = glyphPaths[char];

  if (!paths) {
    return (
      <span
        key={key}
        data-symbol-glyph=""
        className="font-sans text-[0.9375rem] leading-none"
      >
        {char}
      </span>
    );
  }

  // The character stays in the DOM (screen readers, copy); the SVG is the visual.
  return (
    <span key={key} data-symbol-glyph="" className="inline-flex">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-[0.9em] shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
      <span className="sr-only">{char}</span>
    </span>
  );
}

/**
 * Renders symbol characters at letter height. A mixed label such as "⌘K"
 * stays one key.
 */
function renderLabel(children: React.ReactNode) {
  if (typeof children !== "string" || !symbolChar.test(children)) {
    return children;
  }

  return Array.from(children).map((char, index) =>
    symbolChar.test(char) ? renderSymbol(char, index) : char,
  );
}

export function Kbd({ className, children, ref, ...props }: KbdProps) {
  const symbol = typeof children === "string" && symbolKey.test(children);

  return (
    <kbd
      ref={ref}
      data-symbol={symbol ? "" : undefined}
      className={cn(
        "border-border bg-muted text-foreground box-border inline-flex h-5 min-w-5 items-center justify-center gap-0.5 rounded-sm border px-1 font-mono text-xs leading-none",
        className,
      )}
      {...props}
    >
      {renderLabel(children)}
    </kbd>
  );
}

export type KbdGroupProps = React.ComponentProps<"kbd">;

/**
 * Groups separate keys of one shortcut, e.g. Ctrl + K as two keys. For a
 * compact single key such as "⌘K", use one Kbd.
 */
export function KbdGroup({ className, ref, ...props }: KbdGroupProps) {
  return (
    <kbd
      ref={ref}
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}
