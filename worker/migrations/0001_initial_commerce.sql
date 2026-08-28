PRAGMA foreign_keys = ON;

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_revisions (
  revision_key TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('draft', 'published')),
  base_price REAL CHECK (base_price IS NULL OR base_price >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  price_suffix TEXT,
  visibility TEXT NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden')),
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT,
  UNIQUE (product_id, stage),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_platforms (
  revision_key TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('direct', 'itch', 'unity')),
  status TEXT NOT NULL CHECK (status IN ('available', 'coming-soon', 'pending-review', 'unavailable')),
  url TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (revision_key, platform),
  FOREIGN KEY (revision_key) REFERENCES product_revisions(revision_key) ON DELETE CASCADE
);

CREATE TABLE product_labels (
  revision_key TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (revision_key, label),
  FOREIGN KEY (revision_key) REFERENCES product_revisions(revision_key) ON DELETE CASCADE
);

CREATE TABLE promotions (
  id TEXT PRIMARY KEY,
  revision_key TEXT UNIQUE NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0, 1)),
  discount_percent REAL CHECK (discount_percent IS NULL OR (discount_percent > 0 AND discount_percent < 100)),
  starts_at_utc TEXT,
  ends_at_utc TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (revision_key) REFERENCES product_revisions(revision_key) ON DELETE CASCADE
);

CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL CHECK (event_name IN ('store_view', 'product_view', 'marketplace_click', 'search', 'store_filter')),
  product_id TEXT,
  session_hash TEXT,
  metadata_json TEXT,
  occurred_at_utc TEXT NOT NULL,
  test_mode INTEGER NOT NULL DEFAULT 0 CHECK (test_mode IN (0, 1)),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE INDEX idx_product_revisions_stage_order ON product_revisions(stage, visibility, display_order);
CREATE INDEX idx_product_platforms_revision ON product_platforms(revision_key);
CREATE INDEX idx_product_labels_revision ON product_labels(revision_key);
CREATE INDEX idx_promotions_revision ON promotions(revision_key);
CREATE INDEX idx_analytics_events_time ON analytics_events(occurred_at_utc);

INSERT INTO products (id, slug) VALUES
  ('ballai-save-system', 'save-system'),
  ('ballai-scene-transition', 'scene-transition'),
  ('ballai-interaction-system', 'interaction-system'),
  ('ballai-input-tutorial', 'input-tutorial'),
  ('pixel-art-scythe-ui', 'scythe-ui');

INSERT INTO product_revisions (
  revision_key, product_id, stage, base_price, currency, price_suffix,
  visibility, featured, display_order, published_at
) VALUES
  ('ballai-save-system:published', 'ballai-save-system', 'published', 15, 'USD', NULL, 'visible', 0, 10, CURRENT_TIMESTAMP),
  ('ballai-scene-transition:published', 'ballai-scene-transition', 'published', 9.99, 'USD', NULL, 'visible', 0, 20, CURRENT_TIMESTAMP),
  ('ballai-interaction-system:published', 'ballai-interaction-system', 'published', 6.99, 'USD', NULL, 'visible', 0, 30, CURRENT_TIMESTAMP),
  ('ballai-input-tutorial:published', 'ballai-input-tutorial', 'published', 24.99, 'USD', NULL, 'visible', 1, 40, CURRENT_TIMESTAMP),
  ('pixel-art-scythe-ui:published', 'pixel-art-scythe-ui', 'published', 1, 'USD', 'or more', 'visible', 0, 50, CURRENT_TIMESTAMP);

INSERT INTO product_revisions (
  revision_key, product_id, stage, base_price, currency, price_suffix,
  visibility, featured, display_order
)
SELECT
  product_id || ':draft', product_id, 'draft', base_price, currency, price_suffix,
  visibility, featured, display_order
FROM product_revisions
WHERE stage = 'published';

INSERT INTO product_platforms (revision_key, platform, status, url) VALUES
  ('ballai-save-system:published', 'direct', 'coming-soon', NULL),
  ('ballai-save-system:published', 'itch', 'coming-soon', NULL),
  ('ballai-save-system:published', 'unity', 'pending-review', NULL),
  ('ballai-scene-transition:published', 'direct', 'coming-soon', NULL),
  ('ballai-scene-transition:published', 'itch', 'coming-soon', NULL),
  ('ballai-scene-transition:published', 'unity', 'pending-review', NULL),
  ('ballai-interaction-system:published', 'direct', 'coming-soon', NULL),
  ('ballai-interaction-system:published', 'itch', 'coming-soon', NULL),
  ('ballai-interaction-system:published', 'unity', 'pending-review', NULL),
  ('ballai-input-tutorial:published', 'direct', 'coming-soon', NULL),
  ('ballai-input-tutorial:published', 'itch', 'coming-soon', NULL),
  ('ballai-input-tutorial:published', 'unity', 'pending-review', NULL),
  ('pixel-art-scythe-ui:published', 'direct', 'coming-soon', NULL),
  ('pixel-art-scythe-ui:published', 'itch', 'available', 'https://ballaii.itch.io/scythe-ui');

INSERT INTO product_platforms (revision_key, platform, status, url)
SELECT replace(revision_key, ':published', ':draft'), platform, status, url
FROM product_platforms
WHERE revision_key LIKE '%:published';

INSERT INTO product_labels (revision_key, label) VALUES
  ('ballai-save-system:published', 'LAUNCH SALE'),
  ('ballai-scene-transition:published', 'NEW'),
  ('ballai-interaction-system:published', 'NEW'),
  ('ballai-input-tutorial:published', 'FEATURED'),
  ('pixel-art-scythe-ui:published', 'NO GENERATIVE AI');

INSERT INTO product_labels (revision_key, label)
SELECT replace(revision_key, ':published', ':draft'), label
FROM product_labels
WHERE revision_key LIKE '%:published';

INSERT INTO promotions (
  id, revision_key, enabled, discount_percent, starts_at_utc, ends_at_utc
) VALUES
  ('ballai-save-system:published:promotion', 'ballai-save-system:published', 1, 30, NULL, NULL),
  ('ballai-scene-transition:published:promotion', 'ballai-scene-transition:published', 0, NULL, NULL, NULL),
  ('ballai-interaction-system:published:promotion', 'ballai-interaction-system:published', 0, NULL, NULL, NULL),
  ('ballai-input-tutorial:published:promotion', 'ballai-input-tutorial:published', 1, 50, NULL, NULL),
  ('pixel-art-scythe-ui:published:promotion', 'pixel-art-scythe-ui:published', 0, NULL, NULL, NULL);

INSERT INTO promotions (
  id, revision_key, enabled, discount_percent, starts_at_utc, ends_at_utc
)
SELECT
  replace(id, ':published:', ':draft:'),
  replace(revision_key, ':published', ':draft'),
  enabled,
  discount_percent,
  starts_at_utc,
  ends_at_utc
FROM promotions
WHERE revision_key LIKE '%:published';
