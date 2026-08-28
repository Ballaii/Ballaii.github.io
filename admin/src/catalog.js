export const catalog = {
  "ballai-save-system": { title: "Ballai Save System", image: "/assets/save-system.webp", category: "Unity Asset" },
  "ballai-scene-transition": { title: "Ballai Scene Transition and Checkpoint System", image: "/assets/scene-transition.webp", category: "Unity Asset" },
  "ballai-interaction-system": { title: "Ballai Basic Interaction System", image: "/assets/interaction-system.webp", category: "Unity Asset" },
  "ballai-input-tutorial": { title: "Ballai Input and Tutorial Framework", image: "/assets/input-tutorial.webp", category: "Unity Asset" },
  "pixel-art-scythe-ui": { title: "Pixel Art Scythe UI Frame", image: "/assets/scythe-ui.gif", category: "Pixel Art Asset" },
  "dark-pixel-keyboard-glyph-pack": { title: "Dark Pixel Keyboard Glyph Pack", image: "/assets/keyboard-glyph-pack.webp", category: "Pixel Art Asset" },
};

export function productInfo(productId, product) {
  const card = product?.media?.find((item) => item.role === "card");
  return catalog[productId] ?? {
    title: product?.content?.title ?? productId,
    image: card ? `/api/admin/media/${card.id}` : "",
    category: product?.content?.kind ?? "Asset",
  };
}
