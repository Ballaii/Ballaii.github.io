export type PlatformName = "direct" | "itch" | "unity";
export type PlatformStatus = "available" | "coming-soon" | "pending-review" | "unavailable";

export interface PlatformState {
  status: PlatformStatus;
  url: string | null;
}

export interface PromotionState {
  enabled: boolean;
  discountPercent: number | null;
  startsAt: string | null;
  endsAt: string | null;
}

export interface RevisionState {
  basePrice: number | null;
  currency: string;
  displayOrder: number;
  featured: boolean;
  labels: string[];
  platforms: Record<PlatformName, PlatformState>;
  priceSuffix: string | null;
  promotion: PromotionState;
  revisionToken: string;
  updatedAt: string;
  visibility: "visible" | "hidden";
}

export interface AdminProduct {
  id: string;
  slug: string;
  draft: RevisionState;
  published: RevisionState;
  hasChanges: boolean;
}

interface ProductRevisionRow {
  id: string;
  slug: string;
  stage: "draft" | "published";
  base_price: number | null;
  currency: string;
  price_suffix: string | null;
  visibility: "visible" | "hidden";
  featured: number;
  display_order: number;
  revision_token: string;
  updated_at: string;
}

interface ChildRow {
  product_id: string;
  stage: "draft" | "published";
}

interface PlatformRow extends ChildRow {
  platform: PlatformName;
  status: PlatformStatus;
  url: string | null;
}

interface LabelRow extends ChildRow {
  label: string;
}

interface PromotionRow extends ChildRow {
  enabled: number;
  discount_percent: number | null;
  starts_at_utc: string | null;
  ends_at_utc: string | null;
}

const platformNames: PlatformName[] = ["direct", "itch", "unity"];
const platformStatuses = new Set<PlatformStatus>([
  "available",
  "coming-soon",
  "pending-review",
  "unavailable",
]);
const currencies = new Set(["USD", "EUR"]);
const platformHosts: Record<PlatformName, Set<string>> = {
  direct: new Set(["ballai.dev", "www.ballai.dev", "ballaii.github.io"]),
  itch: new Set(["ballaii.itch.io"]),
  unity: new Set(["assetstore.unity.com"]),
};

function emptyPlatforms(): Record<PlatformName, PlatformState> {
  return {
    direct: { status: "coming-soon", url: null },
    itch: { status: "unavailable", url: null },
    unity: { status: "unavailable", url: null },
  };
}

function comparableRevision(revision: RevisionState): object {
  const { revisionToken: _revisionToken, updatedAt: _updatedAt, ...state } = revision;
  return state;
}

function isApprovedPlatformUrl(value: string, platform: PlatformName): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && !url.username
      && !url.password
      && !url.port
      && platformHosts[platform].has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function isIsoTimestamp(value: string): boolean {
  return !Number.isNaN(Date.parse(value)) && /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
}

