import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgePercent,
  BarChart3,
  Check,
  Clock3,
  ExternalLink,
  Eye,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { formatCurrency, getProductLabels, getProductPricing, isPromotionActive } from "../../src/storeUtils.js";
import { adminApi } from "./api.js";
import { productInfo } from "./catalog.js";
import {
  bucharestNowInput,
  bucharestTimeZone,
  formatBucharest,
  toBucharestInput,
  toUtcIsoFromBucharest,
} from "./time.js";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "promotions", label: "Promotions", icon: BadgePercent },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];
const platformNames = ["direct", "itch", "unity"];
const statusOptions = ["available", "coming-soon", "pending-review", "unavailable"];
const promotionPresets = [10, 20, 25, 30, 40, 50];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function statusLabel(value) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function promotionStatus(promotion, now = new Date()) {
  if (!promotion.enabled) return "inactive";
  if (promotion.startsAt && now < new Date(promotion.startsAt)) return "scheduled";
  if (promotion.endsAt && now > new Date(promotion.endsAt)) return "expired";
  return "active";
}

function StatusPill({ children, tone = "neutral" }) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="error-banner" role="alert">
      <AlertTriangle size={18} />
      <span>{message}</span>
      {onRetry ? <button onClick={onRetry} type="button"><RefreshCw size={16} /> Retry</button> : null}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Dashboard({ data, products, onEdit, onEndAllSales }) {
  if (!data) return <p className="loading-state">Loading dashboard...</p>;
  const names = Object.fromEntries(products.map((product) => [product.id, productInfo(product.id, product).title]));
  return (
    <div className="workspace-stack">
      <div className="page-heading">
        <div><h1>Dashboard</h1><p>Live store state and recent administrative activity.</p></div>
        <button className="danger-button" onClick={onEndAllSales} type="button"><AlertTriangle size={17} /> End all sales</button>
      </div>
      <section className="metrics-grid" aria-label="Store metrics">
        <Metric label="Total products" value={data.metrics.totalProducts} />
        <Metric label="Published products" value={data.metrics.publishedProducts} />
        <Metric label="Products on sale" value={data.metrics.productsOnSale} />
        <Metric label="Scheduled promotions" value={data.metrics.scheduledPromotions} />
        <Metric label="Store views" value={data.metrics.storeViews} />
        <Metric label="Product views" value={data.metrics.productViews} />
        <Metric label="Marketplace clicks" value={data.metrics.marketplaceClicks} />
      </section>
      <div className="dashboard-columns">
        <section className="workspace-panel">
          <div className="panel-heading"><h2>Active promotions</h2><StatusPill tone="sale">Live</StatusPill></div>
          {data.activePromotions.length ? data.activePromotions.map((item) => {
            const price = item.basePrice * (1 - item.promotion.discountPercent / 100);
            return (
              <button className="promotion-row" key={item.productId} onClick={() => onEdit(item.productId)} type="button">
                <span><strong>{names[item.productId]}</strong><small>{item.promotion.discountPercent}% off</small></span>
                <span><strong>{formatCurrency(price)}</strong><small>{formatBucharest(item.promotion.endsAt)}</small></span>
              </button>
            );
          }) : <EmptyState title="No active sales" text="Published promotions will appear here when their schedule is active." />}
        </section>
        <section className="workspace-panel">
          <div className="panel-heading"><h2>Scheduled promotions</h2><Clock3 size={18} /></div>
          {data.scheduledPromotions.length ? data.scheduledPromotions.map((item) => (
            <button className="promotion-row" key={item.productId} onClick={() => onEdit(item.productId)} type="button">
              <span><strong>{names[item.productId]}</strong><small>{item.promotion.discountPercent}% off</small></span>
              <span><small>Starts {formatBucharest(item.promotion.startsAt)}</small><small>Ends {formatBucharest(item.promotion.endsAt)}</small></span>
            </button>
          )) : <EmptyState title="Nothing scheduled" text="Future promotions will appear here." />}
        </section>
      </div>
      <section className="workspace-panel activity-panel">
        <div className="panel-heading"><h2>Recent activity</h2></div>
        {data.recentActivity.length ? (
          <div className="activity-list">
            {data.recentActivity.map((item) => (
              <div className="activity-row" key={item.id}>
                <span className="activity-mark"><Check size={15} /></span>
                <div><strong>{statusLabel(item.action)}</strong><p>{item.product_id ? names[item.product_id] : "Store"}</p></div>
                <time>{formatBucharest(item.occurred_at_utc)}</time>
              </div>
            ))}
          </div>
        ) : <EmptyState title="No activity yet" text="Draft, publishing, price, and promotion changes will be recorded here." />}
      </section>
    </div>
  );
}

