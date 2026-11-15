# GreenSpore Farms — Version 1

A responsive partner-facing landing site for GreenSpore Farms. It is intentionally a lightweight static site with no build dependency.

## Run locally

```bash
npm start
```

This runs `serve` through `npx`; if prompted, allow the one-time temporary download. Open the address shown in the terminal.

## Validate

```bash
npm test
```

## Brand asset

The approved GreenSpore circular badge has not yet been provided in this environment. The current `GS` circle is a temporary placeholder. When available, save it as `assets/greenspore-logo.png` and update the two `.brand-mark` spans in `index.html` to image elements.

## Deployment

Because this is static HTML/CSS/JS, it can be deployed directly to GitHub Pages, Netlify, or Vercel without a build command. For GitHub Pages, publish from the repository root on the desired branch.
