PRAGMA foreign_keys = ON;

CREATE TABLE audit_log_v5 (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  action TEXT NOT NULL CHECK (action IN (
    'draft_saved', 'draft_discarded', 'product_created', 'product_published',
    'promotion_changed', 'price_changed', 'labels_changed', 'platform_changed',
    'visibility_changed', 'content_changed', 'slug_changed', 'media_uploaded',
    'media_removed', 'media_reordered', 'product_archived', 'product_restored',
    'draft_deleted', 'product_deleted', 'all_sales_ended'
  )),
  actor_email TEXT,
  before_json TEXT,
  after_json TEXT,
  occurred_at_utc TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

INSERT INTO audit_log_v5 SELECT id, product_id, action, actor_email, before_json, after_json, occurred_at_utc FROM audit_log;
DROP TABLE audit_log;
ALTER TABLE audit_log_v5 RENAME TO audit_log;
CREATE INDEX idx_audit_log_time ON audit_log(occurred_at_utc DESC);
CREATE INDEX idx_audit_log_product ON audit_log(product_id, occurred_at_utc DESC);