function Products({ products, onEdit, onNew, onArchive, onRestore, onDelete }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("order");
  const visibleProducts = useMemo(() => products
    .filter((product) => {
      const info = productInfo(product.id, product);
      const textMatch = `${info.title} ${product.id} ${info.category}`.toLowerCase().includes(query.toLowerCase());
      const state = product.draft;
      const matches = {
        all: true,
        published: product.published.visibility === "visible",
        draft: product.hasChanges,
        hidden: state.visibility === "hidden",
        archived: Boolean(product.archivedAt),
        sale: isPromotionActive(state.promotion),
        featured: state.featured,
        "unity-pending": state.platforms.unity.status === "pending-review",
        "itch-available": state.platforms.itch.status === "available",
      };
      return textMatch && matches[filter];
    })
    .sort((a, b) => {
      if (sort === "name") return productInfo(a.id, a).title.localeCompare(productInfo(b.id, b).title);
      if (sort === "updated") return b.draft.updatedAt.localeCompare(a.draft.updatedAt);
      return a.draft.displayOrder - b.draft.displayOrder;
    }), [filter, products, query, sort]);

  return (
    <div className="workspace-stack">
      <div className="page-heading"><div><h1>Products</h1><p>Manage structured listings, commerce, and marketing media.</p></div><button className="primary-button" onClick={onNew} type="button"><Plus size={17} /> New listing</button></div>
      <div className="toolbar">
        <label className="search-field"><Search size={17} /><span className="sr-only">Search products</span><input onChange={(event) => setQuery(event.target.value)} placeholder="Search products" type="search" value={query} /></label>
        <label><span className="sr-only">Filter products</span><select onChange={(event) => setFilter(event.target.value)} value={filter}>
          <option value="all">All</option><option value="published">Published</option><option value="draft">Draft changes</option><option value="hidden">Hidden</option><option value="archived">Archived</option><option value="sale">On sale</option><option value="featured">Featured</option><option value="unity-pending">Unity pending</option><option value="itch-available">itch.io available</option>
        </select></label>
        <label><span className="sr-only">Sort products</span><select onChange={(event) => setSort(event.target.value)} value={sort}><option value="order">Display order</option><option value="name">Name</option><option value="updated">Last updated</option></select></label>
      </div>
      <section className="product-table" aria-label="Products">
        {visibleProducts.map((product) => {
          const info = productInfo(product.id, product);
          const pricing = getProductPricing(product.draft);
          return (
            <article className="product-row" key={product.id}>
              <img src={info.image} alt="" />
              <div className="product-identity"><strong>{info.title}</strong><code>{product.id}</code></div>
              <div><span className="cell-label">Price</span><strong>{formatCurrency(pricing.currentPrice, product.draft.currency)}</strong>{pricing.promotionActive ? <small>{pricing.discountPercent}% off</small> : null}</div>
              <div><span className="cell-label">State</span><StatusPill tone={product.hasChanges ? "warning" : "success"}>{product.hasChanges ? "Draft changes" : "Live"}</StatusPill></div>
              <div><span className="cell-label">Marketplaces</span><small>itch.io: {statusLabel(product.draft.platforms.itch.status)}</small><small>Unity: {statusLabel(product.draft.platforms.unity.status)}</small></div>
              <div className="row-actions"><button className="secondary-button" onClick={() => onEdit(product.id)} type="button">Edit</button>{product.archivedAt ? <button className="secondary-button" onClick={() => onRestore(product.id)} type="button">Restore</button> : <button className="secondary-button" onClick={() => onArchive(product.id)} type="button">Archive</button>}{product.isDraftOnly ? <button className="icon-button" onClick={() => onDelete(product.id)} title="Delete unpublished draft" type="button"><Trash2 size={17} /></button> : null}<a className="icon-button" href={`https://ballai.dev/#store/${product.slug}`} rel="noopener noreferrer" target="_blank" title="View live product"><ExternalLink size={17} /></a></div>
            </article>
          );
        })}
      </section>
      {!visibleProducts.length ? <EmptyState title="No matching products" text="Try another search or filter." /> : null}
    </div>
  );
}

