import test from "node:test";
import assert from "node:assert/strict";
import { toBucharestInput, toUtcIsoFromBucharest } from "../admin/src/time.js";

test("winter Bucharest time derives the UTC+2 offset", () => {
  assert.equal(toUtcIsoFromBucharest("2026-01-15T12:00"), "2026-01-15T10:00:00.000Z");
});

test("summer Bucharest time derives the UTC+3 offset", () => {
  assert.equal(toUtcIsoFromBucharest("2026-07-15T12:00"), "2026-07-15T09:00:00.000Z");
});

test("UTC timestamps round-trip into Bucharest admin inputs", () => {
  assert.equal(toBucharestInput("2026-08-28T15:00:00.000Z"), "2026-08-28T18:00");
});

test("nonexistent daylight-saving local times are rejected", () => {
  assert.throws(() => toUtcIsoFromBucharest("2026-03-29T03:30"), /does not exist/);
});
