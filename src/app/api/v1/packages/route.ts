import { NextResponse } from "next/server";

import { getUserBySession } from "@/app/api/utils";
import { jsonError } from "@/lib/api";

export type NpmPackage = {
  name: string;
  version: string;
  description?: string;
  keywords?: string[];
  date?: string;
  links: { npm?: string; homepage?: string; repository?: string };
  publisher?: { username?: string };
  score: number;
  downloads?: number;
};

/** Search the public npm registry (no API key needed). */
export async function GET(req: Request) {
  const user = await getUserBySession();
  if (!user) return jsonError("Unauthorized", 401);
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 200);
  if (!q) return jsonError("Enter a search term");

  const res = await fetch(
    `https://registry.npmjs.org/-/v1/search?size=20&text=${encodeURIComponent(q)}`,
    { signal: AbortSignal.timeout(10_000), next: { revalidate: 3600 } }
  ).catch(() => null);
  if (!res?.ok)
    return jsonError("The npm registry is unavailable right now", 502);

  const data = (await res.json()) as {
    objects: {
      package: Omit<NpmPackage, "score" | "downloads">;
      score: { final: number };
      downloads?: { weekly?: number };
    }[];
  };
  const packages: NpmPackage[] = data.objects.map((o) => ({
    name: o.package.name,
    version: o.package.version,
    description: o.package.description,
    keywords: o.package.keywords?.slice(0, 6),
    date: o.package.date,
    links: o.package.links ?? {},
    publisher: o.package.publisher,
    score: o.score.final,
    downloads: o.downloads?.weekly,
  }));
  return NextResponse.json({ packages });
}
