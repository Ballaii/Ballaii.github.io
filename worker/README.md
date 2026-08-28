# Ballai Store API

## Phase 2 implementation

The Worker exposes public store endpoints only:

- `GET /health`
- `GET /products`
- `POST /analytics/event`

Privileged mutation routes remain absent from the public Worker. They are implemented as same-origin Cloudflare Pages Functions under `admin/functions/api/admin`, where every request verifies the Cloudflare Access JWT before reading or writing D1.

## Draft and published state

`products` owns stable identity only. `product_revisions` owns mutable commerce fields and allows exactly one `draft` and one `published` revision per product. Platforms, labels, and promotions belong to a revision, so draft edits can be previewed without changing public data. A later publish transaction will copy the draft revision and its child rows into the published revision.

The public endpoint queries only visible revisions at `stage = 'published'`. The admin reads draft and published revisions separately, previews draft changes, and copies a complete draft revision into the published revision in one D1 batch. Test mode accepts a request-scoped preview time and never writes that simulated time to D1.

Promotion times are stored as unambiguous UTC ISO timestamps. The future admin can accept Europe/Bucharest local time, but it must convert that value to UTC before writing.

## Static and remote ownership

The GitHub repository remains the source of truth for titles, descriptions, screenshots, videos, features, and technical information. D1 owns price, currency, labels, visibility, featured state, order, marketplace state, promotions, and timestamps.

## Analytics

`analytics_events` accepts only approved store event names. Public ingestion always records `test_mode = 0`; the reserved test flag is excluded from production reports. The Worker validates and byte-limits the event body, restricts origins, applies a 60 requests per client hash per minute edge rate limit, and removes stale rate buckets and events older than 90 days through a scheduled handler. Public browser telemetry is approximate because a direct client can forge an `Origin` header. It stores no raw IP, user agent, payment data, password data, or customer identity. `ANALYTICS_HASH_SALT` is a Worker secret and is never committed.

## Administration

The protected Pages application supports product search and filtering, draft editing, atomic publishing, labels, marketplace state, promotion presets and schedules, Europe/Bucharest time conversion, test-mode previews, analytics summaries, audit history, and a two-step emergency action that ends all live and draft sales.

## Local validation

```powershell
pnpm install
pnpm --dir worker exec wrangler d1 migrations apply ballai-store --local
pnpm --dir worker dev
```

Local D1 state is stored under `.wrangler/` and is ignored by Git.
