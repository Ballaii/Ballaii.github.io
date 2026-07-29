const pages = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "divine-harvest", label: "Divine Harvest" },
  { id: "countdown", label: "CountDown" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

const projects = [
  {
    id: "divine-harvest",
    name: "Divine Harvest",
    type: "Bachelor's thesis / released game",
    summary:
      "A solo-developed Unity 2D Metroidvania with 20 interconnected areas, 100+ scenes, 15 boss encounters, branching narrative, secure saves, and controller support.",
    stack: ["Unity", "C#", "Behavior graphs", "AES/HMAC saves", "ScriptableObjects"],
    accent: "harvest",
    image: "assets/project-divine-harvest.webp",
    imageTitle: "Divine Harvest",
    imageAlt: "Divine Harvest game logo",
  },
  {
    id: "countdown",
    name: "CountDown - Beat the Clock",
    type: "GMTK Game Jam 2026 / released game",
    summary:
      "A reverse-progression arena survivor where kills push you closer to losing abilities. Built for GMTK 2026 and released for browser, Windows, and Linux.",
    stack: ["Game jam", "Arena shooter", "Reverse progression", "Leaderboard", "HTML5"],
    accent: "countdown",
    image: "assets/countdown-cover.webp",
    imageTitle: "CountDown - Beat the Clock",
    imageAlt: "CountDown - Beat the Clock game cover",
  },
  {
    id: "malware-ai",
    name: "AI Malware Detection",
    type: "Neural network security tool",
    summary:
      "A machine learning project for detecting malicious software patterns and improving threat classification workflows.",
    stack: ["Python", "Neural networks", "Cybersecurity", "Data analysis"],
    accent: "neural",
    image: "assets/project-malware-detection.webp",
    imageTitle: "AI Malware Detection",
    imageAlt: "Illustration of malware detection with magnifying glass and computer",
  },
  {
    id: "automation",
    name: "Automation and HVAC Simulation",
    type: "Internship work",
    summary:
      "SCADA internship work modelling heat flow across rooms, insulation, open-window factors, gas/A/C modes, and monthly energy reports from live process data.",
    stack: ["WinCC OA", "SCADA", "HVAC simulation", "Agile teamwork"],
    accent: "automation",
    image: "assets/project-accenture.webp",
    imageTitle: "Accenture SCADA Internship",
    imageAlt: "Accenture logo",
  },
  {
    id: "fitness-tracker",
    name: "Chad Goals",
    type: "Flutter mobile app",
    summary:
      "A Flutter/Firebase app for exercise logging, weekly performance scoring, calorie tracking, local caching, and a self-hosted nutrition API.",
    stack: ["Flutter", "Dart", "Firebase", "REST APIs", "Caching"],
    accent: "fitness",
    image: "assets/project-chad-goals.webp",
    imageTitle: "Chad Goals",
    imageAlt: "Chad Goals Flutter mobile app screenshot",
  },
  {
    id: "graphics-engine",
    name: "3D Graphics Engine",
    type: "Rendering project",
    summary:
      "A C++ OpenGL engine supporting OBJ/FBX loading, custom GLSL shader pipelines, texture mapping, transforms, and instanced rendering.",
    stack: ["C++", "OpenGL", "GLSL", "3D models", "GPU rendering"],
    accent: "graphics",
    image: "assets/project-opengl.webp",
    imageTitle: "OpenGL Graphics Engine",
    imageAlt: "OpenGL logo",
  },
];

const timeline = [
  {
    title: "Automation Developer Intern",
    place: "Accenture",
    date: "Summer 2025",
    points: [
      "Developed an HVAC environment simulation in WinCC OA for room-level heat flow.",
      "Modelled insulation, open-window factors, gas heating, and A/C modes.",
      "Generated monthly energy expense reports from live process data.",
    ],
  },
  {
    title: "Community Manager",
    place: "Online communities",
    date: "2018-2022",
    points: [
      "Managed servers, moderation flows, and member support.",
      "Organized community events and coordinated team responsibilities.",
      "Handled conflict resolution while keeping spaces welcoming.",
    ],
  },
];

const skillGroups = [
  {
    name: "Engineering",
    items: ["C#", "Python", "C", "C++", "Java", "Dart", "SQL", "Git"],
  },
  {
    name: "Game Development",
    items: ["Unity", "Gameplay systems", "Boss AI", "Level design", "Input systems", "UI"],
  },
  {
    name: "AI and Security",
    items: ["Neural networks", "Malware analysis", "AES-CBC", "HMAC-SHA256", "Model evaluation"],
  },
  {
    name: "Tools and Platforms",
    items: ["Flutter", "Firebase", "OpenGL", "Docker", "Bash/Linux", "LaTeX", "REST APIs"],
  },
];

const divineHarvestStats = [
  ["Windows", "download"],
  ["Name your price", "itch.io release"],
  ["Metroidvania", "genre"],
  ["Controller", "movement support"],
];

const divineHarvestSystems = [
  {
    title: "PersistentObjects Architecture",
    text:
      "A DontDestroyOnLoad prefab bootstraps 27 global managers before any scene loads, preserving world, player, map, story, and combat state across 100+ room transitions.",
  },
  {
    title: "Three-Tier Data Model",
    text:
      "Static ScriptableObject definitions, persistent runtime managers, and scene-local components stay separated so gameplay data does not collapse into scene lifecycle problems.",
  },
  {
    title: "Secure Save Pipeline",
    text:
      "The save system uses AES-CBC encryption, HMAC-SHA256 integrity validation, constant-time comparison, three save slots, and readable metadata for the save UI.",
  },
  {
    title: "Boss AI Evolution",
    text:
      "Boss logic evolved from animator-driven coroutines into graph-based Unity Behavior pipelines, with object pooling reducing projectile instantiation overhead.",
  },
  {
    title: "Input Abstraction",
    text:
      "Runtime remapping and a 177-entry keybind icon database support keyboard, PlayStation, and Xbox input aliases without hardcoded UI references.",
  },
  {
    title: "Narrative Systems",
    text:
      "Branching dialogue, lore items, NPC questlines, a recurring hub, and dual endings tie progression systems to the world fiction.",
  },
];

const divineHarvestFeatures = [
  "Explore a connected pixel-art world built around movement upgrades and backtracking.",
  "Fight 15 boss encounters across atmospheric areas and story-driven set pieces.",
  "Follow branching NPC questlines, lore discoveries, and two possible endings.",
  "Play the released Windows build directly from itch.io.",
];

const divineScreenshots = [
  {
    src: "assets/divine-harvest-01.webp",
    alt: "Divine Harvest gameplay screenshot with ornate interior and character platforming",
  },
  {
    src: "assets/divine-harvest-02.webp",
    alt: "Divine Harvest screenshot showing character dialogue and glowing effects",
  },
  {
    src: "assets/divine-harvest-03.webp",
    alt: "Divine Harvest cave environment screenshot with purple lighting",
  },
  {
    src: "assets/divine-harvest-04.webp",
    alt: "Divine Harvest dark red atmospheric boss or story scene",
  },
];

const countdownStats = [
  ["HTML5", "play in browser"],
  ["Windows + Linux", "downloads"],
  ["GMTK 2026", "jam submission"],
  ["9+", "early ratings"],
];

const countdownFeatures = [
  "Start powerful, then lose tiers, tools, and comfort as the run counts down.",
  "Survive waves and bosses in an isometric arena shooter format.",
  "Draft builds with contracts, boons, curses, time orbs, and XP refunds.",
  "Set your name, chase the leaderboard, and compete for survival time.",
];

const countdownScreenshots = [
  {
    src: "assets/countdown-01.webp",
    alt: "CountDown gameplay screenshot showing arena action",
  },
  {
    src: "assets/countdown-02.webp",
    alt: "CountDown screenshot with player, enemies, and arena effects",
  },
  {
    src: "assets/countdown-03.webp",
    alt: "CountDown screenshot showing combat and interface",
  },
  {
    src: "assets/countdown-04.webp",
    alt: "CountDown screenshot showing another arena encounter",
  },
];

const countdownPraise = [
  {
    author: "Void",
    text: "Favorite game in the gamejam right now.",
  },
  {
    author: "BotellaDeRon",
    text: "Awesome game. Impressed you made this in just 4 days.",
  },
  {
    author: "Marke'd studio",
    text: "Very great work, I like your art style.",
  },
  {
    author: "ScepticDope",
    text: "Pretty dope!",
  },
];

const app = document.querySelector("#app");

function listItems(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function chipList(items) {
  return `<ul class="chip-list">${listItems(items)}</ul>`;
}

function metricList(items) {
  return items
    .map(([value, label]) => `<div><span class="stat">${value}</span><span>${label}</span></div>`)
    .join("");
}

function featureList(items) {
  return `<ul class="feature-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function screenshotGrid(items, className = "") {
  return items
    .map(
      (shot, index) => `
        <figure class="screenshot-tile ${className} tile-${index + 1}">
          <img src="${shot.src}" alt="${shot.alt}" loading="lazy" />
        </figure>`,
    )
    .join("");
}

function videoEmbed(videoId, title) {
  return `
    <div class="video-frame">
      <iframe
        src="https://www.youtube.com/embed/${videoId}"
        title="${title}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>`;
}

function steamPreviewThumbs(items) {
  return items
    .map(
      (shot) => `
        <figure class="steam-thumb">
          <img src="${shot.src}" alt="${shot.alt}" loading="lazy" />
        </figure>`,
    )
    .join("");
}

function steamMetaRows(items) {
  return items
    .map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function steamTags(items) {
  return `<div class="steam-tags">${items.map((tag) => `<span>${tag}</span>`).join("")}</div>`;
}

function setPage(pageId) {
  window.location.hash = pageId;
}

window.setPage = setPage;

function getPageId() {
  const hash = window.location.hash.replace("#", "");
  return pages.some((page) => page.id === hash) ? hash : "home";
}

function renderHeader(activePage) {
  const tabs = pages
    .map(
      (page) => `
        <button
          class="tab ${activePage === page.id ? "active" : ""}"
          type="button"
          onclick="setPage('${page.id}')"
        >
          ${page.label}
        </button>`,
    )
    .join("");

  return `
    <header class="site-header">
      <a class="brand" href="#home" aria-label="Go to homepage">
        <img src="character.png" alt="" class="brand-mark" />
        <span>Ballai Fokt Jeno</span>
      </a>
      <nav class="tabs" aria-label="Portfolio sections">${tabs}</nav>
    </header>`;
}

function renderHome() {
  const experience = timeline
    .map(
      (item) => `
        <article class="timeline-item">
          <div>
            <p class="item-date">${item.date}</p>
            <h3>${item.title}</h3>
            <p class="muted">${item.place}</p>
          </div>
          <ul>${listItems(item.points)}</ul>
        </article>`,
    )
    .join("");

  return `
    <main>
      <section class="page-grid hero-page">
        <div class="hero-copy">
          <p class="eyebrow">Software developer / game developer</p>
          <h1>Released games, practical systems, and focused tools.</h1>
          <p class="lead">
            I make playable projects and document the engineering behind them. My work includes a
            released Unity Metroidvania, a GMTK jam arena survivor, SCADA simulation, a Flutter
            fitness app, OpenGL rendering, and AI malware detection.
          </p>
          <div class="hero-actions">
            <button type="button" class="primary-action" onclick="setPage('divine-harvest')">
              Play Divine Harvest
            </button>
            <button type="button" class="secondary-action" onclick="setPage('countdown')">
              Play CountDown
            </button>
          </div>
        </div>

        <div class="portrait-panel" aria-label="Profile portrait">
          <img src="assets/profile-hero.jpg" alt="Portrait of Ballai Fokt Jeno" class="portrait" />
          <div class="signal-card">
            <span class="signal-value">2026</span>
            <span>Information Technology, UMFST</span>
          </div>
        </div>
      </section>

      <section class="content-band compact-band">
        <div class="metric-strip">
          ${metricList([
            ["2", "released games"],
            ["Unity", "main engine"],
            ["SCADA", "internship work"],
            ["OpenGL", "rendering project"],
          ])}
        </div>
      </section>

      <section class="content-band">
        <div class="section-heading">
          <p class="eyebrow">Experience</p>
          <h2>Work that shipped, simulated, or taught me something concrete.</h2>
        </div>
        <div class="timeline">${experience}</div>
      </section>
    </main>`;
}

function renderProjects() {
  const cards = projects
    .map(
      (project) => `
        <article class="project-card ${project.accent}">
          <div class="project-graphic">
            <img src="${project.image}" alt="${project.imageAlt}" loading="lazy" />
            <span class="project-image-title">${project.imageTitle}</span>
          </div>
          <div class="project-copy">
            <p class="project-type">${project.type}</p>
            <h2>${project.name}</h2>
            <p>${project.summary}</p>
            ${chipList(project.stack)}
            ${
              ["divine-harvest", "countdown"].includes(project.id)
                ? `<button type="button" class="inline-link" onclick="setPage('${project.id}')">Open game page</button>`
                : ""
            }
          </div>
        </article>`,
    )
    .join("");

  return `
    <main>
      <section class="content-band">
        <div class="section-heading wide">
          <p class="eyebrow">Selected work</p>
          <h1>Projects with distinct technical stories.</h1>
          <p class="lead">
            Games first, then the supporting software work: automation, mobile, graphics, and AI.
          </p>
        </div>
        <div class="project-grid">${cards}</div>
      </section>
    </main>`;
}

function renderDivineHarvest() {
  const systems = divineHarvestSystems
    .map(
      (system) => `
        <article class="tech-note">
          <h2>${system.title}</h2>
          <p>${system.text}</p>
        </article>`,
    )
    .join("");

  return `
    <main>
      <section class="game-page commercial-page divine-theme">
        <section class="store-hero">
          <div class="store-media">
            <img src="assets/project-divine-harvest.webp" alt="Divine Harvest logo" />
          </div>
          <div class="store-copy">
            <p class="eyebrow">2D Metroidvania / Windows</p>
            <h1>Divine Harvest</h1>
            <p class="lead">
              Explore a dark pixel-art world, unlock new movement options, fight hand-built bosses,
              and uncover two endings in a solo-developed Metroidvania.
            </p>
            <div class="game-actions">
              <a class="primary-action" href="https://ballaii.itch.io/divine-harvest" target="_blank" rel="noopener">
                Download on itch.io
              </a>
              <a class="secondary-action" href="https://www.youtube.com/watch?v=65rzQu2B-PM" target="_blank" rel="noopener">
                Watch trailer
              </a>
            </div>
          </div>
        </section>

        <div class="store-facts">
          ${metricList(divineHarvestStats)}
        </div>

        <section class="store-section">
          <div class="section-heading wide">
            <p class="eyebrow">Trailer</p>
            <h2>See the game in motion.</h2>
          </div>
          ${videoEmbed("65rzQu2B-PM", "Divine Harvest trailer")}
        </section>

        <section class="store-section two-column-section">
          <div class="section-heading wide">
            <p class="eyebrow">What you play</p>
            <h2>A compact Metroidvania with real scope.</h2>
          </div>
          ${featureList(divineHarvestFeatures)}
        </section>

        <section class="store-section">
          <div class="screenshot-collage" aria-label="Divine Harvest screenshots">
            ${screenshotGrid(divineScreenshots)}
          </div>
        </section>

        <section class="store-section">
          <div class="release-panel">
            <div>
              <p class="eyebrow">Release</p>
              <h2>Available now on itch.io.</h2>
              <p>
                Divine Harvest is a released Windows adventure tagged Action-Adventure,
                Metroidvania, Pixel Art, Short, and Singleplayer. The page also notes controller
                support for walking through the game.
              </p>
            </div>
            <a class="primary-action" href="https://ballaii.itch.io/divine-harvest" target="_blank" rel="noopener">
              Open itch.io page
            </a>
          </div>
        </section>

        <details class="tech-details">
          <summary>Technical details</summary>
          <div class="tech-details-body">
            <p>
              Divine Harvest was also my bachelor's thesis project. The thesis documents the
              architecture behind a Unity Metroidvania with persistent world state, scene
              transitions, boss AI, input abstraction, secure saves, and branching narrative.
            </p>
            <div class="feature-grid systems-grid">${systems}</div>
          </div>
        </details>
      </section>
    </main>`;
}

function renderCountdown() {
  const praise = countdownPraise
    .map(
      (item) => `
        <article class="quote-card">
          <p>"${item.text}"</p>
          <span>${item.author}</span>
        </article>`,
    )
    .join("");

  return `
    <main>
      <section class="game-page commercial-page countdown-theme">
        <section class="store-hero">
          <div class="store-media countdown-cover">
            <img src="assets/countdown-cover.webp" alt="CountDown - Beat the Clock cover" />
          </div>
          <div class="store-copy">
            <p class="eyebrow">GMTK Game Jam 2026 / browser, Windows, Linux</p>
            <h1>CountDown - Beat the Clock</h1>
            <p class="lead">
              A reverse-progression arena survivor: you start strong, then the run strips power
              away. Chase time, survive waves, and beat the leaderboard before the clock wins.
            </p>
            <div class="game-actions">
              <a class="primary-action" href="https://ballaii.itch.io/countdown" target="_blank" rel="noopener">
                Play on itch.io
              </a>
              <a class="secondary-action" href="https://www.youtube.com/watch?v=HKM7NeKsCu8" target="_blank" rel="noopener">
                Watch trailer
              </a>
            </div>
          </div>
        </section>

        <div class="store-facts">
          ${metricList(countdownStats)}
        </div>

        <section class="store-section">
          <div class="section-heading wide">
            <p class="eyebrow">Trailer</p>
            <h2>Every second counts.</h2>
          </div>
          ${videoEmbed("HKM7NeKsCu8", "CountDown - Beat the Clock trailer")}
        </section>

        <section class="store-section two-column-section">
          <div class="section-heading wide">
            <p class="eyebrow">Game loop</p>
            <h2>Get weaker. Play better.</h2>
          </div>
          ${featureList(countdownFeatures)}
        </section>

        <section class="store-section">
          <div class="countdown-gallery">
            ${screenshotGrid(countdownScreenshots, "countdown-shot")}
          </div>
        </section>

        <section class="store-section">
          <div class="section-heading wide">
            <p class="eyebrow">Jam feedback</p>
            <h2>Early players noticed the hook.</h2>
          </div>
          <div class="quote-grid">${praise}</div>
          <a class="inline-source" href="https://itch.io/jam/gmtk-jam-2026/rate/4816977" target="_blank" rel="noopener">
            View GMTK submission and comments
          </a>
        </section>

        <details class="tech-details">
          <summary>Technical details</summary>
          <div class="tech-details-body">
            <p>
              CountDown was designed around a reverse-progression run loop: kills and XP push the
              player toward level-down events instead of upgrades. The systems that matter most are
              run state, ability tier stripping, time pickups, refunds, draft choices, leaderboard
              naming, and wave/boss pacing.
            </p>
            <div class="feature-grid systems-grid">
              <article class="tech-note">
                <h2>Reverse Progression</h2>
                <p>
                  The core pressure comes from losing power over time. The player begins strong, so
                  the design challenge is keeping later fights readable when the build is thinner.
                </p>
              </article>
              <article class="tech-note">
                <h2>Run Economy</h2>
                <p>
                  Time orbs and XP refunds create short-term decisions: keep fighting, recover a few
                  seconds, or accept a risky contract, boon, or curse.
                </p>
              </article>
              <article class="tech-note">
                <h2>Jam Scope</h2>
                <p>
                  The public page positions the game as a GMTK 2026 submission made under jam
                  constraints, so the implementation emphasizes a strong central mechanic over
                  long-form content.
                </p>
              </article>
            </div>
          </div>
        </details>
      </section>
    </main>`;
}

function renderDivineHarvestSteamDraft() {
  const systems = divineHarvestSystems
    .map(
      (system) => `
        <article class="tech-note">
          <h2>${system.title}</h2>
          <p>${system.text}</p>
        </article>`,
    )
    .join("");

  return `
    <main>
      <section class="steam-page divine-theme">
        <div class="steam-titlebar">
          <p class="eyebrow">Game page draft</p>
          <h1>Divine Harvest</h1>
        </div>

        <section class="steam-app">
          <div class="steam-gallery">
            ${videoEmbed("65rzQu2B-PM", "Divine Harvest trailer")}
            <div class="steam-thumb-strip">${steamPreviewThumbs(divineScreenshots)}</div>
          </div>

          <aside class="steam-summary">
            <div class="steam-capsule">
              <img src="assets/project-divine-harvest.webp" alt="Divine Harvest logo" />
            </div>
            <p>
              Explore a dark pixel-art world, unlock movement abilities, fight hand-built bosses,
              and uncover two endings in a solo-developed Unity Metroidvania.
            </p>
            <div class="steam-review-row">
              <span>Reception</span>
              <strong>Released thesis project</strong>
            </div>
            <div class="steam-meta">
              ${steamMetaRows([
                ["Release", "Available now"],
                ["Developer", "Ballai Fokt Jeno"],
                ["Platform", "Windows"],
                ["Package", "395 MB"],
              ])}
            </div>
            ${steamTags(["Metroidvania", "Pixel Art", "Boss Fights", "Singleplayer", "Short", "Controller"])}
          </aside>
        </section>

        <section class="steam-buybox">
          <div>
            <h2>Play Divine Harvest</h2>
            <p>Name your own price on itch.io.</p>
          </div>
          <div class="steam-buy-actions">
            <span>Windows download</span>
            <a class="primary-action" href="https://ballaii.itch.io/divine-harvest" target="_blank" rel="noopener">
              Open itch.io
            </a>
          </div>
        </section>

        <section class="steam-content-grid">
          <div class="steam-main-column">
            <section class="steam-section">
              <h2>About This Game</h2>
              <p>
                Divine Harvest is a compact Metroidvania built around exploration, ability-gated
                progression, boss encounters, and a branching ending structure. It is designed as a
                complete solo project rather than a prototype: you move through connected areas,
                collect upgrades, return to previously blocked routes, and push toward the final
                outcome of the world.
              </p>
            </section>
            <section class="steam-section">
              <h2>Game Features</h2>
              ${featureList(divineHarvestFeatures)}
            </section>
            <section class="steam-section">
              <h2>Screenshots</h2>
              <div class="screenshot-collage" aria-label="Divine Harvest screenshots">
                ${screenshotGrid(divineScreenshots)}
              </div>
            </section>
            <details class="tech-details steam-details">
              <summary>Technical details</summary>
              <div class="tech-details-body">
                <p>
                  Divine Harvest was also my bachelor's thesis project. The thesis documents the
                  architecture behind a Unity Metroidvania with persistent world state, scene
                  transitions, boss AI, input abstraction, secure saves, and branching narrative.
                </p>
                <div class="feature-grid systems-grid">${systems}</div>
              </div>
            </details>
          </div>

          <aside class="steam-side-column">
            <section class="steam-side-panel">
              <h2>Features</h2>
              <ul class="steam-feature-checks">
                <li>Single-player</li>
                <li>Controller movement support</li>
                <li>Multiple endings</li>
                <li>Secure save system</li>
              </ul>
            </section>
            <section class="steam-side-panel">
              <h2>System Requirements</h2>
              <div class="requirement-list">
                <p><strong>OS:</strong> Windows</p>
                <p><strong>Build:</strong> Downloadable itch.io package</p>
                <p><strong>Storage:</strong> 395 MB package</p>
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>`;
}

function renderCountdownSteamDraft() {
  const praise = countdownPraise
    .map(
      (item) => `
        <article class="quote-card">
          <p>"${item.text}"</p>
          <span>${item.author}</span>
        </article>`,
    )
    .join("");

  return `
    <main>
      <section class="steam-page countdown-theme">
        <div class="steam-titlebar">
          <p class="eyebrow">Game page draft</p>
          <h1>CountDown - Beat the Clock</h1>
        </div>

        <section class="steam-app">
          <div class="steam-gallery">
            ${videoEmbed("HKM7NeKsCu8", "CountDown - Beat the Clock trailer")}
            <div class="steam-thumb-strip">${steamPreviewThumbs(countdownScreenshots)}</div>
          </div>

          <aside class="steam-summary">
            <div class="steam-capsule countdown-capsule">
              <img src="assets/countdown-cover.webp" alt="CountDown - Beat the Clock cover" />
            </div>
            <p>
              A reverse-progression arena survivor: start powerful, lose power as the run
              escalates, and fight to buy back enough time to stay alive.
            </p>
            <div class="steam-review-row">
              <span>Jam feedback</span>
              <strong>Positive early comments</strong>
            </div>
            <div class="steam-meta">
              ${steamMetaRows([
                ["Release", "25 Jul, 2026"],
                ["Developer", "Ballai Fokt Jeno"],
                ["Platforms", "Browser, Windows, Linux"],
                ["Event", "GMTK Game Jam 2026"],
              ])}
            </div>
            ${steamTags(["Arena Shooter", "Bullet Hell", "Roguelike", "Leaderboard", "Pixel Art", "Singleplayer"])}
          </aside>
        </section>

        <section class="steam-buybox">
          <div>
            <h2>Play CountDown - Beat the Clock</h2>
            <p>Playable in browser, with Windows and Linux downloads.</p>
          </div>
          <div class="steam-buy-actions">
            <span>Free / itch.io</span>
            <a class="primary-action" href="https://ballaii.itch.io/countdown" target="_blank" rel="noopener">
              Play now
            </a>
          </div>
        </section>

        <section class="steam-content-grid">
          <div class="steam-main-column">
            <section class="steam-section">
              <h2>About This Game</h2>
              <p>
                CountDown flips the usual survivor formula. Kills and XP do not simply make you
                stronger: they push the run toward level-down events, stripping comfort away while
                waves and bosses keep pressuring the arena. The result is a jam-sized game with one
                sharp hook: survive while your build counts down.
              </p>
            </section>
            <section class="steam-section">
              <h2>Game Features</h2>
              ${featureList(countdownFeatures)}
            </section>
            <section class="steam-section">
              <h2>Screenshots</h2>
              <div class="countdown-gallery">
                ${screenshotGrid(countdownScreenshots, "countdown-shot")}
              </div>
            </section>
            <details class="tech-details steam-details">
              <summary>Technical details</summary>
              <div class="tech-details-body">
                <p>
                  CountDown was designed around a reverse-progression run loop: kills and XP push
                  the player toward level-down events instead of upgrades. The systems that matter
                  most are run state, ability tier stripping, time pickups, refunds, draft choices,
                  leaderboard naming, and wave/boss pacing.
                </p>
                <div class="feature-grid systems-grid">
                  <article class="tech-note">
                    <h2>Reverse Progression</h2>
                    <p>
                      The core pressure comes from losing power over time. The player begins strong,
                      so the design challenge is keeping later fights readable when the build is thinner.
                    </p>
                  </article>
                  <article class="tech-note">
                    <h2>Run Economy</h2>
                    <p>
                      Time orbs and XP refunds create short-term decisions: keep fighting, recover a
                      few seconds, or accept a risky contract, boon, or curse.
                    </p>
                  </article>
                  <article class="tech-note">
                    <h2>Jam Scope</h2>
                    <p>
                      The public page positions the game as a GMTK 2026 submission made under jam
                      constraints, so the implementation emphasizes a strong central mechanic over
                      long-form content.
                    </p>
                  </article>
                </div>
              </div>
            </details>
          </div>

          <aside class="steam-side-column">
            <section class="steam-side-panel">
              <h2>Features</h2>
              <ul class="steam-feature-checks">
                <li>Single-player</li>
                <li>Browser playable</li>
                <li>Leaderboard</li>
                <li>No generative AI used</li>
              </ul>
            </section>
            <section class="steam-side-panel">
              <h2>Early Comments</h2>
              <div class="quote-grid compact-quotes">${praise}</div>
              <a class="inline-source" href="https://itch.io/jam/gmtk-jam-2026/rate/4816977" target="_blank" rel="noopener">
                View GMTK submission
              </a>
            </section>
          </aside>
        </section>
      </section>
    </main>`;
}

function renderSkills() {
  const groups = skillGroups
    .map(
      (group) => `
        <article class="skill-panel">
          <h2>${group.name}</h2>
          ${chipList(group.items)}
        </article>`,
    )
    .join("");

  return `
    <main>
      <section class="content-band">
        <div class="section-heading wide">
          <p class="eyebrow">Capabilities</p>
          <h1>Technical range with a bias toward building.</h1>
        </div>
        <div class="skills-grid">${groups}</div>
      </section>
    </main>`;
}

function renderContact() {
  return `
    <main>
      <section class="contact-page">
        <div>
          <p class="eyebrow">Contact</p>
          <h1>Let us build something useful.</h1>
          <p class="lead">
            I am open to internships, collaborations, and technical conversations around games,
            web apps, automation, and AI security.
          </p>
        </div>
        <div class="contact-panel">
          <a href="mailto:ballaifoktjeno@gmail.com">ballaifoktjeno@gmail.com</a>
          <a href="https://www.linkedin.com/in/jen%C5%91-ballai-fokt-203928316/" target="_blank" rel="noopener">
            LinkedIn
          </a>
          <a href="https://github.com/Ballaii" target="_blank" rel="noopener">GitHub</a>
        </div>
      </section>
    </main>`;
}

function renderPage() {
  const page = getPageId();
  const pageContent = {
    home: renderHome,
    projects: renderProjects,
    "divine-harvest": renderDivineHarvestSteamDraft,
    countdown: renderCountdownSteamDraft,
    skills: renderSkills,
    contact: renderContact,
  };

  app.innerHTML = `
    <div class="site-shell">
      ${renderHeader(page)}
      ${pageContent[page]()}
    </div>`;
}

window.addEventListener("hashchange", renderPage);
renderPage();
