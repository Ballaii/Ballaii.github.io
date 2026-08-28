import test from "node:test";
import assert from "node:assert/strict";
import { getProductLabels, getProductPricing, isPromotionActive, mergeCommerceState } from "../src/storeUtils.js";

const product = {
  basePrice: 15,
  currency: "USD",
  labels: ["LAUNCH SALE"],
  promotion: {
    enabled: true,
    discountPercent: 30,
    startsAt: "2026-08-28T15:00:00.000Z",
    endsAt: "2026-09-03T20:59:00.000Z",
  },
};

test("promotion pricing is deterministic before, during, and after a sale", () => {
  assert.equal(getProductPricing(product, new Date("2026-08-28T14:59:00.000Z")).currentPrice, 15);
  assert.equal(getProductPricing(product, new Date("2026-08-30T12:00:00.000Z")).currentPrice, 10.5);
  assert.equal(getProductPricing(product, new Date("2026-09-03T21:00:00.000Z")).currentPrice, 15);
});

test("SALE is automatic and is never duplicated", () => {
  const now = new Date("2026-08-30T12:00:00.000Z");
  assert.equal(isPromotionActive(product.promotion, now), true);
  assert.deepEqual(getProductLabels(product, now), ["LAUNCH SALE", "SALE"]);
  assert.deepEqual(getProductLabels({ ...product, labels: ["SALE"] }, now), ["SALE"]);
});

test("invalid discounts never activate", () => {
  assert.equal(isPromotionActive({ enabled: true, discountPercent: 0 }, new Date()), false);
  assert.equal(isPromotionActive({ enabled: true, discountPercent: 100 }, new Date()), false);
});

test("commerce fallback fails closed when authoritative state is unavailable", () => {
  assert.equal(mergeCommerceState({ id: "asset", visibility: "visible" }, null).visibility, "hidden");
});
