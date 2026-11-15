# GreenSpore Farms

A responsive website for the proposed GreenSpore Farms mushroom-cultivation pilot near Kanipakam, Andhra Pradesh. Existing pages remain static HTML; the new Infrastructure Plan is built with React and Vite.

## Run locally

```bash
npm start
```

This starts the Vite development server. Open the infrastructure plan at the address shown in the terminal plus `/GreenSpore-FARMS/infrastructure.html`.

## Build

```bash
npm run build
```

The Vite build outputs the React infrastructure page and the existing static pages to `dist/`. GitHub Pages deploys this generated folder from the `main` branch.

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
- `infrastructure.html` — React-powered facility, construction, equipment and BOQ plan
- `assets/greenspore-logo.png` — supplied GreenSpore Farms badge
- `assets/facility-layout-concept.svg` — preliminary 20 × 40 ft area schedule and concept layout

## Deployment

The GitHub Actions workflow runs `npm ci`, `npm test` and `npm run build`, then deploys `dist/` to GitHub Pages when changes are pushed to `main`. Vite is configured for the repository Pages path.

The site remains static after the Vite build; no application server or database is required. Infrastructure costs and technical details are planning assumptions, not supplier quotations or certified construction guidance. Validate the layout and requirements with local professionals before construction or procurement.
