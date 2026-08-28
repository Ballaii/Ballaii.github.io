const commerceApiUrl = import.meta.env.VITE_COMMERCE_API_URL
  ?? "https://ballai-store-api.ballaifoktjeno.workers.dev";

export async function fetchCommerceState(signal) {
  if (!commerceApiUrl) {
    throw new Error("Commerce API URL is not configured");
  }
  const response = await fetch(`${commerceApiUrl}/catalog`, { signal });
  if (!response.ok) {
    throw new Error(`Commerce API returned ${response.status}`);
  }
  const body = await response.json();
  if (!body || !Array.isArray(body.products)) {
    throw new Error("Commerce API returned an invalid product list");
  }
  return body.products;
}

export function recordStoreEvent(event) {
  if (!commerceApiUrl) return;
  fetch(`${commerceApiUrl}/analytics/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => {});
}
