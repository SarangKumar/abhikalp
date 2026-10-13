"use client";

import "@excalidraw/excalidraw/index.css";
import "./playground.css";

import { Check, Eye, TriangleAlert } from "lucide-react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/fetcher";

// Excalidraw touches window/document at import time: client only.
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground flex h-full items-center justify-center gap-2 text-sm">
        <Spinner /> Loading playground…
      </div>
    ),
  }
);

export type PlaygroundScene = {
  elements: Record<string, unknown>[];
  files: Record<string, Record<string, unknown>>;
  appState: { viewBackgroundColor?: string };
};
type Status = "idle" | "saving" | "saved" | "error";

const SAVE_DELAY = 1500;

/** Canvas colour matching the app background. Dark mode is derived by
 * Excalidraw's canvas inversion (tuned in playground.css). */
const APP_CANVAS_BG = "#ffffff";
/** Backgrounds we may replace; anything else was chosen by the user. */
const DEFAULT_BGS = new Set([undefined, "", "#ffffff", "#fff", "transparent"]);

export default function Playground({
  projectId,
  canEdit,
  initialScene,
  savedAt,
}: {
  projectId: string;
  canEdit: boolean;
  initialScene: PlaygroundScene | null;
  savedAt: string | null;
}) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const initialBg = initialScene?.appState?.viewBackgroundColor;
  const canvasBg = DEFAULT_BGS.has(initialBg) ? APP_CANVAS_BG : initialBg;
  const [status, setStatus] = useState<Status>(savedAt ? "saved" : "idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Signature of the last saved scene; primed by the first onChange (initial load).
  const last = useRef<string | null>(null);
  const pending = useRef<PlaygroundScene | null>(null);

  const flush = useCallback(async () => {
    const scene = pending.current;
    if (!scene) return;
    pending.current = null;
    setStatus("saving");
    try {
      await api(`/api/v1/projects/${projectId}/whiteboard`, {
        method: "PUT",
        body: scene,
      });
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, [projectId]);

  // Save on unmount / tab close so the last edits are not lost.
  useEffect(() => {
    const onHide = () => {
      if (!pending.current) return;
      navigator.sendBeacon?.(
        `/api/v1/projects/${projectId}/whiteboard`,
        new Blob([JSON.stringify(pending.current)], {
          type: "application/json",
        })
      );
    };
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      if (timer.current) clearTimeout(timer.current);
      void flush();
    };
  }, [flush, projectId]);

  const onChange = useCallback(
    (
      elements: readonly { isDeleted?: boolean }[],
      appState: { viewBackgroundColor?: string },
      files: Record<string, unknown>
    ) => {
      if (!canEdit) return;
      const live = elements.filter((e) => !e.isDeleted);
      const signature = JSON.stringify({
        elements: live,
        files,
        bg: appState.viewBackgroundColor,
      });
      if (last.current === null) {
        last.current = signature;
        return;
      }
      // Pointer moves, zoom and selection fire onChange too: only save real edits.
      if (signature === last.current) return;
      last.current = signature;
      pending.current = {
        elements: live as Record<string, unknown>[],
        files: files as PlaygroundScene["files"],
        appState: { viewBackgroundColor: appState.viewBackgroundColor },
      };
      setStatus("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), SAVE_DELAY);
    },
    [canEdit, flush]
  );

  return (
    <div className="abh-playground bg-background flex h-[calc(100svh-3rem)] flex-col">
      <div className="bg-background flex h-10 shrink-0 items-center justify-between gap-2 border-b px-4 text-xs">
        <p className="text-muted-foreground">
          Sketch ideas, flows and architecture for this project.
        </p>
        {!canEdit ? (
          <Badge variant="secondary" className="gap-1">
            <Eye className="size-3.5" /> View only
          </Badge>
        ) : status === "saving" ? (
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Spinner className="size-3.5" /> Saving…
          </span>
        ) : status === "error" ? (
          <span className="text-destructive flex items-center gap-1.5">
            <TriangleAlert className="size-3.5" /> Not saved, retrying on next
            change
          </span>
        ) : status === "saved" ? (
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Check className="size-3.5" /> Saved
          </span>
        ) : null}
      </div>
      <div className="relative min-h-0 flex-1" data-testid="playground">
        <Excalidraw
          theme={theme}
          viewModeEnabled={!canEdit}
          initialData={{
            elements: (initialScene?.elements ?? []) as never,
            files: (initialScene?.files ?? {}) as never,
            appState: {
              viewBackgroundColor: canvasBg,
            },
            scrollToContent: true,
          }}
          onChange={onChange as never}
          UIOptions={{
            canvasActions: { loadScene: canEdit, saveToActiveFile: false },
          }}
        />
      </div>
    </div>
  );
}