function parsePlatform(value: unknown, name: PlatformName): PlatformState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} marketplace settings are required`);
  }
  const candidate = value as { status?: unknown; url?: unknown };
  if (typeof candidate.status !== "string" || !platformStatuses.has(candidate.status as PlatformStatus)) {
    throw new Error(`${name} marketplace status is invalid`);
  }
  const url = candidate.url === "" || candidate.url == null ? null : candidate.url;
  if (url !== null && (typeof url !== "string" || url.length > 500 || !isApprovedPlatformUrl(url, name))) {
    throw new Error(`${name} marketplace URL must use an approved HTTPS host`);
  }
  if (candidate.status === "available" && !url) {
    throw new Error(`${name} marketplace requires a URL when available`);
  }
  return { status: candidate.status as PlatformStatus, url };
}

function parseLabels(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 12) {
    throw new Error("Labels must be a list with at most 12 entries");
  }
  const labels = value.map((label) => {
    if (typeof label !== "string") {
      throw new Error("Every label must be text");
    }
    const normalized = label.trim().toUpperCase();
    if (!normalized || normalized.length > 32 || normalized === "SALE") {
      throw new Error("Labels must be 1 to 32 characters and cannot be SALE");
    }
    return normalized;
  });
  return [...new Set(labels)];
}

function parsePromotion(value: unknown): PromotionState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Promotion settings are required");
  }
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.enabled !== "boolean") {
    throw new Error("Promotion enabled state is invalid");
  }
  const discount = candidate.discountPercent == null ? null : Number(candidate.discountPercent);
  if (candidate.enabled && (!Number.isFinite(discount) || discount! <= 0 || discount! >= 100)) {
    throw new Error("Discount must be between 1 and 99 percent");
  }
  const startsAt = candidate.startsAt === "" || candidate.startsAt == null ? null : candidate.startsAt;
  const endsAt = candidate.endsAt === "" || candidate.endsAt == null ? null : candidate.endsAt;
  if (startsAt !== null && (typeof startsAt !== "string" || !isIsoTimestamp(startsAt))) {
    throw new Error("Promotion start must be an ISO timestamp");
  }
  if (endsAt !== null && (typeof endsAt !== "string" || !isIsoTimestamp(endsAt))) {
    throw new Error("Promotion end must be an ISO timestamp");
  }
  if (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt)) {
    throw new Error("Promotion end must be after its start");
  }
  return {
    enabled: candidate.enabled,
    discountPercent: candidate.enabled ? discount : null,
    startsAt,
    endsAt,
  };
}

export function parseRevision(value: unknown): Omit<RevisionState, "revisionToken" | "updatedAt"> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Product draft is invalid");
  }
  const candidate = value as Record<string, unknown>;
  const basePrice = candidate.basePrice == null ? null : Number(candidate.basePrice);
  if (basePrice !== null && (!Number.isFinite(basePrice) || basePrice < 0)) {
    throw new Error("Base price must be a non-negative number");
  }
  if (typeof candidate.currency !== "string" || !currencies.has(candidate.currency)) {
    throw new Error("Currency must be USD or EUR");
  }
  const priceSuffix = candidate.priceSuffix === "" || candidate.priceSuffix == null ? null : candidate.priceSuffix;
  if (priceSuffix !== null && (typeof priceSuffix !== "string" || priceSuffix.length > 40)) {
    throw new Error("Price suffix must be 40 characters or fewer");
  }
  if (candidate.visibility !== "visible" && candidate.visibility !== "hidden") {
    throw new Error("Visibility must be visible or hidden");
  }
  if (typeof candidate.featured !== "boolean") {
    throw new Error("Featured state is invalid");
  }
  const displayOrder = Number(candidate.displayOrder);
  if (!Number.isInteger(displayOrder) || displayOrder < -10_000 || displayOrder > 10_000) {
    throw new Error("Display order must be an integer between -10000 and 10000");
  }
  const platformsValue = candidate.platforms as Record<string, unknown> | undefined;
  const platforms = Object.fromEntries(
    platformNames.map((name) => [name, parsePlatform(platformsValue?.[name], name)]),
  ) as Record<PlatformName, PlatformState>;
  return {
    basePrice,
    currency: candidate.currency,
    displayOrder,
    featured: candidate.featured,
    labels: parseLabels(candidate.labels),
    platforms,
    priceSuffix,
    promotion: parsePromotion(candidate.promotion),
    visibility: candidate.visibility,
  };
}

export async function listProducts(db: D1Database): Promise<AdminProduct[]> {
  const [revisions, platforms, labels, promotions] = await db.batch([
    db.prepare(`
      SELECT p.id, p.slug, r.stage, r.base_price, r.currency, r.price_suffix,
             r.visibility, r.featured, r.display_order, r.revision_token, r.updated_at
      FROM products p JOIN product_revisions r ON r.product_id = p.id
      ORDER BY r.display_order, p.id, r.stage
    `),
    db.prepare(`
      SELECT r.product_id, r.stage, pp.platform, pp.status, pp.url
      FROM product_platforms pp JOIN product_revisions r ON r.revision_key = pp.revision_key
    `),
    db.prepare(`
      SELECT r.product_id, r.stage, pl.label
      FROM product_labels pl JOIN product_revisions r ON r.revision_key = pl.revision_key
      ORDER BY pl.created_at, pl.label
    `),
    db.prepare(`
      SELECT r.product_id, r.stage, pr.enabled, pr.discount_percent,
             pr.starts_at_utc, pr.ends_at_utc
      FROM promotions pr JOIN product_revisions r ON r.revision_key = pr.revision_key
    `),
  ]);
  const revisionRows = revisions.results as unknown as ProductRevisionRow[];
  const platformRows = platforms.results as unknown as PlatformRow[];
  const labelRows = labels.results as unknown as LabelRow[];
  const promotionRows = promotions.results as unknown as PromotionRow[];
  const productIds = [...new Set(revisionRows.map((row) => row.id))];

  return productIds.map((id) => {
    const rows = revisionRows.filter((row) => row.id === id);
    const buildRevision = (stage: "draft" | "published"): RevisionState => {
      const row = rows.find((candidate) => candidate.stage === stage);
      if (!row) {
        throw new Error(`Missing ${stage} revision for ${id}`);
      }
      const productPlatforms = emptyPlatforms();
      for (const platform of platformRows.filter((item) => item.product_id === id && item.stage === stage)) {
        productPlatforms[platform.platform] = { status: platform.status, url: platform.url };
      }
      const promotion = promotionRows.find((item) => item.product_id === id && item.stage === stage);
      return {
        basePrice: row.base_price,
        currency: row.currency,
        displayOrder: row.display_order,
        featured: Boolean(row.featured),
        labels: labelRows.filter((item) => item.product_id === id && item.stage === stage).map((item) => item.label),
        platforms: productPlatforms,
        priceSuffix: row.price_suffix,
        promotion: promotion
          ? {
              enabled: Boolean(promotion.enabled),
              discountPercent: promotion.discount_percent,
              startsAt: promotion.starts_at_utc,
              endsAt: promotion.ends_at_utc,
            }
          : { enabled: false, discountPercent: null, startsAt: null, endsAt: null },
        revisionToken: row.revision_token,
        updatedAt: row.updated_at,
        visibility: row.visibility,
      };
    };
    const draft = buildRevision("draft");
    const published = buildRevision("published");
    return {
      id,
      slug: rows[0].slug,
      draft,
      published,
      hasChanges: JSON.stringify(comparableRevision(draft)) !== JSON.stringify(comparableRevision(published)),
    };
  });
}

function auditStatements(
  db: D1Database,
  productId: string | null,
  actions: string[],
  actorEmail: string,
  before: unknown,
  after: unknown,
): D1PreparedStatement[] {
  return actions.map((action) =>
    db.prepare(`
      INSERT INTO audit_log (
        id, product_id, action, actor_email, before_json, after_json, occurred_at_utc
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(), productId, action, actorEmail,
      JSON.stringify(before), JSON.stringify(after), new Date().toISOString(),
    ),
  );
}

