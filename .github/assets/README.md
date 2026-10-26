# README assets

Images used by the repository's root `README.md`. The GitHub Pages website itself lives in `site/`.

| File | What it is | How it was made |
| --- | --- | --- |
| `banner-light.png`, `banner-dark.png` | The README banner for light and dark GitHub themes: a receipt-to-event motif in the website's own brand | Rendered from `source/banner.html` with headless Chromium (1600×600 at 2×, 3200×1200). See `source/README.md` |
| `hero.jpg` | The live website on desktop and phone | Captured from https://mihirkavi.github.io/open-nutrition-transaction/ with headless Chromium on 26 October 2026 and framed |
| `screenshots/privacy.jpg`, `standard.jpg`, `ecosystem.jpg`, `build.jpg` | Four sections of the live website | Same capture method, scrolled to each section |
| `api-terminal.png` | A terminal card of `curl` + `jq` against the local reference server (`npm run demo`) | Real output from the reference server's synthetic grocery example, rendered with headless Chromium |

## Visual identity

The banner follows the live website (`site/styles.css`) so the README and the site read as one brand:

- **Type:** Inter 800 with tight tracking, a Georgia italic accent, JetBrains Mono for event JSON.
- **Colours:** forest green `#123f34`, deep green `#082d26`, leaf `#2f8f67`, lime `#d9f47b`, orange `#f0a63a`, paper `#f7f4ec`, with the site's paper grain.
- **Motif:** the site's synthetic Example Market receipt becoming a valid OpenNutri event, with the mark from `site/assets/mark.svg`.
- Badges use the same hex colours.

Notes for agents and contributors:

- Screenshots must show only the public website or synthetic example data. Never show a real person's purchases, nutrition logs, health data or tokens other than the documented local `demo-token`.
- When the website changes, recapture the images rather than editing them by hand, and update the capture date in the README caption.
