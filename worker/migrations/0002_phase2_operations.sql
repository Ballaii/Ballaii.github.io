PRAGMA foreign_keys = ON;

CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  action TEXT NOT NULL CHECK (action IN (
    'draft_saved', 'draft_discarded', 'product_published', 'promotion_changed',
    'price_changed', 'labels_changed', 'platform_changed', 'visibility_changed',
    'all_sales_ended'
  )),
  actor_email TEXT,
  before_json TEXT,
  after_json TEXT,
  occurred_at_utc TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE analytics_rate_limits (
  client_hash TEXT NOT NULL,
  minute_bucket TEXT NOT NULL,
  event_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (client_hash, minute_bucket)
);

CREATE INDEX idx_audit_log_time ON audit_log(occurred_at_utc DESC);
CREATE INDEX idx_audit_log_product ON audit_log(product_id, occurred_at_utc DESC);

INSERT OR IGNORE INTO products (id, slug)
VALUES ('dark-pixel-keyboard-glyph-pack', 'keyboard-glyph-pack');

INSERT OR IGNORE INTO product_revisions (
  revision_key, product_id, stage, base_price, currency, price_suffix,
  visibility, featured, display_order, published_at
) VALUES (
  'dark-pixel-keyboard-glyph-pack:published', 'dark-pixel-keyboard-glyph-pack',
  'published', 3.99, 'USD', 'or more', 'visible', 0, 60, CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO product_revisions (
  revision_key, product_id, stage, base_price, currency, price_suffix,
  visibility, featured, display_order
) VALUES (
  'dark-pixel-keyboard-glyph-pack:draft', 'dark-pixel-keyboard-glyph-pack',
  'draft', 3.99, 'USD', 'or more', 'visible', 0, 60
);

INSERT OR IGNORE INTO product_platforms (revision_key, platform, status, url) VALUES
  ('dark-pixel-keyboard-glyph-pack:published', 'direct', 'coming-soon', NULL),
  ('dark-pixel-keyboard-glyph-pack:published', 'itch', 'available', 'https://ballaii.itch.io/dark-pixel-keyboard-glyph-pack'),
  ('dark-pixel-keyboard-glyph-pack:published', 'unity', 'unavailable', NULL),
  ('dark-pixel-keyboard-glyph-pack:draft', 'direct', 'coming-soon', NULL),
  ('dark-pixel-keyboard-glyph-pack:draft', 'itch', 'available', 'https://ballaii.itch.io/dark-pixel-keyboard-glyph-pack'),
  ('dark-pixel-keyboard-glyph-pack:draft', 'unity', 'unavailable', NULL);

INSERT OR IGNORE INTO product_labels (revision_key, label) VALUES
  ('dark-pixel-keyboard-glyph-pack:published', 'NEW'),
  ('dark-pixel-keyboard-glyph-pack:published', 'NO GENERATIVE AI'),
  ('dark-pixel-keyboard-glyph-pack:draft', 'NEW'),
  ('dark-pixel-keyboard-glyph-pack:draft', 'NO GENERATIVE AI');

INSERT OR IGNORE INTO promotions (
  id, revision_key, enabled, discount_percent, starts_at_utc, ends_at_utc
) VALUES
  ('dark-pixel-keyboard-glyph-pack:published:promotion', 'dark-pixel-keyboard-glyph-pack:published', 0, NULL, NULL, NULL),
  ('dark-pixel-keyboard-glyph-pack:draft:promotion', 'dark-pixel-keyboard-glyph-pack:draft', 0, NULL, NULL, NULL);
