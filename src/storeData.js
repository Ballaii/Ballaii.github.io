function createUnityPlatforms({ directUrl = null, itchUrl = null, unityUrl = null } = {}) {
  return {
    direct: { status: directUrl ? "available" : "coming-soon", url: directUrl },
    itch: { status: itchUrl ? "available" : "coming-soon", url: itchUrl },
    unity: { status: unityUrl ? "available" : "pending-review", url: unityUrl },
  };
}

export const assetProductContent = [
  {
    id: "ballai-save-system",
    slug: "save-system",
    title: "Ballai Save System",
    category: "assets",
    kind: "Unity Asset",
    description: "A modular save framework for slots, metadata, serialization, storage, and registered saveable objects.",
    longDescription:
      "Ballai Save System brings the persistence pieces of a Unity project into one reusable framework. It focuses on predictable save slots, readable metadata, registered saveable objects, and storage workflows that can grow with a game.",
    image: "assets/store/save-system/logo.webp",
    imageAlt: "Ballai Save System blue shield and save icon",
    heroImage: "assets/store/save-system/gallery-01.webp",
    gallery: [
      { src: "assets/store/save-system/gallery-01.webp", alt: "Ballai Save System overview with save slots, autosave, and backup recovery" },
      { src: "assets/store/save-system/gallery-02.webp", alt: "Ballai Save System feature overview showing slots, world state, backup recovery, and optional protection" },
      { src: "assets/store/save-system/gallery-03.webp", alt: "Ballai Save System marketing panel for reliable world-state persistence" },
    ],
    youtubeVideoId: "z_TTNZZ34-A",
    tags: ["Unity", "Save Slots", "Serialization", "Tools"],
    features: [
      "Reusable save slots with metadata for selection screens.",
      "Serialization and storage separated from registered saveable objects.",
      "Autosave and backup recovery workflows shown in the product demo.",
      "Structured for integration with larger Unity projects.",
    ],
    technicalInfo: [
      ["Engine", "Unity"],
      ["Package type", "Editor and runtime framework"],
      ["Marketplace status", "Unity Asset Store review pending"],
      ["Demo", "YouTube walkthrough available"],
    ],
  },
  {
    id: "ballai-scene-transition",
    slug: "scene-transition",
    title: "Ballai Scene Transition and Checkpoint System",
    category: "assets",
    kind: "Unity Asset",
    description: "Reusable scene transitions, entry points, checkpoints, respawning, and screen fading with optional save integration.",
    longDescription:
      "A focused Unity framework for moving players between scenes and returning them to the correct place. It combines transitions, named entry points, checkpoints, respawning, and screen fading without forcing those responsibilities into individual level scripts.",
    image: "assets/store/scene-transition/logo.webp",
    imageAlt: "Ballai Scene Transition and Checkpoint System portal icon",
    heroImage: "assets/store/scene-transition/gallery-04.webp",
    gallery: [
      { src: "assets/store/scene-transition/gallery-01.webp", alt: "Unity transition inspector configuring destination scenes and entry IDs" },
      { src: "assets/store/scene-transition/gallery-02.webp", alt: "Checkpoint, hazard, and respawn flow demonstration" },
      { src: "assets/store/scene-transition/gallery-03.webp", alt: "Town gameplay scene with two exits leading to separate areas" },
      { src: "assets/store/scene-transition/gallery-04.webp", alt: "Scene transition system overview across town, forest, and dungeon" },
      { src: "assets/store/scene-transition/gallery-05.webp", alt: "Multiple scene entry points showing west and east arrival positions" },
    ],
    youtubeVideoId: "zxSRW-qDjqM",
    tags: ["Unity", "Scene Loading", "Checkpoints", "Respawn"],
    features: [
      "Reusable transitions between scenes and named destinations.",
      "Multiple entry points for context-aware spawn positions.",
      "Checkpoints, hazards, and respawn flow.",
      "Screen fading with optional save-system integration.",
    ],
    technicalInfo: [
      ["Engine", "Unity"],
      ["Package type", "Runtime scene-management framework"],
      ["Integration", "Optional Ballai Save System support"],
      ["Marketplace status", "Unity Asset Store review pending"],
    ],
  },
  {
    id: "ballai-interaction-system",
    slug: "interaction-system",
    title: "Ballai Basic Interaction System",
    category: "assets",
    kind: "Unity Asset",
    description: "Reusable interaction tools for NPCs, inspectable objects, signs, doors, levers, and other in-world triggers.",
    longDescription:
      "A reusable interaction foundation for Unity scenes that need clear prompts and consistent world actions. It is designed for NPCs, inspectable objects, signs, doors, levers, and other triggers that should share one interaction flow.",
    image: "assets/store/interaction-system/logo.webp",
    imageAlt: "Ballai Basic Interaction System hand and dialogue icon",
    heroImage: "assets/store/interaction-system/gallery-02.webp",
    gallery: [
      { src: "assets/store/interaction-system/gallery-01.webp", alt: "Unity interaction system overview with level objects and inspector controls" },
      { src: "assets/store/interaction-system/gallery-02.webp", alt: "In-game pull lever prompt demonstrating a contextual world action" },
      { src: "assets/store/interaction-system/gallery-03.webp", alt: "Unity scene showing NPC interaction and dialogue configuration" },
      { src: "assets/store/interaction-system/gallery-04.webp", alt: "Dialogue sequence configuration inside the Unity editor" },
      { src: "assets/store/interaction-system/gallery-05.webp", alt: "Complete interaction system demo scene layout in Unity" },
      { src: "assets/store/interaction-system/gallery-06.webp", alt: "In-game NPC dialogue with response and memory options" },
    ],
    youtubeVideoId: "QPpf_homziY",
    tags: ["Unity", "Interaction", "Dialogue", "2D"],
    features: [
      "Contextual prompts for nearby world actions.",
      "Reusable triggers for NPCs, objects, signs, doors, and levers.",
      "Dialogue flows demonstrated with NPC interactions.",
      "Editor-configured components designed for reuse across scenes.",
    ],
    technicalInfo: [
      ["Engine", "Unity"],
      ["Package type", "Editor and runtime interaction framework"],
      ["Use cases", "World actions, prompts, NPCs, and dialogue"],
      ["Marketplace status", "Unity Asset Store review pending"],
    ],
  },
  {
    id: "ballai-input-tutorial",
    slug: "input-tutorial",
    title: "Ballai Input and Tutorial Framework",
    category: "assets",
    kind: "Unity Asset",
    description: "A Unity Input System framework for rebinding, device-aware control icons, and reusable tutorial popups.",
    longDescription:
      "A reusable layer around Unity's Input System for projects that need rebinding, control glyphs, action references, and tutorial prompts to stay synchronized. It keeps tutorial content reusable while adapting displayed controls to the active binding.",
    image: "assets/store/input-tutorial/logo.webp",
    imageAlt: "Ballai Input and Tutorial Framework cursor and tutorial icon",
    heroImage: "assets/store/input-tutorial/gallery-05.webp",
    gallery: [
      { src: "assets/store/input-tutorial/gallery-01.webp", alt: "Input glyph asset library shown inside a Unity project" },
      { src: "assets/store/input-tutorial/gallery-02.webp", alt: "Automatic input icon library setup in Unity" },
      { src: "assets/store/input-tutorial/gallery-03.webp", alt: "Generic tutorial popup framework demonstration" },
      { src: "assets/store/input-tutorial/gallery-04.webp", alt: "Action reference tutorial prompt using the current binding" },
      { src: "assets/store/input-tutorial/gallery-05.webp", alt: "Tutorial popup and input rebinding interface" },
      { src: "assets/store/input-tutorial/gallery-06.webp", alt: "Auto-discovered bindings and device-aware tutorial controls" },
    ],
    youtubeVideoId: "tGD3JQSfkhM",
    tags: ["Unity", "Input System", "Rebinding", "Tutorials"],
    features: [
      "Runtime rebinding through Unity's Input System.",
      "Device-aware control icons and an organized glyph library.",
      "Reusable tutorial, onboarding, disclaimer, and information popups.",
      "Action references that avoid hardcoded display keys.",
    ],
    technicalInfo: [
      ["Engine", "Unity"],
      ["Dependency", "Unity Input System"],
      ["Package type", "Input and tutorial UI framework"],
      ["Marketplace status", "Unity Asset Store review pending"],
    ],
  },
  {
    id: "dark-pixel-keyboard-glyph-pack",
    slug: "keyboard-glyph-pack",
    title: "Dark Pixel Keyboard Glyph Pack",
    category: "assets",
    kind: "Pixel Art Asset",
    description: "Clean pixel keyboard glyphs designed for dark game UIs and input prompts.",
    longDescription:
      "A focused collection of pixel-style keyboard glyphs made for dark interfaces, tutorials, rebinding menus, interaction prompts, and compact HUDs. The keys remain readable at small sizes without overpowering the surrounding UI.",
    image: "assets/store/keyboard-glyph-pack/hero.webp",
    imageAlt: "Dark Pixel Keyboard Glyph Pack preview with pixel keyboard keys",
    heroImage: "assets/store/keyboard-glyph-pack/hero.webp",
    gallery: [
      { src: "assets/store/keyboard-glyph-pack/glyph-sheet.webp", alt: "Complete sheet of dark pixel keyboard glyphs" },
    ],
    youtubeVideoId: null,
    tags: ["Pixel Art", "Keyboard", "Input Prompts", "No Generative AI"],
    features: [
      "Numbers 0-9, A-Z, arrow keys, and function keys F1-F12.",
      "Modifier, navigation, editing, symbol, and punctuation keys.",
      "Readable at small sizes in dark HUDs and menus.",
      "Engine independent PNG artwork for common game engines.",
    ],
    detailSections: [
      {
        title: "Made for Game UI",
        text: "Use the glyphs in interaction prompts, tutorial messages, control menus, runtime rebinding screens, ability hints, and HUD elements.",
      },
      {
        title: "Engine Independent",
        text: "The artwork works in Unity, Godot, GameMaker, Unreal Engine, and other engines that support standard image assets.",
      },
    ],
    technicalInfo: [
      ["Package", "keyboard_glyphs.png"],
      ["Coverage", "0-9, A-Z, F1-F12, arrows, modifiers, navigation, and symbols"],
      ["Compatibility", "Any engine supporting standard image formats"],
      ["Generative AI", "Not used"],
    ],
  },
  {
    id: "pixel-art-scythe-ui",
    slug: "scythe-ui",
    title: "Pixel Art Scythe UI Frame",
    category: "assets",
    kind: "Pixel Art Asset",
    description: "A dark fantasy pixel-art scythe created for 2D games, metroidvanias, RPGs and roguelikes.",
    longDescription:
      "The scythe includes an animated eye with an idle movement. The eye can also represent souls, blood, focus, mana, or another resource and trigger an overflow animation when filled.",
    image: "assets/store/scythe-ui/scythe-ui.gif",
    imageAlt: "Animated dark fantasy pixel-art scythe UI frame",
    heroImage: "assets/store/scythe-ui/scythe-ui.gif",
    gallery: [],
    youtubeVideoId: null,
    tags: ["Pixel Art", "Aseprite", "PNG", "Engine Independent"],
    features: [
      "Dark fantasy pixel-art weapon.",
      "Animated eye with idle movement.",
      "Transparent background.",
      "Ready for use in 2D projects.",
      "Engine independent.",
    ],
    detailSections: [
      {
        title: "Animated Eye",
        text: "The scythe includes an animated eye with an idle movement. It can represent souls, blood, focus, mana, or another resource and trigger an overflow animation when filled.",
      },
      {
        title: "Ideal For",
        text: "Metroidvanias, action RPGs, roguelikes, dark fantasy games, boss weapons, and player weapon systems.",
      },
      {
        title: "Engine Independent",
        text: "Import the included sprite files into Unity, Godot, GameMaker, Unreal Engine, or any engine that supports standard image formats.",
      },
    ],
    technicalInfo: [
      ["Source file", "pixelscythe.aseprite"],
      ["Sprite file", "pixelsOverflowFixed.png"],
      ["Compatibility", "Any engine supporting standard image formats"],
      ["Generative AI", "Not used"],
    ],
  },
];

