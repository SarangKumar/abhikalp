"use client";

import { Box, Check, Copy, Download, ExternalLink, Search } from "lucide-react";
import { useState } from "react";

import type { NpmPackage } from "@/app/api/v1/packages/route";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/fetcher";
import { notify } from "@/lib/notify";

const EXAMPLES = [
  "date formatting",
  "markdown editor react",
  "form validation",
  "drag and drop",
];

const compact = new Intl.NumberFormat("en", { notation: "compact" });

export default function PackageFinder() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NpmPackage[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function search(q: string) {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    try {
      const data = await api<{ packages: NpmPackage[] }>(
        `/api/v1/packages?q=${encodeURIComponent(q)}`
      );
      setResults(data.packages);
    } catch (error) {
      notify.error("Search failed", (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          search(query);
        }}
      >
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            aria-label="Describe what you need"
            className="pl-9"
            placeholder="Describe what you need, e.g. “parse csv in the browser”"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading} className="sm:w-32">
          {loading ? <Spinner /> : <Search />} Search
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <Button
            key={ex}
            size="xs"
            variant="secondary"
            onClick={() => search(ex)}
          >
            {ex}
          </Button>
        ))}
      </div>

      {loading && !results && (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      )}

      {results?.length === 0 && (
        <Empty className="rounded-xl border border-dashed py-16">
          <EmptyIcon>
            <Box />
          </EmptyIcon>
          <EmptyTitle>No packages found</EmptyTitle>
          <EmptyDescription>Try fewer or more general words.</EmptyDescription>
        </Empty>
      )}

      {results && results.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {results.map((pkg) => {
            const install = `npm i ${pkg.name}`;
            return (
              <Card key={pkg.name} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-sm">
                      {pkg.name}
                    </span>
                    <Badge variant="secondary">v{pkg.version}</Badge>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {pkg.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-3">
                  <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                    {pkg.downloads !== undefined && (
                      <span className="flex items-center gap-1">
                        <Download className="size-3" />{" "}
                        {compact.format(pkg.downloads)}/week
                      </span>
                    )}
                    {pkg.date && (
                      <span>
                        Updated {new Date(pkg.date).toLocaleDateString()}
                      </span>
                    )}
                    {pkg.publisher?.username && (
                      <span>by {pkg.publisher.username}</span>
                    )}
                  </div>
                  {pkg.keywords && pkg.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pkg.keywords.map((k) => (
                        <Badge
                          key={k}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {k}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 justify-between font-mono text-xs"
                      onClick={async () => {
                        await navigator.clipboard.writeText(install);
                        setCopied(pkg.name);
                      }}
                    >
                      {install}
                      {copied === pkg.name ? <Check /> : <Copy />}
                    </Button>
                    <a
                      href={
                        pkg.links.npm ??
                        `https://www.npmjs.com/package/${pkg.name}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${pkg.name} on npm`}
                      className={buttonVariants({
                        size: "icon-sm",
                        variant: "ghost",
                      })}
                    >
                      <ExternalLink />
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
