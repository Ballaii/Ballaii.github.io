import { useEffect, useMemo, useRef, useState } from "react";
import {
  countdown,
  divineHarvest,
  pageMeta,
  pages,
  projects,
  routeIds,
  skillGroups,
  storeItems,
  timeline,
} from "./data.js";
import { assetProducts } from "./storeData.js";
import { fetchCommerceState, recordStoreEvent } from "./commerceApi.js";
import { formatCurrency, formatPromotionEnd, getProductLabels, getProductPricing, mergeCommerceState } from "./storeUtils.js";

const publicOrigin = "https://ballai.dev";
const commerceApiOrigin = "https://api.ballai.dev";

function pathForPage(pageId) {
  if (pageId === "home") return "/";
  if (pageId === "divine-harvest") return "/projects/divine-harvest";
  if (pageId === "countdown") return "/projects/seconds-thief";
  return `/${pageId}`;
}

function pageIdForPath(pathname) {
  const path = decodeURIComponent(pathname.replace(/\/+$/, "") || "/");
  if (path === "/") return "home";
  if (path === "/projects/divine-harvest") return "divine-harvest";
  if (path === "/projects/seconds-thief") return "countdown";
  if (path === "/store") return "store";
  if (path.startsWith("/store/")) return `store/${path.slice("/store/".length)}`;
  const pageId = path.slice(1);
  return routeIds.includes(pageId) ? pageId : "home";
}

function legacyHashPageId() {
  const hash = window.location.hash.slice(1);
  return routeIds.includes(hash) || hash.startsWith("store/") ? hash : null;
}

function currentPageId() {
  return legacyHashPageId() ?? pageIdForPath(window.location.pathname);
}

function useHashPage() {
  const [page, setPage] = useState(currentPageId);

  useEffect(() => {
    const legacyPage = legacyHashPageId();
    if (legacyPage) {
      window.history.replaceState(null, "", pathForPage(legacyPage));
      setPage(legacyPage);
    }
    const handleNavigation = () => setPage(pageIdForPath(window.location.pathname));
    window.addEventListener("popstate", handleNavigation);
    window.addEventListener("hashchange", handleNavigation);
    return () => {
      window.removeEventListener("popstate", handleNavigation);
      window.removeEventListener("hashchange", handleNavigation);
    };
  }, []);

  return page;
}

function goTo(pageId) {
  window.history.pushState(null, "", pathForPage(pageId));
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function InternalLink({ pageId, children, onClick, ...props }) {
  return (
    <a
      {...props}
      href={pathForPage(pageId)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        goTo(pageId);
      }}
    >
      {children}
    </a>
  );
}

function useCommerceCatalog() {
  const [remoteProducts, setRemoteProducts] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchCommerceState(controller.signal)
      .then((products) => setRemoteProducts(Object.fromEntries(products.map((product) => [product.id, { ...product, mediaBaseUrl: commerceApiOrigin }]))))
      .catch((error) => {
        if (import.meta.env.DEV && error.name !== "AbortError") {
          console.info("Using static commerce fallback:", error.message);
        }
      });
    return () => controller.abort();
  }, []);

  return useMemo(() => {
    const staticById = Object.fromEntries(assetProducts.map((product) => [product.id, product]));
    const dynamicProducts = remoteProducts ? Object.values(remoteProducts).filter((product) => !staticById[product.id]).map((product) => ({ ...mergeCommerceState({ id: product.id, slug: product.slug, imageAlt: product.title, gallery: [], platforms: {}, labels: [], features: [], technicalInfo: [], detailSections: [] }, product), pageId: `store/${product.slug}` })) : [];
    const mergedAssets = assetProducts.map((product) => mergeCommerceState(product, remoteProducts?.[product.id]));
    const games = storeItems.filter((item) => item.category === "games");
    const visibleGames = remoteProducts ? games : [];
    const publicAssets = mergedAssets
      .filter((product) => product.visibility !== "hidden")
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    return { assetProducts: [...mergedAssets, ...dynamicProducts], storeItems: [...visibleGames, ...publicAssets, ...dynamicProducts] };
  }, [remoteProducts]);
}

function setMeta(name, content) {
  const selector = `meta[name="${name}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.append(element);
  }
  element.setAttribute("content", content);
}

function setPropertyMeta(property, content) {
  const selector = `meta[property="${property}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.append(element);
  }
  element.setAttribute("content", content);
}

