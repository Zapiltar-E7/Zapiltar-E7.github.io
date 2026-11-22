// Typed access to site.json (edit the content with the editor: double-click "Edit site.cmd").
import data from "./site.json";
import { socialIcons, skillIcons } from "./icons";

export interface Social { icon: string; label: string; url: string }
export interface Card { title: string; status: string; image: string; url: string; codeUrl: string }

export const site = data;

const base = import.meta.env.BASE_URL;

/** Local images ("images/x.png") get the site base; full URLs pass through. */
export function asset(src: string): string {
  if (!src) return "";
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
  return base + src.replace(/^\/+/, "");
}

/** Social link as an href: bare emails become mailto:, bare domains get https://. */
export function socialHref(s: Social): string {
  const u = s.url.trim();
  if (/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(u)) return "mailto:" + u;
  if (/^(https?:|mailto:)/i.test(u)) return u;
  return "https://" + u;
}

export function socialSvg(icon: string, cls = "size-8"): string {
  const paths = socialIcons[icon] ?? socialIcons.link;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="${cls}">${paths}</svg>`;
}

export function skillSvg(icon: string): string {
  const paths = skillIcons[icon] ?? skillIcons.code;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-[var(--sec)] shrink-0">${paths}</svg>`;
}

/** Split "text with *highlight*" into plain/highlighted parts. */
export function highlightParts(text: string): { text: string; hl: boolean }[] {
  return text.split(/\*([^*]+)\*/).map((t, i) => ({ text: t, hl: i % 2 === 1 })).filter((p) => p.text);
}
