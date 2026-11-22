// Local site editor: adds /editor/ to `astro dev` only. Never part of the built site.
// Everything it does stays on this computer except "Publish", which commits and pushes to GitHub.
import fs from "node:fs/promises";
import path from "node:path";
import { execFile, exec } from "node:child_process";

const ROOT = process.cwd();
const SITE_JSON = path.join(ROOT, "src/data/site.json");
const ICONS_TS = path.join(ROOT, "src/data/icons.ts");
const EDITOR_HTML = path.join(ROOT, "editor/index.html");
const IMAGES = path.join(ROOT, "public/images");
const SVGS = path.join(ROOT, "public/svg");
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);
const MAX_UPLOAD = 15 * 1024 * 1024;

const LOOPBACK = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);
const isLocalHost = (h = "") => /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(h);

function send(res, status, body, type = "application/json") {
  res.statusCode = status;
  res.setHeader("Content-Type", type);
  res.setHeader("Cache-Control", "no-store");
  res.end(type === "application/json" ? JSON.stringify(body) : body);
}

function readBody(req, limit = MAX_UPLOAD) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { reject(new Error("File is too big (15 MB max)")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function safeName(name, allowed) {
  const ext = path.extname(name).toLowerCase();
  if (!allowed.has(ext)) throw new Error(`Only ${[...allowed].join(", ")} files are allowed`);
  const base = path.basename(name, path.extname(name)).toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "image";
  return { base, ext };
}

async function freePath(dir, base, ext) {
  await fs.mkdir(dir, { recursive: true });
  for (let i = 1; ; i++) {
    const file = path.join(dir, `${i === 1 ? base : `${base}-${i}`}${ext}`);
    try { await fs.access(file); } catch { return file; }
  }
}

function run(cmd, args) {
  return new Promise((resolve) => {
    execFile(cmd, args, { cwd: ROOT, windowsHide: true }, (err, stdout, stderr) =>
      resolve({ ok: !err, out: `$ ${cmd} ${args.join(" ")}\n${stdout}${stderr}`.trim() }));
  });
}

function checkContent(d) {
  const need = ["name", "seo", "hero", "socials", "tech", "skills", "projects", "contact"];
  for (const k of need) if (!(k in d)) throw new Error(`Missing "${k}"`);
  if (!Array.isArray(d.socials) || !Array.isArray(d.tech) || !Array.isArray(d.projects.cards) || !Array.isArray(d.skills.items))
    throw new Error("Lists are malformed");
}

async function handle(req, res, url) {
  const p = url.pathname;

  if (req.method === "GET" && (p === "/editor" || p === "/editor/")) {
    return send(res, 200, await fs.readFile(EDITOR_HTML, "utf-8"), "text/html; charset=utf-8");
  }
  if (req.method === "GET" && p === "/__editor/data") {
    return send(res, 200, JSON.parse(await fs.readFile(SITE_JSON, "utf-8")));
  }
  if (req.method === "GET" && p === "/__editor/meta") {
    const ts = await fs.readFile(ICONS_TS, "utf-8");
    const grab = (name) => JSON.parse(ts.match(new RegExp(`export const ${name}[^=]*=\\s*(\\{[\\s\\S]*?\\n\\});`))[1]);
    const list = async (dir, exts) => (await fs.readdir(dir).catch(() => [])).filter((f) => exts.has(path.extname(f).toLowerCase())).sort();
    return send(res, 200, {
      socialIcons: grab("socialIcons"),
      skillIcons: grab("skillIcons"),
      tech: (await list(SVGS, new Set([".svg"]))).map((f) => f.replace(/\.svg$/i, "")),
      images: (await list(IMAGES, IMAGE_EXT)).map((f) => `images/${f}`),
    });
  }

  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  // Only accept writes from the editor page itself (blocks other websites posting to localhost).
  const origin = req.headers.origin;
  if (!origin || !isLocalHost(new URL(origin).host) || req.headers["x-site-editor"] !== "1") {
    return send(res, 403, { error: "Forbidden" });
  }

  if (p === "/__editor/save") {
    const data = JSON.parse((await readBody(req, 2 * 1024 * 1024)).toString("utf-8"));
    checkContent(data);
    await fs.writeFile(SITE_JSON, JSON.stringify(data, null, 2) + "\n", "utf-8");
    return send(res, 200, { ok: true });
  }
  if (p === "/__editor/upload") {
    const { base, ext } = safeName(url.searchParams.get("name") || "", IMAGE_EXT);
    const buf = await readBody(req);
    const file = await freePath(IMAGES, base, ext);
    await fs.writeFile(file, buf);
    return send(res, 200, { path: `images/${path.basename(file)}` });
  }
  if (p === "/__editor/upload-tech") {
    const { base } = safeName(url.searchParams.get("name") || "", new Set([".svg"]));
    const buf = await readBody(req, 512 * 1024);
    if (!/<svg[\s>]/i.test(buf.toString("utf-8"))) throw new Error("That file is not an SVG");
    const file = await freePath(SVGS, base, ".svg");
    await fs.writeFile(file, buf);
    return send(res, 200, { name: path.basename(file, ".svg") });
  }
  if (p === "/__editor/publish") {
    const log = [];
    const step = async (cmd, args) => { const r = await run(cmd, args); log.push(r.out); return r.ok; };
    await step("git", ["add", "src/data/site.json", "public/images", "public/svg"]);
    const staged = await run("git", ["diff", "--cached", "--quiet"]);
    if (!staged.ok) {
      if (!(await step("git", ["commit", "-m", "Update site content"]))) return send(res, 200, { ok: false, log: log.join("\n\n") });
    } else {
      log.push("Nothing new to commit.");
    }
    const ok = await step("git", ["-c", "credential.helper=", "-c", "credential.helper=!gh auth git-credential", "push"]);
    return send(res, 200, { ok, log: log.join("\n\n") });
  }
  return send(res, 404, { error: "Not found" });
}

export default function siteEditor() {
  return {
    name: "site-editor",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url, "http://localhost");
          if (!/^\/(editor\/?$|__editor\/)/.test(url.pathname)) return next();
          if (!LOOPBACK.has(req.socket.remoteAddress) || !isLocalHost(req.headers.host)) {
            return send(res, 403, "The site editor only works on this computer.", "text/plain");
          }
          try {
            await handle(req, res, url);
          } catch (e) {
            send(res, 400, { error: e.message || String(e) });
          }
        });
      },
      "astro:server:start": ({ address }) => {
        const link = `http://localhost:${address.port}/editor/`;
        console.log(`\n  Site editor: ${link}\n`);
        if (process.env.OPEN_EDITOR === "1" && process.platform === "win32") exec(`start "" "${link}"`);
      },
    },
  };
}
