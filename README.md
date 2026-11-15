# GreenSpore Farms

A responsive static website for the proposed GreenSpore Farms mushroom-cultivation pilot near Kanipakam, Andhra Pradesh. The site has separate About, Our Mushrooms, and Business Plan pages, plus the facility plan and project roadmap on the home page.

## Run locally

```bash
npm start
```

This runs `serve` through `npx`; if prompted, allow the one-time temporary download. Open the address shown in the terminal.

## Validate

```bash
npm test
```

## Site pages and assets

- `index.html` — home, facility concept, and roadmap
- `home.html` — compatibility redirect to the home page
- `about.html` — project overview
- `mushrooms.html` — Oyster and Milky crop profiles
- `business-plan.html` — first-harvest and infrastructure estimates
- `assets/greenspore-logo.png` — supplied GreenSpore Farms badge
- `assets/facility-floor-plan.png` — supplied conceptual 20 × 40 ft floor plan

## Deployment

The documents provide planning estimates, not supplier quotations or guaranteed outcomes. The floor plan is conceptual and must not be used as a certified construction drawing. Validate crop assumptions, costs, buyers, local rules, and professional design requirements before investment.

Because this is static HTML/CSS/JS, it can be deployed directly to GitHub Pages, Netlify, or Vercel without a build command. For GitHub Pages, publish from the repository root on the desired branch.
