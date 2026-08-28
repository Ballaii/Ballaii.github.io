interface Env {
  ANALYTICS_HASH_SALT: string;
  DB: D1Database;
  ANALYTICS_RATE_LIMITER: RateLimit;
}

interface ProductRow {
  id: string;
  slug: string;
  base_price: number | null;
  currency: string;
  price_suffix: string | null;
  visibility: string;
  featured: number;
  display_order: number;
  updated_at: string;
}

interface PlatformRow {
  product_id: string;
  platform: string;
  status: string;
  url: string | null;
}

interface LabelRow {
  product_id: string;
  label: string;
}

interface PromotionRow {
  product_id: string;
  enabled: number;
  discount_percent: number | null;
  starts_at_utc: string | null;
  ends_at_utc: string | null;
}

type AnalyticsEventName =
  | "store_view"
  | "product_view"
  | "marketplace_click"
  | "search"
  | "store_filter";

interface AnalyticsPayload {
  eventType?: unknown;
  productId?: unknown;
  platform?: unknown;
  category?: unknown;
}

const allowedOrigins = new Set([
  "https://ballaii.github.io",
  "https://ballai-admin.pages.dev",
  "http://localhost:5173",
  "http://localhost:5174",
]);
const analyticsEventNames = new Set<AnalyticsEventName>([
  "store_view",
  "product_view",
  "marketplace_click",
  "search",
  "store_filter",
]);
const marketplacePlatforms = new Set(["direct", "itch", "unity"]);
const maximumBodyBytes = 4096;
const analyticsRetentionMilliseconds = 90 * 86_400_000;

class RequestBodyError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function corsHeaders(request: Request): Headers {
  const headers = new Headers({
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  });
  const origin = request.headers.get("Origin");
  if (origin && allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  return headers;
}

function jsonResponse(
  request: Request,
  body: unknown,
  status = 200,
  cacheControl = "no-store",
): Response {
  const headers = corsHeaders(request);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", cacheControl);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  return new Response(JSON.stringify(body), { status, headers });
}

function handleOptions(request: Request): Response {
  const origin = request.headers.get("Origin");
  if (origin && !allowedOrigins.has(origin)) {
    return jsonResponse(request, { error: "Origin not allowed" }, 403);
  }
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

function mapPublishedProduct(
  product: ProductRow,
  platformRows: PlatformRow[],
  labelRows: LabelRow[],
  promotionRows: PromotionRow[],
): object {
  const promotion = promotionRows.find((row) => row.product_id === product.id);
  const platforms = Object.fromEntries(
    platformRows
      .filter((platform) => platform.product_id === product.id)
      .map((platform) => [platform.platform, { status: platform.status, url: platform.url }]),
  );
  return {
    id: product.id,
    slug: product.slug,
    basePrice: product.base_price,
    currency: product.currency,
    priceSuffix: product.price_suffix,
    labels: labelRows.filter((label) => label.product_id === product.id).map((label) => label.label),
    visibility: product.visibility,
    featured: Boolean(product.featured),
    displayOrder: product.display_order,
    platforms,
    promotion: promotion
      ? {
          enabled: Boolean(promotion.enabled),
          discountPercent: promotion.discount_percent,
          startsAt: promotion.starts_at_utc,
          endsAt: promotion.ends_at_utc,
        }
      : { enabled: false, discountPercent: null, startsAt: null, endsAt: null },
    updatedAt: product.updated_at,
  };
}

async function getPublishedProducts(request: Request, env: Env): Promise<Response> {
  const [products, platforms, labels, promotions] = await env.DB.batch([
    env.DB.prepare(`
      SELECT p.id, p.slug, r.base_price, r.currency, r.price_suffix,
             r.visibility, r.featured, r.display_order, r.updated_at
      FROM products p
      JOIN product_revisions r ON r.product_id = p.id
      WHERE r.stage = 'published' AND r.visibility = 'visible'
      ORDER BY r.display_order ASC, p.id ASC
    `),
    env.DB.prepare(`
      SELECT r.product_id, pp.platform, pp.status, pp.url
      FROM product_platforms pp
      JOIN product_revisions r ON r.revision_key = pp.revision_key
      WHERE r.stage = 'published' AND r.visibility = 'visible'
      ORDER BY pp.platform ASC
    `),
    env.DB.prepare(`
      SELECT r.product_id, pl.label
      FROM product_labels pl
      JOIN product_revisions r ON r.revision_key = pl.revision_key
      WHERE r.stage = 'published' AND r.visibility = 'visible'
      ORDER BY pl.created_at ASC, pl.label ASC
    `),
    env.DB.prepare(`
      SELECT r.product_id, pr.enabled, pr.discount_percent,
             pr.starts_at_utc, pr.ends_at_utc
      FROM promotions pr
      JOIN product_revisions r ON r.revision_key = pr.revision_key
      WHERE r.stage = 'published' AND r.visibility = 'visible'
    `),
  ]);
  const platformRows = platforms.results as unknown as PlatformRow[];
  const labelRows = labels.results as unknown as LabelRow[];
  const promotionRows = promotions.results as unknown as PromotionRow[];
  const responseProducts = (products.results as unknown as ProductRow[]).map((product) =>
    mapPublishedProduct(product, platformRows, labelRows, promotionRows),
  );
  return jsonResponse(request, { products: responseProducts }, 200, "public, max-age=30, must-revalidate");
}

function isShortText(value: unknown, maximumLength: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maximumLength;
}

async function readLimitedJson(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError("Request body must be valid JSON", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maximumBodyBytes) {
      await reader.cancel();
      throw new RequestBodyError("Request body is too large", 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new RequestBodyError("Invalid JSON", 400);
  }
}

function validateAnalyticsPayload(payload: AnalyticsPayload): string | null {
  if (typeof payload.eventType !== "string" || !analyticsEventNames.has(payload.eventType as AnalyticsEventName)) {
    return "Unknown analytics event";
  }
  if (payload.productId != null && !isShortText(payload.productId, 80)) {
    return "Invalid product ID";
  }
  if (payload.platform != null) {
    if (typeof payload.platform !== "string" || !marketplacePlatforms.has(payload.platform)) {
      return "Invalid marketplace platform";
    }
  }
  if (payload.category != null && !isShortText(payload.category, 40)) {
    return "Invalid category";
  }
  return null;
}

async function createClientHash(request: Request, env: Env): Promise<string> {
  if (!env.ANALYTICS_HASH_SALT) throw new Error("Analytics privacy key is not configured");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.ANALYTICS_HASH_SALT),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const input = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(input));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function cleanupAnalytics(env: Env, now: Date): Promise<void> {
  const staleBucket = new Date(now.getTime() - 5 * 60_000).toISOString().slice(0, 16);
  const analyticsCutoff = new Date(now.getTime() - analyticsRetentionMilliseconds).toISOString();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM analytics_rate_limits WHERE minute_bucket < ?").bind(staleBucket),
    env.DB.prepare("DELETE FROM analytics_events WHERE occurred_at_utc < ?").bind(analyticsCutoff),
  ]);
}

