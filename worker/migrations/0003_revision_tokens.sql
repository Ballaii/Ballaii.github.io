ALTER TABLE product_revisions ADD COLUMN revision_token TEXT;

UPDATE product_revisions
SET revision_token = lower(hex(randomblob(16)))
WHERE revision_token IS NULL;

CREATE INDEX idx_product_revisions_token
ON product_revisions(product_id, stage, revision_token);
