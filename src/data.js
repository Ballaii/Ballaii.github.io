import { productPageMeta, productRouteIds, storeCatalogItems } from "./storeData.js";

export const pages = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "store", label: "Store" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export const routeIds = [...pages.map((page) => page.id), "skills", "divine-harvest", "countdown", "ai-anticheat", ...productRouteIds];

export const pageMeta = {
  home: {
    title: "ballai.dev - Game Dev Tools & Assets",
    description:
      "Portfolio and store of Ballai Fokt Jeno, featuring Unity games, game assets, AI security, SCADA simulation, Flutter apps, and OpenGL work.",
  },
  projects: {
    title: "Projects | Ballai Fokt Jeno",
    description:
      "Game development, behavior-based AI anti-cheat research, automation, Flutter, and OpenGL projects by Ballai Fokt Jeno.",
  },
  store: {
    title: "Ballai - Unity Tools & Game Assets",
    description:
      "Unity tools, game-development systems, and pixel-art assets by Ballai.",
  },
  "divine-harvest": {
    title: "Divine Harvest | Ballai Fokt Jeno",
    description:
      "Divine Harvest is a released Unity Metroidvania with exploration, boss fights, branching endings, and at least 2 hours of content.",
  },
  countdown: {
    title: "Second's Thief | Ballai Fokt Jeno",
    description:
      "Second's Thief is an ongoing arena survivor based on reverse progression, time pressure, bosses, and leaderboard runs.",
  },
  "ai-anticheat": {
    title: "AI Anti-Cheat Research for CS2 | Ballai Fokt Jeno",
    description:
      "An ongoing behavior-based AI anti-cheat research project that analyzes Counter-Strike 2 demos and ranks suspicious actions for human review.",
    image: "https://ballai.dev/assets/project-ai-anticheat.webp",
  },
  about: {
    title: "About | Ballai Fokt Jeno",
    description:
      "About Ballai Fokt Jeno, a game developer and software engineer building Unity games, tools, mobile apps, graphics projects, and applied AI systems.",
  },
  skills: {
    title: "About | Ballai Fokt Jeno",
    description: "About Ballai Fokt Jeno and his game development, software engineering, and frontend certifications.",
  },
  contact: {
    title: "Contact | Ballai Fokt Jeno",
    description:
      "Contact Ballai Fokt Jeno for game development, software engineering, web, automation, and AI security work.",
  },
  ...productPageMeta,
};

export const storeItems = [
  {
    title: "Divine Harvest",
    category: "games",
    kind: "Released game",
    price: "Name your own price",
    image: "assets/project-divine-harvest.webp",
    imageAlt: "Divine Harvest logo",
    text: "A released Unity Metroidvania with exploration, bosses, branching endings, and at least 2 hours of content.",
    tags: ["Windows", "Metroidvania", "Unity"],
    pageId: "divine-harvest",
  },
  {
    title: "Second's Thief",
    category: "games",
    kind: "Ongoing game",
    price: "Playable build",
    image: "assets/countdown-cover.webp",
    imageAlt: "Second's Thief cover",
    text: "An arena survivor about starting strong, losing power, and stealing enough time to keep the run alive.",
    tags: ["Browser", "Windows", "Linux"],
    pageId: "countdown",
  },
  ...storeCatalogItems,
];

export const projects = [
  {
    id: "ai-anticheat",
    name: "AI Anti-Cheat Research",
    type: "Featured ongoing research",
    summary:
      "A behavior-based CS2 demo analysis pipeline for ranking suspicious player-rounds and actions while keeping human review in control.",
    accent: "anticheat",
    featured: true,
    image: "assets/project-ai-anticheat.webp",
    imageAlt: "AI Anti-Cheat behavior-based detection research banner",
  },
  {
    id: "divine-harvest",
    name: "Divine Harvest",
    type: "Released Unity Metroidvania",
    summary:
      "An indie Unity Metroidvania finished and released on April 19, 2026, with at least 2 hours of content.",
    accent: "harvest",
    image: "assets/project-divine-harvest.webp",
    imageAlt: "Divine Harvest game logo",
  },
  {
    id: "countdown",
    name: "Second's Thief",
    type: "Ongoing game project",
    summary:
      "A GMTK prototype growing into a sharper arena survivor about losing power while fighting for more time.",
    accent: "countdown",
    image: "assets/countdown-cover.webp",
    imageAlt: "Second's Thief game cover",
  },
  {
    id: "malware-ai",
    name: "AI Malware Detection",
    type: "Neural network security tool",
    summary:
      "A machine learning project for detecting malicious software patterns and improving threat classification workflows.",
    accent: "neural",
    image: "assets/project-malware-detection.webp",
    imageAlt: "Illustration of malware detection with magnifying glass and computer",
  },
  {
    id: "automation",
    name: "Automation and HVAC Simulation",
    type: "Internship work",
    summary:
      "SCADA internship work modelling heat flow, insulation, window state, gas heating, A/C modes, and monthly energy reports.",
    accent: "automation",
    image: "assets/project-accenture.webp",
    imageAlt: "Accenture logo",
  },
  {
    id: "fitness-tracker",
    name: "Chad Goals",
    type: "Flutter mobile app",
    summary:
      "A Flutter/Firebase app for exercise logging, weekly performance scoring, calorie tracking, local caching, and nutrition lookup.",
    accent: "fitness",
    image: "assets/project-chad-goals.webp",
    imageAlt: "Chad Goals Flutter mobile app screenshot",
  },
  {
    id: "graphics-engine",
    name: "3D Graphics Engine",
    type: "Rendering project",
    summary:
      "A C++ OpenGL engine supporting OBJ/FBX loading, GLSL shader pipelines, texture mapping, transforms, and instanced rendering.",
    accent: "graphics",
    image: "assets/project-opengl.webp",
    imageAlt: "OpenGL logo",
  },
];

