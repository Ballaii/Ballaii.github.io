import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const router = await readFile(new URL("../site-router/src/index.ts", import.meta.url), "utf8");

test("public navigation uses pathname history and crawlable links", () => {
  assert.match(app, /window\.history\.pushState/);
  assert.match(app, /window\.addEventListener\("popstate"/);
  assert.match(app, /href=\{pathForPage\(pageId\)\}/);
  assert.doesNotMatch(app, /href=\{`#\$\{item\.pageId\}`\}/);
});

test("static metadata uses real canonical paths", () => {
  assert.doesNotMatch(html, /https:\/\/ballai\.dev\/#/);
  assert.match(html, /https:\/\/ballai\.dev\/projects\/divine-harvest/);
  assert.match(html, /https:\/\/ballai\.dev\/projects\/seconds-thief/);
});

test("edge router protects publication visibility and generates SEO endpoints", () => {
  assert.match(router, /stage = 'published'/);
  assert.match(router, /visibility = 'visible'/);
  assert.match(router, /archived_at IS NULL/);
  assert.match(router, /sitemap\.xml/);
  assert.match(router, /robots\.txt/);
  assert.match(router, /Response\.redirect/);
  assert.match(router, /escapeHtml/);
});
