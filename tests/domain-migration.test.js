import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public metadata uses ballai.dev as the canonical origin", async () => {
  const html = await read("index.html");

  assert.match(html, /rel="canonical" href="https:\/\/ballai\.dev\/"/);
  assert.match(html, /property="og:url" content="https:\/\/ballai\.dev\/"/);
  assert.match(html, /https:\/\/api\.ballai\.dev/);
});

test("commerce defaults to the custom API hostname", async () => {
  const commerceApi = await read("src/commerceApi.js");
  const app = await read("src/App.jsx");

  assert.match(commerceApi, /https:\/\/api\.ballai\.dev/);
  assert.match(app, /const publicOrigin = "https:\/\/ballai\.dev"/);
  assert.match(app, /const commerceApiOrigin = "https:\/\/api\.ballai\.dev"/);
});

test("worker retains canonical and migration CORS origins", async () => {
  const worker = await read("worker/src/index.ts");

  for (const origin of [
    "https://ballai.dev",
    "https://www.ballai.dev",
    "https://admin.ballai.dev",
    "https://ballaii.github.io",
    "https://ballai-admin.pages.dev",
  ]) {
    assert.match(worker, new RegExp(origin.replace(/[.]/g, "\\.")));
  }
});

test("security hardening keeps early upload and event-shape limits", async () => {
  const adminRoute = await read("admin/functions/api/admin/[[path]].ts");
  const worker = await read("worker/src/index.ts");

  assert.match(adminRoute, /Content-Length/);
  assert.match(adminRoute, /maximumUploadBytes \+ 64 \* 1024/);
  assert.match(worker, /Invalid marketplace click event/);
  assert.match(worker, /Invalid product view event/);
});