function ListingContentFields({ content, onChange }) {
  const update = (field, value) => onChange({ ...content, [field]: value });
  return <fieldset className="editor-section"><legend>Listing content</legend><div className="form-grid two">
    <label><span>Title</span><input maxLength="160" onChange={(event) => update("title", event.target.value)} value={content.title} /></label>
    <label><span>Kind</span><input maxLength="60" onChange={(event) => update("kind", event.target.value)} value={content.kind} /></label>
    <label><span>Category</span><input maxLength="40" onChange={(event) => update("category", event.target.value)} value={content.category} /></label>
    <label><span>YouTube URL or video ID</span><input maxLength="200" onChange={(event) => update("youtubeVideoId", event.target.value)} placeholder="https://www.youtube.com/watch?v=..." value={content.youtubeVideoId ?? ""} /></label>
    <label className="wide"><span>Short description</span><textarea maxLength="500" onChange={(event) => update("shortDescription", event.target.value)} rows="2" value={content.shortDescription} /></label>
    <label className="wide"><span>Long description</span><textarea maxLength="5000" onChange={(event) => update("longDescription", event.target.value)} rows="5" value={content.longDescription} /></label>
    <label className="wide"><span>Tags, one per line</span><textarea onChange={(event) => update("tags", event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))} rows="3" value={content.tags.join("\n")} /></label>
    <label className="wide"><span>Features, one per line</span><textarea onChange={(event) => update("features", event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))} rows="4" value={content.features.join("\n")} /></label>
  </div></fieldset>;
}

function MediaManager({ product, onChanged }) {
  const [role, setRole] = useState("gallery");
  const [status, setStatus] = useState("");
  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setStatus("Uploading...");
    try {
      const form = new FormData();
      form.append("productId", product.id); form.append("role", role); form.append("displayOrder", String(product.media.filter((item) => item.role === role).length)); form.append("altText", file.name.replace(/\.[^.]+$/, "")); form.append("file", file);
      const result = await adminApi.uploadMedia(form);
      onChanged({ ...product, media: [...product.media, result.media] }); setStatus("Upload complete");
    } catch (error) { setStatus(error.message); }
  };
  const remove = async (item) => { setStatus("Removing..."); try { await adminApi.removeMedia(item.id, product.id); onChanged({ ...product, media: product.media.filter((media) => media.id !== item.id || media.role !== item.role) }); setStatus("Media removed from draft"); } catch (error) { setStatus(error.message); } };
  const move = async (item, direction) => { const gallery = product.media.filter((media) => media.role === "gallery"); const index = gallery.findIndex((media) => media.id === item.id); const target = index + direction; if (target < 0 || target >= gallery.length) return; [gallery[index], gallery[target]] = [gallery[target], gallery[index]]; try { await adminApi.reorderMedia(product.id, gallery.map((media) => media.id)); onChanged({ ...product, media: [...product.media.filter((media) => media.role !== "gallery"), ...gallery.map((media, order) => ({ ...media, order }))] }); } catch (error) { setStatus(error.message); } };
  return <fieldset className="editor-section"><legend>Media</legend><div className="media-upload-row"><label><span>Role</span><select onChange={(event) => setRole(event.target.value)} value={role}><option value="card">Card</option><option value="hero">Hero</option><option value="gallery">Gallery</option></select></label><label className="secondary-button"><Plus size={16} /> Upload image<input accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={upload} type="file" /></label><small>{status || "PNG, JPEG, WebP, or GIF up to 10 MB"}</small></div><div className="media-strip">{product.media.map((item) => <figure key={`${item.role}-${item.id}`}><img alt={item.alt} src={`/api/admin/media/${item.id}`} /><figcaption>{item.role} <button className="icon-button" onClick={() => remove(item)} title="Remove from draft" type="button"><Trash2 size={12} /></button>{item.role === "gallery" ? <><button className="icon-button" onClick={() => move(item, -1)} title="Move gallery image left" type="button">↑</button><button className="icon-button" onClick={() => move(item, 1)} title="Move gallery image right" type="button">↓</button></> : null}</figcaption></figure>)}</div></fieldset>;
}

function NewListing({ onCancel, onCreated }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [kind, setKind] = useState("Unity Asset");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const changeTitle = (value) => { setTitle(value); if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80)); };
  const create = async () => {
    setBusy(true); setError("");
    try {
      const result = await adminApi.createProduct({ slug, content: { title, category: "assets", kind, shortDescription: "", longDescription: "", tags: [], features: [], technicalInfo: [], detailSections: [], youtubeVideoId: null }, basePrice: 0, currency: "USD", priceSuffix: null, labels: [], platforms: { direct: { status: "coming-soon", url: null }, itch: { status: "coming-soon", url: null }, unity: { status: "pending-review", url: null } }, promotion: { enabled: false, discountPercent: null, startsAt: null, endsAt: null } });
      onCreated(result.product);
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };
  return <div className="workspace-stack editor-workspace"><div className="page-heading"><div><h1>New listing</h1><p>Create a private draft, then complete its content and media.</p></div></div><section className="editor-section"><div className="form-grid two"><label><span>Title</span><input autoFocus onChange={(event) => changeTitle(event.target.value)} value={title} /></label><label><span>Slug</span><input onChange={(event) => setSlug(event.target.value)} value={slug} /></label><label><span>Kind</span><select onChange={(event) => setKind(event.target.value)} value={kind}><option>Unity Asset</option><option>Pixel Art Asset</option><option>Game</option><option>Tool</option><option>Other</option></select></label></div>{error ? <div className="error-banner" role="alert">{error}</div> : null}<div className="editor-actions"><button className="secondary-button" onClick={onCancel} type="button">Cancel</button><button className="primary-button" disabled={busy || !title.trim() || !slug.trim()} onClick={create} type="button"><Plus size={17} /> {busy ? "Creating..." : "Create draft"}</button></div></section></div>;
}

