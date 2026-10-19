# senzi.dev

personal card site with live blocks, like now playing spotify and steam, neofetch-style version for the terminal

```sh
curl senzi.dev
curl senzi.dev/short
curl senzi.dev/full
curl senzi.dev/about
```

## stack

next.js 16 (app router, standalone output), react 19, typescript  
css modules, motion  
leva for dev menu  
biome, vitest  
pnpm, node 24  
docker, github actions, ghcr, nginx

## layout

```
deploy/           dockerfile, compose, deploy script and nginx config
scripts/          generators for the avatar, background, icons, footer tail and ascii fox
src/app/api/      spotify, steam and health endpoints, dev-only tuning and presets routes
src/app/terminal/ plain-text pages for curl, wget and friends
src/components/   ui and content blocks, the dev menu
src/content/      texts, links, theme, terminal layout
src/lib/          data providers, terminal renderer, effect defaults and tuning
src/proxy.ts      user-agent routing between the site and the terminal version
```

## local setup

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

`.env.local` needs just for spotify and steam blocks, without them the blocks just stay idle

| variable | where to get it |
| --- | --- |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` | [spotify developer dashboard](https://developer.spotify.com/dashboard/), redirect url `http://127.0.0.1:8888/callback` |
| `SPOTIFY_REFRESH_TOKEN` | `pnpm spotify:auth` |
| `STEAM_API_KEY` | [steam web api key](https://steamcommunity.com/dev/apikey) |
| `STEAM_ID` | [64-bit id or vanity name from the profile url](https://steamdb.com/en/tools/steam-id-finder) |

## scripts

| command | what it does |
| --- | --- |
| `pnpm check` | lint, typecheck and tests |
| `pnpm avatar` | builds the avatar, its silhouette, the cutout and favicons from `assets/avatar` |
| `pnpm background` | compresses the background from `assets/background` into avif and webp |
| `pnpm icons` | regenerates the icon subset from iconify |
| `pnpm tail` | regenerates the footer tail animation |
| `pnpm fox` | regenerates the ascii fox for the terminal version |
| `pnpm docker:local` | builds the image and runs it with `.env.local` |

## dev menu

only in `pnpm dev`, open it with the `dev` button in the corner or the `` ` `` key

- live sliders for avatar sparks, flip and its hint, flashlight, card glow, copy burst, background, header line and footer tail
- palette colors as a live preview, they are never saved
- slow motion, pause and fps graph
- a list of changed values with a reset for each
- presets, kept locally in `docs/tuning-presets.json`
- "write to code" saves values to `src/lib/tuningDefaults.ts`

until then values live in localStorage, so they survive a reload

## deploy

a push to main runs checks, builds the image on github runners, pushes it to ghcr and deploys it on the server through a self-hosted runner. `deploy/deploy.sh` waits for the healthcheck and rolls back to the previous image if it fails. the footer and `curl senzi.dev` show the deployed commit and when it was built

## license

the code is under the [mit license](LICENSE), the content is not: information in `src/content`, photos and images in `assets` and `public`, and the generated avatar, silhouette, favicons and ascii arts are © senzifox, all rights reserved.
