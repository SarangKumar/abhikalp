import { load } from "cheerio";

const cleanHtml = (html: string): string => {
  const $ = load(html);
  $("script, style, iframe, noscript, meta, link").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
};

export default cleanHtml;