function PromotionFields({ draft, setDraft }) {
  const promotion = draft.promotion;
  const updatePromotion = (patch) => setDraft((current) => ({ ...current, promotion: { ...current.promotion, ...patch } }));
  return (
    <fieldset className="editor-section">
      <legend>Promotion</legend>
      <label className="toggle-row"><span><strong>Enable promotion</strong><small>SALE is calculated automatically while the schedule is active.</small></span><input checked={promotion.enabled} onChange={(event) => updatePromotion({ enabled: event.target.checked })} type="checkbox" /></label>
      <div className="price-calculation"><span>Base price <strong>{formatCurrency(Number(draft.basePrice || 0), draft.currency)}</strong></span><span>Discount <strong>{promotion.discountPercent || 0}%</strong></span><span>Sale price <strong>{formatCurrency(Number(draft.basePrice || 0) * (1 - Number(promotion.discountPercent || 0) / 100), draft.currency)}</strong></span></div>
      <div className="preset-row" aria-label="Discount presets">{promotionPresets.map((value) => <button className={promotion.discountPercent === value ? "selected" : ""} key={value} onClick={() => updatePromotion({ discountPercent: value })} type="button">{value}%</button>)}</div>
      <div className="form-grid three">
        <label><span>Custom discount %</span><input max="99" min="1" onChange={(event) => updatePromotion({ discountPercent: event.target.value === "" ? null : Number(event.target.value) })} type="number" value={promotion.discountPercent ?? ""} /></label>
        <label><span>Start</span><input onChange={(event) => updatePromotion({ startsAt: toUtcIsoFromBucharest(event.target.value) })} type="datetime-local" value={toBucharestInput(promotion.startsAt)} /><small>{bucharestTimeZone}</small></label>
        <label><span>End</span><input onChange={(event) => updatePromotion({ endsAt: toUtcIsoFromBucharest(event.target.value) })} type="datetime-local" value={toBucharestInput(promotion.endsAt)} /><small>{bucharestTimeZone}</small></label>
      </div>
    </fieldset>
  );
}

function ProductPreview({ product, draft, simulatedNow, testMode }) {
  const info = productInfo(product.id, product);
  const now = simulatedNow ? new Date(toUtcIsoFromBucharest(simulatedNow)) : new Date();
  const pricing = getProductPricing(draft, now);
  const labels = getProductLabels(draft, now);
  return (
    <section className="preview-surface">
      {testMode ? <div className="test-banner"><strong>TEST MODE</strong><span>Changes shown here are not public.</span></div> : null}
      <img src={info.image} alt="" />
      <div className="preview-copy">
        <div className="label-row">{labels.map((label) => <span key={label}>{label}</span>)}</div>
        <h2>{product.content?.title ?? info.title}</h2>
        <p>{product.content?.kind ?? info.category}</p>
        <div className="preview-price">{pricing.promotionActive ? <s>{formatCurrency(pricing.basePrice, draft.currency)}</s> : null}<strong>{formatCurrency(pricing.currentPrice, draft.currency)}</strong>{draft.priceSuffix ? <span>{draft.priceSuffix}</span> : null}</div>
        {pricing.promotionActive && draft.promotion.endsAt ? <small>Sale ends {formatBucharest(draft.promotion.endsAt)}</small> : null}
        <div className="marketplace-preview">{platformNames.map((name) => {
          const platform = draft.platforms[name];
          return <button disabled={platform.status !== "available"} key={name} type="button">{statusLabel(name)}<small>{statusLabel(platform.status)}</small></button>;
        })}</div>
      </div>
    </section>
  );
}