export const assetCommerceState = {
  "dark-pixel-keyboard-glyph-pack": {
    basePrice: 3.99,
    currency: "USD",
    priceSuffix: "or more",
    labels: ["NEW", "NO GENERATIVE AI"],
    platforms: {
      direct: { status: "coming-soon", url: null },
      itch: { status: "available", url: "https://ballaii.itch.io/dark-pixel-keyboard-glyph-pack" },
      unity: { status: "unavailable", url: null },
    },
    promotion: { enabled: false, discountPercent: null, startsAt: null, endsAt: null },
  },
  "ballai-save-system": {
    basePrice: 15,
    currency: "USD",
    labels: ["LAUNCH SALE"],
    platforms: createUnityPlatforms({ directUrl: null, itchUrl: null, unityUrl: null }),
    promotion: { enabled: true, discountPercent: 30, startsAt: null, endsAt: null },
  },
  "ballai-scene-transition": {
    basePrice: 9.99,
    currency: "USD",
    labels: ["NEW"],
    platforms: createUnityPlatforms({ directUrl: null, itchUrl: null, unityUrl: null }),
    promotion: { enabled: false, discountPercent: null, startsAt: null, endsAt: null },
  },
  "ballai-interaction-system": {
    basePrice: 6.99,
    currency: "USD",
    labels: ["NEW"],
    platforms: createUnityPlatforms({ directUrl: null, itchUrl: null, unityUrl: null }),
    promotion: { enabled: false, discountPercent: null, startsAt: null, endsAt: null },
  },
  "ballai-input-tutorial": {
    basePrice: 24.99,
    currency: "USD",
    labels: ["FEATURED"],
    platforms: createUnityPlatforms({ directUrl: null, itchUrl: null, unityUrl: null }),
    promotion: { enabled: true, discountPercent: 50, startsAt: null, endsAt: null },
  },
  "pixel-art-scythe-ui": {
    basePrice: 1,
    currency: "USD",
    priceSuffix: "or more",
    labels: ["NO GENERATIVE AI"],
    platforms: {
      direct: { status: "coming-soon", url: null },
      itch: { status: "available", url: "https://ballaii.itch.io/scythe-ui" },
    },
    promotion: { enabled: false, discountPercent: null, startsAt: null, endsAt: null },
  },
};

export const assetProducts = assetProductContent.map((product) => ({
  ...product,
  ...assetCommerceState[product.id],
  pageId: `store/${product.slug}`,
}));

export const storeCatalogItems = assetProducts;

export const productRouteIds = assetProducts.map((product) => product.pageId);

export const productPageMeta = Object.fromEntries(
  assetProducts.map((product) => [
    product.pageId,
    {
      title: `${product.title} | Ballai Store`,
      description: product.description,
      image: `https://ballaii.github.io/${product.image}`,
    },
  ]),
);

export function getProductByRoute(routeId) {
  return assetProducts.find((product) => product.pageId === routeId) ?? null;
}
