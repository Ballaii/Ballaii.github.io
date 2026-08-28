interface Env {
  DB: D1Database;
}

const staticOrigin = "https://ballaii.github.io";
const publicOrigin = "https://ballai.dev";
const apiOrigin = "https://api.ballai.dev";

interface ProductRow {
  slug: string;
  old_slug: string | null;
  content_json: string | null;
  media_id: string | null;
  media_role: string | null;
}

interface ProductMeta {
  slug: string;
  title: string;
  description: string;
  image: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function escapeXml(value: string): string {
  return escapeHtml(value);
}

function parseContent(value: string | null): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function productMeta(row: ProductRow): ProductMeta {
  const content = parseContent(row.content_json);
  const title = textValue(content.title) || row.slug;
  const category = textValue(content.category) || "assets";
  const description = (textValue(content.shortDescription) || textValue(content.description) || `${title} ${category} by Ballai.`).slice(0, 160);
  const image = row.media_id ? `${apiOrigin}/media/${encodeURIComponent(row.media_id)}` : `${publicOrigin}/assets/project-divine-harvest.webp`;
  const seoTitle = row.slug === "save-system"
    ? "Ballai Save System - Unity Save System | Ballai"
    : row.slug === "keyboard-glyph-pack"
      ? "Dark Pixel Keyboard Glyph Pack | Ballai"
      : `${title} | Ballai`;
  return { slug: row.slug, title: seoTitle, description, image };
}

function replaceMeta(html: string, meta: { title: string; description: string; url: string; image: string; noindex?: boolean }): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const url = escapeHtml(meta.url);
  const image = escapeHtml(meta.image);
  const robots = meta.noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow">';
  const withoutManaged = html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, "")
    .replace(/<meta\s+name=["']robots["'][^>]*>/gi, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<meta\s+property=["']og:(?:title|description|url|image)["'][^>]*>/gi, "")
    .replace(/<meta\s+name=["']twitter:(?:title|description|image)["'][^>]*>/gi, "");
  const metadata = `<title>${title}</title>${robots}<meta name="description" content="${description}"><link rel="canonical" href="${url}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${url}"><meta property="og:image" content="${image}"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${image}">`;
  return withoutManaged.replace(/<\/head>/i, `${metadata}</head>`);
}

async function findProduct(env: Env, slug: string): Promise<ProductRow | null> {
  return await env.DB.prepare(`
    SELECT p.slug, a.old_slug, r.content_json,
           (SELECT rm.media_id FROM product_revision_media rm WHERE rm.revision_key = r.revision_key ORDER BY CASE rm.role WHEN 'hero' THEN 0 WHEN 'card' THEN 1 ELSE 2 END, rm.display_order LIMIT 1) AS media_id,
           (SELECT rm.role FROM product_revision_media rm WHERE rm.revision_key = r.revision_key ORDER BY CASE rm.role WHEN 'hero' THEN 0 WHEN 'card' THEN 1 ELSE 2 END, rm.display_order LIMIT 1) AS media_role
    FROM products p
    JOIN product_revisions r ON r.product_id = p.id AND r.stage = 'published' AND r.visibility = 'visible'
    LEFT JOIN product_slug_aliases a ON a.product_id = p.id AND a.old_slug = ?
    WHERE p.archived_at IS NULL AND (p.slug = ? OR a.old_slug = ?)
    LIMIT 1
  `).bind(slug, slug, slug).first<ProductRow>();
}

async function publicProducts(env: Env): Promise<Array<{ slug: string; updated_at: string }>> {
  const result = await env.DB.prepare(`
    SELECT p.slug, r.updated_at
    FROM products p JOIN product_revisions r ON r.product_id = p.id
    WHERE r.stage = 'published' AND r.visibility = 'visible' AND p.archived_at IS NULL
    ORDER BY r.display_order, p.id
  `).all<{ slug: string; updated_at: string }>();
  return result.results;
}

async function originResponse(request: Request, path: string, search: string): Promise<Response> {
  const target = `${staticOrigin}${path}${search}`;
  const response = await fetch(target, { method: request.method, redirect: "manual" });
  if (response.status >= 300 && response.status < 400) {
    return new Response("Static origin redirect unavailable", { status: 502, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }
  return response;
}

async function htmlResponse(request: Request, env: Env, meta: { title: string; description: string; url: string; image: string; noindex?: boolean }): Promise<Response> {
  const origin = await originResponse(request, "/index.html", "");
  if (!origin.ok) return new Response("Site origin unavailable", { status: 502, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  const html = await origin.text();
  const headers = new Headers(origin.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("Cache-Control", "no-store, max-age=0");
  return new Response(replaceMeta(html, meta), { status: 200, headers });
}

function notFound(): Response {
  const body = "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex, nofollow\"><title>Not found | Ballai</title></head><body><h1>Not found</h1></body></html>";
  return new Response(body, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

async function sitemap(env: Env): Promise<Response> {
  const products = await publicProducts(env);
  const urls = [`  <url><loc>${publicOrigin}/</loc></url>`, `  <url><loc>${publicOrigin}/store</loc></url>`, ...products.map((product) => `  <url><loc>${publicOrigin}/store/${encodeURIComponent(product.slug)}</loc><lastmod>${escapeXml(new Date(product.updated_at).toISOString())}</lastmod></url>`)];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=60, must-revalidate" } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!["GET", "HEAD"].includes(request.method)) return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    const url = new URL(request.url);
    if (url.hostname === "www.ballai.dev") return Response.redirect(`${publicOrigin}${url.pathname}${url.search}`, 301);
    const path = decodeURIComponent(url.pathname);
    if (path === "/robots.txt") return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${publicOrigin}/sitemap.xml\n`, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" } });
    if (path === "/sitemap.xml") return await sitemap(env);
    if (path === "/" || path === "") return await htmlResponse(request, env, { title: "ballai.dev - Game Dev Tools & Assets", description: "Portfolio and store of Ballai Fokt Jeno, featuring Unity games, game assets, AI security, SCADA simulation, Flutter apps, and OpenGL work.", url: `${publicOrigin}/`, image: `${publicOrigin}/assets/project-divine-harvest.webp` });
    if (path === "/store" || path === "/store/") return await htmlResponse(request, env, { title: "Ballai - Unity Tools & Game Assets", description: "Unity tools, game-development systems, and pixel-art assets by Ballai.", url: `${publicOrigin}/store`, image: `${publicOrigin}/assets/project-divine-harvest.webp` });
    if (path.startsWith("/store/")) {
      const slug = path.slice("/store/".length).replace(/\/$/, "");
      if (!slug || slug.includes("/")) return notFound();
      const product = await findProduct(env, slug);
      if (!product) return notFound();
      const meta = productMeta(product);
      if (product.old_slug && product.old_slug === slug) return Response.redirect(`${publicOrigin}/store/${encodeURIComponent(meta.slug)}`, 301);
      return await htmlResponse(request, env, { title: meta.title.includes("|") ? meta.title : `${meta.title} | Ballai`, description: meta.description, url: `${publicOrigin}/store/${encodeURIComponent(meta.slug)}`, image: meta.image });
    }
    const pageMeta: Record<string, { title: string; description: string; url: string }> = {
      "/projects": { title: "Projects | Ballai Fokt Jeno", description: "Game development, automation, AI malware detection, Flutter, and OpenGL projects by Ballai Fokt Jeno.", url: `${publicOrigin}/projects` },
      "/about": { title: "About | Ballai Fokt Jeno", description: "About Ballai Fokt Jeno, a game developer and software engineer building Unity games, tools, mobile apps, graphics projects, and applied AI systems.", url: `${publicOrigin}/about` },
      "/skills": { title: "About | Ballai Fokt Jeno", description: "About Ballai Fokt Jeno and his game development, software engineering, and frontend certifications.", url: `${publicOrigin}/skills` },
      "/contact": { title: "Contact | Ballai Fokt Jeno", description: "Contact Ballai Fokt Jeno for game development, software engineering, web, automation, and AI security work.", url: `${publicOrigin}/contact` },
      "/projects/divine-harvest": { title: "Divine Harvest | Ballai Fokt Jeno", description: "Divine Harvest is a released Unity Metroidvania with at least 2 hours of content.", url: `${publicOrigin}/projects/divine-harvest` },
      "/projects/seconds-thief": { title: "Second's Thief | Ballai Fokt Jeno", description: "Second's Thief is an ongoing arena survivor based on reverse progression and time pressure.", url: `${publicOrigin}/projects/seconds-thief` },
    };
    if (pageMeta[path]) return await htmlResponse(request, env, { ...pageMeta[path], image: `${publicOrigin}/assets/project-divine-harvest.webp` });
    return await originResponse(request, url.pathname, url.search);
  },
};