function PublishSummary({ product, onCancel, onPublish, busy }) {
  const before = product.published;
  const after = product.draft;
  const differences = [];
  if (before.basePrice !== after.basePrice) differences.push(["Price", `${formatCurrency(before.basePrice, before.currency)} to ${formatCurrency(after.basePrice, after.currency)}`]);
  if (JSON.stringify(before.labels) !== JSON.stringify(after.labels)) differences.push(["Labels", after.labels.join(", ") || "None"]);
  if (JSON.stringify(before.promotion) !== JSON.stringify(after.promotion)) differences.push(["Promotion", after.promotion.enabled ? `${after.promotion.discountPercent}%` : "Disabled"]);
  if (before.visibility !== after.visibility) differences.push(["Visibility", statusLabel(after.visibility)]);
  if (JSON.stringify(before.platforms) !== JSON.stringify(after.platforms)) differences.push(["Marketplaces", "Platform availability or URLs changed"]);
  return (
    <div className="dialog-backdrop" role="presentation">
      <section aria-labelledby="publish-title" aria-modal="true" className="confirm-dialog" role="dialog">
        <h2 id="publish-title">Publish {productInfo(product.id, product).title}?</h2>
        <p>This atomically replaces the live commerce state with the saved draft.</p>
        <div className="change-list">{differences.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
        <div className="dialog-actions"><button className="secondary-button" disabled={busy} onClick={onCancel} type="button">Cancel</button><button className="primary-button" disabled={busy} onClick={onPublish} type="button"><Send size={17} />{busy ? "Publishing..." : "Publish"}</button></div>
      </section>
    </div>
  );
}

function ProductEditor({ product, onBack, onChanged }) {
  const [draft, setDraft] = useState(() => clone(product.draft));
  const [labelInput, setLabelInput] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [simulatedNow, setSimulatedNow] = useState(bucharestNowInput);
  const [publishing, setPublishing] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [content, setContent] = useState(() => clone(product.content));
  const info = productInfo(product.id, product);
  const comparableDraft = ({ revisionToken: _revisionToken, updatedAt: _updatedAt, ...value }) => value;
  const hasLocalChanges = JSON.stringify(comparableDraft(draft)) !== JSON.stringify(comparableDraft(product.draft)) || JSON.stringify(content) !== JSON.stringify(product.content);

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const addLabel = () => {
    const label = labelInput.trim().toUpperCase();
    if (label && label !== "SALE" && !draft.labels.includes(label)) update("labels", [...draft.labels, label]);
    setLabelInput("");
  };
  const save = async () => {
    setBusy(true); setStatus({ type: "", message: "Saving draft..." });
    try {
      const { revisionToken: _revisionToken, updatedAt: _updatedAt, ...payload } = draft;
      const result = await adminApi.saveDraft(product.id, { ...payload, content }, product.draft.revisionToken);
      setDraft(clone(result.product.draft)); setContent(clone(result.product.content)); onChanged(result.product);
      setStatus({ type: "success", message: "Draft saved" });
    } catch (error) { setStatus({ type: "error", message: error.message }); }
    finally { setBusy(false); }
  };
  const publish = async () => {
    setPublishing(true);
    try {
      const result = await adminApi.publish(product.id, product.draft.revisionToken);
      setDraft(clone(result.product.draft)); onChanged(result.product); setShowPublish(false);
      setStatus({ type: "success", message: "Published" });
    } catch (error) { setStatus({ type: "error", message: error.message }); setShowPublish(false); }
    finally { setPublishing(false); }
  };
  const discard = async () => {
    if (!window.confirm("Discard every unpublished change for this product?")) return;
    setBusy(true);
    try {
      const result = await adminApi.discardDraft(product.id, product.draft.revisionToken);
      setDraft(clone(result.product.draft)); onChanged(result.product);
      setStatus({ type: "success", message: "Draft discarded" });
    } catch (error) { setStatus({ type: "error", message: error.message }); }
    finally { setBusy(false); }
  };
  const setTestShortcut = (kind) => {
    const start = draft.promotion.startsAt ? new Date(draft.promotion.startsAt) : new Date();
    const end = draft.promotion.endsAt ? new Date(draft.promotion.endsAt) : new Date(start.getTime() + 86_400_000);
    const target = kind === "before" ? new Date(start.getTime() - 60_000) : kind === "after" ? new Date(end.getTime() + 60_000) : kind === "during" ? new Date((start.getTime() + end.getTime()) / 2) : new Date();
    setSimulatedNow(toBucharestInput(target.toISOString()));
  };

  return (
    <div className="workspace-stack editor-workspace">
      <div className="editor-heading">
        <button className="icon-button" onClick={onBack} title="Back to products" type="button"><ArrowLeft size={20} /></button>
        <img src={info.image} alt="" /><div><h1>{info.title}</h1><p>{product.id}</p></div>
        <StatusPill tone={product.hasChanges ? "warning" : "success"}>{product.hasChanges ? "Draft changes" : "No unpublished changes"}</StatusPill>
      </div>
      {status.message ? <div className={`inline-status ${status.type}`} role="status">{status.message}</div> : null}
      <div className="editor-layout">
        <div className="editor-form">
          <ListingContentFields content={content} onChange={setContent} />
          <MediaManager onChanged={onChanged} product={product} />
          <fieldset className="editor-section"><legend>General store settings</legend><div className="form-grid three">
            <label><span>Visibility</span><select onChange={(event) => update("visibility", event.target.value)} value={draft.visibility}><option value="visible">Published</option><option value="hidden">Hidden</option></select></label>
            <label><span>Display order</span><input onChange={(event) => update("displayOrder", Number(event.target.value))} type="number" value={draft.displayOrder} /></label>
            <label className="toggle-row compact"><span><strong>Featured</strong></span><input checked={draft.featured} onChange={(event) => update("featured", event.target.checked)} type="checkbox" /></label>
          </div></fieldset>
          <fieldset className="editor-section"><legend>Pricing</legend><div className="form-grid three">
            <label><span>Base price</span><input min="0" onChange={(event) => update("basePrice", Number(event.target.value))} step="0.01" type="number" value={draft.basePrice ?? ""} /></label>
            <label><span>Currency</span><select onChange={(event) => update("currency", event.target.value)} value={draft.currency}><option value="USD">USD</option><option value="EUR">EUR</option></select></label>
            <label><span>Price suffix</span><input onChange={(event) => update("priceSuffix", event.target.value || null)} placeholder="or more" value={draft.priceSuffix ?? ""} /></label>
          </div></fieldset>
          <fieldset className="editor-section"><legend>Labels</legend><div className="editable-labels">{draft.labels.map((label) => <button key={label} onClick={() => update("labels", draft.labels.filter((item) => item !== label))} title={`Remove ${label}`} type="button">{label}<X size={14} /></button>)}</div><div className="label-adder"><input onChange={(event) => setLabelInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addLabel(); } }} placeholder="Add custom label" value={labelInput} /><button className="secondary-button" onClick={addLabel} type="button"><Plus size={16} /> Add</button></div></fieldset>
          <fieldset className="editor-section"><legend>Marketplaces</legend><div className="marketplace-editor">{platformNames.map((name) => <div className="marketplace-row" key={name}><strong>{statusLabel(name)}</strong><label><span>Status</span><select onChange={(event) => setDraft((current) => ({ ...current, platforms: { ...current.platforms, [name]: { ...current.platforms[name], status: event.target.value } } }))} value={draft.platforms[name].status}>{statusOptions.map((option) => <option key={option} value={option}>{statusLabel(option)}</option>)}</select></label><label><span>HTTPS URL</span><input onChange={(event) => setDraft((current) => ({ ...current, platforms: { ...current.platforms, [name]: { ...current.platforms[name], url: event.target.value || null } } }))} placeholder="https://" type="url" value={draft.platforms[name].url ?? ""} /></label></div>)}</div></fieldset>
          <PromotionFields draft={draft} setDraft={setDraft} />
          <div className="editor-actions"><button className="secondary-button danger-text" disabled={busy || !product.hasChanges} onClick={discard} type="button"><Trash2 size={17} /> Discard draft</button><span /><button className="secondary-button" disabled={busy} onClick={save} type="button"><Save size={17} /> {busy ? "Saving..." : "Save draft"}</button><button className="primary-button" disabled={busy || hasLocalChanges || !product.hasChanges} onClick={() => setShowPublish(true)} title={hasLocalChanges ? "Save local edits before publishing" : undefined} type="button"><Send size={17} /> Publish</button></div>
        </div>
        <aside className="preview-column">
          <div className="preview-controls"><label className="toggle-row compact"><span><strong>Test mode</strong></span><input checked={testMode} onChange={(event) => setTestMode(event.target.checked)} type="checkbox" /></label>{testMode ? <><label><span>Simulated time</span><input onChange={(event) => setSimulatedNow(event.target.value)} type="datetime-local" value={simulatedNow} /><small>{bucharestTimeZone}</small></label><div className="shortcut-row"><button onClick={() => setTestShortcut("now")} type="button">Now</button><button onClick={() => setTestShortcut("before")} type="button">Before sale</button><button onClick={() => setTestShortcut("during")} type="button">During sale</button><button onClick={() => setTestShortcut("after")} type="button">After sale</button></div></> : null}</div>
          <ProductPreview draft={draft} product={product} simulatedNow={testMode ? simulatedNow : null} testMode={testMode} />
          <div className="product-analytics-note"><BarChart3 size={18} /><span>Product analytics appear after live views and marketplace clicks are recorded.</span></div>
        </aside>
      </div>
      {showPublish ? <PublishSummary busy={publishing} onCancel={() => setShowPublish(false)} onPublish={publish} product={product} /> : null}
    </div>
  );
}

