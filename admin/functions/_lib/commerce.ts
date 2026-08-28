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

export interface ListingContent {
  title: string;
  category: string;
  kind: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  features: string[];
  technicalInfo: Array<{ label: string; value: string }>;
  detailSections: Array<{ title: string; text: string }>;
  youtubeVideoId: string | null;
}

export interface AdminProduct {
  id: string;
  slug: string;
  draft: RevisionState;
  published: RevisionState;
  hasChanges: boolean;
  content: ListingContent;
  media: Array<{ id: string; role: "card" | "hero" | "gallery"; order: number; alt: string }>;
  archivedAt: string | null;
  isDraftOnly: boolean;
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
  content_json: string;
  archived_at: string | null;
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

interface MediaRow extends ChildRow {
  media_id: string;
  role: "card" | "hero" | "gallery";
  display_order: number;
  alt_text: string;
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

function emptyContent(): ListingContent {
  return { title: "Untitled listing", category: "assets", kind: "Other", shortDescription: "", longDescription: "", tags: [], features: [], technicalInfo: [], detailSections: [], youtubeVideoId: null };
}

function parseContent(value: string): ListingContent {
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return emptyContent();
    const content = parsed as Partial<ListingContent>;
    return {
      ...emptyContent(), ...content,
      tags: Array.isArray(content.tags) ? content.tags.filter((item): item is string => typeof item === "string") : [],
      features: Array.isArray(content.features) ? content.features.filter((item): item is string => typeof item === "string") : [],
      technicalInfo: Array.isArray(content.technicalInfo) ? content.technicalInfo.filter((item): item is { label: string; value: string } => Boolean(item && typeof item === "object" && typeof item.label === "string" && typeof item.value === "string")) : [],
      detailSections: Array.isArray(content.detailSections) ? content.detailSections.filter((item): item is { title: string; text: string } => Boolean(item && typeof item === "object" && typeof item.title === "string" && typeof item.text === "string")) : [],
      youtubeVideoId: typeof content.youtubeVideoId === "string" ? content.youtubeVideoId : null,
    };
  } catch { return emptyContent(); }
}

export function parseListingContent(value: unknown): ListingContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Listing content is required");
  const candidate = value as Record<string, unknown>;
  const text = (field: string, max: number): string => {
    const result = candidate[field];
    if (typeof result !== "string" || result.length > max) throw new Error(`${field} must be text with at most ${max} characters`);
    return result.trim();
  };
  const list = (field: string, maxItems: number, maxLength: number): string[] => {
    const result = candidate[field];
    if (!Array.isArray(result) || result.length > maxItems) throw new Error(`${field} must be a list`);
    return [...new Set(result.map((item) => {
      if (typeof item !== "string" || item.trim().length === 0 || item.length > maxLength) throw new Error(`${field} contains invalid text`);
      return item.trim();
    }))];
  };
  const youtube = candidate.youtubeVideoId == null || candidate.youtubeVideoId === "" ? null : candidate.youtubeVideoId;
  if (youtube !== null && (typeof youtube !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(youtube))) throw new Error("YouTube video ID is invalid");
  const technicalInfo = candidate.technicalInfo;
  if (!Array.isArray(technicalInfo) || technicalInfo.length > 30 || technicalInfo.some((item) => !item || typeof item !== "object" || typeof (item as any).label !== "string" || typeof (item as any).value !== "string" || (item as any).label.length > 80 || (item as any).value.length > 500)) throw new Error("Technical information is invalid");
  const detailSections = candidate.detailSections;
  if (!Array.isArray(detailSections) || detailSections.length > 20 || detailSections.some((item) => !item || typeof item !== "object" || typeof (item as any).title !== "string" || typeof (item as any).text !== "string" || (item as any).title.length > 120 || (item as any).text.length > 3000)) throw new Error("Detail sections are invalid");
  return {
    title: text("title", 160), category: text("category", 40), kind: text("kind", 60),
    shortDescription: text("shortDescription", 500), longDescription: text("longDescription", 5000),
    tags: list("tags", 20, 40), features: list("features", 30, 500),
    technicalInfo: technicalInfo as ListingContent["technicalInfo"], detailSections: detailSections as ListingContent["detailSections"],
    youtubeVideoId: youtube as string | null,
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

function parseSlug(value: unknown): string {
  if (typeof value !== "string") throw new Error("Slug is required");
  const slug = value.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) throw new Error("Slug must use lowercase letters, numbers, and single hyphens");
  return slug;
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
  const [revisions, platforms, labels, promotions, media] = await db.batch([
    db.prepare(`
      SELECT p.id, p.slug, r.stage, r.base_price, r.currency, r.price_suffix,
             r.visibility, r.featured, r.display_order, r.revision_token, r.updated_at, r.content_json, p.archived_at
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
    db.prepare(`
      SELECT r.product_id, r.stage, m.media_id, m.role, m.display_order, m.alt_text
      FROM product_revision_media m JOIN product_revisions r ON r.revision_key = m.revision_key
      ORDER BY m.display_order, m.media_id
    `),
  ]);
  const revisionRows = revisions.results as unknown as ProductRevisionRow[];
  const platformRows = platforms.results as unknown as PlatformRow[];
  const labelRows = labels.results as unknown as LabelRow[];
  const promotionRows = promotions.results as unknown as PromotionRow[];
  const mediaRows = media.results as unknown as MediaRow[];
  const productIds = [...new Set(revisionRows.map((row) => row.id))];

  return productIds.map((id) => {
    const rows = revisionRows.filter((row) => row.id === id);
    const buildRevision = (stage: "draft" | "published"): RevisionState => {
      const row = rows.find((candidate) => candidate.stage === stage);
      if (!row) {
        return { basePrice: null, currency: "USD", displayOrder: 0, featured: false, labels: [], platforms: emptyPlatforms(), priceSuffix: null, promotion: { enabled: false, discountPercent: null, startsAt: null, endsAt: null }, revisionToken: "", updatedAt: "", visibility: "hidden" };
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
    const contentRow = rows.find((row) => row.stage === "draft") ?? rows[0];
    const draftContent = parseContent(contentRow.content_json);
    const publishedContent = parseContent(rows.find((row) => row.stage === "published")?.content_json ?? "{}");
    const productMedia = mediaRows.filter((item) => item.product_id === id && item.stage === "draft").map((item) => ({ id: item.media_id, role: item.role, order: item.display_order, alt: item.alt_text }));
    return {
      id,
      slug: rows[0].slug,
      draft,
      published,
      hasChanges: !rows.some((row) => row.stage === "published") || JSON.stringify(comparableRevision(draft)) !== JSON.stringify(comparableRevision(published)) || JSON.stringify(draftContent) !== JSON.stringify(publishedContent),
      content: draftContent,
      media: productMedia,
      archivedAt: contentRow.archived_at,
      isDraftOnly: !rows.some((row) => row.stage === "published"),
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

function copyDraftMediaConditionally(db: D1Database, productId: string, expectedToken: string): D1PreparedStatement[] {
  const draftKey = `${productId}:draft`;
  const publishedKey = `${productId}:published`;
  const condition = `EXISTS (SELECT 1 FROM product_revisions d WHERE d.product_id = ? AND d.stage = 'draft' AND d.revision_token = ?)`;
  return [
    db.prepare(`DELETE FROM product_revision_media WHERE revision_key = ? AND ${condition}`).bind(publishedKey, productId, expectedToken),
    db.prepare(`INSERT INTO product_revision_media (revision_key, media_id, role, display_order, alt_text) SELECT ?, media_id, role, display_order, alt_text FROM product_revision_media WHERE revision_key = ? AND ${condition}`).bind(publishedKey, draftKey, productId, expectedToken),
  ];
}

function copyDraftToNewPublished(db: D1Database, productId: string, expectedToken: string, publishedToken: string, now: string): D1PreparedStatement[] {
  const draftKey = `${productId}:draft`;
  const publishedKey = `${productId}:published`;
  const condition = `EXISTS (SELECT 1 FROM product_revisions d WHERE d.product_id = ? AND d.stage = 'draft' AND d.revision_token = ?)`;
  return [
    db.prepare(`
      INSERT INTO product_revisions (
        revision_key, product_id, stage, base_price, currency, price_suffix,
        visibility, featured, display_order, content_json, revision_token,
        updated_at, published_at
      )
      SELECT ?, product_id, 'published', base_price, currency, price_suffix,
        visibility, featured, display_order, content_json, ?, ?, ?
      FROM product_revisions
      WHERE product_id = ? AND stage = 'draft' AND revision_token = ?
    `).bind(publishedKey, publishedToken, now, now, productId, expectedToken),
    db.prepare(`
      INSERT INTO product_labels (revision_key, label)
      SELECT ?, label FROM product_labels WHERE revision_key = ? AND ${condition}
    `).bind(publishedKey, draftKey, productId, expectedToken),
    db.prepare(`
      INSERT INTO product_platforms (revision_key, platform, status, url, updated_at)
      SELECT ?, platform, status, url, updated_at
      FROM product_platforms WHERE revision_key = ? AND ${condition}
    `).bind(publishedKey, draftKey, productId, expectedToken),
    db.prepare(`
      INSERT INTO promotions (
        id, revision_key, enabled, discount_percent, starts_at_utc, ends_at_utc, created_at, updated_at
      )
      SELECT ?, ?, enabled, discount_percent, starts_at_utc, ends_at_utc, created_at, updated_at
      FROM promotions WHERE revision_key = ? AND ${condition}
    `).bind(`${publishedKey}:promotion`, publishedKey, draftKey, productId, expectedToken),
    db.prepare(`
      INSERT INTO product_revision_media (revision_key, media_id, role, display_order, alt_text)
      SELECT ?, media_id, role, display_order, alt_text
      FROM product_revision_media WHERE revision_key = ? AND ${condition}
    `).bind(publishedKey, draftKey, productId, expectedToken),
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
  const content = parseListingContent((value as Record<string, unknown>).content ?? product.content);
  const now = new Date().toISOString();
  const revisionToken = crypto.randomUUID();
  const revisionKey = `${productId}:draft`;
  const results = await db.batch([
    db.prepare(`
      UPDATE product_revisions SET base_price = ?, currency = ?, price_suffix = ?,
        visibility = ?, featured = ?, display_order = ?, content_json = ?, revision_token = ?, updated_at = ?
      WHERE product_id = ? AND stage = 'draft' AND revision_token = ?
    `).bind(
      revision.basePrice, revision.currency, revision.priceSuffix, revision.visibility,
      Number(revision.featured), revision.displayOrder, JSON.stringify(content), revisionToken, now, productId,
      expectedDraftRevisionToken,
    ),
    ...replaceDraftChildrenConditionally(db, productId, revisionToken, revision),
    ...conditionalDraftAudits(
      db, productId, revisionToken, [...changedActions(product.draft, revision), ...(JSON.stringify(product.content) !== JSON.stringify(content) ? ["content_changed"] : [])], actorEmail, product.draft, { ...revision, content },
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
  const statements = product.isDraftOnly
    ? copyDraftToNewPublished(db, productId, expectedDraftRevisionToken, publishedRevisionToken, now)
    : [
        db.prepare(`
          UPDATE product_revisions SET
            base_price = (SELECT base_price FROM product_revisions WHERE product_id = ? AND stage = 'draft'),
            currency = (SELECT currency FROM product_revisions WHERE product_id = ? AND stage = 'draft'),
            price_suffix = (SELECT price_suffix FROM product_revisions WHERE product_id = ? AND stage = 'draft'),
            visibility = (SELECT visibility FROM product_revisions WHERE product_id = ? AND stage = 'draft'),
            featured = (SELECT featured FROM product_revisions WHERE product_id = ? AND stage = 'draft'),
            display_order = (SELECT display_order FROM product_revisions WHERE product_id = ? AND stage = 'draft'),
            content_json = (SELECT content_json FROM product_revisions WHERE product_id = ? AND stage = 'draft'),
            revision_token = ?, updated_at = ?, published_at = ?
          WHERE product_id = ? AND stage = 'published'
            AND EXISTS (
              SELECT 1 FROM product_revisions d
              WHERE d.product_id = ? AND d.stage = 'draft' AND d.revision_token = ?
            )
        `).bind(
          productId, productId, productId, productId, productId, productId, productId,
          publishedRevisionToken, now, now, productId, productId, expectedDraftRevisionToken,
        ),
        ...copyDraftChildrenConditionally(db, productId, expectedDraftRevisionToken),
        ...copyDraftMediaConditionally(db, productId, expectedDraftRevisionToken),
      ];
  const results = await db.batch([
    ...statements,
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
  if (product.isDraftOnly) throw new Error("Draft-only listings cannot be discarded before publishing");
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

export async function createProduct(db: D1Database, value: unknown, actorEmail: string): Promise<AdminProduct> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Listing is invalid");
  const candidate = value as Record<string, unknown>;
  const id = crypto.randomUUID();
  const slug = parseSlug(candidate.slug);
  const content = parseListingContent(candidate.content);
  const revision = parseRevision({
    basePrice: candidate.basePrice ?? null, currency: candidate.currency ?? "USD", priceSuffix: candidate.priceSuffix ?? null,
    visibility: "hidden", featured: false, displayOrder: candidate.displayOrder ?? 0,
    labels: candidate.labels ?? [], platforms: candidate.platforms ?? emptyPlatforms(),
    promotion: candidate.promotion ?? { enabled: false, discountPercent: null, startsAt: null, endsAt: null },
  });
  const revisionKey = `${id}:draft`;
  const token = crypto.randomUUID();
  try {
    await db.batch([
      db.prepare("INSERT INTO products (id, slug) VALUES (?, ?)").bind(id, slug),
      db.prepare("INSERT INTO product_revisions (revision_key, product_id, stage, base_price, currency, price_suffix, visibility, featured, display_order, content_json, revision_token) VALUES (?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?)").bind(revisionKey, id, revision.basePrice, revision.currency, revision.priceSuffix, revision.visibility, Number(revision.featured), revision.displayOrder, JSON.stringify(content), token),
      ...replaceChildStatements(db, revisionKey, revision),
      ...auditStatements(db, id, ["product_created"], actorEmail, null, { slug, content }),
    ]);
  } catch (error) {
    throw error;
  }
  return (await listProducts(db)).find((product) => product.id === id)!;
}

export async function archiveProduct(db: D1Database, productId: string, actorEmail: string): Promise<AdminProduct> {
  const product = (await listProducts(db)).find((item) => item.id === productId);
  if (!product) throw new Error("Product not found");
  await db.batch([
    db.prepare("UPDATE products SET archived_at = ? WHERE id = ? AND archived_at IS NULL").bind(new Date().toISOString(), productId),
    db.prepare("UPDATE product_revisions SET visibility = 'hidden', revision_token = lower(hex(randomblob(16))), updated_at = ? WHERE product_id = ?").bind(new Date().toISOString(), productId),
    ...auditStatements(db, productId, ["product_archived"], actorEmail, { archivedAt: product.archivedAt }, { archivedAt: "now" }),
  ]);
  return (await listProducts(db)).find((item) => item.id === productId)!;
}

export async function restoreProduct(db: D1Database, productId: string, actorEmail: string): Promise<AdminProduct> {
  const product = (await listProducts(db)).find((item) => item.id === productId);
  if (!product) throw new Error("Product not found");
  await db.batch([
    db.prepare("UPDATE products SET archived_at = NULL WHERE id = ?").bind(productId),
    db.prepare("UPDATE product_revisions SET visibility = 'hidden', revision_token = lower(hex(randomblob(16))), updated_at = ? WHERE product_id = ?").bind(new Date().toISOString(), productId),
    ...auditStatements(db, productId, ["product_restored"], actorEmail, { archivedAt: product.archivedAt }, { archivedAt: null, visibility: "hidden" }),
  ]);
  return (await listProducts(db)).find((item) => item.id === productId)!;
}

export async function deleteDraftProduct(db: D1Database, bucket: R2Bucket, productId: string, actorEmail: string): Promise<void> {
  const product = (await listProducts(db)).find((item) => item.id === productId);
  if (!product) throw new Error("Product not found");
  const published = await db.prepare("SELECT 1 FROM product_revisions WHERE product_id = ? AND stage = 'published'").bind(productId).first();
  const analytics = await db.prepare("SELECT 1 FROM analytics_events WHERE product_id = ? LIMIT 1").bind(productId).first();
  if (published || analytics || product.archivedAt) throw new Error("Only an unpublished draft with no history can be deleted");
  const media = await db.prepare("SELECT m.r2_key FROM media_objects m JOIN product_revision_media rm ON rm.media_id = m.id WHERE rm.revision_key = ?").bind(`${productId}:draft`).all<{ r2_key: string }>();
  await Promise.all(media.results.map((row) => bucket.delete(row.r2_key)));
  await db.batch([
    db.prepare("DELETE FROM media_objects WHERE id IN (SELECT media_id FROM product_revision_media WHERE revision_key = ?)").bind(`${productId}:draft`),
    db.prepare("DELETE FROM products WHERE id = ?").bind(productId),
    ...auditStatements(db, null, ["draft_deleted"], actorEmail, { productId }, null),
  ]);
}

export async function removeDraftMedia(db: D1Database, mediaId: string, productId: string, actorEmail: string): Promise<void> {
  const reference = await db.prepare("SELECT 1 FROM product_revision_media WHERE revision_key = ? AND media_id = ?").bind(`${productId}:draft`, mediaId).first();
  if (!reference) throw new Error("Draft media reference not found");
  await db.batch([
    db.prepare("DELETE FROM product_revision_media WHERE revision_key = ? AND media_id = ?").bind(`${productId}:draft`, mediaId),
    db.prepare("UPDATE media_objects SET orphaned_at = COALESCE(orphaned_at, ?) WHERE id = ? AND NOT EXISTS (SELECT 1 FROM product_revision_media WHERE media_id = ?)").bind(new Date().toISOString(), mediaId, mediaId),
    ...auditStatements(db, productId, ["media_removed"], actorEmail, { mediaId }, null),
  ]);
}

export async function reorderDraftMedia(db: D1Database, productId: string, mediaIds: unknown[], actorEmail: string): Promise<void> {
  if (!Array.isArray(mediaIds) || mediaIds.length > 100 || mediaIds.some((id) => typeof id !== "string")) throw new Error("Media order is invalid");
  const rows = await db.prepare("SELECT media_id FROM product_revision_media WHERE revision_key = ? AND role = 'gallery'").bind(`${productId}:draft`).all<{ media_id: string }>();
  const existing = new Set(rows.results.map((row) => row.media_id));
  if (mediaIds.length !== existing.size || mediaIds.some((id) => !existing.has(id as string))) throw new Error("Media order does not match the draft gallery");
  await db.batch([
    ...(mediaIds as string[]).map((id, index) => db.prepare("UPDATE product_revision_media SET display_order = ? WHERE revision_key = ? AND media_id = ? AND role = 'gallery'").bind(index, `${productId}:draft`, id)),
    ...auditStatements(db, productId, ["media_reordered"], actorEmail, null, { mediaIds }),
  ]);
}
