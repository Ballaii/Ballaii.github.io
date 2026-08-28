import { requireAccessIdentity, type AccessEnv } from "../../_lib/auth";
import {
  discardDraft,
  archiveProduct,
  createProduct,
  deleteDraftProduct,
  endAllSales,
  listProducts,
  publishDraft,
  restoreProduct,
  removeDraftMedia,
  reorderDraftMedia,
  saveDraft,
} from "../../_lib/commerce";
import { json, readJson } from "../../_lib/responses";
import { maximumUploadBytes, mediaObjectKey, validateUpload } from "../../_lib/media";

interface Env extends AccessEnv {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
}

interface AuditRow {
  id: string;
  product_id: string | null;
  action: string;
  actor_email: string | null;
  occurred_at_utc: string;
}

function getPromotionStatus(
  promotion: { enabled: boolean; startsAt: string | null; endsAt: string | null },
  now: Date,
): "active" | "scheduled" | "expired" | "inactive" {
  if (!promotion.enabled) return "inactive";
  const current = now.getTime();
  if (promotion.startsAt && current < Date.parse(promotion.startsAt)) return "scheduled";
  if (promotion.endsAt && current > Date.parse(promotion.endsAt)) return "expired";
  return "active";
}

function dateRangeStart(range: string, now: Date): string | null {
  const days = range === "7" ? 7 : range === "30" ? 30 : range === "90" ? 90 : null;
  return days ? new Date(now.getTime() - days * 86_400_000).toISOString() : null;
}

async function getAnalytics(db: D1Database, range: string): Promise<object> {
  const start = dateRangeStart(range, new Date());
  const where = start ? "WHERE occurred_at_utc >= ? AND test_mode = 0" : "WHERE test_mode = 0";
  const bind = (statement: D1PreparedStatement): D1PreparedStatement => start ? statement.bind(start) : statement;
  const [totals, viewed, clicked, platforms] = await db.batch([
    bind(db.prepare(`
      SELECT event_name, COUNT(*) AS count FROM analytics_events ${where}
      GROUP BY event_name
    `)),
    bind(db.prepare(`
      SELECT product_id, COUNT(*) AS count FROM analytics_events ${where}
        AND event_name = 'product_view' AND product_id IS NOT NULL
      GROUP BY product_id ORDER BY count DESC LIMIT 8
    `)),
    bind(db.prepare(`
      SELECT product_id, COUNT(*) AS count FROM analytics_events ${where}
        AND event_name = 'marketplace_click' AND product_id IS NOT NULL
      GROUP BY product_id ORDER BY count DESC LIMIT 8
    `)),
    bind(db.prepare(`
      SELECT json_extract(metadata_json, '$.platform') AS platform, COUNT(*) AS count
      FROM analytics_events ${where}
        AND event_name = 'marketplace_click'
      GROUP BY platform ORDER BY count DESC
    `)),
  ]);
  return {
    range,
    totals: Object.fromEntries(
      (totals.results as Array<{ event_name: string; count: number }>).map((row) => [row.event_name, row.count]),
    ),
    topViewedProducts: viewed.results,
    topClickedProducts: clicked.results,
    clicksByPlatform: platforms.results,
  };
}

async function getDashboard(db: D1Database): Promise<object> {
  const products = await listProducts(db);
  const now = new Date();
  const statuses = products.map((product) => ({
    productId: product.id,
    promotion: product.published.promotion,
    status: getPromotionStatus(product.published.promotion, now),
    basePrice: product.published.basePrice,
  }));
  const [analytics, activity] = await Promise.all([
    getAnalytics(db, "all"),
    db.prepare(`
      SELECT id, product_id, action, actor_email, occurred_at_utc
      FROM audit_log ORDER BY occurred_at_utc DESC LIMIT 12
    `).all<AuditRow>(),
  ]);
  const totals = (analytics as { totals: Record<string, number> }).totals;
  return {
    metrics: {
      totalProducts: products.length,
      publishedProducts: products.filter((product) => product.published.visibility === "visible").length,
      productsOnSale: statuses.filter((item) => item.status === "active").length,
      scheduledPromotions: statuses.filter((item) => item.status === "scheduled").length,
      storeViews: totals.store_view ?? 0,
      productViews: totals.product_view ?? 0,
      marketplaceClicks: totals.marketplace_click ?? 0,
    },
    activePromotions: statuses.filter((item) => item.status === "active"),
    scheduledPromotions: statuses.filter((item) => item.status === "scheduled"),
    recentActivity: activity.results,
  };
}

