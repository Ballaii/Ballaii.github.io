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

function currentPageId() {
  const hash = window.location.hash.replace("#", "");
  return routeIds.includes(hash) ? hash : "home";
}

function useHashPage() {
  const [page, setPage] = useState(currentPageId);

  useEffect(() => {
    const handleHashChange = () => setPage(currentPageId());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return page;
}

function goTo(pageId) {
  window.location.hash = pageId;
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

function usePageSeo(pageId) {
  useEffect(() => {
    const meta = pageMeta[pageId] ?? pageMeta.home;
    document.title = meta.title;
    setMeta("description", meta.description);
    setMeta("twitter:title", meta.title);
    setMeta("twitter:description", meta.description);
    setPropertyMeta("og:title", meta.title);
    setPropertyMeta("og:description", meta.description);
    setPropertyMeta("og:url", `https://ballaii.github.io/#${pageId}`);
  }, [pageId]);
}

function Header({ activePage }) {
  return (
    <header className="site-header">
      <div className="nav-shell">
        <a className="brand" href="#home" aria-label="Go to homepage">
          <span>Ballai Fokt Jeno</span>
          <small>ballai.dev</small>
        </a>
        <nav className="tabs" aria-label="Portfolio sections">
          {pages.map((page) => (
            <button
              className={`tab ${activePage === page.id ? "active" : ""}`}
              key={page.id}
              onClick={() => goTo(page.id)}
              type="button"
            >
              {page.label}
            </button>
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

function Store() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = storeItems.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    const searchableText = [item.title, item.kind, item.text, ...item.tags].join(" ").toLowerCase();
    return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });
  const storeSections = [
    ["Games", filteredItems.filter((item) => item.category === "games")],
    ["Assets", filteredItems.filter((item) => item.category === "assets")],
  ].filter(([, items]) => items.length > 0);

  const openItem = (item) => {
    if (item.pageId) {
      goTo(item.pageId);
    }
  };

  return (
    <main>
      <section className="content-band store-page">
        <div className="section-heading wide">
          <h1>Store</h1>
          <p className="lead">
            Games and asset packs published through itch.io. Unity and itch assets can slot in here as they are released.
          </p>
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
            <select onChange={(event) => setCategory(event.target.value)} value={category}>
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
                <article className={`store-card ${item.category} ${item.kind.includes("Unity") ? "unity-asset" : ""}`} key={item.title}>
                  {item.pageId ? (
                    <button className="store-art" onClick={() => openItem(item)} type="button">
                      <img src={item.image} alt={item.imageAlt} loading="lazy" />
                    </button>
                  ) : (
                    <a className="store-art" href={item.url} rel="noopener" target="_blank">
                      {item.placeholderArt ? <span className="store-placeholder-mark">{item.placeholderArt}</span> : null}
                      {item.image ? <img src={item.image} alt={item.imageAlt} loading="lazy" /> : null}
                    </a>
                  )}
                  <div className="store-copy">
                    <div>
                      <p className="project-type">{item.kind}</p>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                    <div className="tag-list">
                      {item.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="store-footer">
                      <div className="price-stack">
                        {item.discount ? <span className="discount-badge">{item.discount}</span> : null}
                        <span className="price-line">
                          {item.originalPrice ? <s>{item.originalPrice}</s> : null}
                          <strong>{item.price}</strong>
                        </span>
                      </div>
                      {item.pageId ? (
                        <button className="primary-action" onClick={() => goTo(item.pageId)} type="button">
                          Open page
                        </button>
                      ) : (
                        <a className="primary-action" href={item.url} rel="noopener" target="_blank">
                          {item.actionLabel}
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
        {storeSections.length === 0 ? <p className="empty-store">No matching store items yet.</p> : null}
      </section>
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
                  <button className="inline-link" onClick={() => goTo(project.id)} type="button">
                    Game page
                  </button>
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

function Skills() {
  return (
    <main>
      <section className="content-band">
        <div className="section-heading wide">
          <h1>Skills</h1>
        </div>
        <div className="skills-grid">
          {skillGroups.map((group) => (
            <article className="skill-panel" key={group.name}>
              <h2>{group.name}</h2>
              <ul className="chip-list">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
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
          <button aria-label="Store" onClick={() => goTo("store")} title="Store" type="button">
            <img alt="" src="assets/icon-store.svg" />
          </button>
          <button aria-label="Projects" onClick={() => goTo("projects")} title="Projects" type="button">
            <img alt="" src="assets/icon-projects.png" />
          </button>
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
  usePageSeo(activePage);
  const pageMap = useMemo(
    () => ({
      home: <Home />,
      projects: <Projects />,
      store: <Store />,
      "divine-harvest": <GamePage game={divineHarvest} />,
      countdown: <GamePage game={countdown} />,
      skills: <Skills />,
      contact: <Contact />,
    }),
    [],
  );

  return (
    <div className="site-shell">
      <Header activePage={activePage} />
      {pageMap[activePage]}
      <Footer />
    </div>
  );
}