export const antiCheatResearch = {
  title: "AI Anti-Cheat Research",
  banner: "assets/project-ai-anticheat.webp",
  bannerAlt: "AI Anti-Cheat behavior-based detection research banner",
  lead:
    "I analyze CS2 demos to rank suspicious behavior for human review, with false positives treated as the costliest error.",
  principle:
    "The system does not decide whether a player cheated. It preserves evidence, uncertainty, and model boundaries so a reviewer can inspect the situations that deserve attention.",
  workflow: [
    {
      title: "Parse the demo",
      text: "I extract pseudonymized player ticks, shots, damage, kills, view angles, movement, and round context from offline CS2 demos.",
    },
    {
      title: "Build causal evidence",
      text: "The pipeline constructs player-round, action-window, and temporal features while separating observable knowledge from outcome shortcuts.",
    },
    {
      title: "Score separate channels",
      text: "M2 ranks player-round context, M4 ranks kill windows, and M5 studies 512-tick temporal sequences. Their scores are never averaged blindly.",
    },
    {
      title: "Review with provenance",
      text: "Identifier-safe outputs keep model scores, deterministic evidence rules, technical conditions, and data-quality warnings visibly separate.",
    },
  ],
  metrics: [
    ["795", "source matches audited"],
    ["734,975,247", "raw tick rows audited"],
    ["0.8008", "M2 player-match PR-AUC"],
    ["0.7477", "M5 TCN512 macro PR-AUC"],
  ],
  findings: [
    "M2 v0.2 reached 0.9291 ROC-AUC and 0.8008 PR-AUC in source-match-grouped cross-validation against weak player-match labels.",
    "TCN512 led the M5 temporal comparison in 8 of 10 folds, ahead of GRU512 by 0.0335 PR-AUC in the paired out-of-fold audit.",
    "In one controlled multi-assistance session, M2 placed 13 of 15 target rounds above 0.5 and M4 placed 6 of 15 kill windows above 0.5. None crossed the conservative strict thresholds.",
    "A controlled two-session comparison found shorter median linked reaction latency under assistance, but the sample is descriptive and cannot establish sensitivity or causality.",
  ],
  limitations: [
    "Weak player-match labels do not identify which action or assistance type caused a score.",
    "Current controlled sessions are too limited to estimate sensitivity or a real-world false-positive rate.",
    "Several visibility, hitbox, smoke, and sound measurements still rely on documented proxies.",
    "No current result is deployment-ready or suitable for automatic bans.",
  ],
  next: [
    "Collect event-matched pre, active, and post intervals from additional untouched participants.",
    "Add independent adjudication and calibration on a separate cohort.",
    "Replace visibility proxies with stronger Source 2 geometry and occlusion measurements.",
  ],
};