function matchProductAction(path: string): { id: string; action: string } | null {
  const match = path.match(/^\/api\/admin\/products\/([^/]+)\/(draft|publish|discard|archive|restore|delete)$/);
  return match ? { id: decodeURIComponent(match[1]), action: match[2] } : null;
}

function requireSameOriginMutation(request: Request): void {
  requireSameOriginRequest(request);
  const contentType = request.headers.get("Content-Type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    throw new Error("Mutations require JSON");
  }
}

function requireSameOriginRequest(request: Request): void {
  const origin = request.headers.get("Origin");
  if (!origin || origin !== new URL(request.url).origin) {
    throw new Error("Origin not allowed");
  }
}

async function uploadMedia(request: Request, env: Env, actorEmail: string): Promise<Response> {
  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  const maximumMultipartBytes = maximumUploadBytes + 64 * 1024;
  if (Number.isFinite(contentLength) && contentLength > maximumMultipartBytes) {
    return json({ error: "Media upload is too large" }, 413);
  }
  const form = await request.formData();
  const productId = form.get("productId");
  const role = form.get("role");
  const altText = form.get("altText");
  const order = Number(form.get("displayOrder") ?? 0);
  const file = form.get("file");
  if (typeof productId !== "string" || !["card", "hero", "gallery"].includes(String(role)) || typeof altText !== "string" || !Number.isInteger(order) || order < 0 || order > 1000 || !(file instanceof File)) {
    return json({ error: "Invalid media upload" }, 400);
  }
  if (file.name.length > 200 || altText.length > 500) return json({ error: "Media metadata is too long" }, 400);
  const product = (await listProducts(env.DB)).find((item) => item.id === productId);
  if (!product) return json({ error: "Product not found" }, 404);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const info = validateUpload(file, bytes);
  const mediaId = crypto.randomUUID();
  const key = mediaObjectKey(productId, mediaId, info.mimeType);
  await env.MEDIA_BUCKET.put(key, bytes, { httpMetadata: { contentType: info.mimeType } });
  try {
    await env.DB.batch([
      env.DB.prepare("INSERT INTO media_objects (id, r2_key, mime_type, width, height, byte_size) VALUES (?, ?, ?, ?, ?, ?)").bind(mediaId, key, info.mimeType, info.width, info.height, bytes.byteLength),
      env.DB.prepare("INSERT INTO product_revision_media (revision_key, media_id, role, display_order, alt_text) VALUES (?, ?, ?, ?, ?)").bind(`${productId}:draft`, mediaId, role, order, altText),
      env.DB.prepare("INSERT INTO audit_log (id, product_id, action, actor_email, before_json, after_json, occurred_at_utc) VALUES (?, ?, 'media_uploaded', ?, NULL, ?, ?)").bind(crypto.randomUUID(), productId, actorEmail, JSON.stringify({ mediaId, role, order }), new Date().toISOString()),
    ]);
  } catch (error) {
    try { await env.MEDIA_BUCKET.delete(key); } catch { /* scheduled orphan cleanup is the fallback */ }
    throw error;
  }
  return json({ media: { id: mediaId, role, order, alt: altText, width: info.width, height: info.height, mimeType: info.mimeType } }, 201);
}

