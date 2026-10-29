import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const router = await readFile(new URL("../site-router/src/index.ts", import.meta.url), "utf8");
const data = await readFile(new URL("../src/data.js", import.meta.url), "utf8");

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
  assert.match(html, /https:\/\/ballai\.dev\/projects\/ai-anticheat/);
});

test("edge router protects publication visibility and generates SEO endpoints", () => {
  assert.match(router, /stage = 'published'/);
  assert.match(router, /visibility = 'visible'/);
  assert.match(router, /archived_at IS NULL/);
  assert.match(router, /sitemap\.xml/);
  assert.match(router, /robots\.txt/);
  assert.match(router, /Response\.redirect/);
  assert.match(router, /escapeHtml/);
  assert.match(router, /\/projects\/ai-anticheat/);
});

test("portfolio separates the GMTK prototype from the upcoming games", () => {
  assert.match(data, /name: "Second's Thief: GMTK Edition"/);
  assert.match(data, /id: "divine-harvest-legacy"/);
  assert.match(data, /id: "seconds-thief-3d"/);
  assert.match(data, /name: "Second's Thief"/);
  assert.match(data, /upcoming: true/g);
  assert.match(router, /Second's Thief: GMTK Edition/);
  assert.match(app, /upcoming-project-art/);
});
