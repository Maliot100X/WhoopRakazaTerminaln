# Put it on a whop.site address

What I verified: inside the Whop sandbox the project lives in `~/apps/<app_id>/` and is published with `whop-publish <app_id>` (draft with `--draft`, progress with `whop-publish status <app_id>`). This app is `app_gSzzFeb0iwPaTm`, live at https://rakazaiterminal.whop.site, owned by business `biz_3hYsvqCIiHD9sq` (RakazAITerminal).

What I did NOT verify: deploying from your own laptop. The starter's `package.json` defines `"deploy": "whop apps deploy"`, which needs a Whop login. Try `npm run deploy` and follow the prompts; if it fails, the sandbox route below always works.

## Easiest: let the Whop AI do it
Open the Whop AI chat for your business and paste the prompt in `docs/AGENT-BUILD.md`, section "One-click prompt". It creates the site, builds it and publishes it.

## After publishing
1. Wait up to a minute. Check `curl -sI https://<your>.whop.site/terminal | grep x-whop-build`.
2. Confirm the share tags: `curl -s https://<your>.whop.site/terminal | grep -o '<meta[^>]*og:image[^>]*>'` (must be an absolute https URL).
3. Test the link card in the X Card Validator / Discord / Telegram. X caches, so a fresh URL shows the new card.
4. To open it from the dashboard, add the app to the business in the Whop dashboard. If the add button is missing, check the app's status (it is `unlisted`).
