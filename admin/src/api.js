const apiRoot = "/api/admin";

async function request(path, options = {}) {
  const response = await fetch(`${apiRoot}${path}`, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  return body;
}

export const adminApi = {
  analytics: (range) => request(`/analytics?range=${range}`),
  dashboard: () => request("/dashboard"),
  discardDraft: (productId, draftRevisionToken) => request(`/products/${encodeURIComponent(productId)}/discard`, {
    method: "POST", body: JSON.stringify({ draftRevisionToken }),
  }),
  endAllSales: () => request("/sales/end-all", { method: "POST" }),
  health: () => request("/health"),
  products: () => request("/products"),
  publish: (productId, draftRevisionToken) => request(`/products/${encodeURIComponent(productId)}/publish`, {
    method: "POST",
    body: JSON.stringify({ draftRevisionToken }),
  }),
  saveDraft: (productId, draft, expectedDraftRevisionToken) => request(`/products/${encodeURIComponent(productId)}/draft`, {
    method: "PUT",
    body: JSON.stringify({ draft, expectedDraftRevisionToken }),
  }),
};
