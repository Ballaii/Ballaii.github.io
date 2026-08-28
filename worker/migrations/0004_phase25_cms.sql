PRAGMA foreign_keys = ON;

ALTER TABLE products ADD COLUMN archived_at TEXT;
ALTER TABLE product_revisions ADD COLUMN content_json TEXT NOT NULL DEFAULT '{}';

CREATE TABLE media_objects (
  id TEXT PRIMARY KEY,
  r2_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/webp', 'image/gif')),
  width INTEGER NOT NULL CHECK (width > 0 AND width <= 6000),
  height INTEGER NOT NULL CHECK (height > 0 AND height <= 6000),
  byte_size INTEGER NOT NULL CHECK (byte_size > 0 AND byte_size <= 10485760),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  orphaned_at TEXT
);

CREATE TABLE product_revision_media (
  revision_key TEXT NOT NULL,
  media_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('card', 'hero', 'gallery')),
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0 AND display_order <= 1000),
  alt_text TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (revision_key, media_id, role),
  FOREIGN KEY (revision_key) REFERENCES product_revisions(revision_key) ON DELETE CASCADE,
  FOREIGN KEY (media_id) REFERENCES media_objects(id) ON DELETE RESTRICT
);

CREATE TABLE product_slug_aliases (
  product_id TEXT NOT NULL,
  old_slug TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_media_orphaned ON media_objects(orphaned_at);
CREATE INDEX idx_revision_media_revision ON product_revision_media(revision_key, role, display_order);
CREATE INDEX idx_slug_aliases_product ON product_slug_aliases(product_id);

CREATE TABLE audit_log_v4 (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  action TEXT NOT NULL CHECK (action IN (
    'draft_saved', 'draft_discarded', 'product_created', 'product_published',
    'promotion_changed', 'price_changed', 'labels_changed', 'platform_changed',
    'visibility_changed', 'content_changed', 'slug_changed', 'media_uploaded',
    'media_removed', 'media_reordered', 'product_archived', 'product_restored',
    'draft_deleted', 'all_sales_ended'
  )),
  actor_email TEXT,
  before_json TEXT,
  after_json TEXT,
  occurred_at_utc TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

INSERT INTO audit_log_v4 SELECT id, product_id, action, actor_email, before_json, after_json, occurred_at_utc FROM audit_log;
DROP TABLE audit_log;
ALTER TABLE audit_log_v4 RENAME TO audit_log;
CREATE INDEX idx_audit_log_time ON audit_log(occurred_at_utc DESC);
CREATE INDEX idx_audit_log_product ON audit_log(product_id, occurred_at_utc DESC);