function Promotions({ products, onEdit }) {
  const groups = { active: [], scheduled: [], expired: [] };
  for (const product of products) {
    const status = promotionStatus(product.published.promotion);
    if (groups[status]) groups[status].push(product);
  }
  return (
    <div className="workspace-stack"><div className="page-heading"><div><h1>Promotions</h1><p>Published promotion schedules in {bucharestTimeZone}.</p></div></div>
      {Object.entries(groups).map(([status, items]) => <section className="workspace-panel" key={status}><div className="panel-heading"><h2>{statusLabel(status)}</h2><StatusPill tone={status === "active" ? "sale" : "neutral"}>{items.length}</StatusPill></div>{items.length ? <div className="promotion-table">{items.map((product) => { const promotion = product.published.promotion; const pricing = getProductPricing(product.published); return <div className="promotion-record" key={product.id}><div><strong>{productInfo(product.id, product).title}</strong><small>{formatCurrency(product.published.basePrice, product.published.currency)} base</small></div><strong>{promotion.discountPercent}%</strong><span>{formatCurrency(pricing.currentPrice, product.published.currency)}</span><span><small>{formatBucharest(promotion.startsAt)}</small><small>{formatBucharest(promotion.endsAt)}</small></span><button className="secondary-button" onClick={() => onEdit(product.id)} type="button">Edit</button></div>; })}</div> : <EmptyState title={`No ${status} promotions`} text="Promotion schedules will appear here automatically." />}</section>)}
    </div>
  );
}

