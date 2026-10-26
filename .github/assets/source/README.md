# Banner source

`banner.html` is the editable source of the README banner (`../banner-light.png` and `../banner-dark.png`). One file holds both themes: the dark palette sits under `@media (prefers-color-scheme: dark)`.

Identity: taken from the live website (`site/styles.css`): Inter 800 with tight tracking, a Georgia italic accent and JetBrains Mono for the event JSON; forest green `#123f34`, deep green `#082d26`, leaf `#2f8f67`, lime `#d9f47b`, orange `#f0a63a` and paper `#f7f4ec`, plus the site's paper grain. The motif is the site's own synthetic receipt becoming a valid OpenNutri event. The mark is inlined from `site/assets/mark.svg`.

## Re-render

Use any headless Chromium at a 1600×600 viewport and device scale factor 2 (the published PNGs are 3200×1200). With a small Playwright renderer such as `render-html.mjs` (not included in this repository), run from `.github/assets/`:

```bash
node render-html.mjs source/banner.html banner-light.png --scheme light
node render-html.mjs source/banner.html banner-dark.png --scheme dark
```

Without that script, open the file in Chromium or Playwright, emulate `prefers-color-scheme`, wait for web fonts to load and take a 1600×600 screenshot at 2× scale.

Notes for agents and contributors:

- Fonts load from Google Fonts, so rendering needs network access.
- Keep every label on the banner true to the code. It must not show personal data, real accounts, tokens or invented output.
- View both PNGs after rendering and check for overflow and weak contrast.
