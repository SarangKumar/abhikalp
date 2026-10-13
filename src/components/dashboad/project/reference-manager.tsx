"use client";

import { ExternalLink, Globe, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyIcon,
  EmptyTitle,
} from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/fetcher";
import { notify } from "@/lib/notify";

export type RefItem = {
  id: string;
  url: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function ReferenceManager({
  projectId,
  references,
  canEdit,
}: {
  projectId: string;
  references: RefItem[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(
    references[0]?.id ?? null
  );
  const endpoint = `/api/v1/projects/${projectId}/references`;
  const selected = references.find((r) => r.id === openId) ?? references[0];

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const ref = await api<RefItem>(endpoint, {
        method: "POST",
        body: { url },
      });
      setUrl("");
      setOpenId(ref.id);
      notify.success("Reference saved", ref.title);
      startTransition(() => router.refresh());
    } catch (error) {
      notify.error("Could not scrape that page", (error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    try {
      await api(`${endpoint}?id=${id}`, { method: "DELETE" });
      startTransition(() => router.refresh());
    } catch (error) {
      notify.error("Could not delete", (error as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="url"
            required
            aria-label="Page URL"
            placeholder="https://docs.example.com/guide"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="submit" disabled={busy} className="sm:w-40">
            {busy ? <Spinner /> : <Globe className="size-4" />}
            {busy ? "Scraping…" : "Scrape & save"}
          </Button>
        </form>
      )}

      {references.length === 0 ? (
        <Empty className="rounded-xl border border-dashed py-16">
          <EmptyIcon>
            <Globe />
          </EmptyIcon>
          <EmptyTitle>No references yet</EmptyTitle>
          <EmptyDescription>
            Paste a link to an article, API reference or spec. Its readable text
            is saved here and shared with the AI assistant as context.
          </EmptyDescription>
        </Empty>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
          <ul className="space-y-1">
            {references.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(r.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                    selected?.id === r.id
                      ? "border-primary/50 bg-primary/5"
                      : "hover:bg-muted/50 border-transparent"
                  }`}
                >
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {new URL(r.url).hostname}
                  </p>
                </button>
              </li>
            ))}
          </ul>
          {selected && (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="truncate">{selected.title}</CardTitle>
                  <CardDescription className="truncate">
                    Saved {new Date(selected.createdAt).toLocaleString()} ·{" "}
                    {selected.content.length.toLocaleString()} chars
                  </CardDescription>
                </div>
                <div className="flex shrink-0 gap-1">
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open original"
                    className={buttonVariants({
                      size: "icon-sm",
                      variant: "ghost",
                    })}
                  >
                    <ExternalLink className="size-4" />
                  </a>
                  {canEdit && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Delete reference"
                      onClick={() => remove(selected.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[55dvh]">
                  <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap">
                    {selected.content}
                  </p>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
