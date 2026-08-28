export function isPromotionActive(promotion, now = new Date()) {
  if (
    !promotion?.enabled ||
    !Number.isFinite(promotion.discountPercent) ||
    promotion.discountPercent <= 0 ||
    promotion.discountPercent >= 100
  ) {
    return false;
  }

  const currentTime = now.getTime();
  const startsAt = promotion.startsAt ? Date.parse(promotion.startsAt) : null;
  const endsAt = promotion.endsAt ? Date.parse(promotion.endsAt) : null;

  if ((startsAt !== null && Number.isNaN(startsAt)) || (endsAt !== null && Number.isNaN(endsAt))) {
    return false;
  }

  return (startsAt === null || currentTime >= startsAt) && (endsAt === null || currentTime <= endsAt);
}

export function getProductPricing(product, now = new Date()) {
  const basePrice = Number(product.basePrice);
  const promotionActive = isPromotionActive(product.promotion, now);
  const discountPercent = promotionActive ? product.promotion.discountPercent : 0;
  const currentPrice = promotionActive ? basePrice * (1 - discountPercent / 100) : basePrice;

  return {
    basePrice,
    currentPrice,
    discountPercent,
    promotionActive,
  };
}

export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getProductLabels(product, now = new Date()) {
  const labels = [...(product.labels ?? [])];
  if (isPromotionActive(product.promotion, now) && !labels.includes("SALE")) {
    labels.push("SALE");
  }
  return labels;
}

export function formatPromotionEnd(endsAt) {
  if (!endsAt) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(endsAt));
}

export function mergeCommerceState(staticProduct, remoteState) {
  if (!remoteState) return { ...staticProduct, visibility: "hidden" };
  const remoteGallery = Array.isArray(remoteState.media)
    ? remoteState.media.filter((item) => item.role === "gallery").map((item) => ({ src: `${remoteState.mediaBaseUrl}/media/${item.id}`, alt: item.alt || staticProduct.imageAlt }))
    : [];
  return {
    ...staticProduct,
    ...(remoteState.title ? {
      title: remoteState.title,
      category: remoteState.category,
      kind: remoteState.kind,
      description: remoteState.shortDescription,
      longDescription: remoteState.longDescription,
      tags: remoteState.tags,
      features: remoteState.features,
      technicalInfo: (remoteState.technicalInfo ?? []).map((item) => [item.label, item.value]),
      detailSections: remoteState.detailSections,
      youtubeVideoId: remoteState.youtubeVideoId,
    } : {}),
    basePrice: remoteState.basePrice,
    currency: remoteState.currency,
    displayOrder: remoteState.displayOrder,
    featured: remoteState.featured,
    labels: Array.isArray(remoteState.labels) ? remoteState.labels : staticProduct.labels,
    platforms: remoteState.platforms ?? staticProduct.platforms,
    priceSuffix: remoteState.priceSuffix,
    promotion: remoteState.promotion ?? staticProduct.promotion,
    updatedAt: remoteState.updatedAt,
    visibility: remoteState.visibility,
    ...(Array.isArray(remoteState.media) && remoteState.media.length ? {
      image: `${remoteState.mediaBaseUrl}/media/${(remoteState.media.find((item) => item.role === "card") ?? remoteState.media.find((item) => item.role === "hero"))?.id}`,
      heroImage: `${remoteState.mediaBaseUrl}/media/${(remoteState.media.find((item) => item.role === "hero") ?? remoteState.media.find((item) => item.role === "card"))?.id}`,
      gallery: remoteGallery.length ? remoteGallery : staticProduct.gallery,
    } : {}),
  };
}
