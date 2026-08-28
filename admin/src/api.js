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
  archive: (productId) => request(`/products/${encodeURIComponent(productId)}/archive`, { method: "POST" }),
  analytics: (range) => request(`/analytics?range=${range}`),
  dashboard: () => request("/dashboard"),
  createProduct: (payload) => request("/products", { method: "POST", body: JSON.stringify(payload) }),
  deleteProduct: (productId) => request(`/products/${encodeURIComponent(productId)}/delete`, { method: "DELETE" }),
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
  restore: (productId) => request(`/products/${encodeURIComponent(productId)}/restore`, { method: "POST" }),
  removeMedia: (mediaId, productId) => request(`/media/${encodeURIComponent(mediaId)}/remove`, { method: "POST", body: JSON.stringify({ productId }) }),
  reorderMedia: (productId, mediaIds) => request("/media/reorder", { method: "POST", body: JSON.stringify({ productId, mediaIds }) }),
  saveDraft: (productId, draft, expectedDraftRevisionToken) => request(`/products/${encodeURIComponent(productId)}/draft`, {
    method: "PUT",
    body: JSON.stringify({ draft, expectedDraftRevisionToken }),
  }),
  uploadMedia: async (formData) => {
    const response = await fetch(`${apiRoot}/media/upload`, { method: "POST", credentials: "same-origin", body: formData });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Request failed with status ${response.status}`);
    return body;
  },
};
