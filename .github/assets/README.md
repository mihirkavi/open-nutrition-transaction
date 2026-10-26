# README assets

Images used by the repository's root `README.md`. The GitHub Pages website itself lives in `site/`.

| File | What it is | How it was made |
| --- | --- | --- |
| `banner-light.png`, `banner-dark.png` | The README banner for light and dark GitHub themes, with the OpenNutri mark from `site/assets/mark.svg` | Rendered from an HTML template with headless Chromium (3200×1200) |
| `hero.jpg` | The live website on desktop and phone | Captured from https://mihirkavi.github.io/open-nutrition-transaction/ with headless Chromium on 26 October 2026 and framed |
| `screenshots/privacy.jpg`, `standard.jpg`, `ecosystem.jpg`, `build.jpg` | Four sections of the live website | Same capture method, scrolled to each section |
| `api-terminal.png` | A terminal card of `curl` + `jq` against the local reference server (`npm run demo`) | Real output from the reference server's synthetic grocery example, rendered with headless Chromium |

Notes for agents and contributors:

- Screenshots must show only the public website or synthetic example data. Never show a real person's purchases, nutrition logs, health data or tokens other than the documented local `demo-token`.
- When the website changes, recapture the images rather than editing them by hand, and update the capture date in the README caption.