async function readAdminMedia(request: Request, env: Env, mediaId: string): Promise<Response> {
  const row = await env.DB.prepare("SELECT r2_key, mime_type FROM media_objects WHERE id = ?").bind(mediaId).first<{ r2_key: string; mime_type: string }>();
  if (!row) return json({ error: "Media not found" }, 404);
  const object = await env.MEDIA_BUCKET.get(row.r2_key);
  if (!object) return json({ error: "Media not found" }, 404);
  const headers = new Headers({ "Content-Type": row.mime_type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" });
  object.writeHttpMetadata(headers);
  return new Response(object.body, { headers });
}

async function route(request: Request, env: Env, actorEmail: string): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  if (request.method === "GET" && path.startsWith("/api/admin/media/")) {
    return await readAdminMedia(request, env, decodeURIComponent(path.slice("/api/admin/media/".length)));
  }
  const mediaAction = path.match(/^\/api\/admin\/media\/([^/]+)\/(remove|reorder)$/);
  if (mediaAction && request.method === "POST") {
    requireSameOriginMutation(request);
    const body = await readJson(request) as { productId?: unknown; mediaIds?: unknown };
    if (typeof body.productId !== "string") return json({ error: "Product is required" }, 400);
    if (mediaAction[2] === "remove") await removeDraftMedia(env.DB, mediaAction[1], body.productId, actorEmail);
    else await reorderDraftMedia(env.DB, body.productId, Array.isArray(body.mediaIds) ? body.mediaIds : [], actorEmail);
    return json({ ok: true });
  }
  if (request.method === "POST" && path === "/api/admin/media/upload") {
    requireSameOriginRequest(request);
    return await uploadMedia(request, env, actorEmail);
  }
  if (request.method === "POST" && path === "/api/admin/products") {
    requireSameOriginMutation(request);
    return json({ product: await createProduct(env.DB, await readJson(request), actorEmail) }, 201);
  }
  if (request.method === "GET" && path === "/api/admin/health") {
    return json({ ok: true, service: "ballai-admin-api", actorEmail });
  }
  if (request.method === "GET" && path === "/api/admin/products") {
    return json({ products: await listProducts(env.DB) });
  }
  if (request.method === "GET" && path === "/api/admin/dashboard") {
    return json(await getDashboard(env.DB));
  }
  if (request.method === "GET" && path === "/api/admin/analytics") {
    const range = url.searchParams.get("range") ?? "30";
    if (!["7", "30", "90", "all"].includes(range)) return json({ error: "Invalid date range" }, 400);
    return json(await getAnalytics(env.DB, range));
  }
  if (request.method === "POST" || request.method === "PUT") {
    requireSameOriginMutation(request);
  }
  const productAction = matchProductAction(path);
  if (productAction && request.method === "PUT" && productAction.action === "draft") {
    const body = await readJson(request) as { draft?: unknown; expectedDraftRevisionToken?: unknown };
    if (typeof body.expectedDraftRevisionToken !== "string" || !body.draft) {
      return json({ error: "Draft version is required" }, 400);
    }
    return json({ product: await saveDraft(env.DB, productAction.id, body.draft, body.expectedDraftRevisionToken, actorEmail) });
  }
  if (productAction && request.method === "POST" && productAction.action === "publish") {
    const body = await readJson(request) as { draftRevisionToken?: unknown };
    if (typeof body.draftRevisionToken !== "string") return json({ error: "Draft version is required" }, 400);
    return json({ product: await publishDraft(env.DB, productAction.id, body.draftRevisionToken, actorEmail) });
  }
  if (productAction && request.method === "POST" && productAction.action === "discard") {
    const body = await readJson(request) as { draftRevisionToken?: unknown };
    if (typeof body.draftRevisionToken !== "string") return json({ error: "Draft version is required" }, 400);
    return json({ product: await discardDraft(env.DB, productAction.id, body.draftRevisionToken, actorEmail) });
  }
  if (productAction && request.method === "POST" && ["archive", "restore"].includes(productAction.action)) {
    return json({ product: productAction.action === "archive" ? await archiveProduct(env.DB, productAction.id, actorEmail) : await restoreProduct(env.DB, productAction.id, actorEmail) });
  }
  if (productAction && request.method === "DELETE" && productAction.action === "delete") {
    requireSameOriginMutation(request);
    await deleteDraftProduct(env.DB, env.MEDIA_BUCKET, productAction.id, actorEmail);
    return json({ deleted: true });
  }
  if (request.method === "POST" && path === "/api/admin/sales/end-all") {
    return json({ affectedProducts: await endAllSales(env.DB, actorEmail) });
  }
  return json({ error: "Not found" }, 404);
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const actorEmail = await requireAccessIdentity(request, env);
    return await route(request, env, actorEmail);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    const unauthorized = message.includes("Access") || message.includes("token") || message.includes("identity");
    const conflict = message.startsWith("Draft changed");
    return json({ error: unauthorized ? "Unauthorized" : message }, unauthorized ? 401 : conflict ? 409 : 400);
  }
};