function changedActions(
  before: RevisionState,
  after: Omit<RevisionState, "revisionToken" | "updatedAt">,
): string[] {
  const actions = ["draft_saved"];
  if (before.basePrice !== after.basePrice) actions.push("price_changed");
  if (JSON.stringify(before.labels) !== JSON.stringify(after.labels)) actions.push("labels_changed");
  if (JSON.stringify(before.platforms) !== JSON.stringify(after.platforms)) actions.push("platform_changed");
  if (before.visibility !== after.visibility) actions.push("visibility_changed");
  if (JSON.stringify(before.promotion) !== JSON.stringify(after.promotion)) actions.push("promotion_changed");
  return actions;
}

function replaceChildStatements(
  db: D1Database,
  revisionKey: string,
  revision: Omit<RevisionState, "revisionToken" | "updatedAt">,
): D1PreparedStatement[] {
  const statements = [
    db.prepare("DELETE FROM product_labels WHERE revision_key = ?").bind(revisionKey),
    db.prepare("DELETE FROM product_platforms WHERE revision_key = ?").bind(revisionKey),
    db.prepare("DELETE FROM promotions WHERE revision_key = ?").bind(revisionKey),
  ];
  statements.push(
    ...revision.labels.map((label) =>
      db.prepare("INSERT INTO product_labels (revision_key, label) VALUES (?, ?)").bind(revisionKey, label),
    ),
  );
  statements.push(
    ...platformNames.map((name) => {
      const platform = revision.platforms[name];
      return db.prepare(`
        INSERT INTO product_platforms (revision_key, platform, status, url)
        VALUES (?, ?, ?, ?)
      `).bind(revisionKey, name, platform.status, platform.url);
    }),
  );
  statements.push(
    db.prepare(`
      INSERT INTO promotions (
        id, revision_key, enabled, discount_percent, starts_at_utc, ends_at_utc, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      `${revisionKey}:promotion`, revisionKey, Number(revision.promotion.enabled),
      revision.promotion.discountPercent, revision.promotion.startsAt,
      revision.promotion.endsAt, new Date().toISOString(),
    ),
  );
  return statements;
}

function replaceDraftChildrenConditionally(
  db: D1Database,
  productId: string,
  currentToken: string,
  revision: Omit<RevisionState, "revisionToken" | "updatedAt">,
): D1PreparedStatement[] {
  const revisionKey = `${productId}:draft`;
  const condition = `EXISTS (
    SELECT 1 FROM product_revisions d
    WHERE d.product_id = ? AND d.stage = 'draft' AND d.revision_token = ?
  )`;
  const statements = [
    db.prepare(`DELETE FROM product_labels WHERE revision_key = ? AND ${condition}`)
      .bind(revisionKey, productId, currentToken),
    db.prepare(`DELETE FROM product_platforms WHERE revision_key = ? AND ${condition}`)
      .bind(revisionKey, productId, currentToken),
    db.prepare(`DELETE FROM promotions WHERE revision_key = ? AND ${condition}`)
      .bind(revisionKey, productId, currentToken),
  ];
  statements.push(...revision.labels.map((label) => db.prepare(`
    INSERT INTO product_labels (revision_key, label)
    SELECT ?, ? WHERE ${condition}
  `).bind(revisionKey, label, productId, currentToken)));
  statements.push(...platformNames.map((name) => {
    const platform = revision.platforms[name];
    return db.prepare(`
      INSERT INTO product_platforms (revision_key, platform, status, url)
      SELECT ?, ?, ?, ? WHERE ${condition}
    `).bind(revisionKey, name, platform.status, platform.url, productId, currentToken);
  }));
  statements.push(db.prepare(`
    INSERT INTO promotions (
      id, revision_key, enabled, discount_percent, starts_at_utc, ends_at_utc, updated_at
    )
    SELECT ?, ?, ?, ?, ?, ?, ? WHERE ${condition}
  `).bind(
    `${revisionKey}:promotion`, revisionKey, Number(revision.promotion.enabled),
    revision.promotion.discountPercent, revision.promotion.startsAt, revision.promotion.endsAt,
    new Date().toISOString(), productId, currentToken,
  ));
  return statements;
}

function conditionalDraftAudits(
  db: D1Database,
  productId: string,
  currentToken: string,
  actions: string[],
  actorEmail: string,
  before: unknown,
  after: unknown,
): D1PreparedStatement[] {
  return actions.map((action) => db.prepare(`
    INSERT INTO audit_log (
      id, product_id, action, actor_email, before_json, after_json, occurred_at_utc
    )
    SELECT ?, ?, ?, ?, ?, ?, ?
    WHERE EXISTS (
      SELECT 1 FROM product_revisions d
      WHERE d.product_id = ? AND d.stage = 'draft' AND d.revision_token = ?
    )
  `).bind(
    crypto.randomUUID(), productId, action, actorEmail, JSON.stringify(before), JSON.stringify(after),
    new Date().toISOString(), productId, currentToken,
  ));
}

function copyDraftChildrenConditionally(
  db: D1Database,
  productId: string,
  expectedToken: string,
): D1PreparedStatement[] {
  const draftKey = `${productId}:draft`;
  const publishedKey = `${productId}:published`;
  const condition = `EXISTS (
    SELECT 1 FROM product_revisions d
    WHERE d.product_id = ? AND d.stage = 'draft' AND d.revision_token = ?
  )`;
  return [
    db.prepare(`DELETE FROM product_labels WHERE revision_key = ? AND ${condition}`)
      .bind(publishedKey, productId, expectedToken),
    db.prepare(`
      INSERT INTO product_labels (revision_key, label)
      SELECT ?, label FROM product_labels WHERE revision_key = ? AND ${condition}
    `).bind(publishedKey, draftKey, productId, expectedToken),
    db.prepare(`DELETE FROM product_platforms WHERE revision_key = ? AND ${condition}`)
      .bind(publishedKey, productId, expectedToken),
    db.prepare(`
      INSERT INTO product_platforms (revision_key, platform, status, url, updated_at)
      SELECT ?, platform, status, url, updated_at
      FROM product_platforms WHERE revision_key = ? AND ${condition}
    `).bind(publishedKey, draftKey, productId, expectedToken),
    db.prepare(`DELETE FROM promotions WHERE revision_key = ? AND ${condition}`)
      .bind(publishedKey, productId, expectedToken),
    db.prepare(`
      INSERT INTO promotions (
        id, revision_key, enabled, discount_percent, starts_at_utc, ends_at_utc, created_at, updated_at
      )
      SELECT ?, ?, enabled, discount_percent, starts_at_utc, ends_at_utc, created_at, updated_at
      FROM promotions WHERE revision_key = ? AND ${condition}
    `).bind(`${publishedKey}:promotion`, publishedKey, draftKey, productId, expectedToken),
  ];
}

function conditionalPublishAudit(
  db: D1Database,
  productId: string,
  expectedToken: string,
  actorEmail: string,
  before: unknown,
  after: unknown,
): D1PreparedStatement {
  return db.prepare(`
    INSERT INTO audit_log (
      id, product_id, action, actor_email, before_json, after_json, occurred_at_utc
    )
    SELECT ?, ?, 'product_published', ?, ?, ?, ?
    WHERE EXISTS (
      SELECT 1 FROM product_revisions d
      WHERE d.product_id = ? AND d.stage = 'draft' AND d.revision_token = ?
    )
  `).bind(
    crypto.randomUUID(), productId, actorEmail, JSON.stringify(before), JSON.stringify(after),
    new Date().toISOString(), productId, expectedToken,
  );
}

export async function saveDraft(
  db: D1Database,
  productId: string,
  value: unknown,
  expectedDraftRevisionToken: string,
  actorEmail: string,
): Promise<AdminProduct> {
  const products = await listProducts(db);
  const product = products.find((item) => item.id === productId);
  if (!product) throw new Error("Product not found");
  const revision = parseRevision(value);
  const now = new Date().toISOString();
  const revisionToken = crypto.randomUUID();
  const revisionKey = `${productId}:draft`;
  const results = await db.batch([
    db.prepare(`
      UPDATE product_revisions SET base_price = ?, currency = ?, price_suffix = ?,
        visibility = ?, featured = ?, display_order = ?, revision_token = ?, updated_at = ?
      WHERE product_id = ? AND stage = 'draft' AND revision_token = ?
    `).bind(
      revision.basePrice, revision.currency, revision.priceSuffix, revision.visibility,
      Number(revision.featured), revision.displayOrder, revisionToken, now, productId,
      expectedDraftRevisionToken,
    ),
    ...replaceDraftChildrenConditionally(db, productId, revisionToken, revision),
    ...conditionalDraftAudits(
      db, productId, revisionToken, changedActions(product.draft, revision), actorEmail, product.draft, revision,
    ),
  ]);
  if ((results[0].meta.changes ?? 0) !== 1) throw new Error("Draft changed. Reload before saving");
  return (await listProducts(db)).find((item) => item.id === productId)!;
}

export async function publishDraft(
  db: D1Database,
  productId: string,
  expectedDraftRevisionToken: string,
  actorEmail: string,
): Promise<AdminProduct> {
  const products = await listProducts(db);
  const product = products.find((item) => item.id === productId);
  if (!product) throw new Error("Product not found");
  if (product.draft.revisionToken !== expectedDraftRevisionToken) throw new Error("Draft changed. Reload before publishing");
  if (!product.hasChanges) throw new Error("There are no unpublished changes");
  const now = new Date().toISOString();
  const publishedRevisionToken = crypto.randomUUID();
  const results = await db.batch([
    db.prepare(`
      UPDATE product_revisions SET
        base_price = (SELECT base_price FROM product_revisions WHERE product_id = ? AND stage = 'draft'),
        currency = (SELECT currency FROM product_revisions WHERE product_id = ? AND stage = 'draft'),
        price_suffix = (SELECT price_suffix FROM product_revisions WHERE product_id = ? AND stage = 'draft'),
        visibility = (SELECT visibility FROM product_revisions WHERE product_id = ? AND stage = 'draft'),
        featured = (SELECT featured FROM product_revisions WHERE product_id = ? AND stage = 'draft'),
        display_order = (SELECT display_order FROM product_revisions WHERE product_id = ? AND stage = 'draft'),
        revision_token = ?, updated_at = ?, published_at = ?
      WHERE product_id = ? AND stage = 'published'
        AND EXISTS (
          SELECT 1 FROM product_revisions d
          WHERE d.product_id = ? AND d.stage = 'draft' AND d.revision_token = ?
        )
    `).bind(
      productId, productId, productId, productId, productId, productId,
      publishedRevisionToken, now, now, productId, productId, expectedDraftRevisionToken,
    ),
    ...copyDraftChildrenConditionally(db, productId, expectedDraftRevisionToken),
    conditionalPublishAudit(
      db, productId, expectedDraftRevisionToken, actorEmail, product.published, product.draft,
    ),
  ]);
  if ((results[0].meta.changes ?? 0) !== 1) throw new Error("Draft changed. Reload before publishing");
  return (await listProducts(db)).find((item) => item.id === productId)!;
}

export async function discardDraft(
  db: D1Database,
  productId: string,
  expectedDraftRevisionToken: string,
  actorEmail: string,
): Promise<AdminProduct> {
  const products = await listProducts(db);
  const product = products.find((item) => item.id === productId);
  if (!product) throw new Error("Product not found");
  const draftKey = `${productId}:draft`;
  const state = comparableRevision(product.published) as Omit<RevisionState, "revisionToken" | "updatedAt">;
  const now = new Date().toISOString();
  const revisionToken = crypto.randomUUID();
  const results = await db.batch([
    db.prepare(`
      UPDATE product_revisions SET base_price = ?, currency = ?, price_suffix = ?,
        visibility = ?, featured = ?, display_order = ?, revision_token = ?, updated_at = ?
      WHERE product_id = ? AND stage = 'draft' AND revision_token = ?
    `).bind(
      state.basePrice, state.currency, state.priceSuffix, state.visibility,
      Number(state.featured), state.displayOrder, revisionToken, now, productId,
      expectedDraftRevisionToken,
    ),
    ...replaceDraftChildrenConditionally(db, productId, revisionToken, state),
    ...conditionalDraftAudits(
      db, productId, revisionToken, ["draft_discarded"], actorEmail, product.draft, product.published,
    ),
  ]);
  if ((results[0].meta.changes ?? 0) !== 1) throw new Error("Draft changed. Reload before discarding");
  return (await listProducts(db)).find((item) => item.id === productId)!;
}

export async function endAllSales(db: D1Database, actorEmail: string): Promise<number> {
  const products = await listProducts(db);
  const affected = products.filter((product) => product.draft.promotion.enabled || product.published.promotion.enabled);
  if (affected.length === 0) return 0;
  const now = new Date().toISOString();
  await db.batch([
    db.prepare(`
      UPDATE product_revisions
      SET revision_token = lower(hex(randomblob(16))), updated_at = ?
      WHERE revision_key IN (SELECT revision_key FROM promotions WHERE enabled = 1)
    `).bind(now),
    db.prepare("UPDATE promotions SET enabled = 0, updated_at = ? WHERE enabled = 1").bind(now),
    ...affected.flatMap((product) => auditStatements(
      db, product.id, ["all_sales_ended"], actorEmail,
      { draft: product.draft.promotion, published: product.published.promotion },
      { enabled: false },
    )),
  ]);
  return affected.length;
}