function BarList({ rows, labelFor }) {
  const maximum = Math.max(1, ...rows.map((row) => Number(row.count)));
  return <div className="bar-list">{rows.map((row) => <div className="bar-row" key={labelFor(row)}><span>{labelFor(row)}</span><div><i style={{ width: `${(Number(row.count) / maximum) * 100}%` }} /></div><strong>{row.count}</strong></div>)}</div>;
}

function Analytics({ data, range, onRange }) {
  if (!data) return <p className="loading-state">Loading analytics...</p>;
  const totals = data.totals;
  const hasData = Object.values(totals).some(Boolean);
  return (
    <div className="workspace-stack"><div className="page-heading"><div><h1>Analytics</h1><p>First-party, privacy-minimal storefront events. Test mode is excluded.</p></div><div className="segmented-control">{["7", "30", "90", "all"].map((value) => <button className={range === value ? "active" : ""} key={value} onClick={() => onRange(value)} type="button">{value === "all" ? "All time" : `${value} days`}</button>)}</div></div>
      <section className="metrics-grid compact"><Metric label="Store views" value={totals.store_view ?? 0} /><Metric label="Product views" value={totals.product_view ?? 0} /><Metric label="Marketplace clicks" value={totals.marketplace_click ?? 0} /></section>
      {!hasData ? <EmptyState title="No analytics data yet" text="Metrics will populate after visitors use the live storefront." /> : <div className="analytics-grid"><section className="workspace-panel"><h2>Top viewed products</h2><BarList labelFor={(row) => productInfo(row.product_id).title} rows={data.topViewedProducts} /></section><section className="workspace-panel"><h2>Top marketplace clicks</h2><BarList labelFor={(row) => productInfo(row.product_id).title} rows={data.topClickedProducts} /></section><section className="workspace-panel"><h2>Clicks by platform</h2><BarList labelFor={(row) => statusLabel(row.platform || "unknown")} rows={data.clicksByPlatform} /></section></div>}
    </div>
  );
}

function EmergencyDialog({ onCancel, onConfirm, busy }) {
  const [confirmation, setConfirmation] = useState("");
  return <div className="dialog-backdrop"><section aria-labelledby="emergency-title" aria-modal="true" className="confirm-dialog danger-dialog" role="dialog"><AlertTriangle size={28} /><h2 id="emergency-title">End every sale immediately?</h2><p>This bypasses draft publishing and disables active and scheduled promotions in both draft and live state. Base prices are unchanged.</p><label><span>Type END SALES to confirm</span><input autoFocus onChange={(event) => setConfirmation(event.target.value)} value={confirmation} /></label><div className="dialog-actions"><button className="secondary-button" disabled={busy} onClick={onCancel} type="button">Cancel</button><button className="danger-button" disabled={busy || confirmation !== "END SALES"} onClick={onConfirm} type="button">{busy ? "Ending sales..." : "End all sales"}</button></div></section></div>;
}

