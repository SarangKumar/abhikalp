import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { load } from "cheerio";

const MAX_BYTES = 2_000_000;
const MAX_TEXT = 50_000;

function isPrivateAddress(ip: string) {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    if (v.startsWith("::ffff:")) return isPrivateAddress(v.slice(7));
    return (
      v === "::1" ||
      v === "::" ||
      v.startsWith("fc") ||
      v.startsWith("fd") ||
      v.startsWith("fe80")
    );
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

export class ScrapeError extends Error {}

/** Parse and validate a user-supplied URL; rejects internal hosts (SSRF guard). */
export async function assertPublicUrl(raw: unknown): Promise<URL> {
  let url: URL;
  try {
    url = new URL(String(raw));
  } catch {
    throw new ScrapeError("Enter a valid URL, e.g. https://example.com");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new ScrapeError("Only http(s) URLs are supported");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    throw new ScrapeError("That host is not allowed");
  }
  const addresses = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true }).catch(() => {
        throw new ScrapeError("Could not resolve that host");
      });
  if (addresses.some((a) => isPrivateAddress(a.address))) {
    throw new ScrapeError("That host is not allowed");
  }
  return url;
}

/** Fetch a public page and return its title and readable text. */
export async function scrapePage(raw: unknown) {
  let url = await assertPublicUrl(raw);
  let res: Response | undefined;
  // Follow redirects manually so every hop passes the SSRF check.
  for (let hop = 0; hop < 5; hop++) {
    res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
      headers: { "user-agent": "Mozilla/5.0 (compatible; AbhikalpBot/1.0)" },
    }).catch(() => {
      throw new ScrapeError("Could not reach that page");
    });
    const next = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && next) {
      url = await assertPublicUrl(new URL(next, url));
      continue;
    }
    break;
  }
  if (!res || !res.ok)
    throw new ScrapeError(
      `The page responded with ${res?.status ?? "an error"}`
    );
  const type = res.headers.get("content-type") ?? "";
  if (!/text\/html|text\/plain|xhtml/.test(type)) {
    throw new ScrapeError("Only HTML or text pages can be scraped");
  }
  const body = await res.text();
  if (body.length > MAX_BYTES) throw new ScrapeError("That page is too large");

  const $ = load(body);
  const title = ($("title").first().text() || url.hostname)
    .trim()
    .slice(0, 200);
  $("script, style, iframe, noscript, svg, nav, footer, header, form").remove();
  const root = $("main").length
    ? $("main")
    : $("article").length
      ? $("article")
      : $("body");
  const content = root
    .text()
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_TEXT);

  return { url: url.toString(), title, content };
}