export const timeline = [
  {
    title: "B.Sc. Information Technology Completed",
    place: "UMFST George Emil Palade",
    date: "July 22, 2026",
    points: [
      "Completed university with Divine Harvest as a game-development focused bachelor's thesis.",
      "Documented the Unity architecture, gameplay systems, boss AI, save security, and narrative systems behind the released build.",
    ],
  },
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

export const skillGroups = [
  {
    name: "Game Development",
    items: ["Unity", "C#", "Gameplay systems", "Boss AI", "Level design", "Input systems", "UI"],
  },
  {
    name: "Engineering",
    items: ["Python", "C", "C++", "Java", "Dart", "SQL", "Git"],
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

export const divineHarvest = {
  id: "divine-harvest",
  theme: "divine-theme",
  title: "Divine Harvest",
  kicker: "Released Metroidvania",
  trailer: "65rzQu2B-PM",
  logo: "assets/project-divine-harvest.webp",
  logoAlt: "Divine Harvest logo",
  actionLabel: "Open itch.io",
  actionUrl: "https://ballaii.itch.io/divine-harvest",
  actionMeta: "Windows download",
  lead:
    "Explore a dark pixel-art world, unlock movement abilities, fight hand-built bosses, and uncover two endings in an indie Unity Metroidvania.",
  shortDescription:
    "A released Unity Metroidvania about exploration, ability-gated progression, bosses, and branching endings.",
  about:
    "Divine Harvest is a released Metroidvania built around exploration, ability-gated progression, boss encounters, and branching endings. The project was also my bachelor's thesis, so the game page presents both the playable release and the engineering behind it.",
  meta: [
    ["Status", "Released"],
    ["Release", "Apr 19, 2026"],
    ["Developer", "Ballai Fokt Jeno"],
    ["Platform", "Windows"],
    ["Content", "2+ hours"],
  ],
  tags: ["Metroidvania", "Unity", "Pixel Art", "Boss Fights", "Singleplayer"],
  features: [
    "Explore a connected pixel-art world built around movement upgrades and backtracking.",
    "Fight 15 boss encounters across atmospheric areas and story-driven set pieces.",
    "Follow branching NPC questlines, lore discoveries, and two possible endings.",
    "Play the released Windows build directly from itch.io.",
  ],
  screenshots: [
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
  ],
  technicalIntro:
    "Divine Harvest was also my bachelor's thesis project. The thesis documents the architecture behind a Unity Metroidvania with persistent world state, scene transitions, boss AI, input abstraction, secure saves, and branching narrative.",
  systems: [
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
  ],
  sideFeatures: ["Single-player", "Controller movement support", "Multiple endings", "Secure save system"],
  requirements: ["OS: Windows", "Build: Downloadable itch.io package", "Storage: 395 MB package"],
};

export const countdown = {
  id: "countdown",
  theme: "countdown-theme",
  title: "Second's Thief",
  kicker: "Ongoing arena survivor",
  trailer: "HKM7NeKsCu8",
  logo: "assets/countdown-cover.webp",
  logoAlt: "Second's Thief cover",
  actionLabel: "Play now",
  actionUrl: "https://ballaii.itch.io/countdown",
  actionMeta: "In development",
  lead:
    "Start powerful, lose power as the run escalates, and fight to buy back enough time to stay alive.",
  shortDescription:
    "An ongoing arena survivor where every run pushes you toward losing power instead of gaining it.",
  about:
    "Second's Thief evolves the GMTK prototype into a sharper arena-survivor project. Kills and XP do not simply make you stronger: they push the run toward level-down events, stripping comfort away while waves and bosses keep pressuring the arena. The hook is direct: survive while your build counts down.",
  meta: [
    ["Status", "In development"],
    ["Developer", "Ballai Fokt Jeno"],
    ["Platforms", "Browser, Windows, Linux"],
    ["Origin", "GMTK Game Jam 2026"],
  ],
  tags: ["Arena Shooter", "Bullet Hell", "Roguelike", "Leaderboard", "Pixel Art", "Singleplayer"],
  features: [
    "Start powerful, then lose tiers, tools, and comfort as the run counts down.",
    "Survive waves and bosses in an isometric arena shooter format.",
    "Draft builds with contracts, boons, curses, time orbs, and XP refunds.",
    "Set your name, chase the leaderboard, and compete for survival time.",
  ],
  screenshots: [
    { src: "assets/countdown-01.webp", alt: "Second's Thief gameplay screenshot showing arena action" },
    { src: "assets/countdown-02.webp", alt: "Second's Thief screenshot with player, enemies, and arena effects" },
    { src: "assets/countdown-03.webp", alt: "Second's Thief screenshot showing combat and interface" },
    { src: "assets/countdown-04.webp", alt: "Second's Thief screenshot showing another arena encounter" },
  ],
  technicalIntro:
    "Second's Thief is designed around a reverse-progression run loop: kills and XP push the player toward level-down events instead of upgrades. The systems that matter most are run state, ability tier stripping, time pickups, refunds, draft choices, leaderboard naming, and wave/boss pacing.",
  systems: [
    {
      title: "Reverse Progression",
      text:
        "The core pressure comes from losing power over time. The player begins strong, so the design challenge is keeping later fights readable when the build is thinner.",
    },
    {
      title: "Run Economy",
      text:
        "Time orbs and XP refunds create short-term decisions: keep fighting, recover a few seconds, or accept a risky contract, boon, or curse.",
    },
    {
      title: "Jam Scope",
      text:
        "The public page positions the game as a GMTK 2026 submission made under jam constraints, so the implementation emphasizes a strong central mechanic over long-form content.",
    },
  ],
  sideFeatures: ["Single-player", "Browser playable", "Leaderboard", "No generative AI used"],
  praise: [
    { author: "Void", text: "Favorite game in the gamejam right now." },
    { author: "BotellaDeRon", text: "Awesome game. Impressed you made this in just 4 days." },
    { author: "Marke'd studio", text: "Very great work, I like your art style." },
    { author: "ScepticDope", text: "Pretty dope!" },
  ],
  sourceUrl: "https://itch.io/jam/gmtk-jam-2026/rate/4816977",
};