export default function App() {
  const [section, setSection] = useState("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [products, setProducts] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsRange, setAnalyticsRange] = useState("30");
  const [actorEmail, setActorEmail] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newListing, setNewListing] = useState(false);
  const [error, setError] = useState("");
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyBusy, setEmergencyBusy] = useState(false);

  const loadCore = async () => {
    setError("");
    try {
      const [health, productData, dashboardData] = await Promise.all([adminApi.health(), adminApi.products(), adminApi.dashboard()]);
      setActorEmail(health.actorEmail); setProducts(productData.products); setDashboard(dashboardData);
    } catch (requestError) { setError(requestError.message); }
  };
  useEffect(() => { loadCore(); }, []);
  useEffect(() => {
    if (section !== "analytics") return;
    adminApi.analytics(analyticsRange).then(setAnalytics).catch((requestError) => setError(requestError.message));
  }, [analyticsRange, section]);

  const editingProduct = products.find((product) => product.id === editingId) ?? null;
  const updateProduct = (nextProduct) => {
    setProducts((current) => current.map((product) => product.id === nextProduct.id ? nextProduct : product));
    adminApi.dashboard().then(setDashboard).catch(() => {});
  };
  const openEditor = (productId) => { setEditingId(productId); setSection("products"); };
  const createListing = (product) => { setProducts((current) => [...current, product]); setNewListing(false); setEditingId(product.id); };
  const archiveListing = async (productId) => { if (!window.confirm("Archive this listing? It will be hidden but retained.")) return; try { const result = await adminApi.archive(productId); updateProduct(result.product); } catch (requestError) { setError(requestError.message); } };
  const restoreListing = async (productId) => { try { const result = await adminApi.restore(productId); updateProduct(result.product); } catch (requestError) { setError(requestError.message); } };
  const deleteListing = async (productId) => { if (!window.confirm("Permanently delete this unpublished draft? This cannot be undone.")) return; try { await adminApi.deleteDraft(productId); setProducts((current) => current.filter((product) => product.id !== productId)); } catch (requestError) { setError(requestError.message); } };
  const endSales = async () => {
    setEmergencyBusy(true);
    try { await adminApi.endAllSales(); setEmergencyOpen(false); await loadCore(); }
    catch (requestError) { setError(requestError.message); }
    finally { setEmergencyBusy(false); }
  };

  return (
    <div className="admin-shell">
      <header className="admin-header"><button className="mobile-menu" onClick={() => setMobileNav((open) => !open)} title="Toggle navigation" type="button">{mobileNav ? <X /> : <Menu />}</button><a className="brand" href="/">BALLAI ADMIN</a><div className="header-meta"><StatusPill tone="success">Production</StatusPill><span>{actorEmail}</span></div></header>
      <aside className={`admin-sidebar ${mobileNav ? "open" : ""}`}><nav aria-label="Administration sections">{navigation.map((item) => { const Icon = item.icon; return <button className={section === item.id ? "active" : ""} key={item.id} onClick={() => { setSection(item.id); setEditingId(null); setMobileNav(false); }} type="button"><Icon size={19} /><span>{item.label}</span></button>; })}</nav><div className="future-nav"><span>Later</span><small>Orders</small><small>Customers</small><small>Downloads</small><small>Support</small></div></aside>
      <main className="admin-main"><ErrorBanner message={error} onRetry={loadCore} />{newListing ? <NewListing onCancel={() => setNewListing(false)} onCreated={createListing} /> : editingProduct ? <ProductEditor key={`${editingProduct.id}-${editingProduct.draft.updatedAt}`} onBack={() => setEditingId(null)} onChanged={updateProduct} product={editingProduct} /> : section === "dashboard" ? <Dashboard data={dashboard} onEdit={openEditor} onEndAllSales={() => setEmergencyOpen(true)} products={products} /> : section === "products" ? <Products onArchive={archiveListing} onDelete={deleteListing} onEdit={openEditor} onNew={() => setNewListing(true)} onRestore={restoreListing} products={products} /> : section === "promotions" ? <Promotions onEdit={openEditor} products={products} /> : <Analytics data={analytics} onRange={setAnalyticsRange} range={analyticsRange} />}</main>
      {emergencyOpen ? <EmergencyDialog busy={emergencyBusy} onCancel={() => setEmergencyOpen(false)} onConfirm={endSales} /> : null}
    </div>
  );
}