async function exceedsRateLimit(request: Request, env: Env): Promise<boolean> {
  const clientHash = await createClientHash(request, env);
  return !(await env.ANALYTICS_RATE_LIMITER.limit({ key: clientHash })).success;
}

async function recordAnalyticsEvent(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin");
  if (!origin || !allowedOrigins.has(origin)) {
    return jsonResponse(request, { error: "Origin not allowed" }, 403);
  }
  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  if (contentLength > maximumBodyBytes) {
    return jsonResponse(request, { error: "Request body is too large" }, 413);
  }
  let body: unknown;
  try {
    body = await readLimitedJson(request);
  } catch (error) {
    const bodyError = error instanceof RequestBodyError ? error : new RequestBodyError("Invalid JSON", 400);
    return jsonResponse(request, { error: bodyError.message }, bodyError.status);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonResponse(request, { error: "Invalid analytics event" }, 400);
  }
  const payload = body as AnalyticsPayload;
  const validationError = validateAnalyticsPayload(payload);
  if (validationError) {
    return jsonResponse(request, { error: validationError }, 400);
  }
  const now = new Date();
  if (await exceedsRateLimit(request, env)) {
    return jsonResponse(request, { error: "Rate limit exceeded" }, 429);
  }
  const metadata = { platform: payload.platform ?? null, category: payload.category ?? null };
  try {
    await env.DB.prepare(`
      INSERT INTO analytics_events (
        id, event_name, product_id, session_hash, metadata_json, occurred_at_utc, test_mode
      ) VALUES (?, ?, ?, NULL, ?, ?, 0)
    `)
      .bind(
        crypto.randomUUID(),
        payload.eventType,
        payload.productId ?? null,
        JSON.stringify(metadata),
        now.toISOString(),
      )
      .run();
  } catch {
    return jsonResponse(request, { error: "Analytics event was not accepted" }, 400);
  }
  return jsonResponse(request, { accepted: true }, 202);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }
    const path = new URL(request.url).pathname;
    if (request.method === "GET" && path === "/health") {
      return jsonResponse(request, { ok: true, service: "ballai-store-api" }, 200, "public, max-age=60");
    }
    if (request.method === "GET" && path === "/products") {
      try {
        return await getPublishedProducts(request, env);
      } catch {
        return jsonResponse(request, { error: "Product data is temporarily unavailable" }, 503);
      }
    }
    if (request.method === "POST" && path === "/analytics/event") {
      try {
        return await recordAnalyticsEvent(request, env);
      } catch {
        return jsonResponse(request, { error: "Analytics service is temporarily unavailable" }, 503);
      }
    }
    if (request.method !== "GET" && request.method !== "POST") {
      return jsonResponse(request, { error: "Method not allowed" }, 405);
    }
    return jsonResponse(request, { error: "Not found" }, 404);
  },
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    await cleanupAnalytics(env, new Date());
  },
} satisfies ExportedHandler<Env>;
