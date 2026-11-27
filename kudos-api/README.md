# Kudos API

A one-route counter for the hold-to-kudo button on aliirz.com. The site stays a static Jekyll build. This folder is excluded from that build and is not deployed by the steps below until you run them yourself.

`GET /api/kudos?slug=its-not-sabotage-its-a-catapult` returns `{ "count": 3 }`.

`POST /api/kudos` with `{ "slug": "its-not-sabotage-its-a-catapult" }` adds one and returns `{ "count": 4 }`. The same IP and slug only count once. A later post from that IP returns the current count and does not add another.

Slugs must match `^[a-z0-9][a-z0-9._-]{0,120}$`.

## Store

Use either Upstash Redis or a Vercel KV store. Both speak the same REST API. Set one pair:

- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- `KV_REST_API_URL` and `KV_REST_API_TOKEN`

Optional: `KUDOS_IP_SALT`, mixed into the hash before an address is stored. The raw address is not written.

Keys:

- `kudos:count:<slug>` — the public total
- `kudos:seen:<slug>:<ip-hash>` — set once, for a year, so a repeat does not increment
- `kudos:rl:post:<ip-hash>` — 30 posts an hour
- `kudos:rl:get:<ip-hash>` — 120 reads in ten minutes

## CORS

Responses allow `https://aliirz.com`, `https://www.aliirz.com`, `http://localhost` (any port), and `http://127.0.0.1` (any port). Other origins get no `Access-Control-Allow-Origin` header.

## Deploy (when you want to)

From this directory, with the [Vercel CLI](https://vercel.com/docs/cli) logged in:

1. Create an Upstash Redis database, or a KV store on the Vercel project.
2. `vercel link` this folder as its own project (not the Jekyll repo root).
3. `vercel env add UPSTASH_REDIS_REST_URL` and `vercel env add UPSTASH_REDIS_REST_TOKEN` for production. Use the `KV_REST_API_*` names instead if that is what the store gave you.
4. `vercel deploy --prod`
5. In the site `_config.yml`, set `kudos_endpoint` to `https://<project>.vercel.app/api/kudos` and redeploy the GitHub Pages site.

Until `kudos_endpoint` is set, or if this service errors, the button still plays the hold animation and remembers a kudo in `localStorage`. It just does not show a number.

## Check

`npm test` checks slug rules, the origin list, a rejected slug, and the “no Redis configured” response. It does not call a database.