function usePageSeo(pageId, products) {
  useEffect(() => {
    const product = products.find((item) => item.pageId === pageId);
    const meta = pageMeta[pageId] ?? (product ? {
      title: product.seoTitle ?? `${product.title} | Ballai`,
      description: product.description,
      image: `${publicOrigin}/${product.image}`,
    } : pageMeta.home);
    const pageUrl = `${publicOrigin}${pathForPage(pageId)}`;
    const socialImage = meta.image ?? `${publicOrigin}/assets/project-divine-harvest.webp`;
    document.title = meta.title;
    setMeta("description", meta.description);
    setMeta("twitter:title", meta.title);
    setMeta("twitter:description", meta.description);
    setMeta("twitter:image", socialImage);
    setPropertyMeta("og:title", meta.title);
    setPropertyMeta("og:description", meta.description);
    setPropertyMeta("og:url", pageUrl);
    setPropertyMeta("og:image", socialImage);
    document.head.querySelector('link[rel="canonical"]')?.setAttribute("href", pageUrl);
  }, [pageId, products]);
}

function Header({ activePage }) {
  const activeTab = activePage.startsWith("store/") ? "store" : activePage;

  return (
    <header className="site-header">
      <div className="nav-shell">
        <InternalLink className="brand" pageId="home" aria-label="Go to homepage">
          <span>Ballai Fokt Jeno</span>
          <small>ballai.dev</small>
        </InternalLink>
        <nav className="tabs" aria-label="Portfolio sections">
          {pages.map((page) => (
            <InternalLink
              className={`tab ${activeTab === page.id ? "active" : ""}`}
              key={page.id}
              pageId={page.id}
            >
              {page.label}
            </InternalLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Home() {
  return (
    <main>
      <section className="hero-page">
        <div className="hero-copy">
          <p className="hero-role">ballai.dev</p>
          <h1>I build games and useful software.</h1>
          <p className="lead">
            Gameplay systems, tools, simulations, and practical apps with a focus on clear execution.
          </p>
        </div>
      </section>

      <section className="content-band experience-band">
        <div className="section-heading">
          <h2>Experience</h2>
        </div>
        <div className="timeline">
          {timeline.map((item) => (
            <article className="timeline-item" key={item.title}>
              <div>
                <p className="item-date">{item.date}</p>
                <h3>{item.title}</h3>
                <p className="muted">{item.place}</p>
              </div>
              <ul>
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function ProductLabels({ product }) {
  const labels = getProductLabels(product);
  if (labels.length === 0) {
    return null;
  }

  return (
    <div className="product-labels" aria-label="Product labels">
      {labels.map((label) => (
        <span key={label}>{label}</span>
      ))}
    </div>
  );
}

function ProductPrice({ product, compact = false }) {
  const pricing = getProductPricing(product);
  const saleEnd = pricing.promotionActive ? formatPromotionEnd(product.promotion.endsAt) : null;

  return (
    <div className={`product-price ${compact ? "compact" : ""}`}>
      {pricing.promotionActive ? <span className="discount-badge">{pricing.discountPercent}% OFF</span> : null}
      <div className="price-line">
        {pricing.promotionActive ? <s>{formatCurrency(pricing.basePrice, product.currency)}</s> : null}
        <strong>
          {formatCurrency(pricing.currentPrice, product.currency)}
          {product.priceSuffix ? <small> {product.priceSuffix}</small> : null}
        </strong>
      </div>
      {saleEnd ? <small className="sale-end">Sale ends {saleEnd}</small> : null}
    </div>
  );
}

function Store({ items }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    const searchableText = [item.title, item.kind, item.description ?? item.text, ...item.tags].join(" ").toLowerCase();
    return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });
  const storeSections = [
    ["Games", filteredItems.filter((item) => item.category === "games")],
    ["Assets", filteredItems.filter((item) => item.category === "assets")],
  ].filter(([, items]) => items.length > 0);

  useEffect(() => {
    recordStoreEvent({ eventType: "store_view" });
  }, []);

  useEffect(() => {
    if (!normalizedQuery) return undefined;
    const timeout = window.setTimeout(() => recordStoreEvent({ eventType: "search" }), 500);
    return () => window.clearTimeout(timeout);
  }, [normalizedQuery]);

  return (
    <main>
      <section className="content-band store-page">
        <div className="section-heading wide">
          <h1>Store</h1>
          <p className="lead">Games, Unity tools, and pixel-art assets built from real production work.</p>
        </div>
        <div className="store-controls">
          <label>
            <span>Search</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search store"
              type="search"
              value={query}
            />
          </label>
          <label>
            <span>Filter</span>
            <select onChange={(event) => { setCategory(event.target.value); recordStoreEvent({ eventType: "store_filter", category: event.target.value }); }} value={category}>
              <option value="all">All items</option>
              <option value="games">Games</option>
              <option value="assets">Assets</option>
            </select>
          </label>
        </div>
        {storeSections.map(([title, items]) => (
          <section className="store-section" key={title}>
            <h2>{title}</h2>
            <div className="store-grid">
              {items.map((item) => (
                <article className={`store-card ${item.category} ${item.kind === "Unity Asset" ? "unity-asset" : ""}`} key={item.title}>
                  <InternalLink className="store-art" pageId={item.pageId} aria-label={`Open ${item.title}`}>
                    <img src={item.image} alt={item.imageAlt} loading="lazy" />
                  </InternalLink>
                  <div className="store-copy">
                    <div>
                      <p className="project-type">{item.kind}</p>
                      {item.basePrice !== undefined ? <ProductLabels product={item} /> : null}
                      <h3>
                        <InternalLink className="store-title-link" pageId={item.pageId}>{item.title}</InternalLink>
                      </h3>
                      <p>{item.description ?? item.text}</p>
                    </div>
                    <div className="tag-list">
                      {item.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="store-footer">
                      {item.basePrice !== undefined ? (
                        <ProductPrice compact product={item} />
                      ) : (
                        <span className="price-line"><strong>{item.price}</strong></span>
                      )}
                      <InternalLink className="primary-action" pageId={item.pageId}>
                        {item.category === "assets" ? "View product" : "Open game page"}
                      </InternalLink>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
        {storeSections.length === 0 ? <p className="empty-store">No products match that search.</p> : null}
      </section>
    </main>
  );
}

function AssetMediaGallery({ product }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const heroMedia = product.gallery.find((item) => item.src === product.heroImage) ?? {
    src: product.heroImage,
    alt: product.imageAlt,
  };
  const media = [
    { type: "image", label: "Overview", ...heroMedia },
    ...(product.youtubeVideoId
      ? [{
          type: "video",
          label: "Demo",
          videoId: product.youtubeVideoId,
          thumbnail: `https://img.youtube.com/vi/${product.youtubeVideoId}/hqdefault.jpg`,
        }]
      : []),
    ...product.gallery
      .filter((item) => item.src !== product.heroImage)
      .map((item, index) => ({ type: "image", label: `Image ${index + 1}`, ...item })),
  ];
  const selectedMedia = media[selectedIndex] ?? media[0];

  useEffect(() => {
    setSelectedIndex(0);
  }, [product.id]);

  return (
    <div className="asset-media-gallery" aria-label={`${product.title} product media`}>
      <div className={`asset-media-stage ${product.slug === "scythe-ui" ? "pixel-media" : ""}`}>
        {selectedMedia.type === "video" ? (
          <VideoFrame title={`${product.title} product demonstration`} videoId={selectedMedia.videoId} />
        ) : (
          <img src={selectedMedia.src} alt={selectedMedia.alt} loading={selectedIndex === 0 ? "eager" : "lazy"} />
        )}
      </div>
      {media.length > 1 ? (
        <div className="asset-media-thumbnails" aria-label="Product media selection">
          {media.map((item, index) => (
            <button
              aria-label={`Show ${item.label}`}
              aria-pressed={selectedIndex === index}
              className={selectedIndex === index ? "active" : ""}
              key={`${item.type}-${item.src ?? item.videoId}`}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <img src={item.type === "video" ? item.thumbnail : item.src} alt="" loading="lazy" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const purchaseChannelContent = {
  direct: {
    label: "Buy Direct",
    comingSoon: "Direct purchase",
  },
  itch: {
    label: "Buy on itch.io",
    comingSoon: "itch.io",
  },
  unity: {
    label: "Unity Asset Store",
    comingSoon: "Unity Asset Store",
  },
};

function PurchaseChannels({ product }) {
  return (
    <div className="purchase-channels">
      {Object.entries(product.platforms).map(([platformId, platform]) => {
        const content = purchaseChannelContent[platformId];
        if (!content) {
          return null;
        }

        if (platform.status === "available" && platform.url) {
          return (
            <a
              className="purchase-channel available"
              href={platform.url}
              key={platformId}
              onClick={() => recordStoreEvent({ eventType: "marketplace_click", productId: product.id, platform: platformId })}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>{content.label}</span>
              <small>Available now</small>
            </a>
          );
        }

        const statusLabel = platform.status === "pending-review"
          ? "Pending review"
          : platform.status === "unavailable"
            ? "Unavailable"
            : "Coming soon";
        return (
          <button className="purchase-channel" disabled key={platformId} type="button">
            <span>{content.comingSoon}</span>
            <small>{statusLabel}</small>
          </button>
        );
      })}
    </div>
  );
}

function ProductPage({ product }) {
  useEffect(() => {
    if (product.visibility !== "hidden") {
      recordStoreEvent({ eventType: "product_view", productId: product.id });
    }
  }, [product.id, product.visibility]);

  if (product.visibility === "hidden") {
    return (
      <main>
        <section className="content-band unavailable-product">
          <h1>Product unavailable</h1>
          <p>This product is not currently listed in the Ballai Store.</p>
          <InternalLink className="secondary-action" pageId="store">Back to Store</InternalLink>
        </section>
      </main>
    );
  }

  return (
    <main>
      <article className="asset-product-page">
        <nav className="product-breadcrumb" aria-label="Breadcrumb">
          <InternalLink pageId="store">Store</InternalLink>
          <span aria-hidden="true">/</span>
          <span>{product.title}</span>
        </nav>

        <section className="asset-product-hero">
          <div className="asset-product-media">
            <AssetMediaGallery product={product} />
          </div>

          <aside className="asset-product-summary">
            <img className="asset-product-logo" src={product.image} alt={product.imageAlt} />
            <div>
              <h1>{product.title}</h1>
              <p className="asset-product-kind">{product.kind}</p>
            </div>
            <ProductLabels product={product} />
            <p className="asset-product-description">{product.description}</p>
            <ProductPrice product={product} />
            <div className="tag-list">
              {product.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div className="purchase-heading">
              <h2>Purchase options</h2>
              <p>Availability is shown per marketplace.</p>
            </div>
            <PurchaseChannels product={product} />
          </aside>
        </section>

        <div className="asset-product-content">
          <section className="asset-copy-section">
            <h2>About This Asset</h2>
            <p>{product.longDescription}</p>
          </section>

          <section className="asset-copy-section">
            <h2>Features</h2>
            <ul className="asset-feature-list">
              {product.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </section>

          {product.detailSections?.map((section) => (
            <section className="asset-copy-section" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </section>
          ))}

          <section className="asset-copy-section technical-package">
            <h2>Technical and Package Information</h2>
            <dl>
              {product.technicalInfo.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <InternalLink className="secondary-action back-to-store" pageId="store">Back to Store</InternalLink>
        </div>
      </article>
    </main>
  );
}

function Projects() {
  return (
    <main>
      <section className="content-band">
        <div className="section-heading wide">
          <h1>Projects</h1>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <article className={`project-card ${project.accent}`} key={project.id}>
              <div className="project-graphic">
                <img src={project.image} alt={project.imageAlt} loading="lazy" />
              </div>
              <div className="project-copy">
                <p className="project-type">{project.type}</p>
                <h2>{project.name}</h2>
                <p>{project.summary}</p>
                {["divine-harvest", "countdown"].includes(project.id) && (
                  <InternalLink className="inline-link" pageId={project.id}>
                    Game page
                  </InternalLink>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function VideoFrame({ title, videoId }) {
  return (
    <div className="video-frame">
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
      />
    </div>
  );
}

function MediaCarousel({ game }) {
  const railRef = useRef(null);
  const slides = [
    {
      label: "Trailer",
      src: `https://img.youtube.com/vi/${game.trailer}/hqdefault.jpg`,
    },
    ...game.screenshots.map((shot, index) => ({
      label: `Screenshot ${index + 1}`,
      src: shot.src,
    })),
  ];

  const moveToSlide = (index) => {
    const rail = railRef.current;
    const slide = rail?.children[index];
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  return (
    <div className="media-carousel" aria-label={`${game.title} media carousel`}>
      <div className="media-rail" ref={railRef}>
        <figure className="media-slide media-video">
          <VideoFrame title={`${game.title} trailer`} videoId={game.trailer} />
        </figure>
        {game.screenshots.map((shot) => (
          <figure className="media-slide" key={shot.src}>
            <img src={shot.src} alt={shot.alt} loading="lazy" />
          </figure>
        ))}
      </div>
      <div className="media-dots" aria-label="Media shortcuts">
        {slides.map((slide, index) => (
          <button key={slide.label} onClick={() => moveToSlide(index)} type="button" aria-label={`Show ${slide.label}`}>
            <img src={slide.src} alt="" loading="lazy" />
            {index === 0 && <span>Trailer</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function GamePage({ game }) {
  const isCountdown = game.id === "countdown";

  return (
    <main>
      <section className={`game-detail ${game.theme}`}>
        <section className="game-detail-hero">
          <div className="game-detail-media">
            <MediaCarousel game={game} />
            <section className="hero-about">
              <h2>About This Game</h2>
              <p>{game.about}</p>
            </section>
            <section className="hero-features">
              <h2>Game Features</h2>
              <ul className="feature-list">
                {game.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="game-detail-summary">
            <div className="game-logo-panel">
              <img src={game.logo} alt={game.logoAlt} />
            </div>
            <p className="game-kicker">{game.kicker}</p>
            <h1>{game.title}</h1>
            <p>{game.lead}</p>
            <p className="game-short">{game.shortDescription}</p>
            <div className="game-meta">
              {game.meta.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="tag-list">
              {game.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <a className="primary-action summary-action" href={game.actionUrl} rel="noopener" target="_blank">
              {game.actionLabel}
            </a>
          </aside>
        </section>

        <section className="play-strip">
          <div>
            <h2>{isCountdown ? "Second's Thief" : "Play Divine Harvest"}</h2>
            <p>{isCountdown ? "Ongoing project, playable from the current itch.io build." : "Name your own price on itch.io."}</p>
          </div>
          <div className="play-actions">
            <span>{game.actionMeta}</span>
            <a className="primary-action" href={game.actionUrl} rel="noopener" target="_blank">
              {game.actionLabel}
            </a>
          </div>
        </section>

        <section className="detail-grid">
          <div className="detail-main">
            <details className="tech-details">
              <summary>Technical details</summary>
              <div className="tech-details-body">
                <p>{game.technicalIntro}</p>
                <div className="feature-grid systems-grid">
                  {game.systems.map((system) => (
                    <article className="tech-note" key={system.title}>
                      <h2>{system.title}</h2>
                      <p>{system.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </details>
          </div>

          <aside className="detail-side">
            <section className="side-panel">
              <h2>Features</h2>
              <ul className="side-list">
                {game.sideFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </section>

            {isCountdown ? <PraisePanel game={game} /> : <RequirementsPanel game={game} />}
          </aside>
        </section>
      </section>
    </main>
  );
}

function RequirementsPanel({ game }) {
  return (
    <section className="side-panel">
      <h2>System Requirements</h2>
      <div className="requirement-list">
        {game.requirements.map((requirement) => (
          <p key={requirement}>{requirement}</p>
        ))}
      </div>
    </section>
  );
}

function PraisePanel({ game }) {
  return (
    <section className="side-panel">
      <h2>Early Comments</h2>
      <div className="quote-grid compact-quotes">
        {game.praise.map((item) => (
          <article className="quote-card" key={`${item.author}-${item.text}`}>
            <p>"{item.text}"</p>
            <span>{item.author}</span>
          </article>
        ))}
      </div>
      <a className="inline-source" href={game.sourceUrl} rel="noopener" target="_blank">
        View GMTK submission
      </a>
    </section>
  );
}

function About() {
  return (
    <main>
      <section className="content-band about-page">
        <div className="about-intro">
          <div>
            <h1>About me</h1>
            <p className="about-lead">
              I am a game developer and software engineer who enjoys turning systems into things people can play, use, and understand.
            </p>
            <p>
              My work spans released Unity games, reusable game-development tools, frontend and mobile applications, graphics programming, automation, and applied AI security. I care about the details behind the experience: architecture, feedback, performance, and a clear path from idea to working release.
            </p>
          </div>
          <dl className="about-index">
            <div><dt>Primary focus</dt><dd>Game development</dd></div>
            <div><dt>Main engine</dt><dd>Unity and C#</dd></div>
            <div><dt>Also building</dt><dd>Tools, web, mobile, and AI systems</dd></div>
          </dl>
        </div>

        <section className="about-capabilities" aria-labelledby="capabilities-title">
          <h2 id="capabilities-title">What I work with</h2>
          <div className="capability-list">
          {skillGroups.map((group) => (
            <div className="capability-row" key={group.name}>
              <h2>{group.name}</h2>
              <ul className="chip-list">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
          </div>
        </section>

        <section className="certifications" aria-labelledby="certifications-title">
          <div className="certification-heading">
            <h2 id="certifications-title">Certifications</h2>
            <p>Verified coursework that supports the frontend side of my game, tool, and product work.</p>
          </div>
          <article className="certification-entry">
            <a href="https://www.freecodecamp.org/certification/ballai/front-end-development-libraries-v9" rel="noopener" target="_blank">
              <img
                alt="freeCodeCamp Front-End Development Libraries Developer Certification awarded to Ballai on August 27, 2026"
                src="assets/certificate-freecodecamp-frontend.webp"
              />
            </a>
            <div className="certification-copy">
              <h3>Front-End Development Libraries</h3>
              <p>freeCodeCamp Developer Certification</p>
              <dl>
                <div><dt>Awarded</dt><dd>August 27, 2026</dd></div>
                <div><dt>Coursework</dt><dd>Approximately 300 hours</dd></div>
              </dl>
              <a className="secondary-action" href="https://www.freecodecamp.org/certification/ballai/front-end-development-libraries-v9" rel="noopener" target="_blank">
                Verify certification
              </a>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

function Contact() {
  return (
    <main>
      <section className="contact-page">
        <div>
          <h1>Let us build something useful.</h1>
        </div>
        <div className="contact-panel">
          <a href="mailto:ballaifoktjeno@gmail.com">ballaifoktjeno@gmail.com</a>
          <a href="https://www.linkedin.com/in/jen%C5%91-ballai-fokt-203928316/" rel="noopener" target="_blank">
            LinkedIn
          </a>
          <a href="https://github.com/Ballaii" rel="noopener" target="_blank">
            GitHub
          </a>
        </div>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <strong>ballai.dev</strong>
          <p>Games, tools, and useful software by Ballai Fokt Jeno.</p>
        </div>
        <nav className="footer-links" aria-label="Footer links">
          <InternalLink aria-label="Store" pageId="store" title="Store">
            <img alt="" src="assets/icon-store.svg" />
          </InternalLink>
          <InternalLink aria-label="Projects" pageId="projects" title="Projects">
            <img alt="" src="assets/icon-projects.png" />
          </InternalLink>
          <a aria-label="itch.io" href="https://ballaii.itch.io" rel="noopener" target="_blank" title="itch.io">
            <img alt="" src="assets/icon-itch.svg" />
          </a>
          <a aria-label="GitHub" href="https://github.com/Ballaii" rel="noopener" target="_blank" title="GitHub">
            <img alt="" src="assets/icon-github.svg" />
          </a>
          <a aria-label="Email" href="mailto:ballaifoktjeno@gmail.com" title="Email">
            <img alt="" src="assets/icon-mail.svg" />
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default function App() {
  const activePage = useHashPage();
  const commerceCatalog = useCommerceCatalog();
  usePageSeo(activePage, commerceCatalog.assetProducts);
  const pageMap = useMemo(
    () => {
      const productPages = Object.fromEntries(
        commerceCatalog.assetProducts.map((product) => [product.pageId, <ProductPage key={product.id} product={product} />]),
      );

      return {
        home: <Home />,
        projects: <Projects />,
        store: <Store items={commerceCatalog.storeItems} />,
        "divine-harvest": <GamePage game={divineHarvest} />,
        countdown: <GamePage game={countdown} />,
        about: <About />,
        skills: <About />,
        contact: <Contact />,
        ...productPages,
      };
    },
    [commerceCatalog],
  );

  return (
    <div className="site-shell">
      <Header activePage={activePage} />
      {pageMap[activePage]}
      <Footer />
    </div>
  );
}
