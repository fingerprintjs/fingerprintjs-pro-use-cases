---
name: verify-use-cases
description: Run the Fingerprint use-cases demo (Next.js web app, demo.fingerprint.com) locally or on staging and drive it with Playwright to prove a change works. Use when verifying changes to the playground or any use-case demo page.
---

# Verify the use-cases demo

This is a Next.js web app. Pages identify the browser with the Fingerprint JS agent, then call their own API routes, which check the event with the Server API and store state in SQLite (`.data/database.sqlite`).

* Each use case has a spec in [e2e/](../../../e2e/), for example `e2e/coupon-fraud.spec.ts`. Read the spec of the feature you changed.
* Write a scratch `e2e/verify-<topic>.spec.ts` next to it that repeats the steps you need to prove and saves a screenshot after each visible result (see [Proof](#proof)). Delete it when done, `e2e/` is tracked.

## Pick where to run it

Ordered from cheapest to most expensive. Pick the first one that can show your change.

1. **Dev server.** For UI and API route changes.
   - Start: `PORT=3000 node_modules/.bin/next dev`
   - Test: `EVIDENCE_DIR=<evidence-dir> PORT=3000 pnpm exec playwright test e2e/<name>.spec.ts --project=chromium --trace on --output <evidence-dir>/run1`
2. **Production build.** For build-only behavior: env validation at build time, caching, static output.
   - Start: `pnpm build && PORT=3000 pnpm start`
   - Test: same command as for the dev server.
3. **Staging.** For behavior that needs a public deployment, such as real client IPs, proxy headers (`TRUSTED_PROXY_COUNT`), and the CloudFront setup.
   - Deploy: push your branch to the `staging` branch, which deploys https://staging.fingerprinthub.com (see [contributing.md](../../../contributing.md#staging-deployment)). Ask the user first. Other people may be using staging.
   - Test: `EVIDENCE_DIR=<evidence-dir> PRODUCTION_E2E_TEST_BASE_URL=https://staging.fingerprinthub.com pnpm exec playwright test e2e/<name>.spec.ts --project=chromium --trace on --output <evidence-dir>/run1`

## Proof

Keep evidence in `.scratchpad/verify/<YYYYMMDD-HHMM>-<topic>/` in the user's main checkout, even when the server runs from a worktree. Git ignores it, and links to it open from the workspace. Use that folder as `<evidence-dir>`.

- **Screenshots** of each visible result, so a human can check them at a glance. The config only takes screenshots on failure, so save them in the scratch spec. Screenshot the demo area, not the page:

  ```ts
  await page.locator('header').evaluate((el) => (el.style.visibility = 'hidden')); // sticky site header, covers the demo
  await page.getByTestId(TEST_IDS.common.demoBrowser).screenshot({ path: `${process.env.EVIDENCE_DIR}/<step>.png` });
  ```

  - Hide the header again after each page load. Navigation brings it back.
  - `page.screenshot()` often misses the result. The sticky site header covers alerts near the top, and scrolling first doesn't always help.

  In the report, list each screenshot as a clickable markdown link relative to the repo root, with one line on what it shows: `[3-sixth-refused.png](.scratchpad/verify/20261020-1400-cred/3-sixth-refused.png): 6th login refused`. Pick the format for where the user reads:
  - IDE chat (VS Code): links. Inline images (`![]()`) don't render there.
  - A client that renders local images: embed them inline.
  - Plain terminal: links plus `open <evidence-dir>` (macOS) to browse the folder.

- **Test output and trace.** Open a trace with `pnpm exec playwright show-trace <trace.zip>`.
- **Database rows** where the change writes data. List tables with `sqlite3 .data/database.sqlite .tables`, names vary per use case. Quote names with dashes: `select * from "coupon-claims";`.

## Gotchas

- **Use port 3000 only.** The default public key belongs to the demo's Fingerprint staging workspace, which allows `localhost:3000` but not 3001. On other ports, identification fails with 403 `origin_not_available`. To use another port, put your own `NEXT_PUBLIC_API_KEY`, `NEXT_PUBLIC_REGION`, and `SERVER_API_KEY` in `.env`.
- **Port 3000 may be the user's server.** Check with `lsof -nP -iTCP:3000 -sTCP:LISTEN`. Drive it only if it runs from the checkout you are verifying. Never stop it.
- **Stop only what you started, by process group, never by name.** `pnpm dev` puts Next in a separate process group, so start `next dev` directly. To give it its own group from zsh, use `bash -c 'set -m; PORT=3000 node_modules/.bin/next dev > server.log 2>&1 & echo $! > server.pgid'`, then stop it with `kill -TERM -- -$(cat server.pgid)`.
- **`.data/database.sqlite` in the user's checkout holds their local data.** Don't delete it. For fresh state, run in a worktree (`git worktree add`, copy `.env`, `pnpm install`). SQLite creates the file on the first API call.
- **The server writes `.data/` in the directory it runs from.** In a worktree, read the database from the worktree, not the main checkout. Copy it into the evidence folder before `git worktree remove`, which deletes it.
- **Playwright needs its browsers installed.** On a fresh machine, run `pnpm exec playwright install chromium` first.
- **E2E tests click Restart first,** which clears data for the current visitor only. Skip it and earlier runs change the result.
- **Each test's Restart wipes the previous test's rows.** Put all the steps you need to prove in one scratch test. To read the database after an existing spec, run only that test with `-g "<test name>"`.
- **A result message from the previous submit can still be on screen.** Waiting for its text can pass before the new response arrives. Wait for the response instead, for example `page.waitForResponse('**/request-loan')`, and check its status.
- **Playwright empties the `--output` directory on each run.** Use a new directory per run.
- **Keep the specs' `FINGERPRINT_BOT_USER_AGENT`.** Some routes deny `bad` bots.
- **Some flows need env vars:**
  - Credential stuffing login success needs your visitor ID in `KNOWN_VISITOR_IDS`.
  - The playground map needs `NEXT_PUBLIC_MAPBOX_API_TOKEN`.
  - Bot firewall needs Cloudflare env vars.
  - SMS pumping needs Twilio env vars.
- **Errors like "confidence score too low" or "Old identification request"** come from the Server API checks in [src/server/checks.ts](../../../src/server/checks.ts), not from your change.

## Keep this skill current

When a run surprises you and you confirm the cause, add or fix a gotcha here in the same change. Delete gotchas that are no longer true. Keep each one to the symptom and the fix.
